"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useInView } from "motion/react";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative overflow-hidden py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-primary/10" />

      {/* Animated circuit lines */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <svg className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <pattern
              id="cta-grid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Glowing orb */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="h-[400px] w-[400px] rounded-full bg-primary/30 blur-[100px]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Icon */}
          <motion.div
            className="mx-auto mb-8 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Zap className="size-10 text-white" />
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Pret a verifier vos{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              circuits ?
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Rejoignez les bureaux d'etudes qui font confiance a ElecFlow pour
            valider la logique de leurs installations electriques.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group gap-2 px-8 text-base shadow-lg shadow-primary/30"
              )}
            >
              Commencer gratuitement
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "gap-2 px-8 text-base backdrop-blur-sm"
              )}
            >
              Nous contacter
            </Link>
          </div>

          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              Essai gratuit
            </span>
            <span className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              Sans carte bancaire
            </span>
            <span className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              Support reactif
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const stats = [
    { value: "500+", label: "Schemas analyses" },
    { value: "50+", label: "Bureaux d'etudes" },
    { value: "99%", label: "Precision" },
    { value: "<2s", label: "Temps d'analyse" },
  ];

  return (
    <section ref={ref} className="border-y border-border/50 bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <motion.div
                className="text-4xl font-bold text-primary sm:text-5xl"
                initial={{ scale: 0.5 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: i * 0.1,
                }}
              >
                {stat.value}
              </motion.div>
              <div className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
