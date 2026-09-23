export const API_URL = "https://pokeapi.co/api/v2/pokemon/";
export const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

export const TYPE_COLORS = {
  normal: "#9099A1",
  fire: "#FF9C54",
  water: "#4D90D5",
  electric: "#F3D23B",
  grass: "#63BB5B",
  ice: "#74CEC0",
  fighting: "#CE4069",
  poison: "#AB6AC8",
  ground: "#D97746",
  flying: "#8FA8DD",
  psychic: "#F97176",
  bug: "#90C12C",
  rock: "#C7B78B",
  ghost: "#5269AC",
  dragon: "#0A6DC4",
  dark: "#5A5366",
  steel: "#5A8EA1",
  fairy: "#EC8FE6",
};

export const TYPE_NAMES = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  electric: "Eléctrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
};

export const STAT_NAMES = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "Atq. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidad",
};

export const TYPE_RELATIONS = {
  normal: { strong: [], weak: ["rock", "steel"], immune: ["ghost"] },
  fire: {
    strong: ["grass", "ice", "bug", "steel"],
    weak: ["fire", "water", "rock", "dragon"],
    immune: [],
  },
  water: {
    strong: ["fire", "ground", "rock"],
    weak: ["water", "grass", "dragon"],
    immune: [],
  },
  electric: {
    strong: ["water", "flying"],
    weak: ["electric", "grass", "dragon"],
    immune: ["ground"],
  },
  grass: {
    strong: ["water", "ground", "rock"],
    weak: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
    immune: [],
  },
  ice: {
    strong: ["grass", "ground", "flying", "dragon"],
    weak: ["fire", "water", "ice", "steel"],
    immune: [],
  },
  fighting: {
    strong: ["normal", "ice", "rock", "dark", "steel"],
    weak: ["poison", "flying", "psychic", "bug", "fairy"],
    immune: ["ghost"],
  },
  poison: {
    strong: ["grass", "fairy"],
    weak: ["poison", "ground", "rock", "ghost"],
    immune: ["steel"],
  },
  ground: {
    strong: ["fire", "electric", "poison", "rock", "steel"],
    weak: ["grass", "bug"],
    immune: ["flying"],
  },
  flying: {
    strong: ["grass", "fighting", "bug"],
    weak: ["electric", "rock", "steel"],
    immune: [],
  },
  psychic: {
    strong: ["fighting", "poison"],
    weak: ["psychic", "steel"],
    immune: ["dark"],
  },
  bug: {
    strong: ["grass", "psychic", "dark"],
    weak: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
    immune: [],
  },
  rock: {
    strong: ["fire", "ice", "flying", "bug"],
    weak: ["fighting", "ground", "steel"],
    immune: [],
  },
  ghost: { strong: ["psychic", "ghost"], weak: ["dark"], immune: ["normal"] },
  dragon: { strong: ["dragon"], weak: ["steel"], immune: ["fairy"] },
  dark: {
    strong: ["psychic", "ghost"],
    weak: ["fighting", "dark", "fairy"],
    immune: [],
  },
  steel: {
    strong: ["ice", "rock", "fairy"],
    weak: ["fire", "water", "electric", "fighting", "ground"],
    immune: ["poison"],
  },
  fairy: {
    strong: ["fighting", "dragon", "dark"],
    weak: ["fire", "poison", "steel"],
    immune: [],
  },
};

export const ABILITY_RULES = {
  intimidate: { label: "Intimidación", effect: "Reduce el Ataque físico rival al entrar." },
  "huge-power": { label: "Potencia", effect: "Duplica el Ataque físico." },
  "pure-power": { label: "Potencia Pura", effect: "Duplica el Ataque físico." },
  adaptability: { label: "Adaptable", effect: "Aumenta el bono STAB." },
  technician: { label: "Experto", effect: "Potencia movimientos de 60 o menos." },
  levitate: { label: "Levitación", effect: "Inmunidad a movimientos de tipo Tierra." },
  "water-absorb": { label: "Absorbe Agua", effect: "Los ataques de Agua no causan daño." },
  "volt-absorb": { label: "Absorbe Electricidad", effect: "Los ataques Eléctricos no causan daño." },
  "flash-fire": { label: "Absorbe Fuego", effect: "Los ataques de Fuego no causan daño." },
  "thick-fat": { label: "Sebo", effect: "Reduce el daño de Fuego y Hielo." },
  multiscale: { label: "Multiescama", effect: "Reduce el daño cuando los PS están completos." },
  filter: { label: "Filtro", effect: "Reduce el daño de ataques súper efectivos." },
  "solid-rock": { label: "Roca Sólida", effect: "Reduce el daño de ataques súper efectivos." },
  "prism-armor": { label: "Armadura Prisma", effect: "Reduce el daño de ataques súper efectivos." },
  sturdy: { label: "Robustez", effect: "Evita un KO de un solo golpe con PS completos." },
  blaze: { label: "Mar Llamas", effect: "Potencia movimientos de Fuego con pocos PS." },
  torrent: { label: "Torrente", effect: "Potencia movimientos de Agua con pocos PS." },
  overgrow: { label: "Espesura", effect: "Potencia movimientos de Planta con pocos PS." },
  swarm: { label: "Enjambre", effect: "Potencia movimientos de Bicho con pocos PS." },
};
