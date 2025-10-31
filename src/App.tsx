import { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProfileSetup } from './components/ProfileSetup';
import { LobbyScreen } from './components/LobbyScreen';
import { GameScreen } from './components/GameScreen';
import { MemoryBox } from './components/MemoryBox';
import { createRoom, joinRoom, addPlayer, getPlayersInRoom, updateRoomStatus, subscribeToRoom } from './services/roomService';
import { createGameSession, getGameSession, createGameRound, updateHeartLevel, updateCurrentRound, getGameRounds, completeGameSession, subscribeToGameSession, initializeFirstPlayer, setCurrentPlayer } from './services/gameService';
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

    let unsubscribePlayers: (() => void) | undefined;
    let unsubscribeGameSession: (() => void) | undefined;
    let mounted = true;

    const initializeSubscriptions = async () => {
      try {
        // Get initial players
        const initialPlayers = await getPlayersInRoom(room.id);
        if (!mounted) return;
        setPlayers(initialPlayers);

        // Subscribe to player changes
        unsubscribePlayers = await subscribeToRoom(room.id, (updatedPlayers) => {
          if (mounted) {
            setPlayers(updatedPlayers);
          }
        });
        if (!mounted) return;

        // Check if game session already exists
        const existingSession = await getGameSession(room.id);
        if (!mounted) return;

        if (existingSession) {
          setSession(existingSession);
          const existingRounds = await getGameRounds(existingSession.id);
          if (mounted) {
            setRounds(existingRounds);
            setAppState('game');
          }
        }

        // Subscribe to game session changes - this notifies ALL players when game starts
        unsubscribeGameSession = await subscribeToGameSession(room.id, async (gameSession) => {
          if (gameSession && mounted) {
            console.log('Game session update received, transitioning to game screen');
            setSession(gameSession);
            const currentRounds = await getGameRounds(gameSession.id);
            if (mounted) {
              setRounds(currentRounds);
              setAppState('game');
            }
          }
        });
      } catch (error) {
        console.error('Error initializing subscriptions:', error);
      }
    };

    initializeSubscriptions();

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
        (payload) => {
          if (mounted) {
            const updatedRoom = payload.new as Room;
            setRoom(updatedRoom);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && mounted) {
          console.log('Room subscriptions established for room:', room.id);
        }
      });

    return () => {
      mounted = false;
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

    try {
      // Step 1: Update room status to indicate game is starting
      await updateRoomStatus(room.id, 'playing');

      // Step 2: Create game session - this triggers realtime subscription for all players
      const { session: newSession, error } = await createGameSession(room.id, mode);

      if (error) {
        console.error('Failed to create game session:', error);
        return;
      }

      if (newSession) {
        // Step 3: Initialize the first player's turn
        await initializeFirstPlayer(newSession.id, players[0].id);
        console.log('Game started successfully by host');
      }
    } catch (err) {
      console.error('Error starting game:', err);
    }
  };

  const handleRoundComplete = async (round: GameRound) => {
    if (!session || !room) return;

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

    const nextPlayerIndex = (players.findIndex(p => p.id === round.player_id) + 1) % players.length;
    const nextPlayerId = players[nextPlayerIndex].id;
    await setCurrentPlayer(session.id, nextPlayerId);

    setSession({
      ...session,
      heart_level: newHeartLevel,
      current_round: round.round_number,
      current_player_id: nextPlayerId
    });
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

  // Polling fallback: Periodically check for game session when in lobby
  // This ensures Player 2 detects game start even if realtime subscription has issues
  useEffect(() => {
    if (appState !== 'lobby' || !room) return;

    const pollInterval = setInterval(async () => {
      const gameSession = await getGameSession(room.id);
      if (gameSession && !session) {
        console.log('Game session detected via polling fallback');
        setSession(gameSession);
        const gameRounds = await getGameRounds(gameSession.id);
        setRounds(gameRounds);
        setAppState('game');
      }
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [appState, room, session]);

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
