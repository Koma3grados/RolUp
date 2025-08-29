import { useEffect, useRef, useState } from "react";

const phrases = [
  "Recargando tinta...",
  "Invocando magias arcanas...",
  "Agitando pociones...",
  "Dibujando círculos mágicos...",
  "Consultando grimorios...",
  "José nooo. Perdón, la costumbre. Desacióndose de las costumbres..."
];

const LoadingSpinner = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sparkLayerRef = useRef<HTMLDivElement>(null);
  const eRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);

  // Rotación de frases
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phrases.length;
      setCurrentPhrase(phrases[i]);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Animación electrones + chispas
  useEffect(() => {
    const wrap = wrapRef.current;
    const sparkLayer = sparkLayerRef.current;
    if (!wrap || !sparkLayer) return;

    const W = 384;
    const H = 384;
    const cx = W / 2;
    const cy = H / 2;

    const rx = 120;
    const ry = 70;
    const planeAngles = [0, 60, 120].map((d) => (d * Math.PI) / 180);
    const phase = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
    const speed = (2 * Math.PI) / 6;

    const baseSparkInterval = 90; // reducido ~20%
    const lastSpark: number[] = [0, 0, 0];

    const setElectronPos = (idx: number, x: number, y: number) => {
      const el = eRefs[idx].current;
      if (!el) return; // 👈 seguridad
      el.style.transform = `translate(${cx + x}px, ${cy + y}px) translate(-50%, -50%)`;
    };

    const spawnStar = (x: number, y: number, color: string) => {
      if (!sparkLayer) return;
      const el = document.createElement("div");
      const size = 10 * (0.9 + Math.random() * 0.2);
      el.className = "star-sparkle";
      el.style.left = `${x - size / 2}px`;
      el.style.top = `${y - size / 2}px`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.background = color;
      el.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;
      sparkLayer.appendChild(el);
      setTimeout(() => {
        el.style.opacity = "0";
      }, 10);
      setTimeout(() => {
        if (el.parentNode) sparkLayer.removeChild(el);
      }, 760); // 0.75s
    };

    const rafStart = performance.now();
    let rafId = 0;
    let running = true; // 👈 flag de seguridad

    const loop = (now: number) => {
      if (!running) return; // 👈 no continuar si desmontado
      const t = (now - rafStart) / 1000;

      for (let i = 0; i < 3; i++) {
        const theta = speed * t + phase[i];

        const x0 = rx * Math.cos(theta);
        const y0 = (ry / 2) * Math.sin(2 * theta);

        const a = planeAngles[i];
        const xr = x0 * Math.cos(a) - y0 * Math.sin(a);
        const yr = x0 * Math.sin(a) + y0 * Math.cos(a);

        setElectronPos(i, xr, yr);

        const dx = -rx * Math.sin(theta);
        const dy = ry * Math.cos(2 * theta);
        const dxr = dx * Math.cos(a) - dy * Math.sin(a);
        const dyr = dx * Math.sin(a) + dy * Math.cos(a);
        const len = Math.hypot(dxr, dyr) || 1;

        const jitter = baseSparkInterval * (0.7 + Math.random() * 0.6);
        if (now - lastSpark[i] > jitter) {
          lastSpark[i] = now;

          const back = 10 + Math.random() * 10;
          const perp = 4 * (Math.random() - 0.5);

          const nx = dxr / len;
          const ny = dyr / len;
          const px = -ny;
          const py = nx;

          const sx = cx + xr - nx * back + px * perp;
          const sy = cy + yr - ny * back + py * perp;

          const color = i === 0 ? "#ef4444" : i === 1 ? "#00aaff" : "#2dd4bf";
          spawnStar(sx, sy, color);

          if (Math.random() < 0.25) {
            const sx2 = sx + (Math.random() - 0.5) * 6;
            const sy2 = sy + (Math.random() - 0.5) * 6;
            spawnStar(sx2, sy2, color);
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      running = false;          // 👈 para el bucle
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="w-screen h-screen overflow-hidden relative bg-cover text-ink font-serif"
      style={{
        backgroundImage: "url('/Scroll.png')",
        backgroundColor: "#f5e7d0",
      }}
    >
      <div className="fixed inset-0 bg-parchment/70 z-0"></div>

      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <div ref={wrapRef} className="relative w-96 h-96">
          <div ref={sparkLayerRef} className="absolute inset-0 z-10 pointer-events-none" />

          {/* Núcleo central */}
          <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 w-20 h-20
                          bg-gradient-to-br from-orange-500 to-orange-700 rounded-full shadow-lg shadow-orange-600/60">
            <div className="absolute inset-0 bg-orange-300 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 bg-orange-200/40 rounded-full animate-ping"></div>
          </div>

          {/* Electrones sólidos con glow de su color */}
          <div ref={eRefs[0]} className="electron-dot z-20" style={{ backgroundColor: "#ef4444", boxShadow: "0 0 10px #ef4444, 0 0 20px #ef4444" }} />
          <div ref={eRefs[1]} className="electron-dot z-20" style={{ backgroundColor: "#00aaff", boxShadow: "0 0 10px #00aaff, 0 0 20px #00aaff" }} />
          <div ref={eRefs[2]} className="electron-dot z-20" style={{ backgroundColor: "#2dd4bf", boxShadow: "0 0 10px #2dd4bf, 0 0 20px #2dd4bf" }} />

          {/* Texto dinámico */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-amber-900 font-semibold text-xl transition-opacity duration-500">
            {currentPhrase}
          </div>
        </div>
      </div>

      <style>{`
        .electron-dot{
          position:absolute;
          width:16px; height:16px;
          border-radius:9999px;
          transform: translate(-50%,-50%);
          will-change: transform;
        }

        .star-sparkle{
          position:absolute;
          pointer-events:none;
          opacity:0.95;
          clip-path: polygon(
            50% 0%,
            61% 35%,
            98% 35%,
            68% 57%,
            79% 91%,
            50% 72%,
            21% 91%,
            32% 57%,
            2% 35%,
            39% 35%
          );
          transition: opacity .75s linear;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;