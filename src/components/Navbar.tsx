"use client";

import React from "react";
import { Menu } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-600 text-sm font-bold text-white">
            S
          </div>
          <span className="font-semibold tracking-tight text-xl">Smathr</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#tools" className="hover:text-primary-600 transition">Tools</a>
          <a href="#roadmap" className="hover:text-primary-600 transition">Roadmap</a>
          <a href="#about" className="hover:text-primary-600 transition">About</a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="mailto:hello@smathr.com?subject=Tool%20suggestion"
            className="hidden rounded-lg border border-zinc-300 bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 md:inline-flex"
          >
            Submit a tool
          </a>

          {/* Mobile menu trigger (placeholder for future) */}
          <button className="md:hidden rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
