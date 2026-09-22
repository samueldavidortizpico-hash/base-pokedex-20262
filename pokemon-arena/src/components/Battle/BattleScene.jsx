// ============================================================
//  Combate por turnos.
//  El estado del combate vive en refs mutables (como en un motor
//  de juego) y se repinta a mano: asi la secuencia asincrona de
//  un turno no trabaja nunca con datos caducados.
// ============================================================

import { useEffect, useReducer, useRef, useState } from "react";
import { esperar } from "../../utils/battle";
import {
  calcularGolpe, elegirAccionIA, expPorVictoria, ganarExperiencia,
  monedasPorVictoria, primeroEnAtacar, probabilidadCaptura,
} from "../../utils/game";
import { COSTE_ESPECIAL, ENERGIA_MAXIMA } from "../../data/moves";
import { BarraExp, BarraVida } from "../PokemonCard/TeamCard";
import TypeBadge from "../TypeBadge";

const PAUSA = { corta: 420, media: 700, larga: 1000 };

function textoEfectividad(ef) {
  if (ef === 0) return "🚫 No le afecta en absoluto...";
  if (ef >= 2) return "✨ ¡Es súper efectivo!";
  if (ef > 1) return "✨ Es bastante efectivo.";
  if (ef < 1) return "🛡️ No es muy efectivo...";
  return null;
}

function Combatiente({ pokemon, lado, animacion }) {
  const clases = [
    "combatiente",
    `combatiente--${lado}`,
    animacion === "ataca" ? "combatiente--ataca" : "",
    animacion === "recibe" ? "combatiente--recibe" : "",
    pokemon.hp <= 0 ? "combatiente--ko" : "",
  ].join(" ");

  return (
    <div className={clases}>
      <div className="combatiente-ficha">
        <div className="combatiente-ficha-linea">
          <strong>{pokemon.nombre}</strong>
          <span className="combatiente-nivel">Nv. {pokemon.nivel}</span>
        </div>
        <div className="combatiente-tipos">
          {pokemon.tipo.map((t) => <TypeBadge key={t} tipo={t} small />)}
        </div>
        <BarraVida hp={pokemon.hp} hpMax={pokemon.hpMax} />
        {lado === "aliado" && <BarraExp exp={pokemon.exp} nivel={pokemon.nivel} />}
        <div className="combatiente-energia" aria-label={`Energía especial ${pokemon.energia} de ${ENERGIA_MAXIMA}`}>
          {Array.from({ length: ENERGIA_MAXIMA }, (_, i) => (
            <span key={i} className={`energia-punto${i < pokemon.energia ? " energia-punto--lleno" : ""}`} />
          ))}
        </div>
      </div>
      <div className="combatiente-plataforma" aria-hidden="true" />
      <img className="combatiente-sprite" src={pokemon.imagen} alt={pokemon.nombre} />
    </div>
  );
}

