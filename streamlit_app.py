import streamlit as st
import pickle
import pandas as pd
import numpy as np

# Load the model and features
@st.cache_resource
def load_model():
    try:
        with open('public/model.pkl', 'rb') as file:
            data = pickle.load(file)
            return data['model'], data['features']
    except FileNotFoundError:
        return None, None

def main():
    st.set_page_config(page_title="Disease Predictor", page_icon="🏥", layout="wide")
    
    st.title("🏥 Clinical Disease Predictor (ML Sprint)")
    st.markdown("This Streamlit application satisfies the Week 4 deployment requirement. It loads the pickled machine learning model and allows users to input symptoms for real-time predictions.")
    
    model, features = load_model()
    
    if model is None:
        st.error("Model file 'model.pkl' not found. Please run 'python model_pipeline.py' first to generate the model.")
        return
        
    st.sidebar.header("Patient Symptoms")
    st.sidebar.markdown("Select all symptoms that apply:")
    
    # Create checkboxes for all features
    user_inputs = {}
    for feature in features:
        # Format feature name for readability (e.g., 'skin_rash' -> 'Skin Rash')
        display_name = feature.replace('_', ' ').title()
        user_inputs[feature] = st.sidebar.checkbox(display_name)
        
    st.subheader("Diagnostic Prediction")
    
    if st.button("Predict Disease", type="primary"):
        # Convert user inputs to a dataframe matching the model's expected format
        input_data = pd.DataFrame([user_inputs])
        # Convert boolean True/False to 1/0
        input_data = input_data.astype(int)
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        
        # Calculate probabilities if the model supports it
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(input_data)[0]
            # Get top 3
            top_indices = np.argsort(probabilities)[-3:][::-1]
            
            st.success(f"### Top Prediction: **{prediction}**")
            
            st.markdown("#### Confidence Levels:")
            for idx in top_indices:
                disease_name = model.classes_[idx]
                prob = probabilities[idx] * 100
                st.progress(probabilities[idx], text=f"{disease_name} ({prob:.1f}%)")
        else:
            st.success(f"### Predicted Disease: **{prediction}**")

if __name__ == "__main__":
    main()
