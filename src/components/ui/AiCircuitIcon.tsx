import React from 'react';

export const AiCircuitIcon = ({ className }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <style>{`
        .circuit-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: flow 3s linear infinite;
        }
        .circuit-path-delayed {
            animation-delay: 1.5s;
        }
        @keyframes flow {
          0% { stroke-dashoffset: 100; opacity: 0; }
          10% { opacity: 1; }
          90% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        .chip-glow {
            animation: glow-pulse 2s ease-in-out infinite alternate;
        }
        @keyframes glow-pulse {
            from { filter: drop-shadow(0 0 2px rgba(99, 102, 241, 0.5)); }
            to { filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.8)); }
        }
        .energy-ring {
            transform-origin: center;
            animation: spin 4s linear infinite;
        }
        .pulse-ring {
            transform-origin: center;
            animation: pulse-ring-anim 3s ease-out infinite;
            opacity: 0;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring-anim {
            0% { transform: scale(0.8); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>
      
      {/* rotating Energy Ring */}
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c7d2fe" stopOpacity="1" />
        </linearGradient>
      </defs>
      
      {/* Outer Pulse Ring */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="#6366f1" strokeWidth="1" className="pulse-ring" />
      
      {/* Rotating Gradient Ring */}
      <circle cx="100" cy="100" r="88" fill="none" stroke="url(#ringGradient)" strokeWidth="2" strokeLinecap="round" className="energy-ring" strokeDasharray="400 150" />

      {/* Central Chip Body */}
      <rect x="60" y="60" width="80" height="80" rx="16" fill="#1e1b4b" stroke="#818cf8" strokeWidth="3" className="chip-glow" />
      <rect x="70" y="70" width="60" height="60" rx="8" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.5" />
      
      {/* AI Text */}
      <text x="100" y="115" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="white" textAnchor="middle" letterSpacing="2">AI</text>

      {/* Top Circuits */}
      <g stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
        <path d="M75 60 V 45" fill="none" />
        <path d="M90 60 V 45" fill="none" />
        <path d="M110 60 V 45" fill="none" />
        <path d="M125 60 V 45" fill="none" />
        
        {/* Animated Overlays Top */}
        <path d="M75 60 V 45" stroke="#a5b4fc" className="circuit-path" />
        <path d="M90 60 V 45" stroke="#a5b4fc" className="circuit-path circuit-path-delayed" />
        <path d="M110 60 V 45" stroke="#a5b4fc" className="circuit-path" />
        <path d="M125 60 V 45" stroke="#a5b4fc" className="circuit-path circuit-path-delayed" />
        
        {/* Terminals Top */}
        <circle cx="75" cy="45" r="2" fill="#818cf8" />
        <circle cx="90" cy="45" r="2" fill="#818cf8" />
        <circle cx="110" cy="45" r="2" fill="#818cf8" />
        <circle cx="125" cy="45" r="2" fill="#818cf8" />
      </g>

      {/* Bottom Circuits */}
      <g stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
        <path d="M75 140 V 155" fill="none" />
        <path d="M90 140 V 155" fill="none" />
        <path d="M110 140 V 155" fill="none" />
        <path d="M125 140 V 155" fill="none" />

         {/* Animated Overlays Bottom */}
        <path d="M75 140 V 155" stroke="#a5b4fc" className="circuit-path circuit-path-delayed" />
        <path d="M90 140 V 155" stroke="#a5b4fc" className="circuit-path" />
        <path d="M110 140 V 155" stroke="#a5b4fc" className="circuit-path circuit-path-delayed" />
        <path d="M125 140 V 155" stroke="#a5b4fc" className="circuit-path" />

        {/* Terminals Bottom */}
        <circle cx="75" cy="155" r="2" fill="#818cf8" />
        <circle cx="90" cy="155" r="2" fill="#818cf8" />
        <circle cx="110" cy="155" r="2" fill="#818cf8" />
        <circle cx="125" cy="155" r="2" fill="#818cf8" />
      </g>

      {/* Left Circuits */}
      <g stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
        <path d="M60 75 H 45" fill="none" />
        <path d="M60 90 H 45" fill="none" />
        <path d="M60 110 H 45" fill="none" />
        <path d="M60 125 H 45" fill="none" />

         {/* Animated Overlays Left */}
        <path d="M60 75 H 45" stroke="#a5b4fc" className="circuit-path" />
        <path d="M60 90 H 45" stroke="#a5b4fc" className="circuit-path circuit-path-delayed" />
        <path d="M60 110 H 45" stroke="#a5b4fc" className="circuit-path" />
        <path d="M60 125 H 45" stroke="#a5b4fc" className="circuit-path circuit-path-delayed" />

        {/* Terminals Left */}
        <circle cx="45" cy="75" r="2" fill="#818cf8" />
        <circle cx="45" cy="90" r="2" fill="#818cf8" />
        <circle cx="45" cy="110" r="2" fill="#818cf8" />
        <circle cx="45" cy="125" r="2" fill="#818cf8" />
      </g>

      {/* Right Circuits */}
      <g stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
        <path d="M140 75 H 155" fill="none" />
        <path d="M140 90 H 155" fill="none" />
        <path d="M140 110 H 155" fill="none" />
        <path d="M140 125 H 155" fill="none" />
        
        {/* Animated Overlays Right */}
        <path d="M140 75 H 155" stroke="#a5b4fc" className="circuit-path circuit-path-delayed" />
        <path d="M140 90 H 155" stroke="#a5b4fc" className="circuit-path" />
        <path d="M140 110 H 155" stroke="#a5b4fc" className="circuit-path circuit-path-delayed" />
        <path d="M140 125 H 155" stroke="#a5b4fc" className="circuit-path" />

        {/* Terminals Right */}
        <circle cx="155" cy="75" r="2" fill="#818cf8" />
        <circle cx="155" cy="90" r="2" fill="#818cf8" />
        <circle cx="155" cy="110" r="2" fill="#818cf8" />
        <circle cx="155" cy="125" r="2" fill="#818cf8" />
      </g>
    </svg>
  );
};
