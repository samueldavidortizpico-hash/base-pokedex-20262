// ============================================================
//  Comprobacion rapida del motor y de los datos del juego.
//  Ejecutar con:  npm run check
//  No necesita ninguna libreria de tests.
// ============================================================

import assert from "node:assert/strict";
import { POKEMON, porId, porHabitat, INICIALES } from "../data/pokemon.js";
import { movimientosDe, especialDe } from "../data/moves.js";
import { MAPAS, ANCHO, TILE, casilla, bloquea, spawnDe, cofresDe, transitablesDe } from "../data/maps.js";
import { HITBOX_JUGADOR, cabe, choque, deslizar, posicionSegura } from "../systems/collision.js";
import {
  crearInstancia, ganarExperiencia, evolucionar, evolucionPendiente,
  calcularGolpe, probabilidadCaptura, generarEquipoArena, generarSalvaje,
  expNecesaria,
} from "./game.js";

let pasos = 0;
const ok = (nombre) => { pasos++; console.log(`  ok  ${nombre}`); };

// ---------- Datos de Pokemon ----------
assert.ok(POKEMON.length >= 50, `se piden 50 Pokemon minimo, hay ${POKEMON.length}`);
for (const h of ["agua", "jungla", "volcan"]) {
  assert.ok(porHabitat(h).length >= 10, `pocos Pokemon en el habitat ${h}`);
}
const ids = POKEMON.map((p) => p.id);
assert.equal(new Set(ids).size, ids.length, "hay ids duplicados");
for (const p of POKEMON) {
  assert.ok(p.nombre && p.tipo.length > 0 && p.imagen, `especie incompleta: ${p.id}`);
  if (p.evolucion) {
    assert.ok(porId(p.evolucion.id), `${p.nombre} evoluciona a un id inexistente`);
    assert.ok(p.evolucion.nivel > 0, `${p.nombre} tiene nivel de evolucion invalido`);
  }
}
for (const id of INICIALES) assert.ok(porId(id), `inicial inexistente: ${id}`);
ok(`${POKEMON.length} especies validas repartidas en 3 habitats`);

// ---------- Movimientos ----------
for (const p of POKEMON) {
  const movs = movimientosDe(p);
  assert.equal(movs.length, 3, `${p.nombre} no tiene 3 movimientos`);
  for (const m of movs) assert.ok(m.tipo && m.poder > 0, `movimiento invalido en ${p.nombre}`);
  assert.ok(especialDe(p).poder > movs[0].poder, `la especial de ${p.nombre} deberia pegar mas`);
}
ok("cada especie aprende 3 ataques y una habilidad especial");

// ---------- Mapas: forma, spawn y cofres alcanzables ----------
for (const mapa of MAPAS) {
  mapa.tiles.forEach((fila, y) => {
    assert.equal(fila.length, ANCHO, `${mapa.id}: la fila ${y} mide ${fila.length}, no ${ANCHO}`);
  });
  const spawns = mapa.tiles.join("").split("@").length - 1;
  assert.equal(spawns, 1, `${mapa.id}: debe haber exactamente un "@", hay ${spawns}`);

  // Inundacion desde el spawn para comprobar que el mapa no se parte en dos.
  const inicio = spawnDe(mapa);
  const sx = Math.floor(inicio.x / TILE);
  const sy = Math.floor(inicio.y / TILE);
  assert.ok(!bloquea(casilla(mapa, sx, sy)), `${mapa.id}: el jugador aparece dentro de un muro`);
  assert.ok(cabe(mapa, inicio.x, inicio.y, HITBOX_JUGADOR), `${mapa.id}: el hitbox del jugador no cabe en el spawn`);

  const visitado = new Set([`${sx},${sy}`]);
  const cola = [[sx, sy]];
  while (cola.length) {
    const [x, y] = cola.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const clave = `${nx},${ny}`;
      if (visitado.has(clave) || bloquea(casilla(mapa, nx, ny))) continue;
      visitado.add(clave);
      cola.push([nx, ny]);
    }
  }

  const cofres = cofresDe(mapa);
  assert.ok(cofres.length >= 2, `${mapa.id}: deberia tener al menos 2 cofres`);
  for (const cofre of cofres) {
    assert.ok(visitado.has(`${cofre.x},${cofre.y}`), `${mapa.id}: cofre inalcanzable en ${cofre.x},${cofre.y}`);
  }
  const zonasAltas = mapa.tiles.join("").split("h").length - 1;
  assert.ok(zonasAltas >= 10, `${mapa.id}: faltan zonas de encuentro`);
}
ok("los 3 mapas son rectangulares, conexos y con todos los cofres alcanzables");

