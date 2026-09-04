# 🎬 Movie Recommender System

A content-based movie recommendation system that evolved from TF-IDF sparse vectors to **contextual semantic embeddings** via a Hugging Face Sentence Transformer — served through a production-grade **FastAPI** backend.

---

## 📌 Project Overview

This project started as a classic NLP recommendation pipeline using TF-IDF vectorization on movie metadata (overview, genres, tagline). It was then upgraded to use a **pre-trained sentence embedding model** (`BAAI/bge-small-en-v1.5`) from Hugging Face, enabling true semantic similarity instead of keyword overlap.

The backend is a FastAPI application that:
- Loads pre-computed embeddings from a **Hugging Face model repository** at startup
- Serves content-based recommendations via **cosine similarity** on the embeddings
- Enriches results with live **TMDB API** data (posters, metadata, genre discovery)

---

## 🧠 The Core Upgrade: TF-IDF → Contextual Embeddings

### Why TF-IDF Falls Short

TF-IDF represents each movie as a sparse vector of token frequencies. It cannot:
- Understand synonyms ("action" ≠ "thriller" even when semantically close)
- Capture context across words in a sentence
- Handle paraphrased descriptions that mean the same thing

A query for *"a heist movie with clever twists"* won't match a movie whose overview says *"a sophisticated robbery unfolds"* — the vocabulary doesn't overlap.

### The Fix: Sentence Transformers

The notebook (`movies.ipynb`) constructs a `tags` column by concatenating each movie's `overview`, `genres`, and `tagline`:

```python
df['tags'] = df['overview'] + ' ' + df['genres'] + ' ' + df['tagline']
```

These tags are then encoded with:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("BAAI/bge-small-en-v1.5")
embeddings = model.encode(
    df["tags"].tolist(),
    batch_size=64,
    show_progress_bar=True,
    normalize_embeddings=True
)
```

`BAAI/bge-small-en-v1.5` is a **bi-encoder** model trained for semantic similarity. It maps each movie's combined text into a **384-dimensional dense vector** in a shared semantic space. Movies with similar meaning end up close together — regardless of surface word overlap.

Embeddings are pre-computed once and stored as a pickle file, then uploaded to Hugging Face for serving.

### Similarity at Inference

```python
from sklearn.metrics.pairwise import cosine_similarity

sim_scores = cosine_similarity(load_model[idx].reshape(1, -1), load_model).flatten()
```

Because `normalize_embeddings=True` is used during encoding, the embeddings are already unit-normalized — cosine similarity reduces to a simple dot product, making it extremely fast.

---

## 🗂️ Repository Structure

```
├── main.py              # FastAPI backend (API server)
├── movies.ipynb         # EDA + embedding generation notebook
├── model/               # Auto-created at runtime; populated from HF
│   ├── df.pkl           # Cleaned movie DataFrame
│   ├── embeddings.pkl   # Pre-computed sentence embeddings (numpy array)
│   ├── indices.pkl      # Title → DataFrame index mapping
│   └── load_modelidx.pkl  # Optional upgraded index artifact
├── frontend/            # React web app (if applicable)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env             # VITE_API_URL or REACT_APP_API_URL
├── .env                 # Backend API keys (not committed)
└── README.md
```

---

## ⚙️ How It Works

### Startup: Artifact Loading

On boot, the API downloads all model artifacts from a Hugging Face dataset repo in **parallel**:

```
HF Repo: tarun24345/embedding-of-movies
```

Files downloaded:
| File | Purpose |
|------|---------|
| `df.pkl` | Cleaned TMDB DataFrame with title, genres, overview |
| `embeddings.pkl` | Pre-computed `BAAI/bge-small-en-v1.5` vectors |
| `indices.pkl` | Title → row index mapping |
| `load_modelidx.pkl` | (Optional) upgraded index format |

Artifacts are cached locally after the first download. The startup uses atomic file replacement (`os.replace`) to prevent corrupt partial downloads from being read.

### Recommendation Pipeline

```
User query
    │
    ▼
Normalize title (lowercase, alphanumeric only)
    │
    ▼
Match against df['title'] → get row index
    │
    ▼
Slice embedding vector: load_model[idx]
    │
    ▼
Cosine similarity against all embeddings
    │
    ▼
Top-N similar indices (via argpartition — O(N) not O(N log N))
    │
    ▼
Return titles + enrich with TMDB poster/metadata
```

The `tfidf_recommend_titles` function uses `np.argpartition` for efficiency — it only fully sorts the top K candidates, not the full embedding matrix.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check if models are loaded and ready |
| `GET` | `/home` | Home feed (trending, popular, top_rated, etc.) |
| `GET` | `/tmdb/search` | Raw TMDB keyword search |
| `GET` | `/movie/id/{tmdb_id}` | Full movie details from TMDB |
| `GET` | `/recommend/tfidf` | Embedding-based recommendations (local) |
| `GET` | `/recommend/genre` | TMDB genre-based discovery |
| `GET` | `/movie/search` | **Bundle endpoint**: details + recs + genre recs |

### `/movie/search` — The Main Endpoint

```
GET /movie/search?query=Inception&tfidf_top_n=12&genre_limit=12
```

Returns a `SearchBundleResponse`:
```json
{
  "query": "Inception",
  "movie_details": { ... },
  "tfidf_recommendations": [
    { "title": "Interstellar", "score": 0.91, "tmdb": { ... } },
    ...
  ],
  "genre_recommendations": [ ... ]
}
```

TMDB poster fetches for all recommendations are fired **concurrently** via `asyncio.gather`, so the endpoint doesn't degrade linearly with `top_n`.

---

## 🚀 Setup & Running

The project has two independently runnable parts: the **FastAPI backend** and the **React frontend**. Run the backend first — the frontend is just a consumer of the API.

---

### 🔧 Backend (FastAPI)

#### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd <repo>
pip install -r requirements.txt
```

