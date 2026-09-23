import { TYPE_RELATIONS } from "../constants.js";

export function obtenerMultiplicadorTipo(tipoAtaque, tiposDefensor) {
  let multiplicador = 1;
  for (const tipoDefensor of tiposDefensor) {
    const relacion = TYPE_RELATIONS[tipoAtaque];
    if (!relacion) continue;
    if (relacion.immune.includes(tipoDefensor)) multiplicador *= 0;
    else if (relacion.strong.includes(tipoDefensor)) multiplicador *= 2;
    else if (relacion.weak.includes(tipoDefensor)) multiplicador *= 0.5;
  }
  return multiplicador;
}

export function calcularEfectividadDefensiva(tipos) {
  const fuertes = [];
  const debiles = [];
  const inmunidades = [];
  for (const tipoAtaque of Object.keys(TYPE_RELATIONS)) {
    const m = obtenerMultiplicadorTipo(tipoAtaque, tipos);
    if (m === 0) inmunidades.push(tipoAtaque);
    else if (m > 1) debiles.push(tipoAtaque);
    else if (m < 1) fuertes.push(tipoAtaque);
  }
  return { fuertes, debiles, inmunidades };
}

export function determinarOrden(uno, dos) {
  if (uno.velocidad > dos.velocidad) return [uno, dos];
  if (dos.velocidad > uno.velocidad) return [dos, uno];
  return Math.random() < 0.5 ? [uno, dos] : [dos, uno];
}

export function elegirMovimiento(atacante, rival) {
  if (!atacante.movimientos.length) {
    return { nombre: "Ataque basico", tipo: "normal", poder: 40, precision: 100, categoria: "physical" };
  }
  const conVentaja = atacante.movimientos.filter(
    (m) => obtenerMultiplicadorTipo(m.tipo, rival.tipos) > 1
  );
  const disponibles = conVentaja.length ? conVentaja : atacante.movimientos;
  return disponibles[Math.floor(Math.random() * disponibles.length)];
}

export function calcularDanio(atacante, defensor, movimiento) {
  const nivel = 50;
  const esFisico = movimiento.categoria === "physical";
  let ataque = esFisico ? atacante.ataque : atacante.ataqueEspecial;
  const defensa = esFisico ? defensor.defensa : defensor.defensaEspecial;
  let potencia = movimiento.poder;
  const ab = atacante.habilidad.nombre;
  const abd = defensor.habilidad.nombre;

  if ((ab === "huge-power" || ab === "pure-power") && esFisico) ataque *= 2;
  if (ab === "technician" && potencia <= 60) potencia *= 1.5;

  const stab = atacante.tipos.includes(movimiento.tipo)
    ? ab === "adaptability" ? 2 : 1.5
    : 1;

  let ef = obtenerMultiplicadorTipo(movimiento.tipo, defensor.tipos);
  if (abd === "levitate" && movimiento.tipo === "ground") ef = 0;
  if (abd === "water-absorb" && movimiento.tipo === "water") ef = 0;
  if (abd === "volt-absorb" && movimiento.tipo === "electric") ef = 0;
  if (abd === "flash-fire" && movimiento.tipo === "fire") ef = 0;
  if (abd === "thick-fat" && (movimiento.tipo === "fire" || movimiento.tipo === "ice")) ef *= 0.5;
  if (["filter", "solid-rock", "prism-armor"].includes(abd) && ef > 1) ef *= 0.75;
  if (abd === "multiscale" && defensor.hpActual === defensor.hpMax) ef *= 0.5;

  const bajoHP = atacante.hpActual <= atacante.hpMax / 3;
  if (ab === "blaze" && movimiento.tipo === "fire" && bajoHP) potencia *= 1.5;
  if (ab === "torrent" && movimiento.tipo === "water" && bajoHP) potencia *= 1.5;
  if (ab === "overgrow" && movimiento.tipo === "grass" && bajoHP) potencia *= 1.5;
  if (ab === "swarm" && movimiento.tipo === "bug" && bajoHP) potencia *= 1.5;

  if (ef === 0) return { danio: 0, efectividad: ef, critico: false, stab };

  const variacion = 0.85 + Math.random() * 0.15;
  const critico = Math.random() < 0.0625;
  let danio = Math.floor(
    (((2 * nivel / 5 + 2) * potencia * ataque / Math.max(1, defensa)) / 50 + 2)
    * stab * ef * variacion * (critico ? 1.5 : 1)
  );
  danio = Math.max(1, danio);

  if (abd === "sturdy" && defensor.hpActual === defensor.hpMax && danio >= defensor.hpActual) {
    danio = defensor.hpActual - 1;
  }

  return { danio, efectividad: ef, critico, stab };
}

export function aplicarEfectosEntrada(atacante, defensor) {
  const logs = [];
  if (defensor.habilidad.nombre === "intimidate") {
    atacante.ataque = Math.max(1, Math.floor(atacante.ataque * 0.67));
    logs.push(
      `😈 ${cap(defensor.nombre)} activó Intimidación. El Ataque de ${cap(atacante.nombre)} disminuyó.`
    );
  }
  return logs;
}

export function cap(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
