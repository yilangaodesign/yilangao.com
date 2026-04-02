"use client";

import { useState } from "react";
import Check from "lucide-react/dist/esm/icons/check";
import Copy from "lucide-react/dist/esm/icons/copy";

export function ColorSwatch({
  color,
  label,
  sublabel,
}: {
  color: string;
  label: string;
  sublabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      className="group text-left w-[52px] p-0.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className="h-12 w-12 rounded-sm border border-border/50 relative overflow-hidden transition-transform group-hover:scale-105"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          {copied ? (
            <Check className="w-3.5 h-3.5 text-white" />
          ) : (
            <Copy className="w-3 h-3 text-white" />
          )}
        </div>
      </div>
      <p className="mt-1 text-[10px] font-medium truncate">{label}</p>
      {sublabel && (
        <p className="text-[9px] text-muted-foreground font-mono truncate">{sublabel}</p>
      )}
    </button>
  );
}

export function TokenRow({
  label,
  value,
  token,
  preview,
}: {
  label: string;
  value: string;
  token: string;
  preview?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      className="group flex items-center gap-4 w-full px-4 py-3 text-left rounded-sm hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
    >
      {preview && <div className="shrink-0 hidden sm:block">{preview}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{token}</p>
      </div>
      <div className="text-xs font-mono text-muted-foreground tabular-nums shrink-0">{value}</div>
      <div className="w-5 shrink-0">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </button>
  );
}

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="mt-2 text-muted-foreground leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export function SubSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="mb-12 scroll-mt-24">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
