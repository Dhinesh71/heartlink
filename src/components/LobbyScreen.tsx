import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Player, GameMode } from '../types/game';

interface LobbyScreenProps {
  roomCode: string;
  players: Player[];
  currentPlayer: Player;
  onStartGame: (mode: GameMode) => void;
}

export const LobbyScreen = ({ roomCode, players, currentPlayer, onStartGame }: LobbyScreenProps) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('friendly');
  const [copied, setCopied] = useState(false);
  const isCreator = currentPlayer.is_creator;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modes = [
    { id: 'friendly' as GameMode, name: 'Friendly', icon: '💬', color: '#9f86c0' },
    { id: 'crush' as GameMode, name: 'Crush', icon: '❤️', color: '#e0b1cb' },
    { id: 'bold' as GameMode, name: 'Bold', icon: '🔥', color: '#be95c4' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Waiting Room</h2>
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-white/60 text-xs sm:text-sm">Room Code:</span>
            <span className="text-white font-bold text-base sm:text-lg tracking-wider">{roomCode}</span>
            <button
              onClick={handleCopyCode}
              className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-white/60" />
              )}
            </button>
          </div>
        </div>

        <div
          className="backdrop-blur-md bg-white/10 rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 mb-6"
          style={{
            boxShadow: '0 8px 32px rgba(35, 25, 66, 0.3), 0 0 40px rgba(159, 134, 192, 0.2)',
          }}
        >
          <div className="mb-6 sm:mb-8">
            <h3 className="text-white text-base sm:text-lg font-medium mb-4 text-center">Players ({players.length}/2)</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl backdrop-blur-sm w-full sm:w-auto max-w-[200px]"
                >
                  <div className="text-4xl sm:text-5xl">{player.avatar}</div>
                  <div className="text-white font-medium text-sm sm:text-base">{player.nickname}</div>
                  {player.is_creator && (
                    <div className="text-xs text-[#9f86c0] bg-[#9f86c0]/20 px-2 py-1 rounded-full">
                      Host
                    </div>
                  )}
                </div>
              ))}
              {players.length < 2 && (
                <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-2xl w-full sm:w-32 max-w-[200px]">
                  <div className="text-4xl sm:text-5xl text-white/20">?</div>
                  <div className="text-white/40 text-sm">Waiting...</div>
                </div>
              )}
            </div>
          </div>

          {isCreator && players.length === 2 && (
            <div>
              <h3 className="text-white text-base sm:text-lg font-medium mb-4 text-center">Choose Game Mode</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-3 sm:p-4 rounded-2xl transition-all ${
                      selectedMode === mode.id
                        ? 'bg-white/20 border-2 border-white/40 scale-105'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">{mode.icon}</div>
                    <div className="text-white font-medium text-sm sm:text-base">{mode.name}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => onStartGame(selectedMode)}
                className="w-full py-4 bg-gradient-to-r from-[#5e548e] to-[#be95c4] text-white font-bold text-lg rounded-full
                           hover:shadow-[0_0_30px_rgba(159,134,192,0.6)] transition-all"
              >
                Start Game
              </button>
            </div>
          )}

          {!isCreator && (
            <div className="text-center text-white/60">
              {players.length === 2
                ? 'Waiting for host to start the game...'
                : 'Waiting for host to arrive...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
