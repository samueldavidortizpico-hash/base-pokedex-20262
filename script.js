const pokemonInput = document.getElementById("pokemonInput");
const searchForm = document.getElementById("searchForm");
const searchButton = document.getElementById("searchButton");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const pokemonResult = document.getElementById("pokemonResult");

const battleButton = document.getElementById("battleButton");
const battleSection = document.getElementById("battleSection");
const pokemonOneInput = document.getElementById("pokemonOneInput");
const pokemonTwoInput = document.getElementById("pokemonTwoInput");
const pokemonOneButton = document.getElementById("pokemonOneButton");
const pokemonTwoButton = document.getElementById("pokemonTwoButton");
const fighterOne = document.getElementById("fighterOne");
const fighterTwo = document.getElementById("fighterTwo");
const startBattleButton = document.getElementById("startBattleButton");
const battleStatus = document.getElementById("battleStatus");
const battleLog = document.getElementById("battleLog");
const battleWinner = document.getElementById("battleWinner");
const restartBattleButton = document.getElementById("restartBattleButton");

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const SPRITE_BASE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

const cache = new Map();

const battle = {
    pokemonOne: null,
    pokemonTwo: null,
    active: false,
    turn: 0
};

const TYPE_RELATIONS = {
    normal: { strong: [], weak: ["rock", "steel"], immune: ["ghost"] },
    fire: { strong: ["grass", "ice", "bug", "steel"], weak: ["fire", "water", "rock", "dragon"], immune: [] },
    water: { strong: ["fire", "ground", "rock"], weak: ["water", "grass", "dragon"], immune: [] },
    electric: { strong: ["water", "flying"], weak: ["electric", "grass", "dragon"], immune: ["ground"] },
    grass: { strong: ["water", "ground", "rock"], weak: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], immune: [] },
    ice: { strong: ["grass", "ground", "flying", "dragon"], weak: ["fire", "water", "ice", "steel"], immune: [] },
    fighting: { strong: ["normal", "ice", "rock", "dark", "steel"], weak: ["poison", "flying", "psychic", "bug", "fairy"], immune: ["ghost"] },
    poison: { strong: ["grass", "fairy"], weak: ["poison", "ground", "rock", "ghost"], immune: ["steel"] },
    ground: { strong: ["fire", "electric", "poison", "rock", "steel"], weak: ["grass", "bug"], immune: ["flying"] },
    flying: { strong: ["grass", "fighting", "bug"], weak: ["electric", "rock", "steel"], immune: [] },
    psychic: { strong: ["fighting", "poison"], weak: ["psychic", "steel"], immune: ["dark"] },
    bug: { strong: ["grass", "psychic", "dark"], weak: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], immune: [] },
    rock: { strong: ["fire", "ice", "flying", "bug"], weak: ["fighting", "ground", "steel"], immune: [] },
    ghost: { strong: ["psychic", "ghost"], weak: ["dark"], immune: ["normal"] },
    dragon: { strong: ["dragon"], weak: ["steel"], immune: ["fairy"] },
    dark: { strong: ["psychic", "ghost"], weak: ["fighting", "dark", "fairy"], immune: [] },
    steel: { strong: ["ice", "rock", "fairy"], weak: ["fire", "water", "electric", "fighting", "ground"], immune: ["poison"] },
    fairy: { strong: ["fighting", "dragon", "dark"], weak: ["fire", "poison", "steel"], immune: [] }
};

const STAT_NAMES = {
    hp: "PS",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "Ataque especial",
    "special-defense": "Defensa especial",
    speed: "Velocidad"
};

const TYPE_NAMES = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    electric: "Eléctrico",
    grass: "Planta",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada"
};

const MOVE_CATEGORY_NAMES = {
    physical: "Físico",
    special: "Especial"
};

const ABILITY_RULES = {
    "intimidate": {
        label: "Intimidación",
        effect: "Reduce el Ataque físico rival al entrar."
    },

    "huge-power": {
        label: "Potencia",
        effect: "Duplica el Ataque físico."
    },

    "pure-power": {
        label: "Potencia Pura",
        effect: "Duplica el Ataque físico."
    },

    "adaptability": {
        label: "Adaptable",
        effect: "Aumenta el bono STAB."
    },

    "technician": {
        label: "Experto",
        effect: "Potencia movimientos de 60 o menos."
    },

    "levitate": {
        label: "Levitación",
        effect: "Inmunidad a movimientos de tipo Tierra."
    },

    "water-absorb": {
        label: "Absorbe Agua",
        effect: "Los ataques de Agua no causan daño."
    },

    "volt-absorb": {
        label: "Absorbe Electricidad",
        effect: "Los ataques Eléctricos no causan daño."
    },

    "flash-fire": {
        label: "Absorbe Fuego",
        effect: "Los ataques de Fuego no causan daño."
    },

    "thick-fat": {
        label: "Sebo",
        effect: "Reduce el daño de Fuego y Hielo."
    },

    "multiscale": {
        label: "Multiescama",
        effect: "Reduce el daño cuando los PS están completos."
    },

    "filter": {
        label: "Filtro",
        effect: "Reduce el daño de ataques súper efectivos."
    },

    "solid-rock": {
        label: "Roca Sólida",
        effect: "Reduce el daño de ataques súper efectivos."
    },

    "prism-armor": {
        label: "Armadura Prisma",
        effect: "Reduce el daño de ataques súper efectivos."
    },

    "sturdy": {
        label: "Robustez",
        effect: "Evita un KO de un solo golpe con PS completos."
    },

    "blaze": {
        label: "Mar Llamas",
        effect: "Potencia movimientos de Fuego con pocos PS."
    },

    "torrent": {
        label: "Torrente",
        effect: "Potencia movimientos de Agua con pocos PS."
    },

    "overgrow": {
        label: "Espesura",
        effect: "Potencia movimientos de Planta con pocos PS."
    },

    "swarm": {
        label: "Enjambre",
        effect: "Potencia movimientos de Bicho con pocos PS."
    }
};

