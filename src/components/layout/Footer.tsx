import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-display text-sm tracking-wider">VNR610</p>
          <p className="text-xs text-muted-foreground mt-1 tracking-wider">Mastering Full Stack & Cybersecurity</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { icon: Github, href: "#" },
            { icon: Linkedin, href: "#" },
            { icon: Mail, href: "#" },
          ].map((s, i) => (
            <a
              key={i}
              href={s.href}
              className="h-9 w-9 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-saber-blue transition-colors"
              aria-label="social"
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          © {new Date().getFullYear()} — May the code be with you
        </p>
      </div>
    </footer>
  );
}
