# 🎬 Movie Recommendation System

A comprehensive movie recommendation platform featuring a **Streamlit** frontend and a **FastAPI** backend. This system leverages a content-based filtering approach using TF-IDF vectorization on movie metadata to suggest similar movies.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green)
![Streamlit](https://img.shields.io/badge/Streamlit-1.36.0-red)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5.1-orange)

## 🌟 Features

- **Personalized Recommendations**: Suggests movies based on content similarity (genres, keywords, cast, crew).
- **Interactive UI**: User-friendly interface built with Streamlit to browse movies and view details.
- **RESTful API**: fast and efficient backend powered by FastAPI to serve movie data and recommendations.
- **Data Analysis**: Includes a Jupyter Notebook for data preprocessing and model training.
- **TMDB Integration**: Fetches high-quality movie posters and details using the The Movie Database (TMDB) API.

## 📂 Folder Structure

Here's an overview of the project's file organization:

```
Movie recommendation system/
├── .devcontainer/       # Configuration for development containers (VS Code)
├── .git/                # Git version control directory
├── .gitignore           # Specifies files to ignore in Git
├── .idea/               # IntelliJ IDEA project configuration
├── app/                 # Main application source code
│   ├── .env             # Environment variables (API keys, etc.) - specific to your local setup
│   ├── .env.example     # Template for .env file
│   ├── .python-version  # Python version specification
│   ├── app.py           # Streamlit frontend application entry point
│   ├── main.py          # FastAPI backend application entry point
│   ├── requirements.txt # Python dependencies list
│   ├── runtime.txt      # Runtime configuration (e.g., for deployment platforms)
│   ├── __pycache__/     # Compiled Python bytecode
│   ├── data/            # Raw data files
│   │   └── movies_metadata.csv  # The dataset used for training the model
│   ├── model/           # Serialized model files (Pickles)
│   │   ├── df.pkl           # Preprocessed DataFrame
│   │   ├── indices.pkl      # Movie indices mapping
│   │   ├── tfidf_matrix.pkl # TF-IDF Matrix for similarity calculation
│   │   └── tfidf.pkl        # TF-IDF Vectorizer object
│   └── notebook/        # Data Science experiments
│       └── movies.ipynb     # Jupyter Notebook for data cleaning, EDA, and model building
└── README.md            # Project documentation (this file)
```

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Python 3.10 or higher
- A TMDB API Key (Get one from [The Movie Database](https://www.themoviedb.org/documentation/api))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd "Movie recommendation system"
    ```

2.  **Navigate to the `app` directory:**
    ```bash
    cd app
    ```

3.  **Install dependencies:**
    It is recommended to use a virtual environment.
    ```bash
    python -m venv venv
    # Activate:
    # Windows: venv\Scripts\activate
    # Mac/Linux: source venv/bin/activate
    
    pip install -r requirements.txt
    ```

4.  **Set up Environment Variables:**
    - Rename `.env.example` to `.env`.
    - Open `.env` and add your TMDB API Key:
      ```env
      TMDB_API_KEY=your_actual_api_key_here
      ```

### Running the Application

You can run the backend and frontend separately.

#### 1. Backend (FastAPI)

Start the API server:
```bash
# Make sure you are in the 'app' directory
uvicorn main:app --reload
```
The API will be available at `http://127.0.0.1:8000`. You can access the automatic documentation at `http://127.0.0.1:8000/docs`.

#### 2. Frontend (Streamlit)

By default, the frontend is configured to connect to a deployed backend. To use your local backend:
1.  Open `app.py`.
2.  Change the `API_BASE` variable:
    ```python
    # app.py
    # API_BASE = "https://movies-recommendation-system-bq0k.onrender.com"
    API_BASE = "http://127.0.0.1:8000" 
    ```
3.  Run the Streamlit app:
    ```bash
    streamlit run app.py
    ```
The application will open in your browser at `http://localhost:8501`.

## 🧠 How It Works

1.  **Data Processing (`notebook/movies.ipynb`)**: The dataset `movies_metadata.csv` is cleaned and processed. Text data (genres, keywords, etc.) is combined into a single string for each movie.
2.  **Model Building**: A TF-IDF Vectorizer converts the text data into numerical vectors. A Cosine Similarity matrix is implicitly used (or computed on demand via nearest neighbors) to find movies with similar content vectors.
3.  **API (`main.py`)**: The FastAPI backend loads the pre-computed matrices and dataframes. When a request comes in for a specific movie, it calculates similarity scores and returns the top recommended movies along with their details (fetched from TMDB).
4.  **Frontend (`app.py`)**: The Streamlit interface allows users to search for movies, see details, and fetches recommendations from the API to display them visually.

## 🛠️ Technologies Used

- **Language**: Python
- **Web Frameworks**: Streamlit (Frontend), FastAPI (Backend)
- **Data Science**: Pandas, NumPy, Scikit-learn
- **API**: The Movie Database (TMDB) API
- **Deployment**: Render (for the live demo)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
