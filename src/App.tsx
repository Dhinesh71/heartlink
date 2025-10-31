import { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProfileSetup } from './components/ProfileSetup';
import { LobbyScreen } from './components/LobbyScreen';
import { GameScreen } from './components/GameScreen';
import { MemoryBox } from './components/MemoryBox';
import { createRoom, joinRoom, addPlayer, getPlayersInRoom, updateRoomStatus, subscribeToRoom } from './services/roomService';
import { createGameSession, getGameSession, createGameRound, updateHeartLevel, updateCurrentRound, getGameRounds, completeGameSession, subscribeToGameSession } from './services/gameService';
import { supabase } from './lib/supabase';
import type { Room, Player, GameSession, GameMode, GameRound } from './types/game';

type AppState = 'welcome' | 'profile' | 'lobby' | 'game' | 'memory';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [session, setSession] = useState<GameSession | null>(null);
  const [rounds, setRounds] = useState<GameRound[]>([]);

  useEffect(() => {
    if (!room) return;

    // Get initial players
    getPlayersInRoom(room.id).then(setPlayers);

    // Subscribe to player changes using the helper
    let unsubscribePlayers: (() => void) | undefined;
    subscribeToRoom(room.id, setPlayers).then(unsub => {
      unsubscribePlayers = unsub;
    });

    // Subscribe to game session changes - this notifies ALL players when game starts
    let unsubscribeGameSession: (() => void) | undefined;
    subscribeToGameSession(room.id, (gameSession) => {
      if (gameSession && gameSession.started_at) {
        setSession(gameSession);
        setAppState('game');
      }
    }).then(unsub => {
      unsubscribeGameSession = unsub;
    });

    // Subscribe to room status changes
    const channel = supabase
      .channel(`room-status:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        async (payload) => {
          console.log('Room update:', payload);
          const updatedRoom = payload.new as Room;
          setRoom(updatedRoom);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Room subscription established for room:', room.id);
        }
      });

    return () => {
      if (unsubscribePlayers) unsubscribePlayers();
      if (unsubscribeGameSession) unsubscribeGameSession();
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  const handleCreateRoom = async () => {
    const { room: newRoom } = await createRoom();
    if (newRoom) {
      setRoom(newRoom);
      setAppState('profile');
    }
  };

  const handleJoinRoom = async (roomCode: string) => {
    const { room: foundRoom } = await joinRoom(roomCode);
    if (foundRoom) {
      setRoom(foundRoom);
      setAppState('profile');
    }
  };

  const handleProfileComplete = async (nickname: string, avatar: string) => {
    if (!room) return;

    // Check if there are already players in the room
    const existingPlayers = await getPlayersInRoom(room.id);
    // If no players exist, this is the creator. Otherwise, this is a joining player.
    const isCreator = existingPlayers.length === 0;

    const { player } = await addPlayer(room.id, nickname, avatar, isCreator);

    if (player) {
      setCurrentPlayer(player);
      // Fetch players immediately after adding new player
      const allPlayers = await getPlayersInRoom(room.id);
      setPlayers(allPlayers);
      setAppState('lobby');
    }
  };

  const handleStartGame = async (mode: GameMode) => {
    if (!room || !currentPlayer?.is_creator) return;

    await updateRoomStatus(room.id, 'playing');

    const { session: newSession } = await createGameSession(room.id, mode);
    if (newSession) {
      setSession(newSession);
      setAppState('game');
    }
  };

  const handleRoundComplete = async (round: GameRound) => {
    if (!session) return;

    await createGameRound(
      session.id,
      round.round_number,
      round.type,
      round.question,
      round.player_id
    );

    const newHeartLevel = Math.min(100, session.heart_level + 10);
    await updateHeartLevel(session.id, newHeartLevel);
    await updateCurrentRound(session.id, round.round_number);

    setSession({ ...session, heart_level: newHeartLevel, current_round: round.round_number });
    setRounds([...rounds, round]);
  };

  const handleGameComplete = async () => {
    if (!session || !room) return;

    await completeGameSession(session.id);
    await updateRoomStatus(room.id, 'completed');

    const allRounds = await getGameRounds(session.id);
    setRounds(allRounds);
    setAppState('memory');
  };

  const handlePlayAgain = () => {
    setRoom(null);
    setCurrentPlayer(null);
    setPlayers([]);
    setSession(null);
    setRounds([]);
    setAppState('welcome');
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #231942, #5e548e, #9f86c0, #be95c4, #e0b1cb)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 100 + 50 + 'px',
              height: Math.random() * 100 + 50 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {appState === 'welcome' && (
          <WelcomeScreen onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        )}

        {appState === 'profile' && <ProfileSetup onComplete={handleProfileComplete} />}

        {appState === 'lobby' && room && currentPlayer && (
          <LobbyScreen
            roomCode={room.room_code}
            players={players}
            currentPlayer={currentPlayer}
            onStartGame={handleStartGame}
          />
        )}

        {appState === 'game' && session && currentPlayer && (
          <GameScreen
            session={session}
            players={players}
            currentPlayer={currentPlayer}
            onRoundComplete={handleRoundComplete}
            onGameComplete={handleGameComplete}
          />
        )}

        {appState === 'memory' && (
          <MemoryBox
            rounds={rounds}
            players={players}
            heartLevel={session?.heart_level || 0}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
