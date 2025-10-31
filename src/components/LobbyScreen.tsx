import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Player, GameMode } from '../types/game';
import { subscribeToRoom } from '../services/roomService';

interface LobbyScreenProps {
  roomCode: string;
  players: Player[];
  currentPlayer: Player;
  onStartGame: (mode: GameMode) => void;
}

export const LobbyScreen = ({ roomCode, players: initialPlayers, currentPlayer, onStartGame }: LobbyScreenProps) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('friendly');
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState(initialPlayers);
  const isCreator = currentPlayer.is_creator;

  useEffect(() => {
    // Subscribe to room updates when component mounts
    let unsubscribe: (() => void) | undefined;
    
    const setupSubscription = async () => {
      // Get the room ID from the first player (current player)
      const roomId = currentPlayer.room_id;
      
      unsubscribe = await subscribeToRoom(
        roomId,
        (updatedPlayers) => {
          setPlayers(updatedPlayers);
        }
      );
    };

    setupSubscription();

    // Cleanup subscription when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentPlayer.room_id]);

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
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Waiting Room</h2>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-white/60 text-sm">Room Code:</span>
            <span className="text-white font-bold text-lg tracking-wider">{roomCode}</span>
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
          className="backdrop-blur-md bg-white/10 rounded-3xl p-8 border border-white/20 mb-6"
          style={{
            boxShadow: '0 8px 32px rgba(35, 25, 66, 0.3), 0 0 40px rgba(159, 134, 192, 0.2)',
          }}
        >
          <div className="mb-8">
            <h3 className="text-white text-lg font-medium mb-4 text-center">Players ({players.length}/2)</h3>
            <div className="flex justify-center gap-8">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl backdrop-blur-sm"
                >
                  <div className="text-5xl">{player.avatar}</div>
                  <div className="text-white font-medium">{player.nickname}</div>
                  {player.is_creator && (
                    <div className="text-xs text-[#9f86c0] bg-[#9f86c0]/20 px-2 py-1 rounded-full">
                      Host
                    </div>
                  )}
                </div>
              ))}
              {players.length < 2 && (
                <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-2xl w-32">
                  <div className="text-5xl text-white/20">?</div>
                  <div className="text-white/40 text-sm">Waiting...</div>
                </div>
              )}
            </div>
          </div>

          {isCreator && players.length === 2 && (
            <div>
              <h3 className="text-white text-lg font-medium mb-4 text-center">Choose Game Mode</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-4 rounded-2xl transition-all ${
                      selectedMode === mode.id
                        ? 'bg-white/20 border-2 border-white/40 scale-105'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="text-4xl mb-2">{mode.icon}</div>
                    <div className="text-white font-medium">{mode.name}</div>
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

          {!isCreator && players.length === 2 && (
            <div className="text-center text-white/60">
              Waiting for host to start the game...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
