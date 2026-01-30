"use client";

import { cn } from "@/lib/utils";

type CircuitAnimationProps = {
  className?: string;
};

export function CircuitAnimation({ className }: CircuitAnimationProps) {
  return (
    <svg
      viewBox="0 0 120 80"
      className={cn("text-muted-foreground", className)}
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
    >
      {/* Main horizontal line */}
      <path
        d="M10 40 H40"
        className="stroke-current opacity-30"
      />
      <path
        d="M10 40 H40"
        className="stroke-primary animate-circuit-flow"
        style={{ animationDelay: "0s" }}
      />

      {/* Top branch */}
      <path
        d="M40 40 V20 H70"
        className="stroke-current opacity-30"
      />
      <path
        d="M40 40 V20 H70"
        className="stroke-primary animate-circuit-flow"
        style={{ animationDelay: "0.3s" }}
      />

      {/* Bottom branch */}
      <path
        d="M40 40 V60 H70"
        className="stroke-current opacity-30"
      />
      <path
        d="M40 40 V60 H70"
        className="stroke-primary animate-circuit-flow"
        style={{ animationDelay: "0.3s" }}
      />

      {/* Top component (resistor-like) */}
      <path
        d="M70 20 L73 15 L77 25 L81 15 L85 25 L89 15 L93 25 L96 20 H100"
        className="stroke-current opacity-30"
      />
      <path
        d="M70 20 L73 15 L77 25 L81 15 L85 25 L89 15 L93 25 L96 20 H100"
        className="stroke-primary animate-circuit-flow"
        style={{ animationDelay: "0.6s" }}
      />

      {/* Bottom component (resistor-like) */}
      <path
        d="M70 60 L73 55 L77 65 L81 55 L85 65 L89 55 L93 65 L96 60 H100"
        className="stroke-current opacity-30"
      />
      <path
        d="M70 60 L73 55 L77 65 L81 55 L85 65 L89 55 L93 65 L96 60 H100"
        className="stroke-primary animate-circuit-flow"
        style={{ animationDelay: "0.6s" }}
      />

      {/* Reconnection */}
      <path
        d="M100 20 V40 H110"
        className="stroke-current opacity-30"
      />
      <path
        d="M100 20 V40 H110"
        className="stroke-primary animate-circuit-flow"
        style={{ animationDelay: "0.9s" }}
      />

      <path
        d="M100 60 V40"
        className="stroke-current opacity-30"
      />
      <path
        d="M100 60 V40"
        className="stroke-primary animate-circuit-flow"
        style={{ animationDelay: "0.9s" }}
      />

      {/* Nodes */}
      <circle cx="10" cy="40" r="3" className="fill-current animate-pulse" />
      <circle cx="40" cy="40" r="2" className="fill-current opacity-50" />
      <circle cx="100" cy="20" r="2" className="fill-current opacity-50" />
      <circle cx="100" cy="60" r="2" className="fill-current opacity-50" />
      <circle cx="110" cy="40" r="3" className="fill-primary animate-node-glow" style={{ animationDelay: "1.2s" }} />

      <style>{`
        @keyframes circuit-flow {
          0% {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes node-glow {
          0%, 100% {
            opacity: 0.3;
            r: 3;
          }
          50% {
            opacity: 1;
            r: 4;
          }
        }

        .animate-circuit-flow {
          animation: circuit-flow 1s ease-out forwards;
        }

        .animate-node-glow {
          animation: node-glow 2s ease-in-out infinite;
        }
      `}</style>
    </svg>
  );
}
