import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput, SaberTextarea } from "@/components/saber/FormField";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Edit3, Trash2 } from "lucide-react";
import {
  addProject,
  deleteProject,
  loadProjects,
  updateProject,
  type Project,
} from "@/lib/content";

const blankProjectForm = {
  name: "",
  desc: "",
  repo: "",
  live: "",
  stack: "",
  cover: "",
  featuredOnHome: false,
  homeSlot: "" as "" | "1" | "2" | "3",
};

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankProjectForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await loadProjects();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData(blankProjectForm);
    setStatus("idle");
    setStatusMessage(undefined);
    setErrors([]);
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      desc: project.desc,
      repo: project.repo ?? "",
      live: project.live ?? "",
      stack: project.stack,
      cover: project.cover ?? "",
      featuredOnHome: project.featuredOnHome ?? false,
      homeSlot:
        project.homeSlot != null && (project.homeSlot === 1 || project.homeSlot === 2 || project.homeSlot === 3)
          ? String(project.homeSlot)
          : "",
    });
    setStatus("ready");
    setStatusMessage("Editing existing project.");
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    const data = await loadProjects();
    setProjects(data);
    if (editingId === id) resetForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setStatusMessage(undefined);
    setErrors([]);

    const name = formData.name.trim();
    const desc = formData.desc.trim();
    const stack = formData.stack.trim();
    const nextErrors: string[] = [];

    if (!name) nextErrors.push("Project name is required.");
    if (!desc) nextErrors.push("Project description is required.");
    if (!stack) nextErrors.push("Tech stack is required.");

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      return;
    }

    let homeSlot: number | null = null;
    if (formData.featuredOnHome) {
      if (formData.homeSlot === "1" || formData.homeSlot === "2" || formData.homeSlot === "3") {
        homeSlot = parseInt(formData.homeSlot, 10);
      }
    }

    if (editingId) {
      await updateProject(editingId, {
        name,
        desc,
        repo: formData.repo.trim() || undefined,
        live: formData.live.trim() || undefined,
        stack,
        cover: formData.cover.trim() || undefined,
        featuredOnHome: formData.featuredOnHome,
        homeSlot: formData.featuredOnHome ? homeSlot : null,
      });
      setStatus("success");
      setStatusMessage("Project updated successfully.");
    } else {
      await addProject({
        name,
        desc,
        repo: formData.repo.trim() || undefined,
        live: formData.live.trim() || undefined,
        stack,
        cover: formData.cover.trim() || undefined,
        featuredOnHome: formData.featuredOnHome,
        homeSlot: formData.featuredOnHome ? homeSlot : null,
      });
      setStatus("success");
      setStatusMessage("Project forged successfully.");
    }

    const data = await loadProjects();
    setProjects(data);
    resetForm();
  };

  return (
    <AdminLayout title="Projects">
      <div className="grid gap-8 lg:grid-cols-[minmax(420px,1fr)_340px]">
        <AdminFormShell
          eyebrow={editingId ? "edit project" : "new project"}
          title={editingId ? "Update Project" : "Forge Project"}
          description="Add a project to the vault — link the repository, the live build, and the tech behind it."
          submitLabel={editingId ? "Save Changes" : "Forge Entry"}
          onSubmit={handleSubmit}
          status={status}
          statusMessage={statusMessage}
          errors={errors}
        >
          <FormSection title="Overview">
            <FormField id="name" label="Project Name" required>
              <SaberInput
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Codename or product title"
                maxLength={80}
              />
            </FormField>
            <FormField id="desc" label="Description" required hint="One paragraph. Lead with the problem it solves.">
              <SaberTextarea
                name="desc"
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                rows={4}
                placeholder="What does it do? Who is it for?"
                maxLength={500}
              />
            </FormField>
          </FormSection>

          <FormSection title="Links">
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField id="repo" label="Repository URL" optional>
                <SaberInput
                  name="repo"
                  type="url"
                  value={formData.repo}
                  onChange={(e) => setFormData({ ...formData, repo: e.target.value })}
                  placeholder="https://github.com/…"
                  inputMode="url"
                />
              </FormField>
              <FormField id="live" label="Live URL" optional>
                <SaberInput
                  name="live"
                  type="url"
                  value={formData.live}
                  onChange={(e) => setFormData({ ...formData, live: e.target.value })}
                  placeholder="https://…"
                  inputMode="url"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Presentation">
            <FormField id="stack" label="Tech Stack" required hint="Comma-separated. Order by prominence in the build.">
              <SaberInput
                name="stack"
                value={formData.stack}
                onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                placeholder="React, Node, Postgres"
              />
            </FormField>
            <FormField id="cover" label="Cover Image URL" optional hint="16:9 recommended for clean grid display.">
              <SaberInput
                name="cover"
                type="url"
                value={formData.cover}
                onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                placeholder="https://…"
                inputMode="url"
              />
            </FormField>
          </FormSection>

          <FormSection title="Home spotlight">
            <FormField
              id="featuredOnHome"
              label="Show on home page"
              hint="Pinned in the Featured Projects grid on /. Configure copy under Admin → Home page."
            >
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  id="featuredOnHome"
                  checked={formData.featuredOnHome}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      featuredOnHome: checked,
                      homeSlot: checked ? formData.homeSlot : "",
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {formData.featuredOnHome ? "Visible on landing" : "Hidden from landing"}
                </span>
              </div>
            </FormField>
            {formData.featuredOnHome && (
              <FormField
                id="homeSlot"
                label="Slot order"
                hint="Lower numbers appear first. Use Auto to order after explicitly numbered slots."
              >
                <select
                  id="homeSlot"
                  name="homeSlot"
                  value={formData.homeSlot}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homeSlot: e.target.value as (typeof blankProjectForm)["homeSlot"],
                    })
                  }
                  className={cn(
                    "w-full rounded-md bg-background/40 border border-border/60 px-3.5 py-2.5 text-sm font-mono text-foreground",
                    "hover:border-foreground/30 focus:border-foreground/70 outline-none transition-all",
                  )}
                >
                  <option value="">Auto (after numbered slots)</option>
                  <option value="1">1 — first</option>
                  <option value="2">2 — second</option>
                  <option value="3">3 — third</option>
                </select>
              </FormField>
            )}
          </FormSection>
        </AdminFormShell>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Saved projects</p>
              <p className="text-sm text-muted-foreground">Edit or remove entries from the vault.</p>
            </div>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="saber-card p-6 text-muted-foreground">No saved projects yet.</div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <article key={project.id} className="saber-card overflow-hidden">
                  {project.cover && <img src={project.cover} alt={`${project.name} cover`} className="h-44 w-full object-cover" />}
                  <div className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{project.desc}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(project)}>
                          <Edit3 className="h-4 w-4" /> Edit
                        </Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(project.id)}>
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                      {project.stack.split(",").map((tech) => (
                        <span key={tech.trim()} className="rounded-full border border-border px-3 py-1 bg-background/80">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      {project.repo && (
                        <a href={project.repo} target="_blank" rel="noreferrer" className="text-saber-blue hover:underline">
                          Repository
                        </a>
                      )}
                      {project.live && (
                        <a href={project.live} target="_blank" rel="noreferrer" className="text-saber-purple hover:underline">
                          Live Demo
                        </a>
                      )}
                    </div>
                    {project.featuredOnHome && (
                      <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-saber-blue/90">
                        Home: pinned
                        {project.homeSlot != null ? ` · slot ${project.homeSlot}` : ""}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminProjects;
