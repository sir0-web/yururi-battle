import { useCallback, useState } from 'react';
import { Attribute, GameMode, GameState, Player, SelectedPiece } from '@/types/game';
import { applyPlace, bestMove, canPlace, createInitialState } from '@/utils/gameLogic';

export function useGameState(mode: GameMode, cpuDifficulty: string) {
  const [attributes, setAttributes] = useState<Record<Player, Attribute>>({ p1: 'none', p2: 'none' });
  const [game, setGame] = useState<GameState>(createInitialState({ p1: 'none', p2: 'none' }));
  const [sel, setSel] = useState<SelectedPiece | null>(null);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);

  const reset = useCallback((attrs?: Record<Player, Attribute>) => {
    const a = attrs ?? attributes;
    setAttributes(a);
    setGame(createInitialState(a));
    setSel(null);
    setBusy(false);
    setMoves(0);
  }, [attributes]);

  const selectPiece = useCallback((player: Player, idx: number) => {
    if (busy) return;
    setSel(prev => {
      if (prev?.player === player && prev?.idx === idx) return null;
      return { player, idx, sz: game.pieces[player][idx].sz };
    });
  }, [busy, game.pieces]);

  const placePiece = useCallback((cellIdx: number) => {
    if (busy || !sel) return;
    if (!canPlace(sel.sz, cellIdx, game.board)) return;

    const next = applyPlace(game, sel.player, sel.idx, cellIdx);
    setGame(next);
    setSel(null);
    setMoves(m => m + 1);

    // CPU turn
    if (mode === 'cpu' && next.cur === 'p2' && !next.winner && !next.draw) {
      setBusy(true);
      const delay = cpuDifficulty === 'easy' ? 500 : cpuDifficulty === 'hard' ? 1400 : 900;
      setTimeout(() => {
        const mv = bestMove(cpuDifficulty, next.pieces, next.board);
        if (mv) {
          const next2 = applyPlace(next, 'p2', mv.pi, mv.ci);
          setGame(next2);
          setMoves(m => m + 1);
        }
        setBusy(false);
      }, delay);
    }
  }, [busy, sel, game, mode, cpuDifficulty]);

  const canPlaceCheck = useCallback((sz: string, ci: number) => {
    return canPlace(sz as 'L' | 'M' | 'S', ci, game.board);
  }, [game.board]);

  const triggerCpu = useCallback((g: GameState) => {
    if (mode !== 'cpu' || g.cur !== 'p2' || g.winner || g.draw) return;
    setBusy(true);
    const delay = cpuDifficulty === 'easy' ? 500 : cpuDifficulty === 'hard' ? 1400 : 900;
    setTimeout(() => {
      const mv = bestMove(cpuDifficulty, g.pieces, g.board);
      if (mv) {
        const next = applyPlace(g, 'p2', mv.pi, mv.ci);
        setGame(next);
        setMoves(m => m + 1);
      }
      setBusy(false);
    }, delay);
  }, [mode, cpuDifficulty]);

  return { game, sel, busy, moves, attributes, reset, selectPiece, placePiece, triggerCpu, canPlaceCheck, setSel, setAttributes };
}