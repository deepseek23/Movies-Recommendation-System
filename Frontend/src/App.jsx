import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import Movie from './pages/Movie';
import Recommend from './pages/Recommend';
import Player from './pages/Player';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-white selection:bg-accent selection:text-white">
        <Navbar />
        <main className="pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/movie/:id" element={<Movie />} />
            <Route path="/player/:id" element={<Player />} />
            <Route path="/recommend" element={<Recommend />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
