// ============================================================
//  CollisionSystem
//  Nadie choca con su dibujo: cada personaje tiene una caja pequena
//  a los pies. El decorado del fondo no colisiona; solo lo hace la
//  mascara de casillas del mapa.
// ============================================================

import { TILE, ANCHO, ALTO, casilla, bloquea, transitablesDe } from "../data/maps.js";

/** Caja de colision a los pies, medida desde el punto de anclaje. */
export const HITBOX_JUGADOR = { mitadX: 9, arriba: 3, abajo: 7 };
export const HITBOX_COMPANERO = { mitadX: 6, arriba: 2, abajo: 5 };

const LIMITE_X = ANCHO * TILE;
const LIMITE_Y = ALTO * TILE;

/** Caracter del mapa bajo un punto en pixeles. */
export const casillaEn = (mapa, x, y) =>
  casilla(mapa, Math.floor(x / TILE), Math.floor(y / TILE));

/**
 * Que bloquea a un personaje centrado en (x, y): "#", "~" o null si cabe.
 * Se comprueban las cuatro esquinas de la caja, no el sprite entero.
 */
export function choque(mapa, x, y, hb) {
  if (x < 0 || y < 0 || x > LIMITE_X || y > LIMITE_Y) return "#";
  for (const px of [x - hb.mitadX, x + hb.mitadX]) {
    for (const py of [y - hb.arriba, y + hb.abajo]) {
      const c = casillaEn(mapa, px, py);
      if (bloquea(c)) return c;
    }
  }
  return null;
}

export const cabe = (mapa, x, y, hb) => choque(mapa, x, y, hb) === null;

/**
 * Avance con deslizamiento: cada eje se prueba por separado, asi el
 * personaje roza la pared en vez de clavarse en ella.
 * Devuelve la posicion resultante y que tipo de casilla le corto el paso.
 */
export function deslizar(mapa, x, y, dx, dy, hb) {
  let nx = x;
  let ny = y;
  const cortes = [];

  if (dx) {
    const c = choque(mapa, x + dx, y, hb);
    if (c) cortes.push(c);
    else nx = x + dx;
  }
  if (dy) {
    const c = choque(mapa, nx, y + dy, hb);
    if (c) cortes.push(c);
    else ny = y + dy;
  }
  // El aviso de peligro manda sobre el de pared: es el que el jugador nota.
  const bloqueo = cortes.includes("~") ? "~" : cortes[0] || null;
  return { x: nx, y: ny, bloqueo };
}

/**
 * Centro de casilla pisable mas cercano. Evita que un cambio de mapa, de
 * hitbox o un empujon raro dejen al personaje encerrado dentro de una pared.
 */
export function posicionSegura(mapa, x, y, hb) {
  if (cabe(mapa, x, y, hb)) return { x, y };
  let mejor = null;
  for (const t of transitablesDe(mapa)) {
    const cx = t.x * TILE + TILE / 2;
    const cy = t.y * TILE + TILE / 2;
    const d = Math.hypot(cx - x, cy - y);
    if ((!mejor || d < mejor.d) && cabe(mapa, cx, cy, hb)) mejor = { x: cx, y: cy, d };
  }
  return mejor ? { x: mejor.x, y: mejor.y } : { x, y };
}
