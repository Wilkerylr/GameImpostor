// Utilidad para limpiar todas las claves de partida del sessionStorage.
// Se llama al salir deliberadamente (BotonSalir) o al ir al menú desde resultado.

const CLAVES_PARTIDA = [
    'partida_fase',
    'partida_jugadores',
    'partida_turno',
    'partida_rolVisible',
    'partida_terminado',
    'juego_enVotacion',
    'juego_turnoInicial',
    'juego_tiempoRestante',
    'votacion_jugadores',
    'votacion_ganador',
    'votacion_estado',
    'votacion_expulsado',
];

export function limpiarPartida() {
    CLAVES_PARTIDA.forEach(c => sessionStorage.removeItem(c));
}
