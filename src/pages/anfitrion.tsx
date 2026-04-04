import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import { useConfiguracion } from '../model/useConfiguracion';
import { obtenerLista } from '../model/obtenerLista';
import BotonMenu from '../components/BotonMenu';
import '../styles/pages/Anfitrion.css';

interface JugadorAsignado {
  nombre: string;
  rol: 'inocente' | 'impostor';
  palabra: string;
}

export default function Anfitrion() {
  const { jugadores, impostores, nombres } = useConfiguracion();
  const [llavePartida, setLlavePartida] = useState(() => sessionStorage.getItem('anfitrion_llavePartida') || '');
  const [asignaciones, setAsignaciones] = useState<JugadorAsignado[]>(() => {
    const stored = sessionStorage.getItem('anfitrion_asignaciones');
    return stored ? JSON.parse(stored) : [];
  });
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(() => sessionStorage.getItem('anfitrion_qrDataUrl'));
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!asignaciones.length || !qrDataUrl) return;
    sessionStorage.setItem('anfitrion_asignaciones', JSON.stringify(asignaciones));
    sessionStorage.setItem('anfitrion_qrDataUrl', qrDataUrl);
    sessionStorage.setItem('anfitrion_llavePartida', llavePartida);
  }, [asignaciones, qrDataUrl, llavePartida]);

  const generarRoles = async () => {
    const nombresValidos = nombres.filter(n => n.trim()).slice(0, jugadores);
    if (nombresValidos.length < jugadores) {
      setError('Completa los nombres de todos los jugadores en la configuración.');
      return;
    }

    if (!llavePartida.trim()) {
      setError('Ingresa la llave de partida.');
      return;
    }

    if (impostores < 1 || impostores >= jugadores) {
      setError('La configuración de impostores no es válida.');
      return;
    }

    const lista = obtenerLista();
    if (!lista.length) {
      setError('No hay palabras disponibles en el tema activo. Revisa la configuración de temas.');
      return;
    }

    setError('');

    const historial: string[] = JSON.parse(sessionStorage.getItem('historial_palabras') || '[]');
    const disponibles = lista.filter(e => !historial.includes(e.palabra));
    const entrada = (disponibles.length > 0 ? disponibles : lista)[Math.floor(Math.random() * (disponibles.length > 0 ? disponibles.length : lista.length))];
    const nuevoHistorial = [entrada.palabra, ...historial].slice(0, 15);
    sessionStorage.setItem('historial_palabras', JSON.stringify(nuevoHistorial));

    const roles = [
      ...Array(impostores).fill('impostor' as const),
      ...Array(jugadores - impostores).fill('inocente' as const)
    ].sort(() => Math.random() - 0.5) as Array<'inocente' | 'impostor'>;

    const nombresOrdenados = [...nombresValidos].sort(() => Math.random() - 0.5);
    const nuevaAsignacion = nombresOrdenados.map((nombre, index) => ({
      nombre,
      rol: roles[index],
      palabra: roles[index] === 'inocente' ? entrada.palabra : entrada.pista
    }));

    setAsignaciones(nuevaAsignacion);

    const datosQr = JSON.stringify({ players: nuevaAsignacion, salt: Date.now() });
    const enmascarado = enmascararDatos(datosQr, llavePartida);
    const base64 = btoa(enmascarado);
    const qr = await QRCode.toDataURL(base64, { width: 320 });
    setQrDataUrl(qr);
  };

  const enmascararDatos = (datos: string, llave: string): string => {
    const key = CryptoJS.enc.Utf8.parse(llave.padEnd(16, '0').slice(0, 16));
    const encrypted = CryptoJS.AES.encrypt(datos, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  };

  const descargarQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'qr-partida.png';
    link.click();
  };

  const regenerarQR = async () => {
    if (!asignaciones.length) {
      setError('No hay asignaciones guardadas para regenerar.');
      return;
    }
    if (!llavePartida.trim()) {
      setError('Ingresa la llave de partida para regenerar el QR.');
      return;
    }

    setError('');
    const datosQr = JSON.stringify({ players: asignaciones, salt: Date.now() });
    const enmascarado = enmascararDatos(datosQr, llavePartida);
    const base64 = btoa(enmascarado);
    const qr = await QRCode.toDataURL(base64, { width: 320 });
    setQrDataUrl(qr);
  };

  return (
    <div className="anfitrion-contenedor">
      <BotonMenu />

      <h1 className="anfitrion-titulo">Modo Anfitrión</h1>
      <p className="anfitrion-subtitulo">Usa la configuración de partida existente y genera un solo QR para todos.</p>

      {!qrDataUrl ? (
        <div className="anfitrion-formulario">
          <div className="anfitrion-campo">
            <label>Llave de Partida</label>
            <input
              type="text"
              value={llavePartida}
              onChange={(e) => setLlavePartida(e.target.value)}
              placeholder="Ej: fiesta2024"
              maxLength={16}
            />
          </div>

          <div className="anfitrion-campo">
            <label>Jugadores configurados</label>
            <ul className="anfitrion-lista-nombres">
              {nombres.map((nombre, index) => (
                <li key={index}>{nombre || `Jugador ${index + 1}`}</li>
              ))}
            </ul>
            <span className="anfitrion-info">Edita los nombres en la configuración antes de generar el QR.</span>
          </div>

          <div className="anfitrion-campo">
            <span className="anfitrion-info">Impostores: {impostores} / Jugadores: {jugadores}</span>
            <span className="anfitrion-info">Tema: se usa el tema activo actual de la app.</span>
          </div>

          {error && <p className="anfitrion-error">{error}</p>}

          <button onClick={generarRoles} className="anfitrion-generar">
            Generar Código QR único
          </button>
        </div>
      ) : (
        <div className="anfitrion-resultado">
          <h2>Código QR generado</h2>
          <div className="anfitrion-qr-unico">
            <img src={qrDataUrl} alt="QR de partida" />
          </div>
          <button onClick={descargarQR} className="anfitrion-descargar">
            Descargar QR
          </button>
          <button onClick={regenerarQR} className="anfitrion-descargar">
            Regenerar QR
          </button>
          <div className="anfitrion-lista">
            <h3>Jugadores en esta partida</h3>
            <ul>
              {asignaciones.map((jugador) => (
                <li key={jugador.nombre}>{jugador.nombre}</li>
              ))}
            </ul>
          </div>
          <button onClick={() => navigate('/jugador')} className="anfitrion-jugar">
            Ir al Modo Jugador
          </button>
        </div>
      )}
    </div>
  );
}