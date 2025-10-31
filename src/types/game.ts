export type GameMode = 'friendly' | 'crush' | 'bold';
export type RoomStatus = 'waiting' | 'playing' | 'completed';
export type RoundType = 'truth' | 'dare';

export interface Room {
  id: string;
  room_code: string;
  created_at: string;
  expires_at: string;
  status: RoomStatus;
}

export interface Player {
  id: string;
  room_id: string;
  nickname: string;
  avatar: string;
  is_creator: boolean;
  joined_at: string;
}

export interface GameSession {
  id: string;
  room_id: string;
  game_mode: GameMode;
  current_round: number;
  heart_level: number;
  started_at: string;
  completed_at?: string;
}

export interface GameRound {
  id: string;
  session_id: string;
  round_number: number;
  type: RoundType;
  question: string;
  player_id: string;
  completed: boolean;
  completed_at?: string;
}
