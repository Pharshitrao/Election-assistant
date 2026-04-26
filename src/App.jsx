import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import Chat from './components/Chat';
import Quiz from './components/Quiz';
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
        
        <main className="pb-24">
          <Hero />
          
          <div id="timeline">
            <Timeline 
              exploredStages={exploredStages} 
              setExploredStages={setExploredStages}
              activeStageId={activeStageId}
              setActiveStageId={setActiveStageId}
            />
          </div>

          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 my-12">
            <Chat setActiveStageId={setActiveStageId} />
            <Quiz />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
