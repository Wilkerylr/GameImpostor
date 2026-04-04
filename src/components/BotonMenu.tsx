// Botón fijo en esquina superior izquierda para volver al menú desde páginas secundarias (config, temas).
// No muestra confirmación ya que no hay partida en curso.
import { useNavigate } from 'react-router-dom';
import '../styles/components/BotonSalir.css';

export default function BotonMenu() {
    const navigate = useNavigate();

    return (
        <button className="salir-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Menú
        </button>
    );
}
