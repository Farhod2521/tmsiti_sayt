// components/SnowAnimation.jsx
import React, { useEffect, useState } from "react";

const SnowAnimation = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    // 120 ta turli xil qor parchasini yaratamiz
    const flakes = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: Math.random() * 5 + 8, // 8-13 sekund
      opacity: Math.random() * 0.7 + 0.3, // 0.3-1.0
      size: Math.random() * 8 + 4, // 4-12px
      animationDelay: Math.random() * 10, // 0-10 sekund
      blur: Math.random() * 1.5, // 0-1.5px blur
      shape: i % 5, // 5 xil shakl
    }));
    setSnowflakes(flakes);
  }, []);

  // Turli xil qor shakllari
  const SnowflakeShape = ({ shape, size }) => {
    const shapeStyle = { width: size, height: size };

    switch (shape) {
      case 0: // ❄️ Klassik 6 nurli kristal
        return (
          <svg viewBox="0 0 50 50" style={shapeStyle}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="25" cy="25" r="2.5" fill="#E3F2FD" opacity="1" filter="url(#glow)" />
            <line x1="25" y1="25" x2="25" y2="5" stroke="#B3E5FC" strokeWidth="2.5" opacity="1" filter="url(#glow)" />
            <line x1="25" y1="25" x2="25" y2="45" stroke="#B3E5FC" strokeWidth="2.5" opacity="1" filter="url(#glow)" />
            <line x1="25" y1="25" x2="7" y2="15" stroke="#B3E5FC" strokeWidth="2.5" opacity="1" filter="url(#glow)" />
            <line x1="25" y1="25" x2="43" y2="35" stroke="#B3E5FC" strokeWidth="2.5" opacity="1" filter="url(#glow)" />
            <line x1="25" y1="25" x2="7" y2="35" stroke="#B3E5FC" strokeWidth="2.5" opacity="1" filter="url(#glow)" />
            <line x1="25" y1="25" x2="43" y2="15" stroke="#B3E5FC" strokeWidth="2.5" opacity="1" filter="url(#glow)" />
            <line x1="25" y1="12" x2="20" y2="7" stroke="#81D4FA" strokeWidth="1.5" opacity="0.9" />
            <line x1="25" y1="12" x2="30" y2="7" stroke="#81D4FA" strokeWidth="1.5" opacity="0.9" />
            <line x1="25" y1="38" x2="20" y2="43" stroke="#81D4FA" strokeWidth="1.5" opacity="0.9" />
            <line x1="25" y1="38" x2="30" y2="43" stroke="#81D4FA" strokeWidth="1.5" opacity="0.9" />
            <circle cx="25" cy="25" r="10" fill="none" stroke="#4FC3F7" strokeWidth="0.8" opacity="0.6" />
          </svg>
        );

      case 1: // ❄️ Yulduz shakli
        return (
          <svg viewBox="0 0 50 50" style={shapeStyle}>
            <circle cx="25" cy="25" r="3" fill="white" opacity="1" />
            <polygon 
              points="25,8 28,20 40,20 30,27 33,39 25,32 17,39 20,27 10,20 22,20" 
              fill="white" 
              opacity="0.85"
              stroke="white"
              strokeWidth="0.5"
            />
            <circle cx="25" cy="25" r="6" fill="none" stroke="white" strokeWidth="0.8" opacity="0.5" />
          </svg>
        );

      case 2: // ❄️ Olti burchakli (honeycomb)
        return (
          <svg viewBox="0 0 50 50" style={shapeStyle}>
            <polygon 
              points="25,7 38,15 38,32 25,40 12,32 12,15" 
              fill="white" 
              opacity="0.8"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle cx="25" cy="25" r="5" fill="white" opacity="0.9" />
            <circle cx="25" cy="25" r="12" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
            <line x1="25" y1="12" x2="25" y2="38" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="14" y1="18" x2="36" y2="32" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="14" y1="32" x2="36" y2="18" stroke="white" strokeWidth="1" opacity="0.6" />
          </svg>
        );

      case 3: // ❄️ Murakkab kristal
        return (
          <svg viewBox="0 0 50 50" style={shapeStyle}>
            <circle cx="25" cy="25" r="3" fill="white" opacity="1" />
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <g key={i} transform={`rotate(${angle} 25 25)`}>
                <line x1="25" y1="25" x2="25" y2="8" stroke="white" strokeWidth="2" opacity="0.9" />
                <line x1="25" y1="16" x2="20" y2="11" stroke="white" strokeWidth="1.2" opacity="0.7" />
                <line x1="25" y1="16" x2="30" y2="11" stroke="white" strokeWidth="1.2" opacity="0.7" />
                <circle cx="25" cy="12" r="1.5" fill="white" opacity="0.8" />
              </g>
            ))}
            <circle cx="25" cy="25" r="8" fill="none" stroke="white" strokeWidth="0.5" opacity="0.4" />
          </svg>
        );

      case 4: // ❄️ Oddiy dumaloq qor parchasi
        return (
          <svg viewBox="0 0 50 50" style={shapeStyle}>
            <circle cx="25" cy="25" r="12" fill="white" opacity="0.85" />
            <circle cx="25" cy="25" r="8" fill="white" opacity="0.95" />
            <circle cx="25" cy="25" r="4" fill="white" opacity="1" />
            <circle cx="20" cy="20" r="2" fill="white" opacity="0.6" />
            <circle cx="30" cy="22" r="1.5" fill="white" opacity="0.5" />
            <circle cx="28" cy="30" r="2" fill="white" opacity="0.6" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 50 50" style={shapeStyle}>
            <circle cx="25" cy="25" r="10" fill="white" opacity="0.9" />
          </svg>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute will-change-transform"
            style={{
              left: `${flake.left}%`,
              animation: `snowfall-${flake.id % 4} ${flake.animationDuration}s linear infinite`,
              animationDelay: `${flake.animationDelay}s`,
              top: "-20px",
              filter: `blur(${flake.blur}px)`,
            }}
          >
            <div
              className="relative"
              style={{
                opacity: flake.opacity,
                animation: `rotate-snowflake-${flake.shape % 2} ${flake.animationDuration * 0.8}s linear infinite`,
              }}
            >
              <SnowflakeShape shape={flake.shape} size={flake.size} />
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes snowfall-0 {
          0% {
            transform: translateY(-20px) translateX(0px);
          }
          25% {
            transform: translateY(25vh) translateX(18px);
          }
          50% {
            transform: translateY(50vh) translateX(-22px);
          }
          75% {
            transform: translateY(75vh) translateX(12px);
          }
          100% {
            transform: translateY(105vh) translateX(0px);
          }
        }

        @keyframes snowfall-1 {
          0% {
            transform: translateY(-20px) translateX(0px);
          }
          30% {
            transform: translateY(30vh) translateX(-28px);
          }
          60% {
            transform: translateY(60vh) translateX(18px);
          }
          100% {
            transform: translateY(105vh) translateX(-8px);
          }
        }

        @keyframes snowfall-2 {
          0% {
            transform: translateY(-20px) translateX(0px);
          }
          20% {
            transform: translateY(20vh) translateX(25px);
          }
          40% {
            transform: translateY(40vh) translateX(-18px);
          }
          70% {
            transform: translateY(70vh) translateX(30px);
          }
          100% {
            transform: translateY(105vh) translateX(5px);
          }
        }

        @keyframes snowfall-3 {
          0% {
            transform: translateY(-20px) translateX(0px);
          }
          35% {
            transform: translateY(35vh) translateX(15px);
          }
          65% {
            transform: translateY(65vh) translateX(-25px);
          }
          100% {
            transform: translateY(105vh) translateX(0px);
          }
        }

        @keyframes rotate-snowflake-0 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes rotate-snowflake-1 {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        /* Performance optimization */
        .will-change-transform {
          will-change: transform;
        }
      `}</style>
    </>
  );
};

export default SnowAnimation;
