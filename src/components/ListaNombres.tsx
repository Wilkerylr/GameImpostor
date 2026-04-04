import { useState } from 'react';
import '../styles/components/ListaNombres.css';

interface Props {
    cantidadJugadores: number;
    nombres: string[];
    setNombres: (nombres: string[]) => void;
}

export default function ListaNombres({ cantidadJugadores, nombres, setNombres }: Props) {
    const [input, setInput] = useState('');

    const agregar = () => {
        if (!input.trim() || nombres.length >= cantidadJugadores) return;
        setNombres([...nombres, input.trim()]);
        setInput('');
    };

    const eliminar = (index: number) => {
        setNombres(nombres.filter((_, i) => i !== index));
    };

    return (
        <div className="nombres-contenedor">
            <span className="nombres-label">Jugadores ({nombres.length}/{cantidadJugadores})</span>

            <div className="nombres-input-fila">
                <input
                    type="text"
                    placeholder="Nombre del jugador"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && agregar()}
                    disabled={nombres.length >= cantidadJugadores}
                />
                <button onClick={agregar} disabled={nombres.length >= cantidadJugadores}>+</button>
            </div>

            <div className="nombres-lista">
                {nombres.map((nombre, i) => (
                    <div key={i} className="nombres-item">
                        <span>{nombre}</span>
                        <button className="nombres-eliminar" onClick={() => eliminar(i)}>✕</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
