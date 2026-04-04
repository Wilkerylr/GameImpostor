import '../styles/components/ToggleLeaderboard.css';

interface Props {
    activo: boolean;
    setActivo: (valor: boolean) => void;
}

export default function ToggleLeaderboard({ activo, setActivo }: Props) {
    return (
        <div className="toggle-contenedor">
            <div className="toggle-fila">
                <div>
                    <span className="toggle-label">Tabla de posiciones</span>
                    <p className="toggle-descripcion">Activa el sistema de puntajes para ver la tabla al finalizar cada ronda.</p>
                </div>
                <button className={`toggle-btn ${activo ? 'toggle-btn-activo' : ''}`} onClick={() => setActivo(!activo)}>
                    <span className="toggle-circulo" />
                </button>
            </div>
        </div>
    );
}