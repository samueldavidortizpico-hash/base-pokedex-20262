import TypeBadge from "./TypeBadge";
import StatBars from "./StatBars";
import MoveList from "./MoveList";
import EvolutionChain from "./EvolutionChain";
import TypeEffectiveness from "./TypeEffectiveness";
import { cap } from "../utils/battle";

function obtenerNombreEspecie(especie) {
  if (!especie || !Array.isArray(especie.genera)) return null;
  return especie.genera.find((x) => x.language?.name === "en")?.genus || null;
}

export default function PokemonCard({ datos, especie, evolucion }) {
  if (!datos) return null;
  const numPad = String(datos.id).padStart(3, "0");
  const especieNombre = obtenerNombreEspecie(especie);

  return (
    <article className="pokemon-card">
      <div className="card-inner">
        <header className="card-header">
          <div>
            <p className="card-number">#{numPad}</p>
            <h2 className="card-name">{cap(datos.nombre)}</h2>
          </div>
          <div className="card-hp">HP {datos.hpMax}</div>
        </header>

        <div className="card-art">
          {datos.imagen
            ? <img src={datos.imagen} alt={cap(datos.nombre)} />
            : <p>Imagen no disponible.</p>}
        </div>

        <div className="type-list">
          {datos.tipos.map((t) => <TypeBadge key={t} tipo={t} />)}
        </div>

        <div className="card-info">
          <div className="info-box"><strong>ID</strong><span>#{numPad}</span></div>
          {especieNombre && <div className="info-box"><strong>Especie</strong><span>{especieNombre}</span></div>}
          <div className="info-box"><strong>Altura</strong><span>{(datos.raw.height / 10).toFixed(1)} m</span></div>
          <div className="info-box"><strong>Peso</strong><span>{(datos.raw.weight / 10).toFixed(1)} kg</span></div>
        </div>

        <section className="card-section">
          <h3 className="card-section-title">Habilidad</h3>
          <div className="ability-box">
            <div className="ability-name">{cap(datos.habilidad.nombre)}</div>
            <p className="ability-description">{datos.habilidad.descripcion}</p>
          </div>
        </section>

        <section className="card-section">
          <h3 className="card-section-title">Estadísticas base</h3>
          <StatBars estadisticas={datos.estadisticas} />
        </section>

        <section className="card-section">
          <h3 className="card-section-title">Movimientos</h3>
          <MoveList movimientos={datos.movimientos} />
        </section>

        <section className="card-section">
          <h3 className="card-section-title">Cadena evolutiva</h3>
          <EvolutionChain evolucion={evolucion} nombreActual={datos.nombre} />
        </section>

        <section className="card-section">
          <h3 className="card-section-title">Efectividad defensiva</h3>
          <TypeEffectiveness tipos={datos.tipos} />
        </section>
      </div>
    </article>
  );
}
