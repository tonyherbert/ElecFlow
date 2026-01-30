"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  pathIndex: number;
  progress: number;
  speed: number;
};

type CircuitPath = {
  d: string;
  length: number;
};

const CIRCUIT_PATHS: CircuitPath[] = [
  // Horizontal lines
  { d: "M 0 200 L 400 200 L 400 300 L 800 300", length: 900 },
  { d: "M 200 0 L 200 150 L 600 150 L 600 400", length: 800 },
  { d: "M 0 400 L 300 400 L 300 250 L 700 250", length: 850 },
  // Vertical paths
  { d: "M 500 0 L 500 200 L 800 200", length: 500 },
  { d: "M 100 300 L 100 500 L 400 500 L 400 350", length: 650 },
  // Complex paths
  { d: "M 0 100 L 250 100 L 250 350 L 550 350 L 550 150", length: 750 },
  { d: "M 650 0 L 650 250 L 350 250 L 350 450 L 800 450", length: 900 },
  { d: "M 750 100 L 750 400 L 450 400", length: 600 },
];

function createInitialParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      id: i,
      x: 0,
      y: 0,
      pathIndex: Math.floor(Math.random() * CIRCUIT_PATHS.length),
      progress: Math.random(),
      speed: 0.001 + Math.random() * 0.002,
    });
  }
  return particles;
}

export function CircuitBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialParticles = useMemo(() => createInitialParticles(), []);
  const [particles, setParticles] = useState<Particle[]>(initialParticles);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Animation loop
    const animate = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          progress: (p.progress + p.speed) % 1,
        }))
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden opacity-30"
    >
      <svg
        viewBox="0 0 800 500"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Electric glow filter */}
          <filter id="electric-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for paths */}
          <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>

          {/* Particle gradient */}
          <radialGradient id="particle-glow">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Circuit paths */}
        {CIRCUIT_PATHS.map((path, i) => (
          <g key={i}>
            {/* Base path */}
            <motion.path
              d={path.d}
              fill="none"
              stroke="url(#circuit-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.2, ease: "easeInOut" }}
            />
            {/* Connection nodes */}
            <circle
              cx={path.d.split(" ")[1]}
              cy={path.d.split(" ")[2]}
              r="4"
              fill="hsl(var(--primary))"
              opacity="0.5"
            />
          </g>
        ))}

        {/* Animated particles (electricity) */}
        {particles.map((particle) => {
          const path = CIRCUIT_PATHS[particle.pathIndex];
          return (
            <motion.circle
              key={particle.id}
              r="3"
              fill="url(#particle-glow)"
              filter="url(#electric-glow)"
              style={{
                offsetPath: `path('${path.d}')`,
                offsetDistance: `${particle.progress * 100}%`,
              }}
            />
          );
        })}

        {/* Junction points with pulse effect */}
        {[
          [400, 200],
          [200, 150],
          [300, 400],
          [600, 150],
          [500, 200],
          [250, 350],
          [650, 250],
          [350, 450],
        ].map(([cx, cy], i) => (
          <g key={`junction-${i}`}>
            <circle
              cx={cx}
              cy={cy}
              r="6"
              fill="hsl(var(--primary))"
              opacity="0.3"
            />
            <motion.circle
              cx={cx}
              cy={cy}
              r="6"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              initial={{ r: 6, opacity: 0.8 }}
              animate={{ r: 20, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function ElectricGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated grid lines */}
      <svg className="h-full w-full opacity-[0.03]" preserveAspectRatio="none">
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Scanning line effect */}
      <motion.div
        className="absolute left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
