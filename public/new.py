import pandas as pd
from google.colab import files

# 1. Your JSON Data here
json_data = {
    "Body Ache": {"February": 1, "January": 2, "March": 1},
    "Cough": {"February": 2, "January": 5, "March": 2},
    "Fatigue": {"February": 1, "January": 2, "March": 1},
    "Fever": {"February": 2, "January": 9, "March": 5},
    "Itchy Eyes": {"February": 7, "January": 0, "March": 0},
    "Runny Nose": {"February": 0, "January": 2, "March": 1},
    "Sneezing": {"February": 7, "January": 0, "March": 0}
}

# 2. Create DataFrame
# We transpose it (.T) so Symptoms are rows and Months are columns
df = pd.DataFrame(json_data).T

# 3. Ensure columns are in the correct order
df = df[['January', 'February', 'March']]

# 4. Export to Excel
file_name = "clinic_disease_patterns.xlsx"
df.to_excel(file_name)

# 5. Download the file
files.download(file_name)

print(f"✅ Excel file '{file_name}' created and download started!")
