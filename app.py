from flask import Flask, render_template, request
import joblib

app = Flask(__name__)
model = joblib.load("hdp_risk_model.pkl")

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        systolic = int(request.form['systolic'])
        diastolic = int(request.form['diastolic'])
        hrv = float(request.form['hrv'])
        headache = 1 if request.form.get('headache') == 'on' else 0
        swelling = 1 if request.form.get('swelling') == 'on' else 0
        blurred = 1 if request.form.get('blurred_vision') == 'on' else 0

        input_data = [[systolic, diastolic, hrv, headache, swelling, blurred]]
        prediction = model.predict(input_data)[0]

        risk_map = {0: "Low", 1: "Moderate", 2: "High"}
        return render_template("index.html", result=risk_map[prediction])

    except Exception as e:
        return render_template("index.html", result=f"Error: {e}")

if __name__ == '__main__':
    print("🚀 Flask app is starting...")
    app.run(debug=True)
