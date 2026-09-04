"""
Single-page Gradio demo for the movie recommender.
Loads df.pkl / indices.pkl / embeddings.pkl from Hugging Face Hub (no FastAPI).
"""

from __future__ import annotations

import os
import pickle
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import gradio as gr
import httpx
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from huggingface_hub import hf_hub_download
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------------------------------------------
# Env / config
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / "Backend" / ".env")
load_dotenv(BASE_DIR / ".env")

HF_REPO_ID = os.getenv("HF_REPO_ID", "tarun24345/embedding-of-movies")
HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_HUB_TOKEN")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMG_500 = "https://image.tmdb.org/t/p/w500"

# Cache under Backend/model locally; on Spaces use a writable path under /tmp
_ON_SPACES = bool(os.getenv("SPACE_ID"))
CACHE_DIR = (
    Path("/tmp/movie-recommender-models")
    if _ON_SPACES
    else BASE_DIR / "Backend" / "model"
)

# ---------------------------------------------------------------------------
# Model load (Hugging Face Hub)
# ---------------------------------------------------------------------------
df: Optional[pd.DataFrame] = None
tfidf_matrix: Any = None
TITLE_TO_IDX: Dict[str, int] = {}
MOVIE_TITLES: List[str] = []


def _norm_title(t: str) -> str:
    return str(t).strip().lower()


def build_title_to_idx_map(indices: Any) -> Dict[str, int]:
    title_to_idx: Dict[str, int] = {}
    if isinstance(indices, dict):
        for k, v in indices.items():
            title_to_idx[_norm_title(k)] = int(v)
        return title_to_idx
    try:
        for k, v in indices.items():
            title_to_idx[_norm_title(k)] = int(v)
        return title_to_idx
    except Exception as exc:
        raise RuntimeError(
            "indices.pkl must be dict or pandas Series-like (with .items())"
        ) from exc


def download_and_load_models() -> None:
    """Fetch pickles from HF Hub into CACHE_DIR and load them into memory."""
    global df, tfidf_matrix, TITLE_TO_IDX, MOVIE_TITLES

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[models] Downloading from Hugging Face: {HF_REPO_ID}")

    paths = {}
    for filename in ("df.pkl", "indices.pkl", "embeddings.pkl"):
        paths[filename] = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=filename,
            token=HF_TOKEN,
            local_dir=str(CACHE_DIR),
        )
        print(f"[models] Ready: {filename} -> {paths[filename]}")

    with open(paths["df.pkl"], "rb") as f:
        df = pickle.load(f)
    with open(paths["indices.pkl"], "rb") as f:
        indices_obj = pickle.load(f)
    with open(paths["embeddings.pkl"], "rb") as f:
        tfidf_matrix = pickle.load(f)

    if df is None or "title" not in df.columns:
        raise RuntimeError("df.pkl must contain a DataFrame with a 'title' column")

    TITLE_TO_IDX = build_title_to_idx_map(indices_obj)
    MOVIE_TITLES = sorted(str(t) for t in df["title"].dropna().unique())
    print(f"[models] Loaded {len(df)} movies, {len(TITLE_TO_IDX)} indexed titles")


# ---------------------------------------------------------------------------
# Recommendation + TMDB helpers
# ---------------------------------------------------------------------------
def tfidf_recommend_titles(
    query_title: str, top_n: int = 10
) -> List[Tuple[str, float]]:
    if df is None or tfidf_matrix is None:
        raise RuntimeError("Models not loaded")

    key = _norm_title(query_title)
    if key not in TITLE_TO_IDX:
        raise ValueError(f"Title not found in dataset: '{query_title}'")

    idx = int(TITLE_TO_IDX[key])
    qv = tfidf_matrix[idx]
    scores = cosine_similarity(tfidf_matrix, qv).ravel()

    k = min(top_n + 10, len(scores))
    if k < len(scores):
        top_k_idx = np.argpartition(scores, -k)[-k:]
        order = top_k_idx[np.argsort(-scores[top_k_idx])]
    else:
        order = np.argsort(-scores)

    out: List[Tuple[str, float]] = []
    for i in order:
        if int(i) == idx:
            continue
        try:
            title_i = str(df.iloc[int(i)]["title"])
        except Exception:
            continue
        out.append((title_i, float(scores[int(i)])))
        if len(out) >= top_n:
            break
    return out


