import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Download } from "lucide-react";
import { loadSiteHome } from "@/lib/content";

export function Footer() {
  const [githubUrl, setGithubUrl] = useState("#");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSiteHome().then((s) => {
      if (s.githubUsername) {
        const handle = s.githubUsername.replace(/^@/, "").trim();
        if (handle) setGithubUrl(`https://github.com/${handle}`);
      }
      setResumeUrl(s.resumeUrl ?? null);
    });
  }, []);

  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-display text-sm tracking-wider">VNR610</p>
          <p className="text-xs text-muted-foreground mt-1 tracking-wider">Mastering Full Stack & Cybersecurity</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-saber-blue transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-saber-blue transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <Link
            to="/contact"
            className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-saber-blue transition-colors"
            aria-label="Contact"
          >
            <Mail className="h-4 w-4" />
          </Link>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="flex items-center gap-1.5 h-9 px-3 rounded-md saber-border text-muted-foreground hover:text-saber-blue transition-colors text-[10px] uppercase tracking-[0.2em]"
              aria-label="Download resume"
            >
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
