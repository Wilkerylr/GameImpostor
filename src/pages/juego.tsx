import { usePartida } from '../model/partida';
import FaseConfig from '../components/FaseConfig';
import FaseAsignacion from '../components/FaseAsignacion';
import FaseJuego from '../components/FaseJuego';

export default function Juego() {
    const { fase, avanzarFase, reiniciarPartida, asignacion, configuracion } = usePartida();

    if (fase === 'config') return <FaseConfig avanzarFase={avanzarFase} configuracion={configuracion} />;
    if (fase === 'asignacion') return <FaseAsignacion avanzarFase={avanzarFase} asignacion={asignacion} />;
    return <FaseJuego jugadores={asignacion.jugadores} configuracion={configuracion} onJugarDeNuevo={reiniciarPartida} />;
}
