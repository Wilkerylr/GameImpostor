import type { LeaderboardEntry } from '../model/leaderboard';
import { useLeaderboard } from '../model/useLeaderboard';
import styles from '../styles/components/TablaPuntuacion.module.css';

interface Props {
  entries?: LeaderboardEntry[];
  showResetButton?: boolean;
}

/**
 * Componente visual que renderiza la tabla de puntuación ordenada por puntos.
 * Usa los estilos del juego para consistencia.
 */
export default function TablaPuntuacion({ entries, showResetButton = true }: Props) {
  const { leaderboard, resetLeaderboard } = useLeaderboard();
  const tabla = entries ?? leaderboard;

  return (
    <section className={styles['tabla-puntuacion']}>
      <div className={styles['tabla-puntuacion-header']}>
        <div>
          <p className={styles['tabla-puntuacion-titulo']}>Puntuación</p>
          <h2 className={styles['tabla-puntuacion-subtitulo']}>Tabla de puntos acumulados</h2>
          <p className={styles['tabla-puntuacion-descripcion']}>
            Ordenada de mayor a menor, con persistencia en sessionStorage.
          </p>
        </div>
        {showResetButton && (
          <button
            type="button"
            onClick={resetLeaderboard}
            className={styles['tabla-puntuacion-reset']}
          >
            Reiniciar tablero
          </button>
        )}
      </div>

      <div className={styles['tabla-puntuacion-tabla']}>
        <table>
          <thead>
            <tr>
              <th>Rango</th>
              <th>Nombre</th>
              <th className={styles['tabla-puntuacion-puntos-heading']}>Puntos Totales</th>
            </tr>
          </thead>
          <tbody>
            {tabla.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles['tabla-puntuacion-vacia']}>
                  No hay puntajes registrados todavía.
                </td>
              </tr>
            ) : (
              tabla.map((jugador, index) => (
                <tr key={jugador.nombre}>
                  <td className={styles['tabla-puntuacion-rango']}>{index + 1}</td>
                  <td className={styles['tabla-puntuacion-nombre']}>{jugador.nombre}</td>
                  <td className={styles['tabla-puntuacion-puntos']}>{jugador.puntos}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
