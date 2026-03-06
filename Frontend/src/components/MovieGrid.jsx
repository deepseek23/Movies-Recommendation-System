import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import { SkeletonGrid } from './Loader';

export const MovieGrid = ({ movies, isLoading, emptyMessage = 'No movies found.' }) => {
  if (isLoading) return <SkeletonGrid />;

  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-600 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-2.5 gap-y-6 md:gap-x-4 md:gap-y-8 px-4 md:px-12 py-4"
    >
      {movies.map((movie, idx) => (
        <motion.div
          key={movie.tmdb_id || movie.id || idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.4) }}
        >
          <MovieCard movie={movie} />
        </motion.div>
      ))}
    </motion.div>
  );
};
