import { useCallback, useMemo, useState } from 'react';
import {
  getLeaderboardFromStorage,
  saveLeaderboardToStorage,
  resetLeaderboard as clearLeaderboardStorage,
} from './leaderboard';
import type { LeaderboardEntry } from './leaderboard';

/**
 * Hook personalizado para manejar la tabla de puntuaciones almacenada en sessionStorage.
 */
export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => getLeaderboardFromStorage());

  const addOrUpdatePlayer = useCallback((nombre: string, puntos: number) => {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio || puntos === 0) {
      return;
    }

    // Agrega un jugador nuevo o actualiza los puntos de uno existente.
    setLeaderboard((prev) => {
      const existe = prev.find((item) => item.nombre === nombreLimpio);
      const siguiente: LeaderboardEntry[] = existe
        ? prev.map((item) =>
            item.nombre === nombreLimpio
              ? { ...item, puntos: item.puntos + puntos }
              : item,
          )
        : [...prev, { nombre: nombreLimpio, puntos }];

      saveLeaderboardToStorage(siguiente);
      return siguiente;
    });
  }, []);

  const resetLeaderboard = useCallback(() => {
    // Restablece el tablero completo y elimina los datos de la sesión.
    clearLeaderboardStorage();
    setLeaderboard([]);
  }, []);

  const sortedLeaderboard = useMemo(
    () => [...leaderboard].sort((a, b) => b.puntos - a.puntos || a.nombre.localeCompare(b.nombre)),
    [leaderboard],
  );

  return {
    leaderboard: sortedLeaderboard,
    addOrUpdatePlayer,
    resetLeaderboard,
  };
}
