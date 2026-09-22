# Graph Report - INFO PROG  (2026-09-21)

## Corpus Check
- 41 files · ~36,232 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 309 nodes · 696 edges · 9 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- script.js
- game.selfcheck.js
- Pokedex.jsx
- game.js
- GameContext.jsx
- package.json
- pokeApi.js
- .oxlintrc.json
- React + Vite

## God Nodes (most connected - your core abstractions)
1. `react` - 16 edges
2. `useGame()` - 13 edges
3. `World()` - 12 edges
4. `BattleScene()` - 11 edges
5. `TypeBadge()` - 11 edges
6. `cap()` - 11 edges
7. `porId()` - 10 edges
8. `esperar()` - 10 edges
9. `crearInstancia()` - 10 edges
10. `capitalizar()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `alaArena()` --calls--> `generarEquipoArena()`  [EXTRACTED]
  pokemon-arena/src/components/HUD/HUD.jsx → pokemon-arena/src/utils/game.js
- `intentarCaptura()` --calls--> `probabilidadCaptura()`  [EXTRACTED]
  pokemon-arena/src/components/Battle/BattleScene.jsx → pokemon-arena/src/utils/game.js
- `Pokedex()` --calls--> `useGame()`  [EXTRACTED]
  pokemon-arena/src/pages/Pokedex.jsx → pokemon-arena/src/context/GameContext.jsx
- `World()` --calls--> `useGame()`  [EXTRACTED]
  pokemon-arena/src/pages/World.jsx → pokemon-arena/src/context/GameContext.jsx
- `Home()` --indirect_call--> `porId()`  [INFERRED]
  pokemon-arena/src/pages/Home.jsx → pokemon-arena/src/data/pokemon.js

## Import Cycles
- None detected.

## Communities (9 total, 0 thin omitted)

### Community 0 - "script.js"
Cohesion: 0.06
Nodes (66): ABILITY_RULES, abrirBatalla(), actualizarBarraVida(), actualizarBotonBatalla(), agregarLog(), animarAtaque(), animarDanio(), aplicarEfectosEntrada() (+58 more)

### Community 1 - "game.selfcheck.js"
Cohesion: 0.06
Nodes (46): EncounterDialog(), Casillas, CLASES, Cofres, Decorado, MapCanvas(), Particulas, Salvajes (+38 more)

### Community 2 - "Pokedex.jsx"
Cohesion: 0.08
Nodes (36): BattleSection(), handleKey(), handleSelect(), construirArbol(), EvolutionChain(), extraerId(), generarRutas(), FighterCard() (+28 more)

### Community 3 - "game.js"
Cohesion: 0.12
Nodes (31): BattleScene(), cerrarTurno(), ejecutarAccion(), intentarCaptura(), intentarHuida(), jugarTurno(), terminar(), tratarBajas() (+23 more)

### Community 4 - "GameContext.jsx"
Cohesion: 0.14
Nodes (23): App(), HUD(), alaArena(), EvolutionOverlay(), TeamCard(), cargarPartida(), ENTRENADORES, GameContext (+15 more)

### Community 5 - "package.json"
Cohesion: 0.08
Nodes (25): dependencies, react, react-dom, devDependencies, oxlint, @types/react, @types/react-dom, vite (+17 more)

### Community 6 - "pokeApi.js"
Cohesion: 0.27
Nodes (13): usePokemon(), buscar(), Pokedex(), handleSearch(), buscarPokemon(), cache, fetchWithCache(), normalizarBusqueda() (+5 more)

### Community 7 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 8 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **85 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 109 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `GameContext.jsx` to `game.selfcheck.js`, `Pokedex.jsx`, `game.js`, `package.json`, `pokeApi.js`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `script.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0574400723654455 - nodes in this community are weakly interconnected._
- **Should `game.selfcheck.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05505952380952381 - nodes in this community are weakly interconnected._
- **Should `Pokedex.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08315863032844165 - nodes in this community are weakly interconnected._
- **Should `game.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12051282051282051 - nodes in this community are weakly interconnected._
- **Should `GameContext.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1350806451612903 - nodes in this community are weakly interconnected._