import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import CryptoJS from 'crypto-js';
import BotonMenu from '../components/BotonMenu';
import { useConfiguracion } from '../model/useConfiguracion';
import '../styles/pages/Jugador.css';

interface DatosQR {
  u?: string;
  r?: string;
  p?: string;
}

interface PaqueteQR {
  players?: DatosQR[];
}

export default function Jugador() {
  const { nombres } = useConfiguracion();
  const [llavePartida, setLlavePartida] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState(() => nombres[0] || '');
  const [rol, setRol] = useState<string | null>(null);
  const [palabra, setPalabra] = useState<string | null>(null);
  const [escaneando, setEscaneando] = useState(false);
  const [feedback, setFeedback] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const iniciarEscaneo = () => {
    if (nombres.length === 0) {
      setFeedback('No hay nombres configurados. Ve a configuración para agregarlos.');
      return;
    }

    if (!llavePartida.trim() || !nombreUsuario.trim()) {
      setFeedback('Completa la llave de partida y selecciona tu nombre.');
      return;
    }

    setEscaneando(true);
    setFeedback('Escaneando...');

    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);
  };

  const detenerEscaneo = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setEscaneando(false);
  };

  const onScanSuccess = (decodedText: string) => {
    try {
      const enmascarado = atob(decodedText);
      const key = CryptoJS.enc.Utf8.parse(llavePartida.padEnd(16, '0').slice(0, 16));
      const decrypted = CryptoJS.AES.decrypt(enmascarado, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      const datosStr = decrypted.toString(CryptoJS.enc.Utf8);
      const paquete = JSON.parse(datosStr) as PaqueteQR & DatosQR;

      const jugadores = Array.isArray(paquete.players)
        ? paquete.players
        : paquete.u ? [paquete as DatosQR] : [];

      const partida = jugadores.find(j => j.u?.trim().toLowerCase() === nombreUsuario.trim().toLowerCase());
      if (!partida) {
        setFeedback('Este QR no es para ti o tu nombre no está registrado.');
        return;
      }

      if (!partida.r || !partida.p) {
        setFeedback('El QR no contiene información válida.');
        return;
      }

      setRol(partida.r);
      setPalabra(partida.p);
      setFeedback('¡Rol asignado exitosamente!');
      detenerEscaneo();
    } catch {
      setFeedback('Error al decodificar el QR. Verifica la llave de partida.');
    }
  };

  const onScanFailure = () => {
    // Ignorar errores de escaneo, solo procesar éxitos
  };

  return (
    <div className="jugador-contenedor">
      <BotonMenu />

      <h1 className="jugador-titulo">Modo Jugador</h1>
      <p className="jugador-subtitulo">Escanea el código QR único y obtén tu rol privado.</p>

      {!rol ? (
        <div className="jugador-formulario">
          <div className="jugador-campo">
            <label>Llave de Partida</label>
            <input
              type="text"
              value={llavePartida}
              onChange={(e) => setLlavePartida(e.target.value)}
              placeholder="Ej: fiesta2024"
              maxLength={16}
            />
          </div>

          <div className="jugador-campo">
            <label>Tu Nombre</label>
            {nombres.length > 0 ? (
              <select
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                disabled={escaneando}
              >
                {nombres.map((nombre, index) => (
                  <option key={index} value={nombre}>{nombre || `Jugador ${index + 1}`}</option>
                ))}
              </select>
            ) : (
              <div className="jugador-sin-nombres">
                <p>No hay nombres configurados para esta partida.</p>
                <Link to="/config" className="jugador-link-config">Ir a configuración</Link>
              </div>
            )}
          </div>

          {!escaneando ? (
            <button onClick={iniciarEscaneo} className="jugador-escanear">
              Iniciar Escaneo
            </button>
          ) : (
            <button onClick={detenerEscaneo} className="jugador-detener">
              Detener Escaneo
            </button>
          )}

          <div id="qr-reader" className="jugador-scanner"></div>

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
          <button onClick={() => { setRol(null); setPalabra(null); setFeedback(''); }} className="jugador-reiniciar">
            Escanear Otro QR
          </button>
        </div>
      )}
    </div>
  );
}