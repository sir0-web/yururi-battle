import { useCallback, useState } from 'react';
import { GameMode, GameState, Player, SelectedPiece } from '@/types/game';
import {
  bestMove,
  canPlace,
  checkDraw,
  checkWin,
  createInitialState,
} from '@/utils/gameLogic';

export function useGameState(mode: GameMode, cpuDifficulty: string) {
  const [game, setGame] = useState<GameState>(createInitialState());
  const [sel, setSel] = useState<SelectedPiece | null>(null);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);

  const reset = useCallback(() => {
    setGame(createInitialState());
    setSel(null);
    setBusy(false);
    setMoves(0);
  }, []);

  const selectPiece = useCallback((player: Player, idx: number) => {
    if (busy) return;
    setGame(g => {
      if (g.winner || g.draw) return g;
      if (player !== g.cur) return g;
      return g;
    });
    setSel(prev => {
      if (prev?.player === player && prev?.idx === idx) return null;
      const piece = game.pieces[player][idx];
      if (piece.used) return null;
      return { player, idx, sz: piece.sz };
    });
  }, [busy, game.pieces]);

  const placePiece = useCallback((cellIdx: number) => {
    if (busy || !sel) return;
    setGame(prev => {
      if (!canPlace(sel.sz, cellIdx, prev.board)) return prev;

      const newBoard = prev.board.map(s => [...s]);
      newBoard[cellIdx].push({ player: sel.player, sz: sel.sz });

      const newPieces = {
        p1: prev.pieces.p1.map((p, i) =>
          sel.player === 'p1' && i === sel.idx ? { ...p, used: true } : p
        ),
        p2: prev.pieces.p2.map((p, i) =>
          sel.player === 'p2' && i === sel.idx ? { ...p, used: true } : p
        ),
      };

      const { winner, line } = checkWin(newBoard);
      const draw = !winner && checkDraw(newPieces);
      const nextPlayer: Player = prev.cur === 'p1' ? 'p2' : 'p1';

      return {
        ...prev,
        board: newBoard,
        pieces: newPieces,
        cur: winner || draw ? prev.cur : nextPlayer,
        winner,
        winLine: line,
        draw,
      };
    });

    setSel(null);
    setMoves(m => m + 1);
  }, [busy, sel]);

  const triggerCpu = useCallback((g: GameState) => {
    if (mode !== 'cpu' || g.cur !== 'p2' || g.winner || g.draw) return;
    setBusy(true);
    const delay = cpuDifficulty === 'easy' ? 500 : cpuDifficulty === 'hard' ? 1400 : 900;
    setTimeout(() => {
      const mv = bestMove(cpuDifficulty, g.pieces, g.board);
      if (mv) {
        setGame(prev => {
          const newBoard = prev.board.map(s => [...s]);
          newBoard[mv.ci].push({ player: 'p2', sz: mv.sz });
          const newPieces = {
            ...prev.pieces,
            p2: prev.pieces.p2.map((p, i) => i === mv.pi ? { ...p, used: true } : p),
          };
          const { winner, line } = checkWin(newBoard);
          const draw = !winner && checkDraw(newPieces);
          return {
            ...prev,
            board: newBoard,
            pieces: newPieces,
            cur: winner || draw ? prev.cur : 'p1',
            winner,
            winLine: line,
            draw,
          };
        });
        setMoves(m => m + 1);
      }
      setBusy(false);
    }, delay);
  }, [mode, cpuDifficulty]);

  const canPlaceCheck = useCallback((sz: string, ci: number) => {
    return canPlace(sz as 'L' | 'M' | 'S', ci, game.board);
  }, [game.board]);

  return { game, sel, busy, moves, reset, selectPiece, placePiece, triggerCpu, canPlaceCheck, setSel };
}