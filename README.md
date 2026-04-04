# GameImpostor

Juego de mesa digital tipo "Impostor/Undercover". Cada jugador recibe una palabra secreta en privado — los inocentes conocen la palabra real, el impostor solo recibe una pista vaga. El grupo discute y vota para expulsar al impostor.

Construido con **React + TypeScript + Vite**.

---

## Rutas

| Ruta | Página | Descripción |
|---|---|---|
| `/` | `menu.tsx` | Pantalla de inicio con navegación |
| `/juego` | `juego.tsx` | Orquesta las 3 fases del juego |
| `/config` | `config.tsx` | Configuración persistente de la partida |
| `/personalizartema` | `personalizartema.tsx` | Gestión de temas personalizados con IA |

---

## Estructura del proyecto

```
src/
├── pages/          → Una página por ruta
├── components/     → Componentes reutilizables
├── model/          → Lógica, estado y tipos
├── styles/
│   ├── components/ → Un CSS por componente
│   ├── pages/      → Un CSS por página
│   └── global/     → Estilos globales compartidos
├── App.tsx         → Definición de rutas
├── App.css         → Contenedor raíz (#root)
├── index.css       → Variables CSS globales y estilos base
└── main.tsx        → Punto de entrada
```

---

## Páginas (`pages/`)

- **`menu.tsx`** — Pantalla de inicio. Botones de navegación, ayuda y aviso legal de privacidad.
- **`juego.tsx`** — Orquesta las 3 fases del juego (`config → asignacion → juego`) usando `usePartida`.
- **`config.tsx`** — Configuración persistente: nombres de jugadores, cantidad de jugadores/impostores y temporizador. Los cambios se guardan automáticamente en `localStorage`.
- **`personalizartema.tsx`** — Gestión de temas personalizados. Flujo: escribir nombre del tema → copiar prompt → pegar JSON generado por IA → guardar. Permite ver, activar, eliminar temas y eliminar palabras individuales.

---

## Componentes (`components/`)

### Navegación
| Componente | Descripción |
|---|---|
| `BotonSalir` | Fijo arriba izquierda. Muestra confirmación antes de salir de una partida y limpia el `sessionStorage`. |
| `BotonMenu` | Fijo arriba izquierda. Vuelve al menú sin confirmación. Usado fuera de partidas activas. |
| `BotonAyuda` | Fijo abajo derecha. Abre modal con instrucciones del juego. |
| `BotonPrimario` | Botón pill naranja reutilizable para acciones principales. |
| `BotonDonacion` | Preparado pero no integrado. Link a plataforma de donación voluntaria. |

### Configuración
| Componente | Descripción |
|---|---|
| `ContadorConfig` | Contador +/- para ajustar jugadores e impostores. |
| `ListaNombres` | Lista editable de nombres con input y botón eliminar por ítem. |
| `ToggleTemporizador` | Switch para activar el temporizador + slider para ajustar duración. |

### Fases del juego
| Componente | Descripción |
|---|---|
| `FaseConfig` | Configuración rápida antes de iniciar: jugadores, impostores, tema activo y temporizador. |
| `FaseAsignacion` | Turno por turno para que cada jugador vea su rol en privado antes de pasar el dispositivo. |
| `CardRol` | Tarjeta que muestra el rol (inocente/impostor) y la palabra o pista secreta. |
| `FaseJuego` | Fase de discusión. Muestra quién empieza, lista de jugadores y temporizador opcional. |
| `FaseVotacion` | Votación por consenso, adivinanza del impostor y pantalla de resultado final. |

---

## Modelo (`model/`)

### Tipos y datos
| Archivo | Descripción |
|---|---|
| `types.tsx` | Tipo `Jugador`: `nombre`, `rol` (`inocente` \| `impostor`), `palabra`. |
| `configpredeterminada.tsx` | Valores por defecto: 4 jugadores, 1 impostor. |
| `listapredeterminada.tsx` | 100 palabras predeterminadas + prompt para generar listas con IA. |

### Utilidades
| Archivo | Descripción |
|---|---|
| `obtenerLista.tsx` | Devuelve la lista activa: tema personalizado si hay uno seleccionado, o la lista predeterminada. |
| `limpiarPartida.ts` | Elimina todas las claves de partida del `sessionStorage`. Se llama al salir o al ir al menú desde el resultado. |

