import React from 'react';

interface AuroraBoxProps { children: React.ReactNode; className?: string; }

const AuroraBox: React.FC<AuroraBoxProps> = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="absolute -inset-1 bg-purple blur-md animate-aurora-pulse rounded-aurora pointer-events-none"></div>
    <div className="relative bg-background p-4 rounded-aurora">
      {children}
    </div>
  </div>
);

export default AuroraBox;
