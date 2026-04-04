import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfiguracion } from '../model/useConfiguracion';
import { obtenerLista } from '../model/obtenerLista';
import { 
  construirPaquetePartida, 
  serializarPaquetePartida, 
  generarPartidaId,
  type JugadorAsignado 
} from '../model/multiDispositivo'; // Asegúrate de que la ruta sea correcta
import BotonMenu from '../components/BotonMenu';
import '../styles/pages/Anfitrion.css';

interface EntradaLista {
  palabra: string;
  pista: string;
}

const obtenerEntradaAleatoria = (lista: EntradaLista[], historial: string[]): EntradaLista => {
  const disponibles = lista.filter((elemento) => !historial.includes(elemento.palabra));
  const opciones = disponibles.length > 0 ? disponibles : lista;
  return opciones[Math.floor(Math.random() * opciones.length)];
};

const mezclar = <T,>(elementos: T[]): T[] => [...elementos].sort(() => Math.random() - 0.5);

export default function Anfitrion() {
  const { jugadores, impostores, nombres } = useConfiguracion();
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
  }, [asignaciones, qrDataUrl]);

  const generarRoles = async () => {
    const nombresValidos = nombres.filter(n => n.trim()).slice(0, jugadores);
    
    if (nombresValidos.length < jugadores) {
      setError(`Faltan nombres. Configura ${jugadores} jugadores en el menú anterior.`);
      return;
    }

    if (impostores < 1 || impostores >= jugadores) {
      setError('La configuración de impostores no es válida.');
      return;
    }

    const lista = obtenerLista();
    if (!lista.length) {
      setError('No hay palabras disponibles. Revisa la configuración de temas.');
      return;
    }

    setError('');

    // Lógica de selección de palabras
    const historial: string[] = JSON.parse(sessionStorage.getItem('historial_palabras') || '[]');
    const entrada = obtenerEntradaAleatoria(lista, historial);
    const nuevoHistorial = [entrada.palabra, ...historial].slice(0, 15);
    sessionStorage.setItem('historial_palabras', JSON.stringify(nuevoHistorial));

    // Asignación de Roles
    const roles = mezclar([
      ...Array(impostores).fill('impostor' as const),
      ...Array(jugadores - impostores).fill('inocente' as const)
    ]) as Array<'inocente' | 'impostor'>;

    const nombresOrdenados = mezclar(nombresValidos);
    const nuevaAsignacion: JugadorAsignado[] = nombresOrdenados.map((nombre, index) => ({
      nombre,
      rol: roles[index],
      palabra: roles[index] === 'inocente' ? entrada.palabra : entrada.pista
    }));

    setAsignaciones(nuevaAsignacion);

    try {
      // --- NUEVA LÓGICA DE PAQUETE QR ---
      const partidaId = generarPartidaId();
      const paquete = await construirPaquetePartida(nuevaAsignacion, partidaId);
      const stringParaQR = serializarPaquetePartida(paquete);

      // Generar el QR visual
      const { default: QRCode } = await import('qrcode');
      // Usamos errorCorrectionLevel: 'L' para que sea más fácil de leer en móviles
      const qr = await QRCode.toDataURL(stringParaQR, { 
        width: 400, 
        margin: 2,
        errorCorrectionLevel: 'L' 
      });
      
      setQrDataUrl(qr);
    } catch (err) {
      console.error(err);
      setError('Error al generar el paquete de seguridad de la partida.');
    }
  };

  const descargarQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-partida-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="anfitrion-contenedor">
      <BotonMenu />

      <h1 className="anfitrion-titulo">Modo Anfitrión</h1>
      <p className="anfitrion-subtitulo">Genera un solo QR. Cada jugador verá solo su información al escanearlo.</p>

      {!qrDataUrl ? (
        <div className="anfitrion-formulario">
          <div className="anfitrion-campo">
            <label>Jugadores configurados ({jugadores})</label>
            <ul className="anfitrion-lista-nombres">
              {nombres.filter(n => n.trim()).map((nombre, index) => (
                <li key={index}>✅ {nombre}</li>
              ))}
            </ul>
          </div>

          <div className="anfitrion-campo">
            <div className="anfitrion-badge-info">
              <span>🕵️ {impostores} Impostores</span>
              <span>👥 {jugadores - impostores} Inocentes</span>
            </div>
          </div>

          {error && <p className="anfitrion-error">{error}</p>}

          <button onClick={generarRoles} className="anfitrion-generar">
            Generar Partida y QR Maestro
          </button>
        </div>
      ) : (
        <div className="anfitrion-resultado">
          <div className="anfitrion-qr-card">
            <h2>QR de la Partida</h2>
            <div className="anfitrion-qr-unico">
              <img src={qrDataUrl} alt="QR de partida" />
            </div>
            <p className="anfitrion-instruccion">Pide a tus amigos que escaneen este código desde sus teléfonos.</p>
          </div>
          
          <div className="anfitrion-acciones">
            <button onClick={descargarQR} className="anfitrion-descargar">
              💾 Guardar Imagen
            </button>
            <button onClick={() => setQrDataUrl(null)} className="anfitrion-reset">
              🔄 Nueva Partida
            </button>
          </div>

          <button onClick={() => navigate('/jugador')} className="anfitrion-jugar">
            Ir a mi rol (Modo Jugador)
          </button>
        </div>
      )}
    </div>
  );
}