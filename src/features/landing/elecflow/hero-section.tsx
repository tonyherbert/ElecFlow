"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, FileText, Zap } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { CircuitBackground, ElectricGrid } from "./circuit-background";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[100vh] overflow-hidden bg-gradient-to-b from-background via-background to-primary/5"
    >
      {/* Background effects */}
      <ElectricGrid />
      <CircuitBackground />

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -right-1/4 top-1/2 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex min-h-[100vh] flex-col items-center justify-center px-6 pt-20"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
            <Zap className="size-4" />
            Simulation de circuits electriques
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl text-center text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
        >
          Verifiez la logique de vos{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              circuits electriques
            </span>
            <motion.span
              className="absolute -inset-1 -z-10 block rounded-lg bg-primary/20 blur-xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 max-w-2xl text-center text-lg text-muted-foreground sm:text-xl"
        >
          Importez vos schemas PDF, analysez automatiquement les
          protections, et simulez le comportement de vos installations en
          quelques clics.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/auth/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "group gap-2 px-8 text-base"
            )}
          >
            Commencer gratuitement
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#demo"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "gap-2 px-8 text-base backdrop-blur-sm"
            )}
          >
            <FileText className="size-4" />
            Voir la demo
          </Link>
        </motion.div>

        {/* Animated demo preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mt-16 w-full max-w-5xl"
        >
          <AnimatedCircuitDemo />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
          <span className="text-xs">Scroll</span>
          <div className="h-10 w-6 rounded-full border-2 border-current p-1">
            <motion.div
              className="h-2 w-full rounded-full bg-current"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedCircuitDemo() {
  return (
    <div className="relative rounded-2xl border border-primary/20 bg-card/50 p-1 shadow-2xl shadow-primary/10 backdrop-blur-xl">
      {/* Glowing border effect */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/50 via-primary/20 to-primary/50 opacity-50 blur-sm" />

      <div className="relative overflow-hidden rounded-xl bg-background/80">
        {/* Window header */}
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-red-500/80" />
            <div className="size-3 rounded-full bg-yellow-500/80" />
            <div className="size-3 rounded-full bg-green-500/80" />
          </div>
          <div className="ml-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="size-3.5 text-primary" />
            ElecFlow - Simulateur de circuits
          </div>
        </div>

        {/* Demo content */}
        <div className="relative aspect-[16/9] p-6">
          <CircuitSimulationPreview />
        </div>
      </div>
    </div>
  );
}

function CircuitSimulationPreview() {
  return (
    <div className="flex h-full items-center justify-center">
      <svg viewBox="0 0 600 300" className="h-full w-full max-w-2xl">
        <defs>
          <linearGradient id="power-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main circuit structure */}
        <g stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" opacity="0.3">
          {/* Main line */}
          <path d="M 50 150 L 150 150" />
          <path d="M 170 150 L 250 150 L 250 80 L 350 80" />
          <path d="M 250 150 L 250 220 L 350 220" />
          <path d="M 370 80 L 450 80" />
          <path d="M 370 220 L 450 220" />
          <path d="M 470 80 L 550 80" />
          <path d="M 470 220 L 550 220" />
        </g>

        {/* Animated power flow */}
        <g filter="url(#glow)">
          <motion.path
            d="M 50 150 L 150 150"
            stroke="url(#power-flow)"
            strokeWidth="4"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path
            d="M 170 150 L 250 150 L 250 80 L 350 80"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          />
          <motion.path
            d="M 250 150 L 250 220 L 350 220"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          />
          <motion.path
            d="M 370 80 L 550 80"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
          />
          <motion.path
            d="M 370 220 L 550 220"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
          />
        </g>

        {/* Components */}
        {/* Main breaker */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <rect
            x="145"
            y="135"
            width="30"
            height="30"
            rx="4"
            fill="hsl(var(--card))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <text
            x="160"
            y="155"
            textAnchor="middle"
            fontSize="10"
            fill="hsl(var(--primary))"
            fontWeight="bold"
          >
            Q0
          </text>
        </motion.g>

        {/* Circuit breaker 1 */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8 }}
        >
          <rect
            x="345"
            y="65"
            width="30"
            height="30"
            rx="4"
            fill="hsl(var(--card))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <text
            x="360"
            y="85"
            textAnchor="middle"
            fontSize="10"
            fill="hsl(var(--primary))"
            fontWeight="bold"
          >
            Q1
          </text>
        </motion.g>

        {/* Circuit breaker 2 */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8 }}
        >
          <rect
            x="345"
            y="205"
            width="30"
            height="30"
            rx="4"
            fill="hsl(var(--card))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <text
            x="360"
            y="225"
            textAnchor="middle"
            fontSize="10"
            fill="hsl(var(--primary))"
            fontWeight="bold"
          >
            Q2
          </text>
        </motion.g>

        {/* Receptors */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          {/* Receptor 1 */}
          <circle
            cx="470"
            cy="80"
            r="15"
            fill="hsl(142 76% 36% / 0.2)"
            stroke="hsl(142 76% 36%)"
            strokeWidth="2"
          />
          <motion.circle
            cx="470"
            cy="80"
            r="15"
            fill="none"
            stroke="hsl(142 76% 36%)"
            strokeWidth="2"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 3.2 }}
          />
          <text
            x="470"
            y="85"
            textAnchor="middle"
            fontSize="9"
            fill="hsl(142 76% 36%)"
            fontWeight="bold"
          >
            ON
          </text>

          {/* Receptor 2 */}
          <circle
            cx="470"
            cy="220"
            r="15"
            fill="hsl(142 76% 36% / 0.2)"
            stroke="hsl(142 76% 36%)"
            strokeWidth="2"
          />
          <motion.circle
            cx="470"
            cy="220"
            r="15"
            fill="none"
            stroke="hsl(142 76% 36%)"
            strokeWidth="2"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 3.4 }}
          />
          <text
            x="470"
            y="225"
            textAnchor="middle"
            fontSize="9"
            fill="hsl(142 76% 36%)"
            fontWeight="bold"
          >
            ON
          </text>
        </motion.g>

        {/* Labels */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
          fontSize="11"
          fill="hsl(var(--muted-foreground))"
        >
          <text x="550" y="85" textAnchor="start">
            Eclairage
          </text>
          <text x="550" y="225" textAnchor="start">
            Prises
          </text>
          <text x="160" y="180" textAnchor="middle">
            63A
          </text>
          <text x="360" y="110" textAnchor="middle">
            16A
          </text>
          <text x="360" y="250" textAnchor="middle">
            20A
          </text>
        </motion.g>

        {/* Status badge */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4 }}
        >
          <rect
            x="20"
            y="250"
            width="140"
            height="35"
            rx="8"
            fill="hsl(142 76% 36% / 0.1)"
            stroke="hsl(142 76% 36% / 0.3)"
            strokeWidth="1"
          />
          <circle cx="40" cy="267" r="6" fill="hsl(142 76% 36%)" />
          <text
            x="55"
            y="272"
            fontSize="12"
            fill="hsl(142 76% 36%)"
            fontWeight="500"
          >
            2/2 alimentes
          </text>
        </motion.g>
      </svg>
    </div>
  );
}
