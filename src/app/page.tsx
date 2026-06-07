"use client";

import React, { useMemo, useState } from "react";
import { Lock, Sparkles, Hammer, Github, Terminal } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { ToolFilters } from "@/components/ToolFilters";
import { ToolCard } from "@/components/ToolCard";
import { tools, ToolCategory } from "@/data/tools";

const VALUE_PROPS = [
  {
    icon: Lock,
    title: "Private by default",
    desc: "All validation, formatting, and transforms happen in your browser. Nothing is uploaded or logged.",
  },
  {
    icon: Sparkles,
    title: "Instant feedback",
    desc: "No waiting for a backend, no sign-up, no rate limits. Open a tool and start working immediately.",
  },
  {
    icon: Hammer,
    title: "Built by practitioners",
    desc: "Every utility solves real friction from writing pipelines, dbt models, and Airflow DAGs.",
  },
];

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
        <section className="border-b border-zinc-200 bg-zinc-50/50 py-10 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-6">
            <Hero />
          </div>
        </section>

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

          <div className="mt-10 rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 dark:border-zinc-800 dark:from-zinc-900/50 dark:to-zinc-950">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                <Terminal className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-zinc-900 dark:text-white">Smathr CLI</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  The same tools in your terminal — built first for AI agents with structured output.
                </p>
              </div>
              <a
                href="/cli"
                className="inline-flex shrink-0 items-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Install &amp; docs →
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 text-center">
              <h3 className="text-2xl font-semibold tracking-tight">Why these tools exist</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Small utilities that remove friction from everyday data engineering work.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mb-2 font-semibold">{title}</h4>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="border-t border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h3 className="mb-4 text-2xl font-semibold tracking-tight">About Smathr</h3>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              Smathr is a personal collection of lightweight, high-quality tools built for data engineering workflows.
              The goal is simple: remove the tiny frictions that slow engineers down every day.
            </p>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
              Built in public. Feedback and tool ideas are welcome on GitHub.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="https://github.com/smathr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <Github className="h-4 w-4" />
                Smathr on GitHub
              </a>
              <a
                href="https://github.com/cslattery/smathr-landing/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Suggest a tool
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}