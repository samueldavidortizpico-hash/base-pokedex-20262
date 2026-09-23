// ============================================================
//  Mapas explorables de POKEMON WORLD ADVENTURE
//
//  El fondo de cada mapa es una ilustracion completa. Encima va esta
//  capa invisible de fisicas: dice por donde se puede andar y por donde
//  no. Las mascaras se generaron muestreando el color de la propia
//  imagen, por eso los caminos coinciden con los que se ven.
//
//  Leyenda de casillas:
//    "."  suelo transitable (camino, plaza, claro)
//    "#"  obstaculo solido (roca, arbol, edificio)
//    "~"  zona peligrosa (lava, agua profunda, cascada)
//    "h"  zona de encuentros dentro del camino
//    "c"  cofre con objetos
//    "@"  posicion inicial del jugador
// ============================================================

export const TILE = 48;
export const ANCHO = 32;
export const ALTO = 20;

export const MAPAS = [
  {
    id: "agua",
    nombre: "Ciudad Marina",
    emoji: "🌊",
    habitat: "agua",
    lema: "Una ciudad sumergida donde los corales alumbran las calles.",
    tema: "tema-agua",
    particula: "burbuja",
    zonaAlta: "Algas",
    // Calles y plazas de piedra; todo lo demas es oceano abierto.
    tiles: [
      "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
      "~###~~~~~~~~~ch.~..~~~~~~~~##~~~",
      "~~##~#~~~~~h...h...~~~~~~####~#~",
      "~~~~##~~~~~~h..~~...~~~~#####~#~",
      "~#~~###~~~~..h...h..~~#~~##~###~",
      "~##~##~~#~.~~~h...~~##~~~~#~~~~~",
      "~~####~~~.h~~~.h..~~~~.~~~##~~~~",
      "~#~###~~~~.h....h...~~...~~~~c~~",
      "~#######~~~~~....h...h....~~..~~",
      "~##~#~~~~~~~~~~..~~~~.h....h.~~~",
      "~##~##~#~~~~~~~..~~~~~~~..~~~~~~",
      "~~########~~~..h@.~~~~~~h.~~~~~~",
      "~~~#######~.h...h.~~~~~~.h~~~#~~",
      "~~~#####~~~~~~~..~~~~~~~c.h..~~~",
      "~##~~~~~~~~~~~~..~~~~~~~~~.~~~~~",
      "##~#~~~~~~~~~~~h.~~~~~~~~~~~~#~~",
      "#######~#~~~~~~.h~~~~~~~~~~~~~~~",
      "~~######~~~~#~~..~~~~~~~#~~~~##~",
      "~~~~#~~###~~~~c...h~~~###~~~~#~~",
      "~~~~~~~~~#~~~~####~~~~~#~~~~~~~~",
    ],
  },

  {
    id: "jungla",
    nombre: "Jungla Salvaje",
    emoji: "🌱",
    habitat: "jungla",
    lema: "Selva densa cruzada por un río, llena de Pokémon escondidos.",
    tema: "tema-jungla",
    particula: "hoja",
    zonaAlta: "Hierba alta",
    // Senderos de tierra y claros; la espesura y el rio estan cerrados.
    tiles: [
      "~~~~##~~~~~~~~~~~~~~~~~#~~~~~~~~",
      "~c..~#~..~~~~~~##~~~~~####~.h.~~",
      "~.~..~~~.##~~~#~#~~~~######~~hc~",
      "~..h~..h.~~~~~~~##~####~#~~#~.h#",
      "~~~.h.#~h.~~~~#~~~~###~#~.h~~..~",
      "##..~~##.h..~~###.~~~~~~...h..~~",
      "~#~~~~~..~~..#~#..#h.~~~h...h..#",
      "~~~~~~~~.~~~....h...h..~.~.~.~.#",
      "~~~~~..~##~~h~...h#~.h....h~~.h#",
      "~~~#h...#~~~.~..@#~~.~~~#c.~~~~~",
      "~~~~.h..~~~~~#h....~...h.~~#~~~~",
      "~~~~c~h..~~~##.h#~.~~~~.h~~#~#~~",
      "~~~~#~~~.~~~h...##~~~#~~~~~~~#~~",
      "~~~###~~h....h...#####~##~~~###~",
      "~~~~##~##h..#.#.~#######~####~~#",
      "~~~~#~###~~~~~#~~##~~~##########",
      "~~~#~~##~#~~~~####~~~~~#########",
      "~~##~~#~~#~~~~~~~~##~~###~~##~#~",
      "~~~~~~#~~~~~~~~~~~~~######~#~~~~",
      "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    ],
  },

  {
    id: "volcan",
    nombre: "Volcán de Fuego",
    emoji: "🔥",
    habitat: "volcan",
    lema: "Rocas ardientes, ríos de lava y ceniza flotando en el aire.",
    tema: "tema-volcan",
    particula: "ceniza",
    zonaAlta: "Ceniza ardiente",
    // Solo la calzada de piedra: la lava y la roca cortada no se pisan.
    tiles: [
      "~~~~~#~~~~~~~##~~~~~~~#####~~~~~",
      "#c~.~~~~#~~##~~~~..h~~##~~#~~~~~",
      "~.h.~~~~~~~~~..h....~~#~~~~~~~~~",
      "#..h...h.~~~~..~~...~~~~~~~~~#~~",
      "~...~~.#~~~~.h...h..~~h.~~~~~~~~",
      "~~...~~~~~~~~~h...h~~~.h..~~~~~~",
      "~h....~~~~~....~...h.~.~~~~~~~~~",
      "~~h....h.~~~....h.~.h...~~~~~~##",
      "~~~~~~..h...h....h.~~~~~~~~~~~~#",
      "~~#~~~~~.h...h.~~.@.~~~~~~~~..~#",
      "~##~~~~~~~h.~~h~~~.h...h.~#~h~~~",
      "###~~~~~~..h.~~~#...~~~.h....~~~",
      "~~~~~~~h~...h..~~~.~~~~~~h....h#",
      "~~~~~c..h....h...h.#~~~~#~~~#..#",
      "~~~~~~~~~~..~.h...h.~#~~~~###.c~",
      "~~~~~~~~~~~....~~~.h.~~~~~~##~~~",
      "~~~~~~~~~~~~~...~~~~h..~~#~#~~~~",
      "#~~~~~~##~~~~~~..~~~~~~#~##~###~",
      "~~~~~~~~~~~~~~~~c~~~~~~~~~#####~",
      "~~~~~~#~~~~#~~~~~##~~~~~~~##~#~~",
    ],
  },
];

export const mapaPorId = (id) => MAPAS.find((m) => m.id === id) || MAPAS[0];

/** Casilla en coordenadas de rejilla; fuera del mapa cuenta como solido. */
export function casilla(mapa, tx, ty) {
  if (ty < 0 || ty >= mapa.tiles.length) return "#";
  const fila = mapa.tiles[ty];
  if (tx < 0 || tx >= fila.length) return "#";
  return fila[tx];
}

export const esSolido = (c) => c === "#";
export const esPeligro = (c) => c === "~";
export const bloquea = (c) => c === "#" || c === "~";
export const esZonaAlta = (c) => c === "h";

/** Posicion inicial del jugador en pixeles, leida del caracter "@". */
export function spawnDe(mapa) {
  for (let y = 0; y < mapa.tiles.length; y++) {
    const x = mapa.tiles[y].indexOf("@");
    if (x !== -1) return { x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 };
  }
  return { x: TILE * 2, y: TILE * 2 };
}

/** Todos los cofres del mapa, con un id estable para saber cual se abrio. */
export function cofresDe(mapa) {
  const lista = [];
  mapa.tiles.forEach((fila, y) => {
    [...fila].forEach((c, x) => {
      if (c === "c") lista.push({ id: `${mapa.id}:${x},${y}`, x, y });
    });
  });
  return lista;
}

/** Casillas por las que se puede andar, en coordenadas de rejilla. */
export function transitablesDe(mapa) {
  const lista = [];
  mapa.tiles.forEach((fila, y) => {
    [...fila].forEach((c, x) => {
      if (!bloquea(c)) lista.push({ x, y });
    });
  });
  return lista;
}
