// ============================================================
//  Arena Pokemon (mapa 4) y combates salvajes.
//  Monta la escena de combate y vuelca su resultado en la partida.
// ============================================================

import { useGame } from "../context/GameContext";
import BattleScene from "../components/Battle/BattleScene";

export default function BattleArena() {
  const juego = useGame();
  const batalla = juego.batalla;
  if (!batalla) return null;

  const esArena = batalla.tipo === "arena";

  function finalizar(res) {
    // 1. Vida, experiencia y niveles con los que acaba el equipo.
    juego.reemplazarEquipo(
      juego.equipo.map((p) => res.equipo.find((x) => x.uid === p.uid) || p)
    );

    // 2. Recompensas y consumo de Poke Balls.
    if (res.monedas > 0) juego.sumarMonedas(res.monedas);
    for (let i = 0; i < res.bolasUsadas; i++) juego.gastarObjeto("pokeball");

    // 3. Pokemon capturado durante el combate.
    if (res.capturado) {
      const destino = juego.capturar(res.capturado);
      juego.mostrarAviso(
        destino === "lleno"
          ? `${res.capturado.nombre} queda registrado: tu equipo está lleno.`
          : `¡${res.capturado.nombre} se une al equipo!`,
        "🎯"
      );
    }

    // 4. Al perder, el equipo se recupera para poder seguir jugando.
    if (res.resultado === "derrota") {
      juego.curarEquipo();
      juego.mostrarAviso("Te atendieron en el Centro Pokémon. ¡Ánimo!", "🏥");
    }

    juego.cerrarBatalla();
  }

  return (
    <div className={`arena ${esArena ? "arena--estadio" : `arena--salvaje ${juego.mapaActual.tema}`}`}>
      {esArena ? (
        <>
          <div className="arena-gradas" aria-hidden="true">
            {Array.from({ length: 70 }, (_, i) => (
              <span
                key={i}
                className="arena-publico"
                style={{ animationDelay: `${(i % 11) * 0.17}s`, left: `${(i * 1.43) % 100}%`, top: `${(i % 4) * 22}%` }}
              />
            ))}
          </div>
          <div className="arena-focos" aria-hidden="true">
            <span className="arena-foco arena-foco--izq" />
            <span className="arena-foco arena-foco--der" />
          </div>
          <div className="arena-plataforma" aria-hidden="true"><span /><i /><b /></div>
          <div className="arena-pantallas" aria-hidden="true"><span>POKÉMON</span><span>⚡ BATALLA ⚡</span></div>
          <header className="arena-cartel">
            <span aria-hidden="true">🏟️</span>
            <div>
              <strong>Arena Pokémon</strong>
              <span>{batalla.enemigos.length} rivales · el público ruge</span>
            </div>
          </header>
        </>
      ) : (
        <header className="arena-cartel">
          <span aria-hidden="true">{juego.mapaActual.emoji}</span>
          <div>
            <strong>Combate salvaje</strong>
            <span>{juego.mapaActual.nombre}</span>
          </div>
        </header>
      )}

      <BattleScene
        tipo={batalla.tipo}
        equipo={juego.equipo}
        enemigos={batalla.enemigos}
        pokeballs={juego.inventario.pokeball}
        onFinalizar={finalizar}
      />
    </div>
  );
}
