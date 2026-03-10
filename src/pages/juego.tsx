import '../styles/buttonstyles.css';
import '../styles/textstyles.css';
import Button from '../components/button';
import {Link} from "react-router-dom"
import {useCargarConfig} from '../model/partida'


export default function Juego(){
  const config = useCargarConfig();

  return (
    <>
      <Link to="/">
        <Button nombre="Menu"/>
      </Link> 

      <h1  className='Titulo' >Verificar configuracion</h1>
      <p>Verificar que la configuracion de la partida sea correcta</p>
      <div className='ContenedorElementos'>

        <div className='Elementos'>
          <p>Numero de jugadores: {config.jugadores}</p>
        </div>

        <div className='Elementos'>
          <p>Numero de impostores: {config.impostores}</p>
        </div>
        
        <div className='Elementos'>
          <p>Tema seleccionado: </p>
        
        </div>
      </div>
        <Button nombre="Iniciar partida"/>
    </>
  )}
