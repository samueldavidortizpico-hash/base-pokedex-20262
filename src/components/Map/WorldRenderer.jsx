import { memo } from "react";
import { TILE } from "../../data/maps";

function EnvironmentLayer({ habitat }) {
  return <div className={`world-layer environment-layer environment-${habitat}`} aria-hidden="true"><div className="environment-horizon" /><div className="environment-glow" /></div>;
}

/** Pokemon de ambiente. El que esta al alcance se marca para que se note. */
function PokemonSpawner({ habitat, salvajes, cercaId }) {
  return <div className="world-layer pokemon-layer">{salvajes.map((p, i) => <img key={p.key} src={p.sprite} alt={p.nombre} className={`world-pokemon world-pokemon-${habitat}${p.key === cercaId ? " world-pokemon--cerca" : ""}`} style={{ left: `${p.x * TILE}px`, top: `${p.y * TILE}px`, animationDelay: `${i * -0.7}s` }} loading="lazy" />)}</div>;
}

function EffectsLayer({ habitat }) {
  return <div className={`world-layer effects-layer effects-${habitat}`} aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 23) % 100}%`, top: `${(i * 41) % 100}%`, animationDelay: `${i * -0.37}s` }} />)}</div>;
}

function WorldRenderer({ mapa, salvajes, cercaId, children }) {
  return <div className={`world-renderer world-${mapa.habitat}`}>
    <EnvironmentLayer habitat={mapa.habitat} />
    <PokemonSpawner habitat={mapa.habitat} salvajes={salvajes} cercaId={cercaId} />
    <EffectsLayer habitat={mapa.habitat} />
    {children}
  </div>;
}

export default memo(WorldRenderer);
