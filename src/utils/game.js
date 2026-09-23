// ============================================================
//  Motor del juego: estadisticas por nivel, combate por turnos,
//  experiencia, evolucion y captura.
//  Reutiliza obtenerMultiplicadorTipo() de utils/battle.js.
// ============================================================

import { obtenerMultiplicadorTipo } from "./battle.js";
import { porId, salvajeAleatorio, POKEMON } from "../data/pokemon.js";
import { movimientosDe, especialDe, ENERGIA_MAXIMA, COSTE_ESPECIAL } from "../data/moves.js";

export const NIVEL_MAXIMO = 100;
export const EQUIPO_MAXIMO = 6;

// ---------- Estadisticas escaladas por nivel ----------

export const statPorNivel = (base, nivel) => Math.floor((base * (1 + nivel / 50)) / 1.5) + 5;
export const vidaPorNivel = (base, nivel) => Math.floor(base * (1 + nivel / 45)) + nivel * 2 + 10;

/** Experiencia necesaria para pasar del nivel actual al siguiente. */
export const expNecesaria = (nivel) => 20 + nivel * 18;

/** Crea una instancia jugable a partir de una especie. */
export function crearInstancia(especieId, nivel) {
  const especie = porId(especieId);
  if (!especie) throw new Error(`Especie desconocida: ${especieId}`);

  const lvl = Math.max(1, Math.min(NIVEL_MAXIMO, Math.round(nivel ?? especie.nivel)));
  const hpMax = vidaPorNivel(especie.vida, lvl);

  return {
    uid: `${especieId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    id: especie.id,
    nombre: especie.nombre,
    tipo: especie.tipo,
    habitat: especie.habitat,
    imagen: especie.imagen,
    sprite: especie.sprite,
    evolucion: especie.evolucion,
    nivel: lvl,
    exp: 0,
    hpMax,
    hp: hpMax,
    ataque: statPorNivel(especie.ataque, lvl),
    defensa: statPorNivel(especie.defensa, lvl),
    velocidad: statPorNivel(especie.velocidad, lvl),
    energia: 1,
    movimientos: movimientosDe(especie),
    especial: especialDe(especie),
  };
}

/** Recalcula stats manteniendo la proporcion de vida actual. */
function reconstruir(instancia, especie, nivel) {
  const proporcion = instancia.hpMax > 0 ? instancia.hp / instancia.hpMax : 1;
  const hpMax = vidaPorNivel(especie.vida, nivel);
  return {
    ...instancia,
    id: especie.id,
    nombre: especie.nombre,
    tipo: especie.tipo,
    habitat: especie.habitat,
    imagen: especie.imagen,
    sprite: especie.sprite,
    evolucion: especie.evolucion,
    nivel,
    hpMax,
    hp: Math.max(1, Math.round(hpMax * proporcion)),
    ataque: statPorNivel(especie.ataque, nivel),
    defensa: statPorNivel(especie.defensa, nivel),
    velocidad: statPorNivel(especie.velocidad, nivel),
    movimientos: movimientosDe(especie),
    especial: especialDe(especie),
  };
}

/**
 * Suma experiencia y aplica todas las subidas de nivel que correspondan.
 * Devuelve { pokemon, niveles, evolucion } donde evolucion es
 * { desde, hacia } si al subir alcanzo el nivel de su evolucion.
 */
export function ganarExperiencia(instancia, cantidad) {
  let p = { ...instancia, exp: instancia.exp + Math.max(0, Math.round(cantidad)) };
  let niveles = 0;

  while (p.nivel < NIVEL_MAXIMO && p.exp >= expNecesaria(p.nivel)) {
    p = reconstruir({ ...p, exp: p.exp - expNecesaria(p.nivel) }, porId(p.id), p.nivel + 1);
    // Subir de nivel recupera un poco de vida.
    p.hp = Math.min(p.hpMax, p.hp + Math.round(p.hpMax * 0.2));
    niveles += 1;
  }
  if (p.nivel >= NIVEL_MAXIMO) p.exp = 0;

  const evolucion = evolucionPendiente(p);
  return { pokemon: p, niveles, evolucion };
}

/** { desde, hacia } si el Pokemon ya cumple el nivel de su evolucion. */
export function evolucionPendiente(instancia) {
  const evo = instancia.evolucion;
  if (!evo || instancia.nivel < evo.nivel) return null;
  const destino = porId(evo.id);
  if (!destino) return null;
  return { desde: porId(instancia.id), hacia: destino };
}

/** Aplica la evolucion conservando nivel, experiencia y proporcion de vida. */
export function evolucionar(instancia) {
  const pendiente = evolucionPendiente(instancia);
  if (!pendiente) return instancia;
  const evolucionado = reconstruir(instancia, pendiente.hacia, instancia.nivel);
  evolucionado.hp = evolucionado.hpMax; // la evolucion restaura la vida
  return evolucionado;
}

// ---------- Combate ----------

/** Daño de un movimiento. `defendiendo` duplica la defensa del objetivo. */
export function calcularGolpe(atacante, defensor, movimiento, opciones = {}) {
  const efectividad = obtenerMultiplicadorTipo(movimiento.tipo, defensor.tipo);
  const stab = atacante.tipo.includes(movimiento.tipo) ? 1.5 : 1;

  if (efectividad === 0) return { danio: 0, efectividad, critico: false, stab };

  const defensa = Math.max(1, opciones.defendiendo ? defensor.defensa * 2 : defensor.defensa);
  const critico = Math.random() < 0.08;
  const variacion = 0.85 + Math.random() * 0.15;

  const bruto =
    ((2 * atacante.nivel) / 5 + 2) * movimiento.poder * (atacante.ataque / defensa) / 50 + 2;
  const danio = Math.floor(bruto * stab * efectividad * variacion * (critico ? 1.5 : 1));

  return { danio: Math.max(1, danio), efectividad, critico, stab };
}

/** Quien ataca primero; a igual velocidad decide el azar. */
export function primeroEnAtacar(uno, dos) {
  if (uno.velocidad !== dos.velocidad) return uno.velocidad > dos.velocidad ? "uno" : "dos";
  return Math.random() < 0.5 ? "uno" : "dos";
}

/** IA rival: remata con la especial si puede, si no usa el mejor ataque. */
export function elegirAccionIA(rival, objetivo) {
  const vidaBaja = objetivo.hp / objetivo.hpMax < 0.45;
  if (rival.energia >= COSTE_ESPECIAL && (vidaBaja || Math.random() < 0.25)) {
    return { tipo: "especial", movimiento: rival.especial };
  }
  if (rival.hp / rival.hpMax < 0.2 && Math.random() < 0.3) {
    return { tipo: "defender" };
  }
  const puntuado = rival.movimientos.map((m) => ({
    m,
    valor: m.poder * obtenerMultiplicadorTipo(m.tipo, objetivo.tipo) *
      (rival.tipo.includes(m.tipo) ? 1.5 : 1),
  }));
  puntuado.sort((a, b) => b.valor - a.valor);
  const mejor = Math.random() < 0.75 ? puntuado[0] : puntuado[Math.floor(Math.random() * puntuado.length)];
  return { tipo: "atacar", movimiento: mejor.m };
}

export const recargarEnergia = (p) => ({ ...p, energia: Math.min(ENERGIA_MAXIMA, p.energia + 1) });

// ---------- Recompensas ----------

export const expPorVictoria = (enemigo) => Math.floor(enemigo.nivel * 14 + 30);
export const monedasPorVictoria = (enemigo) => Math.floor(enemigo.nivel * 6 + 15);

/** Probabilidad de captura: baja si el rival esta sano o es de nivel alto. */
export function probabilidadCaptura(enemigo, nivelJugador) {
  const restante = enemigo.hp / enemigo.hpMax;
  const base = 0.78 - restante * 0.48;
  const ajuste = Math.max(-0.22, Math.min(0.15, (nivelJugador - enemigo.nivel) * 0.02));
  return Math.max(0.05, Math.min(0.95, base + ajuste));
}

// ---------- Generadores ----------

/** Pokemon salvaje del habitat, de nivel cercano al del jugador. */
export function generarSalvaje(habitat, nivelJugador) {
  const especie = salvajeAleatorio(habitat, nivelJugador);
  const nivel = Math.max(2, Math.min(NIVEL_MAXIMO, nivelJugador + Math.floor(Math.random() * 5) - 2));
  return crearInstancia(especie.id, Math.max(especie.nivel - 3, nivel));
}

/**
 * Los 3 rivales de la Arena: uno de cada region, ajustados al jugador.
 * El orden se baraja a proposito. Si fuera siempre agua -> planta -> fuego,
 * un inicial de fuego se toparia de salida con quien lo contrarresta.
 */
export function generarEquipoArena(nivelJugador) {
  const desfase = [-1, 0, 1];
  const habitats = ["agua", "jungla", "volcan"];
  for (let i = habitats.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [habitats[i], habitats[j]] = [habitats[j], habitats[i]];
  }

  return habitats.map((habitat, i) => {
    const candidatos = POKEMON.filter(
      (p) => p.habitat === habitat && p.nivel <= nivelJugador + 4
    );
    const lista = candidatos.length ? candidatos : POKEMON.filter((p) => p.habitat === habitat);
    const especie = lista[Math.floor(Math.random() * lista.length)];
    return crearInstancia(especie.id, Math.max(3, nivelJugador + desfase[i]));
  });
}

// ---------- Objetos ----------

export const OBJETOS = {
  pokeball: { nombre: "Poké Ball", icono: "🔴", desc: "Sirve para capturar Pokémon salvajes." },
  pocion: { nombre: "Poción", icono: "🧪", desc: "Restaura 50 PS.", cura: 50 },
  superpocion: { nombre: "Superpoción", icono: "⚗️", desc: "Restaura 130 PS.", cura: 130 },
  revivir: { nombre: "Revivir", icono: "💠", desc: "Revive con la mitad de los PS." },
  caramelo: { nombre: "Caramelo Raro", icono: "🍬", desc: "Sube un nivel al instante." },
};

/** Contenido aleatorio de un cofre. */
export function abrirCofre() {
  const tablas = [
    { objeto: "pokeball", cantidad: 3 },
    { objeto: "pocion", cantidad: 2 },
    { objeto: "superpocion", cantidad: 1 },
    { objeto: "revivir", cantidad: 1 },
    { objeto: "caramelo", cantidad: 1 },
  ];
  const premio = tablas[Math.floor(Math.random() * tablas.length)];
  return {
    ...premio,
    monedas: 20 + Math.floor(Math.random() * 60),
    exp: 15 + Math.floor(Math.random() * 25),
  };
}

export const vivo = (p) => p.hp > 0;
export const equipoDerrotado = (equipo) => equipo.every((p) => p.hp <= 0);
