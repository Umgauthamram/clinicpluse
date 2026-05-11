import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, classification_report
import warnings
warnings.filterwarnings('ignore')

def main():
    print("="*50)
    print("WEEK 1: PROBLEM & DATA PREPARATION")
    print("="*50)
    # 1. Define problem: Classification
    # 2. Identify features (Symptoms) and target variable (Prognosis)
    # 3. Load dataset and inspect
    df = pd.read_csv('public/archive/training_data.csv')
    
    # Handle the trailing comma artifact if present
    if 'Unnamed: 133' in df.columns:
        df = df.drop(columns=['Unnamed: 133'])
        
    X = df.drop(columns=['prognosis'])
    y = df['prognosis']
    
    print(f"Dataset Loaded. Shape: {df.shape}")
    print(f"Features: {X.shape[1]} Symptoms")
    print(f"Target Classes: {len(y.unique())} Diseases\n")
    
    # 4. Split data into train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"Data Split: {len(X_train)} training samples, {len(X_test)} testing samples\n")
    
    
    print("="*50)
    print("WEEK 2: FEATURE ENGINEERING & BASELINE MODELS")
    print("="*50)
    # 1. Missing values & preprocessing: Dataset is already cleanly encoded (0/1).
    # 2. Scaling: Not required for binary boolean arrays.
    
    # 3. Train baseline model (Logistic Regression)
    print("Training Baseline Model: Logistic Regression...")
    baseline_model = LogisticRegression(max_iter=1000)
    baseline_model.fit(X_train, y_train)
    
    # 4. Evaluate baseline model
    base_preds = baseline_model.predict(X_test)
    base_acc = accuracy_score(y_test, base_preds)
    print(f"Baseline Accuracy: {base_acc:.4f}\n")
    
    
    print("="*50)
    print("WEEK 3: ADVANCED MODELS & OPTIMIZATION")
    print("="*50)
    # 1. Train KNN, Decision Tree models
    # 2. Perform hyperparameter tuning (GridSearchCV)
    print("Performing Hyperparameter Tuning for Decision Tree...")
    dt_params = {
        'criterion': ['gini', 'entropy'],
        'max_depth': [None, 10, 20, 30],
        'min_samples_split': [2, 5, 10]
    }
    dt_grid = GridSearchCV(DecisionTreeClassifier(random_state=42), dt_params, cv=5, n_jobs=-1)
    dt_grid.fit(X_train, y_train)
    
    print("Performing Hyperparameter Tuning for KNN...")
    knn_params = {
        'n_neighbors': [3, 5, 7],
        'weights': ['uniform', 'distance']
    }
    knn_grid = GridSearchCV(KNeighborsClassifier(), knn_params, cv=5, n_jobs=-1)
    knn_grid.fit(X_train, y_train)
    
    # 3. Compare models
    dt_best = dt_grid.best_estimator_
    knn_best = knn_grid.best_estimator_
    
    dt_preds = dt_best.predict(X_test)
    knn_preds = knn_best.predict(X_test)
    
    dt_acc = accuracy_score(y_test, dt_preds)
    knn_acc = accuracy_score(y_test, knn_preds)
    
    print(f"Decision Tree Best Params: {dt_grid.best_params_} | Accuracy: {dt_acc:.4f}")
    print(f"KNN Best Params: {knn_grid.best_params_} | Accuracy: {knn_acc:.4f}\n")
    
    # 4. Select best model
    models = {
        "Logistic Regression": (baseline_model, base_acc),
        "Decision Tree": (dt_best, dt_acc),
        "KNN": (knn_best, knn_acc)
    }
    
    best_model_name = max(models, key=lambda k: models[k][1])
    best_model = models[best_model_name][0]
    
    print(f"Selected Best Model: {best_model_name}")
    
    # Evaluate final model with full metrics
    final_preds = best_model.predict(X_test)
    print("\nFinal Evaluation Metrics:")
    print(f"Accuracy:  {accuracy_score(y_test, final_preds):.4f}")
    print(f"Precision: {precision_score(y_test, final_preds, average='weighted'):.4f}")
    print(f"Recall:    {recall_score(y_test, final_preds, average='weighted'):.4f}")
    
    
    print("\n" + "="*50)
    print("WEEK 4: DEPLOYMENT & FINAL OUTPUT")
    print("="*50)
    # 1. Save model using pickle
    model_filename = 'public/model.pkl'
    with open(model_filename, 'wb') as file:
        pickle.dump({
            'model': best_model,
            'features': list(X.columns)
        }, file)
    print(f"Model and features saved successfully to '{model_filename}'")
    print("Pipeline Complete! Ready for Streamlit Deployment.")

if __name__ == "__main__":
    main()
