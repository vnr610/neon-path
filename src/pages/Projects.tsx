import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { SEO } from "@/components/saber/SEO";
import { FolderGit2, ArrowRight, X } from "lucide-react";
import { loadProjects, type Project } from "@/lib/content";

const PAGE_SIZE = 6;

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [activeTag]);

  // Collect all unique tech tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) =>
      p.stack.split(",").forEach((t) => set.add(t.trim())),
    );
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    if (!activeTag) return projects;
    return projects.filter((p) =>
      p.stack.split(",").map((t) => t.trim()).includes(activeTag),
    );
  }, [projects, activeTag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <SiteLayout>
      <SEO
        title="Projects"
        description="Builds, experiments, and battle-tested artifacts from the workshop."
        path="/projects"
      />
      <div className="container py-16">
        <PageHeader title="Projects" subtitle="Builds, experiments, and battle-tested artifacts from the workshop." />

        {/* Tech stack filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.05s" }}>
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.28em] transition-colors ${
                activeTag === null
                  ? "border-foreground/60 text-foreground bg-foreground/10"
                  : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.28em] transition-colors ${
                  activeTag === tag
                    ? "border-foreground/60 text-foreground bg-foreground/10"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors ml-1"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="saber-card aspect-[3/2] animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          activeTag ? (
            <div className="saber-card p-10 text-center">
              <p className="text-muted-foreground text-sm">
                No projects use <span className="text-foreground font-mono">{activeTag}</span>
              </p>
              <button onClick={() => setActiveTag(null)} className="mt-3 text-xs text-saber-blue hover:underline">
                Clear filter
              </button>
            </div>
          ) : (
            <EmptyState
              icon={FolderGit2}
              title="No projects in the vault"
              description="When projects are added they will appear here as illuminated cards with details, tech stack, and live links."
              hint="The next build is always the most important."
              status="vault :: sealed"
            />
          )
        ) : (
          <>
            {activeTag && (
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                {filtered.length} project{filtered.length !== 1 ? "s" : ""} using {activeTag}
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {paginated.map((project, i) => (
                <article
                  key={project.id}
                  className="saber-card overflow-hidden group animate-scale-in opacity-0 hover:-translate-y-1 transition-transform duration-300"
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                >
                  {project.cover && (
                    <div className="overflow-hidden">
                      <img
                        src={project.cover}
                        alt={`${project.name} cover`}
                        className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h2 className="text-xl font-semibold">{project.name}</h2>
                      <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Project</span>
                    </div>
                    <p className="text-muted-foreground">{project.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-500">
                      {project.stack.split(",").map((tech) => {
                        const t = tech.trim();
                        return (
                          <button
                            key={t}
                            onClick={() => setActiveTag(t)}
                            className={`rounded-full border px-3 py-1 bg-background/80 transition-colors ${
                              activeTag === t
                                ? "border-foreground/60 text-foreground"
                                : "border-border hover:border-foreground/40"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                      {project.repo && (
                        <a href={project.repo} target="_blank" rel="noreferrer" className="text-saber-blue hover:underline inline-flex items-center gap-1 group/link">
                          Repository
                          <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                        </a>
                      )}
                      {project.live && (
                        <a href={project.live} target="_blank" rel="noreferrer" className="text-saber-purple hover:underline inline-flex items-center gap-1 group/link">
                          Live Demo
                          <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-md border border-border/60 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-md border text-xs font-mono transition-colors ${
                      p === page
                        ? "border-foreground/60 text-foreground bg-foreground/10"
                        : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-md border border-border/60 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
};

export default Projects;
