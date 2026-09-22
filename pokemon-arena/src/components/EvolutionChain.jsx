import { SPRITE_BASE_URL } from "../constants";
import { cap } from "../utils/battle";

function extraerId(url) {
  return url?.match(/\/(\d+)\/?$/)?.[1] || null;
}

function construirArbol(nodo) {
  if (!nodo) return null;
  return {
    nombre: nodo.species?.name || "unknown",
    id: extraerId(nodo.species?.url),
    hijos: Array.isArray(nodo.evolves_to)
      ? nodo.evolves_to.map(construirArbol).filter(Boolean)
      : [],
  };
}

function generarRutas(nodo, ruta = []) {
  const nueva = [...ruta, nodo];
  if (!nodo.hijos.length) return [nueva];
  return nodo.hijos.flatMap((h) => generarRutas(h, nueva));
}

export default function EvolutionChain({ evolucion, nombreActual }) {
  if (!evolucion?.chain) return <p className="no-data">Sin datos de evolución.</p>;

  const arbol = construirArbol(evolucion.chain);
  const rutas = arbol ? generarRutas(arbol) : [];
  if (!rutas.length) return <p className="no-data">Sin cadena evolutiva.</p>;

  return (
    <div className="evoluciones">
      {rutas.map((ruta, i) => (
        <div key={i} className="ruta-evolucion">
          {ruta.map((etapa, j) => (
            <div key={etapa.nombre} className="evo-stage-wrapper">
              {j > 0 && <span className="flecha-evolucion">→</span>}
              <div className={`etapa-evolucion${etapa.nombre === nombreActual ? " etapa-actual" : ""}`}>
                {etapa.id && (
                  <img src={`${SPRITE_BASE_URL}${etapa.id}.png`} alt={cap(etapa.nombre)} loading="lazy" />
                )}
                <p>{cap(etapa.nombre)}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
