/*
  # HeartLink Truth or Dare Game Schema

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `room_code` (text, unique 6-char code)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `status` (text: waiting, playing, completed)
      
    - `players`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `nickname` (text)
      - `avatar` (text)
      - `is_creator` (boolean)
      - `joined_at` (timestamptz)
      
    - `game_sessions`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `game_mode` (text: friendly, crush, bold)
      - `current_round` (integer)
      - `heart_level` (integer, 0-100)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
      
    - `game_rounds`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `round_number` (integer)
      - `type` (text: truth, dare)
      - `question` (text)
      - `player_id` (uuid, foreign key)
      - `completed` (boolean)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (game is open, no auth required)
*/

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  status text DEFAULT 'waiting'
);

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  nickname text NOT NULL,
  avatar text DEFAULT '😊',
  is_creator boolean DEFAULT false,
  joined_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  game_mode text DEFAULT 'friendly',
  current_round integer DEFAULT 0,
  heart_level integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS game_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  round_number integer NOT NULL,
  type text NOT NULL,
  question text NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create rooms"
  ON rooms FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update rooms"
  ON rooms FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anyone can join as player"
  ON players FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create game sessions"
  ON game_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view game sessions"
  ON game_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update game sessions"
  ON game_sessions FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anyone can create rounds"
  ON game_rounds FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view rounds"
  ON game_rounds FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update rounds"
  ON game_rounds FOR UPDATE
  TO anon
  USING (true);