function cacheKey(url) {
    return url;
}

async function obtenerDatos(url) {
    const key = cacheKey(url);

    if (cache.has(key)) {
        return cache.get(key);
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();

    cache.set(key, data);

    return data;
}

function capitalizar(texto) {
    if (!texto) {
        return "";
    }

    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function mostrarError(mensaje) {
    errorMessage.textContent = mensaje;
}

function limpiarMensajes() {
    errorMessage.textContent = "";
    loadingMessage.textContent = "";
}

function normalizarBusqueda(valor) {
    const limpio = valor.trim().toLowerCase();

    if (!limpio) {
        return {
            error: "⚠️ Escribe el nombre o ID de un Pokémon."
        };
    }

    if (/^\d+$/.test(limpio)) {
        const id = Number(limpio);

        if (id <= 0) {
            return {
                error: "⚠️ El ID debe ser mayor que 0."
            };
        }

        if (!Number.isSafeInteger(id)) {
            return {
                error: "⚠️ El ID introducido es demasiado grande."
            };
        }

        return {
            value: String(id)
        };
    }

    const nombre = limpio
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-");

    if (!/^[a-z0-9-]+$/.test(nombre)) {
        return {
            error: "⚠️ La búsqueda contiene caracteres no válidos."
        };
    }

    return {
        value: nombre
    };
}

async function buscarPokemon() {
    limpiarMensajes();

    pokemonResult.innerHTML = "";

    const resultado =
        normalizarBusqueda(
            pokemonInput.value
        );

    if (resultado.error) {
        mostrarError(resultado.error);
        pokemonInput.focus();
        return;
    }

    loadingMessage.textContent =
        "🔎 Buscando información del Pokémon...";

    searchButton.disabled = true;

    try {
        const pokemon =
            await obtenerDatos(
                `${API_URL}${encodeURIComponent(
                    resultado.value
                )}`
            );

        const especie =
            pokemon.species?.url
                ? await obtenerDatos(
                    pokemon.species.url
                ).catch(() => null)
                : null;

        const evolucion =
            especie?.evolution_chain?.url
                ? await obtenerDatos(
                    especie.evolution_chain.url
                ).catch(() => null)
                : null;

        const datos =
            await prepararPokemon(
                pokemon
            );

        mostrarPokemon(
            datos,
            especie,
            evolucion
        );

    } catch (error) {
        console.error(error);

        if (
            error.message.includes("404")
        ) {
            mostrarError(
                `❌ No encontramos un Pokémon llamado o identificado como "${resultado.value}".`
            );
        } else {
            mostrarError(
                "❌ No se pudo obtener la información. Comprueba tu conexión a Internet."
            );
        }

    } finally {
        loadingMessage.textContent = "";
        searchButton.disabled = false;
    }
}

async function prepararPokemon(pokemon) {
    const tipos =
        Array.isArray(pokemon.types)
            ? pokemon.types
                .map(
                    item =>
                        item.type?.name
                )
                .filter(Boolean)
            : [];

    const estadisticas =
        obtenerEstadisticas(
            pokemon
        );

    const habilidadRef =
        pokemon.abilities?.find(
            item =>
                !item.is_hidden
        )?.ability
        || pokemon.abilities?.[0]?.ability;

    let habilidad = {
        nombre:
            habilidadRef?.name
            || "No disponible",

        descripcion:
            "No hay descripción disponible.",

        url:
            habilidadRef?.url
            || null
    };

    if (habilidadRef?.url) {
        try {
            const abilityData =
                await obtenerDatos(
                    habilidadRef.url
                );

            habilidad.descripcion =
                obtenerDescripcionIngles(
                    abilityData.effect_entries
                )
                ||
                obtenerDescripcionIngles(
                    abilityData.flavor_text_entries
                )
                ||
                "No hay descripción disponible.";

        } catch (error) {
            console.warn(
                "No se pudo cargar la habilidad:",
                error
            );
        }
    }

    const movimientos =
        await obtenerMovimientosDeBatalla(
            pokemon.moves || []
        );

    return {
        raw: pokemon,

        id: pokemon.id,

        nombre: pokemon.name,

        tipos,

        estadisticas,

        habilidad,

        movimientos,

        hpMax:
            obtenerStat(
                estadisticas,
                "hp"
            ),

        hpActual:
            obtenerStat(
                estadisticas,
                "hp"
            ),

        ataque:
            obtenerStat(
                estadisticas,
                "attack"
            ),

        defensa:
            obtenerStat(
                estadisticas,
                "defense"
            ),

        ataqueEspecial:
            obtenerStat(
                estadisticas,
                "special-attack"
            ),

        defensaEspecial:
            obtenerStat(
                estadisticas,
                "special-defense"
            ),

        velocidad:
            obtenerStat(
                estadisticas,
                "speed"
            ),

        imagen:
            pokemon.sprites
                ?.other
                ?.["official-artwork"]
                ?.front_default
            ||
            pokemon.sprites?.front_default
            ||
            null
    };
}

function obtenerDescripcionIngles(
    entradas
) {
    if (!Array.isArray(entradas)) {
        return null;
    }

    const entrada =
        entradas.find(
            item =>
                item.language?.name ===
                "en"
        );

    return (
        entrada?.effect
        ||
        entrada?.flavor_text
        ||
        null
    );
}

async function obtenerMovimientosDeBatalla(
    movimientosApi
) {
    const candidatos =
        movimientosApi
            .filter(
                item =>
                    item.move?.url
            )
            .slice(0, 12);

    const resultados =
        await Promise.all(
            candidatos.map(
                async item => {
                    try {
                        return await obtenerDatos(
                            item.move.url
                        );
                    } catch (error) {
                        return null;
                    }
                }
            )
        );

    const movimientos =
        resultados
            .filter(
                move =>
                    move &&
                    move.power > 0 &&
                    move.damage_class?.name &&
                    move.type?.name
            )
            .map(
                move => ({
                    nombre:
                        move.name,

                    tipo:
                        move.type.name,

                    poder:
                        move.power,

                    precision:
                        move.accuracy || 100,

                    categoria:
                        move.damage_class.name
                })
            )
            .sort(
                (a, b) =>
                    b.poder - a.poder
            );

    const unicos = [];
    const vistos = new Set();

    for (
        const movimiento of movimientos
    ) {
        if (
            !vistos.has(
                movimiento.nombre
            )
        ) {
            vistos.add(
                movimiento.nombre
            );

            unicos.push(
                movimiento
            );
        }

        if (
            unicos.length === 4
        ) {
            break;
        }
    }

    return unicos.length > 0
        ? unicos
        : [
            {
                nombre:
                    "Ataque básico",

                tipo:
                    "normal",

                poder:
                    40,

                precision:
                    100,

                categoria:
                    "physical"
            }
        ];
}

function obtenerEstadisticas(
    pokemon
) {
    if (
        !Array.isArray(
            pokemon.stats
        )
    ) {
        return [];
    }

    return pokemon.stats.map(
        stat => ({
            nombre:
                stat.stat?.name
                || "unknown",

            valor:
                Number(
                    stat.base_stat
                ) || 0
        })
    );
}

function obtenerStat(
    estadisticas,
    nombre
) {
    return (
        estadisticas.find(
            stat =>
                stat.nombre ===
                nombre
        )?.valor || 0
    );
}

function mostrarPokemon(
    datos,
    especie,
    evolucion
) {
    const totalEstadisticas =
        datos.estadisticas.reduce(
            (total, stat) =>
                total + stat.valor,
            0
        );

    const rutasEvolucion =
        obtenerRutasEvolucion(
            evolucion
        );

    pokemonResult.innerHTML = `
        <article class="pokemon-card">

            <div class="card-inner">

                <div class="card-header">

                    <div>

                        <p class="card-number">
                            POKÉMON #${String(
                                datos.id
                            ).padStart(3, "0")}
                        </p>

                        <h2 class="card-name">
                            ${capitalizar(
                                datos.nombre
                            )}
                        </h2>

                    </div>

                    <div class="card-hp">
                        HP ${datos.hpMax}
                    </div>

                </div>

                <div class="card-art">

                    ${
                        datos.imagen
                            ? `
                                <img
                                    src="${datos.imagen}"
                                    alt="${capitalizar(
                                        datos.nombre
                                    )}"
                                >
                            `
                            : `
                                <p>
                                    Imagen no disponible.
                                </p>
                            `
                    }

                </div>

                <div class="type-list">

                    ${
                        datos.tipos
                            .map(
                                tipo => `
                                    <span class="type-badge">
                                        ${
                                            TYPE_NAMES[
                                                tipo
                                            ]
                                            ||
                                            capitalizar(
                                                tipo
                                            )
                                        }
                                    </span>
                                `
                            )
                            .join("")
                    }

                </div>

                <div class="card-info">

                    <div class="info-box">

                        <strong>
                            ID
                        </strong>

                        <span>
                            #${String(
                                datos.id
                            ).padStart(3, "0")}
                        </span>

                    </div>

                    <div class="info-box">

                        <strong>
                            Especie
                        </strong>

                        <span>
                            ${obtenerNombreEspecie(
                                especie
                            )}
                        </span>

                    </div>

                    <div class="info-box">

                        <strong>
                            Altura
                        </strong>

                        <span>
                            ${(
                                datos.raw.height /
                                10
                            ).toFixed(1)} m
                        </span>

                    </div>

                    <div class="info-box">

                        <strong>
                            Peso
                        </strong>

                        <span>
                            ${(
                                datos.raw.weight /
                                10
                            ).toFixed(1)} kg
                        </span>

                    </div>

                </div>

                <section class="card-section">

                    <h3 class="card-section-title">
                        Habilidad
                    </h3>

                    <div class="ability-box">

                        <div class="ability-name">
                            ${capitalizar(
                                datos.habilidad.nombre
                            )}
                        </div>

                        <p class="ability-description">
                            ${datos.habilidad.descripcion}
                        </p>

                    </div>

                </section>

                <section class="card-section">

                    <h3 class="card-section-title">
                        Estadísticas base
                    </h3>

                    ${mostrarEstadisticasBonitas(
                        datos.estadisticas
                    )}

                    <div class="total-stats">

                        <span>
                            Total de estadísticas base
                        </span>

                        <span>
                            ${totalEstadisticas}
                        </span>

                    </div>

                </section>

                <section class="card-section">

                    <h3 class="card-section-title">
                        Movimientos
                    </h3>

                    <div class="moves-preview">

                        ${
                            datos.movimientos
                                .map(
                                    move => `
                                        <div class="move-preview">

                                            <strong>
                                                ${capitalizar(
                                                    move.nombre
                                                )}
                                            </strong>

                                            <span>
                                                ${
                                                    TYPE_NAMES[
                                                        move.tipo
                                                    ]
                                                    ||
                                                    capitalizar(
                                                        move.tipo
                                                    )
                                                }

                                                ·

                                                ${move.poder}
                                                POT
                                            </span>

                                        </div>
                                    `
                                )
                                .join("")
                        }

                    </div>

                </section>

                <section class="card-section">

                    <h3 class="card-section-title">
                        Evolución
                    </h3>

                    ${mostrarEvolucion(
                        rutasEvolucion,
                        datos.nombre
                    )}

                </section>

                <section class="card-section">

                    <h3 class="card-section-title">
                        Efectividad defensiva
                    </h3>

                    ${mostrarEfectividadDefensiva(
                        datos.tipos
                    )}

                </section>

            </div>

        </article>
    `;
}

