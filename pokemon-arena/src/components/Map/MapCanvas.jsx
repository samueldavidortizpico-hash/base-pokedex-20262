// ============================================================
//  Capas del mapa: ilustracion de fondo, cofres, particulas y
//  atmosfera. Va memoizado porque el jugador se mueve 60 veces por
//  segundo y nada de esto necesita volver a dibujarse.
// ============================================================

import { memo, useMemo } from "react";
import { TILE, ANCHO, ALTO } from "../../data/maps";
import WorldRenderer from "./WorldRenderer";

function CapaParticulas({ mapa }) {
  // Reparto fijo a partir del indice: el render es puro y las particulas
  // no saltan de sitio cada vez que el componente se repinta.
  const particulas = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: ((i * 97) % 100) / 100 * ANCHO * TILE,
        top: ((i * 53) % 100) / 100 * ALTO * TILE,
        escala: 0.5 + (((i * 31) % 100) / 100) * 1.1,
        duracion: 4 + ((i * 17) % 70) / 10,
        retardo: ((i * 41) % 60) / 10,
        key: `${mapa.id}-${i}`,
      })),
    [mapa]
  );

  return (
    <div className="capa capa-particulas" aria-hidden="true">
      {particulas.map((p) => (
        <span
          key={p.key}
          className={`particula particula-${mapa.particula}`}
          style={{
            left: p.left,
            top: p.top,
            transform: `scale(${p.escala})`,
            animationDuration: `${p.duracion}s`,
            animationDelay: `-${p.retardo}s`,
          }}
        />
      ))}
    </div>
  );
}
const Particulas = memo(CapaParticulas);

function CapaAtmosfera({ mapa }) {
  const tipo = mapa.habitat;
  const elementos = tipo === "agua"
    ? ["rayo", "rayo", "rayo", "bruma", "bruma"]
    : tipo === "jungla"
      ? ["niebla", "niebla", "hoja-caida", "hoja-caida", "hoja-caida"]
      : ["humo", "humo", "ascua", "ascua", "ascua"];
  return (
    <div className={`capa capa-atmosfera atmosfera-${tipo}`} aria-hidden="true">
      {elementos.map((clase, i) => (
        <span key={`${tipo}-${i}`} className={`atmosfera-elemento atmosfera-${clase}`} style={{ animationDelay: `${i * -1.7}s`, left: `${12 + i * 19}%` }} />
      ))}
    </div>
  );
}
const Atmosfera = memo(CapaAtmosfera);

function CapaCofres({ cofres, abiertos, cercaId }) {
  return (
    <div className="capa capa-cofres">
      {cofres.map((c) => {
        const abierto = abiertos.includes(c.id);
        return (
          <span
            key={c.id}
            className={`cofre${abierto ? " cofre--abierto" : ""}${c.id === cercaId ? " cofre--cerca" : ""}`}
            style={{ left: c.x * TILE, top: c.y * TILE }}
            aria-hidden="true"
          >
            {abierto ? "📭" : "🎁"}
          </span>
        );
      })}
    </div>
  );
}
const Cofres = memo(CapaCofres);

export default function MapCanvas({ mapa, cofres, cofresAbiertos, salvajes, cercaId, children }) {
  return (
    <WorldRenderer mapa={mapa} salvajes={salvajes} cercaId={cercaId}>
      <Atmosfera mapa={mapa} />
      <Cofres cofres={cofres} abiertos={cofresAbiertos} cercaId={cercaId} />
      <Particulas mapa={mapa} />
      {children}
    </WorldRenderer>
  );
}