// ---------- CollisionSystem: nadie entra en lava ni en roca ----------
for (const mapa of MAPAS) {
  let avisos = 0;
  let pasos = 0;
  // Desde el centro de cada casilla pisable se empuja en las 8 direcciones.
  for (const { x: tx, y: ty } of transitablesDe(mapa)) {
    const x0 = tx * TILE + TILE / 2;
    const y0 = ty * TILE + TILE / 2;
    if (!cabe(mapa, x0, y0, HITBOX_JUGADOR)) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const paso = deslizar(mapa, x0, y0, dx * 40, dy * 40, HITBOX_JUGADOR);
      const dentro = choque(mapa, paso.x, paso.y, HITBOX_JUGADOR);
      assert.equal(dentro, null, `${mapa.id}: el jugador acabo dentro de "${dentro}" saliendo de ${tx},${ty}`);
      if (paso.bloqueo === "~") avisos++;
      pasos++;
    }
  }
  assert.ok(pasos > 100, `${mapa.id}: apenas hay casillas pisables (${pasos})`);
  assert.ok(avisos > 0, `${mapa.id}: nunca se detecto el borde de una zona peligrosa`);

  // Desatascar: desde dentro de un muro siempre se sale a terreno pisable.
  const salvado = posicionSegura(mapa, TILE / 2, TILE / 2, HITBOX_JUGADOR);
  assert.ok(cabe(mapa, salvado.x, salvado.y, HITBOX_JUGADOR), `${mapa.id}: posicionSegura devolvio un muro`);
}
ok("el jugador resbala por las paredes y nunca termina dentro de lava o roca");

// ---------- Estadisticas y subida de nivel ----------
const squirtle = crearInstancia(7, 5);
assert.ok(squirtle.hp === squirtle.hpMax && squirtle.hp > 0, "nace con la vida llena");
assert.ok(squirtle.ataque > 0 && squirtle.defensa > 0 && squirtle.velocidad > 0, "stats positivos");
const fuerte = crearInstancia(7, 40);
assert.ok(fuerte.hpMax > squirtle.hpMax && fuerte.ataque > squirtle.ataque, "el nivel mejora los stats");
ok("las estadisticas escalan con el nivel");

// Un golpe de experiencia enorme no debe saltarse niveles ni romper el bucle.
const subido = ganarExperiencia(crearInstancia(7, 5), expNecesaria(5) + expNecesaria(6) + 1);
assert.equal(subido.niveles, 2, `deberia subir 2 niveles, subio ${subido.niveles}`);
assert.equal(subido.pokemon.nivel, 7);
assert.ok(subido.pokemon.exp < expNecesaria(7), "la experiencia sobrante se guarda, no se acumula sin gastar");
ok("la experiencia acumulada aplica todas las subidas de nivel");

