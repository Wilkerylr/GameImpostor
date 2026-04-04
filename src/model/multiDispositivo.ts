export type RolPartida = 'inocente' | 'impostor';

export interface JugadorAsignado {
  nombre: string;
  rol: RolPartida;
  palabra: string;
}

export interface PaqueteJugadorQR {
  hash: string; // Identificador anonimizado del jugador
  data: string; // Datos cifrados (rol y palabra)
}

export interface PaquetePartidaQR {
  version: 2;
  partidaId: number;
  players: PaqueteJugadorQR[];
}

// --- UTILIDADES INTERNAS ---

const normalizarNombre = (valor: string) =>
  valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const mezclarCadena = (texto: string, llave: string) => {
  if (!llave) return texto;
  let resultado = '';
  for (let i = 0; i < texto.length; i += 1) {
    const codigoTexto = texto.charCodeAt(i);
    const codigoLlave = llave.charCodeAt(i % llave.length);
    resultado += String.fromCharCode(codigoTexto ^ codigoLlave);
  }
  return resultado;
};

const aBase64 = (texto: string) => btoa(unescape(encodeURIComponent(texto)));
const desdeBase64 = (texto: string) => decodeURIComponent(escape(atob(texto)));

// --- FUNCIONES EXPORTADAS ---

export const generarPartidaId = () => Math.floor(1000 + Math.random() * 9000);

/**
 * Crea un hash único para el jugador basado en su nombre y el ID de la partida.
 * Esto permite al móvil del jugador encontrar su "espacio" en el QR sin leer nombres ajenos.
 */
export const generarHashJugador = async (nombre: string, partidaId: number): Promise<string> => {
  const texto = `${normalizarNombre(nombre)}|${partidaId}`;
  const data = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(digest))
    .map((valor) => valor.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24);
};

/**
 * Cifra la información privada (rol/palabra) usando el nombre+id como llave XOR.
 */
export const cifrarAsignacionJugador = (jugador: JugadorAsignado, partidaId: number) => {
  const nombreNormalizado = normalizarNombre(jugador.nombre);
  const llave = `${nombreNormalizado}|${partidaId}`;
  const payload = JSON.stringify({
    nombre: jugador.nombre,
    rol: jugador.rol,
    palabra: jugador.palabra
  });

  return aBase64(mezclarCadena(payload, llave));
};

/**
 * Proceso inverso: Descifra los datos si la llave (nombre del jugador) coincide.
 */
export const descifrarAsignacionJugador = (
  data: string,
  nombreJugador: string,
  partidaId: number
): JugadorAsignado | null => {
  try {
    const nombreNormalizado = normalizarNombre(nombreJugador);
    const llave = `${nombreNormalizado}|${partidaId}`;
    const payload = mezclarCadena(desdeBase64(data), llave);
    const parsed = JSON.parse(payload) as JugadorAsignado;

    // Validación de seguridad: el nombre dentro del paquete debe ser el mismo
    if (normalizarNombre(parsed.nombre) !== nombreNormalizado) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

/**
 * Crea el paquete completo que el Anfitrión convertirá en un solo código QR.
 */
export const construirPaquetePartida = async (
  jugadores: JugadorAsignado[],
  partidaId: number
): Promise<PaquetePartidaQR> => {
  const players = await Promise.all(
    jugadores.map(async (jugador) => ({
      hash: await generarHashJugador(jugador.nombre, partidaId),
      data: cifrarAsignacionJugador(jugador, partidaId)
    }))
  );

  return {
    version: 2,
    partidaId,
    players
  };
};

export const serializarPaquetePartida = (paquete: PaquetePartidaQR) =>
  aBase64(JSON.stringify(paquete));

export const parsearPaquetePartida = (textoQR: string): PaquetePartidaQR => {
  const contenido = desdeBase64(textoQR);
  const parsed = JSON.parse(contenido) as PaquetePartidaQR;

  if (parsed.version !== 2 || !Array.isArray(parsed.players)) {
    throw new Error('Paquete QR incompatible o versión antigua');
  }

  return parsed;
};

/**
 * Función principal que usa el componente JUGADOR.
 * Recibe el texto del QR escaneado y el nombre que el usuario escribió.
 */
export const obtenerAsignacionParaJugador = async (
  textoQR: string,
  nombreJugador: string
): Promise<JugadorAsignado | null> => {
  try {
    const paquete = parsearPaquetePartida(textoQR);
    const hashBuscado = await generarHashJugador(nombreJugador, paquete.partidaId);
    
    // Busca en la lista de jugadores cifrados el que coincida con el hash del nombre
    const entrada = paquete.players.find((p) => p.hash === hashBuscado);

    if (!entrada) return null;

    // Si lo encuentra, intenta descifrar su rol y palabra
    return descifrarAsignacionJugador(entrada.data, nombreJugador, paquete.partidaId);
  } catch (e) {
    console.error("Error al obtener asignación:", e);
    return null;
  }
};