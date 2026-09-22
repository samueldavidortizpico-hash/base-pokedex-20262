# Graph Report - pokemon-arena  (2026-09-21)

## Corpus Check
- 42 files · ~509,935 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 256 nodes · 625 edges · 9 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- World.jsx
- game.selfcheck.js
- useBattle.js
- GameContext.jsx
- package.json
- Pokedex.jsx
- BattleScene
- .oxlintrc.json
- React + Vite

## God Nodes (most connected - your core abstractions)
1. `react` - 17 edges
2. `World()` - 14 edges
3. `useGame()` - 13 edges
4. `crearInstancia()` - 12 edges
5. `BattleScene()` - 11 edges
6. `TypeBadge()` - 11 edges
7. `cap()` - 11 edges
8. `porId()` - 10 edges
9. `esperar()` - 10 edges
10. `tratarBajas()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `alaArena()` --calls--> `generarEquipoArena()`  [EXTRACTED]
  src/components/HUD/HUD.jsx → src/utils/game.js
- `Home()` --indirect_call--> `porId()`  [INFERRED]
  src/pages/Home.jsx → src/data/pokemon.js
- `App()` --calls--> `evolucionPendiente()`  [EXTRACTED]
  src/App.jsx → src/utils/game.js
- `ejecutarAccion()` --calls--> `calcularGolpe()`  [EXTRACTED]
  src/components/Battle/BattleScene.jsx → src/utils/game.js
- `tratarBajas()` --calls--> `expPorVictoria()`  [EXTRACTED]
  src/components/Battle/BattleScene.jsx → src/utils/game.js

## Import Cycles
- None detected.

## Communities (9 total, 0 thin omitted)

### Community 0 - "World.jsx"
Cohesion: 0.08
Nodes (37): Atmosfera, Cofres, MapCanvas(), Particulas, Player(), ALTO, ANCHO, bloquea() (+29 more)

### Community 1 - "game.selfcheck.js"
Cohesion: 0.08
Nodes (38): PAUSA, COSTE_ESPECIAL, ENERGIA_MAXIMA, ESPECIAL_POR_TIPO, especialDe(), MOVIMIENTOS_POR_TIPO, movimientosDe(), INICIALES (+30 more)

### Community 2 - "useBattle.js"
Cohesion: 0.10
Nodes (32): EncounterDialog(), construirArbol(), EvolutionChain(), extraerId(), generarRutas(), FighterCard(), MoveList(), obtenerNombreEspecie() (+24 more)

### Community 3 - "GameContext.jsx"
Cohesion: 0.13
Nodes (22): react, App(), HUD(), alaArena(), EvolutionOverlay(), BarraExp(), BarraVida(), TeamCard() (+14 more)

### Community 4 - "package.json"
Cohesion: 0.08
Nodes (25): dependencies, react, react-dom, devDependencies, oxlint, @types/react, @types/react-dom, vite (+17 more)

### Community 5 - "Pokedex.jsx"
Cohesion: 0.17
Nodes (19): BattleSection(), handleKey(), handleSelect(), fetchCached(), seleccionarLuchador(), usePokemon(), buscar(), HABITATS (+11 more)

### Community 6 - "BattleScene"
Cohesion: 0.45
Nodes (11): BattleScene(), cerrarTurno(), ejecutarAccion(), intentarCaptura(), intentarHuida(), jugarTurno(), terminar(), tratarBajas() (+3 more)

### Community 7 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 8 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **56 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 80 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `GameContext.jsx` to `World.jsx`, `game.selfcheck.js`, `useBattle.js`, `package.json`, `Pokedex.jsx`?**
  _High betweenness centrality (0.293) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _56 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `World.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07727272727272727 - nodes in this community are weakly interconnected._
- **Should `game.selfcheck.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07673469387755102 - nodes in this community are weakly interconnected._
- **Should `useBattle.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09528214616096208 - nodes in this community are weakly interconnected._
- **Should `GameContext.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12903225806451613 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._