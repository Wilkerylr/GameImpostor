export type Role = 'inocente' | 'impostor';
export type WinnerRole = 'inocentes' | 'impostor';

export interface LeaderboardEntry {
  nombre: string;
  puntos: number;
}

const STORAGE_KEY = 'leaderboard_puntos';

/**
 * Calcula los puntos según rol, tamaño de la partida y el rol ganador.
 */
export function calculatePoints(
  role: Role,
  totalPlayers: number,
  totalImpostors: number,
  winnerRole: WinnerRole,
): number {
  const winnerRoleNormalized: Role = winnerRole === 'impostor' ? 'impostor' : 'inocente';
  if (role !== winnerRoleNormalized) {
    return 0;
  }

  if (winnerRole === 'inocentes') {
    return 2;
  }

  // Puntos para impostores según condiciones específicas de 5 jugadores.
  if (winnerRole === 'impostor') {
    if (totalPlayers === 5 && totalImpostors === 1) {
      return 8;
    }
    if (totalPlayers === 5 && totalImpostors === 2) {
      return 3;
    }
  }

  return 0;
}

/**
 * Lee la tabla de puntuación desde sessionStorage. Retorna una lista vacía si no hay datos válidos.
 */
export function getLeaderboardFromStorage(): LeaderboardEntry[] {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    if (!Array.isArray(parsed)) {
      throw new Error('Formato inválido de leaderboard');
    }
    return parsed.map((item) => ({
      nombre: String(item.nombre || '').trim(),
      puntos: Number(item.puntos || 0),
    })).filter((item) => item.nombre.length > 0);
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Guarda la tabla de puntuación en sessionStorage.
 */
export function saveLeaderboardToStorage(entries: LeaderboardEntry[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Elimina el leaderboard de sessionStorage. Pensado para la página de configuración.
 */
export function resetLeaderboard(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
