import { useState, useEffect, useRef } from "react";
import FighterCard from "./FighterCard";

export default function BattleSection({
  pokemonOne, pokemonTwo, cargandoOne, cargandoTwo,
  errorSelector, activo, logs, ganador, turnoMsg, hpOne, hpTwo,
  seleccionarLuchador, comenzarBatalla, reiniciarBatalla,
}) {
  const [queryOne, setQueryOne] = useState("");
  const [queryTwo, setQueryTwo] = useState("");
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const listos = pokemonOne && pokemonTwo;

  function handleSelect(num) {
    seleccionarLuchador(num, num === 1 ? queryOne : queryTwo);
  }

  function handleKey(e, num) {
    if (e.key === "Enter") handleSelect(num);
  }

  return (
    <section className="battle-section">
      <div className="battle-title">
        <div className="arena-kicker">⚡ BATTLE MODE ⚡</div>
        <h2>Arena Pokémon</h2>
        <p>Selecciona dos Pokémon y comienza la batalla.</p>
      </div>

      <div className="battle-search">
        {[1, 2].map((num) => {
          const query = num === 1 ? queryOne : queryTwo;
          const setQuery = num === 1 ? setQueryOne : setQueryTwo;
          const cargando = num === 1 ? cargandoOne : cargandoTwo;
          return (
            <div key={num} className="battle-selector">
              <label htmlFor={`battleInput${num}`}>Pokémon {num}</label>
              <div className="selector-row">
                <input
                  id={`battleInput${num}`}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => handleKey(e, num)}
                  placeholder={num === 1 ? "Ej: Pikachu" : "Ej: Charizard"}
                  disabled={activo || cargando}
                  autoComplete="off"
                />
                <button
                  className="button"
                  onClick={() => handleSelect(num)}
                  disabled={activo || cargando || !query.trim()}
                >
                  {cargando ? "..." : "Elegir"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {errorSelector && <p className="battle-error">{errorSelector}</p>}

      <div className="battle-arena">
        <FighterCard
          pokemon={pokemonOne}
          hpActual={hpOne.actual}
          hpMax={hpOne.max}
          cargando={cargandoOne}
          derrotado={!!(ganador && pokemonOne && ganador.nombre !== pokemonOne.nombre)}
        />
        <div className="versus"><span>VS</span></div>
        <FighterCard
          pokemon={pokemonTwo}
          hpActual={hpTwo.actual}
          hpMax={hpTwo.max}
          cargando={cargandoTwo}
          derrotado={!!(ganador && pokemonTwo && ganador.nombre !== pokemonTwo.nombre)}
        />
      </div>

      {listos && !activo && !ganador && (
        <button className="start-battle" onClick={comenzarBatalla}>
          ⚔️ ¡COMENZAR BATALLA!
        </button>
      )}

      {turnoMsg && <p className="battle-status">{turnoMsg}</p>}

      {logs.length > 0 && (
        <section className="battle-log-section">
          <div className="log-heading">
            <small>BATTLE FEED</small>
            <h3>Registro de batalla</h3>
          </div>
          <div className="battle-log" ref={logRef}>
            {logs.map((log, i) => <p key={i}>{log}</p>)}
          </div>
        </section>
      )}

      {ganador && (
        <>
          <div className="battle-winner">
            🏆 ¡{ganador.nombre.charAt(0).toUpperCase() + ganador.nombre.slice(1)} GANA!
          </div>
          <button className="button restart-button" onClick={reiniciarBatalla}>
            🔄 Nueva batalla
          </button>
        </>
      )}
    </section>
  );
}
