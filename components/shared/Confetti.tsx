'use client';

import confetti from 'canvas-confetti';

import React from 'react';

interface Props {
  className?: string;
}

export const Confetti: React.FC<Props> = ({ className }) => {
  const handleConfetti = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ['#d30000', '#000080'];
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });
      requestAnimationFrame(frame);
    };
    frame();
  };

  React.useEffect(() => {
    handleConfetti();
  }, []);

  return <div className={className}></div>;
};
