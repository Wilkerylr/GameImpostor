// Vista de la fase de discusión:
// - Mostrar el jugador que inicia con una palabra aleatoria
// - Temporizador lateral opcional según configuración
// - Botón para pasar a la fase de votación

import { useState, useEffect } from 'react';
import type { Jugador } from '../model/types.tsx';
import { useVotacion } from '../model/useVotacion';
import { useConfiguracion } from '../model/useConfiguracion';
import BotonAyuda from './BotonAyuda';
import BotonSalir from './BotonSalir';
import FaseVotacion from './FaseVotacion';
import '../styles/components/FaseJuego.css';

interface Props {
    jugadores: Jugador[];
    configuracion: ReturnType<typeof useConfiguracion>;
    onJugarDeNuevo: () => void;
}

export default function FaseJuego({ jugadores, configuracion, onJugarDeNuevo }: Props) {
    const votacion = useVotacion(jugadores);
    const [turnoActual] = useState(() => {
        const g = sessionStorage.getItem('juego_turnoInicial');
        if (g) return Number(g);
        const t = Math.floor(Math.random() * jugadores.length);
        sessionStorage.setItem('juego_turnoInicial', String(t));
        return t;
    });
    const [enVotacion, setEnVotacion] = useState(() =>
        sessionStorage.getItem('juego_enVotacion') === 'true'
    );
    const [tiempoRestante, setTiempoRestante] = useState(() => {
        const g = sessionStorage.getItem('juego_tiempoRestante');
        return g ? Number(g) : configuracion.tiempoDiscusion * 60;
    });

    const jugadorActual = jugadores[turnoActual];
    const palabraReal = jugadores.find(j => j.rol === 'inocente')?.palabra ?? '';

    useEffect(() => {
        if (!configuracion.temporizadorActivo || enVotacion) return;

        if (tiempoRestante <= 0) {
            const timeout = window.setTimeout(() => {
                sessionStorage.setItem('juego_enVotacion', 'true');
                setEnVotacion(true);
            }, 0);
            return () => window.clearTimeout(timeout);
        }

        const intervalo = window.setInterval(() => setTiempoRestante(prev => {
            const nuevo = prev - 1;
            sessionStorage.setItem('juego_tiempoRestante', String(nuevo));
            if (nuevo <= 0) {
                sessionStorage.setItem('juego_enVotacion', 'true');
                setEnVotacion(true);
            }
            return nuevo;
        }), 1000);

        return () => window.clearInterval(intervalo);
    }, [configuracion.temporizadorActivo, enVotacion, tiempoRestante]);

    const irAVotacion = () => {
        sessionStorage.setItem('juego_enVotacion', 'true');
        setEnVotacion(true);
    };

    if (enVotacion) return <FaseVotacion votacion={votacion} palabraReal={palabraReal} configuracion={configuracion} onJugarDeNuevo={onJugarDeNuevo} />;


    const minutos = Math.floor(tiempoRestante / 60).toString().padStart(2, '0');
    const segundos = (tiempoRestante % 60).toString().padStart(2, '0');

    return (
        <div className="juego-contenedor">
            <BotonSalir />

            <div className="juego-turno">
                <span className="juego-turno-numero">Empieza</span>
                <span className="juego-turno-nombre">{jugadorActual?.nombre}</span>
            </div>

            <p className="juego-instruccion">Di una palabra relacionada con tu tema</p>

            <div className="juego-cuerpo">
                {configuracion.temporizadorActivo && (
                    <div className="juego-temporizador">
                        <span className="juego-temporizador-tiempo">{minutos}:{segundos}</span>
                        <span className="juego-temporizador-label">tiempo</span>
                    </div>
                )}

                <div className="juego-lista">
                    {jugadores.map((j, i) => (
                        <div key={j.nombre} className={`juego-jugador ${i === turnoActual ? 'juego-jugador-activo' : ''}`}>
                            <span className="juego-jugador-nombre">{j.nombre}</span>
                            {i === turnoActual && <span className="juego-jugador-turno">empieza</span>}
                        </div>
                    ))}
                </div>
            </div>

            <button className="juego-btn-votar" onClick={irAVotacion}>
                Pasar a votación
            </button>

            <BotonAyuda />
        </div>
    );
}
