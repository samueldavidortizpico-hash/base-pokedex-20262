// ============================================================
//  POKÉMON WORLD ADVENTURE - Base de datos de especies
//  Cada especie: { id, nombre, tipo, habitat, nivel, vida,
//                  ataque, defensa, velocidad, evolucion, imagen }
//  habitat: "agua" | "jungla" | "volcan"
//  evolucion: { id, nivel } | null
// ============================================================

const ART = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
const SPR = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

const art = (id) => `${ART}${id}.png`;
const spr = (id) => `${SPR}${id}.png`;

export const POKEMON = [
  // ---------------------------------------------------------
  // CIUDAD MARINA (habitat: agua)
  // ---------------------------------------------------------
  { id: 7, nombre: "Squirtle", tipo: ["water"], habitat: "agua", nivel: 5, vida: 44, ataque: 48, defensa: 65, velocidad: 43, evolucion: { id: 8, nivel: 16 }, imagen: art(7), sprite: spr(7) },
  { id: 8, nombre: "Wartortle", tipo: ["water"], habitat: "agua", nivel: 16, vida: 59, ataque: 63, defensa: 80, velocidad: 58, evolucion: { id: 9, nivel: 36 }, imagen: art(8), sprite: spr(8) },
  { id: 9, nombre: "Blastoise", tipo: ["water"], habitat: "agua", nivel: 36, vida: 79, ataque: 83, defensa: 100, velocidad: 78, evolucion: null, imagen: art(9), sprite: spr(9) },
  { id: 54, nombre: "Psyduck", tipo: ["water"], habitat: "agua", nivel: 8, vida: 50, ataque: 52, defensa: 48, velocidad: 55, evolucion: { id: 55, nivel: 33 }, imagen: art(54), sprite: spr(54) },
  { id: 55, nombre: "Golduck", tipo: ["water"], habitat: "agua", nivel: 33, vida: 80, ataque: 82, defensa: 78, velocidad: 85, evolucion: null, imagen: art(55), sprite: spr(55) },
  { id: 129, nombre: "Magikarp", tipo: ["water"], habitat: "agua", nivel: 4, vida: 20, ataque: 10, defensa: 55, velocidad: 80, evolucion: { id: 130, nivel: 20 }, imagen: art(129), sprite: spr(129) },
  { id: 130, nombre: "Gyarados", tipo: ["water", "flying"], habitat: "agua", nivel: 20, vida: 95, ataque: 125, defensa: 79, velocidad: 81, evolucion: null, imagen: art(130), sprite: spr(130) },
  { id: 131, nombre: "Lapras", tipo: ["water", "ice"], habitat: "agua", nivel: 22, vida: 130, ataque: 85, defensa: 80, velocidad: 60, evolucion: null, imagen: art(131), sprite: spr(131) },
  { id: 134, nombre: "Vaporeon", tipo: ["water"], habitat: "agua", nivel: 25, vida: 130, ataque: 65, defensa: 60, velocidad: 65, evolucion: null, imagen: art(134), sprite: spr(134) },
  { id: 382, nombre: "Kyogre", tipo: ["water"], habitat: "agua", nivel: 45, vida: 100, ataque: 100, defensa: 90, velocidad: 90, evolucion: null, imagen: art(382), sprite: spr(382) },
  { id: 116, nombre: "Horsea", tipo: ["water"], habitat: "agua", nivel: 6, vida: 30, ataque: 40, defensa: 70, velocidad: 60, evolucion: { id: 117, nivel: 32 }, imagen: art(116), sprite: spr(116) },
  { id: 117, nombre: "Seadra", tipo: ["water"], habitat: "agua", nivel: 32, vida: 55, ataque: 65, defensa: 95, velocidad: 85, evolucion: { id: 230, nivel: 45 }, imagen: art(117), sprite: spr(117) },
  { id: 230, nombre: "Kingdra", tipo: ["water", "dragon"], habitat: "agua", nivel: 45, vida: 75, ataque: 95, defensa: 95, velocidad: 85, evolucion: null, imagen: art(230), sprite: spr(230) },
  { id: 120, nombre: "Staryu", tipo: ["water"], habitat: "agua", nivel: 7, vida: 30, ataque: 45, defensa: 55, velocidad: 85, evolucion: { id: 121, nivel: 30 }, imagen: art(120), sprite: spr(120) },
  { id: 121, nombre: "Starmie", tipo: ["water", "psychic"], habitat: "agua", nivel: 30, vida: 60, ataque: 75, defensa: 85, velocidad: 115, evolucion: null, imagen: art(121), sprite: spr(121) },
  { id: 72, nombre: "Tentacool", tipo: ["water", "poison"], habitat: "agua", nivel: 6, vida: 40, ataque: 40, defensa: 35, velocidad: 70, evolucion: { id: 73, nivel: 30 }, imagen: art(72), sprite: spr(72) },
  { id: 73, nombre: "Tentacruel", tipo: ["water", "poison"], habitat: "agua", nivel: 30, vida: 80, ataque: 70, defensa: 65, velocidad: 100, evolucion: null, imagen: art(73), sprite: spr(73) },
  { id: 90, nombre: "Shellder", tipo: ["water"], habitat: "agua", nivel: 7, vida: 30, ataque: 65, defensa: 100, velocidad: 40, evolucion: { id: 91, nivel: 28 }, imagen: art(90), sprite: spr(90) },
  { id: 91, nombre: "Cloyster", tipo: ["water", "ice"], habitat: "agua", nivel: 28, vida: 50, ataque: 95, defensa: 180, velocidad: 70, evolucion: null, imagen: art(91), sprite: spr(91) },
  { id: 118, nombre: "Goldeen", tipo: ["water"], habitat: "agua", nivel: 5, vida: 45, ataque: 67, defensa: 60, velocidad: 63, evolucion: { id: 119, nivel: 33 }, imagen: art(118), sprite: spr(118) },
  { id: 119, nombre: "Seaking", tipo: ["water"], habitat: "agua", nivel: 33, vida: 80, ataque: 92, defensa: 65, velocidad: 68, evolucion: null, imagen: art(119), sprite: spr(119) },
  { id: 79, nombre: "Slowpoke", tipo: ["water", "psychic"], habitat: "agua", nivel: 9, vida: 90, ataque: 65, defensa: 65, velocidad: 15, evolucion: { id: 80, nivel: 37 }, imagen: art(79), sprite: spr(79) },
  { id: 80, nombre: "Slowbro", tipo: ["water", "psychic"], habitat: "agua", nivel: 37, vida: 95, ataque: 75, defensa: 110, velocidad: 30, evolucion: null, imagen: art(80), sprite: spr(80) },
  { id: 158, nombre: "Totodile", tipo: ["water"], habitat: "agua", nivel: 5, vida: 50, ataque: 65, defensa: 64, velocidad: 43, evolucion: { id: 159, nivel: 18 }, imagen: art(158), sprite: spr(158) },
  { id: 159, nombre: "Croconaw", tipo: ["water"], habitat: "agua", nivel: 18, vida: 65, ataque: 80, defensa: 80, velocidad: 58, evolucion: { id: 160, nivel: 30 }, imagen: art(159), sprite: spr(159) },
  { id: 160, nombre: "Feraligatr", tipo: ["water"], habitat: "agua", nivel: 30, vida: 85, ataque: 105, defensa: 100, velocidad: 78, evolucion: null, imagen: art(160), sprite: spr(160) },

  // ---------------------------------------------------------
  // JUNGLA SALVAJE (habitat: jungla)
  // ---------------------------------------------------------
  { id: 1, nombre: "Bulbasaur", tipo: ["grass", "poison"], habitat: "jungla", nivel: 5, vida: 45, ataque: 49, defensa: 49, velocidad: 45, evolucion: { id: 2, nivel: 16 }, imagen: art(1), sprite: spr(1) },
  { id: 2, nombre: "Ivysaur", tipo: ["grass", "poison"], habitat: "jungla", nivel: 16, vida: 60, ataque: 62, defensa: 63, velocidad: 60, evolucion: { id: 3, nivel: 32 }, imagen: art(2), sprite: spr(2) },
  { id: 3, nombre: "Venusaur", tipo: ["grass", "poison"], habitat: "jungla", nivel: 32, vida: 80, ataque: 82, defensa: 83, velocidad: 80, evolucion: null, imagen: art(3), sprite: spr(3) },
  { id: 172, nombre: "Pichu", tipo: ["electric"], habitat: "jungla", nivel: 3, vida: 20, ataque: 40, defensa: 15, velocidad: 60, evolucion: { id: 25, nivel: 10 }, imagen: art(172), sprite: spr(172) },
  { id: 25, nombre: "Pikachu", tipo: ["electric"], habitat: "jungla", nivel: 10, vida: 35, ataque: 55, defensa: 40, velocidad: 90, evolucion: { id: 26, nivel: 30 }, imagen: art(25), sprite: spr(25) },
  { id: 26, nombre: "Raichu", tipo: ["electric"], habitat: "jungla", nivel: 30, vida: 60, ataque: 90, defensa: 55, velocidad: 110, evolucion: null, imagen: art(26), sprite: spr(26) },
  { id: 10, nombre: "Caterpie", tipo: ["bug"], habitat: "jungla", nivel: 3, vida: 45, ataque: 30, defensa: 35, velocidad: 45, evolucion: { id: 11, nivel: 7 }, imagen: art(10), sprite: spr(10) },
  { id: 11, nombre: "Metapod", tipo: ["bug"], habitat: "jungla", nivel: 7, vida: 50, ataque: 20, defensa: 55, velocidad: 30, evolucion: { id: 12, nivel: 10 }, imagen: art(11), sprite: spr(11) },
  { id: 12, nombre: "Butterfree", tipo: ["bug", "flying"], habitat: "jungla", nivel: 10, vida: 60, ataque: 45, defensa: 50, velocidad: 70, evolucion: null, imagen: art(12), sprite: spr(12) },
  { id: 43, nombre: "Oddish", tipo: ["grass", "poison"], habitat: "jungla", nivel: 5, vida: 45, ataque: 50, defensa: 55, velocidad: 30, evolucion: { id: 44, nivel: 21 }, imagen: art(43), sprite: spr(43) },
  { id: 44, nombre: "Gloom", tipo: ["grass", "poison"], habitat: "jungla", nivel: 21, vida: 60, ataque: 65, defensa: 70, velocidad: 40, evolucion: { id: 45, nivel: 35 }, imagen: art(44), sprite: spr(44) },
  { id: 45, nombre: "Vileplume", tipo: ["grass", "poison"], habitat: "jungla", nivel: 35, vida: 75, ataque: 80, defensa: 85, velocidad: 50, evolucion: null, imagen: art(45), sprite: spr(45) },
  { id: 152, nombre: "Chikorita", tipo: ["grass"], habitat: "jungla", nivel: 5, vida: 45, ataque: 49, defensa: 65, velocidad: 45, evolucion: { id: 153, nivel: 16 }, imagen: art(152), sprite: spr(152) },
  { id: 153, nombre: "Bayleef", tipo: ["grass"], habitat: "jungla", nivel: 16, vida: 60, ataque: 62, defensa: 80, velocidad: 60, evolucion: { id: 154, nivel: 32 }, imagen: art(153), sprite: spr(153) },
  { id: 154, nombre: "Meganium", tipo: ["grass"], habitat: "jungla", nivel: 32, vida: 80, ataque: 82, defensa: 100, velocidad: 80, evolucion: null, imagen: art(154), sprite: spr(154) },
  { id: 470, nombre: "Leafeon", tipo: ["grass"], habitat: "jungla", nivel: 25, vida: 65, ataque: 110, defensa: 130, velocidad: 95, evolucion: null, imagen: art(470), sprite: spr(470) },
  { id: 69, nombre: "Bellsprout", tipo: ["grass", "poison"], habitat: "jungla", nivel: 5, vida: 50, ataque: 75, defensa: 35, velocidad: 40, evolucion: { id: 70, nivel: 21 }, imagen: art(69), sprite: spr(69) },
  { id: 70, nombre: "Weepinbell", tipo: ["grass", "poison"], habitat: "jungla", nivel: 21, vida: 65, ataque: 90, defensa: 50, velocidad: 55, evolucion: { id: 71, nivel: 35 }, imagen: art(70), sprite: spr(70) },
  { id: 71, nombre: "Victreebel", tipo: ["grass", "poison"], habitat: "jungla", nivel: 35, vida: 80, ataque: 105, defensa: 65, velocidad: 70, evolucion: null, imagen: art(71), sprite: spr(71) },
  { id: 102, nombre: "Exeggcute", tipo: ["grass", "psychic"], habitat: "jungla", nivel: 8, vida: 60, ataque: 40, defensa: 80, velocidad: 40, evolucion: { id: 103, nivel: 30 }, imagen: art(102), sprite: spr(102) },
  { id: 103, nombre: "Exeggutor", tipo: ["grass", "psychic"], habitat: "jungla", nivel: 30, vida: 95, ataque: 95, defensa: 85, velocidad: 55, evolucion: null, imagen: art(103), sprite: spr(103) },
  { id: 46, nombre: "Paras", tipo: ["bug", "grass"], habitat: "jungla", nivel: 6, vida: 35, ataque: 70, defensa: 55, velocidad: 25, evolucion: { id: 47, nivel: 24 }, imagen: art(46), sprite: spr(46) },
  { id: 47, nombre: "Parasect", tipo: ["bug", "grass"], habitat: "jungla", nivel: 24, vida: 60, ataque: 95, defensa: 80, velocidad: 30, evolucion: null, imagen: art(47), sprite: spr(47) },
  { id: 50, nombre: "Diglett", tipo: ["ground"], habitat: "jungla", nivel: 5, vida: 10, ataque: 55, defensa: 25, velocidad: 95, evolucion: { id: 51, nivel: 26 }, imagen: art(50), sprite: spr(50) },
  { id: 51, nombre: "Dugtrio", tipo: ["ground"], habitat: "jungla", nivel: 26, vida: 35, ataque: 100, defensa: 50, velocidad: 120, evolucion: null, imagen: art(51), sprite: spr(51) },
  { id: 251, nombre: "Celebi", tipo: ["grass", "psychic"], habitat: "jungla", nivel: 45, vida: 100, ataque: 100, defensa: 100, velocidad: 100, evolucion: null, imagen: art(251), sprite: spr(251) },

  // ---------------------------------------------------------
  // VOLCAN DE FUEGO (habitat: volcan)
  // ---------------------------------------------------------
  { id: 4, nombre: "Charmander", tipo: ["fire"], habitat: "volcan", nivel: 5, vida: 39, ataque: 52, defensa: 43, velocidad: 65, evolucion: { id: 5, nivel: 16 }, imagen: art(4), sprite: spr(4) },
  { id: 5, nombre: "Charmeleon", tipo: ["fire"], habitat: "volcan", nivel: 16, vida: 58, ataque: 64, defensa: 58, velocidad: 80, evolucion: { id: 6, nivel: 36 }, imagen: art(5), sprite: spr(5) },
  { id: 6, nombre: "Charizard", tipo: ["fire", "flying"], habitat: "volcan", nivel: 36, vida: 78, ataque: 84, defensa: 78, velocidad: 100, evolucion: null, imagen: art(6), sprite: spr(6) },
  { id: 37, nombre: "Vulpix", tipo: ["fire"], habitat: "volcan", nivel: 6, vida: 38, ataque: 41, defensa: 40, velocidad: 65, evolucion: { id: 38, nivel: 30 }, imagen: art(37), sprite: spr(37) },
  { id: 38, nombre: "Ninetales", tipo: ["fire"], habitat: "volcan", nivel: 30, vida: 73, ataque: 76, defensa: 75, velocidad: 100, evolucion: null, imagen: art(38), sprite: spr(38) },
  { id: 58, nombre: "Growlithe", tipo: ["fire"], habitat: "volcan", nivel: 7, vida: 55, ataque: 70, defensa: 45, velocidad: 60, evolucion: { id: 59, nivel: 32 }, imagen: art(58), sprite: spr(58) },
  { id: 59, nombre: "Arcanine", tipo: ["fire"], habitat: "volcan", nivel: 32, vida: 90, ataque: 110, defensa: 80, velocidad: 95, evolucion: null, imagen: art(59), sprite: spr(59) },
  { id: 240, nombre: "Magby", tipo: ["fire"], habitat: "volcan", nivel: 8, vida: 45, ataque: 75, defensa: 37, velocidad: 83, evolucion: { id: 126, nivel: 30 }, imagen: art(240), sprite: spr(240) },
  { id: 126, nombre: "Magmar", tipo: ["fire"], habitat: "volcan", nivel: 30, vida: 65, ataque: 95, defensa: 57, velocidad: 93, evolucion: { id: 467, nivel: 45 }, imagen: art(126), sprite: spr(126) },
  { id: 467, nombre: "Magmortar", tipo: ["fire"], habitat: "volcan", nivel: 45, vida: 75, ataque: 95, defensa: 67, velocidad: 83, evolucion: null, imagen: art(467), sprite: spr(467) },
  { id: 136, nombre: "Flareon", tipo: ["fire"], habitat: "volcan", nivel: 25, vida: 65, ataque: 130, defensa: 60, velocidad: 65, evolucion: null, imagen: art(136), sprite: spr(136) },
  { id: 77, nombre: "Ponyta", tipo: ["fire"], habitat: "volcan", nivel: 8, vida: 50, ataque: 85, defensa: 55, velocidad: 90, evolucion: { id: 78, nivel: 40 }, imagen: art(77), sprite: spr(77) },
  { id: 78, nombre: "Rapidash", tipo: ["fire"], habitat: "volcan", nivel: 40, vida: 65, ataque: 100, defensa: 70, velocidad: 105, evolucion: null, imagen: art(78), sprite: spr(78) },
  { id: 218, nombre: "Slugma", tipo: ["fire"], habitat: "volcan", nivel: 5, vida: 40, ataque: 40, defensa: 40, velocidad: 20, evolucion: { id: 219, nivel: 38 }, imagen: art(218), sprite: spr(218) },
  { id: 219, nombre: "Magcargo", tipo: ["fire", "rock"], habitat: "volcan", nivel: 38, vida: 60, ataque: 50, defensa: 120, velocidad: 30, evolucion: null, imagen: art(219), sprite: spr(219) },
  { id: 155, nombre: "Cyndaquil", tipo: ["fire"], habitat: "volcan", nivel: 5, vida: 39, ataque: 52, defensa: 43, velocidad: 65, evolucion: { id: 156, nivel: 14 }, imagen: art(155), sprite: spr(155) },
  { id: 156, nombre: "Quilava", tipo: ["fire"], habitat: "volcan", nivel: 14, vida: 58, ataque: 64, defensa: 58, velocidad: 80, evolucion: { id: 157, nivel: 36 }, imagen: art(156), sprite: spr(156) },
  { id: 157, nombre: "Typhlosion", tipo: ["fire"], habitat: "volcan", nivel: 36, vida: 78, ataque: 84, defensa: 78, velocidad: 100, evolucion: null, imagen: art(157), sprite: spr(157) },
  { id: 74, nombre: "Geodude", tipo: ["rock", "ground"], habitat: "volcan", nivel: 6, vida: 40, ataque: 80, defensa: 100, velocidad: 20, evolucion: { id: 75, nivel: 25 }, imagen: art(74), sprite: spr(74) },
  { id: 75, nombre: "Graveler", tipo: ["rock", "ground"], habitat: "volcan", nivel: 25, vida: 55, ataque: 95, defensa: 115, velocidad: 35, evolucion: { id: 76, nivel: 40 }, imagen: art(75), sprite: spr(75) },
  { id: 76, nombre: "Golem", tipo: ["rock", "ground"], habitat: "volcan", nivel: 40, vida: 80, ataque: 120, defensa: 130, velocidad: 45, evolucion: null, imagen: art(76), sprite: spr(76) },
  { id: 228, nombre: "Houndour", tipo: ["dark", "fire"], habitat: "volcan", nivel: 7, vida: 45, ataque: 60, defensa: 30, velocidad: 65, evolucion: { id: 229, nivel: 24 }, imagen: art(228), sprite: spr(228) },
  { id: 229, nombre: "Houndoom", tipo: ["dark", "fire"], habitat: "volcan", nivel: 24, vida: 75, ataque: 90, defensa: 50, velocidad: 95, evolucion: null, imagen: art(229), sprite: spr(229) },
  { id: 324, nombre: "Torkoal", tipo: ["fire"], habitat: "volcan", nivel: 15, vida: 70, ataque: 85, defensa: 140, velocidad: 20, evolucion: null, imagen: art(324), sprite: spr(324) },
  { id: 146, nombre: "Moltres", tipo: ["fire", "flying"], habitat: "volcan", nivel: 45, vida: 90, ataque: 100, defensa: 90, velocidad: 90, evolucion: null, imagen: art(146), sprite: spr(146) },
];

/** Especies que el jugador puede elegir al empezar la aventura. */
export const INICIALES = [7, 158, 54, 1, 152, 25, 4, 155, 37];

export const porId = (id) => POKEMON.find((p) => p.id === id);
export const porHabitat = (habitat) => POKEMON.filter((p) => p.habitat === habitat);

/** Especie salvaje aleatoria del habitat, limitada al nivel del jugador. */
export function salvajeAleatorio(habitat, nivelJugador = 5) {
  const delHabitat = porHabitat(habitat);
  const candidatos = delHabitat.filter((p) => p.nivel <= nivelJugador + 6);
  const lista = candidatos.length ? candidatos : delHabitat;
  return lista[Math.floor(Math.random() * lista.length)];
}
