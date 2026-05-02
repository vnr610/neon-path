import { supabase } from "@/integrations/supabase/client";

export type BlogContentFormat = "markdown" | "html";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  /** `html` when imported from Word (.docx); otherwise markdown. */
  contentFormat: BlogContentFormat;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string;
};

export type BlogNeighbor = { slug: string; title: string };

const mapBlogFromDb = (row: any): BlogPost => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt || "",
  content: row.content,
  contentFormat: row.content_format === "html" ? "html" : "markdown",
  thumbnailUrl: row.thumbnail_url || undefined,
  tags: row.tags || [],
  createdAt: row.created_at,
});

/** Plain-text preview for list cards (strips HTML from Word imports). */
export const blogContentPreview = (post: Pick<BlogPost, "content" | "excerpt" | "contentFormat">, maxLen = 140): string => {
  const base = post.excerpt?.trim() || post.content;
  const text =
    post.contentFormat === "html"
      ? base.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      : base.replace(/\s+/g, " ").trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "…";
};

export type Skill = {
  id: string;
  name: string;
  category: "fullstack" | "cyber";
  level: string;
  progress: number;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  desc: string;
  repo?: string;
  live?: string;
  stack: string;
  cover?: string;
  createdAt: string;
  /** Shown on the landing page when set in admin (requires DB migration). */
  featuredOnHome?: boolean;
  /** Display order on the home grid (1–3). */
  homeSlot?: number | null;
};

export type SiteHomeSettings = {
  focusTitle: string | null;
  focusDescription: string | null;
  githubUsername: string | null;
  leetcodeUsername: string | null;
  hacktheboxUsername: string | null;
  hackeroneUsername: string | null;
};

const mapProjectFromDb = (row: any): Project => ({
  id: row.id,
  name: row.name,
  desc: row.desc,
  repo: row.repo || undefined,
  live: row.live || undefined,
  stack: row.stack,
  cover: row.cover || undefined,
  createdAt: row.created_at,
  featuredOnHome: row.featured_on_home ?? false,
  homeSlot: row.home_slot ?? null,
});

export type TimelineEntry = {
  id: string;
  date: string;
  realm: string;
  title: string;
  desc?: string;
  createdAt: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  badge?: string;
  createdAt: string;
};

export type AdminContentCounts = {
  blogPosts: number;
  skills: number;
  projects: number;
  timeline: number;
  certifications: number;
};

/** Exact row counts for the admin dashboard (lightweight head requests). */
export const loadAdminContentCounts = async (): Promise<AdminContentCounts> => {
  const [blog, skills, projects, timeline, certifications] = await Promise.all([
    supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    supabase.from("skills").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("timeline_entries").select("id", { count: "exact", head: true }),
    supabase.from("certifications").select("id", { count: "exact", head: true }),
  ]);

  return {
    blogPosts: blog.count ?? 0,
    skills: skills.count ?? 0,
    projects: projects.count ?? 0,
    timeline: timeline.count ?? 0,
    certifications: certifications.count ?? 0,
  };
};

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// BLOG POSTS
export const loadBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading blog posts:", error);
    return [];
  }

  return (data || []).map(mapBlogFromDb);
};

export const loadBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    console.error("Error loading blog post:", error);
    return null;
  }
  if (!data) return null;

  return mapBlogFromDb(data);
};

/** Older = previous chronologically; newer = more recent. List order is newest-first. */
export const loadBlogNeighborsBySlug = async (slug: string): Promise<{ older: BlogNeighbor | null; newer: BlogNeighbor | null }> => {
  const posts = await loadBlogPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { older: null, newer: null };
  const older = idx < posts.length - 1 ? { slug: posts[idx + 1].slug, title: posts[idx + 1].title } : null;
  const newer = idx > 0 ? { slug: posts[idx - 1].slug, title: posts[idx - 1].title } : null;
  return { older, newer };
};

export const addBlogPost = async (post: Omit<BlogPost, "id" | "createdAt">) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      content_format: post.contentFormat,
      thumbnail_url: post.thumbnailUrl || null,
      tags: post.tags,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding blog post:", error);
    return null;
  }

  return mapBlogFromDb(data);
};

export const updateBlogPost = async (id: string, updates: Partial<Omit<BlogPost, "id" | "createdAt">>) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.slug !== undefined && { slug: updates.slug }),
      ...(updates.excerpt !== undefined && { excerpt: updates.excerpt }),
      ...(updates.content !== undefined && { content: updates.content }),
      ...(updates.contentFormat !== undefined && { content_format: updates.contentFormat }),
      ...(updates.thumbnailUrl !== undefined && { thumbnail_url: updates.thumbnailUrl || null }),
      ...(updates.tags !== undefined && { tags: updates.tags }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating blog post:", error);
    return null;
  }

  return mapBlogFromDb(data);
};

