import React from 'react';

interface AuroraBoxProps { 
  children: React.ReactNode; 
  className?: string;
  padding?: string;
}

const AuroraBox: React.FC<AuroraBoxProps> = ({ children, className = '', padding = 'p-6' }) => (
  <div className={`relative ${className}`}>
    {/* Aurora Borealis style border gradient - updating to match example image */}
    <div className="absolute -inset-[2px] bg-gradient-to-br from-purple via-[#3CAAFF] to-[#4ade80] rounded-aurora pointer-events-none"></div>
    
    {/* Pure black container with slight inset from the gradient border */}
    <div className={`relative bg-black m-[1px] ${padding} border border-[#333] rounded-aurora text-left`}>
      {children}
    </div>
  </div>
);

export default AuroraBox;
