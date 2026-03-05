import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { SkeletonRow } from './Loader';

export const MovieRow = ({ title, movies, isLoading }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const amount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  if (!isLoading && (!movies || movies.length === 0)) return null;

  return (
    <div className="mb-10 md:mb-14 relative group/row">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4 px-6 md:px-12">
        <span className="w-0.5 h-5 bg-accent rounded-full shrink-0" />
        <h2 className="text-base md:text-lg font-semibold text-white tracking-wide">{title}</h2>
      </div>

      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="absolute left-1 top-[calc(50%+18px)] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/80 border border-white/10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-black transition-all duration-200 hidden md:flex shadow-lg"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="absolute right-1 top-[calc(50%+18px)] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/80 border border-white/10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 hover:bg-black transition-all duration-200 hidden md:flex shadow-lg"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Row */}
      {isLoading ? (
        <SkeletonRow />
      ) : (
        <div
          ref={rowRef}
          className="flex gap-3 md:gap-4 overflow-x-auto px-6 md:px-12 pb-3 hide-scrollbar scroll-smooth"
        >
          {movies.map((movie, idx) => (
            <div
              key={movie.tmdb_id || movie.id || idx}
              className="min-w-30 sm:min-w-35 md:min-w-39 lg:min-w-43 shrink-0"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

