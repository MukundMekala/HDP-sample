import random
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

def generate_patient():
    return [
        random.randint(110, 160), random.randint(70, 110),
        round(random.uniform(20, 70), 2),
        random.randint(0, 1), random.randint(0, 1), random.randint(0, 1)
    ]

data = [generate_patient() for _ in range(1000)]
columns = ['systolic', 'diastolic', 'hrv', 'headache', 'swelling', 'blurred_vision']
df = pd.DataFrame(data, columns=columns)

def assign_risk(row):
    score = 0
    if row['systolic'] > 140 or row['diastolic'] > 90: score += 1
    if row['hrv'] < 30: score += 1
    if row['headache'] + row['swelling'] + row['blurred_vision'] >= 2: score += 1
    return min(score, 2)

df['risk'] = df.apply(assign_risk, axis=1)

X = df.drop('risk', axis=1)
y = df['risk']
model = RandomForestClassifier().fit(X, y)

print("Saving model to disk...")
joblib.dump(model, 'hdp_risk_model.pkl')
print("✅ Model saved.")
