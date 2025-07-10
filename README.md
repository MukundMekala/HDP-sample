# HyHTech - HDP Risk Assessment System

A comprehensive web application for monitoring Hypertensive Disorders of Pregnancy (HDP) using AI-powered risk prediction.

## Features

- **Patient Dashboard**: Track daily vitals, view health trends, and get AI risk assessments
- **Doctor Dashboard**: Monitor multiple patients, view risk alerts, and analyze patient data
- **AI Risk Prediction**: Machine learning model trained to predict HDP risk based on vital signs
- **Real-time Charts**: Interactive visualizations of health trends over time
- **Secure Authentication**: Role-based access for patients and doctors

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Chart.js for data visualization
- Vite for development and building

### Backend
- FastAPI for the ML prediction API
- Python with scikit-learn for machine learning
- Supabase for database and authentication

### Database
- PostgreSQL (via Supabase)
- Row Level Security (RLS) for data protection

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Supabase account (optional for demo)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials (optional for demo)
```

3. Start the development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the API server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## Demo Mode

The application includes a demo mode that works without a Supabase connection:

- Mock authentication system
- Sample patient and doctor data
- Simulated ML predictions
- All features functional for testing

## Model Training

The included `retrain_model.py` script shows how to train the HDP risk prediction model:

```bash
python retrain_model.py
```

This creates a `model.pkl` file that the backend API uses for predictions.

## API Endpoints

- `GET /` - API status and information
- `GET /health` - Health check endpoint
- `POST /predict` - HDP risk prediction

### Prediction Input Format
```json
{
  "bp": 140,
  "swelling": 1,
  "headache": 1,
  "age": 28,
  "weight": 70.5,
  "heart_rate": 85
}
```

## Database Schema

### Tables
- `profiles` - User profiles (patients and doctors)
- `vitals` - Patient vital signs and symptoms
- `risk_predictions` - AI-generated risk assessments
- `alerts` - Doctor-patient communication

## Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Render)
The backend includes a Dockerfile for easy deployment to container platforms.

## Security Features

- Row Level Security (RLS) on all database tables
- Role-based access control
- Secure authentication with Supabase
- CORS protection on API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue on GitHub.