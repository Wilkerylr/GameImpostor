import type { Jugador } from '../model/types.tsx';
import '../styles/components/CardRol.css';

interface Props {
    jugador: Jugador;
}

export default function CardRol({ jugador }: Props) {
    const esImpostor = jugador.rol === 'impostor';

    return (
        <div className={`card-rol ${esImpostor ? 'card-rol-impostor' : 'card-rol-inocente'}`}>
            <span className="card-rol-nombre">{jugador.nombre}</span>
            <div className="card-rol-badge">
                {esImpostor ? 'Impostor' : 'Inocente'}
            </div>
            <div className="card-rol-divider" />
            <div className="card-rol-info">
                <span className="card-rol-label">{esImpostor ? 'Tu pista' : 'Tu palabra'}</span>
                <span className="card-rol-palabra">{jugador.palabra}</span>
            </div>
        </div>
    );
}
