import './App.css'
import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

const loadMenu = () => import('./pages/menu')
const loadJuego = () => import('./pages/juego')
const loadConfig = () => import('./pages/config')
const loadPersonalizarTema = () => import('./pages/personalizartema')
const loadAnfitrion = () => import('./pages/anfitrion')
const loadJugador = () => import('./pages/jugador')

const Menu = lazy(loadMenu)
const Juego = lazy(loadJuego)
const Config = lazy(loadConfig)
const PersonalizarTema = lazy(loadPersonalizarTema)
const Anfitrion = lazy(loadAnfitrion)
const Jugador = lazy(loadJugador)

export const preloadMenu = () => void loadMenu()
export const preloadJuego = () => void loadJuego()
export const preloadConfig = () => void loadConfig()
export const preloadPersonalizarTema = () => void loadPersonalizarTema()
export const preloadAnfitrion = () => void loadAnfitrion()
export const preloadJugador = () => void loadJugador()

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="app-cargando">Cargando...</div>}>
        <Routes>
          <Route path='/' element={<Menu/>}/>
          <Route path='/juego' element={<Juego />}/>
          <Route path='/config' element={<Config/>}/>
          <Route path='/personalizartema' element={<PersonalizarTema/>}/>
          <Route path='/anfitrion' element={<Anfitrion/>}/>
          <Route path='/jugador' element={<Jugador/>}/>
          <Route path='*' element={<Menu />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
