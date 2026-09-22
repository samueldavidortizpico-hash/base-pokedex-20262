// ============================================================
//  PlayerController
//  Teclado (WASD + flechas), aceleracion suave, colisiones contra la
//  capa de fisicas y encuentros en las zonas altas.
//  Un solo bucle de animacion y un solo estado: el componente vuelve a
//  pintarse como mucho una vez por fotograma, y ninguna mientras el
//  jugador esta quieto.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { esZonaAlta, spawnDe } from "../data/maps";
import { HITBOX_JUGADOR, casillaEn, deslizar, posicionSegura } from "../systems/collision";

const VELOCIDAD = 196;      // pixeles por segundo a pleno galope
const ACELERACION = 17;     // ganancia al arrancar (mayor = mas seco)
const FRENADO = 24;         // ganancia al soltar la tecla
const UMBRAL_PARADA = 7;    // por debajo se considera quieto: evita vibrar
const PASOS_PARA_TIRADA = 58;
const PROB_ENCUENTRO = 0.24;
const AVISO_PELIGRO = 1400; // ms que dura el cartel "Zona peligrosa"

const TECLAS = {
  ArrowUp: "arriba", KeyW: "arriba",
  ArrowDown: "abajo", KeyS: "abajo",
  ArrowLeft: "izquierda", KeyA: "izquierda",
  ArrowRight: "derecha", KeyD: "derecha",
};

/**
 * @param {object}   mapa          mapa actual
 * @param {boolean}  pausado       true mientras hay un dialogo abierto
 * @param {function} alEncuentro   salta un Pokemon salvaje en zona alta
 * @param {function} alInteractuar se pulso E / Espacio / Enter
 */
