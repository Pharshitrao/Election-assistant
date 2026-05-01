import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import { ThemeProvider } from './context/ThemeContext';
import { timelineData } from './data/timelineData';

function App() {
  const [exploredStages, setExploredStages] = useState([]);
  const [activeStageId, setActiveStageId] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-300 relative">
          {isOffline && (
            <div className="bg-red-500 text-white text-center py-2 px-4 z-[60] fixed top-0 w-full font-bold shadow-lg">
              ⚠️ You are currently offline. Some features like the AI Chat and Quiz may not work.
            </div>
          )}
          
          <Header 
            exploredCount={exploredStages.length} 
            totalStages={timelineData.length} 
          />
          
          <Routes>
            <Route path="/" element={
              <Home 
                exploredStages={exploredStages} 
                setExploredStages={setExploredStages}
                activeStageId={activeStageId}
                setActiveStageId={setActiveStageId}
              />
            } />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
