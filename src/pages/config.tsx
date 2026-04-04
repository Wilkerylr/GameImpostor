import ContadorConfig from "../components/ContadorConfig";
import ListaNombres from "../components/ListaNombres";
import ToggleTemporizador from "../components/ToggleTemporizador";
import BotonMenu from "../components/BotonMenu";
import { useConfiguracion } from '../model/useConfiguracion';
import '../styles/components/ContadorConfig.css';
import '../styles/pages/Config.css';

export default function Config() {
    const { jugadores, setJugadores, impostores, setImpostores, nombres, setNombres, temporizadorActivo, setTemporizadorActivo, tiempoDiscusion, setTiempoDiscusion } = useConfiguracion();

    const impostoresValido = impostores >= 1 && impostores <= 3 && impostores < jugadores - 1;

    return (
        <div className="config-contenedor">
            <BotonMenu />

            <h1 className="config-titulo">Configuración de la partida</h1>
            <p className="config-subtitulo">Los cambios se guardan automáticamente</p>

            <div className="config-grupo">
                <div className="config-fila">
                    <ContadorConfig
                        label="Jugadores"
                        valor={jugadores}
                        min={3}
                        max={20}
                        onChange={setJugadores}
                    />

                    <ContadorConfig
                        label="Impostores"
                        valor={impostores}
                        min={1}
                        max={3}
                        onChange={setImpostores}
                        error={!impostoresValido ? `Debe ser menor que jugadores - 1` : undefined}
                    />
                </div>

                <ListaNombres
                    cantidadJugadores={jugadores}
                    nombres={nombres}
                    setNombres={setNombres}
                />

                <ToggleTemporizador
                    activo={temporizadorActivo}
                    tiempo={tiempoDiscusion}
                    setActivo={setTemporizadorActivo}
                    setTiempo={setTiempoDiscusion}
                />
            </div>
        </div>
    );
}
