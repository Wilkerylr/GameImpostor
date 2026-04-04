// Maneja la asignación de roles uno por uno:\n// - Recibir la cantidad de jugadores e impostores desde la configuración\n// - Pedir el nombre de cada jugador en turnos (uno a la vez)\n// - Asignar aleatoriamente los roles (impostor / inocente) de forma secreta\n// - Asignar la palabra secreta a los inocentes y la pista al impostor\n// - Ocultar el rol hasta que el jugador confirme que es su turno\n// - Exponer avanzarTurno() para pasar al siguiente jugador\n// - Al terminar todos los jugadores, exponer finalizarAsignacion() para avanzar de fase

import { useState } from "react";
import type { Jugador } from "./types.tsx";
import { obtenerLista } from "./obtenerLista";

function generarRoles(cantidadJugadores: number, cantidadImpostores: number): Jugador['rol'][] {
    const roles: Jugador['rol'][] = [
        ...Array(cantidadImpostores).fill('impostor'),
        ...Array(cantidadJugadores - cantidadImpostores).fill('inocente')
    ];
    return roles.sort(() => Math.random() - 0.5);
}

function seleccionarEntrada() {
    const lista = obtenerLista();
    const historial: string[] = JSON.parse(sessionStorage.getItem('historial_palabras') || '[]');
    const disponibles = lista.filter(e => !historial.includes(e.palabra));
    const pool = disponibles.length > 0 ? disponibles : lista;
    const entrada = pool[Math.floor(Math.random() * pool.length)];
    const nuevoHistorial = [entrada.palabra, ...historial].slice(0, 15);
    sessionStorage.setItem('historial_palabras', JSON.stringify(nuevoHistorial));
    return entrada;
}

function generarJugadores(cantidadJugadores: number, cantidadImpostores: number): Jugador[] {
    const nombresGuardados: string[] = JSON.parse(localStorage.getItem('nombres') || '[]');
    const rolesGenerados = generarRoles(cantidadJugadores, cantidadImpostores);
    const entrada = seleccionarEntrada();
    const nombresMezclados = [...nombresGuardados].slice(0, cantidadJugadores).sort(() => Math.random() - 0.5);
    return Array.from({ length: cantidadJugadores }, (_, i) => ({
        nombre: nombresMezclados[i] ?? '',
        rol: rolesGenerados[i],
        palabra: rolesGenerados[i] === 'inocente' ? entrada.palabra : entrada.pista
    }));
}

export function useAsignacion(cantidadJugadores: number, cantidadImpostores: number) {
    const [jugadores, setJugadores] = useState<Jugador[]>(() => {
        const guardados = sessionStorage.getItem('partida_jugadores');
        if (guardados) return JSON.parse(guardados);
        const nuevos = generarJugadores(cantidadJugadores, cantidadImpostores);
        sessionStorage.setItem('partida_jugadores', JSON.stringify(nuevos));
        return nuevos;
    });

    const [turnoActual, setTurnoActual] = useState(() => {
        const v = sessionStorage.getItem('partida_turno');
        return v ? Number(v) : 0;
    });
    const [rolVisible, setRolVisibleState] = useState(() =>
        sessionStorage.getItem('partida_rolVisible') === 'true'
    );
    const [terminado, setTerminadoState] = useState(() =>
        sessionStorage.getItem('partida_terminado') === 'true'
    );

    const setRolVisible = (v: boolean) => {
        sessionStorage.setItem('partida_rolVisible', String(v));
        setRolVisibleState(v);
    };

    const avanzarTurno = () => {
        setRolVisible(false);
        if (turnoActual + 1 >= jugadores.length) {
            sessionStorage.setItem('partida_terminado', 'true');
            setTerminadoState(true);
        } else {
            const siguiente = turnoActual + 1;
            sessionStorage.setItem('partida_turno', String(siguiente));
            setTurnoActual(siguiente);
        }
    };

    const asignarNombre = (nombre: string) => {
        if (!nombre.trim()) return;
        setJugadores(prev => {
            const nuevos = prev.map((j, i) => i === turnoActual ? { ...j, nombre: nombre.trim() } : j);
            sessionStorage.setItem('partida_jugadores', JSON.stringify(nuevos));
            return nuevos;
        });
    };

    const reiniciar = () => {
        const nuevos = generarJugadores(cantidadJugadores, cantidadImpostores);
        sessionStorage.setItem('partida_jugadores', JSON.stringify(nuevos));
        sessionStorage.setItem('partida_turno', '0');
        sessionStorage.setItem('partida_rolVisible', 'false');
        sessionStorage.setItem('partida_terminado', 'false');
        sessionStorage.removeItem('partida_fase');
        sessionStorage.removeItem('juego_enVotacion');
        sessionStorage.removeItem('juego_turnoInicial');
        sessionStorage.removeItem('juego_tiempoRestante');
        sessionStorage.removeItem('votacion_jugadores');
        sessionStorage.removeItem('votacion_ganador');
        sessionStorage.removeItem('votacion_estado');
        sessionStorage.removeItem('votacion_expulsado');
        setJugadores(nuevos);
        setTurnoActual(0);
        setRolVisibleState(false);
        setTerminadoState(false);
    };

    return { jugadores, turnoActual, rolVisible, setRolVisible, terminado, asignarNombre, avanzarTurno, reiniciar };
}
