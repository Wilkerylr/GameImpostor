import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BotonMenu from '../components/BotonMenu';
import { obtenerAsignacionParaJugador } from '../model/multiDispositivo';
import '../styles/pages/Jugador.css';

type EstadoEscaner = 'inactivo' | 'iniciando' | 'activo' | 'resuelto';

export default function Jugador() {
  // --- ESTADOS ---
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [rol, setRol] = useState<string | null>(null);
  const [palabra, setPalabra] = useState<string | null>(null);
  const [escaneando, setEscaneando] = useState<EstadoEscaner>('inactivo');
  const [feedback, setFeedback] = useState('');
  const [mostrarRevelador, setMostrarRevelador] = useState(false); // Movido adentro del componente

  const scannerRef = useRef<{
    stop?: () => Promise<void>;
    clear?: () => Promise<void> | void;
  } | null>(null);
  
  const regionId = 'qr-reader';

  // --- FUNCIONES ---

  const detenerEscaneo = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      if (typeof scanner.stop === 'function') await scanner.stop();
      if (typeof scanner.clear === 'function') await scanner.clear();
    } catch (e) {
      console.warn("Error limpiando scanner:", e);
    }
    scannerRef.current = null;
  }, []);

  const onScanSuccess = useCallback(
    async (decodedText: string) => {
      const nombreLimpio = nombreUsuario.trim();
      
      if (!nombreLimpio) {
        setFeedback('Escribe tu nombre antes de escanear.');
        return;
      }

      try {
        const asignacion = await obtenerAsignacionParaJugador(decodedText, nombreLimpio);

        if (asignacion) {
          // Vibración opcional para feedback táctil
          if (navigator.vibrate) navigator.vibrate(200);

          setRol(asignacion.rol);
          setPalabra(asignacion.palabra);
          setFeedback('¡Lectura correcta!');
          setEscaneando('resuelto');
          setMostrarRevelador(true); // Activa el mensaje de "Ver rol"
          await detenerEscaneo();
        } else {
          setFeedback('No se encontró información para tu nombre en este QR.');
        }
      } catch (e) {
        setFeedback('Error: El QR no es válido o está dañado.');
      }
    },
    [detenerEscaneo, nombreUsuario],
  );

  const onScanFailure = useCallback(() => {
    // Silencioso: html5-qrcode lanza esto constantemente mientras busca
  }, []);

  const iniciarEscaneo = useCallback(async () => {
    const nombreLimpio = nombreUsuario.trim();

    if (!nombreLimpio) {
      setFeedback('Escribe tu nombre exactamente como lo configuró el anfitrión.');
      return;
    }

    setRol(null);
    setPalabra(null);
    setFeedback('Cargando cámara...');
    setEscaneando('iniciando');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure,
      );

      setEscaneando('activo');
      setFeedback('Apunta al QR maestro del grupo.');
    } catch (err) {
      setEscaneando('inactivo');
      setFeedback('Error: No se pudo acceder a la cámara.');
      await detenerEscaneo();
    }
  }, [nombreUsuario, onScanSuccess, onScanFailure, detenerEscaneo]);

  useEffect(() => {
    return () => {
      void detenerEscaneo();
    };
  }, [detenerEscaneo]);

  // --- RENDER ---
  return (
    <div className="jugador-contenedor">
      <BotonMenu />
      <h1 className="jugador-titulo">Modo Jugador</h1>

      {/* PASO 1: Formulario y Scanner */}
      {!rol && (
        <div className="jugador-formulario">
          <p className="jugador-subtitulo">Escribe tu nombre y escanea el QR maestro.</p>
          <div className="jugador-campo">
            <label htmlFor="jugador-nombre">Tu Nombre</label>
            <input
              id="jugador-nombre"
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              placeholder="Ej: Ana"
              disabled={escaneando !== 'inactivo'}
            />
          </div>

          {escaneando === 'inactivo' && (
            <button onClick={() => void iniciarEscaneo()} className="jugador-escanear">
              Escanear QR maestro
            </button>
          )}

          <div id={regionId} className="jugador-scanner"></div>
          
          {feedback && (
            <div className={`jugador-feedback ${feedback.includes('Error') ? 'error' : 'info'}`}>
              {feedback}
            </div>
          )}
        </div>
      )}

      {/* PASO 2: Confirmación exitosa (Oculta el rol) */}
      {rol && mostrarRevelador && (
        <div className="jugador-confirmacion">
          <div className="jugador-feedback success">
            ✅ Rol asignado correctamente
          </div>
          <p className="instruccion-secreta">Asegúrate de que nadie esté mirando tu pantalla.</p>
          <button 
            onClick={() => setMostrarRevelador(false)} 
            className="btn-ver-rol"
          >
            👁️ Ver mi rol
          </button>
        </div>
      )}

      {/* PASO 3: Revelación del Rol */}
      {rol && !mostrarRevelador && (
        <div className="jugador-rol">
          <div className="jugador-tarjeta animacion-revelar">
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
              setMostrarRevelador(false);
              setEscaneando('inactivo');
              setFeedback('');
            }}
            className="jugador-reiniciar"
          >
            Escanear otra partida
          </button>
        </div>
      )}

      <Link to="/" className="jugador-link-config">Volver al inicio</Link>
    </div>
  );
}