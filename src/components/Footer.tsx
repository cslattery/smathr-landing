import React from "react";

const GITHUB_URL = "https://github.com/smathr";
const REPO_URL = "https://github.com/cslattery/smathr-landing";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <a href="/" className="mb-3 inline-flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-primary-600 text-xs font-bold text-white">
                S
              </div>
              <span className="font-semibold tracking-tight">Smathr</span>
            </a>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Private, browser-based utilities for data engineers. No sign-up, no uploads.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <h4 className="mb-3 font-medium text-zinc-900 dark:text-zinc-100">Site</h4>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <li><a href="/#tools" className="transition hover:text-primary-600">Tools</a></li>
                <li><a href="/cli" className="transition hover:text-primary-600">CLI</a></li>
                <li><a href="/#about" className="transition hover:text-primary-600">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-medium text-zinc-900 dark:text-zinc-100">Project</h4>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>
                  <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-primary-600">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href={`${REPO_URL}/blob/main/ROADMAP.md`} target="_blank" rel="noopener noreferrer" className="transition hover:text-primary-600">
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className="transition hover:text-primary-600">
                    Suggest a tool
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-medium text-zinc-900 dark:text-zinc-100">CLI</h4>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>
                  <a href="https://github.com/smathr/smathr-cli" target="_blank" rel="noopener noreferrer" className="transition hover:text-primary-600">
                    smathr-cli repo
                  </a>
                </li>
                <li>
                  <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-900">npx smathr</code>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          © {new Date().getFullYear()} Smathr — Made for data engineers who value their time and their data.
        </div>
      </div>
    </footer>
  );
}