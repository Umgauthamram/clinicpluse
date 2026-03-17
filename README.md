# Medikly: Health Analytics Dashboard

## 📋 Project Overview
**Problem Statement**: Small community clinics lack tools to understand disease patterns such as seasonal outbreaks or common symptoms. Medikly provides a data-driven platform to identify trends, correlate symptoms with diseases, and provide automated treatment protocols to support early diagnosis and treatment planning.

This project analyzes clinical data to identify seasonal trends (e.g., Flu season vs. Allergy peaks) and converts raw data into actionable medical insights.

---

## 🛠️ Data Methodology
### 1. Data Cleaning & Preparation
- **Inconsistent Formats**: Standardized symptom names and location fields.
- **Missing Values**: Handled using logical imputation.
- **Normalization**: Grouped data by symptoms and months for temporal analysis.

### 2. Dataset Specification
- **Primary Source**: `public/clinic_insight.json`
- **Features**: Date, Symptom, Location, Count/Month.
- **Synthetic Base**: The dataset simulates comprehensive clinic records across multiple months (Full Year 2026).

---

## 📊 Insights & Analysis
The platform automatically detects:
1. **Seasonal Spikes**: Identifies when a specific symptom exceeds baseline frequency.
2. **Correlation Patterns**: Links related symptoms (e.g., Sneezing + Itchy Eyes) to probable conditions like Allergic Rhinitis.
3. **Forecasting**: Extrapolates current trends to predict upcoming clinic volume.

---

## 📤 Live Data Integration
Medikly features a robust **Data Upload System** that allows medical staff to update the platform with new findings:
- **Automatic Merging**: Uploaded JSON files are automatically saved to the system database.
- **Security**: Includes a multi-step confirmation process with data preview to ensure accuracy before merging.
- **Real-time Updates**: Once confirmed, all dashboard metrics, AI insights, and reports update instantly without manual processing.

---

## 🚀 Technical Stack
- **Frontend**: Next.js (React Framework)
- **Styling**: Vanilla CSS with modern aesthetics.
- **Visualizations**: Recharts for dynamic medical trending.
- **Intelligence**: Rule-based AI Diagnosis Engine.
- **Backend API**: Next.js Route Handlers for file-system data management.

---

## 📂 Project Structure
- `public/clinic_insight.json`: Live data source for the analytics engine.
- `app/api/upload/route.js`: Server-side logic for automatic data updates.
- `app/insights/page.js`: AI-driven diagnosis and prediction module.
- `app/trends/page.js`: Heatmaps and seasonal spike detection.
- `app/upload/page.js`: User-facing data management portal.
