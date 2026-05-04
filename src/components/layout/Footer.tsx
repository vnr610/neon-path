import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Download, Twitter } from "lucide-react";
import { loadSiteHome, type SiteHomeSettings } from "@/lib/content";
import { NewsletterForm } from "@/components/saber/NewsletterForm";

/* ── Animated network graph with binary elements ── */
function FooterAnimation() {
  // Fixed nodes — deterministic positions so no hydration mismatch
  const nodes = [
    { x: 60,  y: 48, r: 4 },
    { x: 180, y: 20, r: 3 },
    { x: 300, y: 72, r: 5 },
    { x: 420, y: 28, r: 3 },
    { x: 540, y: 60, r: 4 },
    { x: 660, y: 18, r: 3 },
    { x: 780, y: 70, r: 5 },
    { x: 900, y: 32, r: 3 },
    { x: 1020, y: 58, r: 4 },
    { x: 1140, y: 24, r: 3 },
  ];

  // Edges between nodes
  const edges = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],
    [0,2],[1,3],[3,5],[4,6],[5,7],[6,8],[7,9],
    [2,5],[4,7],
  ];

  // Binary strings that travel along edges
  const binaryLabels = ["01","10","1","0","101","010","11","00","1010","0101"];

  return (
    <div className="relative w-full overflow-hidden h-24 pointer-events-none select-none" aria-hidden="true">
      <svg
        viewBox="0 0 1200 96"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        <defs>
          {/* Glow filter for nodes */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Edge gradient */}
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>

          {/* Travelling packet gradient */}
          <radialGradient id="packetGrad">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Edges */}
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x} y1={nodes[a].y}
            x2={nodes[b].x} y2={nodes[b].y}
            stroke="url(#edgeGrad)"
            strokeWidth="0.8"
            className="opacity-60"
          />
        ))}

        {/* Travelling data packets along edges */}
        {edges.slice(0, 9).map(([a, b], i) => {
          const dur = 2.5 + (i % 4) * 0.8;
          const delay = i * 0.35;
          return (
            <circle key={`pkt-${i}`} r="2.5" fill="url(#packetGrad)" filter="url(#nodeGlow)">
              <animateMotion
                dur={`${dur}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
                calcMode="linear"
              >
                <mpath href={`#edge-${i}`} />
              </animateMotion>
            </circle>
          );
        })}

        {/* Hidden paths for animateMotion */}
        {edges.slice(0, 9).map(([a, b], i) => (
          <path
            key={`path-${i}`}
            id={`edge-${i}`}
            d={`M${nodes[a].x},${nodes[a].y} L${nodes[b].x},${nodes[b].y}`}
            fill="none"
            stroke="none"
          />
        ))}

        {/* Binary labels floating along edges */}
        {edges.slice(0, 10).map(([a, b], i) => {
          const mx = (nodes[a].x + nodes[b].x) / 2;
          const my = (nodes[a].y + nodes[b].y) / 2 - 6;
          const dur = 3 + (i % 3) * 1.2;
          const delay = i * 0.5;
          return (
            <text
              key={`bin-${i}`}
              x={mx} y={my}
              fontSize="7"
              fontFamily="monospace"
              fill="#3b82f6"
              textAnchor="middle"
              opacity="0"
            >
              {binaryLabels[i % binaryLabels.length]}
              <animate
                attributeName="opacity"
                values="0;0.5;0"
                dur={`${dur}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y"
                values={`${my + 4};${my - 4};${my + 4}`}
                dur={`${dur}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </text>
          );
        })}

        {/* Nodes */}
        {nodes.map((n, i) => {
          const dur = 2 + (i % 5) * 0.6;
          const delay = i * 0.3;
          return (
            <g key={`node-${i}`} filter="url(#nodeGlow)">
              {/* Outer ping ring */}
              <circle cx={n.x} cy={n.y} r={n.r + 4}
                stroke="#3b82f6" strokeWidth="0.5" fill="none" opacity="0">
                <animate attributeName="r" values={`${n.r};${n.r + 8};${n.r}`}
                  dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4"
                  dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
              </circle>
              {/* Core dot */}
              <circle cx={n.x} cy={n.y} r={n.r}
                fill="#3b82f6" opacity="0.2">
                <animate attributeName="opacity" values="0.2;0.7;0.2"
                  dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
              </circle>
              {/* Inner bright dot */}
              <circle cx={n.x} cy={n.y} r={Math.max(1, n.r - 1.5)}
                fill="#93c5fd" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.9;0.3"
                  dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Corner brackets */}
        <path d="M0 0 L0 14 M0 0 L18 0" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
        <path d="M1200 0 L1200 14 M1200 0 L1182 0" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
        <path d="M0 96 L0 82 M0 96 L18 96" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
        <path d="M1200 96 L1200 82 M1200 96 L1182 96" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  );
}

export function Footer() {
  const [site, setSite] = useState<SiteHomeSettings | null>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    loadSiteHome().then(setSite);
  }, []);

  const githubUrl = site?.githubUsername
    ? `https://github.com/${site.githubUsername.replace(/^@/, "").trim()}`
    : null;

  return (
    <footer className="border-t border-border/60 mt-24">

      {/* Newsletter strip */}
      <div className="border-b border-border/40 bg-muted/10">
        <div className="container py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md saber-border flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold">Stay in the loop</p>
              <p className="text-xs text-muted-foreground mt-0.5">New writeups and projects — no spam.</p>
            </div>
          </div>
          <NewsletterForm variant="footer" />
        </div>
      </div>

      {/* Main footer content */}
      <div className="container py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div>
            <p className="font-display text-sm tracking-wider">VNR610</p>
            <p className="text-xs text-muted-foreground mt-1 tracking-wider">
              Mastering Full Stack &amp; Cybersecurity
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About" },
              { to: "/writeups", label: "Writeups" },
              { to: "/projects", label: "Projects" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <Link key={l.to} to={l.to}
                className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noreferrer"
                className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
            )}
            {site?.linkedinUrl && (
              <a href={site.linkedinUrl} target="_blank" rel="noreferrer"
                className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {site?.twitterUrl && (
              <a href={site.twitterUrl} target="_blank" rel="noreferrer"
                className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter / X">
                <Twitter className="h-4 w-4" />
              </a>
            )}
            <Link to="/contact"
              className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Contact">
              <Mail className="h-4 w-4" />
            </Link>
            {site?.resumeUrl && (
              <a href={site.resumeUrl} target="_blank" rel="noreferrer" download
                className="flex items-center gap-1.5 h-9 px-3 rounded-md saber-border text-muted-foreground hover:text-foreground transition-colors text-[10px] uppercase tracking-[0.2em]"
                aria-label="Download resume">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Resume</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* SVG animation strip */}
      <FooterAnimation />

      {/* Copyright bar */}
      <div className="border-t border-border/40 bg-muted/5">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Copyright */}
          <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-[0.25em]">
            © {year} VNR610. All rights reserved.
          </p>

          {/* Legal links */}
          <div className="flex items-center gap-4">
            <Link to="/privacy"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/20">·</span>
            <Link to="/terms"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              Terms of Use
            </Link>
            <span className="text-muted-foreground/20">·</span>
            <span className="font-mono text-[10px] text-muted-foreground/30 uppercase tracking-[0.2em]">
              Built by VNR610
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
