// Hook para gestionar temas personalizados en localStorage.
// Permite agregar (máx 5), eliminar, activar/desactivar temas y eliminar palabras individuales.

import { useState } from 'react';
import type { Entrada } from './obtenerLista';

const MAX_TEMAS = 5;

function leerTemas(): Record<string, Entrada[]> {
    return JSON.parse(localStorage.getItem('temas') || '{}');
}

export function useTemas() {
    const [temas, setTemasState] = useState<Record<string, Entrada[]>>(leerTemas);
    const [temaActivo, setTemaActivoState] = useState<string | null>(
        () => localStorage.getItem('temaActivo')
    );

    const guardarTemas = (nuevos: Record<string, Entrada[]>) => {
        localStorage.setItem('temas', JSON.stringify(nuevos));
        setTemasState(nuevos);
    };

    const agregarTema = (nombre: string, palabras: Entrada[]): string | null => {
        if (Object.keys(temas).length >= MAX_TEMAS) return `Límite de ${MAX_TEMAS} temas alcanzado`;
        if (temas[nombre]) return 'Ya existe un tema con ese nombre';
        guardarTemas({ ...temas, [nombre]: palabras });
        return null;
    };

    const eliminarTema = (nombre: string) => {
        const nuevos = { ...temas };
        delete nuevos[nombre];
        guardarTemas(nuevos);
        if (temaActivo === nombre) desactivarTema();
    };

    const activarTema = (nombre: string) => {
        localStorage.setItem('temaActivo', nombre);
        setTemaActivoState(nombre);
    };

    const desactivarTema = () => {
        localStorage.removeItem('temaActivo');
        setTemaActivoState(null);
    };

    const eliminarPalabra = (nombreTema: string, palabra: string) => {
        const nuevas = temas[nombreTema].filter(e => e.palabra !== palabra);
        guardarTemas({ ...temas, [nombreTema]: nuevas });
    };

    const puedeAgregar = Object.keys(temas).length < MAX_TEMAS;

    return { temas, temaActivo, agregarTema, eliminarTema, activarTema, desactivarTema, eliminarPalabra, puedeAgregar };
}
