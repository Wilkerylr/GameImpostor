// Maneja la fase de votación:
// - Expulsar jugadores por consenso
// - Si se expulsa un inocente, el juego continúa hasta que la cantidad de inocentes e impostores sea la misma
//     * cuando se igualan, ganan los impostores
// - Si se expulsan todos los impostores → el último adivina la palabra
//     * Si adivina: gana el impostor
//     * Si no adivina: ganan los inocentes

import { useState } from "react";
import type { Jugador } from "./types.tsx";

export type EstadoVotacion = 'votando' | 'adivinando' | 'finalizado';

export function useVotacion(jugadoresIniciales: Jugador[]) {
    const [jugadoresActivos, setJugadoresActivos] = useState<Jugador[]>(() => {
        const g = sessionStorage.getItem('votacion_jugadores');
        return g ? JSON.parse(g) : jugadoresIniciales;
    });
    const [ganador, setGanador] = useState<'inocentes' | 'impostor' | null>(() => {
        const g = sessionStorage.getItem('votacion_ganador');
        return g ? g as 'inocentes' | 'impostor' : null;
    });
    const [estado, setEstado] = useState<EstadoVotacion>(() =>
        (sessionStorage.getItem('votacion_estado') as EstadoVotacion) || 'votando'
    );
    const [expulsado, setExpulsado] = useState<Jugador | null>(() => {
        const e = sessionStorage.getItem('votacion_expulsado');
        return e ? JSON.parse(e) : null;
    });

    const impostores = jugadoresIniciales.filter(j => j.rol === 'impostor');

    const resolverVotacion = (nombreEliminado: string) => {
        const jugadorExpulsado = jugadoresActivos.find(j => j.nombre === nombreEliminado);
        if (!jugadorExpulsado) return;

        const nuevosActivos = jugadoresActivos.filter(j => j.nombre !== nombreEliminado);
        sessionStorage.setItem('votacion_expulsado', JSON.stringify(jugadorExpulsado));
        sessionStorage.setItem('votacion_jugadores', JSON.stringify(nuevosActivos));
        setExpulsado(jugadorExpulsado);
        setJugadoresActivos(nuevosActivos);

        if (jugadorExpulsado.rol === 'inocente') {
            const inocentesActivos = nuevosActivos.filter(j => j.rol === 'inocente');
            const impostoresActivos = nuevosActivos.filter(j => j.rol === 'impostor');

            if (inocentesActivos.length <= impostoresActivos.length) {
                // Cuando la cantidad de inocentes e impostores se iguala o queda por debajo, ganan los impostores
                sessionStorage.setItem('votacion_ganador', 'impostor');
                sessionStorage.setItem('votacion_estado', 'finalizado');
                setGanador('impostor');
                setEstado('finalizado');
                return;
            }

            // Aún hay más inocentes que impostores, continuar votando
            return;
        }

        // Verificar si quedan impostores activos tras la expulsión
        const impostoresRestantes = nuevosActivos.filter(j => j.rol === 'impostor');
        if (impostoresRestantes.length > 0) {
            // Aún quedan impostores, continuar votando
            return;
        }
        // Último impostor expulsado → oportunidad de adivinar
        sessionStorage.setItem('votacion_estado', 'adivinando');
        setEstado('adivinando');
    };

    const verificarAdivinanza = (palabraIngresada: string, palabraReal: string) => {
        const acierto = palabraIngresada.trim().toLowerCase() === palabraReal.trim().toLowerCase();
        const resultado = acierto ? 'impostor' : 'inocentes';
        sessionStorage.setItem('votacion_ganador', resultado);
        sessionStorage.setItem('votacion_estado', 'finalizado');
        setGanador(resultado);
        setEstado('finalizado');
    };

    return { jugadoresActivos, ganador, estado, expulsado, impostores, jugadoresIniciales, resolverVotacion, verificarAdivinanza };
}
