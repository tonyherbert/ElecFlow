"use client";

import { motion, useInView } from "motion/react";
import { FileUp, GitBranch, Play, Shield, Zap, Clock } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: FileUp,
    title: "Import PDF",
    description:
      "Glissez-deposez vos schemas electriques en PDF. L'extraction des composants est automatique.",
    color: "from-blue-500 to-cyan-500",
    demo: ImportDemo,
  },
  {
    icon: GitBranch,
    title: "Analyse automatique",
    description:
      "Detection des disjoncteurs, differentiels et circuits finaux. Structure hierarchique complete.",
    color: "from-violet-500 to-purple-500",
    demo: AnalysisDemo,
  },
  {
    icon: Play,
    title: "Simulation instantanee",
    description:
      "Basculez les protections et visualisez en temps reel quels recepteurs sont alimentes.",
    color: "from-emerald-500 to-green-500",
    demo: SimulationDemo,
  },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32" id="features">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Zap className="size-4" />
            Fonctionnalites
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            De l'import a la simulation, ElecFlow simplifie la verification de
            vos installations electriques.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Additional features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <MiniFeature
            icon={Shield}
            title="Normes NF C 15-100"
            description="Conformite avec les normes electriques francaises"
          />
          <MiniFeature
            icon={Clock}
            title="Historique des versions"
            description="Suivez l'evolution de vos schemas dans le temps"
          />
          <MiniFeature
            icon={Zap}
            title="Resultat instantane"
            description="Identifiez immediatement les points de coupure"
          />
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  isInView,
}: {
  feature: (typeof features)[0];
  index: number;
  isInView: boolean;
}) {
  const Demo = feature.demo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`}
        />
      </div>

      {/* Demo area */}
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border/50 bg-muted/30">
        <Demo />
      </div>

      {/* Content */}
      <div className="relative p-6">
        <div
          className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3`}
        >
          <feature.icon className="size-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold">{feature.title}</h3>
        <p className="mt-2 text-muted-foreground">{feature.description}</p>
      </div>
    </motion.div>
  );
}

function MiniFeature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Demo components for each feature
function ImportDemo() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <motion.div
        className="relative flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5"
        whileHover={{ borderColor: "hsl(var(--primary))" }}
      >
        {/* Animated file dropping */}
        <motion.div
          className="absolute"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 2,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-red-500/20 p-3">
              <FileUp className="size-8 text-red-500" />
            </div>
            <span className="mt-2 text-sm font-medium text-muted-foreground">
              schema.pdf
            </span>
          </div>
        </motion.div>

        {/* Drop zone text */}
        <motion.span
          className="absolute bottom-4 text-xs text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Glissez un fichier PDF ici
        </motion.span>
      </motion.div>
    </div>
  );
}

function AnalysisDemo() {
  const treeNodes = [
    { id: "Q0", level: 0, label: "Q0 - 63A", x: 100 },
    { id: "Q1", level: 1, label: "Q1 - 30mA", x: 50 },
    { id: "Q2", level: 1, label: "Q2 - 30mA", x: 150 },
    { id: "Q1.1", level: 2, label: "Q1.1 - 16A", x: 30 },
    { id: "Q1.2", level: 2, label: "Q1.2 - 20A", x: 70 },
    { id: "Q2.1", level: 2, label: "Q2.1 - 10A", x: 130 },
    { id: "Q2.2", level: 2, label: "Q2.2 - 16A", x: 170 },
  ];

  return (
    <div className="flex h-full items-center justify-center p-4">
      <svg viewBox="0 0 200 150" className="h-full w-full">
        {/* Connection lines */}
        <motion.g
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        >
          <motion.path
            d="M 100 25 L 100 40 L 50 40 L 50 55"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
          <motion.path
            d="M 100 25 L 100 40 L 150 40 L 150 55"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
          <motion.path
            d="M 50 75 L 50 90 L 30 90 L 30 105"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          />
          <motion.path
            d="M 50 75 L 50 90 L 70 90 L 70 105"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          />
          <motion.path
            d="M 150 75 L 150 90 L 130 90 L 130 105"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          />
          <motion.path
            d="M 150 75 L 150 90 L 170 90 L 170 105"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          />
        </motion.g>

        {/* Nodes */}
        {treeNodes.map((node) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: node.level * 0.5 + 0.2, duration: 0.3 }}
          >
            <rect
              x={node.x - 25}
              y={node.level * 50 + 10}
              width="50"
              height="20"
              rx="4"
              fill="hsl(var(--card))"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
            />
            <text
              x={node.x}
              y={node.level * 50 + 24}
              textAnchor="middle"
              fontSize="7"
              fill="hsl(var(--foreground))"
              fontWeight="500"
            >
              {node.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

function SimulationDemo() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex flex-col gap-4">
        {/* Toggle switches */}
        {[
          { label: "Q1 - Eclairage", on: true },
          { label: "Q2 - Prises", on: false },
          { label: "Q3 - Chauffage", on: true },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-center justify-between gap-8"
          >
            <span className="text-sm font-medium">{item.label}</span>
            <motion.div
              className={`relative h-6 w-11 rounded-full ${
                item.on ? "bg-primary" : "bg-muted"
              }`}
              animate={
                item.on
                  ? {}
                  : {
                      backgroundColor: ["hsl(var(--muted))", "hsl(var(--primary))", "hsl(var(--muted))"],
                    }
              }
              transition={{ duration: 2, repeat: Infinity, delay: 1 + i * 0.5 }}
            >
              <motion.div
                className="absolute top-1 size-4 rounded-full bg-white shadow-sm"
                animate={
                  item.on
                    ? { left: 24 }
                    : { left: [4, 24, 4] }
                }
                transition={
                  item.on
                    ? {}
                    : { duration: 2, repeat: Infinity, delay: 1 + i * 0.5 }
                }
              />
            </motion.div>
          </motion.div>
        ))}

        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-xs font-medium text-emerald-500"
        >
          2/3 circuits alimentes
        </motion.div>
      </div>
    </div>
  );
}
