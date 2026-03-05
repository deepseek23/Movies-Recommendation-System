import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { getRecommendationBundle } from '../api/api';
import MovieHero from '../components/MovieHero';
import { MovieGrid } from '../components/MovieGrid';
import { Spinner } from '../components/Loader';

const Recommend = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundle = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const data = await getRecommendationBundle(query);
        setBundle(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBundle();
  }, [query]);

  if (!query) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 text-center">
        <Sparkles className="w-10 h-10 text-gray-800" />
        <p className="text-gray-600 text-sm">Provide a movie query to get recommendations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <Spinner />
        <p className="text-gray-600 text-sm">Generating recommendations for "{query}"...</p>
      </div>
    );
  }

  if (!bundle?.movie_details) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500 text-sm">No recommendations found for "{query}".</p>
      </div>
    );
  }

  const tfidfRecs = (bundle.tfidf_recommendations || [])
    .map((item) => item.tmdb || item)
    .filter((item) => item?.tmdb_id);

  const genreRecs = bundle.genre_recommendations || [];

  return (
    <div className="min-h-screen bg-background">
      <MovieHero movie={bundle.movie_details} />

      <div className="max-w-350 mx-auto">
        {/* AI Content Matches */}
        {tfidfRecs.length > 0 && (
          <section className="pt-12 pb-6">
            <div className="flex items-center gap-3 mb-2 px-6 md:px-12">
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <h2 className="text-lg font-semibold text-white">AI Content Matches</h2>
              <span className="ml-auto text-xs text-gray-600">{tfidfRecs.length} results</span>
            </div>
            <MovieGrid movies={tfidfRecs} isLoading={false} emptyMessage="No content matches found." />
          </section>
        )}

        {/* Genre recommendations */}
        {genreRecs.length > 0 && (
          <section className="py-12 border-t border-white/5">
            <div className="flex items-center gap-3 mb-2 px-6 md:px-12">
              <span className="w-0.5 h-5 bg-gray-700 rounded-full shrink-0" />
              <h2 className="text-lg font-semibold text-white">More in this Genre</h2>
              <span className="ml-auto text-xs text-gray-600">{genreRecs.length} results</span>
            </div>
            <MovieGrid movies={genreRecs} isLoading={false} emptyMessage="No genre matches found." />
          </section>
        )}
      </div>
    </div>
  );
};

export default Recommend;
