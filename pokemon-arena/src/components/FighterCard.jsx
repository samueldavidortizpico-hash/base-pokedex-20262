import TypeBadge from "./TypeBadge";
import StatBars from "./StatBars";
import MoveList from "./MoveList";
import { cap } from "../utils/battle";

function HpBar({ actual, max }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (actual / max) * 100)) : 0;
  const color = pct > 50 ? "#4ade80" : pct > 20 ? "#fbbf24" : "#f87171";
  return (
    <div className="hp-container">
      <div className="hp-header">
        <span>PS</span>
        <span>{Math.max(0, actual)} / {max}</span>
      </div>
      <div className="hp-bar">
        <div className="hp-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function FighterCard({ pokemon, hpActual, hpMax, cargando, derrotado }) {
  if (cargando) {
    return (
      <div className="fighter-card fighter-card--loading">
        <div className="fighter-spinner">Cargando...</div>
      </div>
    );
  }
  if (!pokemon) {
    return (
      <div className="fighter-card fighter-card--empty">
        <p className="empty-fighter">Esperando Pokémon...</p>
      </div>
    );
  }

  return (
    <div className={`fighter-card${derrotado ? " defeated" : ""}`}>
      <header className="card-header">
        <div>
          <p className="card-number">#{String(pokemon.id).padStart(3, "0")}</p>
          <h2 className="card-name">{cap(pokemon.nombre)}</h2>
        </div>
        <div className="card-hp">HP {hpMax}</div>
      </header>
      <div className="card-art">
        {pokemon.imagen ? <img src={pokemon.imagen} alt={cap(pokemon.nombre)} /> : <p>Sin imagen.</p>}
      </div>
      <div className="type-list">
        {pokemon.tipos.map((t) => <TypeBadge key={t} tipo={t} />)}
      </div>
      <div className="ability-box">
        <div className="ability-name">{cap(pokemon.habilidad.nombre)}</div>
        <p className="ability-description">{pokemon.habilidad.descripcion}</p>
      </div>
      <HpBar actual={hpActual} max={hpMax} />
      <div className="card-section">
        <h3 className="card-section-title">Estadísticas</h3>
        <StatBars estadisticas={pokemon.estadisticas} />
      </div>
      <div className="card-section">
        <h3 className="card-section-title">Movimientos</h3>
        <MoveList movimientos={pokemon.movimientos} />
      </div>
    </div>
  );
}
