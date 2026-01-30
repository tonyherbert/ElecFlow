"use client";

import { motion, useInView, useScroll, useTransform } from "motion/react";
import { FileText, Cpu, Zap, CheckCircle } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Importez votre schema",
    description:
      "Glissez-deposez votre fichier PDF. Les schemas electriques sont automatiquement analyses et les composants extraits.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Analyse automatique",
    description:
      "ElecFlow extrait automatiquement tous les composants : disjoncteurs, differentiels, circuits finaux et leurs caracteristiques.",
    color: "from-violet-500 to-purple-500",
  },
  {
    number: "03",
    icon: Zap,
    title: "Simulez le circuit",
    description:
      "Basculez l'etat des protections et visualisez instantanement quels recepteurs sont alimentes ou coupes.",
    color: "from-amber-500 to-orange-500",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Verifiez la logique",
    description:
      "Identifiez les points de coupure, validez le comportement du circuit et assurez-vous de la conformite de l'installation.",
    color: "from-emerald-500 to-green-500",
  },
];

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineProgress = useTransform(scrollYProgress, [0.1, 0.8], [0, 1]);

  return (
    <section ref={containerRef} className="relative overflow-hidden py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Comment ca marche
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            De l'import a la verification, en 4 etapes simples.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border lg:block">
            <motion.div
              className="h-full w-full origin-top bg-gradient-to-b from-primary to-primary/50"
              style={{ scaleY: lineProgress }}
            />
          </div>

          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => (
              <StepCard
                key={step.number}
                step={step}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  isInView,
}: {
  step: (typeof steps)[0];
  index: number;
  isInView: boolean;
}) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={`relative flex flex-col items-center gap-8 lg:flex-row ${
        isEven ? "" : "lg:flex-row-reverse"
      }`}
    >
      {/* Content */}
      <div
        className={`flex-1 ${isEven ? "lg:pr-16 lg:text-right" : "lg:pl-16"}`}
      >
        <div
          className={`inline-flex items-center gap-3 ${
            isEven ? "lg:flex-row-reverse" : ""
          }`}
        >
          <span
            className={`bg-gradient-to-r ${step.color} bg-clip-text text-4xl font-bold text-transparent`}
          >
            {step.number}
          </span>
          <h3 className="text-2xl font-semibold">{step.title}</h3>
        </div>
        <p className="mt-4 max-w-md text-muted-foreground lg:max-w-none">
          {step.description}
        </p>
      </div>

      {/* Center icon */}
      <div className="relative z-10 flex size-20 shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-background" />
        <motion.div
          className={`relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br ${step.color}`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <step.icon className="size-7 text-white" />
        </motion.div>

        {/* Pulse effect */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-30`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        />
      </div>

      {/* Visual */}
      <div className="flex-1">
        <StepVisual step={step} index={index} />
      </div>
    </motion.div>
  );
}

function StepVisual({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  return (
    <motion.div
      className="relative aspect-video w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      viewport={{ once: true }}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5`}
      />

      {/* Content based on step */}
      <div className="flex h-full items-center justify-center p-6">
        {index === 0 && <ImportVisual />}
        {index === 1 && <AnalyzeVisual />}
        {index === 2 && <SimulateVisual />}
        {index === 3 && <VerifyVisual />}
      </div>
    </motion.div>
  );
}

function ImportVisual() {
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 px-12 py-8"
        animate={{ borderColor: ["hsl(var(--primary) / 0.5)", "hsl(var(--primary))", "hsl(var(--primary) / 0.5)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <FileText className="size-12 text-primary" />
        </motion.div>
      </motion.div>
      <span className="mt-4 text-sm text-muted-foreground">
        schema_formelec.pdf
      </span>
    </div>
  );
}

function AnalyzeVisual() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {["Q0", "Q1", "Q1.1", "Q1.2", "Q2", "Q2.1"].map((label, i) => (
        <motion.div
          key={label}
          className="flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-card px-3"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.15 }}
        >
          <Cpu className="size-4 text-primary" />
          <span className="text-sm font-medium">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function SimulateVisual() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-emerald-500" />
          <span className="text-xs">Alimente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-red-500" />
          <span className="text-xs">Coupe</span>
        </div>
      </div>
      <motion.div
        className="relative h-20 w-32 rounded-lg border border-border bg-card/50"
        animate={{}}
      >
        <motion.div
          className="absolute left-2 top-2 size-4 rounded bg-emerald-500"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-2 right-2 size-4 rounded bg-emerald-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-2 top-2 size-4 rounded"
          animate={{ backgroundColor: ["hsl(var(--destructive))", "hsl(142 76% 36%)", "hsl(var(--destructive))"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}

function VerifyVisual() {
  return (
    <div className="flex flex-col gap-3">
      {[
        { label: "Protection principale", ok: true },
        { label: "Circuits eclairage", ok: true },
        { label: "Circuits prises", ok: true },
      ].map((item, i) => (
        <motion.div
          key={item.label}
          className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2 }}
        >
          <CheckCircle className="size-5 text-emerald-500" />
          <span className="text-sm">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
