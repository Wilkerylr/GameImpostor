import './App.css'
import Menu from './pages/menu'
import Juego from "./pages/juego"
import Config from "./pages/config"
import PersonalizarTema from "./pages/personalizartema"
import Anfitrion from "./pages/anfitrion"
import Jugador from "./pages/jugador"
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path='/' element={<Menu/>}/>
        <Route path='/juego' element={<Juego />}/>
        <Route path='/config' element={<Config/>}/>
        <Route path='/personalizartema' element={<PersonalizarTema/>}/>
        <Route path='/anfitrion' element={<Anfitrion/>}/>
        <Route path='/jugador' element={<Jugador/>}/>
        <Route path='*' element={<Menu />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
