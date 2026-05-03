/**
 * CommandPalette — ⌘K / Ctrl+K global search and navigation.
 * Searches pages, blog posts, projects, and skills.
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Activity,
  Award,
  BookOpen,
  Code2,
  FolderGit2,
  Home,
  Mail,
  Shield,
  Sparkles,
  User,
  BookMarked,
} from "lucide-react";
import { loadBlogPosts, loadProjects, loadSkills } from "@/lib/content";
import type { BlogPost, Project, Skill } from "@/lib/content";

// ─── Static nav pages ─────────────────────────────────────────────────────────

const PAGES = [
  { label: "Home", to: "/", icon: Home },
  { label: "About", to: "/about", icon: User },
  { label: "Skills", to: "/skills", icon: Sparkles },
  { label: "Projects", to: "/projects", icon: FolderGit2 },
  { label: "Writeups", to: "/writeups", icon: BookOpen },
  { label: "Timeline", to: "/timeline", icon: Activity },
  { label: "Certifications", to: "/certifications", icon: Award },
  { label: "Guestbook", to: "/guestbook", icon: BookMarked },
  { label: "Contact", to: "/contact", icon: Mail },
];

// ─── Hook: open on ⌘K / Ctrl+K ───────────────────────────────────────────────

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Lazy-load content when palette first opens
  useEffect(() => {
    if (!open || loaded) return;
    Promise.all([loadBlogPosts(), loadProjects(), loadSkills()]).then(([p, pr, sk]) => {
      setPosts(p);
      setProjects(pr);
      setSkills(sk);
      setLoaded(true);
    });
  }, [open, loaded]);

  const go = useCallback(
    (to: string) => {
      onOpenChange(false);
      navigate(to);
    },
    [navigate, onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, posts, projects, skills…" />
      <CommandList>
        <CommandEmpty>
          <span className="font-mono text-xs text-muted-foreground">No results found.</span>
        </CommandEmpty>

        {/* Pages */}
        <CommandGroup heading="Navigation">
          {PAGES.map((page) => (
            <CommandItem
              key={page.to}
              value={page.label}
              onSelect={() => go(page.to)}
              className="gap-3 cursor-pointer"
            >
              <page.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Blog posts */}
        {posts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Writeups">
              {posts.slice(0, 8).map((post) => (
                <CommandItem
                  key={post.id}
                  value={`writeup ${post.title} ${post.tags.join(" ")}`}
                  onSelect={() => go(`/writeups/${post.slug}`)}
                  className="gap-3 cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{post.title}</span>
                    {post.tags.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-mono truncate">
                        {post.tags.slice(0, 3).join(" · ")}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {projects.slice(0, 6).map((project) => (
                <CommandItem
                  key={project.id}
                  value={`project ${project.name} ${project.stack}`}
                  onSelect={() => go("/projects")}
                  className="gap-3 cursor-pointer"
                >
                  <FolderGit2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{project.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono truncate">
                      {project.stack.split(",").slice(0, 3).map((s) => s.trim()).join(" · ")}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Skills">
              {skills.slice(0, 6).map((skill) => (
                <CommandItem
                  key={skill.id}
                  value={`skill ${skill.name} ${skill.category}`}
                  onSelect={() => go("/skills")}
                  className="gap-3 cursor-pointer"
                >
                  {skill.category === "cyber" ? (
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Code2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{skill.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {skill.level} · {skill.progress}%
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      {/* Footer hint */}
      <div className="border-t border-border/60 px-4 py-2 flex items-center justify-between">
        <span className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-[0.2em]">
          vnr610 · realm
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] text-muted-foreground/40">
            <kbd className="text-kbd">↑↓</kbd> navigate
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/40">
            <kbd className="text-kbd">↵</kbd> open
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/40">
            <kbd className="text-kbd">esc</kbd> close
          </span>
        </div>
      </div>
    </CommandDialog>
  );
}
