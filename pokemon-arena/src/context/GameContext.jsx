// ============================================================
//  Estado global de POKEMON WORLD ADVENTURE.
//  Un solo Context con la partida entera + guardado automatico
//  en localStorage (no hay backend).
// ============================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { crearInstancia, evolucionar, evolucionPendiente, EQUIPO_MAXIMO, OBJETOS } from "../utils/game";
import { mapaPorId } from "../data/maps";

const CLAVE_GUARDADO = "pokemon-world-adventure";

const PARTIDA_NUEVA = {
  pantalla: "home",
  entrenador: null,
  equipo: [],
  activo: 0,
  mapa: "agua",
  monedas: 0,
  inventario: { pokeball: 5, pocion: 3, superpocion: 1, revivir: 1, caramelo: 0 },
  cofresAbiertos: [],
  vistos: [],
  capturados: [],
  batalla: null,
  evolucionando: null,
};

export const ENTRENADORES = [
  { id: "rojo", nombre: "Ash", icono: "🧢", color: "#ef4444" },
  { id: "azul", nombre: "Gary", icono: "🕶️", color: "#3b82f6" },
  { id: "verde", nombre: "Misty", icono: "👒", color: "#22c55e" },
  { id: "morado", nombre: "Brock", icono: "🎒", color: "#a855f7" },
];

