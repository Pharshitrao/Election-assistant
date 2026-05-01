import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = ({ exploredCount, totalStages }) => {
  const { isDark, toggleTheme } = useTheme();
  
  const progressPercentage = (exploredCount / totalStages) * 100;

  return (
    <header className="sticky top-0 z-50 bg-[#0E1117]/90 dark:bg-[#0E1117]/90 light:bg-slate-50/90 backdrop-blur-md border-b border-[#C8A96E]/20">
      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-800 light:bg-slate-200">
        <div 
          className="h-full bg-[#C8A96E] transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-4 rounded-lg">
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-[#C8A96E]">
              Indian Election Assistant
            </h1>
          </Link>
          <p className="text-sm text-slate-400 light:text-slate-500 mt-1 font-body">
            Explore {exploredCount} of {totalStages} stages
          </p>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <nav className="flex gap-3 md:gap-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => `font-bold font-body transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-2 rounded-md px-2 py-1 ${isActive ? 'text-[#C8A96E]' : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'}`}
            >
              Timeline
            </NavLink>
            <NavLink 
              to="/gallery" 
              className={({ isActive }) => `font-bold font-body transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-2 rounded-md px-2 py-1 ${isActive ? 'text-[#C8A96E]' : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'}`}
            >
              Gallery
            </NavLink>
          </nav>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-800 light:hover:bg-slate-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-2"
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
