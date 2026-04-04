// Botón fijo en esquina superior izquierda para salir de una partida en curso.
// Muestra modal de confirmación y limpia el sessionStorage antes de navegar al menú.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { limpiarPartida } from '../model/limpiarPartida';
import '../styles/components/BotonSalir.css';

export default function BotonSalir() {
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    const confirmarSalida = () => {
        limpiarPartida();
        navigate('/');
    };

    return (
        <>
            <button className="salir-btn" onClick={() => setVisible(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Menú
            </button>

            {visible && (
                <div className="salir-overlay" onClick={() => setVisible(false)}>
                    <div className="salir-panel" onClick={e => e.stopPropagation()}>
                        <h2>¿Salir de la partida?</h2>
                        <p>Perderás todo el progreso actual y tendrás que empezar de nuevo.</p>
                        <div className="salir-acciones">
                            <button className="salir-cancelar" onClick={() => setVisible(false)}>Cancelar</button>
                            <button className="salir-confirmar" onClick={confirmarSalida}>Salir</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
