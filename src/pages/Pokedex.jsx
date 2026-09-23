// ============================================================
//  Pokedex del juego + el buscador y el simulador de combate
//  que ya tenia Pokemon Arena (se conservan intactos).
// ============================================================

import { useState } from "react";
import { useGame } from "../context/GameContext";
import { usePokemon } from "../hooks/usePokemon";
import { useBattle } from "../hooks/useBattle";
import PokemonCard from "../components/PokemonCard.jsx";
import BattleSection from "../components/BattleSection";
import TypeBadge from "../components/TypeBadge";
import { POKEMON } from "../data/pokemon";
import "../App.css";

const HABITATS = [
  { id: "agua", nombre: "Ciudad Marina", emoji: "🌊" },
  { id: "jungla", nombre: "Jungla Salvaje", emoji: "🌱" },
  { id: "volcan", nombre: "Volcán de Fuego", emoji: "🔥" },
];

export default function Pokedex() {
  const juego = useGame();
  const [query, setQuery] = useState("");
  const [mostrarBatalla, setMostrarBatalla] = useState(false);
  const [habitat, setHabitat] = useState("agua");
  const { estado, cargando, error, buscar } = usePokemon();
  const batalla = useBattle();

  const dePagina = POKEMON.filter((p) => p.habitat === habitat);
  const capturadosAqui = dePagina.filter((p) => juego.capturados.includes(p.id)).length;

  function handleSearch(e) {
    e.preventDefault();
    buscar(query);
  }

  return (
    <div className="app pokedex-pagina">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <main className="main">
        <header className="main-header">
          <button className="boton boton-secundario pokedex-volver" onClick={() => juego.irA("mundo")}>
            ← Volver al mundo
          </button>
          <h1>Poké<span className="accent">dex</span></h1>
          <p className="subtitle">
            {juego.capturados.length} de {POKEMON.length} Pokémon registrados en tu aventura.
          </p>
        </header>

        {/* ---------- Pokedex de la aventura ---------- */}
        <section className="search-panel">
          <div className="panel-topline">
            <span className="panel-dot" />
            REGISTRO DE LA AVENTURA
            <span className="panel-status">● {capturadosAqui}/{dePagina.length} EN ESTA REGIÓN</span>
          </div>

          <div className="pokedex-tabs">
            {HABITATS.map((h) => (
              <button
                key={h.id}
                className={`pokedex-tab${habitat === h.id ? " pokedex-tab--activa" : ""}`}
                onClick={() => setHabitat(h.id)}
              >
                <span aria-hidden="true">{h.emoji}</span> {h.nombre}
              </button>
            ))}
          </div>

          <div className="pokedex-rejilla">
            {dePagina.map((p) => {
              const capturado = juego.capturados.includes(p.id);
              const visto = capturado || juego.vistos.includes(p.id);
              return (
                <article
                  key={p.id}
                  className={`pokedex-item${capturado ? " pokedex-item--capturado" : ""}${visto ? "" : " pokedex-item--oculto"}`}
                  title={visto ? p.nombre : "Aún no lo has visto"}
                >
                  <img src={p.sprite} alt={visto ? p.nombre : ""} loading="lazy" />
                  <strong>{visto ? p.nombre : "???"}</strong>
                  {visto && (
                    <div className="pokedex-item-tipos">
                      {p.tipo.map((t) => <TypeBadge key={t} tipo={t} small />)}
                    </div>
                  )}
                  <span className="pokedex-item-estado">
                    {capturado ? "✔ Capturado" : visto ? "👁 Visto" : "· Sin datos"}
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        {/* ---------- Buscador original (PokeAPI) ---------- */}
        <section className="search-panel">
          <div className="panel-topline">
            <span className="panel-dot" />
            POKÉDEX SEARCH
            <span className="panel-status">● ONLINE</span>
          </div>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-field">
              <label htmlFor="pokemonInput">Pokémon</label>
              <input
                id="pokemonInput"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: Pikachu o 25"
                autoComplete="off"
                disabled={cargando}
              />
            </div>
            <button type="submit" className="button button-search" disabled={cargando || !query.trim()}>
              {cargando ? "Buscando..." : "Buscar"}
            </button>
            <button
              type="button"
              className="button button-battle"
              onClick={() => {
                setMostrarBatalla(true);
                setTimeout(() => document.getElementById("battle-section")?.scrollIntoView({ behavior: "smooth" }), 50);
              }}
            >
              ⚔️ Simular combate
            </button>
          </form>
        </section>

        <section className="messages" aria-live="polite" aria-atomic="true">
          {cargando && <p className="loading-msg">Buscando información del Pokémon...</p>}
          {error && <p className="error-msg" role="alert">{error}</p>}
        </section>

        {estado.datos && (
          <section className="pokemon-result">
            <PokemonCard datos={estado.datos} especie={estado.especie} evolucion={estado.evolucion} />
          </section>
        )}

        {mostrarBatalla && (
          <div id="battle-section">
            <BattleSection
              pokemonOne={batalla.pokemonOne}
              pokemonTwo={batalla.pokemonTwo}
              cargandoOne={batalla.cargandoOne}
              cargandoTwo={batalla.cargandoTwo}
              errorSelector={batalla.errorSelector}
              activo={batalla.activo}
              logs={batalla.logs}
              ganador={batalla.ganador}
              turnoMsg={batalla.turnoMsg}
              hpOne={batalla.hpOne}
              hpTwo={batalla.hpTwo}
              seleccionarLuchador={batalla.seleccionarLuchador}
              comenzarBatalla={batalla.comenzarBatalla}
              reiniciarBatalla={batalla.reiniciarBatalla}
            />
          </div>
        )}
      </main>
    </div>
  );
}
