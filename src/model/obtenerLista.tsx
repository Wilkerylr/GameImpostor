// Devuelve la lista de palabras activa: tema personalizado si hay uno seleccionado, o la lista predeterminada.

import listaPredeterminada from "./listapredeterminada";

export type Entrada = { palabra: string; pista: string };

export function obtenerLista(): Entrada[] {
    const temaActivo = localStorage.getItem("temaActivo");
    if (temaActivo) {
        const temas = localStorage.getItem("temas");
        if (temas) {
            const temasParseados = JSON.parse(temas);
            if (temasParseados[temaActivo]) return temasParseados[temaActivo];
        }
    }
    return listaPredeterminada();
}