function mostrarEstadisticasBonitas(
    estadisticas
) {
    if (!estadisticas.length) {
        return `
            <p>
                No hay estadísticas disponibles.
            </p>
        `;
    }

    return `
        <div class="stats">

            ${
                estadisticas
                    .map(
                        stat => {
                            const porcentaje =
                                Math.min(
                                    (
                                        stat.valor /
                                        180
                                    ) *
                                    100,
                                    100
                                );

                            return `
                                <div class="stat">

                                    <span class="stat-name">
                                        ${
                                            STAT_NAMES[
                                                stat.nombre
                                            ]
                                            ||
                                            capitalizar(
                                                stat.nombre
                                            )
                                        }
                                    </span>

                                    <div class="stat-bar">

                                        <div
                                            class="stat-fill"
                                            style="width: ${porcentaje}%"
                                        ></div>

                                    </div>

                                    <span class="stat-value">
                                        ${stat.valor}
                                    </span>

                                </div>
                            `;
                        }
                    )
                    .join("")
            }

        </div>
    `;
}

function obtenerNombreEspecie(
    especie
) {
    if (
        !especie ||
        !Array.isArray(
            especie.genera
        )
    ) {
        return "Información no disponible";
    }

    const entrada =
        especie.genera.find(
            item =>
                item.language?.name ===
                "en"
        );

    return (
        entrada?.genus
        ||
        "Información no disponible"
    );
}

