import requests
import streamlit as st

API_BASE = "https://movies-recommendation-system-bq0k.onrender.com"
TMDB_IMG = "https://image.tmdb.org/t/p/w500"

st.set_page_config(page_title="Movie Recommender", page_icon="🎬", layout="wide")

# =============================
# STYLES
# =============================

st.markdown(
"""
<style>
.block-container { padding-top: 1rem; padding-bottom: 2rem; max-width: 1400px; }
.small-muted { color:#6b7280; font-size: 0.92rem; }
.movie-title { font-size: 0.9rem; line-height: 1.15rem; height: 2.3rem; overflow: hidden; }
.card { border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 14px; background: rgba(255,255,255,0.7); }
</style>
""",
unsafe_allow_html=True
)

# =============================
# STATE
# =============================

if "view" not in st.session_state:
    st.session_state.view = "home"

if "selected_tmdb_id" not in st.session_state:
    st.session_state.selected_tmdb_id = None

qp_view = st.query_params.get("view")
qp_id = st.query_params.get("id")

if qp_view in ("home","details"):
    st.session_state.view = qp_view

if qp_id:
    try:
        st.session_state.selected_tmdb_id = int(qp_id)
        st.session_state.view = "details"
    except:
        pass


# =============================
# NAVIGATION
# =============================

def goto_home():
    st.session_state.view = "home"
    st.query_params["view"] = "home"
    if "id" in st.query_params:
        del st.query_params["id"]
    st.rerun()


def goto_details(tmdb_id:int):
    st.session_state.view = "details"
    st.session_state.selected_tmdb_id = tmdb_id
    st.query_params["view"] = "details"
    st.query_params["id"] = str(tmdb_id)
    st.rerun()


# =============================
# API HELPER
# =============================

@st.cache_data(ttl=30)
def api_get_json(path,params=None):

    try:
        r = requests.get(f"{API_BASE}{path}",params=params,timeout=25)

        if r.status_code >=400:
            return None,f"HTTP {r.status_code}"

        return r.json(),None

    except Exception as e:
        return None,str(e)


# =============================
# SAFE IMAGE RENDER
# =============================

def render_poster(poster):

    if not poster:
        st.write("🖼️ No poster")
        return

    if isinstance(poster,dict):
        st.write("🖼️ No poster")
        return

    if poster.startswith("/"):
        poster = f"{TMDB_IMG}{poster}"

    if poster.startswith("http"):
        st.image(poster,use_container_width=True)
    else:
        st.write("🖼️ No poster")


# =============================
# GRID
# =============================

def poster_grid(cards,cols=6,key_prefix="grid"):

    if not cards:
        st.info("No movies to show")
        return

    rows = (len(cards)+cols-1)//cols
    idx = 0

    for r in range(rows):

        colset = st.columns(cols)

        for c in range(cols):

            if idx >= len(cards):
                break

            m = cards[idx]
            idx += 1

            tmdb_id = m.get("tmdb_id")
            title = m.get("title","Untitled")
            poster = m.get("poster_url") or m.get("poster_path")

            with colset[c]:

                render_poster(poster)

                if st.button("Open",key=f"{key_prefix}_{r}_{c}_{idx}_{tmdb_id}"):

                    if tmdb_id:
                        goto_details(tmdb_id)

                st.markdown(
                    f"<div class='movie-title'>{title}</div>",
                    unsafe_allow_html=True
                )


# =============================
# TFIDF CARD FORMAT
# =============================

def to_cards_from_tfidf_items(items):

    cards = []

    for x in items or []:

        tmdb = x.get("tmdb") or {}

        if tmdb.get("tmdb_id"):

            cards.append({
                "tmdb_id":tmdb["tmdb_id"],
                "title":tmdb.get("title") or x.get("title"),
                "poster_url":tmdb.get("poster_url")
            })

    return cards


# =============================
# SIDEBAR
# =============================

with st.sidebar:

    st.markdown("## 🎬 Menu")

    if st.button("🏠 Home"):
        goto_home()

    st.markdown("---")

    home_category = st.selectbox(
        "Category",
        ["trending","popular","top_rated","now_playing","upcoming"]
    )

    grid_cols = st.slider("Grid columns",4,8,6)


# =============================
# HEADER
# =============================

st.title("🎬 Movie Recommender")

st.markdown(
"<div class='small-muted'>Search movie → open details → get recommendations</div>",
unsafe_allow_html=True
)

st.divider()


# =============================
# HOME PAGE
# =============================

if st.session_state.view == "home":

    typed = st.text_input("Search movie")

    st.divider()

    if typed.strip():

        data,err = api_get_json("/tmdb/search",{"query":typed})

        if err:
            st.error(err)

        else:

            results = data.get("results",[]) if isinstance(data,dict) else data

            cards = []

            for m in results:

                tmdb_id = m.get("id") or m.get("tmdb_id")
                title = m.get("title")
                poster = m.get("poster_path") or m.get("poster_url")

                if not tmdb_id:
                    continue

                cards.append({
                    "tmdb_id":tmdb_id,
                    "title":title,
                    "poster_url":poster
                })

            poster_grid(cards,cols=grid_cols,key_prefix="search")

        st.stop()

    st.markdown(f"### {home_category.title()}")

    home_cards,err = api_get_json("/home",{"category":home_category,"limit":24})

    if err:
        st.error(err)
        st.stop()

    poster_grid(home_cards,cols=grid_cols,key_prefix="home")


# =============================
# DETAILS PAGE
# =============================

elif st.session_state.view == "details":

    tmdb_id = st.session_state.selected_tmdb_id

    if not tmdb_id:

        st.warning("No movie selected")

        if st.button("Back"):
            goto_home()

        st.stop()

    data,err = api_get_json(f"/movie/id/{tmdb_id}")

    if err or not data:
        st.error(err)
        st.stop()

    left,right = st.columns([1,2])

    with left:

        render_poster(data.get("poster_url"))

    with right:

        st.markdown(f"## {data.get('title')}")

        release = data.get("release_date","-")
        genres = ", ".join([g["name"] for g in data.get("genres",[])])

        st.markdown(f"Release: {release}")
        st.markdown(f"Genres: {genres}")

        st.markdown("### Overview")
        st.write(data.get("overview"))

    if data.get("backdrop_url"):

        st.markdown("### Backdrop")
        st.image(data["backdrop_url"],use_container_width=True)

    st.divider()

    st.markdown("## Recommendations")

    title = data.get("title")

    bundle,err = api_get_json(
        "/movie/search",
        {
            "query":title,
            "tfidf_top_n":12,
            "genre_limit":12
        }
    )

    if not err and bundle:

        st.markdown("### Similar Movies")

        poster_grid(
            to_cards_from_tfidf_items(bundle.get("tfidf_recommendations")),
            cols=grid_cols,
            key_prefix="tfidf"
        )

        st.markdown("### Genre Based")

        poster_grid(
            bundle.get("genre_recommendations",[]),
            cols=grid_cols,
            key_prefix="genre"
        )

    else:

        genre_only,err = api_get_json(
            "/recommend/genre",
            {"tmdb_id":tmdb_id,"limit":18}
        )

        if genre_only:

            poster_grid(
                genre_only,
                cols=grid_cols,
                key_prefix="genre_fallback"
            )