import json
import random

# 1. Setup Parameters
symptoms = ['Body Ache', 'Cough', 'Fatigue', 'Fever', 'Itchy Eyes', 'Runny Nose', 'Sneezing']
months = ['January', 'February', 'March']
entries_per_symptom = 30 # 30 Entries for EACH symptom

data = {}

# Initialize structure: { "Symptom": { "Month": 0, ... }, ... }
for symptom in symptoms:
    data[symptom] = {month: 0 for month in months}

# 2. Distribute 30 entries per symptom across months with "Medical logic"
for symptom in symptoms:
    remaining_entries = entries_per_symptom
    
    # Logic to create patterns:
    # 1. Fever/Cough spike in January
    # 2. Itchy Eyes/Sneezing spike in February
    # 3. Random distribution for the rest
    
    if symptom in ['Fever', 'Cough', 'Body Ache']:
        # Higher density in January
        jan_count = random.randint(15, 20)
        feb_count = random.randint(5, 7)
        mar_count = entries_per_symptom - jan_count - feb_count
        data[symptom]['January'] = jan_count
        data[symptom]['February'] = feb_count
        data[symptom]['March'] = max(0, mar_count)
    elif symptom in ['Itchy Eyes', 'Sneezing']:
        # Higher density in February
        jan_count = random.randint(0, 3)
        feb_count = random.randint(18, 22)
        mar_count = entries_per_symptom - jan_count - feb_count
        data[symptom]['January'] = jan_count
        data[symptom]['February'] = feb_count
        data[symptom]['March'] = max(0, mar_count)
    else:
        # Uniform viral distribution (Fatigue/Runny Nose)
        jan_count = random.randint(8, 12)
        feb_count = random.randint(8, 12)
        mar_count = entries_per_symptom - jan_count - feb_count
        data[symptom]['January'] = jan_count
        data[symptom]['February'] = feb_count
        data[symptom]['March'] = max(0, mar_count)

# 3. Correct slight rounding errors to ensure EXACTLY 30 per symptom
for symptom in symptoms:
    current_total = sum(data[symptom].values())
    if current_total != 30:
        diff = 30 - current_total
        data[symptom]['March'] += diff

# 4. Write to JSON
output_path = "public/clinic_insights.json"
with open(output_path, 'w') as f:
    json.dump(data, f)

print(f"Success: Synthetic dataset generated with 210 entries.")
print(f"Each symptom has exactly 30 entries (7 symptoms x 30 = 210 total records).")
print(f"Data exported to {output_path}")
