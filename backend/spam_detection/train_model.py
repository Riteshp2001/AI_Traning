import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.naive_bayes import MultinomialNB
import string
import nltk
from nltk.corpus import stopwords
from joblib import Parallel, delayed

# Ensure stopwords are downloaded
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Define stopwords set globally for efficiency
STOPWORDS = set(stopwords.words('english'))

def clean_text(text):
    # Optimizing punctuation removal using translate
    nopunc = text.translate(str.maketrans('', '', string.punctuation))
    # Optimizing stopword removal using set lookup
    return " ".join([word.lower() for word in nopunc.split() if word.lower() not in STOPWORDS])

try:
    print("Loading data...")
    # Load data
    df = pd.read_csv(os.path.join(os.path.dirname(__file__), 'artifacts/spam_emails_data.csv'))
    df = df.sample(frac=1, random_state=42).reset_index(drop=True) # Shuffle data
    # df = df.head(5000) # Machine Processing Power Limitation Cant do any thing :(
    df.drop_duplicates(inplace=True)
    df.dropna(subset=['text'], inplace=True) # Remove missing text values

    # Clean Text
    print("Cleaning text (using parallel processing)...")
    # Using joblib to parallelize the apply function
    df['clean_text'] = Parallel(n_jobs=-1)(delayed(clean_text)(text) for text in df['text'])
    
    # Vectorization
    print("Vectorizing...")
    tfidf = TfidfVectorizer(max_features=3000)
    X = tfidf.fit_transform(df['clean_text']).toarray()
    y = df['label'].map({'Spam': 1, 'Ham': 0})

    # Train Model (Using LinearSVC for speed, wrapped for probabilities)
    print("Training Model (LinearSVC)...")
    # LinearSVC is much faster than SVC(kernel='linear') for large datasets
    linear_svc = LinearSVC(dual=False) # dual=False is preferred when n_samples > n_features
    model = CalibratedClassifierCV(linear_svc) 
    model.fit(X, y)

    # Save Artifacts
    print("Saving artifacts...")
    artifacts_dir = os.path.join(os.path.dirname(__file__), 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    joblib.dump(model, os.path.join(artifacts_dir, 'model.pkl'))
    joblib.dump(tfidf, os.path.join(artifacts_dir, 'vectorizer.pkl'))

    print(f"Done! Model and Vectorizer saved to {artifacts_dir}")

except Exception as e:
    print(f"An error occurred: {e}")
