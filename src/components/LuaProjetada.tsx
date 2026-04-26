"use client";
import { useEffect, useRef, useState } from "react";

export default function LuaProjetada() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const CYCLE_MS = 64_000;

  useEffect(() => {
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = (now - startRef.current) % CYCLE_MS;
      setProgress(elapsed / CYCLE_MS);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const r = 45;
  const cx = 50;
  const cy = 50;

  // p=0 Nova → p=0.25 Quarto Crescente → p=0.5 Cheia → p=0.75 Quarto Minguante → p=1 Nova
  const p = progress;
  const θ = p * 2 * Math.PI;
  // x_term: onde começa a luz no equador (relativo ao centro)
  // +r=borda direita(Nova), 0=centro(Quartos), -r=borda esquerda(Cheia)
  const x_term = r * Math.cos(θ);
  const waxing = p < 0.5;
  const brightness = (1 - Math.cos(θ)) / 2; // 0=Nova, 1=Cheia

  // shadow_rx: raio horizontal da SOMBRA sobreposta
  // "a sombra desliza" sobre o disco branco
  const abs_xt = Math.abs(x_term);

  // Construção visual usando shadow overlay:
  // 1. Disco branco completo
  // 2. Retângulo escuro cobrindo metade "oposta"
  // 3. Elipse ajustando crescent vs gibbous

  // Para waxing (direita iluminada):
  //   - shadow rect cobre o lado ESQUERDO sempre
  //   - se x_term > 0 (crescente): elipse escura extra no lado direito com rx=x_term
  //     → escurece parte da direita, deixando sliver de cx+x_term até cx+r
  //   - se x_term < 0 (gibosa): elipse BRANCA no lado esquerdo com rx=abs_xt
  //     → reverte parte da sombra esquerda, formando a região iluminada maior

  // Análogo para waning (esquerda iluminada)

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "130px",
        height: "130px",
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0.55 + brightness * 0.25,
        filter: `drop-shadow(0 0 ${16 + brightness * 22}px rgba(255,248,210,${0.25 + brightness * 0.45}))`,
      }}
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <clipPath id="lua-clip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
          <radialGradient id="lua-grad" cx="55%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="75%" stopColor="rgba(220,228,255,0.35)" />
            <stop offset="100%" stopColor="rgba(190,205,255,0.22)" stopOpacity="0.6" />
          </radialGradient>

          {/* === GRADIENTES DE CRATERAS DETALHADOS === */}
          {/* Bowl principal: mais escuro no fundo, mais claro na borda (iluminada noroeste) */}
          <radialGradient id="cg-bowl" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="rgba(190,195,215,0.55)" />
            <stop offset="40%" stopColor="rgba(140,148,168,0.42)" />
            <stop offset="80%" stopColor="rgba(90,95,120,0.58)" />
            <stop offset="100%" stopColor="rgba(55,60,80,0.72)" />
          </radialGradient>
          {/* Bowl para crateras pequenas */}
          <radialGradient id="cg-sm" cx="35%" cy="32%" r="68%">
            <stop offset="0%" stopColor="rgba(200,205,222,0.48)" />
            <stop offset="55%" stopColor="rgba(145,150,170,0.36)" />
            <stop offset="100%" stopColor="rgba(75,80,105,0.60)" />
          </radialGradient>
          {/* Cratera muito fresca e brilhante — Tycho, Aristarchus */}
          <radialGradient id="cg-bright" cx="32%" cy="28%" r="70%">
            <stop offset="0%" stopColor="rgba(230,235,248,0.65)" />
            <stop offset="45%" stopColor="rgba(170,178,200,0.48)" />
            <stop offset="80%" stopColor="rgba(100,105,130,0.55)" />
            <stop offset="100%" stopColor="rgba(60,65,88,0.68)" />
          </radialGradient>
          {/* Piso escuro (Plato, Grimaldi) */}
          <radialGradient id="cg-dark" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(60,65,85,0.55)" />
            <stop offset="70%" stopColor="rgba(45,50,70,0.48)" />
            <stop offset="100%" stopColor="rgba(35,38,58,0.62)" />
          </radialGradient>
          {/* Mare: planícies escuras basálticas */}
          <radialGradient id="mare-grad" cx="45%" cy="42%" r="62%">
            <stop offset="0%" stopColor="rgba(65,72,100,0.32)" />
            <stop offset="60%" stopColor="rgba(50,56,80,0.25)" />
            <stop offset="100%" stopColor="rgba(38,42,62,0.18)" />
          </radialGradient>
          {/* Sombra interior da cratera (lado anti-solar, canto inferior-direito) */}
          <radialGradient id="cg-shadow" cx="70%" cy="72%" r="55%">
            <stop offset="0%" stopColor="rgba(20,22,35,0.65)" />
            <stop offset="100%" stopColor="rgba(20,22,35,0)" />
          </radialGradient>
        </defs>
        <style>{`
          @keyframes luarPulse {
            0%   { opacity: 0; }
            10%  { opacity: 0.18; }
            40%  { opacity: 0; }
            100% { opacity: 0; }
          }
          .lua-flash { animation: luarPulse 7s ease-in-out infinite; }
        `}</style>

        {/* Borda mínima de luz (Halo Neon) */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={r + 0.4} 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.6)" 
          strokeWidth="0.3" 
          style={{ filter: 'drop-shadow(0 0 4px #fff)' }} 
        />

        <g clipPath="url(#lua-clip)">
          {/* 1. Base: disco branco */}
          <circle cx={cx} cy={cy} r={r} fill="url(#lua-grad)" />

          {/* === MARES — planícies basálticas com borda esfumada === */}
          <ellipse cx={41} cy={34} rx={14} ry={12} fill="url(#mare-grad)" />
          <ellipse cx={41} cy={34} rx={14} ry={12} fill="none" stroke="rgba(80,90,120,0.18)" strokeWidth="1.5" />
          <ellipse cx={57} cy={33} rx={9} ry={8} fill="url(#mare-grad)" />
          <ellipse cx={57} cy={33} rx={9} ry={8} fill="none" stroke="rgba(80,90,120,0.15)" strokeWidth="1" />
          <ellipse cx={61} cy={44} rx={10} ry={8} fill="url(#mare-grad)" />
          <ellipse cx={70} cy={30} rx={5} ry={4} fill="url(#mare-grad)" />
          <ellipse cx={35} cy={48} rx={11} ry={17} fill="url(#mare-grad)" opacity={0.75} />
          <ellipse cx={43} cy={61} rx={8} ry={6} fill="url(#mare-grad)" />

          {/* === TYCHO — crateta mais brilhante, sul prominent === */}
          {/* Ejecta halo */}
          <circle cx={44} cy={68} r={8} fill="rgba(210,215,230,0.07)" />
          {/* Raios de ejecta — linhas sutis irradiando de Tycho */}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((ang, i) => {
            const rad = ang * Math.PI / 180;
            return <line key={i}
              x1={44 + Math.cos(rad) * 5} y1={68 + Math.sin(rad) * 5}
              x2={44 + Math.cos(rad) * 14} y2={68 + Math.sin(rad) * 14}
              stroke="rgba(220,225,240,0.12)" strokeWidth="0.4"
            />;
          })}
          {/* Bowl */}
          <circle cx={44} cy={68} r={4.5} fill="url(#cg-bright)" />
          {/* Sombra interior (canto inferior-direito) */}
          <ellipse cx={45.5} cy={69.5} rx={3.2} ry={2.8} fill="url(#cg-shadow)" />
          {/* Rim externo */}
          <circle cx={44} cy={68} r={4.5} fill="none" stroke="rgba(235,240,255,0.30)" strokeWidth="0.7" />
          {/* Rim highlight noroeste */}
          <path d="M 40.8,65.2 A 4.5,4.5 0 0 1 46.2,65.2" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" strokeLinecap="round" />
          {/* Pico central */}
          <circle cx={44} cy={67.8} r={0.9} fill="rgba(245,248,255,0.50)" />

          {/* === COPERNICUS — centro, complexa com terraços === */}
          <circle cx={36} cy={50} r={5.5} fill="rgba(190,195,215,0.07)" />
          <circle cx={36} cy={50} r={3.8} fill="url(#cg-bowl)" />
          <ellipse cx={37.2} cy={51.2} rx={2.6} ry={2.3} fill="url(#cg-shadow)" />
          <circle cx={36} cy={50} r={3.8} fill="none" stroke="rgba(225,230,248,0.28)" strokeWidth="0.7" />
          <path d="M 33,47.5 A 3.8,3.8 0 0 1 38.5,47" fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="0.8" strokeLinecap="round" />
          {/* Terraços interiores */}
          <circle cx={36} cy={50} r={2.2} fill="none" stroke="rgba(180,185,205,0.25)" strokeWidth="0.4" />
          {/* Pico central */}
          <circle cx={35.8} cy={49.8} r={0.7} fill="rgba(240,243,255,0.45)" />

          {/* === KEPLER — oeste, brilhante === */}
          <circle cx={30} cy={49} r={2.5} fill="url(#cg-bright)" />
          <ellipse cx={31} cy={50} rx={1.7} ry={1.5} fill="url(#cg-shadow)" />
          <circle cx={30} cy={49} r={2.5} fill="none" stroke="rgba(220,225,245,0.25)" strokeWidth="0.6" />
          <path d="M 27.9,47.4 A 2.5,2.5 0 0 1 31.5,47" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.7" strokeLinecap="round" />

          {/* === PLATO — norte, piso escuro liso === */}
          <ellipse cx={42} cy={27} rx={4.2} ry={3.2} fill="url(#cg-dark)" />
          <ellipse cx={42} cy={27} rx={4.2} ry={3.2} fill="none" stroke="rgba(200,205,225,0.30)" strokeWidth="0.7" />
          <path d="M 38.5,25.0 A 4.2,3.2 0 0 1 45,25.8" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="0.7" strokeLinecap="round" />
          {/* Crateras secundárias dentro de Plato */}
          <circle cx={41} cy={26.5} r={0.7} fill="none" stroke="rgba(160,165,185,0.30)" strokeWidth="0.3" />
          <circle cx={43.5} cy={28} r={0.5} fill="none" stroke="rgba(160,165,185,0.25)" strokeWidth="0.3" />

          {/* === ARISTARCHUS — noroeste, mais brilhante da lua === */}
          {/* Plateau de Aristarchus (brilhante ao redor) */}
          <circle cx={27} cy={42} r={4.5} fill="rgba(220,228,248,0.10)" />
          <circle cx={27} cy={42} r={2.2} fill="url(#cg-bright)" />
          <ellipse cx={28} cy={43} rx={1.5} ry={1.3} fill="url(#cg-shadow)" />
          <circle cx={27} cy={42} r={2.2} fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth="0.7" />
          <path d="M 25.2,40.5 A 2.2,2.2 0 0 1 28.5,40.2" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.9" strokeLinecap="round" />
          {/* Herodotus ao lado */}
          <circle cx={25} cy={41} r={1.5} fill="url(#cg-sm)" />
          <circle cx={25} cy={41} r={1.5} fill="none" stroke="rgba(200,205,225,0.22)" strokeWidth="0.4" />

          {/* === CLAVIUS — sul, muito grande, cadeia interna === */}
          <circle cx={40} cy={76} r={6.0} fill="url(#cg-sm)" opacity={0.80} />
          <ellipse cx={41.5} cy={77.5} rx={4.2} ry={3.8} fill="url(#cg-shadow)" opacity={0.6} />
          <circle cx={40} cy={76} r={6.0} fill="none" stroke="rgba(215,220,240,0.25)" strokeWidth="0.8" />
          <path d="M 35.5,72.2 A 6,6 0 0 1 44.2,72.5" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="0.7" strokeLinecap="round" />
          {/* Cadeia de crateras dentro de Clavius */}
          <circle cx={42} cy={74} r={1.6} fill="url(#cg-sm)" />
          <circle cx={42} cy={74} r={1.6} fill="none" stroke="rgba(190,195,215,0.25)" strokeWidth="0.3" />
          <circle cx={44} cy={75.5} r={1.2} fill="url(#cg-sm)" />
          <circle cx={44} cy={75.5} r={1.2} fill="none" stroke="rgba(190,195,215,0.22)" strokeWidth="0.3" />
          <circle cx={45.5} cy={77.2} r={0.9} fill="url(#cg-sm)" />
          <circle cx={38.5} cy={77.5} r={1.0} fill="url(#cg-sm)" />

          {/* === THEOPHILUS — leste, com pico central proeminente === */}
          <circle cx={58} cy={53} r={2.8} fill="url(#cg-bowl)" />
          <ellipse cx={59} cy={54} rx={2.0} ry={1.7} fill="url(#cg-shadow)" />
          <circle cx={58} cy={53} r={2.8} fill="none" stroke="rgba(215,220,240,0.28)" strokeWidth="0.6" />
          <path d="M 55.8,51.4 A 2.8,2.8 0 0 1 60,51.2" fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth="0.7" strokeLinecap="round" />
          <circle cx={57.8} cy={52.8} r={0.55} fill="rgba(240,243,255,0.50)" />

          {/* === GRIMALDI — extremo oeste, piso escuro === */}
          <ellipse cx={22} cy={51} rx={4.2} ry={3.8} fill="url(#cg-dark)" opacity={0.90} />
          <ellipse cx={22} cy={51} rx={4.2} ry={3.8} fill="none" stroke="rgba(180,185,210,0.22)" strokeWidth="0.6" />

          {/* === ALBATEGNIUS — sul central, grande e degradado === */}
          <circle cx={52} cy={64} r={3.5} fill="url(#cg-bowl)" opacity={0.85} />
          <ellipse cx={53.2} cy={65.2} rx={2.4} ry={2.1} fill="url(#cg-shadow)" />
          <circle cx={52} cy={64} r={3.5} fill="none" stroke="rgba(205,210,230,0.22)" strokeWidth="0.6" />
          <path d="M 49.2,62.0 A 3.5,3.5 0 0 1 54.8,62.2" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="0.6" strokeLinecap="round" />
          {/* Crateras menores adjacentes */}
          <circle cx={55} cy={62} r={1.2} fill="url(#cg-sm)" />
          <circle cx={55} cy={62} r={1.2} fill="none" stroke="rgba(190,195,215,0.22)" strokeWidth="0.35" />

          {/* === CRATERAS MENORES ESPALHADAS === */}
          {[
            {cx:55,cy:28,r:1.4},{cx:63,cy:56,r:1.1},{cx:48,cy:38,r:1.0},
            {cx:34,cy:62,r:1.2},{cx:67,cy:42,r:1.4},{cx:46,cy:80,r:1.1},
            {cx:32,cy:37,r:0.9},{cx:65,cy:67,r:1.0},{cx:53,cy:44,r:0.8},
            {cx:29,cy:55,r:0.9},{cx:72,cy:50,r:1.0},{cx:38,cy:84,r:1.2},
          ].map((c, i) => (
            <g key={i}>
              <circle cx={c.cx} cy={c.cy} r={c.r} fill="url(#cg-sm)" />
              <ellipse cx={c.cx + c.r*0.3} cy={c.cy + c.r*0.3} rx={c.r*0.7} ry={c.r*0.6} fill="url(#cg-shadow)" />
              <circle cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke="rgba(220,225,245,0.22)" strokeWidth="0.3" />
              <path
                d={`M ${c.cx - c.r*0.8},${c.cy - c.r*0.5} A ${c.r},${c.r} 0 0 1 ${c.cx + c.r*0.6},${c.cy - c.r*0.7}`}
                fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="0.35" strokeLinecap="round"
              />
            </g>
          ))}


          {/* 2. Sombra principal — semi-transparente para efeito de vidro */}
          {waxing ? (
            <rect x={cx - r} y={cy - r} width={r} height={r * 2} fill="rgba(0,0,0,0.45)" />
          ) : (
            <rect x={cx} y={cy - r} width={r} height={r * 2} fill="rgba(0,0,0,0.45)" />
          )}

          {/* 3. Elipse de ajuste para crescent/gibbous */}
          {abs_xt > 0.5 && (waxing ? (
            x_term > 0 ? (
              <ellipse cx={cx} cy={cy} rx={abs_xt} ry={r - 0.5} fill="rgba(0,0,0,0.45)" />
            ) : (
              <ellipse cx={cx} cy={cy} rx={abs_xt} ry={r - 0.5} fill="url(#lua-grad)" />
            )
          ) : (
            x_term < 0 ? (
              <ellipse cx={cx} cy={cy} rx={abs_xt} ry={r - 0.5} fill="rgba(0,0,0,0.45)" />
            ) : (
              <ellipse cx={cx} cy={cy} rx={abs_xt} ry={r - 0.5} fill="url(#lua-grad)" />
            )
          ))}

          {/* Borda sutil */}
          <circle cx={cx} cy={cy} r={r - 0.5} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* === CRATERAS FANTASMA — visíveis sempre, em toda a superfície === */}
          <g opacity={0.35}>
            <ellipse cx={41} cy={34} rx={13} ry={11} fill="url(#mare-grad)" />
            <ellipse cx={57} cy={34} rx={9} ry={8} fill="url(#mare-grad)" />
            <ellipse cx={61} cy={44} rx={10} ry={8} fill="url(#mare-grad)" />
            <ellipse cx={70} cy={30} rx={5} ry={4} fill="url(#mare-grad)" />
            <ellipse cx={35} cy={48} rx={10} ry={16} fill="url(#mare-grad)" />
            <ellipse cx={43} cy={61} rx={8} ry={6} fill="url(#mare-grad)" />
            <circle cx={44} cy={68} r={4.5} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.7" />
            <circle cx={36} cy={50} r={3.8} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
            <circle cx={30} cy={49} r={2.5} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" />
            <ellipse cx={42} cy={27} rx={4} ry={3} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" />
            <circle cx={27} cy={42} r={2.2} fill="rgba(255,255,255,0.3)" />
            <circle cx={40} cy={76} r={5.5} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <circle cx={58} cy={53} r={2.8} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
            <ellipse cx={22} cy={51} rx={4} ry={3.5} fill="rgba(80,90,120,0.4)" />
            <circle cx={52} cy={64} r={3.2} fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="0.4" />
            <circle cx={55} cy={28} r={1.2} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" />
            <circle cx={63} cy={56} r={1.0} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" />
            <circle cx={48} cy={38} r={0.9} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
            <circle cx={34} cy={62} r={1.1} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
            <circle cx={67} cy={42} r={1.3} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" />
            <circle cx={46} cy={80} r={1.0} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
            <circle cx={32} cy={37} r={0.8} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          </g>

          {/* === FLASH A CADA 7s — ilumina sutilmente o cinza → branco === */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="rgba(255,255,255,1)"
            className="lua-flash"
          />

        </g>

        {/* Halo lunar externo */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 5}
          fill="none"
          stroke={`rgba(255,248,200,${brightness * 0.2})`}
          strokeWidth="10"
          style={{ filter: "blur(8px)" }}
        />
      </svg>
    </div>
  );
}
