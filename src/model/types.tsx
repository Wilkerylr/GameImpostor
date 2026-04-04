// Tipos compartidos del dominio del juego.

export type Jugador = {
    nombre: string;
    rol: 'inocente' | 'impostor';
    palabra: string;
}
