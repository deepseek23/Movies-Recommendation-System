import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Sparkles, Clock, TrendingUp, X } from 'lucide-react';
import { searchMovies, getHomeMovies } from '../api/api';
import { MovieGrid } from '../components/MovieGrid';
import { Spinner } from '../components/Loader';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [history, setHistory] = useState([]);
  const [ongoingMovies, setOngoingMovies] = useState([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setHistory(savedHistory);

    const fetchOngoing = async () => {
      try {
        const data = await getHomeMovies('now_playing');
        setOngoingMovies(data || []);
      } catch (err) {
        console.error('Failed to fetch ongoing movies', err);
      }
    };
    fetchOngoing();
  }, []);

  useEffect(() => {
    if (query) {
      setInputValue(query);
      handleSearch(query);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const addToHistory = (searchQuery) => {
    setHistory(prev => {
      const newHistory = [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeFromHistory = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setHistory(prev => {
      const newHistory = prev.filter(h => h !== item);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    addToHistory(searchQuery);
    try {
      const data = await searchMovies(searchQuery);
      setResults(data.results || data || []);
      setTotalResults(data.total_results || data.results?.length || 0);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) setSearchParams({ q: inputValue.trim() });
  };

  const handleHistoryClick = (item) => {
    setInputValue(item);
    setSearchParams({ q: item });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="pt-24 pb-8 px-4 md:px-12 max-w-[1400px] mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Search</h1>

        <form onSubmit={onSubmit} className="relative max-w-2xl mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for movies, genres, or actors..."
            className="w-full bg-cards border border-white/10 rounded-lg py-3.5 pl-11 pr-28 text-base md:text-sm text-white placeholder-gray-600 outline-none focus:border-white/25 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-dark text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? <Spinner /> : 'Search'}
          </button>
        </form>

        {/* Previous Searches */}
        {!hasSearched && history.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <Clock className="w-4 h-4" />
                <h2 className="text-sm font-medium uppercase tracking-wider">Previous Searches</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {history.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 hover:text-white transition-colors border border-white/5 hover:border-white/20"
                  >
                    <span>{item}</span>
                    <span
                      onClick={(e) => removeFromHistory(e, item)}
                      className="p-0.5 rounded-full hover:bg-white/20 text-gray-500 group-hover:text-gray-300"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
        )}

        {/* Ongoing/Now Playing Recommendations */}
        {!hasSearched && ongoingMovies.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6 text-accent">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-white">Ongoing & Trending</h2>
            </div>
            <MovieGrid
              movies={ongoingMovies.slice(0, 12)}
              isLoading={false}
              emptyMessage=""
            />
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 px-6 md:px-12">
            <p className="text-sm text-gray-500">
              {loading ? 'Searching...' : (
                <>
                  <span className="text-white font-medium">{totalResults.toLocaleString()}</span>
                  {' '}results for{' '}
                  <span className="text-white font-medium">"{query}"</span>
                </>
              )}
            </p>
            {!loading && results.length > 0 && (
              <Link
                to={`/recommend?q=${encodeURIComponent(query)}`}
                className="inline-flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 hover:border-accent/40 px-4 py-2 rounded-lg text-sm font-medium transition-all self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Recommendations
              </Link>
            )}
          </div>

          <MovieGrid
            movies={results}
            isLoading={loading}
            emptyMessage={`No movies found for "${query}"`}
          />
        </div>
      )}

      {/* Initial empty state - Only show if no history and no suggestions */}
      {!hasSearched && history.length === 0 && ongoingMovies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <SearchIcon className="w-14 h-14 text-gray-800 mb-4" />
          <p className="text-gray-600 text-sm">Start typing to search for movies</p>
        </div>
      )}
    </div>
  );
};

export default Search;
