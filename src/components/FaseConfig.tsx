// Vista de la fase de configuración de partida:
// - Permite editar cantidad de jugadores e impostores
// - Permite seleccionar el tema activo entre los guardados
// - Controla el temporizador de discusión
// - Valida parámetros antes de habilitar el avance a asignación de roles

import BotonPrimario from './BotonPrimario';
import ContadorConfig from './ContadorConfig';
import BotonSalir from './BotonSalir';
import ToggleTemporizador from './ToggleTemporizador';
import { useConfiguracion } from '../model/useConfiguracion';
import { useTemas } from '../model/useTemas';
import '../styles/components/ContadorConfig.css';
import '../styles/pages/Config.css';

interface Props {
    avanzarFase: () => void;
    configuracion: ReturnType<typeof useConfiguracion>;
}

export default function FaseConfig({ avanzarFase, configuracion }: Props) {
    const { jugadores, setJugadores, impostores, setImpostores, temporizadorActivo, setTemporizadorActivo, tiempoDiscusion, setTiempoDiscusion } = configuracion;
    const { temas, temaActivo, activarTema, desactivarTema } = useTemas();
    const nombresTemas = Object.keys(temas);

    const impostoresValido = impostores >= 1 && impostores <= 3 && impostores < jugadores - 1;

    return (
        <div className="config-contenedor">
            <BotonSalir />
            <h1 className="config-titulo">Configuración</h1>
            <p className="config-subtitulo">Ajusta los parámetros antes de iniciar</p>

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

                {nombresTemas.length > 0 && (
                    <div className="config-tema">
                        <span className="config-tema-label">Tema</span>
                        <div className="config-tema-opciones">
                            <button
                                className={`config-tema-btn ${!temaActivo ? 'config-tema-btn-activo' : ''}`}
                                onClick={desactivarTema}
                            >
                                Predeterminado
                            </button>
                            {nombresTemas.map(nombre => (
                                <button
                                    key={nombre}
                                    className={`config-tema-btn ${temaActivo === nombre ? 'config-tema-btn-activo' : ''}`}
                                    onClick={() => temaActivo === nombre ? desactivarTema() : activarTema(nombre)}
                                >
                                    {nombre}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <ToggleTemporizador
                    activo={temporizadorActivo}
                    tiempo={tiempoDiscusion}
                    setActivo={setTemporizadorActivo}
                    setTiempo={setTiempoDiscusion}
                />
            </div>

            <BotonPrimario
                nombre="Asignar roles"
                onClick={impostoresValido ? avanzarFase : undefined}
                disabled={!impostoresValido}
            />
        </div>
    );
}
