import './App.css'
import Menu from './pages/menu'
import Juego from "./pages/juego"
import Config from "./pages/config"
import PersonalizarTema from "./pages/personalizartema"
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Menu/>}/>
        <Route path='/juego' element={<Juego />}/>
        <Route path='/config' element={<Config/>}/>
        <Route path='/personalizartema' element={<PersonalizarTema/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
