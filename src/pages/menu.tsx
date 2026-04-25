import { Link } from 'react-router-dom';
import BotonAyuda from '../components/BotonAyuda';
import { preloadConfig, preloadJuego, preloadPersonalizarTema } from '../App';
import '../styles/pages/Menu.css';

export default function Menu() {
    const precargarRuta = (ruta: 'juego' | 'config' | 'temas') => {
        if (ruta === 'juego') preloadJuego();
        if (ruta === 'config') preloadConfig();
        if (ruta === 'temas') preloadPersonalizarTema();
    };

    return (
        <div className="menu-contenedor">
            <div className="menu-header">
                <img src="./tituloMenu.png" alt="Game Impostor" className="menu-titulo-imagen" />
            </div>

            <div className="menu-acciones">
                <Link
                    to="/juego"
                    className="menu-btn-primario"
                    onMouseEnter={() => precargarRuta('juego')}
                    onFocus={() => precargarRuta('juego')}
                    onTouchStart={() => precargarRuta('juego')}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Iniciar partida
                </Link>
                <Link to="/anfitrion" className="menu-btn-secundario">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                    Modo Anfitrión
                </Link>
                <Link to="/jugador" className="menu-btn-secundario">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 7l-9 5-9-5V3c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v4z" />
                        <path d="M23 7l-9 5-9-5" />
                        <path d="M23 7v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7" />
                    </svg>
                    Modo Jugador
                </Link>
                
                <Link
                    to="/config"
                    className="menu-btn-secundario"
                    onMouseEnter={() => precargarRuta('config')}
                    onFocus={() => precargarRuta('config')}
                    onTouchStart={() => precargarRuta('config')}
                >
                    Configuración
                </Link>
                <Link
                    to="/personalizartema"
                    className="menu-btn-secundario"
                    onMouseEnter={() => precargarRuta('temas')}
                    onFocus={() => precargarRuta('temas')}
                    onTouchStart={() => precargarRuta('temas')}
                >
                    Personalizar temas
                </Link>
            </div>

            <BotonAyuda />

            <p className="menu-legal">
                Esta app no recopila ni transmite datos personales. Los nombres y configuraciones se guardan únicamente en tu dispositivo mediante <em>localStorage</em>. Al usar la app aceptas que eres responsable del contenido que generes con herramientas de IA y pegues en la sección de temas.
            </p>
        </div>
    );
}
