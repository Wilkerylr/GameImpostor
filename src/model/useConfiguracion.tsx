// Maneja la configuración inicial de la partida:
// - Permitir editar cantidad de jugadores e impostores
// - Seleccionar o ingresar un tema para generar la lista de palabras
// - Validar que los parámetros sean correctos antes de avanzar a la asignación
// - Exponer una función confirmarConfig() que dispare el avance de fase

import { useState } from "react";
import { ConfiguracionPredeterminada } from "./configpredeterminada";

function leerStorage(clave: string, valorPredeterminado: number): number {
    const valor = localStorage.getItem(clave);
    return valor ? Number(valor) : valorPredeterminado;
}

function leerBoolean(clave: string, valorPredeterminado: boolean): boolean {
    const valor = localStorage.getItem(clave);
    return valor ? valor === 'true' : valorPredeterminado;
}

function leerNombres(): string[] {
    const nombres = localStorage.getItem('nombres');
    return nombres ? JSON.parse(nombres) : [];
}

export function useConfiguracion() {
    const [jugadores, setJugadoresState] = useState(() => leerStorage('jugadores', ConfiguracionPredeterminada.cantidadJugadores));
    const [impostores, setImpostoresState] = useState(() => leerStorage('impostores', ConfiguracionPredeterminada.cantidadImpostores));
    const [nombres, setNombresState] = useState<string[]>(() => leerNombres());
    const [temporizadorActivo, setTemporizadorActivoState] = useState(() => leerBoolean('temporizadorActivo', false));
    const [tiempoDiscusion, setTiempoDiscusionState] = useState(() => leerStorage('tiempoDiscusion', 3));
    const [leaderboardActivo, setLeaderboardActivoState] = useState(() => leerBoolean('leaderboardActivo', false));

    const setJugadores = (valor: number) => {
        // Validar rango permitido
        const valorSeguro = Math.max(3, Math.min(20, Math.round(valor)));
        localStorage.setItem('jugadores', String(valorSeguro));
        setJugadoresState(valorSeguro);
        
        // Ajustar automaticamente impostores si excede el nuevo maximo permitido
        const maxImpostoresPermitido = Math.min(3, Math.floor(valorSeguro / 2));
        if (impostores > maxImpostoresPermitido) {
            setImpostores(maxImpostoresPermitido);
        }
    };

    const setImpostores = (valor: number) => {
        // Validar rango y logica de juego
        const maxPermitido = Math.min(3, Math.floor(jugadores / 2));
        const valorSeguro = Math.max(1, Math.min(maxPermitido, Math.round(valor)));
        localStorage.setItem('impostores', String(valorSeguro));
        setImpostoresState(valorSeguro);
    };

    const setNombres = (valor: string[]) => {
        localStorage.setItem('nombres', JSON.stringify(valor));
        setNombresState(valor);
    };

    const setTemporizadorActivo = (valor: boolean) => {
        localStorage.setItem('temporizadorActivo', String(valor));
        setTemporizadorActivoState(valor);
    };

    const setTiempoDiscusion = (valor: number) => {
        localStorage.setItem('tiempoDiscusion', String(valor));
        setTiempoDiscusionState(valor);
    };

    const setLeaderboardActivo = (valor: boolean) => {
        localStorage.setItem('leaderboardActivo', String(valor));
        setLeaderboardActivoState(valor);
    };

    return { jugadores, setJugadores, impostores, setImpostores, nombres, setNombres, temporizadorActivo, setTemporizadorActivo, tiempoDiscusion, setTiempoDiscusion, leaderboardActivo, setLeaderboardActivo };
}
