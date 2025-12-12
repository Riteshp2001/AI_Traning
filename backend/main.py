from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from collections import Counter
import joblib
import os
import string
import nltk
from nltk.corpus import stopwords
from fastapi.middleware.cors import CORSMiddleware
import time
import pandas as pd
import csv

# --- Setup & Initialization ---
app = FastAPI(title="Spam Detection API")

# CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global Registry ---
class ModelRegistry:
    def __init__(self):
        self.models = {}
        self.vectorizers = {}
        self.default_version = "v1"

    def load_model(self, version: str, model_path: str, vectorizer_path: str):
        if os.path.exists(model_path) and os.path.exists(vectorizer_path):
            try:
                self.models[version] = joblib.load(model_path)
                self.vectorizers[version] = joblib.load(vectorizer_path)
                print(f"Loaded model version: {version}")
                return True
            except Exception as e:
                print(f"Error loading {version}: {e}")
        return False

    def get_model(self, version: str = None):
        v = version or self.default_version
        return self.models.get(v), self.vectorizers.get(v)

registry = ModelRegistry()

# Global Stats Container
stats = {
    "total_processed": 0,
    "spam_count": 0,
    "start_time": time.time(),
    "spam_words": Counter()
}

# --- Helper Functions ---
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

def clean_text(text):
    if not isinstance(text, str):
        return ""
    nopunc = [char for char in text if char not in string.punctuation]
    nopunc = ''.join(nopunc)
    return " ".join([word.lower() for word in nopunc.split() if word.lower() not in stopwords.words('english')])

def load_initial_stats():
    csv_path = os.path.join(os.path.dirname(__file__), 'spam_detection/artifacts/spam_emails_data.csv')
    if not os.path.exists(csv_path):
        print("No CSV found for stats initialization.")
        return

    try:
        # Read CSV efficiently
        df = pd.read_csv(csv_path)
        
        stats["total_processed"] = len(df)
        stats["spam_count"] = len(df[df['label'] == 'Spam'])
        
        # Calculate top words from the *last 100* spam emails to allow fast startup
        spam_df = df[df['label'] == 'Spam'].tail(100)
        
        all_words = []
        for text in spam_df['text']:
            cleaned = clean_text(text)
            all_words.extend(cleaned.split())
            
        stats["spam_words"].update(all_words)
        print(f"Stats loaded: {stats['total_processed']} emails, {stats['spam_count']} spam.")
        
    except Exception as e:
        print(f"Error loading stats from CSV: {e}")

@app.on_event("startup")
async def startup_event():
    # Load default model
    base_dir = os.path.join(os.path.dirname(__file__), 'spam_detection/artifacts')
    registry.load_model("v1", 
                       os.path.join(base_dir, 'model.pkl'), 
                       os.path.join(base_dir, 'vectorizer.pkl'))
    
    # Load stats
    load_initial_stats()

# --- Pydantic Models ---
class EmailInput(BaseModel):
    text: str
    model_version: str = "v1"

class FeedbackInput(BaseModel):
    text: str
    label: str  # "Spam" or "Ham"

class PredictionOutput(BaseModel):
    is_spam: bool
    confidence: float
    message: str
    model_version: str

class WordCount(BaseModel):
    name: str
    count: int

class StatsOutput(BaseModel):
    total_processed: int
    spam_count: int
    uptime_seconds: float
    top_words: list[WordCount]

# --- Endpoints ---
@app.get("/")
def read_root():
    model, _ = registry.get_model()
    return {"status": "active", "model_loaded": model is not None, "available_models": list(registry.models.keys())}

@app.get("/stats", response_model=StatsOutput)
def get_stats():
    # Get top 30 most common words (10 for chart, 20 for chips)
    common = stats["spam_words"].most_common(30)
    top_words = [{"name": w, "count": c} for w, c in common]
    
    return {
        "total_processed": stats["total_processed"],
        "spam_count": stats["spam_count"],
        "uptime_seconds": time.time() - stats["start_time"],
        "top_words": top_words
    }

@app.post("/predict", response_model=PredictionOutput)
def predict_spam(email: EmailInput):
    model, vectorizer = registry.get_model(email.model_version)
    
    if not model or not vectorizer:
        raise HTTPException(status_code=503, detail=f"Model version {email.model_version} not loaded")
    
    # Preprocess
    cleaned_input = clean_text(email.text)
    
    # Vectorize
    vec_input = vectorizer.transform([cleaned_input]).toarray()
    
    # Predict
    prediction = model.predict(vec_input)[0] # 1 for Spam, 0 for Ham
    proba = model.predict_proba(vec_input)[0]
    
    confidence = proba[1] if prediction == 1 else proba[0]
    
    # Update stats
    stats["total_processed"] += 1
    if prediction == 1:
        stats["spam_count"] += 1
        # Update top words for spam
        words = cleaned_input.split()
        stats["spam_words"].update(words)
        
    return {
        "is_spam": bool(prediction == 1),
        "confidence": float(confidence * 100),
        "message": "Spam detected" if prediction == 1 else "Likely Ham",
        "model_version": email.model_version
    }

@app.post("/feedback")
def submit_feedback(feedback: FeedbackInput):
    # Append to CSV
    csv_path = os.path.join(os.path.dirname(__file__), 'spam_detection/artifacts/spam_emails_data.csv')
    
    file_exists = os.path.exists(csv_path)
    
    try:
        with open(csv_path, mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            # Assuming CSV format is: text,label
            if not file_exists:
               writer.writerow(["text", "label"]) 
            
            # Simple sanitization to prevent CSV injection if needed, but csv.writer handles quotes
            writer.writerow([feedback.text, feedback.label])
            
        return {"status": "success", "message": "Feedback recorded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save feedback: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
