import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export type RoomStatus = 'waiting' | 'selecting' | 'playing' | 'finished';

export interface Room {
  id: string;
  host_player: string;
  guest_player: string | null;
  host_attr: string;
  guest_attr: string;
  game_state: unknown;
  status: RoomStatus;
  created_at: string;
}