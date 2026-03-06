# 🎬 Movie Recommendation System

A modern, responsive movie recommendation platform built with **React** and **FastAPI**. The system uses a content-based filtering algorithm (TF-IDF) to suggest similar movies based on metadata like genres, keywords, cast, and crew.

![React](https://img.shields.io/badge/React-18%2B-blue)
![Vite](https://img.shields.io/badge/Vite-4%2B-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0%2B-cyan)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)

## 🚀 Live Demo

- **Frontend Application**: https://movies-recommendation-system-sigma.vercel.app/
- **Backend API (Docs)**: [https://movies-recommendation-system-bq0k.onrender.com/docs](https://movies-recommendation-system-bq0k.onrender.com/docs)

> **⚠️ Important Note:** The backend is hosted on Render's free tier. The server spins down after periods of inactivity. Please allow approximately **1 minute** for the backend to wake up upon your first request. Subsequent requests will be fast.

## ✨ Features

- **Personalized Recommendations**: Get movie suggestions based on content similarity using Cosine Similarity and TF-IDF.
- **Modern UI/UX**: Fully responsive design optimized for both desktop and mobile devices.
- **Real-time Search**: Instant search results with movie suggestions.
- **Movie Details**: View comprehensive information including overview, cast, rating, and trailers.
- **Genre Exploration**: Browse movies by genre and find similar titles.
- **Interactive Animations**: Smooth transitions powered by Framer Motion.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Routing**: React Router DOM (v6/v7)
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI
- **Language**: Python
- **Machine Learning**: Scikit-learn, Pandas, NumPy
- **Server**: Uvicorn

## 📂 Project Structure

```
Movie recommendation system/
├── Backend/             # Python FastAPI Server
│   ├── main.py          # API entry point
│   ├── requirements.txt # Python dependencies
│   ├── model/           # ML models and data (pickles)
│   ├── data/            # Source datasets
│   └── notebook/        # Jupyter notebooks for model training
│
├── Frontend/            # React Application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application routes/pages
│   │   ├── api/         # API integration logic
│   │   └── assets/      # Static assets
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md            # Project documentation
```

## 💻 Local Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Movie recommendation system"
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd Backend

# Create a virtual environment (recommended)
python -m venv venv
# Activate:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your TMDB API Key
# TMDB_API_KEY=your_actual_api_key_here

# Run the server
uvicorn main:app --reload
```
The backend will start at `http://127.0.0.1:8000`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the development server.

```bash
cd ../Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will start at `http://localhost:5173`.

## ⚙️ Configuration

### Environment Variables

**Backend (`Backend/.env`)**
```env
TMDB_API_KEY=your_tmdb_api_key
```

**Frontend (`Frontend/.env` - optional)**
If you want to point the local frontend to a specific backend (e.g., local or production):
```env
VITE_API_BASE=http://127.0.0.1:8000  # for local development
# OR
VITE_API_BASE=https://movies-recommendation-system-bq0k.onrender.com  # to use the live backend
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
