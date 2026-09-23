// ============================================================
//  Tarjeta de un Pokemon del equipo: imagen, tipos, nivel,
//  barra de vida, barra de experiencia y proxima evolucion.
// ============================================================

import TypeBadge from "../TypeBadge";
import { expNecesaria } from "../../utils/game";
import { porId } from "../../data/pokemon";

export function BarraVida({ hp, hpMax, compacta = false }) {
  const pct = hpMax > 0 ? Math.max(0, (hp / hpMax) * 100) : 0;
  const estado = pct > 50 ? "alta" : pct > 20 ? "media" : "baja";
  return (
    <div className={`barra barra-vida barra--${estado}${compacta ? " barra--compacta" : ""}`}>
      <div className="barra-relleno" style={{ width: `${pct}%` }} />
      {!compacta && <span className="barra-texto">{Math.max(0, Math.ceil(hp))} / {hpMax} PS</span>}
    </div>
  );
}

export function BarraExp({ exp, nivel }) {
  const necesaria = expNecesaria(nivel);
  const pct = Math.min(100, (exp / necesaria) * 100);
  return (
    <div className="barra barra-exp">
      <div className="barra-relleno" style={{ width: `${pct}%` }} />
      <span className="barra-texto">EXP {Math.floor(exp)} / {necesaria}</span>
    </div>
  );
}

export default function TeamCard({ pokemon, activo, onClick, accion }) {
  const debilitado = pokemon.hp <= 0;
  const evo = pokemon.evolucion ? porId(pokemon.evolucion.id) : null;
  const faltan = pokemon.evolucion ? pokemon.evolucion.nivel - pokemon.nivel : null;

  return (
    <article
      className={`team-card${activo ? " team-card--activo" : ""}${debilitado ? " team-card--ko" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === "Enter" || e.key === " ") && onClick() : undefined}
    >
      <div className="team-card-sprite">
        <img src={pokemon.imagen} alt={pokemon.nombre} loading="lazy" />
        {activo && <span className="team-card-insignia">EN JUEGO</span>}
        {debilitado && <span className="team-card-ko">KO</span>}
      </div>

      <div className="team-card-info">
        <header>
          <h3>{pokemon.nombre}</h3>
          <span className="team-card-nivel">Nv. {pokemon.nivel}</span>
        </header>

        <div className="team-card-tipos">
          {pokemon.tipo.map((t) => <TypeBadge key={t} tipo={t} small />)}
        </div>

        <BarraVida hp={pokemon.hp} hpMax={pokemon.hpMax} />
        <BarraExp exp={pokemon.exp} nivel={pokemon.nivel} />

        <dl className="team-card-stats">
          <div><dt>ATQ</dt><dd>{pokemon.ataque}</dd></div>
          <div><dt>DEF</dt><dd>{pokemon.defensa}</dd></div>
          <div><dt>VEL</dt><dd>{pokemon.velocidad}</dd></div>
        </dl>

        {evo && (
          <p className="team-card-evo">
            <img src={evo.sprite} alt="" aria-hidden="true" />
            {faltan > 0
              ? `Evoluciona a ${evo.nombre} en ${faltan} ${faltan === 1 ? "nivel" : "niveles"}`
              : `¡Listo para evolucionar a ${evo.nombre}!`}
          </p>
        )}

        {accion}
      </div>
    </article>
  );
}