export default function BattleScene({ tipo, equipo, enemigos, pokeballs, onFinalizar }) {
  // --- estado mutable del combate ---
  const aliados = useRef(equipo.map((p) => ({ ...p, defendiendo: false })));
  const rivales = useRef(enemigos.map((p) => ({ ...p, defendiendo: false })));
  const iAliado = useRef(Math.max(0, equipo.findIndex((p) => p.hp > 0)));
  const iRival = useRef(0);
  const botiquin = useRef({ exp: 0, monedas: 0, subidas: [], capturado: null, bolas: pokeballs });
  const [, repintar] = useReducer((n) => n + 1, 0);

  // --- estado de presentacion ---
  const [fase, setFase] = useState("intro");
  const [submenu, setSubmenu] = useState(null);
  const [registro, setRegistro] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [animacion, setAnimacion] = useState({ aliado: null, enemigo: null });
  const [destello, setDestello] = useState(null);
  const finRegistro = useRef(null);

  const aliado = aliados.current[iAliado.current];
  const rival = rivales.current[iRival.current];

  const log = (linea) => setRegistro((prev) => [...prev, linea]);

  useEffect(() => {
    finRegistro.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [registro]);

  // Presentacion inicial del combate. El ref la lanza una sola vez por
  // montaje: en desarrollo StrictMode ejecuta el efecto dos veces y sin
  // este guard la secuencia se duplicaria.
  const introLanzada = useRef(false);
  useEffect(() => {
    if (introLanzada.current) return;
    introLanzada.current = true;
    (async () => {
      const intro = tipo === "arena"
        ? `🏟️ La Arena ruge: ${rivales.current.length} rivales te esperan.`
        : `🌿 ¡Un ${rivales.current[0].nombre} salvaje apareció!`;
      setMensaje(intro);
      log(intro);
      await esperar(PAUSA.larga);
      const salida = `¡Adelante, ${aliados.current[iAliado.current].nombre}!`;
      setMensaje(salida);
      log(salida);
      await esperar(PAUSA.media);
      setFase("menu");
      setMensaje("¿Qué vas a hacer?");
    })();
    // Solo al montar: un combate no cambia de rivales a mitad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- Resolucion de un golpe ----------------

  async function ejecutarAccion(atacante, defensor, accion, lado) {
    const contrario = lado === "aliado" ? "enemigo" : "aliado";

    if (accion.tipo === "defender") {
      atacante.energia = Math.min(ENERGIA_MAXIMA, atacante.energia + 1);
      const linea = `🛡️ ${atacante.nombre} se cubre y recupera energía.`;
      setMensaje(linea); log(linea); repintar();
      await esperar(PAUSA.media);
      return;
    }

    const movimiento = accion.movimiento;
    if (accion.tipo === "especial") atacante.energia -= COSTE_ESPECIAL;

    const linea = accion.tipo === "especial"
      ? `💫 ¡${atacante.nombre} libera ${movimiento.nombre}!`
      : `⚡ ${atacante.nombre} usó ${movimiento.nombre}.`;
    setMensaje(linea); log(linea);

    setAnimacion((a) => ({ ...a, [lado]: "ataca" }));
    if (accion.tipo === "especial") setDestello(movimiento.tipo);
    await esperar(PAUSA.corta);

    const golpe = calcularGolpe(atacante, defensor, movimiento, { defendiendo: defensor.defendiendo });
    setAnimacion({ [lado]: null, [contrario]: golpe.danio > 0 ? "recibe" : null });

    if (golpe.efectividad === 0) {
      log(textoEfectividad(0));
      setMensaje(textoEfectividad(0));
    } else {
      defensor.hp = Math.max(0, defensor.hp - golpe.danio);
      repintar();
      const detalles = [`💥 ${defensor.nombre} recibe ${golpe.danio} de daño.`];
      if (golpe.critico) detalles.push("🎯 ¡Golpe crítico!");
      if (defensor.defendiendo) detalles.push("🛡️ La defensa amortiguó el golpe.");
      const ef = textoEfectividad(golpe.efectividad);
      if (ef) detalles.push(ef);
      detalles.forEach(log);
      setMensaje(detalles[0]);
    }

    await esperar(PAUSA.media);
    setAnimacion({ aliado: null, enemigo: null });
    setDestello(null);
  }

  // ---------------- Bajas ----------------

  /**
   * Devuelve true si el combate ha terminado.
   * Lee siempre de los refs: durante un turno los indices pueden haber
   * cambiado (por ejemplo tras un cambio de Pokemon).
   */
  async function tratarBajas() {
    if (rivales.current[iRival.current].hp <= 0) {
      const caido = rivales.current[iRival.current];
      log(`💀 ${caido.nombre} fue derrotado.`);
      setMensaje(`💀 ${caido.nombre} fue derrotado.`);
      await esperar(PAUSA.media);

      const exp = expPorVictoria(caido);
      const monedas = monedasPorVictoria(caido);
      botiquin.current.exp += exp;
      botiquin.current.monedas += monedas;

      const ganador = aliados.current[iAliado.current];
      const resultado = ganarExperiencia(ganador, exp);
      aliados.current[iAliado.current] = { ...resultado.pokemon, defendiendo: false };
      repintar();
      log(`⭐ ${ganador.nombre} ganó ${exp} puntos de experiencia y ${monedas} monedas.`);
      await esperar(PAUSA.corta);

      for (let i = 0; i < resultado.niveles; i++) {
        const nivel = resultado.pokemon.nivel - resultado.niveles + i + 1;
        const subida = `🎉 ¡${resultado.pokemon.nombre} subió al nivel ${nivel}!`;
        setMensaje(subida); log(subida);
        setDestello("nivel");
        await esperar(PAUSA.larga);
        setDestello(null);
      }

      const siguiente = iRival.current + 1;
      if (siguiente >= rivales.current.length) {
        terminar("victoria");
        return true;
      }
      iRival.current = siguiente;
      repintar();
      const entra = `El rival envía a ${rivales.current[siguiente].nombre}.`;
      setMensaje(entra); log(entra);
      await esperar(PAUSA.larga);
      return false;
    }

    const caido = aliados.current[iAliado.current];
    if (caido.hp <= 0) {
      log(`💤 ${caido.nombre} ya no puede seguir.`);
      setMensaje(`💤 ${caido.nombre} ya no puede seguir.`);
      await esperar(PAUSA.media);

      const relevo = aliados.current.findIndex((p) => p.hp > 0);
      if (relevo === -1) {
        terminar("derrota");
        return true;
      }
      iAliado.current = relevo;
      repintar();
      const entra = `¡Adelante, ${aliados.current[relevo].nombre}!`;
      setMensaje(entra); log(entra);
      await esperar(PAUSA.media);
      return false;
    }

    return false;
  }

  function terminar(resultado) {
    setFase(resultado);
    setMensaje(
      resultado === "victoria" ? "🏆 ¡Has ganado el combate!"
      : resultado === "derrota" ? "😵 Tu equipo ha sido derrotado."
      : resultado === "captura" ? "🎯 ¡Captura conseguida!"
      : "💨 Has escapado del combate."
    );
  }

  // ---------------- Turno completo ----------------

  async function jugarTurno(accionJugador) {
    setFase("resolviendo");
    setSubmenu(null);

    const yo = aliados.current[iAliado.current];
    const el = rivales.current[iRival.current];

    // Un cambio de Pokemon consume el turno: el rival ataca gratis.
    if (accionJugador.tipo === "cambiar") {
      iAliado.current = accionJugador.indice;
      repintar();
      const linea = `🔄 ¡Vuelve, ${yo.nombre}! ¡Adelante, ${aliados.current[accionJugador.indice].nombre}!`;
      setMensaje(linea); log(linea);
      await esperar(PAUSA.media);

      const respuesta = elegirAccionIA(el, aliados.current[iAliado.current]);
      await ejecutarAccion(el, aliados.current[iAliado.current], respuesta, "enemigo");
      if (await tratarBajas()) return;
      return cerrarTurno();
    }

    const accionRival = elegirAccionIA(el, yo);
    yo.defendiendo = accionJugador.tipo === "defender";
    el.defendiendo = accionRival.tipo === "defender";

    const jugadorPrimero = primeroEnAtacar(yo, el) === "uno";
    const orden = jugadorPrimero
      ? [[yo, el, accionJugador, "aliado"], [el, yo, accionRival, "enemigo"]]
      : [[el, yo, accionRival, "enemigo"], [yo, el, accionJugador, "aliado"]];

    for (const [atacante, defensor, accion, lado] of orden) {
      if (atacante.hp <= 0 || defensor.hp <= 0) continue;
      await ejecutarAccion(atacante, defensor, accion, lado);
      if (defensor.hp <= 0) break;
    }

    if (await tratarBajas()) return;
    cerrarTurno();
  }

  function cerrarTurno() {
    const yo = aliados.current[iAliado.current];
    const el = rivales.current[iRival.current];
    yo.defendiendo = false;
    el.defendiendo = false;
    yo.energia = Math.min(ENERGIA_MAXIMA, yo.energia + 1);
    el.energia = Math.min(ENERGIA_MAXIMA, el.energia + 1);
    repintar();
    setFase("menu");
    setMensaje("¿Qué vas a hacer?");
  }

  // ---------------- Capturar y huir (solo salvajes) ----------------

  async function intentarCaptura() {
    if (botiquin.current.bolas <= 0) {
      setMensaje("No te quedan Poké Balls.");
      return;
    }
    setFase("resolviendo");
    setSubmenu(null);
    botiquin.current.bolas -= 1;

    const objetivo = rivales.current[iRival.current];
    const linea = `🔴 Lanzas una Poké Ball a ${objetivo.nombre}...`;
    setMensaje(linea); log(linea);
    setDestello("captura");
    await esperar(PAUSA.larga);
    setDestello(null);

    if (Math.random() < probabilidadCaptura(objetivo, aliados.current[iAliado.current].nivel)) {
      botiquin.current.capturado = { ...objetivo, defendiendo: undefined };
      log(`🎯 ¡${objetivo.nombre} fue capturado!`);
      terminar("captura");
      return;
    }

    log(`💥 ¡Oh no! ${objetivo.nombre} se ha escapado de la Ball.`);
    setMensaje(`💥 ¡${objetivo.nombre} se escapó de la Ball!`);
    await esperar(PAUSA.media);

    const respuesta = elegirAccionIA(objetivo, aliados.current[iAliado.current]);
    await ejecutarAccion(objetivo, aliados.current[iAliado.current], respuesta, "enemigo");
    if (await tratarBajas()) return;
    cerrarTurno();
  }

  async function intentarHuida() {
    setFase("resolviendo");
    setSubmenu(null);
    const yo = aliados.current[iAliado.current];
    const el = rivales.current[iRival.current];
    const probabilidad = Math.min(0.9, 0.45 + (yo.velocidad - el.velocidad) * 0.02);

    setMensaje("💨 Intentas escapar...");
    await esperar(PAUSA.media);

    if (Math.random() < probabilidad) {
      log("💨 Lograste escapar sin problemas.");
      terminar("huida");
      return;
    }

    log("🚫 No pudiste escapar.");
    setMensaje("🚫 ¡No pudiste escapar!");
    await esperar(PAUSA.corta);
    const respuesta = elegirAccionIA(el, yo);
    await ejecutarAccion(el, yo, respuesta, "enemigo");
    if (await tratarBajas()) return;
    cerrarTurno();
  }

  // ---------------- Salida ----------------

  function salir() {
    onFinalizar({
      resultado: fase,
      equipo: aliados.current.map(({ defendiendo: _d, ...p }) => p),
      monedas: botiquin.current.monedas,
      exp: botiquin.current.exp,
      capturado: botiquin.current.capturado,
      bolasUsadas: pokeballs - botiquin.current.bolas,
    });
  }

  const terminado = ["victoria", "derrota", "captura", "huida"].includes(fase);
  const esSalvaje = tipo === "salvaje";
  const suplentes = aliados.current
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => i !== iAliado.current && p.hp > 0);

  return (
    <div className="combate">
      {destello && (
        <div className={`destello destello--${destello}`} aria-hidden="true">
          <span /><span /><span /><span /><span /><span />
        </div>
      )}

      <div className="combate-campo">
        <Combatiente pokemon={rival} lado="enemigo" animacion={animacion.enemigo} />
        <div className="combate-vs" aria-hidden="true">VS</div>
        <Combatiente pokemon={aliado} lado="aliado" animacion={animacion.aliado} />

        {tipo === "arena" && (
          <ol className="combate-rivales" aria-label="Rivales restantes">
            {rivales.current.map((r, i) => (
              <li
                key={r.uid}
                className={`rival-punto${i === iRival.current ? " rival-punto--actual" : ""}${r.hp <= 0 ? " rival-punto--ko" : ""}`}
              >
                <img src={r.sprite} alt={r.nombre} />
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="combate-panel">
        <p className="combate-mensaje" aria-live="polite">{mensaje}</p>

        <div className="combate-columnas">
          <div className="combate-acciones">
            {fase === "menu" && !submenu && (
              <>
                <button className="accion accion--atacar" onClick={() => setSubmenu("ataques")}>
                  <span aria-hidden="true">⚔️</span> Atacar
                </button>
                <button className="accion accion--defender" onClick={() => jugarTurno({ tipo: "defender" })}>
                  <span aria-hidden="true">🛡️</span> Defender
                </button>
                <button
                  className="accion accion--especial"
                  disabled={aliado.energia < COSTE_ESPECIAL}
                  onClick={() => jugarTurno({ tipo: "especial", movimiento: aliado.especial })}
                  title={`${aliado.especial.nombre} · cuesta ${COSTE_ESPECIAL} de energía`}
                >
                  <span aria-hidden="true">💫</span> Habilidad especial
                  <em>{aliado.energia}/{ENERGIA_MAXIMA}</em>
                </button>
                <button
                  className="accion accion--cambiar"
                  disabled={suplentes.length === 0}
                  onClick={() => setSubmenu("cambiar")}
                >
                  <span aria-hidden="true">🔄</span> Cambiar Pokémon
                </button>
                {esSalvaje && (
                  <>
                    <button className="accion accion--capturar" disabled={botiquin.current.bolas <= 0} onClick={intentarCaptura}>
                      <span aria-hidden="true">🔴</span> Capturar
                      <em>×{botiquin.current.bolas}</em>
                    </button>
                    <button className="accion accion--huir" onClick={intentarHuida}>
                      <span aria-hidden="true">💨</span> Huir
                    </button>
                  </>
                )}
              </>
            )}

            {fase === "menu" && submenu === "ataques" && (
              <>
                {aliado.movimientos.map((m) => (
                  <button
                    key={m.nombre}
                    className="accion accion--movimiento"
                    onClick={() => jugarTurno({ tipo: "atacar", movimiento: m })}
                  >
                    <span>{m.nombre}</span>
                    <TypeBadge tipo={m.tipo} small />
                    <em>Poder {m.poder}</em>
                  </button>
                ))}
                <button className="accion accion--volver" onClick={() => setSubmenu(null)}>← Volver</button>
              </>
            )}

            {fase === "menu" && submenu === "cambiar" && (
              <>
                {suplentes.map(({ p, i }) => (
                  <button
                    key={p.uid}
                    className="accion accion--suplente"
                    onClick={() => jugarTurno({ tipo: "cambiar", indice: i })}
                  >
                    <img src={p.sprite} alt="" aria-hidden="true" />
                    <span>{p.nombre}</span>
                    <em>Nv. {p.nivel} · {Math.ceil(p.hp)}/{p.hpMax} PS</em>
                  </button>
                ))}
                <button className="accion accion--volver" onClick={() => setSubmenu(null)}>← Volver</button>
              </>
            )}

            {fase === "resolviendo" && <p className="combate-esperando">Resolviendo el turno...</p>}

            {terminado && (
              <div className="combate-resumen">
                <h3>
                  {fase === "victoria" && "🏆 ¡Victoria!"}
                  {fase === "derrota" && "😵 Derrota"}
                  {fase === "captura" && "🎯 ¡Capturado!"}
                  {fase === "huida" && "💨 Escapaste"}
                </h3>
                <ul>
                  <li>Experiencia ganada: <strong>{botiquin.current.exp}</strong></li>
                  <li>Monedas: <strong>{botiquin.current.monedas}</strong></li>
                  {botiquin.current.capturado && (
                    <li>Nuevo compañero: <strong>{botiquin.current.capturado.nombre}</strong></li>
                  )}
                </ul>
                <button className="boton boton-primario" onClick={salir}>Continuar</button>
              </div>
            )}
          </div>

          <ol className="combate-registro" aria-label="Registro del combate">
            {registro.map((linea, i) => <li key={i}>{linea}</li>)}
            <li ref={finRegistro} aria-hidden="true" />
          </ol>
        </div>
      </div>
    </div>
  );
}
