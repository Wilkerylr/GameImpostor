import Button from '../components/button';
import '../styles/buttonstyles.css';
import {Link} from "react-router-dom"

export default function Menu() {
    return (
        <>
            <div className= "StylesContenedorButton">
            
            <Link to="/juego">
                <Button nombre="Iniciar" />
            </Link>
            <Link to="/config">
                <Button nombre="Configuracion de partida" />
            </Link>
            <Link to="/personalizartema">
                <Button nombre="Personalizar temas"/>
            </Link>
            </div>
        </>
    )
}