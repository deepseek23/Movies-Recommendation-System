import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getPosterUrl } from '../api/api';

const MovieCard = ({ movie }) => {
  const posterUrl = getPosterUrl(movie.poster_url || movie.poster_path);
  const id = movie.tmdb_id || movie.id;
  const year = movie.release_date ? movie.release_date.split('-')[0] : null;
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;

  if (!id) return null;

  return (
    <Link to={`/movie/${id}`} className="group block">
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded overflow-hidden bg-cards">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cards p-3">
            <span className="text-gray-700 text-xs text-center leading-relaxed">{movie.title}</span>
          </div>
        )}

        {/* Subtle dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-white">{rating}</span>
          </div>
        )}
      </div>

      {/* Info below poster */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-sm font-medium text-white truncate leading-snug group-hover:text-gray-200 transition-colors">
          {movie.title}
        </h3>
        {year && <p className="text-xs text-gray-600 mt-0.5">{year}</p>}
      </div>
    </Link>
  );
};

export default MovieCard;
