import json
import random
from datetime import datetime

# Dynamically generate months from January up to the current month
all_months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
current_month_index = datetime.now().month  # 1-indexed
months = all_months[:current_month_index]

# Symptoms tracked by the clinic
symptoms = ['swelling', 'fatigue', 'fever', 'nausea', 'shortness of breath', 'vomiting', 'pain', 'inflammation']

# Seasonal weight profiles — simulates real-world clinical patterns
# Higher weights = more cases expected that month (e.g., fever peaks in winter/monsoon)
seasonal_weights = {
    'fever':                [0.22, 0.18, 0.12, 0.08, 0.10, 0.06, 0.04, 0.05, 0.08, 0.10, 0.14, 0.20],
    'fatigue':              [0.10, 0.10, 0.08, 0.07, 0.09, 0.10, 0.12, 0.12, 0.10, 0.08, 0.08, 0.09],
    'nausea':               [0.08, 0.09, 0.10, 0.12, 0.11, 0.10, 0.09, 0.08, 0.07, 0.08, 0.09, 0.08],
    'vomiting':             [0.07, 0.08, 0.10, 0.13, 0.12, 0.11, 0.10, 0.08, 0.06, 0.07, 0.08, 0.07],
    'pain':                 [0.09, 0.09, 0.08, 0.08, 0.09, 0.10, 0.11, 0.10, 0.09, 0.08, 0.08, 0.09],
    'swelling':             [0.08, 0.07, 0.09, 0.10, 0.12, 0.13, 0.12, 0.10, 0.08, 0.07, 0.07, 0.08],
    'inflammation':         [0.10, 0.09, 0.08, 0.08, 0.10, 0.11, 0.12, 0.11, 0.09, 0.08, 0.08, 0.09],
    'shortness of breath':  [0.15, 0.14, 0.10, 0.07, 0.08, 0.06, 0.05, 0.06, 0.08, 0.10, 0.13, 0.16],
}

# Realistic annual patient volume per symptom (range for a mid-size clinic)
annual_volume = {
    'fever':                random.randint(2800, 3600),
    'fatigue':              random.randint(2200, 3000),
    'nausea':               random.randint(1800, 2400),
    'vomiting':             random.randint(1400, 2000),
    'pain':                 random.randint(3000, 4200),
    'swelling':             random.randint(1600, 2200),
    'inflammation':         random.randint(1800, 2600),
    'shortness of breath':  random.randint(1200, 1800),
}

data = {}

for symptom in symptoms:
    data[symptom] = {}
    total_annual = annual_volume[symptom]
    weights = seasonal_weights[symptom]

    for i, month in enumerate(months):
        # Base count from seasonal weight
        base = int(total_annual * weights[i])
        # Add realistic noise (±15%)
        noise = random.randint(-int(base * 0.15), int(base * 0.15))
        count = max(10, base + noise)
        data[symptom][month] = count

# Write to JSON
output_path = "public/clinic_insight.json"
with open(output_path, 'w') as f:
    json.dump(data, f)

# Print summary
total = sum(data[s][m] for s in data for m in data[s])
print(f"Success: Realistic clinical dataset generated for {len(months)} months ({months[0]} - {months[-1]}).")
print(f"Symptoms tracked: {len(symptoms)}")
print(f"Total patient encounters: {total:,}")
print(f"Data exported to {output_path}")
print()
for s in symptoms:
    sym_total = sum(data[s][m] for m in data[s])
    print(f"  {s}: {sym_total:,} cases")
