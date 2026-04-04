// TODO: reemplazar href con el link de donación real antes de integrar
export default function BotonDonacion() {
    return (
        <a
            href="https://www.patreon.com/TU_USUARIO"
            target="_blank"
            rel="noopener noreferrer"
            className="menu-btn-patreon"
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.82 2.41C18.78 2.41 22 5.65 22 9.62c0 3.96-3.22 7.18-7.18 7.18-3.96 0-7.17-3.22-7.17-7.18 0-3.97 3.21-7.21 7.17-7.21M2 21.6h3.5V2.41H2V21.6z"/>
            </svg>
            Apoyar en Patreon
        </a>
    );
}
