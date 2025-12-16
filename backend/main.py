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
        self.default_version = "svc"

    def load_model(self, version: str, model_path: str, vectorizer_path: str):
        if os.path.exists(model_path) and os.path.exists(vectorizer_path):
            try:
                self.models[version] = joblib.load(model_path)
                self.vectorizers[version] = joblib.load(vectorizer_path)
                print(f"Loaded model version: {version}")
                return True
            except Exception as e:
                print(f"Error loading {version}: {e}")
        else:
             print(f"Artifacts not found for {version} at {model_path}")
        return False

    def get_model(self, version: str = None):
        v = version if version in self.models else self.default_version
        return self.models.get(v), self.vectorizers.get(v)

registry = ModelRegistry()

# Global Stats Container
stats = {
    "total_processed": 0, # Spam processed
    "spam_count": 0,
    "start_time": time.time(),
    "spam_words": Counter(),
    
    # Churn Metrics
    "churn_predictions": 0,
    "churn_detected": 0,
    "retention_predicted": 0
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
    # 1. Load Spam Stats from CSV (if available)
    spam_csv_path = os.path.join(os.path.dirname(__file__), 'spam_detection/artifacts/spam_emails_data.csv')
    if os.path.exists(spam_csv_path):
        try:
            df = pd.read_csv(spam_csv_path)
            # Check for generic label column name (adjust as needed for specific dataset)
            col_names = [c.lower() for c in df.columns]
            label_col = 'Category' if 'Category' in df.columns else ('label' if 'label' in col_names else df.columns[0])
            
            stats["total_processed"] = len(df)
            # Assuming 'spam' and 'ham' values
            # Using basic string contains for robustness
            spam_mask = df[label_col].astype(str).str.lower().str.contains('spam')
            stats["spam_count"] = int(spam_mask.sum())
            stats["ham_count"] = int((~spam_mask).sum())
            
            # Initial top words (limit to last 200 for startup speed)
            spam_text_col = 'Message' if 'Message' in df.columns else ('text' if 'text' in col_names else df.columns[1])
            spam_msgs = df[spam_mask][spam_text_col].tail(200).astype(str)
            
            all_spam_text = " ".join(spam_msgs)
            cleaned = clean_text(all_spam_text)
            stats["spam_words"] = Counter(cleaned.split())
            print(f"Stats loaded: {stats['total_processed']} emails, {stats['spam_count']} spam.")
        except Exception as e:
            print(f"Error loading real spam stats: {e}")
    else:
        print("Spam dataset not found for stats.")

    # 2. Load Churn Stats from CSV (if available)
    churn_csv_path = os.path.join(os.path.dirname(__file__), 'customer_churn_prediction/artifacts/customer_churn_large_dataset.csv')
    if os.path.exists(churn_csv_path):
        try:
            df = pd.read_csv(churn_csv_path)
            if 'Churn' in df.columns:
                stats["churn_predictions"] = len(df)
                stats["churn_detected"] = int(df['Churn'].sum())
                stats["retention_predicted"] = len(df) - stats["churn_detected"]
                print(f"Churn stats loaded: {stats['churn_predictions']} records.")
        except Exception as e:
            print(f"Error loading real churn stats: {e}")
    else:
        print("Churn dataset not found for stats.")

@app.on_event("startup")
async def startup_event():
    # Load spam models
    base_dir = os.path.join(os.path.dirname(__file__), 'spam_detection/artifacts')
    vec_path = os.path.join(base_dir, 'vectorizer.pkl')

    # SVC: Try specific first, then generic
    svc_path = os.path.join(base_dir, 'model_svc.pkl')
    if not os.path.exists(svc_path):
        svc_path = os.path.join(base_dir, 'model.pkl') # Fallback to existing
    
    registry.load_model("svc", svc_path, vec_path)
    
    # NB and RF (Only load if they exist)
    registry.load_model("nb", os.path.join(base_dir, 'model_nb.pkl'), vec_path)
    registry.load_model("rf", os.path.join(base_dir, 'model_rf.pkl'), vec_path)
    
    # Load stats
    load_initial_stats()

    # Load Churn Models
    churn_base_dir = os.path.join(os.path.dirname(__file__), 'customer_churn_prediction/artifacts')
    
    try:
        path = os.path.join(churn_base_dir, 'churn_model_rf.pkl')
        if os.path.exists(path):
            registry.models['churn_rf'] = joblib.load(path)
            registry.vectorizers['churn_rf'] = None
            print("Loaded churn_rf")
        else:
            print("churn_model_rf.pkl not found")
    except Exception as e:
        print(f"Error loading churn_rf: {e}")
        
    try:
        path = os.path.join(churn_base_dir, 'churn_model_lr.pkl')
        if os.path.exists(path):
            registry.models['churn_lr'] = joblib.load(path)
            registry.vectorizers['churn_lr'] = None
            print("Loaded churn_lr")
        else:
            print("churn_model_lr.pkl not found")
    except Exception as e:
        print(f"Error loading churn_lr: {e}")


# --- Pydantic Models ---
class EmailInput(BaseModel):
    text: str
    model_type: str = "svc" # svc, nb, rf

class FeedbackInput(BaseModel):
    text: str
    label: str  # "Spam" or "Ham"

class PredictionOutput(BaseModel):
    is_spam: bool
    confidence: float
    message: str
    model_used: str

class WordCount(BaseModel):
    name: str
    count: int

class StatsOutput(BaseModel):
    total_processed: int
    spam_count: int
    uptime_seconds: float
    top_words: list[WordCount]
    churn_predictions: int
    churn_detected: int
    retention_predicted: int

class ChurnInput(BaseModel):
    Age: int
    Gender: str
    Location: str
    Subscription_Length_Months: int
    Monthly_Bill: float
    Total_Usage_GB: int
    model_type: str = "rf" # rf, lr

class ChurnOutput(BaseModel):
    is_churn: bool
    confidence: float
    model_used: str

# --- Endpoints ---
@app.get("/")
def read_root():
    return {"status": "active", "available_models": list(registry.models.keys())}

@app.get("/stats", response_model=StatsOutput)
def get_stats():
    # Get top 30 most common words (10 for chart, 20 for chips)
    common = stats["spam_words"].most_common(30)
    top_words = [{"name": w, "count": c} for w, c in common]
    
    return {
        "total_processed": stats["total_processed"],
        "spam_count": stats["spam_count"],
        "uptime_seconds": time.time() - stats["start_time"],
        "top_words": top_words,
        "churn_predictions": stats.get("churn_predictions", 0),
        "churn_detected": stats.get("churn_detected", 0),
        "retention_predicted": stats.get("retention_predicted", 0)
    }

@app.post("/predict", response_model=PredictionOutput)
def predict_spam(email: EmailInput):
    model, vectorizer = registry.get_model(email.model_type)
    
    if not model or not vectorizer:
        # Fallback to default if requested one is missing, or error?
        # Let's try default
        model, vectorizer = registry.get_model()
        if not model:
             raise HTTPException(status_code=503, detail=f"Model {email.model_type} not loaded")
    
    # Preprocess
    cleaned_input = clean_text(email.text)
    
    # Vectorize
    vec_input = vectorizer.transform([cleaned_input]).toarray()
    
    # Predict
    prediction = model.predict(vec_input)[0] # 1 for Spam, 0 for Ham
    
    # Get probability if available
    confidence = 0.0
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(vec_input)[0]
        confidence = proba[1] if prediction == 1 else proba[0]
    else:
        # Fallback for models without predict_proba (though CalibratedCV and RF have it)
        confidence = 1.0 
    
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
        "model_used": email.model_type
    }

@app.post("/predict-churn", response_model=ChurnOutput)
def predict_churn(input_data: ChurnInput):
    model_key = f"churn_{input_data.model_type}"
    model = registry.models.get(model_key)
    
    if not model:
        raise HTTPException(status_code=503, detail=f"Churn model {input_data.model_type} not loaded")
    
    # Create DataFrame from input
    data = pd.DataFrame([{
        'Age': input_data.Age,
        'Gender': input_data.Gender,
        'Location': input_data.Location,
        'Subscription_Length_Months': input_data.Subscription_Length_Months,
        'Monthly_Bill': input_data.Monthly_Bill,
        'Total_Usage_GB': input_data.Total_Usage_GB
    }])
    
    # Predict (Pipeline handles preprocessing)
    prediction = model.predict(data)[0]
    proba = model.predict_proba(data)[0]
    
    confidence = proba[1] if prediction == 1 else proba[0]
    
    return {
        "is_churn": bool(prediction == 1),
        "confidence": float(confidence * 100),
        "model_used": input_data.model_type
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
