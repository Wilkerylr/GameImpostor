// Vista de la fase de asignación de roles:
// - Muestra el turno de cada jugador para ver su rol en privado
// - Oculta la información hasta que el jugador confirme que es su turno
// - Al terminar todos, muestra pantalla final con botón para iniciar el juego

import { useState } from "react";
import BotonPrimario from "./BotonPrimario";
import BotonSalir from "./BotonSalir";
import CardRol from "./CardRol";
import { useAsignacion } from "../model/useAsignacion";
import '../styles/components/FaseAsignacion.css';

interface Props {
    avanzarFase: () => void;
    asignacion: ReturnType<typeof useAsignacion>;
}

export default function FaseAsignacion({ avanzarFase, asignacion }: Props) {
    const { jugadores, turnoActual, rolVisible, setRolVisible, terminado, asignarNombre, avanzarTurno } = asignacion;
    const jugadorActual = jugadores[turnoActual];
    const [input, setInput] = useState('');

    const confirmarNombre = () => {
        if (!input.trim()) return;
        asignarNombre(input);
        setInput('');
    };

    if (terminado) return (
        <>
            <BotonSalir />
            <div className="asignacion-lupa-contenedor">
                <img src="./rolesAsignados.png" alt="Roles asignados" className="asignacion-imagen-final" width="200" height="200" />
                <BotonPrimario nombre="Iniciar Partida" onClick={avanzarFase} />
            </div>
        </>
    );

    return (
        <div className="asignacion-contenedor">
            <BotonSalir />
            <h1>Asignación de roles</h1>

            {!jugadorActual?.nombre ? (
                <div className="asignacion-input-contenedor">
                    <p className="asignacion-input-label">Jugador {turnoActual + 1}</p>
                    <input
                        className="asignacion-input"
                        type="text"
                        placeholder="Tu nombre"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && confirmarNombre()}
                        autoFocus
                    />
                    <BotonPrimario nombre="Confirmar" onClick={confirmarNombre} />
                </div>
            ) : (
                <>
                    {!rolVisible ? (
                        <>
                            <div className="ver-rol-contenedor">
                                <p className="ver-rol-titulo">Turno de</p>
                                <p className="ver-rol-nombre">{jugadorActual.nombre}</p>
                                <p className="ver-rol-descripcion">Presiona el botón cuando estés listo para ver tu rol en privado</p>
                            </div>
                            <BotonPrimario nombre="Ver mi rol" onClick={() => setRolVisible(true)} />
                        </>
                    ) : (
                        <>
                            <CardRol jugador={jugadorActual} />
                            <BotonPrimario nombre="Listo" onClick={avanzarTurno} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}
