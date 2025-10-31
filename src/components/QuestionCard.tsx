import { CheckCircle } from 'lucide-react';

interface QuestionCardProps {
  type: 'truth' | 'dare';
  question: string;
  onComplete: () => void;
  playerNickname: string;
}

export const QuestionCard = ({ type, question, onComplete, playerNickname }: QuestionCardProps) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className="relative backdrop-blur-md bg-white/10 rounded-3xl p-8 border border-white/20"
        style={{
          boxShadow: '0 8px 32px rgba(35, 25, 66, 0.3), 0 0 40px rgba(159, 134, 192, 0.2)',
        }}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-[#5e548e] to-[#be95c4] rounded-full">
          <span className="text-white font-bold uppercase tracking-wider">
            {type}
          </span>
        </div>

        <div className="mt-4 mb-6">
          <p className="text-white/60 text-sm text-center mb-2">
            {playerNickname}'s Turn
          </p>
          <p className="text-white text-xl text-center leading-relaxed">
            {question}
          </p>
        </div>

        <button
          onClick={onComplete}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9f86c0] to-[#e0b1cb]
                     text-white font-bold rounded-full hover:shadow-[0_0_25px_rgba(224,177,203,0.5)] transition-all"
        >
          <CheckCircle className="w-5 h-5" />
          Done!
        </button>
      </div>
    </div>
  );
};
