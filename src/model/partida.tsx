import { ConfiguracionPredeterminada } from "../controller/configpredeterminada";
import { useState } from "react";

function calcularConfiguracion() {
    const configuracionactual = ConfiguracionPredeterminada;
    let jugadores = configuracionactual.cantidadJugadores;
    let impostores = configuracionactual.cantidadImpostores;

    // Validaciones:
    // 1. Mínimo 3 jugadores (2 normales + 1 impostor)
    if (jugadores < 3) jugadores = 3;
    
    // 2. Máximo 3 impostores
    if (impostores > 3) impostores = 3;
    
    // 3. Impostores debe ser menor que jugadores (mínimo 2 jugadores normales)
    if (impostores >= jugadores - 1) {
        impostores = Math.max(1, jugadores - 2);
    }
    
    // 4. Mínimo 1 impostor
    if (impostores < 1) impostores = 1;

    return { jugadores, impostores };
}

export function useCargarConfig() {
    const [config] = useState(() => calcularConfiguracion());
    return config;
}

export default function Partida() {
    
}