export const deleteBlogPost = async (id: string) => {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) {
    console.error("Error deleting blog post:", error);
  }
};

export const uploadBlogMedia = async (file: File, folder = "blog-content"): Promise<string | null> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("blog-media").upload(key, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("Error uploading blog media:", error);
    return null;
  }
  const { data } = supabase.storage.from("blog-media").getPublicUrl(key);
  return data.publicUrl;
};

export const uploadBlogThumbnail = async (file: File): Promise<string | null> => uploadBlogMedia(file, "blog-thumbnails");

// SKILLS
export const loadSkills = async (): Promise<Skill[]> => {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading skills:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    level: row.level,
    progress: row.progress,
    createdAt: row.created_at,
  }));
};

export const addSkill = async (skill: Omit<Skill, "id" | "createdAt">) => {
  const { data, error } = await supabase
    .from("skills")
    .insert({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      progress: skill.progress,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding skill:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    level: data.level,
    progress: data.progress,
    createdAt: data.created_at,
  };
};

export const updateSkill = async (id: string, updates: Partial<Omit<Skill, "id" | "createdAt">>) => {
  const { data, error } = await supabase
    .from("skills")
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.level !== undefined && { level: updates.level }),
      ...(updates.progress !== undefined && { progress: updates.progress }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating skill:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    level: data.level,
    progress: data.progress,
    createdAt: data.created_at,
  };
};

export const deleteSkill = async (id: string) => {
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) {
    console.error("Error deleting skill:", error);
  }
};

// PROJECTS
export const loadProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading projects:", error);
    return [];
  }

  return (data || []).map(mapProjectFromDb);
};

/** Featured rows for the landing grid, or the three newest projects if none are starred. */
export const loadFeaturedProjectsForHome = async (): Promise<Project[]> => {
  const { data, error } = await supabase.from("projects").select("*").eq("featured_on_home", true);

  if (error) {
    console.warn("Featured projects unavailable — apply latest migration or check network:", error.message);
    const all = await loadProjects();
    return all.slice(0, 3);
  }

  const mapped = (data || []).map(mapProjectFromDb);
  mapped.sort((a, b) => {
    const sa = a.homeSlot ?? 99;
    const sb = b.homeSlot ?? 99;
    if (sa !== sb) return sa - sb;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (mapped.length === 0) {
    const all = await loadProjects();
    return all.slice(0, 3);
  }
  return mapped;
};

export const loadSiteHome = async (): Promise<SiteHomeSettings> => {
  const { data, error } = await supabase
    .from("site_home")
    .select("focus_title, focus_description, github_username, leetcode_username, hackthebox_username, hackerone_username")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.warn("site_home unavailable — apply latest migration:", error.message);
    return {
      focusTitle: null,
      focusDescription: null,
      githubUsername: null,
      leetcodeUsername: null,
      hacktheboxUsername: null,
      hackeroneUsername: null,
    };
  }
  if (!data) {
    return {
      focusTitle: null,
      focusDescription: null,
      githubUsername: null,
      leetcodeUsername: null,
      hacktheboxUsername: null,
      hackeroneUsername: null,
    };
  }
  return {
    focusTitle: data.focus_title,
    focusDescription: data.focus_description,
    githubUsername: data.github_username,
    leetcodeUsername: data.leetcode_username,
    hacktheboxUsername: data.hackthebox_username,
    hackeroneUsername: data.hackerone_username,
  };
};

export type SiteHomeSettingsPatch = Partial<SiteHomeSettings>;

export const saveSiteHomeSettings = async (patch: SiteHomeSettingsPatch): Promise<boolean> => {
  const existing = await loadSiteHome();
  const merged: SiteHomeSettings = {
    focusTitle: patch.focusTitle !== undefined ? patch.focusTitle : existing.focusTitle,
    focusDescription: patch.focusDescription !== undefined ? patch.focusDescription : existing.focusDescription,
    githubUsername: patch.githubUsername !== undefined ? patch.githubUsername : existing.githubUsername,
    leetcodeUsername: patch.leetcodeUsername !== undefined ? patch.leetcodeUsername : existing.leetcodeUsername,
    hacktheboxUsername: patch.hacktheboxUsername !== undefined ? patch.hacktheboxUsername : existing.hacktheboxUsername,
    hackeroneUsername: patch.hackeroneUsername !== undefined ? patch.hackeroneUsername : existing.hackeroneUsername,
  };

  const { error } = await supabase.from("site_home").upsert(
    {
      id: 1,
      focus_title: merged.focusTitle,
      focus_description: merged.focusDescription,
      github_username: merged.githubUsername,
      leetcode_username: merged.leetcodeUsername,
      hackthebox_username: merged.hacktheboxUsername,
      hackerone_username: merged.hackeroneUsername,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) {
    console.error("Error saving site home:", error);
    return false;
  }
  return true;
};

export const addProject = async (project: Omit<Project, "id" | "createdAt">) => {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: project.name,
      desc: project.desc,
      repo: project.repo || null,
      live: project.live || null,
      stack: project.stack,
      cover: project.cover || null,
      featured_on_home: project.featuredOnHome ?? false,
      home_slot: project.homeSlot ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding project:", error);
    return null;
  }

  return mapProjectFromDb(data);
};

export const updateProject = async (id: string, updates: Partial<Omit<Project, "id" | "createdAt">>) => {
  const { data, error } = await supabase
    .from("projects")
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.desc !== undefined && { desc: updates.desc }),
      ...(updates.repo !== undefined && { repo: updates.repo || null }),
      ...(updates.live !== undefined && { live: updates.live || null }),
      ...(updates.stack !== undefined && { stack: updates.stack }),
      ...(updates.cover !== undefined && { cover: updates.cover || null }),
      ...(updates.featuredOnHome !== undefined && { featured_on_home: updates.featuredOnHome }),
      ...(updates.homeSlot !== undefined && { home_slot: updates.homeSlot }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    return null;
  }

  return mapProjectFromDb(data);
};

