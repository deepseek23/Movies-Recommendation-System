import requests
import streamlit as st

API_BASE = "https://movies-recommendation-system-bq0k.onrender.com"
TMDB_IMG = "https://image.tmdb.org/t/p/w500"

st.set_page_config(page_title="Movie Recommender", page_icon="🎬", layout="wide")

# =============================
# STYLES
# =============================

st.markdown("""
<style>
.block-container { padding-top: 1rem; padding-bottom: 2rem; max-width: 1400px; }
.small-muted { color:#6b7280; font-size: 0.9rem; }
.movie-title { font-size: 0.9rem; line-height: 1.2rem; height: 2.4rem; overflow: hidden; }
.card { border:1px solid rgba(0,0,0,0.08); border-radius:14px; padding:10px; }
</style>
""", unsafe_allow_html=True)


# =============================
# SESSION STATE
# =============================

if "view" not in st.session_state:
    st.session_state.view = "home"

if "selected_tmdb_id" not in st.session_state:
    st.session_state.selected_tmdb_id = None


# =============================
# ROUTING
# =============================

def goto_home():
    st.session_state.view = "home"
    st.session_state.selected_tmdb_id = None
    st.rerun()


def goto_details(tmdb_id):
    st.session_state.view = "details"
    st.session_state.selected_tmdb_id = tmdb_id
    st.rerun()


# =============================
# API HELPER
# =============================

@st.cache_data(ttl=60)
def api_get(path, params=None):

    try:
        r = requests.get(f"{API_BASE}{path}", params=params, timeout=25)

        if r.status_code != 200:
            return None, f"HTTP {r.status_code}"

        return r.json(), None

    except Exception as e:
        return None, str(e)


# =============================
# SAFE IMAGE
# =============================

def render_poster(poster):

    if not poster:
        st.write("🖼️")
        return

    if isinstance(poster, str):

        if poster.startswith("/"):
            poster = f"{TMDB_IMG}{poster}"

        if poster.startswith("http"):
            st.image(poster, use_column_width=True)
            return

    st.write("🖼️")


# =============================
# GRID
# =============================

def poster_grid(cards, cols=6, key_prefix="grid"):

    if not cards:
        st.info("No movies available")
        return

    rows = (len(cards) + cols - 1) // cols
    idx = 0

    for r in range(rows):

        colset = st.columns(cols)

        for c in range(cols):

            if idx >= len(cards):
                break

            movie = cards[idx]
            idx += 1

            tmdb_id = movie.get("tmdb_id")
            title = movie.get("title", "Untitled")
            poster = movie.get("poster_url") or movie.get("poster_path")

            with colset[c]:

                render_poster(poster)

                if st.button("Open", key=f"{key_prefix}_{r}_{c}_{idx}"):

                    if tmdb_id:
                        goto_details(tmdb_id)

                st.markdown(
                    f"<div class='movie-title'>{title}</div>",
                    unsafe_allow_html=True
                )


# =============================
# SIDEBAR
# =============================

with st.sidebar:

    st.markdown("## 🎬 Menu")

    if st.button("🏠 Home"):
        goto_home()

    st.markdown("---")

    category = st.selectbox(
        "Category",
        ["trending", "popular", "top_rated", "now_playing", "upcoming"]
    )

    grid_cols = st.slider("Grid Columns", 4, 8, 6)


# =============================
# HEADER
# =============================

st.title("🎬 Movie Recommender")

st.markdown(
"<div class='small-muted'>Search a movie → open details → get recommendations</div>",
unsafe_allow_html=True
)

st.divider()


# ======================================================
# HOME PAGE
# ======================================================

if st.session_state.view == "home":

    query = st.text_input("Search movie")

    st.divider()

    if query:

        data, err = api_get("/tmdb/search", {"query": query})

        if err:
            st.error(err)

        else:

            if isinstance(data, dict):
                results = data.get("results", [])
            else:
                results = data

            cards = []

            for m in results:

                tmdb_id = m.get("id") or m.get("tmdb_id")

                if not tmdb_id:
                    continue

                cards.append({
                    "tmdb_id": tmdb_id,
                    "title": m.get("title"),
                    "poster_url": m.get("poster_url"),
                    "poster_path": m.get("poster_path")
                })

            poster_grid(cards, cols=grid_cols, key_prefix="search")

        st.stop()

    st.markdown(f"### {category.replace('_',' ').title()}")

    home_cards, err = api_get("/home", {"category": category, "limit": 24})

    if err:
        st.error(err)
        st.stop()

    poster_grid(home_cards, cols=grid_cols, key_prefix="home")


# ======================================================
# DETAILS PAGE
# ======================================================

elif st.session_state.view == "details":

    tmdb_id = st.session_state.selected_tmdb_id

    if not tmdb_id:

        st.warning("No movie selected")

        if st.button("Back"):
            goto_home()

        st.stop()

    data, err = api_get(f"/movie/id/{tmdb_id}")

    if err or not data:
        st.error(err)
        st.stop()

    left, right = st.columns([1, 2])

    with left:
        render_poster(data.get("poster_url"))

    with right:

        st.markdown(f"## {data.get('title')}")

        release = data.get("release_date", "-")

        genres = ", ".join(
            [g["name"] for g in data.get("genres", [])]
        )

        st.markdown(f"Release: {release}")
        st.markdown(f"Genres: {genres}")

        st.markdown("### Overview")
        st.write(data.get("overview", "No overview"))

    if data.get("backdrop_url"):

        st.markdown("### Backdrop")
        st.image(data["backdrop_url"], use_column_width=True)

    st.divider()

    st.markdown("## Recommendations")

    title = data.get("title")

    bundle, err = api_get(
        "/movie/search",
        {"query": title, "tfidf_top_n": 12, "genre_limit": 12}
    )

    if bundle:

        tfidf_cards = []

        for x in bundle.get("tfidf_recommendations", []):

            tmdb = x.get("tmdb", {})

            if tmdb.get("tmdb_id"):

                tfidf_cards.append({
                    "tmdb_id": tmdb["tmdb_id"],
                    "title": tmdb.get("title"),
                    "poster_url": tmdb.get("poster_url")
                })

        st.markdown("### Similar Movies")

        poster_grid(
            tfidf_cards,
            cols=grid_cols,
            key_prefix="tfidf"
        )

        st.markdown("### Genre Based")

        poster_grid(
            bundle.get("genre_recommendations", []),
            cols=grid_cols,
            key_prefix="genre"
        )

    else:

        fallback, err = api_get(
            "/recommend/genre",
            {"tmdb_id": tmdb_id, "limit": 18}
        )

        if fallback:
            poster_grid(fallback, cols=grid_cols, key_prefix="fallback")
        else:
            st.warning("No recommendations available")