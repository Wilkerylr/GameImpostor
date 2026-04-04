// Orquestador principal de la partida:
// - Controla la fase actual ('config' | 'asignacion' | 'juego')
// - Conecta useConfiguracion, useAsignacion y useVotacion
// - Expone avanzarFase() para transicionar entre fases
// - Es el único hook que pages/juego.tsx necesita consumir

import { useState } from "react";
import { useConfiguracion } from "./useConfiguracion";
import { useAsignacion } from "./useAsignacion";

export type Fase = 'config' | 'asignacion' | 'juego';

export function usePartida() {
    const [fase, setFase] = useState<Fase>(() =>
        (sessionStorage.getItem('partida_fase') as Fase) || 'config'
    );

    const configuracion = useConfiguracion();
    const asignacion = useAsignacion(configuracion.jugadores, configuracion.impostores);

    const avanzarFase = () => {
        setFase(f => {
            const siguiente = f === 'config' ? 'asignacion' : 'juego';
            sessionStorage.setItem('partida_fase', siguiente);
            return siguiente;
        });
    };

    const reiniciarPartida = () => {
        asignacion.reiniciar();
        sessionStorage.setItem('partida_fase', 'asignacion');
        setFase('asignacion');
    };

    return { fase, avanzarFase, reiniciarPartida, configuracion, asignacion };
}
