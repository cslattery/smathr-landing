"use client";

import React from "react";
import { Search } from "lucide-react";
import { categories, ToolCategory } from "@/data/tools";

interface ToolFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  activeCategory: ToolCategory | "All";
  setActiveCategory: (c: ToolCategory | "All") => void;
}

export function ToolFilters({
  search,
  setSearch,
  activeCategory,
  setActiveCategory,
}: ToolFiltersProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search */}
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="search-input pl-9"
          aria-label="Search tools"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("All")}
          className={`pill ${activeCategory === "All" ? "pill-active" : ""}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`pill ${activeCategory === cat ? "pill-active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
