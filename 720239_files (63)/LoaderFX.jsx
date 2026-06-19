import { useMemo } from "react";

/**
 * LoaderFX — reusable, purely-decorative ambient effects for the processing
 * loaders. Everything here is pointer-events:none and absolutely positioned,
 * so it can be dropped inside any `relative overflow-hidden` container without
 * affecting layout or interaction.
 */

/* ── Drifting aurora backdrop ──────────────────────────────────────────────
 * Three slowly-drifting, blurred colour blobs (emerald / cyan / violet) that
 * give the card a living, premium background glow. */
export function AuroraBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="fx-aurora-blob"
        style={{ width: 360, height: 360, top: "-30%", right: "-12%",
                 background: "radial-gradient(circle, rgba(16,185,129,.30), transparent 70%)",
                 animationDelay: "0s" }}
      />
      <div
        className="fx-aurora-blob"
        style={{ width: 340, height: 340, bottom: "-32%", left: "-14%",
                 background: "radial-gradient(circle, rgba(34,211,238,.26), transparent 70%)",
                 animationDelay: "-7s", animationDuration: "26s" }}
      />
      <div
        className="fx-aurora-blob"
        style={{ width: 240, height: 240, top: "30%", left: "40%",
                 background: "radial-gradient(circle, rgba(139,92,246,.16), transparent 70%)",
                 animationDelay: "-13s", animationDuration: "32s" }}
      />
    </div>
  );
}

/* ── Rising particle field ─────────────────────────────────────────────────
 * Tiny emerald motes that drift upward and fade — gives the sense of active
 * computation. `count` and `tint` are configurable. */
export function ParticleField({ count = 18, tint = "16,185,129" }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        bottom: Math.random() * 30,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 6,
        opacity: 0.25 + Math.random() * 0.5,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="fx-spark absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: p.size,
            height: p.size,
            background: `rgba(${tint}, ${p.opacity})`,
            boxShadow: `0 0 ${p.size * 2.5}px rgba(${tint}, ${p.opacity})`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Orbiting sparks ───────────────────────────────────────────────────────
 * A ring of dots that slowly orbits a centre point — wraps nicely around the
 * robot arena or the neural brain. Renders as two counter-rotating rings. */
export function OrbitSparks({ size = 240, dots = 6 }) {
  const ring = (radiusPct, n, cls, dur, color) =>
    Array.from({ length: n }).map((_, i) => {
      const angle = (i / n) * Math.PI * 2;
      const r = (size / 2) * radiusPct;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      return (
        <span
          key={`${cls}-${i}`}
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "50%",
            width: 4,
            height: 4,
            marginLeft: -2,
            marginTop: -2,
            transform: `translate(${x}px, ${y}px)`,
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      );
    });

  return (
    <div
      className="absolute pointer-events-none"
      style={{ width: size, height: size, left: "50%", top: "50%",
               marginLeft: -size / 2, marginTop: -size / 2 }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 fx-spin-slow" style={{ transformOrigin: "50% 50%" }}>
        {ring(0.92, dots, "outer", 16, "rgba(52,211,153,.8)")}
      </div>
      <div className="absolute inset-0 fx-spin-rev" style={{ transformOrigin: "50% 50%" }}>
        {ring(0.66, Math.max(3, dots - 2), "inner", 24, "rgba(34,211,238,.7)")}
      </div>
    </div>
  );
}

export default { AuroraBackdrop, ParticleField, OrbitSparks };