export function usePlayerController({ mapa, pausado, alEncuentro, alInteractuar }) {
  const [estado, setEstado] = useState(() => ({
    ...spawnDe(mapa), direccion: "abajo", andando: false,
  }));
  const [peligro, setPeligro] = useState(false);
  const [enZonaAlta, setEnZonaAlta] = useState(false);

  const teclas = useRef(new Set());
  const cuerpo = useRef({ ...estado, vx: 0, vy: 0 });
  const recorridoAlto = useRef(0);
  const enfriamiento = useRef(0);
  const avisoHasta = useRef(0);

  // Los callbacks viven en un ref: el bucle no se reinicia en cada render.
  const cb = useRef({ alEncuentro, alInteractuar, pausado, mapa });
  cb.current = { alEncuentro, alInteractuar, pausado, mapa };

  // Al cambiar de mapa el jugador aparece en el punto de entrada.
  useEffect(() => {
    const salida = spawnDe(mapa);
    const inicio = posicionSegura(mapa, salida.x, salida.y, HITBOX_JUGADOR);
    cuerpo.current = { ...inicio, direccion: "abajo", andando: false, vx: 0, vy: 0 };
    recorridoAlto.current = 0;
    enfriamiento.current = 1.2;
    teclas.current.clear();
    setEstado({ ...inicio, direccion: "abajo", andando: false });
    setEnZonaAlta(false);
  }, [mapa]);

  useEffect(() => {
    const abajo = (e) => {
      if (TECLAS[e.code]) {
        e.preventDefault();
        teclas.current.add(TECLAS[e.code]);
      } else if (["KeyE", "Space", "Enter"].includes(e.code)) {
        e.preventDefault();
        if (!cb.current.pausado) cb.current.alInteractuar?.();
      }
    };
    const arriba = (e) => { if (TECLAS[e.code]) teclas.current.delete(TECLAS[e.code]); };
    const soltarTodo = () => teclas.current.clear();

    window.addEventListener("keydown", abajo);
    window.addEventListener("keyup", arriba);
    window.addEventListener("blur", soltarTodo);
    return () => {
      window.removeEventListener("keydown", abajo);
      window.removeEventListener("keyup", arriba);
      window.removeEventListener("blur", soltarTodo);
    };
  }, []);

  const avisarPeligro = useCallback(() => {
    const ahora = performance.now();
    if (ahora < avisoHasta.current) return;
    avisoHasta.current = ahora + AVISO_PELIGRO;
    setPeligro(true);
    setTimeout(() => setPeligro(false), AVISO_PELIGRO);
  }, []);

  useEffect(() => {
    let frame = requestAnimationFrame(paso);
    let anterior = performance.now();

    function paso(ahora) {
      frame = requestAnimationFrame(paso);
      const dt = Math.min((ahora - anterior) / 1000, 0.05); // ignora saltos grandes
      anterior = ahora;

      const { pausado: enPausa, mapa: mapaActual } = cb.current;
      if (enfriamiento.current > 0) enfriamiento.current -= dt;
      if (enPausa) teclas.current.clear();

      let ix = 0;
      let iy = 0;
      if (teclas.current.has("izquierda")) ix -= 1;
      if (teclas.current.has("derecha")) ix += 1;
      if (teclas.current.has("arriba")) iy -= 1;
      if (teclas.current.has("abajo")) iy += 1;

      // En diagonal no se anda mas rapido.
      const norma = Math.hypot(ix, iy) || 1;
      const cuerpoAct = cuerpo.current;
      const objetivoX = (ix / norma) * VELOCIDAD;
      const objetivoY = (iy / norma) * VELOCIDAD;

      // Suavizado exponencial: acelera y frena igual sea cual sea el fps.
      const ganancia = 1 - Math.exp(-(ix || iy ? ACELERACION : FRENADO) * dt);
      let vx = cuerpoAct.vx + (objetivoX - cuerpoAct.vx) * ganancia;
      let vy = cuerpoAct.vy + (objetivoY - cuerpoAct.vy) * ganancia;
      if (!ix && !iy && Math.hypot(vx, vy) < UMBRAL_PARADA) { vx = 0; vy = 0; }

      const movido = deslizar(mapaActual, cuerpoAct.x, cuerpoAct.y, vx * dt, vy * dt, HITBOX_JUGADOR);
      if (movido.bloqueo === "~") avisarPeligro();
      // Al chocar se pierde la inercia de ese eje: nada de temblor contra el muro.
      if (movido.x === cuerpoAct.x && vx) vx = 0;
      if (movido.y === cuerpoAct.y && vy) vy = 0;

      const andando = Math.hypot(vx, vy) > UMBRAL_PARADA;
      let direccion = cuerpoAct.direccion;
      if (ix || iy) direccion = Math.abs(ix) > Math.abs(iy)
        ? (ix > 0 ? "derecha" : "izquierda")
        : (iy > 0 ? "abajo" : "arriba");

      const recorrido = Math.hypot(movido.x - cuerpoAct.x, movido.y - cuerpoAct.y);
      cuerpo.current = { x: movido.x, y: movido.y, direccion, andando, vx, vy };

      // Un unico setState por fotograma, y ninguno si nada cambio en pantalla.
      setEstado((prev) => (
        Math.round(prev.x) === Math.round(movido.x)
        && Math.round(prev.y) === Math.round(movido.y)
        && prev.direccion === direccion
        && prev.andando === andando
          ? prev
          : { x: movido.x, y: movido.y, direccion, andando }
      ));

      if (recorrido < 0.01 || enPausa) return;

      // Encuentros: solo en algas / hierba alta / ceniza.
      const alto = esZonaAlta(casillaEn(mapaActual, movido.x, movido.y));
      setEnZonaAlta((prev) => (prev === alto ? prev : alto));

      // Fuera de la zona el contador se congela, no se descuenta: los parches
      // son estrechos y si se vaciara al salir casi nunca saltaria un encuentro.
      if (!alto) return;
      recorridoAlto.current += recorrido;
      if (recorridoAlto.current < PASOS_PARA_TIRADA || enfriamiento.current > 0) return;

      recorridoAlto.current = 0;
      if (Math.random() < PROB_ENCUENTRO) {
        enfriamiento.current = 1.5;
        teclas.current.clear();
        cb.current.alEncuentro?.();
      }
    }

    return () => cancelAnimationFrame(frame);
  }, [avisarPeligro]);

  return { pos: estado, cuerpo, enZonaAlta, peligro };
}
