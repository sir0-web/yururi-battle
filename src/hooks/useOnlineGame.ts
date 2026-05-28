import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Attribute, GameState, Player } from '@/types/game';
import { applyPlace, createInitialState } from '@/utils/gameLogic';

export type OnlinePhase = 'lobby' | 'matching' | 'selecting' | 'playing' | 'finished';
export type MyRole = 'host' | 'guest';

export function useOnlineGame() {
  const [phase, setPhase] = useState<OnlinePhase>('lobby');
  const [myName, setMyName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [myRole, setMyRole] = useState<MyRole>('host');
  const [game, setGame] = useState<GameState | null>(null);
  const [myAttr, setMyAttr] = useState<Attribute>('none');
  const [opponentName, setOpponentName] = useState('');
  const [error, setError] = useState('');
  const [moves, setMoves] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const roomIdRef = useRef('');

  const myPlayer: Player = myRole === 'host' ? 'p1' : 'p2';
  const isMyTurn = game ? game.cur === myPlayer && !game.winner && !game.draw : false;

  // マッチング開始
  const startMatching = useCallback(async (name: string) => {
    setError('');
    setMyName(name);

    // 待機中のルームを探す
    const { data: waiting } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'waiting')
      .is('guest_player', null)
      .order('created_at', { ascending: true })
      .limit(1);

    if (waiting && waiting.length > 0) {
      // 既存ルームに参加
      const room = waiting[0];
      const { error: upErr } = await supabase
        .from('rooms')
        .update({ guest_player: name, status: 'selecting' })
        .eq('id', room.id);
      if (upErr) { setError('参加に失敗しました'); return; }

      setRoomId(room.id);
      roomIdRef.current = room.id;
      setMyRole('guest');
      setOpponentName(room.host_player);
      setPhase('selecting');
      subscribeRoom(room.id, 'guest');
    } else {
      // 新規ルーム作成
      const id = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error: insErr } = await supabase
        .from('rooms')
        .insert({
          id,
          host_player: name,
          status: 'waiting',
          host_attr: 'none',
          guest_attr: 'none',
          game_state: null,
        });
      if (insErr) { setError('ルーム作成に失敗しました'); return; }

      setRoomId(id);
      roomIdRef.current = id;
      setMyRole('host');
      setPhase('matching');
      subscribeRoom(id, 'host');
    }
  }, []);

  // 属性確定
  const confirmAttr = useCallback(async (attr: Attribute) => {
    setMyAttr(attr);
    const id = roomIdRef.current;
    const field = myRole === 'host' ? 'host_attr' : 'guest_attr';
    await supabase.from('rooms').update({ [field]: attr }).eq('id', id);
  }, [myRole]);

  // コマを置く
  const placePiece = useCallback(async (
    currentGame: GameState,
    pieceIdx: number,
    cellIdx: number
  ) => {
    const player: Player = myRole === 'host' ? 'p1' : 'p2';
    const next = applyPlace(currentGame, player, pieceIdx, cellIdx);
    setGame(next);
    setMoves(m => m + 1);
    await supabase.from('rooms').update({
      game_state: next,
      status: next.winner || next.draw ? 'finished' : 'playing',
    }).eq('id', roomIdRef.current);
  }, [myRole]);

  // Realtime
  const subscribeRoom = useCallback((id: string, role: MyRole) => {
    const ch = supabase
      .channel(`room:${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${id}`,
      }, (payload) => {
        const updated = payload.new as {
          id: string;
          host_player: string;
          guest_player: string | null;
          host_attr: string;
          guest_attr: string;
          game_state: GameState | null;
          status: string;
        };

        // ゲスト参加を検知（ホスト側）
        if (updated.guest_player && role === 'host') {
          setOpponentName(updated.guest_player);
          setPhase('selecting');
        }

        // 両者属性確定 → ゲーム開始
        if (
          updated.status === 'selecting' &&
          updated.host_attr !== 'none' &&
          updated.guest_attr !== 'none'
        ) {
          const attrs = {
            p1: updated.host_attr as Attribute,
            p2: updated.guest_attr as Attribute,
          };
          const initialGame = createInitialState(attrs);
          setGame(initialGame);
          setPhase('playing');
          if (role === 'host') {
            supabase.from('rooms').update({
              game_state: initialGame,
              status: 'playing',
            }).eq('id', id);
          }
        }

        // ゲーム状態同期
        if (
          (updated.status === 'playing' || updated.status === 'finished') &&
          updated.game_state
        ) {
          setGame(updated.game_state);
          if (updated.status === 'finished') setPhase('finished');
        }
      })
      .subscribe();
    channelRef.current = ch;
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  return {
    phase, myName, roomId, myRole, myPlayer, game, myAttr,
    opponentName, error, moves, isMyTurn,
    startMatching, confirmAttr, placePiece, setMyAttr,
  };
}