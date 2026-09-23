// ============================================================
//  Mundo explorable: camara que sigue al jugador, encuentros
//  con Pokemon salvajes, cofres y eventos aleatorios.
//
//  Aqui solo se cablean los sistemas:
//    PlayerController    -> hooks/usePlayerController
//    CompanionController -> hooks/useCompanion (dentro de <Player/>)
//    CollisionSystem     -> systems/collision
//    InteractionSystem   -> systems/interactions
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import { usePlayerController } from "../hooks/usePlayerController";
import { ANCHO, ALTO, TILE, cofresDe, transitablesDe } from "../data/maps";
import { objetivoCercano, objetivosDe } from "../systems/interactions";
import { porHabitat } from "../data/pokemon";
import { abrirCofre, crearInstancia, generarSalvaje, generarEquipoArena, OBJETOS, probabilidadCaptura, EQUIPO_MAXIMO } from "../utils/game";
import MapCanvas from "../components/Map/MapCanvas";
import Player from "../components/Player/Player";
import EncounterDialog from "../components/Battle/EncounterDialog";

const PROB_EVENTO = 0.18;
const AMBIENTE = 7;

/** Coloca Pokemon de ambiente del habitat en casillas transitables. */
function poblarAmbiente(mapa) {
  const especies = porHabitat(mapa.habitat);
  const libres = transitablesDe(mapa);

  return Array.from({ length: AMBIENTE }, (_, i) => {
    const sitio = libres[Math.floor(Math.random() * libres.length)];
    const especie = especies[Math.floor(Math.random() * especies.length)];
    return {
      key: `${mapa.id}-${i}`,
      especie: especie.id,
      nombre: especie.nombre,
      sprite: especie.sprite,
      x: sitio.x,
      y: sitio.y,
      retardo: i * 0.6,
    };
  });
}

