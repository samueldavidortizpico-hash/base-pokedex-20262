// ============================================================
//  El entrenador y su Pokemon acompanante sobre el mapa.
//
//  Cada personaje son dos nodos: el de fuera coloca (transform) y el de
//  dentro anima. Si se animara el mismo nodo que se posiciona, el
//  fotograma de la animacion pisaria el transform y el sprite saldria
//  disparado al origen del mapa.
// ============================================================

import { useCompanion } from "../../hooks/useCompanion";

export default function Player({ pos, cuerpo, mapa, companero }) {
  const nodoCompanero = useCompanion({ cuerpo, mapa, clave: companero?.uid });

  return (
    <>
      {companero && (
        <div ref={nodoCompanero} className="companero">
          <span className="companero-sombra" aria-hidden="true" />
          <img className="companero-sprite" src={companero.sprite} alt={companero.nombre} />
        </div>
      )}

      <div
        className={`jugador jugador--${pos.direccion}${pos.andando ? " jugador--anda" : ""}`}
        style={{ transform: `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y)}px, 0)` }}
      >
        <span className="jugador-sombra" aria-hidden="true" />
        <span className="jugador-cuerpo" aria-hidden="true" />
      </div>
    </>
  );
}
