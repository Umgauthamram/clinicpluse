import json
import random

# 1. Setup Parameters
symptoms = ['swelling', 'fatigue', 'fever', 'nausea', 'shortness of breath', 'vomiting', 'pain', 'inflammation']
months = ['January', 'February', 'March', 'April']
entries_per_symptom = 40 

data = {}

# Initialize structure: { "Symptom": { "Month": 0, ... }, ... }
for symptom in symptoms:
    data[symptom] = {month: 0 for month in months}

# 2. Distribute entries with random logic
for symptom in symptoms:
    remaining = entries_per_symptom
    for i, month in enumerate(months[:-1]):
        count = random.randint(5, int(entries_per_symptom / 2))
        data[symptom][month] = count
        remaining -= count
    data[symptom][months[-1]] = max(0, remaining)

# 3. Write to JSON
output_path = "public/clinic_insights.json"
with open(output_path, 'w') as f:
    json.dump(data, f)

print(f"Success: Synthetic dataset generated with {len(symptoms) * entries_per_symptom} entries.")
print(f"Data exported to {output_path}")
