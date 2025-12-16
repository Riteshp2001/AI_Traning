import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

def train_churn_models():
    try:
        print("Loading Churn Data...")
        csv_path = os.path.join(os.path.dirname(__file__), 'artifacts/customer_churn_large_dataset.csv')
        df = pd.read_csv(csv_path)

        # Drop irrelevant columns
        df = df.drop(columns=['CustomerID', 'Name'])

        # Define features and target
        X = df.drop('Churn', axis=1)
        y = df['Churn']

        # Preprocessing
        numeric_features = ['Age', 'Subscription_Length_Months', 'Monthly_Bill', 'Total_Usage_GB']
        categorical_features = ['Gender', 'Location']

        # Define preprocessing pipeline
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features),
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
            ])

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        artifacts_dir = os.path.join(os.path.dirname(__file__), 'artifacts')
        os.makedirs(artifacts_dir, exist_ok=True)

        # 1. Random Forest Pipeline
        print("Training Random Forest...")
        rf_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                      ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1))])
        
        rf_pipeline.fit(X_train, y_train)
        rf_pred = rf_pipeline.predict(X_test)
        print(f"Random Forest Accuracy: {accuracy_score(y_test, rf_pred)}")
        
        joblib.dump(rf_pipeline, os.path.join(artifacts_dir, 'churn_model_rf.pkl'))

        # 2. Logistic Regression Pipeline
        print("Training Logistic Regression...")
        lr_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                      ('classifier', LogisticRegression(random_state=42, max_iter=1000))])
        
        lr_pipeline.fit(X_train, y_train)
        lr_pred = lr_pipeline.predict(X_test)
        print(f"Logistic Regression Accuracy: {accuracy_score(y_test, lr_pred)}")
        
        joblib.dump(lr_pipeline, os.path.join(artifacts_dir, 'churn_model_lr.pkl'))

        print(f"Churn Models saved to {artifacts_dir}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    train_churn_models()