def make_img_url(path: Optional[str]) -> Optional[str]:
    if not path:
        return None
    return f"{TMDB_IMG_500}{path}"


def tmdb_search_first(title: str) -> Optional[dict]:
    if not TMDB_API_KEY:
        return None
    try:
        r = httpx.get(
            f"{TMDB_BASE}/search/movie",
            params={
                "api_key": TMDB_API_KEY,
                "query": title,
                "include_adult": "false",
                "language": "en-US",
                "page": 1,
            },
            timeout=15.0,
        )
        r.raise_for_status()
        results = r.json().get("results") or []
        return results[0] if results else None
    except Exception:
        return None


def poster_for_title(title: str) -> Optional[str]:
    hit = tmdb_search_first(title)
    if not hit:
        return None
    return make_img_url(hit.get("poster_path"))


def recommend(movie_title: str, top_n: int) -> Tuple[str, List[Tuple[Optional[str], str]]]:
    if not movie_title:
        return "<p>Select a movie to get recommendations.</p>", []

    try:
        recs = tfidf_recommend_titles(movie_title, top_n=int(top_n))
    except ValueError as e:
        return f"<p style='color:#c0392b'>{e}</p>", []
    except Exception as e:
        return f"<p style='color:#c0392b'>Recommendation failed: {e}</p>", []

    if not recs:
        return "<p>No similar movies found.</p>", []

    gallery: List[Tuple[Optional[str], str]] = []
    rows: List[str] = []
    for title, score in recs:
        poster = poster_for_title(title)
        caption = f"{title} ({score:.3f})"
        gallery.append((poster, caption))
        rows.append(
            f"<tr><td>{title}</td><td style='text-align:right'>{score:.4f}</td></tr>"
        )

    table = (
        "<div style='margin-top:8px'>"
        f"<p><b>Similar to:</b> {movie_title} &nbsp;·&nbsp; {len(recs)} results</p>"
        "<table style='width:100%;border-collapse:collapse'>"
        "<thead><tr><th align='left'>Title</th><th align='right'>Score</th></tr></thead>"
        f"<tbody>{''.join(rows)}</tbody></table></div>"
    )
    return table, gallery


# ---------------------------------------------------------------------------
# UI
# ---------------------------------------------------------------------------
CUSTOM_CSS = """
.gradio-container { max-width: 1100px !important; }
footer { display: none !important; }
"""


def build_ui() -> gr.Blocks:
    with gr.Blocks(title="Movie Recommender", css=CUSTOM_CSS, theme=gr.themes.Soft()) as demo:
        gr.Markdown(
            f"""
            # Movie Recommendation Demo
            Content-based TF-IDF + cosine similarity. Models loaded from
            [`{HF_REPO_ID}`](https://huggingface.co/{HF_REPO_ID}) on Hugging Face Hub.
            """
        )

        with gr.Row():
            movie = gr.Dropdown(
                choices=MOVIE_TITLES,
                label="Pick a movie",
                value=MOVIE_TITLES[0] if MOVIE_TITLES else None,
                filterable=True,
                scale=4,
            )
            top_n = gr.Slider(
                minimum=5,
                maximum=20,
                value=10,
                step=1,
                label="How many recommendations",
                scale=1,
            )

        btn = gr.Button("Get recommendations", variant="primary")

        with gr.Row():
            gallery = gr.Gallery(
                label="Recommended movies",
                columns=5,
                rows=2,
                height="auto",
                object_fit="contain",
            )
        summary = gr.HTML()

        btn.click(fn=recommend, inputs=[movie, top_n], outputs=[summary, gallery])

        gr.Markdown(
            "_Tip: type in the dropdown to search titles. Posters come from TMDB when "
            "`TMDB_API_KEY` is configured (local `.env` or Space secret)._"
        )

    return demo


# Used by Hugging Face Spaces (`app.py`) and local `python app.py`
if __name__ == "__main__":
    download_and_load_models()
    demo = build_ui()
    on_spaces = bool(os.getenv("SPACE_ID"))
    if on_spaces:
        demo.launch()
    else:
        demo.launch(server_name="127.0.0.1", server_port=7860, share=False)