function extraerIdDeUrl(
    url
) {
    const coincidencia =
        url?.match(
            /\/(\d+)\/?$/
        );

    return coincidencia
        ? coincidencia[1]
        : null;
}

function construirArbolEvolucion(
    nodoApi
) {
    if (!nodoApi) {
        return null;
    }

    return {
        nombre:
            nodoApi.species?.name
            || "unknown",

        id:
            extraerIdDeUrl(
                nodoApi.species?.url
            ),

        hijos:
            Array.isArray(
                nodoApi.evolves_to
            )
                ? nodoApi.evolves_to
                    .map(
                        construirArbolEvolucion
                    )
                    .filter(Boolean)
                : []
    };
}

function generarRutas(
    nodo,
    rutaActual = []
) {
    const nuevaRuta = [
        ...rutaActual,
        nodo
    ];

    if (
        nodo.hijos.length === 0
    ) {
        return [
            nuevaRuta
        ];
    }

    return nodo.hijos.flatMap(
        hijo =>
            generarRutas(
                hijo,
                nuevaRuta
            )
    );
}

function obtenerRutasEvolucion(
    evolucion
) {
    if (
        !evolucion?.chain
    ) {
        return [];
    }

    const arbol =
        construirArbolEvolucion(
            evolucion.chain
        );

    return arbol
        ? generarRutas(arbol)
        : [];
}

function mostrarEvolucion(
    rutas,
    nombreActual
) {
    if (!rutas.length) {
        return `
            <p>
                No hay información de evolución disponible.
            </p>
        `;
    }

    return `
        <div class="evoluciones">

            ${
                rutas
                    .map(
                        ruta => `
                            <div class="ruta-evolucion">

                                ${
                                    ruta
                                        .map(
                                            (
                                                etapa,
                                                indice
                                            ) => `
                                                ${
                                                    indice > 0
                                                        ? `
                                                            <span class="flecha-evolucion">
                                                                →
                                                            </span>
                                                        `
                                                        : ""
                                                }

                                                <div class="
                                                    etapa-evolucion
                                                    ${
                                                        etapa.nombre ===
                                                        nombreActual
                                                            ? "etapa-actual"
                                                            : ""
                                                    }
                                                ">

                                                    ${
                                                        etapa.id
                                                            ? `
                                                                <img
                                                                    src="${SPRITE_BASE_URL}${etapa.id}.png"
                                                                    alt="${capitalizar(
                                                                        etapa.nombre
                                                                    )}"
                                                                >
                                                            `
                                                            : ""
                                                    }

                                                    <p>
                                                        ${capitalizar(
                                                            etapa.nombre
                                                        )}
                                                    </p>

                                                </div>
                                            `
                                        )
                                        .join("")
                                }

                            </div>
                        `
                    )
                    .join("")
            }

        </div>
    `;
}

