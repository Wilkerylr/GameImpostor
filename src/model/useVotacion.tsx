// Maneja la fase de votación:
// - Registrar votos de cada jugador
// - Expulsar al jugador con más votos
// - En empate, continuar la discusión
// - Si el expulsado es el impostor → pedirle que adivine la palabra
//     * Si adivina: gana el impostor
//     * Si no adivina: ganan los inocentes
// - Si el expulsado es inocente → gana el impostor

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

    const impostor = jugadoresIniciales.find(j => j.rol === 'impostor') ?? null;

    const resolverVotacion = (nombreEliminado: string) => {
        const jugadorExpulsado = jugadoresActivos.find(j => j.nombre === nombreEliminado);
        if (!jugadorExpulsado) return;

        const nuevosActivos = jugadoresActivos.filter(j => j.nombre !== nombreEliminado);
        sessionStorage.setItem('votacion_expulsado', JSON.stringify(jugadorExpulsado));
        sessionStorage.setItem('votacion_jugadores', JSON.stringify(nuevosActivos));
        setExpulsado(jugadorExpulsado);
        setJugadoresActivos(nuevosActivos);

        if (jugadorExpulsado.rol === 'inocente') {
            sessionStorage.setItem('votacion_ganador', 'impostor');
            sessionStorage.setItem('votacion_estado', 'finalizado');
            setGanador('impostor');
            setEstado('finalizado');
        } else {
            sessionStorage.setItem('votacion_estado', 'adivinando');
            setEstado('adivinando');
        }
    };

    const verificarAdivinanza = (palabraIngresada: string, palabraReal: string) => {
        const acierto = palabraIngresada.trim().toLowerCase() === palabraReal.trim().toLowerCase();
        const resultado = acierto ? 'impostor' : 'inocentes';
        sessionStorage.setItem('votacion_ganador', resultado);
        sessionStorage.setItem('votacion_estado', 'finalizado');
        setGanador(resultado);
        setEstado('finalizado');
    };

    return { jugadoresActivos, ganador, estado, expulsado, impostor, resolverVotacion, verificarAdivinanza };
}
