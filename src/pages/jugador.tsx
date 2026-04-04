import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BotonMenu from '../components/BotonMenu';
import { obtenerAsignacionParaJugador } from '../model/multiDispositivo';
import '../styles/pages/Jugador.css';

type EstadoEscaner = 'inactivo' | 'iniciando' | 'activo' | 'resuelto';

export default function Jugador() {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [rol, setRol] = useState<string | null>(null);
  const [palabra, setPalabra] = useState<string | null>(null);
  const [escaneando, setEscaneando] = useState<EstadoEscaner>('inactivo');
  const [feedback, setFeedback] = useState('');
  const scannerRef = useRef<{
    stop?: () => Promise<void>;
    clear?: () => Promise<void> | void;
  } | null>(null);
  const regionId = 'qr-reader';

  const detenerEscaneo = useCallback(async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      return;
    }

    try {
      if (typeof scanner.stop === 'function') {
        await scanner.stop();
      }
    } catch {
      // Ignorar errores al detener si ya está parado
    }

    try {
      if (typeof scanner.clear === 'function') {
        await scanner.clear();
      }
    } catch {
      // Ignorar errores al limpiar si ya está liberado
    }

    scannerRef.current = null;
  }, []);

  const onScanSuccess = useCallback(
    async (decodedText: string) => {
      const nombreLimpio = nombreUsuario.trim();

      if (!nombreLimpio) {
        setFeedback('Escribe tu nombre exactamente como lo configuró el anfitrión antes de escanear.');
        return;
      }

      try {
        const asignacion = await obtenerAsignacionParaJugador(decodedText, nombreLimpio);

        if (!asignacion) {
          setFeedback(
            'No se encontró una asignación para ese nombre en esta partida. Verifica que coincida exactamente con la configuración del anfitrión.',
          );
          return;
        }

        setRol(asignacion.rol);
        setPalabra(asignacion.palabra);
        setFeedback('¡Rol asignado exitosamente!');
        setEscaneando('resuelto');
        await detenerEscaneo();
      } catch {
        setFeedback('El QR no corresponde a una partida válida o no se pudo leer correctamente.');
      }
    },
    [detenerEscaneo, nombreUsuario],
  );

  const onScanFailure = useCallback(() => {
    // Ignorar errores de escaneo, solo procesar éxitos
  }, []);

  const iniciarEscaneo = useCallback(async () => {
    const nombreLimpio = nombreUsuario.trim();

    if (!nombreLimpio) {
      setFeedback('Escribe tu nombre exactamente como lo configuró el anfitrión antes de escanear.');
      return;
    }

    setRol(null);
    setPalabra(null);
    setFeedback('Cargando cámara...');
    setEscaneando('iniciando');

    try {
      const modulo = await import('html5-qrcode');
      const Html5Qrcode = modulo.Html5Qrcode;
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText: string) => {
          void onScanSuccess(decodedText);
        },
        onScanFailure,
      );

      setEscaneando('activo');
      setFeedback('Escaneando... apunta al mismo QR que usa todo el grupo.');
    } catch {
      setEscaneando('inactivo');
      setFeedback('No se pudo iniciar la cámara. Revisa los permisos del navegador e inténtalo de nuevo.');
      await detenerEscaneo();
    }
  }, [detenerEscaneo, nombreUsuario, onScanFailure, onScanSuccess]);

  useEffect(() => {
    return () => {
      void detenerEscaneo();
    };
  }, [detenerEscaneo]);

  return (
    <div className="jugador-contenedor">
      <BotonMenu />

      <h1 className="jugador-titulo">Modo Jugador</h1>
      <p className="jugador-subtitulo">
        Todos los jugadores usan el mismo QR maestro. Escribe tu nombre exactamente igual a como fue configurado por el
        anfitrión y luego escanea ese mismo código.
      </p>

      {!rol ? (
        <div className="jugador-formulario">
          <div className="jugador-campo">
            <label htmlFor="jugador-nombre">Tu Nombre</label>
            <input
              id="jugador-nombre"
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              placeholder="Ej: Ana"
              disabled={escaneando === 'activo' || escaneando === 'resuelto'}
            />
          </div>

          {escaneando === 'inactivo' && (
            <button onClick={() => void iniciarEscaneo()} className="jugador-escanear">
              Escanear QR maestro
            </button>
          )}

          {escaneando === 'iniciando' && <p className="jugador-status">Iniciando cámara...</p>}
          {escaneando === 'activo' && (
            <p className="jugador-status">Escaneando... apunta al mismo QR que usa todo el grupo.</p>
          )}
          {escaneando === 'resuelto' && (
            <p className="jugador-status">Asignación encontrada. La cámara se ha detenido.</p>
          )}

          <div id={regionId} className="jugador-scanner"></div>

          {feedback && (
            <div className={`jugador-feedback ${feedback.includes('exitosamente') ? 'success' : 'error'}`}>
              {feedback}
            </div>
          )}
        </div>
      ) : (
        <div className="jugador-rol">
          <div className="jugador-tarjeta">
            <h2>Tu Rol</h2>
            <div className={`jugador-rol-badge ${rol === 'impostor' ? 'impostor' : 'inocente'}`}>
              {rol === 'impostor' ? '🕵️ Impostor' : '👥 Inocente'}
            </div>
            <p className="jugador-palabra">
              <strong>{rol === 'impostor' ? 'Tu pista:' : 'Tu palabra:'}</strong> {palabra}
            </p>
          </div>
          <button
            onClick={() => {
              setRol(null);
              setPalabra(null);
              setFeedback('');
              setEscaneando('inactivo');
            }}
            className="jugador-reiniciar"
          >
            Escanear de nuevo
          </button>
        </div>
      )}

      <Link to="/" className="jugador-link-config">
        Volver al inicio
      </Link>
    </div>
  );
}