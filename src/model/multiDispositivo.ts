export type RolPartida = 'inocente' | 'impostor';

export interface JugadorAsignado {
  nombre: string;
  rol: RolPartida;
  palabra: string;
}

export interface PaqueteJugadorQR {
  hash: string;
  data: string;
}

export interface PaquetePartidaQR {
  version: 2;
  partidaId: number;
  players: PaqueteJugadorQR[];
}

// --- UTILIDADES DE ENCODING ROBUSTAS ---

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

// Reemplazo de btoa/atob antiguo para evitar errores de caracteres especiales en móviles
const aBase64 = (texto: string) => {
  const bytes = new TextEncoder().encode(texto);
  const binario = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binario);
};

const desdeBase64 = (base64: string) => {
  const binario = atob(base64);
  const bytes = new Uint8Array(Array.from(binario, (char) => char.charCodeAt(0)));
  return new TextDecoder().decode(bytes);
};

// --- FUNCIONES EXPORTADAS ---

export const generarPartidaId = () => Math.floor(1000 + Math.random() * 9000);

export const generarHashJugador = async (nombre: string, partidaId: number): Promise<string> => {
  const texto = `${normalizarNombre(nombre)}|${partidaId}`;
  const data = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(digest))
    .map((valor) => valor.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24);
};

export const cifrarAsignacionJugador = (jugador: JugadorAsignado, partidaId: number) => {
  const llave = `${normalizarNombre(jugador.nombre)}|${partidaId}`;
  const payload = JSON.stringify(jugador);
  return aBase64(mezclarCadena(payload, llave));
};

export const descifrarAsignacionJugador = (
  data: string,
  nombreJugador: string,
  partidaId: number
): JugadorAsignado | null => {
  try {
    const llave = `${normalizarNombre(nombreJugador)}|${partidaId}`;
    const descifrado = mezclarCadena(desdeBase64(data), llave);
    const parsed = JSON.parse(descifrado) as JugadorAsignado;

    if (normalizarNombre(parsed.nombre) !== normalizarNombre(nombreJugador)) {
      console.error("El nombre descifrado no coincide");
      return null;
    }
    return parsed;
  } catch (e) {
    console.error("Error en descifrado XOR/JSON:", e);
    return null;
  }
};

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

  return { version: 2, partidaId, players };
};

export const serializarPaquetePartida = (paquete: PaquetePartidaQR) =>
  aBase64(JSON.stringify(paquete));

export const parsearPaquetePartida = (textoQR: string): PaquetePartidaQR => {
  // Limpieza de posibles espacios o saltos de línea del lector QR
  const contenido = desdeBase64(textoQR.trim());
  const parsed = JSON.parse(contenido) as PaquetePartidaQR;

  if (parsed.version !== 2 || !Array.isArray(parsed.players)) {
    throw new Error('Paquete QR incompatible');
  }

  return parsed;
};

export const obtenerAsignacionParaJugador = async (
  textoQR: string,
  nombreJugador: string
): Promise<JugadorAsignado | null> => {
  try {
    const paquete = parsearPaquetePartida(textoQR);
    const hashBuscado = await generarHashJugador(nombreJugador, paquete.partidaId);
    
    // DEBUG LOGS (Ver en consola de navegador móvil si es posible)
    console.log("ID Partida:", paquete.partidaId);
    console.log("Nombre Buscado:", normalizarNombre(nombreJugador));
    console.log("Hash Generado:", hashBuscado);

    const entrada = paquete.players.find((p) => p.hash === hashBuscado);

    if (!entrada) {
      console.warn("No se encontró el hash en la lista del QR");
      return null;
    }

    return descifrarAsignacionJugador(entrada.data, nombreJugador, paquete.partidaId);
  } catch (e) {
    console.error("Error crítico en obtenerAsignacion:", e);
    return null;
  }
};