import React, { useState, useEffect } from 'react';
import { getHomeMovies } from '../api/api';
import { MovieRow } from '../components/MovieRow';
import MovieHero from '../components/MovieHero';

const categories = [
  { id: 'trending', title: 'Trending Now' },
  { id: 'discover', title: 'Discover Something New' }, // Added dynamic discovery
  { id: 'popular', title: 'Popular Movies' },
  { id: 'top_rated', title: 'Top Rated' },
  { id: 'now_playing', title: 'Now Playing' },
  { id: 'upcoming', title: 'Upcoming' },
];

const Home = () => {
  const [moviesData, setMoviesData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCategories = async () => {
      setLoading(true);
      const data = {};
      
      const promises = categories.map(async (cat) => {
        try {
          const res = await getHomeMovies(cat.id);
          return { id: cat.id, data: res };
        } catch (error) {
          console.error(`Failed to fetch ${cat.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      
      results.forEach(item => {
        if (item) {
          data[item.id] = item.data;
        }
      });
      
      setMoviesData(data);
      setLoading(false);
    };
    fetchAllCategories();
  }, []);

  const heroMovie = moviesData['trending']?.[0] || moviesData['popular']?.[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      {loading ? (
        <div className="w-full h-[65vh] md:h-[88vh] bg-surface animate-pulse" />
      ) : (
        <MovieHero movie={heroMovie} />
      )}

      {/* Movie rows — overlap hero bottom edge on desktop */}
      <div className="relative z-20 pt-10 pb-16 md:-mt-20">
        {categories.map((cat) => (
          <MovieRow
            key={cat.id}
            title={cat.title}
            movies={moviesData[cat.id] || []}
            isLoading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
