import React from 'react';

const Gallery = () => {
  const photos = [
    {
      src: '/voting.png',
      alt: 'Indian citizens lining up to vote at a polling booth using an EVM',
      caption: 'Citizens exercising their democratic right at a local polling station.',
    },
    {
      src: '/parliament.png',
      alt: 'The new Parliament building of India, Sansad Bhavan, under clear skies',
      caption: 'Sansad Bhavan: The seat of the Parliament of India in New Delhi.',
    },
    {
      src: '/evm_machine.png',
      alt: 'Close-up of an Indian Electronic Voting Machine (EVM) and VVPAT machine',
      caption: 'The EVM and VVPAT system ensures secure, verifiable voting.',
    },
    {
      src: '/inked_fingers.png',
      alt: 'Indian citizens proudly showing their ink-marked index fingers after voting',
      caption: 'The indelible ink mark: A proud symbol of civic participation.',
    }
  ];

  return (
    <main id="main-content" className="pb-24 pt-12" tabIndex="-1">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold font-heading text-[#C8A96E] mb-6">
          Election Gallery
        </h2>
        <p className="text-lg font-body text-slate-300 light:text-slate-600 mb-12 max-w-2xl">
          A visual journey through the world's largest democratic exercise and its institutions.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {photos.map((photo, index) => (
            <div 
              key={index} 
              className="glass-panel rounded-3xl overflow-hidden group border-slate-700/50 light:border-slate-300 hover:border-[#C8A96E]/50 transition-colors"
            >
              <div className="overflow-hidden">
                <img 
                  src={photo.src} 
                  alt={photo.alt} 
                  className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </div>
              <div className="p-6">
                <p className="font-body text-slate-300 light:text-slate-700 leading-relaxed">
                  {photo.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Gallery;
