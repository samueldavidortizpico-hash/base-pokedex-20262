import { API_URL } from "../constants";

const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

export function normalizarBusqueda(valor) {
  const limpio = valor.trim().toLowerCase();
  if (!limpio) return { error: "Escribe el nombre o ID de un Pokémon." };

  if (/^\d+$/.test(limpio)) {
    const id = Number(limpio);
    if (id <= 0) return { error: "El ID debe ser mayor que 0." };
    if (!Number.isSafeInteger(id)) return { error: "El ID introducido es demasiado grande." };
    return { value: String(id) };
  }

  const nombre = limpio
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  if (!/^[a-z0-9-]+$/.test(nombre)) return { error: "La búsqueda contiene caracteres no válidos." };
  return { value: nombre };
}

function obtenerDescripcionIngles(entradas) {
  if (!Array.isArray(entradas)) return null;
  const e = entradas.find((x) => x.language?.name === "en");
  return e?.effect || e?.flavor_text || null;
}

async function obtenerMovimientos(movimientosApi) {
  const candidatos = movimientosApi.filter((x) => x.move?.url).slice(0, 12);
  const resultados = await Promise.all(
    candidatos.map(async (x) => {
      try { return await fetchWithCache(x.move.url); }
      catch { return null; }
    })
  );

  const movimientos = resultados
    .filter((m) => m && m.power > 0 && m.damage_class?.name && m.type?.name)
    .map((m) => ({
      nombre: m.name,
      tipo: m.type.name,
      poder: m.power,
      precision: m.accuracy || 100,
      categoria: m.damage_class.name,
    }))
    .sort((a, b) => b.poder - a.poder);

  const unicos = [];
  const vistos = new Set();
  for (const mov of movimientos) {
    if (!vistos.has(mov.nombre)) {
      vistos.add(mov.nombre);
      unicos.push(mov);
    }
    if (unicos.length === 4) break;
  }

  return unicos.length > 0
    ? unicos
    : [{ nombre: "Ataque básico", tipo: "normal", poder: 40, precision: 100, categoria: "physical" }];
}

function obtenerEstadisticas(pokemon) {
  if (!Array.isArray(pokemon.stats)) return [];
  return pokemon.stats.map((s) => ({
    nombre: s.stat?.name || "unknown",
    valor: Number(s.base_stat) || 0,
  }));
}

function obtenerStat(estadisticas, nombre) {
  return estadisticas.find((s) => s.nombre === nombre)?.valor || 0;
}

export async function prepararPokemon(pokemon) {
  const tipos = Array.isArray(pokemon.types)
    ? pokemon.types.map((x) => x.type?.name).filter(Boolean)
    : [];

  const estadisticas = obtenerEstadisticas(pokemon);

  const habilidadRef =
    pokemon.abilities?.find((x) => !x.is_hidden)?.ability ||
    pokemon.abilities?.[0]?.ability;

  let habilidad = {
    nombre: habilidadRef?.name || "No disponible",
    descripcion: "No hay descripción disponible.",
  };

  if (habilidadRef?.url) {
    try {
      const abilityData = await fetchWithCache(habilidadRef.url);
      habilidad.descripcion =
        obtenerDescripcionIngles(abilityData.effect_entries) ||
        obtenerDescripcionIngles(abilityData.flavor_text_entries) ||
        "No hay descripción disponible.";
    } catch {
      // keep default
    }
  }

  const movimientos = await obtenerMovimientos(pokemon.moves || []);

  return {
    raw: pokemon,
    id: pokemon.id,
    nombre: pokemon.name,
    tipos,
    estadisticas,
    habilidad,
    movimientos,
    hpMax: obtenerStat(estadisticas, "hp"),
    hpActual: obtenerStat(estadisticas, "hp"),
    ataque: obtenerStat(estadisticas, "attack"),
    defensa: obtenerStat(estadisticas, "defense"),
    ataqueEspecial: obtenerStat(estadisticas, "special-attack"),
    defensaEspecial: obtenerStat(estadisticas, "special-defense"),
    velocidad: obtenerStat(estadisticas, "speed"),
    imagen:
      pokemon.sprites?.other?.["official-artwork"]?.front_default ||
      pokemon.sprites?.front_default ||
      null,
  };
}

export async function buscarPokemon(query) {
  const resultado = normalizarBusqueda(query);
  if (resultado.error) throw new Error(resultado.error);

  const pokemon = await fetchWithCache(
    `${API_URL}${encodeURIComponent(resultado.value)}`
  );

  const especie = pokemon.species?.url
    ? await fetchWithCache(pokemon.species.url).catch(() => null)
    : null;

  const evolucion = especie?.evolution_chain?.url
    ? await fetchWithCache(especie.evolution_chain.url).catch(() => null)
    : null;

  const datos = await prepararPokemon(pokemon);
  return { datos, especie, evolucion };
}
