import Button from '../components/button';
import '../styles/buttonstyles.css';
import {Link} from "react-router-dom"

export default function PersonalizarTema (){
    return (
        <>
        <Link to="/">
            <Button nombre="Menu"/>
        </Link> 
            <h1>Personalizar temas</h1>
        </>
    )
}