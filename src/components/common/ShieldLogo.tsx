import React from 'react';

interface ShieldLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({
  className = '',
  size = 36,
  showText = true,
  textColor = 'text-slate-900',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Outer Shield Background */}
          <path
            d="M24 4L8 10V22C8 32.5 14.8 42.1 24 44C33.2 42.1 40 32.5 40 22V10L24 4Z"
            className="fill-emerald-950 stroke-emerald-600/50"
            strokeWidth="1.5"
          />
          {/* Inner Guard Infill */}
          <path
            d="M24 7L11 12V22C11 30.5 16.5 38.3 24 40.5C31.5 38.3 37 30.5 37 22V12L24 7Z"
            fill="url(#shieldGrad)"
          />
          {/* Upward Financial Trend Arrow & Currency Line */}
          <path
            d="M17 28L22 23L26 27L32 17"
            stroke="#34D399"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27 17H32V22"
            stroke="#34D399"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Small Defense Point Dot */}
          <circle cx="24" cy="34" r="2" fill="#6EE7B7" />

          <defs>
            <linearGradient id="shieldGrad" x1="24" y1="7" x2="24" y2="41" gradientUnits="userSpaceOnUse">
              <stop stopColor="#064E3B" />
              <stop offset="1" stopColor="#022C22" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`text-xl font-extrabold tracking-tight font-sans ${textColor}`}>
              Biz<span className="text-emerald-600">Guard</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Pro
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">
            Business Survival Platform
          </span>
        </div>
      )}
    </div>
  );
};
