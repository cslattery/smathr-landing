"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { Tool } from "@/data/tools";
import { ExternalLink, ArrowRight } from "lucide-react";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  // Dynamically resolve lucide icon by name from the data file
  const IconComponent =
    (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
      tool.icon
    ] || LucideIcons.HelpCircle;

  const isExternal = tool.isExternal || tool.href.startsWith("http");

  const statusBadge = {
    live: <span className="badge badge-live">Live</span>,
    beta: <span className="badge badge-beta">Beta</span>,
    soon: <span className="badge badge-soon">Coming soon</span>,
  }[tool.status];

  return (
    <div className="tool-card group flex h-full flex-col rounded-xl p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
          <IconComponent className="h-5 w-5" />
        </div>
        {statusBadge}
      </div>

      <h3 className="mb-2 text-lg font-semibold tracking-tight">{tool.name}</h3>
      <p className="mb-4 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
        {tool.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tool.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <a
        href={tool.href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {tool.status === "soon" ? "Learn more" : "Launch tool"}
        {isExternal ? (
          <ExternalLink className="h-3.5 w-3.5" />
        ) : (
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        )}
      </a>
    </div>
  );
}
