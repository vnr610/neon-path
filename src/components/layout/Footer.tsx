import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Download, Twitter } from "lucide-react";
import { loadSiteHome, type SiteHomeSettings } from "@/lib/content";
import { NewsletterForm } from "@/components/saber/NewsletterForm";

export function Footer() {
  const [site, setSite] = useState<SiteHomeSettings | null>(null);

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
        <div className="container py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-sm font-semibold">Stay in the loop</p>
            <p className="text-xs text-muted-foreground mt-0.5">New writeups and projects — no spam.</p>
          </div>
          <NewsletterForm variant="footer" />
        </div>
      </div>

      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-display text-sm tracking-wider">VNR610</p>
          <p className="text-xs text-muted-foreground mt-1 tracking-wider">Mastering Full Stack & Cybersecurity</p>
        </div>

        <div className="flex items-center gap-2">
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer"
              className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
          )}
          {site?.linkedinUrl && (
            <a href={site.linkedinUrl} target="_blank" rel="noreferrer"
              className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {site?.twitterUrl && (
            <a href={site.twitterUrl} target="_blank" rel="noreferrer"
              className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter / X">
              <Twitter className="h-4 w-4" />
            </a>
          )}
          <Link to="/contact"
            className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Contact">
            <Mail className="h-4 w-4" />
          </Link>
          {site?.resumeUrl && (
            <a href={site.resumeUrl} target="_blank" rel="noreferrer" download
              className="flex items-center gap-1.5 h-9 px-3 rounded-md saber-border text-muted-foreground hover:text-foreground transition-colors text-[10px] uppercase tracking-[0.2em]" aria-label="Download resume">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Resume</span>
            </a>
          )}
        </div>

        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          © {new Date().getFullYear()} — May the code be with you
        </p>
      </div>
    </footer>
  );
}