function obtenerMultiplicadorTipo(
    tipoAtaque,
    tiposDefensor
) {
    let multiplicador = 1;

    for (
        const tipoDefensor of tiposDefensor
    ) {
        const relacion =
            TYPE_RELATIONS[
                tipoAtaque
            ];

        if (!relacion) {
            continue;
        }

        if (
            relacion.immune.includes(
                tipoDefensor
            )
        ) {
            multiplicador *= 0;
        } else if (
            relacion.strong.includes(
                tipoDefensor
            )
        ) {
            multiplicador *= 2;
        } else if (
            relacion.weak.includes(
                tipoDefensor
            )
        ) {
            multiplicador *= 0.5;
        }
    }

    return multiplicador;
}

function mostrarEfectividadDefensiva(
    tipos
) {
    const fuertes = [];
    const debiles = [];
    const inmunidades = [];

    for (
        const tipoAtaque of Object.keys(
            TYPE_RELATIONS
        )
    ) {
        const multiplicador =
            obtenerMultiplicadorTipo(
                tipoAtaque,
                tipos
            );

        if (
            multiplicador === 0
        ) {
            inmunidades.push(
                tipoAtaque
            );
        } else if (
            multiplicador > 1
        ) {
            debiles.push(
                tipoAtaque
            );
        } else if (
            multiplicador < 1
        ) {
            fuertes.push(
                tipoAtaque
            );
        }
    }

    return `
        <div class="effectiveness">

            <div class="effect-box effect-strong">

                <strong>
                    Resiste:
                </strong>

                ${
                    fuertes.length
                        ? fuertes
                            .map(
                                tipo =>
                                    TYPE_NAMES[
                                        tipo
                                    ]
                            )
                            .join(", ")
                        : "Ningún tipo especial"
                }

            </div>

            <div class="effect-box effect-weak">

                <strong>
                    Débil contra:
                </strong>

                ${
                    debiles.length
                        ? debiles
                            .map(
                                tipo =>
                                    TYPE_NAMES[
                                        tipo
                                    ]
                            )
                            .join(", ")
                        : "Ningún tipo especial"
                }

            </div>

            ${
                inmunidades.length
                    ? `
                        <div class="effect-box effect-immune">

                            <strong>
                                Inmune a:
                            </strong>

                            ${
                                inmunidades
                                    .map(
                                        tipo =>
                                            TYPE_NAMES[
                                                tipo
                                            ]
                                    )
                                    .join(", ")
                            }

                        </div>
                    `
                    : ""
            }

        </div>
    `;
}


/* ========================================
   BATALLA
======================================== */

function abrirBatalla() {
    battleSection.classList.remove(
        "hidden"
    );

    battleSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    pokemonOneInput.focus();
}

