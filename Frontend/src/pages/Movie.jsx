import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieDetails, getGenreRecommendations, getRecommendationBundle } from '../api/api';
import MovieHero from '../components/MovieHero';
import { MovieRow } from '../components/MovieRow';
import { Spinner } from '../components/Loader';

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [tfidf, setTfidf] = useState([]);
  const [genreRecs, setGenreRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const movieData = await getMovieDetails(id);
        setMovie(movieData);

        if (movieData?.title) {
          try {
            const bundle = await getRecommendationBundle(movieData.title);
            if (bundle) {
              setTfidf(bundle.tfidf_recommendations || []);
              setGenreRecs(bundle.genre_recommendations || []);
            }
          } catch {
            const genreFallback = await getGenreRecommendations(id).catch(() => []);
            setGenreRecs(genreFallback);
          }
        }
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMovieData();
  }, [id]);

  if (loading && !movie) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-3">
        <p className="text-gray-500 text-sm">Movie not found</p>
      </div>
    );
  }

  const formattedTfidf = tfidf.map((item) => item.tmdb || item).filter((item) => item?.tmdb_id);

  return (
    <div className="min-h-screen bg-background">
      <MovieHero movie={movie} />

      {/* Genre tags strip */}
      {movie.genres && movie.genres.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 border-b border-white/[0.05]">
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((g, i) => (
              <span
                key={g.id || i}
                className="px-3 py-1 text-xs font-medium bg-white/5 border border-white/10 rounded-full text-gray-400"
              >
                {g.name || g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="pt-10 pb-16">
        <MovieRow
          title="Because you watched this"
          movies={formattedTfidf}
          isLoading={loading}
        />
        <MovieRow
          title="More in this Genre"
          movies={genreRecs}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default Movie;
