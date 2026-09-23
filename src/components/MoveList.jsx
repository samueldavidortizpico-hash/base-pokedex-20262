import TypeBadge from "./TypeBadge";

export default function MoveList({ movimientos }) {
  if (!movimientos?.length) return <p className="no-data">Sin movimientos.</p>;
  return (
    <div className="moves-list">
      {movimientos.map((move) => (
        <div key={move.nombre} className="move-item">
          <div className="move-main">
            <span className="move-name">{move.nombre.replace(/-/g, " ")}</span>
            <TypeBadge tipo={move.tipo} small />
          </div>
          <div className="move-meta">
            <span className="move-stat">POT {move.poder}</span>
            <span className="move-stat">PREC {move.precision}%</span>
            <span className={`move-category move-category--${move.categoria}`}>
              {move.categoria === "physical" ? "Físico" : "Especial"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
