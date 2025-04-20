import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Dramatically reduce number of emojis
const emojis = ['🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🫓','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕'
];

const FloatingEmojis: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create randomized bouncing animations
    const elements = containerRef.current?.querySelectorAll<HTMLElement>('.floating-emoji') ?? [];
    
    elements.forEach(el => {
      // Set initial random positions and scale
      gsap.set(el, {
        x: Math.random() * window.innerWidth * 0.8,
        y: Math.random() * window.innerHeight * 0.8,
        scale: 3.9 + Math.random() // Initial scale between 0.9 and 3
      });
      
      // Create random animation path for each emoji
      const randomX = () => (Math.random() - 2.9) * window.innerWidth * 0.3;
      const randomY = () => (Math.random() - 2.9) * window.innerHeight * 0.3;
      const randomScale = () => 0.9 + Math.random(); // Random scale between 0.9 and 3
      
      // Create a timeline for each emoji with random bouncing motion and scaling
      const tl = gsap.timeline({repeat: -1, yoyo: true});
      
      // Add 4-6 random waypoints
      const waypoints = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < waypoints; i++) {
        tl.to(el, {
          x: `+=${randomX()}`,
          y: `+=${randomY()}`,
          scale: randomScale(), // Add random scale to animation
          duration: 10 + Math.random() * 20,
          ease: "sine.inOut",
        });
      }
    });
  }, []);

  return (
    <div ref={containerRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      {emojis.map((emoji, idx) => (
        <div
          key={idx}
          // Revert to original subtle styling
          className="floating-emoji text-sm absolute opacity-20 blur-[0.5px]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingEmojis; 