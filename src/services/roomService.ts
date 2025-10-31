import { getSupabase } from '../lib/supabase';
import type { Room, Player } from '../types/game';

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createRoom = async (): Promise<{ room: Room; error?: string }> => {
  const roomCode = generateRoomCode();

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ room_code: roomCode }])
    .select()
    .maybeSingle();

  if (error) {
    return { room: null as unknown as Room, error: error.message };
  }

  return { room: data as Room };
};

export const joinRoom = async (roomCode: string): Promise<{ room: Room | null; error?: string }> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('rooms')
    .select()
    .eq('room_code', roomCode.toUpperCase())
    .eq('status', 'waiting')
    .maybeSingle();

  if (error) {
    return { room: null, error: error.message };
  }

  if (!data) {
    return { room: null, error: 'Room not found or already started' };
  }

  return { room: data as Room };
};

export const addPlayer = async (
  roomId: string,
  nickname: string,
  avatar: string,
  isCreator: boolean
): Promise<{ player: Player; error?: string }> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('players')
    .insert([{ room_id: roomId, nickname, avatar, is_creator: isCreator }])
    .select()
    .maybeSingle();

  if (error) {
    return { player: null as unknown as Player, error: error.message };
  }

  return { player: data as Player };
};

export const getPlayersInRoom = async (roomId: string): Promise<Player[]> => {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from('players')
    .select()
    .eq('room_id', roomId);

  return (data as Player[]) || [];
};

export const updateRoomStatus = async (roomId: string, status: string): Promise<void> => {
  const supabase = await getSupabase();
  await supabase
    .from('rooms')
    .update({ status })
    .eq('id', roomId);
};
