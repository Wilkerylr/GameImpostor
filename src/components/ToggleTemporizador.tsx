import '../styles/components/ToggleTemporizador.css';

interface Props {
    activo: boolean;
    tiempo: number;
    setActivo: (valor: boolean) => void;
    setTiempo: (valor: number) => void;
}

export default function ToggleTemporizador({ activo, tiempo, setActivo, setTiempo }: Props) {
    return (
        <div className="toggle-contenedor">
            <div className="toggle-fila">
                <span className="toggle-label">Temporizador</span>
                <button className={`toggle-btn ${activo ? 'toggle-btn-activo' : ''}`} onClick={() => setActivo(!activo)}>
                    <span className="toggle-circulo" />
                </button>
            </div>
            {activo && (
                <div className="toggle-slider-contenedor">
                    <div className="toggle-slider-fila">
                        <span className="toggle-slider-label">Discusión</span>
                        <span className="toggle-slider-valor">{tiempo} min</span>
                    </div>
                    <input
                        className="toggle-slider"
                        type="range"
                        min={1}
                        max={10}
                        value={tiempo}
                        onChange={e => setTiempo(Number(e.target.value))}
                    />
                    <div className="toggle-slider-marcas">
                        <span>1 min</span>
                        <span>10 min</span>
                    </div>
                </div>
            )}
        </div>
    );
}