export const deleteProject = async (id: string) => {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("Error deleting project:", error);
  }
};

// TIMELINE ENTRIES
export const loadTimelineEntries = async (): Promise<TimelineEntry[]> => {
  const { data, error } = await supabase
    .from("timeline_entries")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error loading timeline entries:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    date: row.date,
    realm: row.realm,
    title: row.title,
    desc: row.desc || undefined,
    createdAt: row.created_at,
  }));
};

export const addTimelineEntry = async (entry: Omit<TimelineEntry, "id" | "createdAt">) => {
  const { data, error } = await supabase
    .from("timeline_entries")
    .insert({
      date: entry.date,
      realm: entry.realm,
      title: entry.title,
      desc: entry.desc || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding timeline entry:", error);
    return null;
  }

  return {
    id: data.id,
    date: data.date,
    realm: data.realm,
    title: data.title,
    desc: data.desc || undefined,
    createdAt: data.created_at,
  };
};

export const updateTimelineEntry = async (id: string, updates: Partial<Omit<TimelineEntry, "id" | "createdAt">>) => {
  const { data, error } = await supabase
    .from("timeline_entries")
    .update({
      ...(updates.date !== undefined && { date: updates.date }),
      ...(updates.realm !== undefined && { realm: updates.realm }),
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.desc !== undefined && { desc: updates.desc || null }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating timeline entry:", error);
    return null;
  }

  return {
    id: data.id,
    date: data.date,
    realm: data.realm,
    title: data.title,
    desc: data.desc || undefined,
    createdAt: data.created_at,
  };
};

export const deleteTimelineEntry = async (id: string) => {
  const { error } = await supabase.from("timeline_entries").delete().eq("id", id);
  if (error) {
    console.error("Error deleting timeline entry:", error);
  }
};

// CERTIFICATIONS
export const loadCertifications = async (): Promise<Certification[]> => {
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error loading certifications:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    date: row.date,
    url: row.url || undefined,
    badge: row.badge || undefined,
    createdAt: row.created_at,
  }));
};

export const addCertification = async (certification: Omit<Certification, "id" | "createdAt">) => {
  const { data, error } = await supabase
    .from("certifications")
    .insert({
      name: certification.name,
      issuer: certification.issuer,
      date: certification.date,
      url: certification.url || null,
      badge: certification.badge || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding certification:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    issuer: data.issuer,
    date: data.date,
    url: data.url || undefined,
    badge: data.badge || undefined,
    createdAt: data.created_at,
  };
};

export const updateCertification = async (id: string, updates: Partial<Omit<Certification, "id" | "createdAt">>) => {
  const { data, error } = await supabase
    .from("certifications")
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.issuer !== undefined && { issuer: updates.issuer }),
      ...(updates.date !== undefined && { date: updates.date }),
      ...(updates.url !== undefined && { url: updates.url || null }),
      ...(updates.badge !== undefined && { badge: updates.badge || null }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating certification:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    issuer: data.issuer,
    date: data.date,
    url: data.url || undefined,
    badge: data.badge || undefined,
    createdAt: data.created_at,
  };
};

export const deleteCertification = async (id: string) => {
  const { error } = await supabase.from("certifications").delete().eq("id", id);
  if (error) {
    console.error("Error deleting certification:", error);
  }
};
