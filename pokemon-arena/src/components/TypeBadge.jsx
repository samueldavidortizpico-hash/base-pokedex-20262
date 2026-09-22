import { TYPE_COLORS, TYPE_NAMES } from "../constants";

export default function TypeBadge({ tipo, small = false }) {
  const color = TYPE_COLORS[tipo] || "#777";
  const label = TYPE_NAMES[tipo] || tipo;
  return (
    <span
      className={`type-badge${small ? " type-badge--small" : ""}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
