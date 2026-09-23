// ============================================================
//  Aviso de Pokemon salvaje: capturar, pelear o escapar.
// ============================================================

import TypeBadge from "../TypeBadge";
import { probabilidadCaptura } from "../../utils/game";

export default function EncounterDialog({ salvaje, pokeballs, nivelJugador, onCapturar, onPelear, onEscapar }) {
  const probabilidad = Math.round(probabilidadCaptura(salvaje, nivelJugador) * 100);

  return (
    <div className="dialogo-fondo" role="dialog" aria-modal="true" aria-label="Pokémon salvaje">
      <section className="dialogo dialogo--encuentro">
        <p className="dialogo-titulo">¡Un Pokémon salvaje apareció!</p>

        <div className="encuentro-cuerpo">
          <img className="encuentro-sprite" src={salvaje.imagen} alt={salvaje.nombre} />
          <div className="encuentro-datos">
            <h2>{salvaje.nombre}</h2>
            <span className="encuentro-nivel">Nivel {salvaje.nivel}</span>
            <div className="encuentro-tipos">
              {salvaje.tipo.map((t) => <TypeBadge key={t} tipo={t} />)}
            </div>
            <dl className="encuentro-stats">
              <div><dt>PS</dt><dd>{salvaje.hpMax}</dd></div>
              <div><dt>ATQ</dt><dd>{salvaje.ataque}</dd></div>
              <div><dt>DEF</dt><dd>{salvaje.defensa}</dd></div>
              <div><dt>VEL</dt><dd>{salvaje.velocidad}</dd></div>
            </dl>
          </div>
        </div>

        <div className="dialogo-acciones">
          <button className="boton boton-capturar" onClick={onCapturar} disabled={pokeballs <= 0}>
            🔴 Capturar
            <em>{pokeballs > 0 ? `${probabilidad}% · quedan ${pokeballs}` : "sin Poké Balls"}</em>
          </button>
          <button className="boton boton-pelear" onClick={onPelear}>
            ⚔️ Pelear
            <em>debilítalo para capturarlo mejor</em>
          </button>
          <button className="boton boton-escapar" onClick={onEscapar}>
            💨 Escapar
            <em>seguir explorando</em>
          </button>
        </div>
      </section>
    </div>
  );
}
