"use client";

import React from "react";
import { Search } from "lucide-react";
import { filterTags, FilterTag } from "@/data/tools";

interface ToolFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  activeTag: FilterTag | "All";
  setActiveTag: (tag: FilterTag | "All") => void;
}

export function ToolFilters({
  search,
  setSearch,
  activeTag,
  setActiveTag,
}: ToolFiltersProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag("All")}
          className={`pill ${activeTag === "All" ? "pill-active" : ""}`}
        >
          All
        </button>
        {filterTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`pill ${activeTag === tag ? "pill-active" : ""}`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}