// ============================================================
//  Animacion de evolucion a pantalla completa.
//  Fases: brillo -> transformacion -> felicitacion.
// ============================================================

import { useEffect, useState } from "react";
import TypeBadge from "../TypeBadge";

export default function EvolutionOverlay({ desde, hacia, onCompletar }) {
  const [fase, setFase] = useState("brillo");

  useEffect(() => {
    const a = setTimeout(() => setFase("cambio"), 1500);
    const b = setTimeout(() => setFase("final"), 3400);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  return (
    <div className={`evolucion evolucion--${fase}`} role="dialog" aria-modal="true" aria-label="Evolución">
      <div className="evolucion-rayos" aria-hidden="true" />

      <div className="evolucion-escena">
        <img className="evolucion-sprite evolucion-sprite--antes" src={desde.imagen} alt={desde.nombre} />
        <img className="evolucion-sprite evolucion-sprite--despues" src={hacia.imagen} alt={hacia.nombre} />
      </div>

      <div className="evolucion-texto">
        {fase === "brillo" && <p>¿Qué? ¡{desde.nombre} está evolucionando!</p>}
        {fase === "cambio" && <p className="evolucion-parpadeo">. . .</p>}
        {fase === "final" && (
          <>
            <h2>¡Felicidades! Tu Pokémon evolucionó</h2>
            <p className="evolucion-nombres">
              {desde.nombre} <span aria-hidden="true">→</span> <strong>{hacia.nombre}</strong>
            </p>
            <div className="evolucion-tipos">
              {hacia.tipo.map((t) => <TypeBadge key={t} tipo={t} />)}
            </div>
            <button className="boton boton-primario" onClick={onCompletar} autoFocus>
              ¡Genial!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
