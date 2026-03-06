import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchMovies, getPosterUrl } from '../api/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length > 2) {
        try {
          const data = await searchMovies(query);
          if (data?.results) {
            setSuggestions(data.results.slice(0, 6));
            setIsOpen(true);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    };
    const t = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (id) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/movie/${id}`);
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 border transition-all duration-200 ${
            isFocused
              ? 'bg-white/[0.10] border-white/25'
              : 'bg-white/[0.07] border-white/10'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search movies..."
            className="flex-1 bg-transparent text-base md:text-sm text-white placeholder-gray-600 outline-none min-w-0"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="text-gray-600 hover:text-gray-300 transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl shadow-black/70 overflow-hidden z-50">
          {suggestions.map((movie) => {
            const id = movie.tmdb_id || movie.id;
            const poster = getPosterUrl(movie.poster_url || movie.poster_path);
            return (
              <div
                key={id}
                onClick={() => handleSuggestionClick(id)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.06] cursor-pointer transition-colors"
              >
                <div className="w-8 h-11 rounded overflow-hidden shrink-0 bg-white/5">
                  {poster ? (
                    <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[9px] text-gray-700">N/A</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                  {movie.release_date && (
                    <p className="text-xs text-gray-500 mt-0.5">{movie.release_date.split('-')[0]}</p>
                  )}
                </div>
                {movie.vote_average > 0 && (
                  <span className="text-xs text-amber-400 font-semibold shrink-0">
                    ★ {Number(movie.vote_average).toFixed(1)}
                  </span>
                )}
              </div>
            );
          })}
          <div
            onClick={handleSubmit}
            className="px-3 py-2.5 text-center text-xs font-medium text-accent hover:bg-white/[0.04] cursor-pointer transition-colors border-t border-white/[0.06]"
          >
            See all results for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
