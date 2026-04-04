import './App.css'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Menu = lazy(() => import('./pages/menu'))
const Juego = lazy(() => import('./pages/juego'))
const Config = lazy(() => import('./pages/config'))
const PersonalizarTema = lazy(() => import('./pages/personalizartema'))
const Anfitrion = lazy(() => import('./pages/anfitrion'))
const Jugador = lazy(() => import('./pages/jugador'))

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
    </BrowserRouter>
  )
}

export default App
