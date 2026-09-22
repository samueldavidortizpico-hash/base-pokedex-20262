// ============================================================
//  InteractionSystem
//  Que tiene el jugador al alcance de la mano. Solo mide distancias:
//  quien reacciona a la tecla E es el mundo, no este modulo.
// ============================================================

import { TILE } from "../data/maps.js";

export const ALCANCE = TILE * 1.3;

const centro = (t) => ({ x: t.x * TILE + TILE / 2, y: t.y * TILE + TILE / 2 });

/** Une cofres y Pokemon de ambiente en una sola lista de objetivos. */
export function objetivosDe({ cofres = [], salvajes = [] }) {
  return [
    ...cofres.map((c) => ({ ...centro(c), id: c.id, tipo: "cofre", etiqueta: "Abrir cofre" })),
    ...salvajes.map((s) => ({
      ...centro(s),
      id: s.key,
      tipo: "pokemon",
      especie: s.especie,
      etiqueta: `Acercarte a ${s.nombre}`,
    })),
  ];
}

/** El objetivo mas cercano dentro del alcance, o null. */
export function objetivoCercano(x, y, objetivos, alcance = ALCANCE) {
  let mejor = null;
  for (const o of objetivos) {
    const d = Math.hypot(o.x - x, o.y - y);
    if (d <= alcance && (!mejor || d < mejor.d)) mejor = { ...o, d };
  }
  return mejor;
}
