import { Link } from 'react-router-dom';
import BotonAyuda from '../components/BotonAyuda';
import '../styles/pages/Menu.css';

export default function Menu() {
    return (
        <div className="menu-contenedor">
            <div className="menu-header">
                <h1 className="menu-titulo">Game Impostor</h1>
                <p className="menu-subtitulo">¿Quién es el impostor?</p>
            </div>

            <div className="menu-acciones">
                <Link to="/juego" className="menu-btn-primario">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Iniciar partida
                </Link>
                <Link to="/config" className="menu-btn-secundario">Configuración</Link>
                <Link to="/personalizartema" className="menu-btn-secundario">Personalizar temas</Link>
            </div>

            <BotonAyuda />

            <p className="menu-legal">
                Esta app no recopila ni transmite datos personales. Los nombres y configuraciones se guardan únicamente en tu dispositivo mediante <em>localStorage</em>. Al usar la app aceptas que eres responsable del contenido que generes con herramientas de IA y pegues en la sección de temas.
            </p>
        </div>
    );
}
