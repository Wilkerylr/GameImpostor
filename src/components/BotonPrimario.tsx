// Botón primario reutilizable con estilo pill y color acento.
// Usado en FaseAsignacion y FaseConfig para acciones principales.

import '../styles/components/BotonPrimario.css';

interface Props {
    nombre: string;
    onClick?: () => void;
    disabled?: boolean;
}

export default function BotonPrimario({ nombre, onClick, disabled }: Props) {
    return (
        <button className="btn-primario" onClick={onClick} disabled={disabled}>
            {nombre}
        </button>
    );
}
