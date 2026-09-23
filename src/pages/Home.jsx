// ============================================================
//  Pantalla de titulo: logo, fondo animado, eleccion de
//  entrenador y eleccion del Pokemon inicial.
// ============================================================

import { useState } from "react";
import { ENTRENADORES, useGame } from "../context/GameContext";
import { INICIALES, porId } from "../data/pokemon";
import { MAPAS } from "../data/maps";
import TypeBadge from "../components/TypeBadge";

const REGION_DE = {
  agua: { emoji: "🌊", nombre: "Ciudad Marina" },
  jungla: { emoji: "🌱", nombre: "Jungla Salvaje" },
  volcan: { emoji: "🔥", nombre: "Volcán de Fuego" },
};

export default function Home() {
  const juego = useGame();
  const [paso, setPaso] = useState("portada");
  const [entrenador, setEntrenador] = useState(null);
  const [inicial, setInicial] = useState(null);

  const iniciales = INICIALES.map(porId);

  return (
    <div className="portada">
      {/* Fondo animado: las tres regiones desfilando por detras. */}
      <div className="portada-fondo" aria-hidden="true">
        {MAPAS.map((m, i) => (
          <div key={m.id} className={`portada-capa ${m.tema}`} style={{ animationDelay: `${i * 4}s` }} />
        ))}
        <div className="portada-estrellas" />
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="portada-chispa"
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 9) * 0.7}s`,
              animationDuration: `${6 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="portada-contenido">
        <header className="portada-logo">
          <span className="portada-pokeball" aria-hidden="true" />
          <h1>
            <span className="logo-linea-1">POKÉMON</span>
            <span className="logo-linea-2">WORLD ADVENTURE</span>
          </h1>
          <p className="portada-lema">
            Explora el océano, la jungla y el volcán. Captura, entrena y evoluciona.
          </p>
        </header>

        {/* ---------------- Paso 1: empezar ---------------- */}
        {paso === "portada" && (
          <div className="portada-inicio">
            <button className="boton boton-gigante" onClick={() => setPaso("entrenador")}>
              COMENZAR AVENTURA
            </button>
            <ul className="portada-regiones">
              {MAPAS.map((m) => (
                <li key={m.id}>
                  <span aria-hidden="true">{m.emoji}</span> {m.nombre}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ---------------- Paso 2: entrenador ---------------- */}
        {paso === "entrenador" && (
          <section className="seleccion">
            <h2>Elige tu entrenador</h2>
            <div className="seleccion-entrenadores">
              {ENTRENADORES.map((e) => (
                <button
                  key={e.id}
                  className={`entrenador-card${entrenador?.id === e.id ? " entrenador-card--elegido" : ""}`}
                  style={{ "--color-entrenador": e.color }}
                  onClick={() => setEntrenador(e)}
                >
                  <span className="entrenador-icono" aria-hidden="true">{e.icono}</span>
                  <strong>{e.nombre}</strong>
                </button>
              ))}
            </div>
            <div className="seleccion-pie">
              <button className="boton boton-secundario" onClick={() => setPaso("portada")}>← Atrás</button>
              <button
                className="boton boton-primario"
                disabled={!entrenador}
                onClick={() => setPaso("inicial")}
              >
                Siguiente →
              </button>
            </div>
          </section>
        )}

        {/* ---------------- Paso 3: Pokemon inicial ---------------- */}
        {paso === "inicial" && (
          <section className="seleccion">
            <h2>Elige tu Pokémon inicial</h2>
            <p className="seleccion-ayuda">
              Te acompañará durante toda la aventura y evolucionará contigo.
            </p>

            <div className="seleccion-iniciales">
              {iniciales.map((p) => {
                const region = REGION_DE[p.habitat];
                return (
                  <button
                    key={p.id}
                    className={`inicial-card${inicial?.id === p.id ? " inicial-card--elegido" : ""}`}
                    onClick={() => setInicial(p)}
                  >
                    <img src={p.imagen} alt={p.nombre} loading="lazy" />
                    <strong>{p.nombre}</strong>
                    <div className="inicial-tipos">
                      {p.tipo.map((t) => <TypeBadge key={t} tipo={t} small />)}
                    </div>
                    <span className="inicial-region">{region.emoji} {region.nombre}</span>
                  </button>
                );
              })}
            </div>

            {inicial && (
              <div className="inicial-resumen">
                <img src={inicial.sprite} alt="" aria-hidden="true" />
                <dl>
                  <div><dt>PS</dt><dd>{inicial.vida}</dd></div>
                  <div><dt>Ataque</dt><dd>{inicial.ataque}</dd></div>
                  <div><dt>Defensa</dt><dd>{inicial.defensa}</dd></div>
                  <div><dt>Velocidad</dt><dd>{inicial.velocidad}</dd></div>
                </dl>
                {inicial.evolucion && (
                  <p>Evoluciona a <strong>{porId(inicial.evolucion.id).nombre}</strong> en el nivel {inicial.evolucion.nivel}.</p>
                )}
              </div>
            )}

            <div className="seleccion-pie">
              <button className="boton boton-secundario" onClick={() => setPaso("entrenador")}>← Atrás</button>
              <button
                className="boton boton-gigante"
                disabled={!inicial}
                onClick={() => juego.iniciarPartida(entrenador, inicial.id)}
              >
                ¡EMPEZAR!
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