Key dependencies:
```
fastapi
uvicorn
httpx
pandas
numpy
scikit-learn
sentence-transformers
python-dotenv
pydantic
```

#### 2. Set environment variables

Create a `.env` file in the root:

```env
TMDB_API_KEY=your_tmdb_api_key_here
HF_REPO_ID=tarun24345/embedding-of-movies   # optional override
HF_TOKEN=your_hf_token_here                  # optional, for private HF repos
```

Get your TMDB key at: https://www.themoviedb.org/settings/api

#### 3. Choose how to run the backend

**Option A — Local development (with hot reload)**

```bash
uvicorn main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`  
Interactive docs (Swagger UI): `http://localhost:8000/docs`  
Alternative docs (ReDoc): `http://localhost:8000/redoc`

> On first startup, the app downloads all model artifacts from Hugging Face (~100–300 MB). Subsequent starts use the local cache in `model/`.

**Option B — Production (multiple workers)**

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

> Avoid `--reload` in production — it disables multi-worker mode. Use `--workers` based on your CPU count.

**Option C — Docker**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t movie-recommender-api .
docker run -p 8000:8000 --env-file .env movie-recommender-api
```

**Option D — Deploy to Render (free tier)**

1. Push the repo to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set the build command: `pip install -r requirements.txt`
4. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (`TMDB_API_KEY`, `HF_REPO_ID`) in the Render dashboard

> The `model/` directory is ephemeral on Render — artifacts are re-downloaded from Hugging Face on every cold start. This is expected behavior and handled automatically.

#### 4. Verify the backend is running

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{ "status": "ok", "models_ready": true, "hf_repo": "tarun24345/embedding-of-movies" }
```

If `models_ready` is `false`, wait a few seconds — the HF downloads are still in progress.

#### 5. Regenerate Embeddings (optional)

Open `movies.ipynb` and run all cells. The notebook:
1. Loads `TMDB_all_movies.csv`
2. Cleans and selects relevant columns
3. Constructs `tags` from overview + genres + tagline
4. Encodes with `BAAI/bge-small-en-v1.5`
5. Saves `embeddings.pkl`, `df.pkl`, `indices.pkl`

Upload the new pickles to your Hugging Face repo to update the production model.

---

### 🖥️ Frontend (React)

The React frontend communicates with the FastAPI backend via the API endpoints. Make sure the backend is running before starting the frontend.

#### 1. Navigate to the frontend directory

```bash
cd frontend
```

#### 2. Install dependencies

```bash
npm install
# or
yarn install
```

#### 3. Configure the backend URL

Create a `.env` file inside the `frontend/` directory:

**If using Vite (recommended):**
```env
VITE_API_URL=http://localhost:8000
```

**If using Create React App:**
```env
REACT_APP_API_URL=http://localhost:8000
```

In your React code, reference it as:
```js
// Vite
const API_BASE = import.meta.env.VITE_API_URL;

// CRA
const API_BASE = process.env.REACT_APP_API_URL;
```

> When deploying the frontend (e.g. Vercel, Netlify), update the env variable to point to your deployed backend URL instead of `localhost`.

#### 4. Run the React dev server

```bash
npm run dev      # Vite
# or
npm start        # Create React App
```

App will be available at: `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA)

#### 5. Build for production

```bash
npm run build
```

Output goes to `frontend/dist/` (Vite) or `frontend/build/` (CRA). Deploy this folder to any static host (Vercel, Netlify, GitHub Pages).

#### 6. Deploy frontend to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

When prompted, set the environment variable:
```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

---

### 🔗 Running Both Together (local)

Open two terminals:

```bash
# Terminal 1 — Backend
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

The frontend at `localhost:5173` will hit the backend at `localhost:8000`. CORS is already configured in `main.py` to allow all origins (`allow_origins=["*"]`), so no proxy setup is needed locally.

---

## 📊 Dataset

- **Source**: TMDB All Movies dataset (`TMDB_all_movies.csv`)
- **Used columns**: `title`, `genres`, `tagline`, `overview`, `vote_average`, `popularity`
- **Preprocessing**: Drop rows with missing titles; fill missing genres/tagline/overview with empty string

---

## 🔑 Design Decisions

**Why pre-compute embeddings instead of encoding at query time?**
Encoding a full dataset with a transformer is slow (minutes). Pre-computing once and serving from a numpy matrix keeps inference at milliseconds.

**Why Hugging Face for artifact storage?**
HF dataset repos are free, versioned, and have CDN-backed downloads. It's a clean way to decouple model artifacts from application code, especially on platforms like Render that have ephemeral filesystems.

**Why `BAAI/bge-small-en-v1.5`?**
It's one of the top-ranked small bi-encoder models on the MTEB benchmark. "Small" means 384 dimensions and ~33M parameters — fast to encode and cheap to store, while still meaningfully outperforming TF-IDF on semantic similarity tasks.

---

## 📝 License

MIT
