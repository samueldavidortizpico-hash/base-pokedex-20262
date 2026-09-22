import { TYPE_NAMES } from "../constants";
import { calcularEfectividadDefensiva } from "../utils/battle";

export default function TypeEffectiveness({ tipos }) {
  const { fuertes, debiles, inmunidades } = calcularEfectividadDefensiva(tipos);
  return (
    <div className="effectiveness">
      <div className="effect-box effect-strong">
        <strong>Resiste:</strong>{" "}
        {fuertes.length ? fuertes.map((t) => TYPE_NAMES[t]).join(", ") : "Ninguno"}
      </div>
      <div className="effect-box effect-weak">
        <strong>Débil contra:</strong>{" "}
        {debiles.length ? debiles.map((t) => TYPE_NAMES[t]).join(", ") : "Ninguno"}
      </div>
      {inmunidades.length > 0 && (
        <div className="effect-box effect-immune">
          <strong>Inmune a:</strong> {inmunidades.map((t) => TYPE_NAMES[t]).join(", ")}
        </div>
      )}
    </div>
  );
}
