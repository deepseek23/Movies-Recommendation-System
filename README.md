---
title: Movie Recommendation System
emoji: 🎬
colorFrom: indigo
colorTo: blue
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
short_description: TF-IDF movie recommendations (models from Hub)
---

# 🎬 Movie Recommendation System

A modern, responsive movie recommendation platform built with **React** and **FastAPI**. The system uses a content-based filtering algorithm (TF-IDF) to suggest similar movies based on metadata like genres, keywords, cast, and crew.

> **Hugging Face Space (no Docker):** this repo also runs as a **Gradio** Space via `app.py`. Models are fetched from [`tarun24345/embedding-of-movies`](https://huggingface.co/tarun24345/embedding-of-movies) at startup. FastAPI itself is not supported on Spaces without Docker — use Gradio for HF, or keep FastAPI on Render/Docker.

![React](https://img.shields.io/badge/React-18%2B-blue)
![Vite](https://img.shields.io/badge/Vite-4%2B-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0%2B-cyan)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Gradio](https://img.shields.io/badge/Gradio-HF_Spaces-orange)

## 🚀 Live Demo

- **Frontend Application**: https://movies-recommendation-system-sigma.vercel.app/
- **Backend API (Docs)**: [https://recommendation-latest-0687.onrender.com/docs](https://recommendation-latest-0687.onrender.com/docs)

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
# Models are downloaded from Hugging Face on startup (cached under Backend/model/)
HF_REPO_ID=tarun24345/embedding-of-movies
# Optional: private repo / higher rate limits
# HF_TOKEN=hf_xxxxxxxx
```

On Render, set `TMDB_API_KEY` (and optionally `HF_TOKEN`) in the service Environment tab. First boot downloads `df.pkl`, `indices.pkl`, and `embeddings.pkl` from the HF repo, then serves recommendations.

**Frontend (`Frontend/.env` - optional)**
If you want to point the local frontend to a specific backend (e.g., local or production):
```env
VITE_API_BASE=http://127.0.0.1:8000  # for local development
# OR
VITE_API_BASE=https://movies-recommendation-system-bq0k.onrender.com  # to use the live backend
```

## 🤗 Deploy on Hugging Face Spaces (no Docker)

Spaces without Docker supports **Gradio** / Streamlit / Static — not FastAPI. Use `app.py` (Gradio) as the Space backend/demo.

### 1. Create the Space
1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. Name it (e.g. `movie-recommender`)
3. Select **Gradio** as the SDK (not Docker)
4. Hardware: **CPU basic** is enough to start
5. Create the Space

### 2. Push this repo (or the Gradio files)
From your machine (replace `YOUR_USER` / `YOUR_SPACE`):

```bash
git remote add space https://huggingface.co/spaces/YOUR_USER/YOUR_SPACE
git push space main
```

Minimum files Spaces needs:
- `app.py` — entry point
- `gradio_app.py` — model load + UI
- `requirements.txt` — dependencies
- `README.md` — with the YAML frontmatter at the top (already added)

### 3. Add secrets (Space → Settings → Variables and secrets)
| Name | Required | Notes |
|------|----------|--------|
| `TMDB_API_KEY` | Yes (for posters) | Same key as local `.env` |
| `HF_REPO_ID` | No | Default: `tarun24345/embedding-of-movies` |
| `HF_TOKEN` | Only if model repo is private | |

### 4. Wait for build
First boot downloads `df.pkl`, `indices.pkl`, and `embeddings.pkl` from the Hub, then the Gradio UI goes live at:

`https://huggingface.co/spaces/YOUR_USER/YOUR_SPACE`

### Local Gradio (same code)
```bash
pip install -r requirements.txt
python app.py
# → http://127.0.0.1:7860
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
