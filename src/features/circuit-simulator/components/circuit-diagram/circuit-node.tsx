"use client";

import { cn } from "@/lib/utils";
import { Power, PowerOff, Zap, ZapOff } from "lucide-react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type CircuitNodeData = {
  label: string;
  nodeType: "source" | "neutral" | "breaker" | "differential" | "receptor";
  isActive?: boolean;
  isPowered?: boolean;
  stateId?: string;
  onToggle?: (stateId: string) => void;
};

type CircuitNodeComponentProps = NodeProps & {
  data: CircuitNodeData;
};

export function CircuitNodeComponent({ data }: CircuitNodeComponentProps) {
  const handleClick = () => {
    if (data.stateId && data.onToggle) {
      data.onToggle(data.stateId);
    }
  };

  const isInteractive = !!data.stateId;

  // Source node (Phase)
  if (data.nodeType === "source") {
    return (
      <div className="relative">
        <Handle type="source" position={Position.Bottom} className="!bg-primary" />
        <div className="flex size-16 items-center justify-center rounded-full border-4 border-primary bg-primary/10 shadow-lg shadow-primary/20">
          <Zap className="size-8 text-primary" />
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-muted-foreground">
          {data.label}
        </div>
      </div>
    );
  }

  // Neutral node
  if (data.nodeType === "neutral") {
    return (
      <div className="relative">
        <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
        <div className="flex size-12 items-center justify-center rounded-full border-2 border-muted-foreground bg-muted shadow-md">
          <div className="size-4 rounded-full bg-muted-foreground" />
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-muted-foreground">
          {data.label}
        </div>
      </div>
    );
  }

  // Breaker/Differential (interactive)
  if (data.nodeType === "breaker" || data.nodeType === "differential") {
    const isDiff = data.nodeType === "differential";
    return (
      <div className="relative">
        <Handle type="target" position={Position.Top} className={cn(
          data.isPowered ? "!bg-powered" : "!bg-muted-foreground"
        )} />
        <button
          type="button"
          onClick={handleClick}
          disabled={!isInteractive}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 px-4 py-3 shadow-lg transition-all",
            isInteractive && "cursor-pointer hover:scale-105 active:scale-95",
            data.isActive
              ? cn(
                  "border-powered bg-powered/10 shadow-powered/20",
                  isDiff && "border-blue-500 bg-blue-500/10 shadow-blue-500/20"
                )
              : "border-muted-foreground/50 bg-muted shadow-muted-foreground/10"
          )}
        >
          <div className={cn(
            "flex size-10 items-center justify-center rounded-lg transition-colors",
            data.isActive
              ? cn(
                  "bg-powered text-powered-foreground",
                  isDiff && "bg-blue-500 text-white"
                )
              : "bg-muted-foreground/20 text-muted-foreground"
          )}>
            {data.isActive ? (
              <Power className="size-5" />
            ) : (
              <PowerOff className="size-5" />
            )}
          </div>
          <span className={cn(
            "mt-2 max-w-24 truncate text-xs font-medium",
            data.isActive
              ? isDiff ? "text-blue-600" : "text-powered"
              : "text-muted-foreground"
          )}>
            {data.label}
          </span>
          {isDiff && (
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              Différentiel
            </span>
          )}
        </button>
        <Handle type="source" position={Position.Bottom} className={cn(
          data.isPowered && data.isActive ? "!bg-powered" : "!bg-muted-foreground"
        )} />
      </div>
    );
  }

  // Receptor (final circuit) - this is the only remaining case after source, neutral, breaker, and differential
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className={cn(
        data.isPowered ? "!bg-powered" : "!bg-muted-foreground"
      )} />
      <div className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 px-4 py-3 shadow-md transition-all",
        data.isPowered
          ? "border-powered/50 bg-powered/5 shadow-powered/10"
          : "border-unpowered/50 bg-unpowered/5 shadow-unpowered/10"
      )}>
        <div className={cn(
          "flex size-10 items-center justify-center rounded-lg",
          data.isPowered
            ? "bg-powered/20"
            : "bg-unpowered/20"
        )}>
          {data.isPowered ? (
            <Zap className="size-5 text-powered" />
          ) : (
            <ZapOff className="size-5 text-unpowered" />
          )}
        </div>
        <span className={cn(
          "mt-2 max-w-28 truncate text-xs font-medium",
          data.isPowered ? "text-powered" : "text-unpowered"
        )}>
          {data.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className={cn(
        data.isPowered ? "!bg-powered" : "!bg-muted-foreground"
      )} />
    </div>
  );
}
