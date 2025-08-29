import { useEffect, useRef } from "react";

interface Props {
  targetRef: React.RefObject<HTMLDivElement | null>;
}

const OrbitingParticles = ({ targetRef }: Props) => {
  const sparkLayerRef = useRef<HTMLDivElement>(null);
  const eRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  useEffect(() => {
    const sparkLayer = sparkLayerRef.current;
    if (!sparkLayer) return;

    const getCenter = () => ({
      cx: window.innerWidth / 2,
      cy: window.innerHeight / 2,
    });

    const radius = 320; // Distancia desde el centro de la pantalla
    const phase = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const speed = (2 * Math.PI) / 12;

    const baseSparkInterval = 120;
    const lastSpark: number[] = [0, 0, 0, 0];

    const setElectronPos = (idx: number, x: number, y: number) => {
      const el = eRefs[idx].current;
      if (!el) return;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    const spawnStar = (x: number, y: number, color: string) => {
      const el = document.createElement("div");
      const size = 8 * (0.9 + Math.random() * 0.3);
      el.className = "star-sparkle";
      el.style.left = `${x - size / 2}px`;
      el.style.top = `${y - size / 2}px`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.background = color;
      el.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;
      sparkLayer.appendChild(el);
      setTimeout(() => (el.style.opacity = "0"), 10);
      setTimeout(() => el.remove(), 760);
    };

    const rafStart = performance.now();
    let rafId = 0;
    let running = true;

    const loop = (now: number) => {
      if (!running) return;
      const { cx, cy } = getCenter();
      const t = (now - rafStart) / 1000;

      for (let i = 0; i < 4; i++) {
        const theta = speed * t + phase[i];
        const x = cx + radius * Math.cos(theta);
        const y = cy + radius * Math.sin(theta);

        setElectronPos(i, x, y);

        const jitter = baseSparkInterval * (0.7 + Math.random() * 0.6);
        if (now - lastSpark[i] > jitter) {
          lastSpark[i] = now;
          const colors = ["#ef4444", "#00aaff", "#f97316", "#2dd4bf"];
          const color = colors[i];
          spawnStar(x, y, color);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafId);
    };
  }, [targetRef]);

  return (
    <div ref={sparkLayerRef} className="fixed inset-0 pointer-events-none z-50">
      <div ref={eRefs[0]} className="electron-dot" style={{ backgroundColor: "#ef4444", boxShadow: "0 0 10px #ef4444, 0 0 20px #ef4444" }} />
      <div ref={eRefs[1]} className="electron-dot" style={{ backgroundColor: "#00aaff", boxShadow: "0 0 10px #00aaff, 0 0 20px #00aaff" }} />
      <div ref={eRefs[2]} className="electron-dot" style={{ backgroundColor: "#f97316", boxShadow: "0 0 10px #f97316, 0 0 20px #f97316" }} />
      <div ref={eRefs[3]} className="electron-dot" style={{ backgroundColor: "#2dd4bf", boxShadow: "0 0 10px #2dd4bf, 0 0 20px #2dd4bf" }} />

      <style>{`
        .electron-dot {
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          transform: translate(-50%, -50%);
          will-change: transform;
        }
        .star-sparkle {
          position: absolute;
          pointer-events: none;
          opacity: 0.95;
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

export default OrbitingParticles;
