// ============================================================
//  Movimientos del juego. Cada Pokemon aprende 3 ataques
//  derivados de sus tipos, mas una habilidad especial.
// ============================================================

/** Dos ataques por tipo: uno basico y uno potente. */
export const MOVIMIENTOS_POR_TIPO = {
  normal: [
    { nombre: "Placaje", poder: 40, categoria: "physical" },
    { nombre: "Golpe Cuerpo", poder: 85, categoria: "physical" },
  ],
  fire: [
    { nombre: "Ascuas", poder: 45, categoria: "special" },
    { nombre: "Lanzallamas", poder: 90, categoria: "special" },
  ],
  water: [
    { nombre: "Pistola Agua", poder: 45, categoria: "special" },
    { nombre: "Hidrobomba", poder: 95, categoria: "special" },
  ],
  grass: [
    { nombre: "Látigo Cepa", poder: 45, categoria: "physical" },
    { nombre: "Rayo Solar", poder: 90, categoria: "special" },
  ],
  electric: [
    { nombre: "Impactrueno", poder: 45, categoria: "special" },
    { nombre: "Rayo", poder: 90, categoria: "special" },
  ],
  ice: [
    { nombre: "Nieve Polvo", poder: 45, categoria: "special" },
    { nombre: "Rayo Hielo", poder: 90, categoria: "special" },
  ],
  fighting: [
    { nombre: "Golpe Karate", poder: 50, categoria: "physical" },
    { nombre: "Puño Dinámico", poder: 90, categoria: "physical" },
  ],
  poison: [
    { nombre: "Ácido", poder: 45, categoria: "special" },
    { nombre: "Bomba Lodo", poder: 90, categoria: "special" },
  ],
  ground: [
    { nombre: "Bofetón Lodo", poder: 45, categoria: "special" },
    { nombre: "Terremoto", poder: 95, categoria: "physical" },
  ],
  flying: [
    { nombre: "Tornado", poder: 45, categoria: "special" },
    { nombre: "Ave Brava", poder: 90, categoria: "physical" },
  ],
  psychic: [
    { nombre: "Confusion", poder: 50, categoria: "special" },
    { nombre: "Psíquico", poder: 90, categoria: "special" },
  ],
  bug: [
    { nombre: "Picadura", poder: 45, categoria: "physical" },
    { nombre: "Zumbido", poder: 85, categoria: "special" },
  ],
  rock: [
    { nombre: "Lanzarrocas", poder: 50, categoria: "physical" },
    { nombre: "Avalancha", poder: 90, categoria: "physical" },
  ],
  ghost: [
    { nombre: "Lengüetazo", poder: 45, categoria: "physical" },
    { nombre: "Bola Sombra", poder: 85, categoria: "special" },
  ],
  dragon: [
    { nombre: "Furia Dragón", poder: 50, categoria: "special" },
    { nombre: "Garra Dragón", poder: 90, categoria: "physical" },
  ],
  dark: [
    { nombre: "Mordisco", poder: 50, categoria: "physical" },
    { nombre: "Pulso Umbrío", poder: 85, categoria: "special" },
  ],
  steel: [
    { nombre: "Garra Metal", poder: 50, categoria: "physical" },
    { nombre: "Cabeza Hierro", poder: 90, categoria: "physical" },
  ],
  fairy: [
    { nombre: "Brillo Mágico", poder: 50, categoria: "special" },
    { nombre: "Fuerza Lunar", poder: 90, categoria: "special" },
  ],
};

/** Habilidad especial: cuesta energia pero pega muy fuerte. */
export const ESPECIAL_POR_TIPO = {
  fire: "Furia Volcánica",
  water: "Maremoto Abisal",
  grass: "Tormenta Floral",
  electric: "Descarga Titánica",
  ice: "Ventisca Eterna",
  fighting: "Combate Total",
  poison: "Niebla Tóxica",
  ground: "Fisura Sísmica",
  flying: "Ciclón Celeste",
  psychic: "Colapso Mental",
  bug: "Plaga Infinita",
  rock: "Derrumbe Milenario",
  ghost: "Grito del Abismo",
  dragon: "Ira del Dragón",
  dark: "Eclipse Negro",
  steel: "Yunque Estelar",
  fairy: "Aurora Encantada",
  normal: "Golpe Definitivo",
};

export const COSTE_ESPECIAL = 2;
export const ENERGIA_MAXIMA = 4;

/** Los 3 ataques normales de una especie, segun sus tipos. */
export function movimientosDe(especie) {
  const [principal, secundario] = especie.tipo;
  const setPrincipal = MOVIMIENTOS_POR_TIPO[principal] || MOVIMIENTOS_POR_TIPO.normal;
  const setSecundario = secundario
    ? MOVIMIENTOS_POR_TIPO[secundario] || MOVIMIENTOS_POR_TIPO.normal
    : MOVIMIENTOS_POR_TIPO.normal;

  return [
    { ...setPrincipal[0], tipo: principal },
    { ...setPrincipal[1], tipo: principal },
    { ...setSecundario[1], tipo: secundario || "normal" },
  ];
}

/** Habilidad especial de una especie (siempre de su tipo principal). */
export function especialDe(especie) {
  const principal = especie.tipo[0];
  return {
    nombre: ESPECIAL_POR_TIPO[principal] || ESPECIAL_POR_TIPO.normal,
    poder: 120,
    categoria: "special",
    tipo: principal,
    especial: true,
  };
}
