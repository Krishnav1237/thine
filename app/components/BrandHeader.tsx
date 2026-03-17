"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { thineLinks } from "../lib/thine-links";

const isTestPath = (pathname: string) =>
  pathname === "/" ||
  pathname.startsWith("/quiz") ||
  pathname.startsWith("/results") ||
  pathname.startsWith("/share");

export default function BrandHeader() {
  const pathname = usePathname();
  const testActive = isTestPath(pathname);
  const arenaActive = pathname.startsWith("/arena");

  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label="Thine home">
        <span className="brand-mark-title">Thine</span>
        <span className="brand-mark-meta">yours, once remembered</span>
      </Link>

      <div className="site-header-actions">
        <nav className="site-nav" aria-label="Primary">
          <Link
            href="/quiz"
            className={`site-tab ${testActive ? "is-active" : ""}`}
            aria-current={testActive ? "page" : undefined}
          >
            Test
          </Link>
          <Link
            href="/arena"
            className={`site-tab ${arenaActive ? "is-active" : ""}`}
            aria-current={arenaActive ? "page" : undefined}
          >
            Arena
          </Link>
        </nav>

        <a
          className="site-link"
          href={thineLinks.story}
          target="_blank"
          rel="noreferrer"
        >
          Story
        </a>
      </div>
    </header>
  );
}
