import React from 'react';

const Hero = () => {
  return (
    <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Dynamic Gradient Background instead of image due to API limits */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0a192f] to-[#112240] light:from-slate-100 light:via-blue-50 light:to-slate-200"></div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF9933] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#138808] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[#000080] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 text-center px-4 max-w-4xl glass-panel p-12 rounded-3xl mx-4">
        <div className="inline-block mb-4 px-4 py-1 rounded-full bg-[#C8A96E]/20 border border-[#C8A96E]/50 text-[#C8A96E] font-bold text-sm tracking-widest uppercase">
          Interactive Guide
        </div>
        <h2 className="text-5xl md:text-7xl font-bold font-heading mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 light:from-slate-900 light:to-slate-600 drop-shadow-sm">
          The Indian <br/> Election Journey
        </h2>
        <p className="text-lg md:text-xl font-body text-slate-300 light:text-slate-600 mb-8 max-w-2xl mx-auto">
          Explore the step-by-step process of how India elects its Lok Sabha members. Test your knowledge or ask our AI Assistant any questions.
        </p>
        
        <button 
          onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-[#C8A96E] hover:bg-[#b0935d] text-slate-900 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(200,169,110,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-4"
        >
          Start Exploring
        </button>
      </div>
    </section>
  );
};

export default Hero;
