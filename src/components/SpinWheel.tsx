import { useState } from 'react';

interface SpinWheelProps {
  onResult: (result: 'truth' | 'dare') => void;
  disabled?: boolean;
}

export const SpinWheel = ({ onResult, disabled }: SpinWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (spinning || disabled) return;

    setSpinning(true);

    const result = Math.random() < 0.5 ? 'truth' : 'dare';
    const spins = 5 + Math.random() * 3;
    const extraRotation = result === 'truth' ? 0 : 180;
    const finalRotation = rotation + spins * 360 + extraRotation;

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      onResult(result);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8">
      <div className="relative w-48 h-48 sm:w-64 sm:h-64">
        <div
          className="w-full h-full rounded-full border-4 border-[#9f86c0] relative overflow-hidden transition-transform duration-[3000ms] ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: 'linear-gradient(180deg, #5e548e 0%, #5e548e 50%, #be95c4 50%, #be95c4 100%)',
            boxShadow: '0 0 40px rgba(159, 134, 192, 0.6), inset 0 0 40px rgba(35, 25, 66, 0.4)',
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-white/30"></div>
          <div className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 text-white font-bold text-lg sm:text-2xl">
            TRUTH
          </div>
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 text-white font-bold text-lg sm:text-2xl">
            DARE
          </div>
        </div>
        <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-transparent border-r-[12px] sm:border-r-[16px] border-r-transparent border-t-[18px] sm:border-t-[24px] border-t-[#e0b1cb] z-10"></div>
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning || disabled}
        className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#5e548e] to-[#be95c4] text-white font-bold text-lg sm:text-xl rounded-full
                   shadow-lg hover:shadow-[0_0_30px_rgba(159,134,192,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {spinning ? 'Spinning...' : 'Spin the Wheel!'}
      </button>
    </div>
  );
};
