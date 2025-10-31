import { useState } from 'react';
import { Heart, Users, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onCreateRoom: () => Promise<void>;
  onJoinRoom: (roomCode: string) => Promise<void>;
}

export const WelcomeScreen = ({ onCreateRoom, onJoinRoom }: WelcomeScreenProps) => {
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (roomCode.trim().length === 6) {
      setIsLoading(true);
      await onJoinRoom(roomCode.toUpperCase());
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);
    await onCreateRoom();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-[#e0b1cb] fill-[#e0b1cb] animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">HeartLink</h1>
          <p className="text-[#be95c4] text-lg">Truth or Dare for Hearts</p>
        </div>

        <div
          className="backdrop-blur-md bg-white/10 rounded-3xl p-8 border border-white/20 mb-6"
          style={{
            boxShadow: '0 8px 32px rgba(35, 25, 66, 0.3), 0 0 40px rgba(159, 134, 192, 0.2)',
          }}
        >
          {!isJoining ? (
            <div className="space-y-4">
              <button
                onClick={handleCreate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#5e548e] to-[#be95c4]
                           text-white font-bold text-lg rounded-full hover:shadow-[0_0_30px_rgba(159,134,192,0.6)] transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                {isLoading ? 'Creating...' : 'Create New Room'}
              </button>

              <button
                onClick={() => setIsJoining(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm
                           text-white font-bold text-lg rounded-full hover:bg-white/20 transition-all border border-white/20"
              >
                <Users className="w-5 h-5" />
                Join Room
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm text-white text-center text-lg font-bold
                           rounded-full border border-white/20 placeholder-white/40 focus:outline-none focus:border-[#9f86c0]"
                maxLength={6}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setIsJoining(false)}
                  className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-full
                             hover:bg-white/20 transition-all border border-white/20"
                >
                  Back
                </button>
                <button
                  onClick={handleJoin}
                  disabled={roomCode.length !== 6 || isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#9f86c0] to-[#e0b1cb] text-white font-bold rounded-full
                             hover:shadow-[0_0_25px_rgba(224,177,203,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-white/40 text-sm">
          Connect with someone special through fun challenges
        </div>
      </div>
    </div>
  );
};
