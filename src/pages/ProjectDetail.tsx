import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ExternalLink, Github, FolderGit2,
  Code2, Shield, Terminal, ChevronLeft, ChevronRight,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SEO } from "@/components/saber/SEO";
import { BlogMarkdown } from "@/components/saber/BlogMarkdown";
import { Button } from "@/components/ui/button";
import { loadProjectBySlug, type Project } from "@/lib/content";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [activeShot, setActiveShot] = useState(0);

  useEffect(() => {
    if (!slug) { setProject(null); return; }
    loadProjectBySlug(slug).then(setProject);
  }, [slug]);

  if (project === undefined) {
    return (
      <SiteLayout>
        <div className="container py-24 max-w-4xl">
          <p className="text-muted-foreground text-sm animate-pulse">Loading project…</p>
        </div>
      </SiteLayout>
    );
  }

  if (!project) {
    return (
      <SiteLayout>
        <div className="container py-24 max-w-4xl space-y-6">
          <FolderGit2 className="h-10 w-10 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold">Project not found</h1>
          <p className="text-muted-foreground">This project does not exist in the vault.</p>
          <Button asChild variant="outline" className="saber-border">
            <Link to="/projects"><ArrowLeft className="h-4 w-4 mr-2" />Back to projects</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const techStack = project.stack.split(",").map((t) => t.trim()).filter(Boolean);
  const screenshots = project.screenshots?.filter(Boolean) ?? [];
  const hasLinks = project.live || project.repo;

  return (
    <SiteLayout>
      <SEO
        title={project.name}
        description={project.desc}
        image={project.cover}
        path={`/projects/${project.slug}`}
      />

      <div className="container py-16 max-w-4xl mx-auto">
        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="mb-8 -ml-2 text-muted-foreground hover:text-saber-blue animate-fade-in opacity-0" style={{ animationDelay: "0.05s" }}>
          <Link to="/projects"><ArrowLeft className="h-4 w-4 mr-2" />All projects</Link>
        </Button>

        {/* Cover image */}
        {project.cover && (
          <div className="animate-fade-up opacity-0 mb-10" style={{ animationDelay: "0.08s" }}>
            <img
              src={project.cover}
              alt={project.name}
              className="w-full aspect-[21/9] object-cover rounded-xl border border-border/60"
            />
          </div>
        )}

        {/* Header */}
        <header className="animate-fade-up opacity-0 mb-10" style={{ animationDelay: "0.12s" }}>
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">
            // project case study
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">{project.name}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{project.desc}</p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {techStack.map((tech) => (
              <span key={tech} className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>

          {/* Links */}
          {hasLinks && (
            <div className="flex flex-wrap gap-3">
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-saber text-primary-foreground text-xs uppercase tracking-[0.2em] font-mono shadow-glow-blue hover:opacity-90 transition-opacity">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live demo
                </a>
              )}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border/60 text-muted-foreground text-xs uppercase tracking-[0.2em] font-mono hover:text-foreground hover:border-foreground/40 transition-colors">
                  <Github className="h-3.5 w-3.5" />
                  Source code
                </a>
              )}
            </div>
          )}
        </header>

        {/* Screenshots gallery */}
        {screenshots.length > 0 && (
          <section className="mb-12 animate-fade-up opacity-0" style={{ animationDelay: "0.18s" }}>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-4">// screenshots</p>
            <div className="relative">
              <img
                src={screenshots[activeShot]}
                alt={`Screenshot ${activeShot + 1}`}
                className="w-full rounded-xl border border-border/60 object-cover aspect-video"
              />
              {screenshots.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveShot((i) => (i - 1 + screenshots.length) % screenshots.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveShot((i) => (i + 1) % screenshots.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="flex justify-center gap-1.5 mt-3">
                    {screenshots.map((_, i) => (
                      <button key={i} onClick={() => setActiveShot(i)}
                        className={`h-1.5 rounded-full transition-all ${i === activeShot ? "w-6 bg-saber-blue" : "w-1.5 bg-border"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Long description / case study */}
        {project.longDesc && (
          <section className="mb-12 animate-fade-up opacity-0" style={{ animationDelay: "0.22s" }}>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-6">// overview</p>
            <BlogMarkdown>{project.longDesc}</BlogMarkdown>
          </section>
        )}

        {/* Challenges */}
        {project.challenges && (
          <section className="mb-12 animate-fade-up opacity-0" style={{ animationDelay: "0.26s" }}>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-6">// challenges & solutions</p>
            <BlogMarkdown>{project.challenges}</BlogMarkdown>
          </section>
        )}

        {/* Bottom CTA */}
        <div className="pt-8 border-t border-border/60 flex items-center justify-between flex-wrap gap-4 animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
          <Button asChild variant="outline" className="saber-border">
            <Link to="/projects"><ArrowLeft className="h-4 w-4 mr-2" />All projects</Link>
          </Button>
          {hasLinks && (
            <div className="flex gap-3">
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-saber-blue hover:underline">
                  Live demo <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
};

export default ProjectDetail;
