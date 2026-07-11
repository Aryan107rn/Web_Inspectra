import React, { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  label: string;
  subtitle?: string;
  size?: number;
}

export default function ScoreGauge({ score, label, subtitle, size = 120 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  const getThemeColor = (s: number) => {
    if (s >= 90) return {
      stroke: "stroke-emerald-500",
      glow: "shadow-emerald-500/20",
      text: "text-emerald-400",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20"
    };
    if (s >= 50) return {
      stroke: "stroke-amber-500",
      glow: "shadow-amber-500/20",
      text: "text-amber-400",
      bg: "bg-amber-500/5",
      border: "border-amber-500/20"
    };
    return {
      stroke: "stroke-rose-500",
      glow: "shadow-rose-500/20",
      text: "text-rose-400",
      bg: "bg-rose-500/5",
      border: "border-rose-500/20"
    };
  };

  const theme = getThemeColor(animatedScore);
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={`flex flex-col items-center p-5 rounded-2xl bg-zinc-900/50 border backdrop-blur-md transition-all duration-500 hover:border-zinc-700/50 ${theme.border} ${theme.bg} shadow-lg`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90 select-none">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-zinc-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`transition-all duration-1000 ease-out fill-transparent ${theme.stroke}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 ${size * 0.06}px currentColor)`
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
          <span className={`text-3xl font-black tracking-tight ${theme.text}`}>
            {Math.round(animatedScore)}
          </span>
          <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-0.5">
            score
          </span>
        </div>
      </div>

      <span className="text-zinc-200 font-bold text-sm mt-4 select-none tracking-wide">
        {label}
      </span>
      {subtitle && (
        <span className="text-zinc-500 text-xs text-center mt-1 select-none font-medium">
          {subtitle}
        </span>
      )}
    </div>
  );
}
