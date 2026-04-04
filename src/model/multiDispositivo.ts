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
  const nombreNormalizado = normalizarNombre(jugador.nombre);
  const llave = `${nombreNormalizado}|${partidaId}`;
  const payload = JSON.stringify({
    nombre: jugador.nombre,
    rol: jugador.rol,
    palabra: jugador.palabra
  });

  return aBase64(mezclarCadena(payload, llave));
};

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

    if (normalizarNombre(parsed.nombre) !== nombreNormalizado) {
      return null;
    }

    if (parsed.rol !== 'inocente' && parsed.rol !== 'impostor') {
      return null;
    }

    if (typeof parsed.palabra !== 'string' || !parsed.palabra.trim()) {
      return null;
    }

    return parsed;
  } catch {
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

  return {
    version: 2,
    partidaId,
    players
  };
};

export const serializarPaquetePartida = (paquete: PaquetePartidaQR) =>
  aBase64(JSON.stringify(paquete));

export const parsearPaquetePartida = (textoQR: string): PaquetePartidaQR => {
  const parsed = JSON.parse(desdeBase64(textoQR)) as PaquetePartidaQR;

  if (parsed.version !== 2 || !Array.isArray(parsed.players) || typeof parsed.partidaId !== 'number') {
    throw new Error('Paquete QR inválido');
  }

  return parsed;
};

export const obtenerAsignacionParaJugador = async (
  textoQR: string,
  nombreJugador: string
): Promise<JugadorAsignado | null> => {
  const paquete = parsearPaquetePartida(textoQR);
  const hashBuscado = await generarHashJugador(nombreJugador, paquete.partidaId);
  const entrada = paquete.players.find((jugador) => jugador.hash === hashBuscado);

  if (!entrada) {
    return null;
  }

  return descifrarAsignacionJugador(entrada.data, nombreJugador, paquete.partidaId);
};
