import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails } from '../api/api';
import { Spinner } from '../components/Loader';
import { ArrowLeft } from 'lucide-react';

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const data = await getMovieDetails(id);
        const videos = data.videos || [];
        setMovie(data);

        // Find best trailer
        // Prefer official trailer
        const trailer = videos.find(
          (v) => v.site === 'YouTube' && v.type === 'Trailer'
        );
        // Fallback: any youtube video (teaser, clip, etc)
        const fallback = videos.find((v) => v.site === 'YouTube');

        if (trailer) {
          setTrailerKey(trailer.key);
        } else if (fallback) {
          setTrailerKey(fallback.key);
        }
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMovieData();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col gap-4 justify-center items-center">
        <p className="text-gray-400">Movie not found</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-white/10 rounded hover:bg-white/20 transition-colors text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-20 pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="pointer-events-auto bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full p-2 text-white transition-all transform hover:scale-105 group border border-white/10"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="flex-1 w-full h-full relative">
        {trailerKey ? (
          <iframe
            className="w-full h-full object-cover"
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1`}
            title={movie.title + ' Trailer'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-stone-900/50">
            <div className="text-gray-500 text-6xl mb-4 opacity-20">🎥</div>
            <h2 className="text-2xl font-bold text-white mb-2">Trailer Unavailable</h2>
            <p className="text-gray-400 max-w-md">
              We couldn't find a trailer for <span className="text-white font-medium">{movie.title}</span>.
            </p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-8 px-6 py-2.5 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;
