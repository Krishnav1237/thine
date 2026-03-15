"use client";

import Link from "next/link";

import { thineLinks } from "../lib/thine-links";

export default function BrandHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label="Thine home">
        <span className="brand-mark-title">Thine</span>
        <span className="brand-mark-meta">yours, once remembered</span>
      </Link>

      <a
        className="site-link"
        href={thineLinks.story}
        target="_blank"
        rel="noreferrer"
      >
        Story
      </a>
    </header>
  );
}