// ---------- Evolucion ----------
const alBorde = ganarExperiencia(crearInstancia(7, 15), expNecesaria(15));
assert.equal(alBorde.pokemon.nivel, 16);
assert.ok(alBorde.evolucion, "Squirtle nivel 16 deberia poder evolucionar");
assert.equal(alBorde.evolucion.hacia.nombre, "Wartortle");
const evolucionado = evolucionar(alBorde.pokemon);
assert.equal(evolucionado.nombre, "Wartortle");
assert.equal(evolucionado.nivel, 16, "la evolucion conserva el nivel");
assert.ok(evolucionado.hpMax > alBorde.pokemon.hpMax, "la evolucion sube la vida maxima");
assert.equal(evolucionPendiente(evolucionado), null, "Wartortle nivel 16 aun no evoluciona");
assert.equal(evolucionar(crearInstancia(9, 50)).nombre, "Blastoise", "Blastoise ya no evoluciona");
ok("la evolucion cambia de especie conservando nivel y subiendo stats");

// ---------- Combate y tipos ----------
const charmander = crearInstancia(4, 20);
const bulbasaur = crearInstancia(1, 20);
const squirtle20 = crearInstancia(7, 20);
const fuego = movimientosDe(porId(4))[1];
assert.equal(calcularGolpe(charmander, bulbasaur, fuego).efectividad, 2, "Fuego > Planta");
assert.equal(calcularGolpe(charmander, squirtle20, fuego).efectividad, 0.5, "Fuego < Agua");
const agua = movimientosDe(porId(7))[1];
assert.equal(calcularGolpe(squirtle20, charmander, agua).efectividad, 2, "Agua > Fuego");
const planta = movimientosDe(porId(1))[1];
assert.equal(calcularGolpe(bulbasaur, squirtle20, planta).efectividad, 2, "Planta > Agua");

const rayo = { nombre: "Rayo", poder: 90, categoria: "special", tipo: "electric" };
const diglett = crearInstancia(50, 20);
assert.equal(calcularGolpe(crearInstancia(25, 20), diglett, rayo).danio, 0, "Tierra es inmune a Electrico");

// Defender debe reducir el golpe de forma consistente aunque haya azar.
let normal = 0;
let defendido = 0;
for (let i = 0; i < 400; i++) {
  normal += calcularGolpe(charmander, bulbasaur, fuego).danio;
  defendido += calcularGolpe(charmander, bulbasaur, fuego, { defendiendo: true }).danio;
}
assert.ok(defendido < normal * 0.75, `defender deberia mitigar (${defendido} vs ${normal})`);
ok("ventajas de tipo, inmunidades y defensa funcionan");

// ---------- Captura ----------
const sano = crearInstancia(129, 10);
const herido = { ...sano, hp: 1 };
assert.ok(probabilidadCaptura(herido, 10) > probabilidadCaptura(sano, 10), "cuesta menos capturar heridos");
for (const p of [sano, herido]) {
  const prob = probabilidadCaptura(p, 60);
  assert.ok(prob > 0 && prob <= 0.95, `probabilidad fuera de rango: ${prob}`);
}
ok("la captura depende de la vida restante y del nivel");

// ---------- Generadores ----------
for (let i = 0; i < 200; i++) {
  const salvaje = generarSalvaje(["agua", "jungla", "volcan"][i % 3], 1 + (i % 50));
  assert.ok(salvaje.nivel >= 1 && salvaje.hp > 0, "salvaje invalido");
  assert.equal(salvaje.habitat, ["agua", "jungla", "volcan"][i % 3], "salvaje de otro habitat");
}
const ordenes = new Set();
for (let i = 0; i < 60; i++) {
  const arena = generarEquipoArena(12);
  assert.equal(arena.length, 3, "la arena enfrenta a 3 rivales");
  assert.deepEqual(
    [...arena.map((p) => p.habitat)].sort(),
    ["agua", "jungla", "volcan"],
    "la arena debe presentar un rival de cada region"
  );
  ordenes.add(arena.map((p) => p.habitat).join(">"));
}
// Si el orden fuera fijo, un inicial de fuego se toparia siempre con el de agua.
assert.ok(ordenes.size > 1, "el orden de los rivales de la arena deberia variar");
ok("los rivales salvajes respetan su habitat y la arena presenta 3 enemigos en orden variable");

console.log(`\nTodo correcto: ${pasos} comprobaciones.\n`);
