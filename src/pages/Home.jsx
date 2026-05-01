import React from 'react';
import Hero from '../components/Hero';
import Timeline from '../components/Timeline';
import Chat from '../components/Chat';
import Quiz from '../components/Quiz';

const Home = ({ exploredStages, setExploredStages, activeStageId, setActiveStageId }) => {
  return (
    <main id="main-content" className="pb-24" tabIndex="-1">
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
  );
};

export default Home;
