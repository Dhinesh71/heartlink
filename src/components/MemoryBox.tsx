import { Heart, Trophy, Sparkles } from 'lucide-react';
import type { GameRound, Player } from '../types/game';

interface MemoryBoxProps {
  rounds: GameRound[];
  players: Player[];
  heartLevel: number;
  onPlayAgain: () => void;
}

export const MemoryBox = ({ rounds, players, heartLevel, onPlayAgain }: MemoryBoxProps) => {
  const truthsCount = rounds.filter((r) => r.type === 'truth' && r.completed).length;
  const daresCount = rounds.filter((r) => r.type === 'dare' && r.completed).length;

  const getConnectionStatus = () => {
    if (heartLevel >= 80) return { text: 'Soulmates! 💕', color: '#e0b1cb' };
    if (heartLevel >= 60) return { text: 'Deep Connection ❤️', color: '#be95c4' };
    if (heartLevel >= 40) return { text: 'Growing Bond 💗', color: '#9f86c0' };
    if (heartLevel >= 20) return { text: 'Getting to Know Each Other 💜', color: '#5e548e' };
    return { text: 'New Friends 💙', color: '#231942' };
  };

  const status = getConnectionStatus();

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div
        className="backdrop-blur-md bg-white/10 rounded-3xl p-8 border border-white/20"
        style={{
          boxShadow: '0 8px 32px rgba(35, 25, 66, 0.4), 0 0 50px rgba(159, 134, 192, 0.3)',
        }}
      >
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#e0b1cb]" />
          <h2 className="text-3xl font-bold text-white mb-2">Memory Box</h2>
          <p className="text-white/60">Your HeartLink Journey</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
            <Trophy className="w-10 h-10 mx-auto mb-2 text-[#9f86c0]" />
            <div className="text-3xl font-bold text-white mb-1">{truthsCount}</div>
            <div className="text-sm text-white/60">Truths Shared</div>
          </div>

          <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
            <Heart className="w-10 h-10 mx-auto mb-2 text-[#e0b1cb]" />
            <div className="text-3xl font-bold text-white mb-1">{daresCount}</div>
            <div className="text-sm text-white/60">Dares Completed</div>
          </div>
        </div>

        <div className="text-center mb-8 p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
          <div className="text-sm text-white/60 mb-2">Final Connection Score</div>
          <div className="text-4xl font-bold mb-2" style={{ color: status.color }}>
            {heartLevel}%
          </div>
          <div className="text-lg text-white/80">{status.text}</div>
        </div>

        <div className="mb-8 p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
          <div className="text-sm text-white/60 mb-3 text-center">Players</div>
          <div className="flex justify-center gap-8">
            {players.map((player) => (
              <div key={player.id} className="text-center">
                <div className="text-4xl mb-2">{player.avatar}</div>
                <div className="text-white font-medium">{player.nickname}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-4 bg-gradient-to-r from-[#5e548e] to-[#be95c4] text-white font-bold text-lg rounded-full
                     hover:shadow-[0_0_30px_rgba(159,134,192,0.6)] transition-all"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
