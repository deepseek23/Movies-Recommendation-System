import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://movies-recommendation-system-bq0k.onrender.com';
const api = axios.create({
    baseURL: API_BASE,
    timeout: 25000,
});

export const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

export const getHomeMovies = async (category) => {
    const response = await api.get('/home', { params: { category, limit: 24 } });
    return response.data;
};

export const searchMovies = async (query) => {
    const response = await api.get('/tmdb/search', { params: { query } });
    return response.data;
};

export const getMovieDetails = async (id) => {
    const response = await api.get(`/movie/id/${id}`);
    return response.data;
};

export const getGenreRecommendations = async (id) => {
    const response = await api.get('/recommend/genre', { params: { tmdb_id: id, limit: 18 } });
    return response.data;
};

export const getTFIDFRecommendations = async (title) => {
    const response = await api.get('/recommend/tfidf', { params: { title, top_n: 12 } });
    return response.data;
};

export const getRecommendationBundle = async (query) => {
    // Uses /movie/search?query=Avatar
    const response = await api.get('/movie/search', { params: { query } });
    return response.data;
};

export const getPosterUrl = (posterPath) => {
    if (!posterPath) return null;
    if (posterPath.startsWith('http')) return posterPath;
    if (posterPath.startsWith('/')) return `${TMDB_IMG}${posterPath}`;
    return posterPath;
};
