import { ScrollText } from 'lucide-react';
import type { GameRound } from '../types/game';

interface HistoryBoxProps {
  rounds: GameRound[];
}

export const HistoryBox = ({ rounds }: HistoryBoxProps) => {
  return (
    <div className="hidden lg:block absolute right-4 top-4 bottom-4 w-72 backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-white/60" />
          <h3 className="text-white font-medium">History</h3>
        </div>
      </div>
      <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
        {rounds.map((round) => (
          <div
            key={round.id}
            className="mb-4 last:mb-0 p-4 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                round.type === 'truth' ? 'bg-[#5e548e]' : 'bg-[#be95c4]'
              }`}>
                {round.type.toUpperCase()}
              </span>
              <span className="text-white/60 text-sm">Round {round.round_number}</span>
            </div>
            <p className="text-white/90 text-sm mb-2">{round.question}</p>
            {round.answer && (
              <p className="text-white/60 text-sm italic">
                Answer: {round.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};