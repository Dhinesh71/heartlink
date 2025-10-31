import { Heart } from 'lucide-react';

interface HeartMeterProps {
  level: number;
}

export const HeartMeter = ({ level }: HeartMeterProps) => {
  return (
    <div className="w-full max-w-md mx-auto px-2 sm:px-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/80 text-xs sm:text-sm font-medium">Connection Level</span>
        <span className="text-[#e0b1cb] text-xs sm:text-sm font-bold">{level}%</span>
      </div>

      <div className="relative w-full h-5 sm:h-6 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full"
          style={{
            width: `${level}%`,
            background: 'linear-gradient(90deg, #5e548e, #9f86c0, #be95c4, #e0b1cb)',
            boxShadow: '0 0 20px rgba(224, 177, 203, 0.6)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>

      <div className="flex items-center justify-center mt-3 sm:mt-4 gap-1.5 sm:gap-2">
        {[...Array(5)].map((_, i) => (
          <Heart
            key={i}
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 ${
              level >= (i + 1) * 20
                ? 'fill-[#e0b1cb] text-[#e0b1cb] scale-110'
                : 'text-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
