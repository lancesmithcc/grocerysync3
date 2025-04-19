import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const emojis = [
  '🍇','🍈','🍉','🍊','🍋','🍋‍🟩','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🥜','🫘','🌰','🫚','🫛','🍄‍🟫','🍞','🥐','🥖','🫓','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥣','🥗','🍿','🧈','🧂','🥫','🍝','🍱','🍘','🍙','🍚','🍛','🍜','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯'
];

const FloatingEmojis: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll<HTMLElement>('.floating-emoji') ?? [];
    elements.forEach(el => {
      gsap.to(el, {
        y: -150 - Math.random() * 200,
        x: (Math.random() - 0.5) * window.innerWidth,
        duration: 10 + Math.random() * 5,
        repeat: -1,
        delay: Math.random() * 5,
        ease: 'sine.inOut'
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {emojis.map((emoji, idx) => (
        <div
          key={idx}
          className="floating-emoji text-2xl absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${100 + Math.random() * 50}%`
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingEmojis; 