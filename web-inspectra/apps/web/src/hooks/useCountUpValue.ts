"use client";

import { useEffect, useState } from "react";
import { useReducedMotionPreference } from "./useReducedMotionPreference";

/** Animates a number from 0 to `targetValue` for score/metric displays. */
export function useCountUpValue(targetValue: number, durationMs = 900): number {
  const prefersReducedMotion = useReducedMotionPreference();
  const [displayValue, setDisplayValue] = useState(prefersReducedMotion ? targetValue : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(targetValue);
      return;
    }

    let animationFrameId: number;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * targetValue));
      if (progress < 1) animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, durationMs, prefersReducedMotion]);

  return displayValue;
}
