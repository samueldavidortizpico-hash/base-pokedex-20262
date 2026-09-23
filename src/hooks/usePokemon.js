import { useState } from "react";
import { buscarPokemon, normalizarBusqueda } from "../services/pokeApi";

export function usePokemon() {
  const [estado, setEstado] = useState({ datos: null, especie: null, evolucion: null });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function buscar(query) {
    const validacion = normalizarBusqueda(query);
    if (validacion.error) {
      setError(validacion.error);
      return;
    }
    setCargando(true);
    setError("");
    setEstado({ datos: null, especie: null, evolucion: null });
    try {
      const resultado = await buscarPokemon(query);
      setEstado(resultado);
    } catch (e) {
      if (e.message.includes("404")) {
        setError(`No encontramos un Pokémon llamado "${query.trim()}".`);
      } else {
        setError("No se pudo obtener la información. Comprueba tu conexión.");
      }
    } finally {
      setCargando(false);
    }
  }

  return { estado, cargando, error, buscar };
}
