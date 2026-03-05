import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Info, Star } from 'lucide-react';
import { getPosterUrl } from '../api/api';

const MovieHero = ({ movie }) => {
  if (!movie) return null;

  const backdropUrl = getPosterUrl(movie.backdrop_url || movie.poster_url || movie.poster_path);
  const movieId = movie.tmdb_id || movie.id;
  const year = movie.release_date ? movie.release_date.split('-')[0] : null;
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;

  return (
    <div className="relative w-full h-[65vh] md:h-[88vh] overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-surface" />
        )}
        {/* Gradient layers */}
        <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/10 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end md:items-center">
        <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 pb-14 md:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-lg"
          >
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-400">
              {year && <span className="tabular-nums">{year}</span>}
              {rating && (
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {rating}
                </span>
              )}
              {movie.genres && movie.genres.length > 0 && (
                <div className="hidden sm:flex flex-wrap gap-1.5">
                  {movie.genres.slice(0, 3).map((g, i) => (
                    <span
                      key={g.id || i}
                      className="px-2 py-0.5 rounded text-xs bg-white/10 text-gray-300 border border-white/10"
                    >
                      {g.name || g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-white leading-[1.05] tracking-tight mb-4">
              {movie.title}
            </h1>

            {/* Overview */}
            {movie.overview && (
              <p className="text-gray-400 text-sm md:text-base leading-relaxed line-clamp-3 mb-7 max-w-md">
                {movie.overview}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <Link
                to={movieId ? `/movie/${movieId}` : '#'}
                className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-md font-bold text-sm hover:bg-white/90 transition-colors tracking-wide"
              >
                <Play className="w-4 h-4 fill-black" />
                Watch Now
              </Link>
              <Link
                to={movieId ? `/movie/${movieId}` : '#'}
                className="flex items-center gap-2 bg-white/10 text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-white/[0.18] transition-colors border border-white/10 tracking-wide"
              >
                <Info className="w-4 h-4" />
                More Info
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;
