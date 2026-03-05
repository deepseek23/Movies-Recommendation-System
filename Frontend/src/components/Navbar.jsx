import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Explore' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-white/[0.06] shadow-xl shadow-black/40'
          : 'bg-linear-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-1">
          <span className="text-xl font-black tracking-tight text-white">
            CINE<span className="text-accent">X</span>
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-sm">
          <SearchBar />
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
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
      </div>
    </nav>
  );
};

export default Navbar;
