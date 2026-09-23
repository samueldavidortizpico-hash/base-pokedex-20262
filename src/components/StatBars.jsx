import { STAT_NAMES } from "../constants";

function statColor(valor) {
  if (valor >= 120) return "#4ade80";
  if (valor >= 80) return "#86efac";
  if (valor >= 50) return "#fbbf24";
  return "#f87171";
}

export default function StatBars({ estadisticas }) {
  if (!estadisticas?.length) return <p className="no-data">Sin estadísticas.</p>;
  const total = estadisticas.reduce((s, e) => s + e.valor, 0);
  return (
    <div className="stats">
      {estadisticas.map((stat) => {
        const pct = Math.min((stat.valor / 180) * 100, 100);
        return (
          <div key={stat.nombre} className="stat">
            <span className="stat-name">{STAT_NAMES[stat.nombre] || stat.nombre}</span>
            <div className="stat-bar">
              <div className="stat-fill" style={{ width: `${pct}%`, backgroundColor: statColor(stat.valor) }} />
            </div>
            <span className="stat-value">{stat.valor}</span>
          </div>
        );
      })}
      <div className="total-stats">
        <span>Total base</span>
        <span>{total}</span>
      </div>
    </div>
  );
}
