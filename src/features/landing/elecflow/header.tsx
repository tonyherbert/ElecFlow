"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteConfig } from "@/site-config";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthButtonClient } from "@/features/auth/auth-button-client";

function useBoundedScroll(threshold: number) {
  const { scrollY } = useScroll();
  const scrollYBounded = useMotionValue(0);
  const scrollYBoundedProgress = useTransform(
    scrollYBounded,
    [0, threshold],
    [0, 1]
  );

  useEffect(() => {
    const onChange = (current: number) => {
      const previous = scrollY.getPrevious() ?? 0;
      const diff = current - previous;
      const newScrollYBounded = scrollYBounded.get() + diff;

      scrollYBounded.set(clamp(newScrollYBounded, 0, threshold));
    };

    const deleteEvent = scrollY.on("change", onChange);

    const listener = () => {
      const currentScroll = window.scrollY;
      onChange(currentScroll);
    };

    window.addEventListener("scroll", listener);

    return () => {
      deleteEvent();
      window.removeEventListener("scroll", listener);
    };
  }, [threshold, scrollY, scrollYBounded]);

  return { scrollYBounded, scrollYBoundedProgress };
}

const clamp = (number: number, min: number, max: number) =>
  Math.min(Math.max(number, min), max);

export function ElecFlowHeader() {
  const { scrollYBoundedProgress } = useBoundedScroll(400);
  const router = useRouter();

  const scrollYBoundedProgressDelayed = useTransform(
    scrollYBoundedProgress,
    [0, 0.75, 1],
    [0, 0, 1]
  );

  const backgroundOpacity = useTransform(
    scrollYBoundedProgress,
    [0, 0.5],
    [0, 1]
  );

  return (
    <motion.header
      style={{
        height: useTransform(scrollYBoundedProgressDelayed, [0, 1], [80, 60]),
      }}
      className="fixed inset-x-0 z-50 flex h-20 w-screen"
    >
      {/* Background with blur */}
      <motion.div
        className="absolute inset-0 border-b border-border/50 bg-background/80 backdrop-blur-xl"
        style={{ opacity: backgroundOpacity }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            router.push("/");
          }}
        >
          <motion.div
            className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="size-5 text-white" />
          </motion.div>
          <motion.span
            style={{
              scale: useTransform(
                scrollYBoundedProgressDelayed,
                [0, 1],
                [1, 0.9]
              ),
            }}
            className="text-xl font-bold"
          >
            {SiteConfig.title}
          </motion.span>
        </Link>

        {/* Navigation */}
        <motion.nav
          style={{
            opacity: useTransform(
              scrollYBoundedProgressDelayed,
              [0, 1],
              [1, 0]
            ),
          }}
          className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex"
        >
          <Link
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Fonctionnalites
          </Link>
          <Link
            href="#pricing"
            className="transition-colors hover:text-foreground"
          >
            Tarifs
          </Link>
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Documentation
          </Link>
        </motion.nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <AuthButtonClient />
          <Link
            href="/auth/signup"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden sm:inline-flex"
            )}
          >
            Commencer
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
