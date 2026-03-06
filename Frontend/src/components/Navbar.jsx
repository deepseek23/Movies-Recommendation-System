import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Explore' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled || menuOpen
          ? 'bg-background/95 backdrop-blur-md border-b border-white/[0.06] shadow-xl shadow-black/40'
          : 'bg-linear-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-1 z-50 relative">
          <span className="text-lg md:text-xl font-black tracking-tight text-white">
            CINE<span className="text-accent">X</span>
          </span>
        </Link>

        {/* Search - Hidden on mobile view */}
        <div className={`hidden md:block flex-1 max-w-sm transition-opacity duration-200 ${menuOpen ? 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'opacity-100'}`}>
          {location.pathname !== '/search' && <SearchBar />}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-1 z-50 relative"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 ml-auto shrink-0">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname === to
                  ? 'text-white bg-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-6 transition-transform duration-300 md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-xl font-bold transition-colors duration-200 ${
                location.pathname === to
                  ? 'text-accent'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