async function seleccionarLuchador(
    numero
) {
    const input =
        numero === 1
            ? pokemonOneInput
            : pokemonTwoInput;

    const container =
        numero === 1
            ? fighterOne
            : fighterTwo;

    const valor =
        input.value;

    const resultado =
        normalizarBusqueda(
            valor
        );

    if (resultado.error) {
        battleStatus.textContent =
            resultado.error;

        input.focus();

        return;
    }

    container.innerHTML =
        "<p class='empty-fighter'>🔎 Cargando Pokémon...</p>";

    try {
        const pokemon =
            await obtenerDatos(
                `${API_URL}${encodeURIComponent(
                    resultado.value
                )}`
            );

        const datos =
            await prepararPokemon(
                pokemon
            );

        if (numero === 1) {
            battle.pokemonOne =
                datos;
        } else {
            battle.pokemonTwo =
                datos;
        }

        mostrarCartaLuchador(
            container,
            datos
        );

        actualizarBotonBatalla();

        battleStatus.textContent =
            `${capitalizar(
                datos.nombre
            )} está listo para combatir.`;

    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <p class="empty-fighter">
                ❌ Pokémon no encontrado.
            </p>
        `;

        battleStatus.textContent =
            `No encontramos "${valor.trim()}".`;
    }
}

function actualizarBotonBatalla() {
    if (
        battle.pokemonOne &&
        battle.pokemonTwo
    ) {
        startBattleButton.classList.remove(
            "hidden"
        );

        battleStatus.textContent =
            "⚔️ Los dos combatientes están listos.";
    } else {
        startBattleButton.classList.add(
            "hidden"
        );
    }
}

function mostrarCartaLuchador(
    container,
    pokemon
) {
    container.innerHTML = `
        <div class="card-header">

            <div>

                <p class="card-number">
                    #${String(
                        pokemon.id
                    ).padStart(3, "0")}
                </p>

                <h2 class="card-name">
                    ${capitalizar(
                        pokemon.nombre
                    )}
                </h2>

            </div>

            <div class="card-hp">
                HP ${pokemon.hpActual}
            </div>

        </div>

        <div class="card-art">

            ${
                pokemon.imagen
                    ? `
                        <img
                            src="${pokemon.imagen}"
                            alt="${capitalizar(
                                pokemon.nombre
                            )}"
                        >
                    `
                    : `
                        <p>
                            Imagen no disponible.
                        </p>
                    `
            }

        </div>

        <div class="type-list">

            ${
                pokemon.tipos
                    .map(
                        tipo => `
                            <span class="type-badge">
                                ${
                                    TYPE_NAMES[
                                        tipo
                                    ]
                                    ||
                                    capitalizar(
                                        tipo
                                    )
                                }
                            </span>
                        `
                    )
                    .join("")
            }

        </div>

        <div class="ability-box">

            <div class="ability-name">
                ✨ ${capitalizar(
                    pokemon.habilidad.nombre
                )}
            </div>

            <p class="ability-description">
                ${pokemon.habilidad.descripcion}
            </p>

        </div>

        <div class="card-section">

            <h3 class="card-section-title">
                Estadísticas
            </h3>

            ${mostrarEstadisticasBonitas(
                pokemon.estadisticas
            )}

        </div>

        <div class="hp-container">

            <div class="hp-header">

                <span>
                    ❤️ PS
                </span>

                <span id="hp-${pokemon.id}">
                    ${pokemon.hpActual}
                    /
                    ${pokemon.hpMax}
                </span>

            </div>

            <div class="hp-bar">

                <div
                    class="hp-fill"
                    id="hp-bar-${pokemon.id}"
                ></div>

            </div>

        </div>

        <div class="card-section">

            <h3 class="card-section-title">
                Movimientos
            </h3>

            <div class="moves-preview">

                ${
                    pokemon.movimientos
                        .map(
                            move => `
                                <div class="move-preview">

                                    <strong>
                                        ${capitalizar(
                                            move.nombre
                                        )}
                                    </strong>

                                    <span>
                                        ${
                                            TYPE_NAMES[
                                                move.tipo
                                            ]
                                            ||
                                            capitalizar(
                                                move.tipo
                                            )
                                        }

                                        ·

                                        ${move.poder}
                                    </span>

                                </div>
                            `
                        )
                        .join("")
                }

            </div>

        </div>
    `;

    actualizarBarraVida(
        container,
        pokemon
    );
}

function actualizarBarraVida(
    container,
    pokemon
) {
    const porcentaje =
        Math.max(
            0,
            Math.min(
                100,
                (
                    pokemon.hpActual /
                    pokemon.hpMax
                ) *
                100
            )
        );

    const barra =
        container.querySelector(
            ".hp-fill"
        );

    const etiqueta =
        container.querySelector(
            ".hp-header span:last-child"
        );

    if (barra) {
        barra.style.width =
            `${porcentaje}%`;
    }

    if (etiqueta) {
        etiqueta.textContent =
            `${Math.max(
                0,
                pokemon.hpActual
            )} / ${pokemon.hpMax}`;
    }
}

function elegirMovimiento(
    pokemon
) {
    if (
        !pokemon.movimientos.length
    ) {
        return {
            nombre:
                "Ataque básico",

            tipo:
                "normal",

            poder:
                40,

            precision:
                100,

            categoria:
                "physical"
        };
    }

    const movimientosConVentaja =
        pokemon.movimientos.filter(
            move => {
                const rival =
                    pokemon ===
                    battle.pokemonOne
                        ? battle.pokemonTwo
                        : battle.pokemonOne;

                return (
                    obtenerMultiplicadorTipo(
                        move.tipo,
                        rival.tipos
                    ) > 1
                );
            }
        );

    const disponibles =
        movimientosConVentaja.length
            ? movimientosConVentaja
            : pokemon.movimientos;

    return disponibles[
        Math.floor(
            Math.random() *
            disponibles.length
        )
    ];
}

function determinarOrden() {
    const uno =
        battle.pokemonOne;

    const dos =
        battle.pokemonTwo;

    if (
        uno.velocidad >
        dos.velocidad
    ) {
        return [
            uno,
            dos
        ];
    }

    if (
        dos.velocidad >
        uno.velocidad
    ) {
        return [
            dos,
            uno
        ];
    }

    return Math.random() < 0.5
        ? [uno, dos]
        : [dos, uno];
}

function aplicarEfectosEntrada(
    atacante,
    defensor
) {
    const habilidad =
        defensor.habilidad.nombre;

    if (
        habilidad ===
        "intimidate"
    ) {
        atacante.ataque =
            Math.max(
                1,
                Math.floor(
                    atacante.ataque *
                    0.67
                )
            );

        agregarLog(
            `😈 ${capitalizar(
                defensor.nombre
            )} activó Intimidación. ` +
            `El Ataque de ${capitalizar(
                atacante.nombre
            )} disminuyó.`
        );
    }
}

function calcularDanio(
    atacante,
    defensor,
    movimiento
) {
    const nivel = 50;

    const esFisico =
        movimiento.categoria ===
        "physical";

    let ataque =
        esFisico
            ? atacante.ataque
            : atacante.ataqueEspecial;

    const defensa =
        esFisico
            ? defensor.defensa
            : defensor.defensaEspecial;

    let potencia =
        movimiento.poder;

    if (
        atacante.habilidad.nombre ===
            "huge-power"
        ||
        atacante.habilidad.nombre ===
            "pure-power"
    ) {
        if (esFisico) {
            ataque *= 2;
        }
    }

    if (
        atacante.habilidad.nombre ===
            "technician"
        &&
        potencia <= 60
    ) {
        potencia *= 1.5;
    }

    const stab =
        atacante.tipos.includes(
            movimiento.tipo
        )
            ? (
                atacante.habilidad.nombre ===
                "adaptability"
                    ? 2
                    : 1.5
            )
            : 1;

    let efectividad =
        obtenerMultiplicadorTipo(
            movimiento.tipo,
            defensor.tipos
        );

    if (
        defensor.habilidad.nombre ===
            "levitate"
        &&
        movimiento.tipo ===
            "ground"
    ) {
        efectividad = 0;
    }

    if (
        defensor.habilidad.nombre ===
            "water-absorb"
        &&
        movimiento.tipo ===
            "water"
    ) {
        efectividad = 0;
    }

    if (
        defensor.habilidad.nombre ===
            "volt-absorb"
        &&
        movimiento.tipo ===
            "electric"
    ) {
        efectividad = 0;
    }

    if (
        defensor.habilidad.nombre ===
            "flash-fire"
        &&
        movimiento.tipo ===
            "fire"
    ) {
        efectividad = 0;
    }

    if (
        defensor.habilidad.nombre ===
            "thick-fat"
        &&
        (
            movimiento.tipo ===
                "fire"
            ||
            movimiento.tipo ===
                "ice"
        )
    ) {
        efectividad *= 0.5;
    }

    if (
        defensor.habilidad.nombre ===
            "filter"
        ||
        defensor.habilidad.nombre ===
            "solid-rock"
        ||
        defensor.habilidad.nombre ===
            "prism-armor"
    ) {
        if (efectividad > 1) {
            efectividad *= 0.75;
        }
    }

    if (
        atacante.habilidad.nombre ===
            "blaze"
        &&
        movimiento.tipo ===
            "fire"
        &&
        atacante.hpActual <=
            atacante.hpMax / 3
    ) {
        potencia *= 1.5;
    }

    if (
        atacante.habilidad.nombre ===
            "torrent"
        &&
        movimiento.tipo ===
            "water"
        &&
        atacante.hpActual <=
            atacante.hpMax / 3
    ) {
        potencia *= 1.5;
    }

    if (
        atacante.habilidad.nombre ===
            "overgrow"
        &&
        movimiento.tipo ===
            "grass"
        &&
        atacante.hpActual <=
            atacante.hpMax / 3
    ) {
        potencia *= 1.5;
    }

    if (
        atacante.habilidad.nombre ===
            "swarm"
        &&
        movimiento.tipo ===
            "bug"
        &&
        atacante.hpActual <=
            atacante.hpMax / 3
    ) {
        potencia *= 1.5;
    }

    if (
        defensor.habilidad.nombre ===
            "multiscale"
        &&
        defensor.hpActual ===
            defensor.hpMax
    ) {
        efectividad *= 0.5;
    }

    if (
        efectividad === 0
    ) {
        return {
            danio: 0,
            efectividad,
            critico: false,
            stab
        };
    }

    const variacion =
        0.85 +
        Math.random() * 0.15;

    const critico =
        Math.random() <
        0.0625;

    const multiplicadorCritico =
        critico
            ? 1.5
            : 1;

    let danio =
        Math.floor(
            (
                (
                    (
                        (
                            2 *
                            nivel /
                            5
                        ) +
                        2
                    ) *
                    potencia *
                    ataque /
                    Math.max(
                        1,
                        defensa
                    )
                ) /
                50
            ) +
            2
        )
        *
        stab
        *
        efectividad
        *
        variacion
        *
        multiplicadorCritico;

    danio =
        Math.max(
            1,
            danio
        );

    if (
        defensor.habilidad.nombre ===
            "sturdy"
        &&
        defensor.hpActual ===
            defensor.hpMax
        &&
        danio >=
            defensor.hpActual
    ) {
        danio =
            defensor.hpActual - 1;
    }

    return {
        danio,
        efectividad,
        critico,
        stab
    };
}

async function comenzarBatalla() {
    if (
        !battle.pokemonOne ||
        !battle.pokemonTwo
    ) {
        battleStatus.textContent =
            "⚠️ Primero selecciona los dos Pokémon.";

        return;
    }

    if (
        battle.active
    ) {
        return;
    }

    battle.active = true;
    battle.turn = 0;

    battle.pokemonOne.hpActual =
        battle.pokemonOne.hpMax;

    battle.pokemonTwo.hpActual =
        battle.pokemonTwo.hpMax;

    battleWinner.textContent =
        "";

    restartBattleButton.classList.add(
        "hidden"
    );

    startBattleButton.classList.add(
        "hidden"
    );

    battleLog.innerHTML =
        "";

    mostrarCartaLuchador(
        fighterOne,
        battle.pokemonOne
    );

    mostrarCartaLuchador(
        fighterTwo,
        battle.pokemonTwo
    );

    agregarLog(
        `⚔️ Comienza la batalla entre ${capitalizar(
            battle.pokemonOne.nombre
        )} y ${capitalizar(
            battle.pokemonTwo.nombre
        )}.`
    );

    aplicarEfectosEntrada(
        battle.pokemonOne,
        battle.pokemonTwo
    );

    aplicarEfectosEntrada(
        battle.pokemonTwo,
        battle.pokemonOne
    );

    const [
        primero,
        segundo
    ] =
        determinarOrden();

    battleStatus.textContent =
        `💨 ${capitalizar(
            primero.nombre
        )} comienza por tener mayor Velocidad.`;

    await esperar(900);

    let atacante =
        primero;

    let defensor =
        segundo;

    while (
        battle.pokemonOne.hpActual > 0 &&
        battle.pokemonTwo.hpActual > 0 &&
        battle.turn < 50
    ) {
        battle.turn++;

        await ejecutarTurno(
            atacante,
            defensor
        );

        if (
            defensor.hpActual <= 0
        ) {
            break;
        }

        [
            atacante,
            defensor
        ] =
            [
                defensor,
                atacante
            ];

        await esperar(700);
    }

    finalizarBatalla();
}

async function ejecutarTurno(
    atacante,
    defensor
) {
    const movimiento =
        elegirMovimiento(
            atacante
        );

    battleStatus.textContent =
        `⚔️ ${capitalizar(
            atacante.nombre
        )} está atacando...`;

    await esperar(500);

    agregarLog(
        `⚡ ${capitalizar(
            atacante.nombre
        )} usó ${capitalizar(
            movimiento.nombre
        )}.`
    );

    animarAtaque(
        atacante
    );

    await esperar(450);

    const resultado =
        calcularDanio(
            atacante,
            defensor,
            movimiento
        );

    if (
        resultado.efectividad ===
        0
    ) {
        agregarLog(
            `🚫 No afecta a ${capitalizar(
                defensor.nombre
            )}.`
        );

        return;
    }

    defensor.hpActual =
        Math.max(
            0,
            defensor.hpActual -
                resultado.danio
        );

    const defensorContainer =
        defensor ===
        battle.pokemonOne
            ? fighterOne
            : fighterTwo;

    actualizarBarraVida(
        defensorContainer,
        defensor
    );

    animarDanio(
        defensor
    );

    agregarLog(
        `💥 ${capitalizar(
            defensor.nombre
        )} recibió ${resultado.danio} de daño.`
    );

    if (
        resultado.critico
    ) {
        agregarLog(
            "🎯 ¡Golpe crítico!"
        );
    }

    if (
        resultado.stab > 1
    ) {
        agregarLog(
            "🔥 El movimiento recibió STAB."
        );
    }

    if (
        resultado.efectividad > 1
    ) {
        agregarLog(
            "✨ ¡Es súper efectivo!"
        );

    } else if (
        resultado.efectividad < 1
    ) {
        agregarLog(
            "🛡️ No es muy efectivo..."
        );
    }

    if (
        defensor.hpActual <= 0
    ) {
        agregarLog(
            `💀 ${capitalizar(
                defensor.nombre
            )} fue derrotado.`
        );

        defensorContainer.classList.add(
            "defeated"
        );
    }
}

function finalizarBatalla() {
    battle.active = false;

    const uno =
        battle.pokemonOne;

    const dos =
        battle.pokemonTwo;

    let ganador;

    if (
        uno.hpActual > 0 &&
        dos.hpActual <= 0
    ) {
        ganador = uno;

    } else if (
        dos.hpActual > 0 &&
        uno.hpActual <= 0
    ) {
        ganador = dos;

    } else {
        ganador =
            uno.hpActual >=
            dos.hpActual
                ? uno
                : dos;
    }

    battleStatus.textContent =
        "🏁 Batalla terminada.";

    battleWinner.innerHTML = `
        🏆 ¡${capitalizar(
            ganador.nombre
        )} GANA!
    `;

    agregarLog(
        `🏆 ${capitalizar(
            ganador.nombre
        )} ganó la batalla.`
    );

    restartBattleButton.classList.remove(
        "hidden"
    );
}

function agregarLog(
    mensaje
) {
    const elemento =
        document.createElement(
            "p"
        );

    elemento.textContent =
        mensaje;

    battleLog.appendChild(
        elemento
    );

    battleLog.scrollTop =
        battleLog.scrollHeight;
}

function animarAtaque(
    pokemon
) {
    const container =
        pokemon ===
        battle.pokemonOne
            ? fighterOne
            : fighterTwo;

    const clase =
        pokemon ===
        battle.pokemonOne
            ? "attack-left"
            : "attack-right";

    container.classList.remove(
        clase
    );

    void container.offsetWidth;

    container.classList.add(
        clase
    );

    setTimeout(
        () => {
            container.classList.remove(
                clase
            );
        },
        700
    );
}

function animarDanio(
    pokemon
) {
    const container =
        pokemon ===
        battle.pokemonOne
            ? fighterOne
            : fighterTwo;

    container.classList.remove(
        "take-damage"
    );

    void container.offsetWidth;

    container.classList.add(
        "take-damage"
    );

    setTimeout(
        () => {
            container.classList.remove(
                "take-damage"
            );
        },
        600
    );
}

function reiniciarBatalla() {
    battle.active = false;
    battle.turn = 0;

    battle.pokemonOne = null;
    battle.pokemonTwo = null;

    pokemonOneInput.value =
        "";

    pokemonTwoInput.value =
        "";

    fighterOne.innerHTML = `
        <p class="empty-fighter">
            Esperando Pokémon 1...
        </p>
    `;

    fighterTwo.innerHTML = `
        <p class="empty-fighter">
            Esperando Pokémon 2...
        </p>
    `;

    battleStatus.textContent =
        "Selecciona dos Pokémon para comenzar.";

    battleLog.innerHTML = `
        <p>
            Selecciona dos Pokémon para comenzar.
        </p>
    `;

    battleWinner.textContent =
        "";

    startBattleButton.classList.add(
        "hidden"
    );

    restartBattleButton.classList.add(
        "hidden"
    );
}

function esperar(ms) {
    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}

function configurarEventos() {
    searchForm.addEventListener(
        "submit",
        event => {
            event.preventDefault();

            buscarPokemon();
        }
    );

    battleButton.addEventListener(
        "click",
        abrirBatalla
    );

    pokemonOneButton.addEventListener(
        "click",
        () => {
            seleccionarLuchador(
                1
            );
        }
    );

    pokemonTwoButton.addEventListener(
        "click",
        () => {
            seleccionarLuchador(
                2
            );
        }
    );

    pokemonOneInput.addEventListener(
        "keydown",
        event => {
            if (
                event.key ===
                "Enter"
            ) {
                seleccionarLuchador(
                    1
                );
            }
        }
    );

    pokemonTwoInput.addEventListener(
        "keydown",
        event => {
            if (
                event.key ===
                "Enter"
            ) {
                seleccionarLuchador(
                    2
                );
            }
        }
    );

    startBattleButton.addEventListener(
        "click",
        comenzarBatalla
    );

    restartBattleButton.addEventListener(
        "click",
        reiniciarBatalla
    );
}

configurarEventos();