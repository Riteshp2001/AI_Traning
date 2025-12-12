import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
import string
import nltk
from nltk.corpus import stopwords

# Ensure stopwords are downloaded
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

def clean_text(text):
    nopunc = [char for char in text if char not in string.punctuation]
    nopunc = ''.join(nopunc)
    return " ".join([word.lower() for word in nopunc.split() if word.lower() not in stopwords.words('english')])

print("Loading data...")
# Load data
df = pd.read_csv(os.path.join(os.path.dirname(__file__), 'artifacts/spam_emails_data.csv'))
df = df.sample(frac=1, random_state=42).reset_index(drop=True) # Shuffle data
df = df.head(5000) # Machine Processing Power Limitation Cant do any thing :(
df.drop_duplicates(inplace=True)

# Clean Text
# print("Cleaning text (this may take a while)...")
# df['clean_text'] = df['text'].apply(clean_text)

# Vectorization
print("Vectorizing...")
tfidf = TfidfVectorizer(max_features=3000)
# X = tfidf.fit_transform(df['clean_text']).toarray()
X = tfidf.fit_transform(df['text']).toarray()
y = df['label'].map({'Spam': 1, 'Ham': 0})

# Train Model (Using SVM as it had better results in notebook)
print("Training SVM Model...")
model = SVC(probability=True, kernel='linear')
model.fit(X, y)

# Save Artifacts
print("Saving artifacts...")
artifacts_dir = os.path.join(os.path.dirname(__file__), 'artifacts')
os.makedirs(artifacts_dir, exist_ok=True)
joblib.dump(model, os.path.join(artifacts_dir, 'model.pkl'))
joblib.dump(tfidf, os.path.join(artifacts_dir, 'vectorizer.pkl'))

print(f"Done! Model and Vectorizer saved to {artifacts_dir}")