export default function World() {
  const juego = useGame();
  const mapa = juego.mapaActual;

  const [encuentro, setEncuentro] = useState(null);
  const [evento, setEvento] = useState(null);
  const [vista, setVista] = useState({ ancho: 960, alto: 540 });
  // Pokemon de ambiente ya saludados, atados al mapa donde se saludaron.
  const [saludados, setSaludados] = useState({ mapa: mapa.id, ids: [] });
  const marco = useRef(null);
  // Objetivo al alcance: en un ref para que alInteractuar lea siempre el actual.
  const cercaRef = useRef(null);

  const cofres = useMemo(() => cofresDe(mapa), [mapa]);
  const ambiente = useMemo(() => poblarAmbiente(mapa), [mapa]);

  const pendientes = useMemo(
    () => cofres.filter((c) => !juego.cofresAbiertos.includes(c.id)),
    [cofres, juego.cofresAbiertos]
  );
  const yaSaludados = saludados.mapa === mapa.id ? saludados.ids : [];
  const salvajes = useMemo(
    () => ambiente.filter((s) => !yaSaludados.includes(s.key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ambiente, yaSaludados.length]
  );
  const objetivos = useMemo(
    () => objetivosDe({ cofres: pendientes, salvajes }),
    [pendientes, salvajes]
  );

  const pausado = Boolean(encuentro || evento || juego.evolucionando);
  const nivelJugador = juego.pokemonActivo?.nivel ?? 5;

  // ---------- Encuentros ----------
  const alEncuentro = useCallback(() => {
    if (juego.equipoAgotado) {
      juego.mostrarAviso("Tu equipo está agotado. Ve al Centro Pokémon.", "🏥");
      return;
    }

    if (Math.random() < PROB_EVENTO) {
      const sorteo = Math.random();
      if (sorteo < 0.4) {
        const monedas = 25 + Math.floor(Math.random() * 60);
        juego.sumarMonedas(monedas);
        setEvento({ icono: "🪙", titulo: "¡Hallazgo!", texto: `Encontraste ${monedas} monedas entre la maleza.` });
      } else if (sorteo < 0.75) {
        const claves = ["pokeball", "pocion", "superpocion", "revivir"];
        const clave = claves[Math.floor(Math.random() * claves.length)];
        juego.sumarObjeto(clave, 1);
        setEvento({ icono: OBJETOS[clave].icono, titulo: "¡Objeto encontrado!", texto: `Has recogido 1 ${OBJETOS[clave].nombre}.` });
      } else {
        setEvento({
          icono: "🧑‍🎤",
          titulo: "¡Un entrenador te reta!",
          texto: "Te corta el paso y saca sus Pokémon. No puedes escapar.",
          accion: "reto",
        });
      }
      return;
    }

    const salvaje = generarSalvaje(mapa.habitat, nivelJugador);
    juego.registrarVisto(salvaje.id);
    setEncuentro(salvaje);
  }, [juego, mapa.habitat, nivelJugador]);

  // ---------- Tecla E: cofre o Pokemon salvaje al alcance ----------
  const alInteractuar = useCallback(() => {
    const objetivo = cercaRef.current;
    if (!objetivo) return;

    if (objetivo.tipo === "pokemon") {
      if (juego.equipoAgotado) {
        juego.mostrarAviso("Tu equipo está agotado. Ve al Centro Pokémon.", "🏥");
        return;
      }
      const nivel = Math.max(2, nivelJugador + Math.floor(Math.random() * 3) - 1);
      const salvaje = crearInstancia(objetivo.especie, nivel);
      setSaludados((prev) => ({ mapa: mapa.id, ids: prev.mapa === mapa.id ? [...prev.ids, objetivo.id] : [objetivo.id] }));
      juego.registrarVisto(salvaje.id);
      setEncuentro(salvaje);
      return;
    }

    if (juego.cofresAbiertos.includes(objetivo.id)) return;
    const premio = abrirCofre();
    juego.marcarCofre(objetivo.id);
    juego.sumarObjeto(premio.objeto, premio.cantidad);
    juego.sumarMonedas(premio.monedas);
    setEvento({
      icono: "🎁",
      titulo: "¡Cofre abierto!",
      texto: `${premio.cantidad}× ${OBJETOS[premio.objeto].nombre} y ${premio.monedas} monedas.`,
    });
  }, [juego, nivelJugador, mapa.id]);

  const { pos, cuerpo, enZonaAlta, peligro } = usePlayerController({
    mapa,
    pausado,
    alEncuentro,
    alInteractuar,
  });

  // ---------- Que tiene al alcance de la mano ----------
  // Se deriva en el render: ni estado extra ni un repintado de mas por paso.
  const cerca = useMemo(
    () => objetivoCercano(pos.x, pos.y, objetivos),
    [pos.x, pos.y, objetivos]
  );
  cercaRef.current = cerca;

  // ---------- Camara ----------
  useEffect(() => {
    const medir = () => {
      if (!marco.current) return;
      setVista({ ancho: marco.current.clientWidth, alto: marco.current.clientHeight });
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  const mundoAncho = ANCHO * TILE;
  const mundoAlto = ALTO * TILE;
  const camX = mundoAncho <= vista.ancho
    ? (vista.ancho - mundoAncho) / 2
    : -Math.max(0, Math.min(pos.x - vista.ancho / 2, mundoAncho - vista.ancho));
  const camY = mundoAlto <= vista.alto
    ? (vista.alto - mundoAlto) / 2
    : -Math.max(0, Math.min(pos.y - vista.alto / 2, mundoAlto - vista.alto));

  // ---------- Acciones del encuentro ----------
  function capturaRapida() {
    if (juego.inventario.pokeball <= 0) return;
    juego.gastarObjeto("pokeball");
    const exito = Math.random() < probabilidadCaptura(encuentro, nivelJugador);
    const objetivo = encuentro;
    setEncuentro(null);

    if (!exito) {
      setEvento({ icono: "💥", titulo: "¡Se escapó!", texto: `${objetivo.nombre} rompió la Poké Ball y huyó.` });
      return;
    }
    const destino = juego.capturar(objetivo);
    setEvento({
      icono: "🎯",
      titulo: "¡Capturado!",
      texto: destino === "lleno"
        ? `${objetivo.nombre} queda registrado, pero tu equipo ya tiene ${EQUIPO_MAXIMO} Pokémon.`
        : `${objetivo.nombre} se une a tu equipo.`,
    });
  }

  function pelear() {
    const salvaje = encuentro;
    setEncuentro(null);
    juego.iniciarBatalla({ tipo: "salvaje", enemigos: [salvaje] });
  }

  function cerrarEvento() {
    const pendiente = evento;
    setEvento(null);
    if (pendiente?.accion === "reto") {
      juego.iniciarBatalla({ tipo: "arena", enemigos: generarEquipoArena(nivelJugador).slice(0, 2) });
    }
  }

  return (
    <div className={`mundo ${mapa.tema}`}>
      <div className="mundo-marco" ref={marco}>
        <div
          className="mundo-escenario"
          style={{
            width: mundoAncho,
            height: mundoAlto,
            transform: `translate3d(${camX}px, ${camY}px, 0)`,
          }}
        >
          <MapCanvas
            mapa={mapa}
            cofres={cofres}
            cofresAbiertos={juego.cofresAbiertos}
            salvajes={salvajes}
            cercaId={cerca?.id}
          >
            <Player pos={pos} cuerpo={cuerpo} mapa={mapa} companero={juego.pokemonActivo} />
          </MapCanvas>
        </div>

        <div className="mundo-vineta" aria-hidden="true" />

        <div className="mundo-cartel">
          <span className="mundo-cartel-emoji" aria-hidden="true">{mapa.emoji}</span>
          <div>
            <strong>{mapa.nombre}</strong>
            <span>{enZonaAlta ? `${mapa.zonaAlta} · pueden aparecer Pokémon` : mapa.lema}</span>
          </div>
        </div>

        <p className="mundo-controles">
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> para moverte
          · <kbd>E</kbd> para interactuar
        </p>

        {peligro && <div className="mundo-pista mundo-pista--peligro">⚠️ Zona peligrosa</div>}

        {cerca && !peligro && (
          <div className="mundo-pista mundo-pista--accion">
            <kbd>E</kbd> Interactuar
            <span>{cerca.tipo === "cofre" ? "🎁" : "✨"} {cerca.etiqueta}</span>
          </div>
        )}

        {!cerca && !peligro && enZonaAlta && (
          <div className="mundo-pista mundo-pista--hierba">👀 {mapa.zonaAlta}: algo se mueve...</div>
        )}
      </div>

      {encuentro && (
        <EncounterDialog
          salvaje={encuentro}
          pokeballs={juego.inventario.pokeball}
          nivelJugador={nivelJugador}
          onCapturar={capturaRapida}
          onPelear={pelear}
          onEscapar={() => setEncuentro(null)}
        />
      )}

      {evento && (
        <div className="dialogo-fondo" role="dialog" aria-modal="true" aria-label={evento.titulo}>
          <section className="dialogo dialogo--evento">
            <span className="evento-icono" aria-hidden="true">{evento.icono}</span>
            <h2>{evento.titulo}</h2>
            <p>{evento.texto}</p>
            <button className="boton boton-primario" onClick={cerrarEvento} autoFocus>
              {evento.accion === "reto" ? "¡Acepto el reto!" : "Continuar"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
