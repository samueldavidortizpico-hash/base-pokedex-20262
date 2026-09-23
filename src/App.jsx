// ============================================================
//  POKÉMON WORLD ADVENTURE
//  Raiz del juego: decide que pantalla se muestra y mantiene
//  encima el HUD, los avisos y la animacion de evolucion.
// ============================================================

import { useEffect } from "react";
import { useGame } from "./context/GameContext";
import { evolucionPendiente } from "./utils/game";
import Home from "./pages/Home";
import World from "./pages/World";
import BattleArena from "./pages/BattleArena";
import Pokedex from "./pages/Pokedex";
import HUD from "./components/HUD/HUD";
import EvolutionOverlay from "./components/PokemonCard/EvolutionOverlay";
import "./game.css";

export default function App() {
  const juego = useGame();

  // Cualquier Pokemon que haya alcanzado su nivel de evolucion entra en cola.
  // Se comprueba fuera de combate para no interrumpir un turno.
  useEffect(() => {
    if (juego.evolucionando || juego.batalla) return;
    const listo = juego.equipo.find((p) => evolucionPendiente(p));
    if (listo) juego.pedirEvolucion(listo.uid, evolucionPendiente(listo));
  }, [juego]);

  if (!juego.entrenador || juego.pantalla === "home") return <Home />;

  const enCombate = juego.pantalla === "arena" || juego.pantalla === "combate";
  const enPokedex = juego.pantalla === "pokedex";

  return (
    <div className="juego">
      {enPokedex ? <Pokedex /> : enCombate ? <BattleArena /> : <World />}

      {!enPokedex && <HUD />}

      {juego.aviso && (
        <div className="aviso" role="status" key={juego.aviso.id}>
          <span aria-hidden="true">{juego.aviso.icono}</span>
          {juego.aviso.texto}
        </div>
      )}

      {juego.evolucionando && (
        <EvolutionOverlay
          desde={juego.evolucionando.desde}
          hacia={juego.evolucionando.hacia}
          onCompletar={() => {
            juego.completarEvolucion();
            juego.mostrarAviso(`¡Tu Pokémon evolucionó a ${juego.evolucionando.hacia.nombre}!`, "🌟");
          }}
        />
      )}
    </div>
  );
}
