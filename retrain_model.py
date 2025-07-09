import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle

# Sample dummy data (replace this with your actual dataset if available)
data = pd.DataFrame({
    'bp': [120, 140, 130, 110, 160, 100],
    'swelling': [0, 1, 1, 0, 1, 0],
    'headache': [0, 1, 1, 0, 1, 0],
    'age': [25, 30, 28, 22, 35, 20],
    'weight': [55, 80, 70, 50, 90, 45],
    'heart_rate': [80, 95, 90, 75, 100, 70],
    'risk': [0, 1, 1, 0, 1, 0]  # target column
})

# Define features and labels
X = data[['bp', 'swelling', 'headache', 'age', 'weight', 'heart_rate']]
y = data['risk']

# Train model
model = RandomForestClassifier()
model.fit(X, y)

# Save the model to 'model.pkl'
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Model trained and saved successfully as model.pkl")
