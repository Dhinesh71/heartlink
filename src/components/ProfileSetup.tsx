import { useState } from 'react';

interface ProfileSetupProps {
  onComplete: (nickname: string, avatar: string) => Promise<void>;
}

const AVATARS = ['😊', '😎', '🥰', '😏', '🤗', '😇', '🔥', '💕', '✨', '🌟', '💫', '🎭'];

export const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('😊');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (nickname.trim().length >= 2) {
      setIsSubmitting(true);
      await onComplete(nickname.trim(), selectedAvatar);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div
          className="backdrop-blur-md bg-white/10 rounded-3xl p-8 border border-white/20"
          style={{
            boxShadow: '0 8px 32px rgba(35, 25, 66, 0.3), 0 0 40px rgba(159, 134, 192, 0.2)',
          }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-6">Set Up Profile</h2>

          <div className="mb-6">
            <label className="block text-white/80 text-sm font-medium mb-2">Nickname</label>
            <input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 20))}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20
                         placeholder-white/40 focus:outline-none focus:border-[#9f86c0]"
              maxLength={20}
            />
          </div>

          <div className="mb-8">
            <label className="block text-white/80 text-sm font-medium mb-3">Choose Avatar</label>
            <div className="grid grid-cols-6 gap-3">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`p-3 text-3xl rounded-2xl transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-white/20 border-2 border-[#9f86c0] scale-110'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={nickname.trim().length < 2 || isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-[#5e548e] to-[#be95c4] text-white font-bold text-lg rounded-full
                       hover:shadow-[0_0_30px_rgba(159,134,192,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Joining...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
