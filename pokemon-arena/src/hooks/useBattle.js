import { useState } from "react";
import { prepararPokemon } from "../services/pokeApi";
import { normalizarBusqueda } from "../services/pokeApi";
import {
  calcularDanio,
  elegirMovimiento,
  determinarOrden,
  aplicarEfectosEntrada,
  cap,
  esperar,
} from "../utils/battle";
import { API_URL } from "../constants";

const cache = new Map();
async function fetchCached(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

export function useBattle() {
  const [pokemonOne, setPokemonOne] = useState(null);
  const [pokemonTwo, setPokemonTwo] = useState(null);
  const [cargandoOne, setCargandoOne] = useState(false);
  const [cargandoTwo, setCargandoTwo] = useState(false);
  const [errorSelector, setErrorSelector] = useState("");
  const [activo, setActivo] = useState(false);
  const [logs, setLogs] = useState([]);
  const [ganador, setGanador] = useState(null);
  const [turnoMsg, setTurnoMsg] = useState("Selecciona dos Pokémon para comenzar.");
  const [hpOne, setHpOne] = useState({ actual: 0, max: 0 });
  const [hpTwo, setHpTwo] = useState({ actual: 0, max: 0 });

  function agregarLog(msg) {
    setLogs((prev) => [...prev, msg]);
  }

  async function seleccionarLuchador(numero, query) {
    const validacion = normalizarBusqueda(query);
    if (validacion.error) { setErrorSelector(validacion.error); return; }
    setErrorSelector("");
    if (numero === 1) setCargandoOne(true); else setCargandoTwo(true);

    try {
      const pokemon = await fetchCached(`${API_URL}${encodeURIComponent(validacion.value)}`);
      const datos = await prepararPokemon(pokemon);
      if (numero === 1) { setPokemonOne(datos); setHpOne({ actual: datos.hpMax, max: datos.hpMax }); }
      else { setPokemonTwo(datos); setHpTwo({ actual: datos.hpMax, max: datos.hpMax }); }
      setTurnoMsg(`${cap(datos.nombre)} está listo para combatir.`);
    } catch {
      setErrorSelector(`No encontramos "${query.trim()}".`);
      if (numero === 1) setPokemonOne(null); else setPokemonTwo(null);
    } finally {
      if (numero === 1) setCargandoOne(false); else setCargandoTwo(false);
    }
  }

  async function comenzarBatalla() {
    if (!pokemonOne || !pokemonTwo || activo) return;

    const p1 = { ...pokemonOne, hpActual: pokemonOne.hpMax, ataque: pokemonOne.ataque };
    const p2 = { ...pokemonTwo, hpActual: pokemonTwo.hpMax, ataque: pokemonTwo.ataque };

    setActivo(true);
    setGanador(null);
    setLogs([]);
    setHpOne({ actual: p1.hpMax, max: p1.hpMax });
    setHpTwo({ actual: p2.hpMax, max: p2.hpMax });

    const logsBatch = [`⚔️ Comienza la batalla entre ${cap(p1.nombre)} y ${cap(p2.nombre)}.`];
    aplicarEfectosEntrada(p1, p2).forEach((l) => logsBatch.push(l));
    aplicarEfectosEntrada(p2, p1).forEach((l) => logsBatch.push(l));
    setLogs(logsBatch);

    const [primero, segundo] = determinarOrden(p1, p2);
    setTurnoMsg(`💨 ${cap(primero.nombre)} ataca primero.`);
    await esperar(900);

    let atacante = primero;
    let defensor = segundo;

    for (let turno = 0; turno < 50; turno++) {
      const movimiento = elegirMovimiento(atacante, defensor);
      setTurnoMsg(`⚔️ ${cap(atacante.nombre)} usa ${cap(movimiento.nombre)}...`);
      await esperar(500);

      const newLog = [`⚡ ${cap(atacante.nombre)} usó ${cap(movimiento.nombre)}.`];
      await esperar(450);

      const resultado = calcularDanio(atacante, defensor, movimiento);

      if (resultado.efectividad === 0) {
        newLog.push(`🚫 No afecta a ${cap(defensor.nombre)}.`);
      } else {
        defensor.hpActual = Math.max(0, defensor.hpActual - resultado.danio);
        newLog.push(`💥 ${cap(defensor.nombre)} recibió ${resultado.danio} de daño.`);
        if (resultado.critico) newLog.push("🎯 ¡Golpe crítico!");
        if (resultado.stab > 1) newLog.push("🔥 STAB activado.");
        if (resultado.efectividad > 1) newLog.push("✨ ¡Es súper efectivo!");
        else if (resultado.efectividad < 1) newLog.push("🛡️ No es muy efectivo...");

        if (defensor === p1) setHpOne({ actual: Math.max(0, p1.hpActual), max: p1.hpMax });
        else setHpTwo({ actual: Math.max(0, p2.hpActual), max: p2.hpMax });

        if (defensor.hpActual <= 0) {
          newLog.push(`💀 ${cap(defensor.nombre)} fue derrotado.`);
          setLogs((prev) => [...prev, ...newLog]);
          break;
        }
      }

      setLogs((prev) => [...prev, ...newLog]);
      [atacante, defensor] = [defensor, atacante];
      await esperar(700);
    }

    const ganadorFinal =
      p1.hpActual > 0 && p2.hpActual <= 0 ? p1
      : p2.hpActual > 0 && p1.hpActual <= 0 ? p2
      : p1.hpActual >= p2.hpActual ? p1 : p2;

    setTurnoMsg("🏁 Batalla terminada.");
    setGanador(ganadorFinal);
    setLogs((prev) => [...prev, `🏆 ${cap(ganadorFinal.nombre)} ganó la batalla.`]);
    setActivo(false);
  }

  function reiniciarBatalla() {
    setPokemonOne(null); setPokemonTwo(null);
    setLogs([]); setGanador(null); setActivo(false);
    setTurnoMsg("Selecciona dos Pokémon para comenzar.");
    setHpOne({ actual: 0, max: 0 }); setHpTwo({ actual: 0, max: 0 });
    setErrorSelector("");
  }

  return {
    pokemonOne, pokemonTwo, cargandoOne, cargandoTwo, errorSelector,
    activo, logs, ganador, turnoMsg, hpOne, hpTwo,
    seleccionarLuchador, comenzarBatalla, reiniciarBatalla,
  };
}
