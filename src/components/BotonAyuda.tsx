// Botón flotante de ayuda con modal de instrucciones del juego.
import { useState } from 'react';
import '../styles/components/BotonAyuda.css';

export default function BotonAyuda() {
    const [ayudaVisible, setAyudaVisible] = useState(false);

    return (
        <>
            <button className="ayuda-btn" onClick={() => setAyudaVisible(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                ¿Cómo jugar?
            </button>

            {ayudaVisible && (
                <div className="ayuda-overlay" onClick={() => setAyudaVisible(false)}>
                    <div className="ayuda-panel" onClick={e => e.stopPropagation()}>
                        <h2>¿Cómo se juega?</h2>
                        <p>
                            Cada jugador recibió una palabra secreta. Los <strong>inocentes</strong> conocen la palabra real
                            y deben decir pistas relacionadas sin revelarla directamente. Por ejemplo, si la palabra es
                            <em> "Globo"</em>, podrían decir <em>"inflado"</em>, <em>"ligero"</em> o <em>"casa voladora"</em>.
                        </p>
                        <p>
                            Los <strong>impostores</strong> solo recibieron una pista vaga y deben aparentar que conocen
                            la palabra diciendo cosas que suenen creíbles sin delatarse.
                        </p>
                        <p>
                            Cada jugador dice su palabra en orden. Al final, el grupo vota para expulsar a quien crea
                            que es el impostor.
                        </p>
                        <button className="ayuda-cerrar" onClick={() => setAyudaVisible(false)}>Entendido</button>
                    </div>
                </div>
            )}
        </>
    );
}
