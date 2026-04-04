import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVotacion } from '../model/useVotacion';
import { useConfiguracion } from '../model/useConfiguracion';
import { useLeaderboard } from '../model/useLeaderboard';
import { calculatePoints } from '../model/leaderboard';
import { limpiarPartida } from '../model/limpiarPartida';
import BotonSalir from './BotonSalir';
import TablaPuntuacion from './TablaPuntuacion';
import '../styles/components/FaseVotacion.css';

interface Props {
    votacion: ReturnType<typeof useVotacion>;
    palabraReal: string;
    configuracion: ReturnType<typeof useConfiguracion>;
    onJugarDeNuevo: () => void;
}

export default function FaseVotacion({ votacion, palabraReal, configuracion, onJugarDeNuevo }: Props) {
    const { jugadoresActivos, ganador, estado, expulsado, impostores, jugadoresIniciales, resolverVotacion, verificarAdivinanza } = votacion;
    const { leaderboard, addOrUpdatePlayer } = useLeaderboard();
    const [confirmando, setConfirmando] = useState<string | null>(null);
    const [adivinanza, setAdivinanza] = useState('');
    const [puntosAplicados, setPuntosAplicados] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!configuracion.leaderboardActivo || estado !== 'finalizado' || puntosAplicados || !ganador) {
            return;
        }

        const timeout = window.setTimeout(() => {
            const totalPlayers = jugadoresIniciales.length;
            const totalImpostors = impostores.length;
            const ganadores = ganador === 'inocentes'
                ? jugadoresIniciales.filter(j => j.rol === 'inocente')
                : impostores;

            ganadores.forEach((jugador) => {
                const puntos = calculatePoints(jugador.rol, totalPlayers, totalImpostors, ganador);
                addOrUpdatePlayer(jugador.nombre, puntos);
            });

            setPuntosAplicados(true);
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [configuracion.leaderboardActivo, estado, puntosAplicados, ganador, jugadoresIniciales, impostores, addOrUpdatePlayer]);

    if (estado === 'finalizado') return (
        <div className="votacion-contenedor">
            <div className="resultado-contenedor">
                <span className="resultado-emoji">{ganador === 'impostor' ? '🕵️' : '👥'}</span>
                <h1 className="resultado-titulo">{ganador === 'impostor' ? '¡Gana el impostor!' : '¡Ganan los inocentes!'}</h1>
                {expulsado && <p className="resultado-subtitulo">{expulsado.nombre} fue expulsado</p>}
                {impostores.length === 1
                    ? <p className="resultado-impostor">El impostor era <strong>{impostores[0].nombre}</strong></p>
                    : <p className="resultado-impostor">Los impostores eran <strong>{impostores.map(i => i.nombre).join(', ')}</strong></p>
                }
                <div className="resultado-acciones">
                    <button className="votacion-modal-cancelar" onClick={() => { limpiarPartida(); navigate('/'); }}>Ir al menú</button>
                    <button className="votacion-modal-confirmar" onClick={onJugarDeNuevo}>Jugar de nuevo</button>
                </div>
            </div>

            {configuracion.leaderboardActivo && (
                <div className="resultado-tabla">
                    <h2 className="resultado-tabla-titulo">Tabla actualizada</h2>
                    <TablaPuntuacion entries={leaderboard} showResetButton={false} />
                </div>
            )}
        </div>
    );

    if (estado === 'adivinando') return (
        <div className="votacion-contenedor">
            <BotonSalir />
            <div className="adivinanza-contenedor">
                <h2>¡{expulsado?.nombre} fue expulsado!</h2>
                <p>{impostores.length === 1 ? 'Eras el impostor' : 'Eran los impostores'}. ¿Pueden adivinar la palabra secreta?</p>
                <input
                    className="adivinanza-input"
                    type="text"
                    placeholder="Tu respuesta..."
                    value={adivinanza}
                    onChange={e => setAdivinanza(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && verificarAdivinanza(adivinanza, palabraReal)}
                    autoFocus
                />
                <button className="votacion-modal-confirmar" onClick={() => verificarAdivinanza(adivinanza, palabraReal)}>
                    Confirmar
                </button>
            </div>
        </div>
    );

    return (
        <div className="votacion-contenedor">
            <BotonSalir />
            <h1 className="votacion-titulo">Votación</h1>
            <p className="votacion-subtitulo">Selecciona al jugador eliminado por consenso</p>

            <div className="votacion-lista">
                {jugadoresActivos.map(j => (
                    <div
                        key={j.nombre}
                        className="votacion-item"
                        onClick={() => setConfirmando(j.nombre)}
                    >
                        <div className="votacion-item-frente">
                            <span className="votacion-item-nombre">{j.nombre}</span>
                        </div>
                    </div>
                ))}
            </div>

            {confirmando && (
                <div className="votacion-modal-overlay" onClick={() => setConfirmando(null)}>
                    <div className="votacion-modal" onClick={e => e.stopPropagation()}>
                        <h2>¿Eliminar a este jugador?</h2>
                        <span className="votacion-modal-nombre">{confirmando}</span>
                        <p>Esta acción no se puede deshacer</p>
                        <div className="votacion-modal-acciones">
                            <button className="votacion-modal-cancelar" onClick={() => setConfirmando(null)}>Cancelar</button>
                            <button className="votacion-modal-confirmar" onClick={() => { resolverVotacion(confirmando); setConfirmando(null); }}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
