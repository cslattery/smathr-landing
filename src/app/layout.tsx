import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smathr | Smart Tools for Data Engineers",
  description: "Free, private, browser-based tools for data engineers. JSON & YAML validators, formatters, and more — no sign-up required.",
  icons: {
    icon: { url: "/icon.svg", type: "image/svg+xml" },
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Smathr — Smart Tools for Data Engineers",
    description: "Client-side utilities built for data workflows. Validate, transform, and explore — instantly and privately.",
    siteName: "Smathr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.className} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
