import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import { searchMovies } from '../api/api';
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

  useEffect(() => {
    if (query) {
      setInputValue(query);
      handleSearch(query);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="pt-24 pb-8 px-6 md:px-12 max-w-[1400px] mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Search</h1>

        <form onSubmit={onSubmit} className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for movies, genres, or actors..."
            className="w-full bg-cards border border-white/10 rounded-lg py-3.5 pl-11 pr-28 text-sm text-white placeholder-gray-600 outline-none focus:border-white/25 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-dark text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? <Spinner /> : 'Search'}
          </button>
        </form>
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

      {/* Initial empty state */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <SearchIcon className="w-14 h-14 text-gray-800 mb-4" />
          <p className="text-gray-600 text-sm">Start typing to search for movies</p>
        </div>
      )}
    </div>
  );
};

export default Search;
