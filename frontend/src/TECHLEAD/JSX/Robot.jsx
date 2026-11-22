
import React from "react";

const Robot = () => {
  return (
    <div className="tl-robot-scene">
      <svg
        className="tl-robot-svg"
        viewBox="0 0 240 230"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="robotBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B7BFF" />
            <stop offset="100%" stopColor="#4232A5" />
          </linearGradient>

          <linearGradient id="robotScreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#36E9FF" />
            <stop offset="100%" stopColor="#286BFF" />
          </linearGradient>

          <filter id="robotGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Antenna */}
        <path
          d="M120 25 V12"
          stroke="#55E8FF"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="120" cy="9" r="6" fill="#55E8FF" filter="url(#robotGlow)" />

        {/* Head */}
        <rect
          x="77"
          y="28"
          width="86"
          height="69"
          rx="25"
          fill="url(#robotBody)"
          stroke="#B5A0FF"
          strokeWidth="2"
        />

        {/* Face */}
        <rect x="88" y="41" width="64" height="42" rx="15" fill="#111D42" />

        {/* Eyes */}
        <ellipse cx="106" cy="60" rx="6" ry="8" fill="#50E9FF" filter="url(#robotGlow)" />
        <ellipse cx="134" cy="60" rx="6" ry="8" fill="#50E9FF" filter="url(#robotGlow)" />

        {/* Smile */}
        <path
          d="M108 72 Q120 81 132 72"
          fill="none"
          stroke="#50E9FF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Body */}
        <path
          d="M83 103 Q120 88 157 103 L165 160 Q120 179 75 160 Z"
          fill="url(#robotBody)"
          stroke="#A994FF"
          strokeWidth="2"
        />

        {/* Chest light */}
        <circle cx="120" cy="121" r="8" fill="#50E9FF" filter="url(#robotGlow)" />

        {/* Left arm */}
        <path
          d="M82 111 Q58 115 54 145"
          fill="none"
          stroke="#8B72EE"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <circle cx="54" cy="148" r="9" fill="#B29DFF" />

        {/* Right arm */}
        <path
          d="M158 111 Q181 116 185 145"
          fill="none"
          stroke="#8B72EE"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <circle cx="185" cy="148" r="9" fill="#B29DFF" />

        {/* Laptop */}
        <path
          d="M77 142 L163 142 L177 188 L63 188 Z"
          fill="#172B50"
          stroke="#48DFFF"
          strokeWidth="2"
        />
        <rect x="86" y="148" width="68" height="30" rx="4" fill="#0B1933" />
        <path
          d="M93 157 H145 M93 164 H132 M93 171 H139"
          stroke="url(#robotScreen)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M63 188 H177 L166 195 H74 Z"
          fill="#55DFFF"
        />

        {/* Legs */}
        <path d="M99 165 L96 197" stroke="#7963D8" strokeWidth="12" strokeLinecap="round" />
        <path d="M141 165 L144 197" stroke="#7963D8" strokeWidth="12" strokeLinecap="round" />

        {/* Feet */}
        <ellipse cx="91" cy="201" rx="18" ry="8" fill="#5543B6" />
        <ellipse cx="149" cy="201" rx="18" ry="8" fill="#5543B6" />
      </svg>

      <div className="robot-ground-glow"></div>
    </div>
  );
};

export default Robot;
