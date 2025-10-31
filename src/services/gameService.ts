import { getSupabase } from '../lib/supabase';
import type { GameSession, GameRound, GameMode } from '../types/game';

export const createGameSession = async (
  roomId: string,
  gameMode: GameMode
): Promise<{ session: GameSession; error?: string }> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('game_sessions')
    .insert([{ room_id: roomId, game_mode: gameMode }])
    .select()
    .maybeSingle();

  if (error) {
    return { session: null as unknown as GameSession, error: error.message };
  }

  return { session: data as GameSession };
};

export const getGameSession = async (roomId: string): Promise<GameSession | null> => {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from('game_sessions')
    .select()
    .eq('room_id', roomId)
    .order('started_at', { ascending: false })
    .maybeSingle();

  return data as GameSession | null;
};

export const createGameRound = async (
  sessionId: string,
  roundNumber: number,
  type: 'truth' | 'dare',
  question: string,
  playerId: string
): Promise<{ round: GameRound; error?: string }> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('game_rounds')
    .insert([{
      session_id: sessionId,
      round_number: roundNumber,
      type,
      question,
      player_id: playerId,
    }])
    .select()
    .maybeSingle();

  if (error) {
    return { round: null as unknown as GameRound, error: error.message };
  }

  return { round: data as GameRound };
};

export const completeRound = async (roundId: string): Promise<void> => {
  const supabase = await getSupabase();
  await supabase
    .from('game_rounds')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', roundId);
};

export const updateHeartLevel = async (sessionId: string, newLevel: number): Promise<void> => {
  const supabase = await getSupabase();
  await supabase
    .from('game_sessions')
    .update({ heart_level: newLevel })
    .eq('id', sessionId);
};

export const updateCurrentRound = async (sessionId: string, roundNumber: number): Promise<void> => {
  const supabase = await getSupabase();
  await supabase
    .from('game_sessions')
    .update({ current_round: roundNumber })
    .eq('id', sessionId);
};

export const getGameRounds = async (sessionId: string): Promise<GameRound[]> => {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from('game_rounds')
    .select()
    .eq('session_id', sessionId)
    .order('round_number', { ascending: true });

  return (data as GameRound[]) || [];
};

export const completeGameSession = async (sessionId: string): Promise<void> => {
  const supabase = await getSupabase();
  await supabase
    .from('game_sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId);
};

export const subscribeToGameSession = async (
  roomId: string,
  onSessionUpdate: (session: GameSession | null) => void
): Promise<() => void> => {
  const supabase = await getSupabase();

  const subscription = supabase
    .channel(`game-session:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_sessions',
        filter: `room_id=eq.${roomId}`
      },
      async () => {
        console.log('Game session change detected for room:', roomId);
        const session = await getGameSession(roomId);
        console.log('Updated session:', session);
        onSessionUpdate(session);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Game session subscription established for room:', roomId);
      }
    });

  return () => {
    console.log('Unsubscribing from game session changes for room:', roomId);
    subscription.unsubscribe();
  };
};

export const setCurrentPlayer = async (
  sessionId: string,
  playerId: string
): Promise<void> => {
  const supabase = await getSupabase();
  await supabase
    .from('game_sessions')
    .update({ current_player_id: playerId })
    .eq('id', sessionId);
};

export const initializeFirstPlayer = async (
  sessionId: string,
  firstPlayerId: string
): Promise<void> => {
  const supabase = await getSupabase();
  await supabase
    .from('game_sessions')
    .update({ current_player_id: firstPlayerId })
    .eq('id', sessionId);
};