function cargarPartida() {
  try {
    const crudo = localStorage.getItem(CLAVE_GUARDADO);
    if (!crudo) return PARTIDA_NUEVA;
    const guardada = JSON.parse(crudo);
    if (!guardada?.entrenador || !Array.isArray(guardada.equipo) || !guardada.equipo.length) {
      return PARTIDA_NUEVA;
    }
    // Nunca reanudamos dentro de un combate ni de una evolucion a medias.
    return { ...PARTIDA_NUEVA, ...guardada, pantalla: "mundo", batalla: null, evolucionando: null };
  } catch {
    return PARTIDA_NUEVA;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [estado, setEstado] = useState(cargarPartida);
  const [aviso, setAviso] = useState(null);

  // Guardado automatico de la partida.
  useEffect(() => {
    if (!estado.entrenador) return;
    try {
      const { batalla: _b, evolucionando: _e, ...persistible } = estado;
      localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(persistible));
    } catch {
      // Si el navegador bloquea el almacenamiento se sigue jugando sin guardar.
    }
  }, [estado]);

  const mostrarAviso = useCallback((texto, icono = "✨") => {
    setAviso({ texto, icono, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  const acciones = useMemo(() => {
    const parche = (fn) => setEstado((prev) => ({ ...prev, ...fn(prev) }));

    return {
      iniciarPartida(entrenador, especieId) {
        const inicial = crearInstancia(especieId, 5);
        setEstado({
          ...PARTIDA_NUEVA,
          pantalla: "mundo",
          entrenador,
          equipo: [inicial],
          vistos: [especieId],
          capturados: [especieId],
        });
      },

      irA: (pantalla) => parche(() => ({ pantalla })),

      cambiarMapa: (mapa) =>
        parche(() => ({ mapa, pantalla: "mundo" })),

      seleccionarActivo: (indice) =>
        parche((p) => (p.equipo[indice]?.hp > 0 ? { activo: indice } : {})),

      /** Sustituye un Pokemon del equipo por su version actualizada. */
      actualizarPokemon: (uid, nuevo) =>
        parche((p) => ({ equipo: p.equipo.map((x) => (x.uid === uid ? nuevo : x)) })),

      reemplazarEquipo: (equipo) => parche(() => ({ equipo })),

      registrarVisto: (id) =>
        parche((p) => (p.vistos.includes(id) ? {} : { vistos: [...p.vistos, id] })),

      capturar(instancia) {
        let resultado = "equipo";
        parche((p) => {
          if (p.equipo.length >= EQUIPO_MAXIMO) {
            resultado = "lleno";
            return {
              capturados: p.capturados.includes(instancia.id) ? p.capturados : [...p.capturados, instancia.id],
            };
          }
          return {
            equipo: [...p.equipo, instancia],
            capturados: p.capturados.includes(instancia.id) ? p.capturados : [...p.capturados, instancia.id],
          };
        });
        return resultado;
      },

      sumarMonedas: (cantidad) => parche((p) => ({ monedas: p.monedas + cantidad })),

      sumarObjeto: (clave, cantidad) =>
        parche((p) => ({
          inventario: { ...p.inventario, [clave]: (p.inventario[clave] || 0) + cantidad },
        })),

      gastarObjeto: (clave) =>
        parche((p) => ({
          inventario: { ...p.inventario, [clave]: Math.max(0, (p.inventario[clave] || 0) - 1) },
        })),

      /** Usa una pocion, un revivir o un caramelo sobre un Pokemon del equipo. */
      usarObjeto(clave, uid) {
        let mensaje = null;
        parche((p) => {
          if ((p.inventario[clave] || 0) <= 0) return {};
          const objetivo = p.equipo.find((x) => x.uid === uid);
          if (!objetivo) return {};

          let nuevo = objetivo;
          if (clave === "pocion" || clave === "superpocion") {
            if (objetivo.hp <= 0) { mensaje = `${objetivo.nombre} está debilitado, usa un Revivir.`; return {}; }
            if (objetivo.hp >= objetivo.hpMax) { mensaje = `${objetivo.nombre} ya tiene los PS al máximo.`; return {}; }
            nuevo = { ...objetivo, hp: Math.min(objetivo.hpMax, objetivo.hp + OBJETOS[clave].cura) };
            mensaje = `${objetivo.nombre} recuperó PS.`;
          } else if (clave === "revivir") {
            if (objetivo.hp > 0) { mensaje = `${objetivo.nombre} no está debilitado.`; return {}; }
            nuevo = { ...objetivo, hp: Math.ceil(objetivo.hpMax / 2) };
            mensaje = `${objetivo.nombre} volvió al combate.`;
          } else if (clave === "caramelo") {
            const conNivel = crearInstancia(objetivo.id, objetivo.nivel + 1);
            nuevo = { ...objetivo, ...conNivel, uid: objetivo.uid, exp: 0, hp: conNivel.hpMax };
            mensaje = `${objetivo.nombre} subió al nivel ${nuevo.nivel}.`;
          } else {
            return {};
          }

          const pendiente = evolucionPendiente(nuevo);
          return {
            equipo: p.equipo.map((x) => (x.uid === uid ? nuevo : x)),
            inventario: { ...p.inventario, [clave]: p.inventario[clave] - 1 },
            evolucionando: pendiente ? { uid, ...pendiente } : p.evolucionando,
          };
        });
        if (mensaje) mostrarAviso(mensaje, OBJETOS[clave]?.icono);
      },

      marcarCofre: (id) =>
        parche((p) => ({ cofresAbiertos: [...p.cofresAbiertos, id] })),

      iniciarBatalla: (batalla) =>
        parche(() => ({ batalla, pantalla: batalla.tipo === "arena" ? "arena" : "combate" })),

      cerrarBatalla: () => parche(() => ({ batalla: null, pantalla: "mundo" })),

      pedirEvolucion: (uid, pendiente) =>
        parche(() => ({ evolucionando: { uid, ...pendiente } })),

      /** Confirma la evolucion en curso y la aplica al equipo. */
      completarEvolucion: () =>
        parche((p) => {
          if (!p.evolucionando) return {};
          return {
            equipo: p.equipo.map((x) => (x.uid === p.evolucionando.uid ? evolucionar(x) : x)),
            capturados: p.capturados.includes(p.evolucionando.hacia.id)
              ? p.capturados
              : [...p.capturados, p.evolucionando.hacia.id],
            evolucionando: null,
          };
        }),

      curarEquipo: () =>
        parche((p) => ({ equipo: p.equipo.map((x) => ({ ...x, hp: x.hpMax, energia: 1 })) })),

      reiniciarPartida() {
        try { localStorage.removeItem(CLAVE_GUARDADO); } catch { /* sin guardado */ }
        setEstado(PARTIDA_NUEVA);
      },
    };
  }, [mostrarAviso]);

  const valor = useMemo(() => {
    const equipo = estado.equipo;
    const indiceActivo = equipo[estado.activo]?.hp > 0
      ? estado.activo
      : Math.max(0, equipo.findIndex((p) => p.hp > 0));

    return {
      ...estado,
      ...acciones,
      aviso,
      mostrarAviso,
      activo: indiceActivo,
      pokemonActivo: equipo[indiceActivo] || equipo[0] || null,
      mapaActual: mapaPorId(estado.mapa),
      equipoAgotado: equipo.length > 0 && equipo.every((p) => p.hp <= 0),
    };
  }, [estado, acciones, aviso, mostrarAviso]);

  return <GameContext.Provider value={valor}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame debe usarse dentro de <GameProvider>");
  return ctx;
}
