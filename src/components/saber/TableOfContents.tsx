/**
 * TableOfContents — parses headings from markdown/HTML content and renders
 * a sticky sidebar nav. Highlights the active heading as the user scrolls.
 */

import { useEffect, useRef, useState } from "react";
import { List } from "lucide-react";

export type TocItem = {
  id: string;
  text: string;
  level: number; // 2 or 3
};

// ─── Extract headings from markdown ──────────────────────────────────────────

export function extractTocFromMarkdown(content: string): TocItem[] {
  const lines = content.split("\n");
  const items: TocItem[] = [];
  const slugCount: Record<string, number> = {};

  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)/);
    if (!m) continue;
    const level = m[1].length as 2 | 3;
    const text = m[2].replace(/[*_`[\]]/g, "").trim();
    let id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Deduplicate
    if (slugCount[id] !== undefined) {
      slugCount[id]++;
      id = `${id}-${slugCount[id]}`;
    } else {
      slugCount[id] = 0;
    }

    items.push({ id, text, level });
  }
  return items;
}

// ─── Extract headings from HTML ───────────────────────────────────────────────

export function extractTocFromHtml(html: string): TocItem[] {
  const items: TocItem[] = [];
  const re = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const level = parseInt(m[1]) as 2 | 3;
    const id = m[2] ?? "";
    const text = m[3].replace(/<[^>]*>/g, "").trim();
    if (text) items.push({ id, text, level });
  }
  return items;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  items: TocItem[];
};

export function TableOfContents({ items }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const headingEls = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headingEls.length === 0) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 },
    );

    headingEls.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="space-y-1">
      <div className="flex items-center gap-2 mb-3">
        <List className="h-3.5 w-3.5 text-muted-foreground/50" />
        <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/50">
          Contents
        </p>
      </div>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(item.id);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
              // offset for sticky navbar (~64px)
              setTimeout(() => window.scrollBy(0, -80), 300);
            }
          }}
          className={`block text-xs leading-snug transition-colors py-0.5 border-l-2 pl-3 ${
            item.level === 3 ? "ml-3" : ""
          } ${
            activeId === item.id
              ? "border-foreground/60 text-foreground"
              : "border-border/40 text-muted-foreground/60 hover:text-muted-foreground hover:border-border"
          }`}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}
