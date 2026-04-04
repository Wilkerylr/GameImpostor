// Página de gestión de temas personalizados.
// Flujos: lista de temas → crear (elegir método: Gemini o manual) → detalle con eliminación de palabras.
// Incluye configuración de API key de Gemini.

import { useState } from 'react';
import BotonMenu from '../components/BotonMenu';
import { useTemas } from '../model/useTemas';
import { useGemini } from '../model/useGemini';
import { promptGenerarLista } from '../model/listapredeterminada';
import type { Entrada } from '../model/obtenerLista';
import '../styles/pages/Temas.css';

type Vista = 'lista' | 'crear' | 'detalle' | 'apikey';
type Metodo = 'gemini' | 'manual';
type PasoCrear = 'nombre' | 'metodo' | 'gemini-cargando' | 'pegar';

export default function PersonalizarTema() {
    const { temas, temaActivo, agregarTema, eliminarTema, activarTema, desactivarTema, eliminarPalabra, puedeAgregar } = useTemas();
    const { apiKey, guardarApiKey, eliminarApiKey, generarTema, estado: estadoGemini, error: errorGemini, setEstado } = useGemini();

    const [vista, setVista] = useState<Vista>('lista');
    const [temaSeleccionado, setTemaSeleccionado] = useState<string | null>(null);

    // Crear tema
    const [nombreNuevo, setNombreNuevo] = useState('');
    const [metodo, setMetodo] = useState<Metodo>('gemini');
    const [paso, setPaso] = useState<PasoCrear>('nombre');
    const [jsonPegado, setJsonPegado] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copiado, setCopiado] = useState(false);

    // API key
    const [keyInput, setKeyInput] = useState('');
    const [keyVisible, setKeyVisible] = useState(false);

    const promptFinal = nombreNuevo ? promptGenerarLista.replace('[TEMA]', nombreNuevo) : '';

    const resetCrear = () => {
        setNombreNuevo('');
        setJsonPegado('');
        setPaso('nombre');
        setError(null);
        setEstado('idle');
    };

    const volverALista = () => { resetCrear(); setVista('lista'); };

    const continuarDesdeNombre = () => {
        if (!nombreNuevo.trim()) return;
        setPaso('metodo');
    };

    const elegirMetodo = async (m: Metodo) => {
        setMetodo(m);
        if (m === 'gemini') {
            setPaso('gemini-cargando');
            const resultado = await generarTema(nombreNuevo.trim());
            if (resultado) {
                const err = agregarTema(nombreNuevo.trim(), resultado);
                if (err) { setError(err); setPaso('metodo'); return; }
                volverALista();
            } else {
                setPaso('metodo');
            }
        } else {
            setPaso('pegar');
        }
    };

    const copiarPrompt = () => {
        navigator.clipboard.writeText(promptFinal);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const guardarTemaManual = () => {
        setError(null);
        let parsed: Entrada[];
        try {
            parsed = JSON.parse(jsonPegado);
            if (!Array.isArray(parsed) || !parsed.every(e => typeof e.palabra === 'string' && typeof e.pista === 'string'))
                throw new Error();
        } catch {
            setError('El JSON no es válido. Asegúrate de pegar exactamente lo que generó la IA.');
            return;
        }
        const err = agregarTema(nombreNuevo.trim(), parsed);
        if (err) { setError(err); return; }
        volverALista();
    };

    const guardarKey = () => {
        if (!keyInput.trim()) return;
        guardarApiKey(keyInput.trim());
        setKeyInput('');
        setVista('lista');
    };

    // ── Vista: configurar API key ──────────────────────────────────────────
    if (vista === 'apikey') return (
        <div className="temas-contenedor">
            <button className="temas-back" onClick={() => setVista('lista')}>← Volver</button>
            <h1 className="config-titulo">API Key de Gemini</h1>
            <p className="config-subtitulo">
                Obtén tu key gratuita en{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                    Google AI Studio
                </a>
            </p>

            {apiKey && (
                <div className="temas-key-actual">
                    <span className="temas-key-label">Key configurada</span>
                    <span className="temas-key-valor">
                        {keyVisible ? apiKey : `${apiKey.slice(0, 6)}${'•'.repeat(20)}`}
                    </span>
                    <div className="temas-key-acciones">
                        <button className="temas-btn-secundario temas-btn-sm" onClick={() => setKeyVisible(v => !v)}>
                            {keyVisible ? 'Ocultar' : 'Mostrar'}
                        </button>
                        <button className="temas-btn-danger temas-btn-sm" onClick={() => { eliminarApiKey(); setKeyVisible(false); }}>
                            Eliminar
                        </button>
                    </div>
                </div>
            )}

            <div className="temas-grupo">
                <input
                    className="temas-input"
                    type="password"
                    placeholder="AIza..."
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && guardarKey()}
                    autoFocus
                />
                <p className="temas-aviso">
                    La API key se guarda únicamente en tu dispositivo. Nunca se transmite a nuestros servidores.
                </p>
                <button className="temas-btn-primario" onClick={guardarKey} disabled={!keyInput.trim()}>
                    {apiKey ? 'Actualizar key' : 'Guardar key'}
                </button>
            </div>
        </div>
    );

    // ── Vista: crear tema ──────────────────────────────────────────────────
    if (vista === 'crear') return (
        <div className="temas-contenedor">
            <button className="temas-back" onClick={volverALista}>← Volver</button>
            <h1 className="config-titulo">Nuevo tema</h1>

            {/* Paso 1: nombre */}
            {paso === 'nombre' && (
                <div className="temas-grupo">
                    <p className="config-subtitulo">¿Sobre qué tema quieres jugar?</p>
                    <input
                        className="temas-input"
                        placeholder="Ej: Películas de terror"
                        value={nombreNuevo}
                        onChange={e => setNombreNuevo(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && continuarDesdeNombre()}
                        autoFocus
                    />
                    <button className="temas-btn-primario" onClick={continuarDesdeNombre} disabled={!nombreNuevo.trim()}>
                        Continuar
                    </button>
                </div>
            )}

            {/* Paso 2: elegir método */}
            {paso === 'metodo' && (
                <div className="temas-grupo">
                    <p className="config-subtitulo">¿Cómo quieres generar las palabras para <strong>{nombreNuevo}</strong>?</p>

                    {errorGemini && <p className="temas-error">{errorGemini}</p>}
                    {error && <p className="temas-error">{error}</p>}

                    <div className="temas-metodos">
                        <button className="temas-metodo-card" onClick={() => elegirMetodo('gemini')} disabled={!apiKey}>
                            <span className="temas-metodo-icono">✨</span>
                            <span className="temas-metodo-titulo">Generar con Gemini</span>
                            <span className="temas-metodo-desc">
                                {apiKey ? 'Genera 100 palabras automáticamente' : 'Requiere API key configurada'}
                            </span>
                        </button>

                        <button className="temas-metodo-card" onClick={() => elegirMetodo('manual')}>
                            <span className="temas-metodo-icono">📋</span>
                            <span className="temas-metodo-titulo">Pegar JSON manualmente</span>
                            <span className="temas-metodo-desc">Usa ChatGPT, Gemini u otra IA</span>
                        </button>
                    </div>

                    {!apiKey && (
                        <button className="temas-btn-secundario" onClick={() => setVista('apikey')}>
                            Configurar API key de Gemini
                        </button>
                    )}
                </div>
            )}

            {/* Paso 3a: Gemini generando */}
            {paso === 'gemini-cargando' && (
                <div className="temas-grupo temas-cargando-contenedor">
                    <div className="temas-spinner" />
                    <p className="config-subtitulo">Generando palabras para <strong>{nombreNuevo}</strong>...</p>
                </div>
            )}

            {/* Paso 3b: manual — pegar JSON */}
            {paso === 'pegar' && (
                <div className="temas-grupo">
                    <p className="config-subtitulo">Copia este prompt y pégalo en ChatGPT o Gemini</p>
                    <div className="temas-prompt-box">
                        <pre>{promptFinal}</pre>
                        <button className="temas-btn-copiar" onClick={copiarPrompt}>
                            {copiado ? '✓ Copiado' : 'Copiar'}
                        </button>
                    </div>
                    <p className="config-subtitulo">Luego pega aquí el JSON que te devuelva</p>
                    <textarea
                        className="temas-textarea"
                        placeholder='[{"palabra": "...", "pista": "..."}, ...]'
                        value={jsonPegado}
                        onChange={e => { setJsonPegado(e.target.value); setError(null); }}
                    />
                    {error && <p className="temas-error">{error}</p>}
                    <p className="temas-aviso">
                        El contenido generado por IA es responsabilidad del usuario. No pegues material con derechos de autor, contenido ofensivo o inapropiado. Al guardar aceptas que eres el único responsable del contenido importado.
                    </p>
                    <button className="temas-btn-primario" onClick={guardarTemaManual} disabled={!jsonPegado.trim()}>
                        Guardar tema
                    </button>
                </div>
            )}
        </div>
    );

    // ── Vista: detalle de tema ─────────────────────────────────────────────
    if (vista === 'detalle' && temaSeleccionado) {
        const palabras = temas[temaSeleccionado] ?? [];
        return (
            <div className="temas-contenedor">
                <button className="temas-back" onClick={() => setVista('lista')}>← Volver</button>
                <h1 className="config-titulo">{temaSeleccionado}</h1>
                <p className="config-subtitulo">{palabras.length} palabras</p>
                <div className="temas-palabras-lista">
                    {palabras.map(e => (
                        <div key={e.palabra} className="temas-palabra-item">
                            <div className="temas-palabra-info">
                                <span className="temas-palabra-nombre">{e.palabra}</span>
                                <span className="temas-palabra-pista">{e.pista}</span>
                            </div>
                            <button className="temas-btn-eliminar-palabra" onClick={() => eliminarPalabra(temaSeleccionado, e.palabra)}>✕</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Vista: lista de temas ──────────────────────────────────────────────
    const nombresT = Object.keys(temas);
    return (
        <div className="temas-contenedor">
            <BotonMenu />
            <div className="temas-header">
                <h1 className="config-titulo">Temas</h1>
                <button className="temas-btn-key" onClick={() => setVista('apikey')} title="Configurar API key de Gemini">
                    {apiKey ? '✓ Gemini' : '⚙ Gemini'}
                </button>
            </div>
            <p className="config-subtitulo">Tema activo: <strong>{temaActivo ?? 'Predeterminado'}</strong></p>

            {temaActivo && (
                <button className="temas-btn-secundario" onClick={desactivarTema}>
                    Usar tema predeterminado
                </button>
            )}

            <div className="temas-lista">
                {nombresT.length === 0 && <p className="temas-vacio">No hay temas guardados aún</p>}
                {nombresT.map(nombre => (
                    <div key={nombre} className={`temas-card ${temaActivo === nombre ? 'temas-card-activo' : ''}`}>
                        <div className="temas-card-info" onClick={() => { setTemaSeleccionado(nombre); setVista('detalle'); }}>
                            <span className="temas-card-nombre">{nombre}</span>
                            <span className="temas-card-count">{temas[nombre].length} palabras</span>
                        </div>
                        <div className="temas-card-acciones">
                            {temaActivo === nombre
                                ? <button className="temas-btn-activo" onClick={desactivarTema}>Activo</button>
                                : <button className="temas-btn-activar" onClick={() => activarTema(nombre)}>Activar</button>
                            }
                            <button className="temas-btn-eliminar" onClick={() => eliminarTema(nombre)}>✕</button>
                        </div>
                    </div>
                ))}
            </div>

            {puedeAgregar
                ? <button className="temas-btn-primario" onClick={() => setVista('crear')}>+ Nuevo tema</button>
                : <p className="temas-limite">Límite de 5 temas alcanzado. Elimina uno para agregar otro.</p>
            }
        </div>
    );
}
