import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { FolderGit2, ArrowRight } from "lucide-react";
import { loadProjects, type Project } from "@/lib/content";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await loadProjects();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  return (
    <SiteLayout>
      <div className="container py-16">
        <PageHeader title="Projects" subtitle="Builds, experiments, and battle-tested artifacts from the workshop." />

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No projects in the vault"
            description="When projects are added they will appear here as illuminated cards with details, tech stack, and live links."
            hint="The next build is always the most important."
            status="vault :: sealed"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {projects.map((project, i) => (
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
                    {project.stack.split(",").map((tech) => (
                      <span key={tech.trim()} className="rounded-full border border-border px-3 py-1 bg-background/80 hover:border-foreground/40 transition-colors">
                        {tech.trim()}
                      </span>
                    ))}
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
        )}
      </div>
    </SiteLayout>
  );
};

export default Projects;
