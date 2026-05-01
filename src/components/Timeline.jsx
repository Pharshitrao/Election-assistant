import React, { useState, useEffect, useRef } from 'react';
import { timelineData } from '../data/timelineData';

const Timeline = ({ exploredStages, setExploredStages, activeStageId, setActiveStageId }) => {
  const [currentStageId, setCurrentStageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    // Current date indicator logic (Hardcoded to April 2026 for demo)
    setCurrentStageId('stage-1');
  }, []);

  const handleCardClick = (id) => {
    setActiveStageId(activeStageId === id ? null : id);
    
    if (!exploredStages.includes(id)) {
      setExploredStages([...exploredStages, id]);
    }

    if (activeStageId !== id) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  // Listen for external activeStageId changes (e.g. from Chat links) to trigger scroll
  useEffect(() => {
    if (activeStageId) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  }, [activeStageId]);

  const filteredTimeline = timelineData.filter(stage => {
    const query = searchQuery.toLowerCase();
    return (
      stage.title.toLowerCase().includes(query) ||
      stage.description.toLowerCase().includes(query) ||
      stage.bulletPoints.some(bp => bp.toLowerCase().includes(query))
    );
  });

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-heading font-bold text-[#C8A96E]">The Election Timeline</h2>
          <p className="text-slate-400 light:text-slate-500 mt-2">Follow the path to the presidency.</p>
        </div>
        
        {/* Glassmorphic Search Bar */}
        <div className="relative w-full md:w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <label htmlFor="timeline-search" className="sr-only">Search timeline stages</label>
          <input
            id="timeline-search"
            type="text"
            placeholder="Search stages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/40 light:bg-white/40 backdrop-blur-md border border-slate-700 light:border-slate-300 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-[#C8A96E] focus-visible:ring-2 focus-visible:ring-[#C8A96E] transition-colors"
          />
        </div>
      </div>
      
      {filteredTimeline.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No stages found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {filteredTimeline.map((stage, index) => {
            const isExpanded = activeStageId === stage.id;
            const isCurrent = currentStageId === stage.id;
            
            return (
              <div 
                key={stage.id}
                className="relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {isCurrent && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#C8A96E] text-[#0E1117] text-xs font-bold py-1 px-3 rounded-full shadow-[0_0_15px_rgba(200,169,110,0.5)] z-10 animate-bounce">
                    You are here
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#C8A96E] rotate-45"></div>
                  </div>
                )}

                <button
                  id={`stage-btn-${stage.id}`}
                  aria-expanded={isExpanded}
                  aria-controls={isExpanded ? "stage-detail-panel" : undefined}
                  aria-label={`Stage ${stage.stageNumber}: ${stage.title}`}
                  onClick={() => handleCardClick(stage.id)}
                  className={`w-full h-full p-0 rounded-2xl text-left transition-all duration-300 border group animate-[fade-slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 overflow-hidden relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-4
                    ${isExpanded 
                      ? 'border-[#C8A96E] shadow-[0_0_20px_rgba(200,169,110,0.3)]' 
                      : 'border-slate-700/50 light:border-slate-300 hover:border-[#C8A96E]/50 hover:-translate-y-2'
                    }
                  `}
                  style={{ '--glow-color': `${stage.accentColor}80` }}
                >
                  {/* Background gradient instead of image */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 light:from-slate-100 light:to-white transition-opacity ${isExpanded ? 'opacity-90' : 'opacity-70 group-hover:opacity-90'}`}></div>
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                       style={{ boxShadow: `inset 0 0 20px 0px ${stage.accentColor}40` }}></div>

                  <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-4xl mb-3 drop-shadow-md">{stage.emoji}</div>
                      <div className="text-[10px] font-bold text-slate-400 light:text-slate-500 mb-1 tracking-wider">STAGE {stage.stageNumber}</div>
                      <h3 className="font-heading font-bold text-lg leading-tight mb-2 text-white light:text-slate-900">{stage.title}</h3>
                    </div>
                    <div className="text-xs font-bold" style={{ color: stage.accentColor }}>{stage.timePeriod}</div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Panel */}
      <div 
        ref={panelRef}
        className={`mt-8 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          activeStageId ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {activeStageId && (() => {
          const stage = timelineData.find(s => s.id === activeStageId);
          if (!stage) return null;

          return (
            <div id="stage-detail-panel" className="glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden" role="region" aria-labelledby={`stage-btn-${stage.id}`}>
              <div 
                className="absolute top-0 left-0 w-2 h-full"
                style={{ backgroundColor: stage.accentColor }}
              ></div>
              
              <div className="md:flex gap-10">
                <div className="md:w-5/12 mb-8 md:mb-0">
                  <div className="text-5xl mb-6 drop-shadow-lg">{stage.emoji}</div>
                  <h3 className="text-4xl font-heading font-bold mb-4" style={{ color: stage.accentColor }}>{stage.title}</h3>
                  <p className="text-lg font-body text-slate-300 light:text-slate-600 leading-relaxed">
                    {stage.description}
                  </p>
                </div>
                
                <div className="md:w-7/12 flex flex-col justify-center">
                  <div className="bg-slate-900/50 light:bg-slate-100/50 p-6 rounded-2xl border border-slate-700/50 light:border-slate-300">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Key Activities</h4>
                    <ul className="space-y-4">
                      {stage.bulletPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start">
                          <div 
                            className="w-3 h-3 rounded-sm mt-1.5 mr-4 flex-shrink-0"
                            style={{ backgroundColor: stage.accentColor }}
                          ></div>
                          <span className="font-body text-slate-200 light:text-slate-800 leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};

export default Timeline;
