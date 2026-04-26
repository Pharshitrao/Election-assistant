import React from 'react';
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
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-[#C8A96E]">
            Indian Election Assistant
          </h1>
          <p className="text-sm text-slate-400 light:text-slate-500 mt-1 font-body">
            Explore {exploredCount} of {totalStages} stages
          </p>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-800 light:hover:bg-slate-200 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Header;
