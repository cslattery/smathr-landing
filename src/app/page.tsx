"use client";

import React, { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ToolFilters } from "@/components/ToolFilters";
import { ToolCard } from "@/components/ToolCard";
import { tools, ToolCategory, categories } from "@/data/tools";

export default function SmathrLanding() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "All">("All");

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        activeCategory === "All" || tool.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="border-b border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-6">
            <Hero />
          </div>
        </section>

        {/* Tools Directory */}
        <section id="tools" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">All tools</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Everything you need for daily data work — right in your browser.
            </p>
          </div>

          <ToolFilters
            search={search}
            setSearch={setSearch}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-12 text-center text-zinc-500 dark:border-zinc-800">
              No tools match your search. Try a different term or category.
            </div>
          )}

          <div className="mt-10 text-center text-xs text-zinc-500 dark:text-zinc-500">
            New tools added regularly. Missing something?{" "}
            <a href="mailto:hello@smathr.com?subject=Tool%20request" className="underline hover:text-primary-600">
              Let us know
            </a>
            .
          </div>

          {/* CLI teaser */}
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-white">Smathr CLI is now available</span> — built first for AI agents.
              Use the same tools from your terminal with excellent structured output.
            </p>
            <a
              href="/cli"
              className="mt-3 inline-flex items-center rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Learn more &amp; install →
            </a>
          </div>
        </section>

        {/* Value Props */}
        <section className="border-t border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 text-center">
              <h3 className="text-2xl font-semibold tracking-tight">Why these tools exist</h3>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Private by default",
                  desc: "All validation, formatting, and transforms happen in your browser. Nothing is uploaded or logged.",
                },
                {
                  title: "Instant feedback",
                  desc: "No waiting for a backend, no sign-up, no rate limits. Open a tool and start working immediately.",
                },
                {
                  title: "Built by practitioners",
                  desc: "Every utility solves a real friction the author hits while writing pipelines, dbt models, and Airflow DAGs.",
                },
              ].map((prop, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                  <h4 className="mb-2 font-semibold">{prop.title}</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{prop.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section id="roadmap" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-semibold tracking-tight">Roadmap</h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">What we’re working on next</p>
          </div>

          <div className="mx-auto max-w-2xl space-y-4 text-sm">
            {[
              { q: "Q2 2025", item: "JSON & YAML validators with schema support and sample generators" },
              { q: "Q2 2025", item: "CSV/TSV explorer + Parquet preview (client-side)" },
              { q: "Now", item: "GCloud Command Explorer + JSON ↔ YAML converter + SQL Formatter" },
              { q: "Ongoing", item: "More one-off utilities requested by the community" },
            ].map((r, idx) => (
              <div key={idx} className="flex gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="w-20 shrink-0 font-mono text-xs text-primary-600 dark:text-primary-400">{r.q}</div>
                <div>{r.item}</div>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="border-t border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h3 className="mb-4 text-2xl font-semibold tracking-tight">About Smathr</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Smathr is a personal collection of lightweight, high-quality tools I wish I had while doing data work.
              The goal is simple: remove the tiny frictions that slow engineers down every day.
            </p>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
              Built in public. Feedback and tool ideas are always welcome — just email or open an issue.
            </p>

            <div className="mt-6 flex justify-center gap-4 text-sm">
              <a href="https://github.com/smathr" target="_blank" rel="noopener" className="underline hover:text-primary-600">GitHub</a>
              <a href="mailto:hello@smathr.com" className="underline hover:text-primary-600">Contact</a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500">
        <div className="mx-auto max-w-6xl px-6">
          © {new Date().getFullYear()} Smathr — Made for data engineers who value their time and their data.
        </div>
      </footer>
    </>
  );
}
