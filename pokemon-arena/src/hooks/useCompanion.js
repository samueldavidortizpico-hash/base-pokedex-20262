// ============================================================
//  CompanionController
//  El Pokemon acompanante sigue el rastro del entrenador, como en los
//  juegos de Pokemon: camina por donde ya ha pasado el jugador, asi
//  nunca atraviesa una pared ni se mete en la lava.
//
//  Escribe la posicion directamente sobre el nodo del DOM: no provoca
//  ningun render de React aunque se actualice 60 veces por segundo.
// ============================================================

import { useEffect, useRef } from "react";
import { HITBOX_COMPANERO, cabe, posicionSegura } from "../systems/collision";

const DISTANCIA = 40;       // px por detras del entrenador
const MUESTREO = 5;         // cada cuantos px se guarda un punto del rastro
const RASTRO_MAXIMO = 26;   // puntos guardados (suficiente para DISTANCIA)
const SUAVIZADO = 12;       // ganancia del lerp: mayor = mas pegado
const SEPARACION_MAXIMA = 96; // nunca se queda mas atras que esto
const SALTO = 220;          // por encima de esto es un cambio de mapa

/** Punto del rastro que queda a `distancia` px por detras de la cabeza. */
function puntoAtras(rastro, distancia) {
  let recorrido = 0;
  for (let i = 1; i < rastro.length; i++) {
    const a = rastro[i - 1];
    const b = rastro[i];
    const tramo = Math.hypot(b.x - a.x, b.y - a.y);
    if (recorrido + tramo >= distancia) {
      const t = tramo ? (distancia - recorrido) / tramo : 0;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    recorrido += tramo;
  }
  return rastro[rastro.length - 1];
}

/**
 * @param {object} cuerpo  ref del PlayerController con {x, y} en vivo
 * @param {object} mapa    mapa actual
 * @param {string} clave   id del companero: al cambiar, reaparece junto al jugador
 */
export function useCompanion({ cuerpo, mapa, clave }) {
  const nodo = useRef(null);
  const rastro = useRef([]);
  const pos = useRef(null);

  // Cambio de mapa o de companero: aparece al lado del entrenador, sin viaje.
  useEffect(() => {
    rastro.current = [];
    pos.current = null;
  }, [mapa, clave]);

  useEffect(() => {
    let frame = requestAnimationFrame(paso);
    let anterior = performance.now();

    function paso(ahora) {
      frame = requestAnimationFrame(paso);
      const dt = Math.min((ahora - anterior) / 1000, 0.05);
      anterior = ahora;

      const jugador = cuerpo.current;
      if (!nodo.current || !jugador) return;

      const cabeza = rastro.current[0];
      if (!cabeza || Math.hypot(jugador.x - cabeza.x, jugador.y - cabeza.y) > MUESTREO) {
        rastro.current.unshift({ x: jugador.x, y: jugador.y });
        if (rastro.current.length > RASTRO_MAXIMO) rastro.current.pop();
      }

      if (!pos.current) pos.current = { x: jugador.x, y: jugador.y };
      const actual = pos.current;
      const objetivo = puntoAtras(rastro.current, DISTANCIA);

      let x;
      let y;
      if (Math.hypot(objetivo.x - actual.x, objetivo.y - actual.y) > SALTO) {
        ({ x, y } = objetivo); // reaparicion: un unico salto, nunca un rebote
      } else {
        const ganancia = 1 - Math.exp(-SUAVIZADO * dt);
        x = actual.x + (objetivo.x - actual.x) * ganancia;
        y = actual.y + (objetivo.y - actual.y) * ganancia;

        // Si se descuelga demasiado, se le acerca sin teletransportarlo.
        const dx = jugador.x - x;
        const dy = jugador.y - y;
        const lejos = Math.hypot(dx, dy);
        if (lejos > SEPARACION_MAXIMA) {
          const k = (lejos - SEPARACION_MAXIMA) / lejos;
          x += dx * k;
          y += dy * k;
        }
      }

      // Colision blanda: el rastro ya es terreno pisado, esto es el seguro.
      if (!cabe(mapa, x, y, HITBOX_COMPANERO)) ({ x, y } = posicionSegura(mapa, x, y, HITBOX_COMPANERO));

      const velocidad = Math.hypot(x - actual.x, y - actual.y) / dt;
      pos.current = { x, y };

      const estilo = nodo.current.style;
      estilo.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      nodo.current.classList.toggle("companero--anda", velocidad > 12);
    }

    return () => cancelAnimationFrame(frame);
  }, [cuerpo, mapa]);

  return nodo;
}
