import { useState } from 'react';
import { SpinWheel } from './SpinWheel';
import { QuestionCard } from './QuestionCard';
import { HeartMeter } from './HeartMeter';
import { HistoryBox } from './HistoryBox';
import type { Player, GameSession, GameRound } from '../types/game';
import { getRandomQuestion } from '../data/questions';

interface GameScreenProps {
  session: GameSession;
  players: Player[];
  currentPlayer: Player;
  onRoundComplete: (round: GameRound) => void;
  onGameComplete: () => void;
}

type GameState = 'spin' | 'question';

export const GameScreen = ({
  session,
  players,
  onRoundComplete,
  onGameComplete,
}: GameScreenProps) => {
  const [gameState, setGameState] = useState<GameState>('spin');
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [rounds, setRounds] = useState<GameRound[]>([]);

  const activePlayer = players[currentPlayerIndex];

  const handleSpinResult = (result: 'truth' | 'dare') => {
    const question = getRandomQuestion(session.game_mode, result);

    const newRound: GameRound = {
      id: crypto.randomUUID(),
      session_id: session.id,
      round_number: session.current_round + 1,
      type: result,
      question: question.text,
      player_id: activePlayer.id,
      completed: false,
    };

    setCurrentRound(newRound);
    setGameState('question');
  };

  const handleQuestionComplete = (answer?: string) => {
    if (currentRound) {
      const completedRound = { ...currentRound, completed: true, answer };
      onRoundComplete(completedRound);
      setRounds(prev => [...prev, completedRound]);

      if (session.heart_level + 10 >= 100) {
        onGameComplete();
      } else {
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
        setGameState('spin');
        setCurrentRound(null);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <HeartMeter level={session.heart_level} />
        </div>
        <HistoryBox rounds={rounds} />

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-white/60 text-sm">Round {session.current_round + 1}</span>
            <span className="text-white/40">•</span>
            <span className="text-white font-medium">{activePlayer.avatar} {activePlayer.nickname}</span>
          </div>
        </div>

        <div
          className="backdrop-blur-md bg-white/10 rounded-3xl p-8 border border-white/20 flex items-center justify-center min-h-[400px]"
          style={{
            boxShadow: '0 8px 32px rgba(35, 25, 66, 0.3), 0 0 40px rgba(159, 134, 192, 0.2)',
          }}
        >
          {gameState === 'spin' && (
            <SpinWheel onResult={handleSpinResult} />
          )}

          {gameState === 'question' && currentRound && (
            <QuestionCard
              type={currentRound.type}
              question={currentRound.question}
              playerNickname={activePlayer.nickname}
              onComplete={handleQuestionComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};
