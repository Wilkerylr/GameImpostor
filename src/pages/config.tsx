import { Link } from "react-router-dom";
import Button from "../components/button";
import {useCargarConfig} from '../model/partida'

export default function Config(){
    const config = useCargarConfig();

    return(
        <>
        <Link to="/">
            <Button nombre="Menu"/>
        </Link> 

            <h1>Configuracion de la partida</h1>
            <p>Jugadores: {config.jugadores}</p>
            <p>Impostores: {config.impostores}</p>
        </>
    )
}