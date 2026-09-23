// ============================================================
//  Interfaz permanente del juego.
//  Arriba: entrenador, Pokemon activo, nivel, vida y experiencia.
//  Abajo: Mapa, Pokemon, Batalla, Inventario y Pokedex.
// ============================================================

import { useState } from "react";
import { useGame } from "../../context/GameContext";
import { MAPAS } from "../../data/maps";
import { OBJETOS, generarEquipoArena, EQUIPO_MAXIMO } from "../../utils/game";
import TeamCard, { BarraExp, BarraVida } from "../PokemonCard/TeamCard";
import TypeBadge from "../TypeBadge";

function Panel({ titulo, subtitulo, onCerrar, children }) {
  return (
    <div className="panel-fondo" onClick={onCerrar} role="presentation">
      <section
        className="panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <header className="panel-cabecera">
          <div>
            <h2>{titulo}</h2>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <button className="panel-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </header>
        <div className="panel-cuerpo">{children}</div>
      </section>
    </div>
  );
}

export default function HUD() {
  const juego = useGame();
  const [panel, setPanel] = useState(null);
  const [objetoElegido, setObjetoElegido] = useState(null);

  const activo = juego.pokemonActivo;
  if (!juego.entrenador || !activo) return null;

  const enCombate = juego.pantalla === "arena" || juego.pantalla === "combate";
  const cerrar = () => { setPanel(null); setObjetoElegido(null); };

  function alaArena() {
    if (juego.equipoAgotado) {
      juego.mostrarAviso("Tu equipo está agotado. Pasa por el Centro Pokémon.", "🏥");
      setPanel("inventario");
      return;
    }
    const nivel = Math.max(...juego.equipo.map((p) => p.nivel));
    juego.iniciarBatalla({ tipo: "arena", enemigos: generarEquipoArena(nivel) });
  }

  return (
    <>
      {/* ---------------- Barra superior ---------------- */}
      <header className="hud hud-superior">
        <div className="hud-entrenador" style={{ "--color-entrenador": juego.entrenador.color }}>
          <span className="hud-avatar" aria-hidden="true">{juego.entrenador.icono}</span>
          <div>
            <strong>{juego.entrenador.nombre}</strong>
            <span className="hud-region">
              {juego.mapaActual.emoji} {juego.mapaActual.nombre}
            </span>
          </div>
        </div>

        <div className="hud-pokemon">
          <img src={activo.sprite} alt={activo.nombre} className="hud-sprite" />
          <div className="hud-datos">
            <div className="hud-datos-linea">
              <strong>{activo.nombre}</strong>
              <span className="hud-nivel">Nv. {activo.nivel}</span>
              {activo.tipo.map((t) => <TypeBadge key={t} tipo={t} small />)}
            </div>
            <BarraVida hp={activo.hp} hpMax={activo.hpMax} />
            <BarraExp exp={activo.exp} nivel={activo.nivel} />
          </div>
        </div>

        <div className="hud-recursos">
          <span className="hud-recurso" title="Monedas">🪙 {juego.monedas}</span>
          <span className="hud-recurso" title="Poké Balls">🔴 {juego.inventario.pokeball}</span>
          <span className="hud-recurso" title="Pokémon capturados">📘 {juego.capturados.length}</span>
        </div>
      </header>

      {/* ---------------- Barra inferior ---------------- */}
      <nav className="hud hud-inferior" aria-label="Menú del juego">
        <button className="hud-btn" onClick={() => setPanel("mapa")}>
          <span aria-hidden="true">🗺️</span> Mapa
        </button>
        <button className="hud-btn" onClick={() => setPanel("equipo")}>
          <span aria-hidden="true">🎽</span> Pokémon
          <em className="hud-btn-badge">{juego.equipo.length}/{EQUIPO_MAXIMO}</em>
        </button>
        <button
          className="hud-btn hud-btn--batalla"
          onClick={alaArena}
          disabled={enCombate}
        >
          <span aria-hidden="true">⚔️</span> Entrar en batalla
        </button>
        <button className="hud-btn" onClick={() => setPanel("inventario")}>
          <span aria-hidden="true">🎒</span> Inventario
        </button>
        <button className="hud-btn" onClick={() => juego.irA("pokedex")}>
          <span aria-hidden="true">📘</span> Pokédex
        </button>
      </nav>

      {/* ---------------- Paneles ---------------- */}
      {panel === "mapa" && (
        <Panel titulo="Mapa del mundo" subtitulo="Elige a dónde viajar" onCerrar={cerrar}>
          <div className="rejilla-regiones">
            {MAPAS.map((m) => (
              <button
                key={m.id}
                className={`region-card ${m.tema}${m.id === juego.mapa ? " region-card--actual" : ""}`}
                onClick={() => { juego.cambiarMapa(m.id); cerrar(); }}
              >
                <span className="region-emoji" aria-hidden="true">{m.emoji}</span>
                <h3>{m.nombre}</h3>
                <p>{m.lema}</p>
                <span className="region-estado">
                  {m.id === juego.mapa ? "Estás aquí" : "Viajar →"}
                </span>
              </button>
            ))}
          </div>
          <footer className="panel-pie">
            <p>Tu partida se guarda sola en este navegador.</p>
            <button
              className="boton boton-secundario"
              onClick={() => {
                if (window.confirm("¿Empezar de cero? Perderás tu equipo y tus objetos.")) {
                  juego.reiniciarPartida();
                }
              }}
            >
              🔄 Nueva partida
            </button>
          </footer>
        </Panel>
      )}

      {panel === "equipo" && (
        <Panel
          titulo="Tu equipo"
          subtitulo={`${juego.equipo.length} de ${EQUIPO_MAXIMO} Pokémon · toca uno para ponerlo en cabeza`}
          onCerrar={cerrar}
        >
          <div className="rejilla-equipo">
            {juego.equipo.map((p, i) => (
              <TeamCard
                key={p.uid}
                pokemon={p}
                activo={i === juego.activo}
                onClick={() => {
                  if (p.hp <= 0) return juego.mostrarAviso(`${p.nombre} está debilitado.`, "💤");
                  juego.seleccionarActivo(i);
                  juego.mostrarAviso(`${p.nombre} va en cabeza.`, "⭐");
                }}
              />
            ))}
          </div>
        </Panel>
      )}

      {panel === "inventario" && (
        <Panel
          titulo="Mochila"
          subtitulo={objetoElegido ? "Elige sobre qué Pokémon usarlo" : "Tus objetos y el Centro Pokémon"}
          onCerrar={cerrar}
        >
          <div className="rejilla-objetos">
            {Object.entries(OBJETOS).map(([clave, obj]) => {
              const cantidad = juego.inventario[clave] || 0;
              const usable = clave !== "pokeball" && cantidad > 0;
              return (
                <button
                  key={clave}
                  className={`objeto-card${objetoElegido === clave ? " objeto-card--elegido" : ""}`}
                  disabled={!usable}
                  onClick={() => setObjetoElegido(objetoElegido === clave ? null : clave)}
                >
                  <span className="objeto-icono" aria-hidden="true">{obj.icono}</span>
                  <strong>{obj.nombre}</strong>
                  <span className="objeto-cantidad">×{cantidad}</span>
                  <p>{obj.desc}</p>
                </button>
              );
            })}
          </div>

          {objetoElegido && (
            <div className="objetivo-objeto">
              {juego.equipo.map((p) => (
                <button
                  key={p.uid}
                  className="objetivo-btn"
                  onClick={() => { juego.usarObjeto(objetoElegido, p.uid); setObjetoElegido(null); }}
                >
                  <img src={p.sprite} alt="" aria-hidden="true" />
                  <span>{p.nombre}</span>
                  <small>{Math.max(0, Math.ceil(p.hp))}/{p.hpMax} PS</small>
                </button>
              ))}
            </div>
          )}

          <div className="centro-pokemon">
            <div>
              <h3>🏥 Centro Pokémon</h3>
              <p>Cura por completo a todo tu equipo. Sólo fuera de combate.</p>
            </div>
            <button
              className="boton boton-primario"
              disabled={enCombate}
              onClick={() => { juego.curarEquipo(); juego.mostrarAviso("Tu equipo está como nuevo.", "🏥"); cerrar(); }}
            >
              Curar equipo
            </button>
          </div>
        </Panel>
      )}
    </>
  );
}
