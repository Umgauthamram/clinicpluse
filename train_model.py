import pandas as pd
import json
import os

def train_naive_bayes():
    print("Loading training data...")
    csv_path = 'public/archive/training_data.csv'
    
    if not os.path.exists(csv_path):
        print(f"Error: Could not find {csv_path}")
        return

    df = pd.read_csv(csv_path)
    
    # The last column is 'prognosis', but there might be an empty trailing column due to trailing commas in CSV
    # Let's clean up columns
    if 'Unnamed: 133' in df.columns:
        df = df.drop(columns=['Unnamed: 133'])
        
    symptoms = [col for col in df.columns if col != 'prognosis']
    diseases = df['prognosis'].unique()
    
    total_records = len(df)
    
    print(f"Found {len(symptoms)} symptoms and {len(diseases)} diseases.")
    
    # We will build a model dictionary
    # model = {
    #   "symptoms": ["fever", "cough", ...],
    #   "diseases": ["Allergy", "GERD", ...],
    #   "priors": { "Allergy": 0.05, ... },
    #   "likelihoods": {
    #       "Allergy": { "fever": 0.01, "cough": 0.99, ... },
    #       ...
    #   }
    # }
    
    model = {
        "symptoms": symptoms,
        "diseases": diseases.tolist(),
        "priors": {},
        "likelihoods": {}
    }
    
    for disease in diseases:
        disease_df = df[df['prognosis'] == disease]
        disease_count = len(disease_df)
        
        # Prior probability P(Disease)
        model["priors"][disease] = disease_count / total_records
        
        # Likelihoods P(Symptom | Disease) with Laplace smoothing (alpha=1)
        model["likelihoods"][disease] = {}
        
        for symptom in symptoms:
            symptom_count = disease_df[symptom].sum()
            # Laplace smoothing: (count + 1) / (total_in_class + 2)
            prob = (symptom_count + 1) / (disease_count + 2)
            model["likelihoods"][disease][symptom] = prob

    output_path = 'public/model_weights.json'
    with open(output_path, 'w') as f:
        json.dump(model, f, indent=2)
        
    print(f"Model trained successfully! Weights exported to {output_path}")

if __name__ == "__main__":
    train_naive_bayes()
