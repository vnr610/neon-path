/**
 * ShareButtons — Twitter/X share + copy link for blog posts.
 */

import { useState } from "react";
import { Check, Copy, Twitter } from "lucide-react";

type Props = {
  title: string;
  url?: string;
};

export function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — select text
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mr-1">
        Share
      </span>

      {/* Twitter / X */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Share on X / Twitter"
      >
        <Twitter className="h-3.5 w-3.5" />
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-foreground" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