### Hooks
| Hook | Storage | Descripción |
|---|---|---|
| `useConfiguracion` | `localStorage` | Jugadores, impostores, nombres, temporizador activo y tiempo de discusión. |
| `useTemas` | `localStorage` | Temas personalizados (máx. 5) y tema activo. |
| `useAsignacion` | `sessionStorage` | Genera y persiste roles/palabras, controla turnos de asignación y estado de finalización. |
| `useVotacion` | `sessionStorage` | Maneja jugadores activos, expulsión, adivinanza del impostor y resultado. |
| `partida` | `sessionStorage` | Orquestador principal. Controla la fase actual y conecta `useConfiguracion` y `useAsignacion`. |

---

## Persistencia

### `localStorage` — persiste entre sesiones
| Clave | Tipo | Descripción |
|---|---|---|
| `jugadores` | number | Cantidad de jugadores configurada |
| `impostores` | number | Cantidad de impostores configurada |
| `nombres` | JSON array | Lista de nombres guardados |
| `temporizadorActivo` | boolean | Si el temporizador está habilitado |
| `tiempoDiscusion` | number | Duración del temporizador en minutos |
| `temas` | JSON object | Temas personalizados `{ [nombre]: Entrada[] }` |
| `temaActivo` | string | Nombre del tema activo actualmente |

### `sessionStorage` — persiste mientras el navegador esté abierto
| Clave | Descripción |
|---|---|
| `partida_fase` | Fase actual: `config`, `asignacion` o `juego` |
| `partida_jugadores` | Array de jugadores con roles y palabras asignadas |
| `partida_turno` | Turno actual de asignación |
| `partida_rolVisible` | Si el rol está visible en pantalla |
| `partida_terminado` | Si terminó la fase de asignación |
| `juego_turnoInicial` | Índice del jugador que empieza a hablar |
| `juego_enVotacion` | Si ya pasó a la fase de votación |
| `juego_tiempoRestante` | Segundos restantes del temporizador |
| `votacion_jugadores` | Jugadores aún activos en la votación |
| `votacion_estado` | `votando`, `adivinando` o `finalizado` |
| `votacion_ganador` | `inocentes` o `impostor` |
| `votacion_expulsado` | Jugador expulsado |
| `historial_palabras` | Últimas 15 palabras usadas (evita repetición) |

---

## Flujo de datos

```
localStorage                sessionStorage
(preferencias)              (partida en curso)
      │                            │
useConfiguracion              useAsignacion
useTemas                      useVotacion
      │                       partida_fase
      └──────────┬────────────────┘
                 │
             partida.tsx
                 │
              juego.tsx
                 │
      ┌──────────┼──────────┐
  FaseConfig  FaseAsignacion  FaseJuego
                                  │
                              FaseVotacion
```

---

## Variables CSS globales

Definidas en `index.css`. Para cambiar la paleta completa solo se edita ese archivo.

```css
--bg-base        /* #0e0e0e — fondo principal */
--bg-card        /* #1a1a1a — fondo de tarjetas */
--bg-card-dark   /* #111111 — fondo de tarjetas oscuras */
--bg-input       /* #0a0a0a — fondo de inputs */
--border         /* #2a2a2a — borde estándar */
--border-hover   /* #444444 — borde en hover */
--text-primary   /* #f0f0f0 — texto principal */
--text-secondary /* rgba(240,240,240,0.5) — texto secundario */
--text-muted     /* rgba(240,240,240,0.25) — texto atenuado */
--accent         /* #d4622a — naranja quemado */
--accent-hover   /* #b8501f — naranja oscuro */
--accent-glow    /* rgba(212,98,42,0.35) — sombra acento */
--accent-subtle  /* rgba(212,98,42,0.1) — fondo acento suave */
--danger         /* #e05555 — rojo para acciones destructivas */
--success        /* #5aaa6a — verde para confirmaciones */
```

---

## Avisos legales

- **Privacidad** — La app no recopila ni transmite datos personales. Nombres y configuraciones se guardan únicamente en el dispositivo del usuario.
- **Contenido IA** — El contenido generado por herramientas de IA y pegado en la sección de temas es responsabilidad exclusiva del usuario.

---

## Pendientes

- [ ] Integrar `BotonDonacion` cuando se tenga la URL de la plataforma de donación
- [ ] Eliminar `button.tsx` y `Button.css` (código legado sin uso)
