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
  /** Display name of the author. Falls back to site owner name if blank. */
  author?: string;
  /** `draft` posts are hidden from public pages. Default: `published`. */
  status: "draft" | "published";
  /** When set on a draft, auto-publishes at this UTC time. */
  publishAt?: string | null;
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
  author: row.author || undefined,
  status: row.status === "draft" ? "draft" : "published",
  publishAt: row.publish_at || null,
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
  /** URL-friendly slug for the project detail page. */
  slug?: string;
  /** Extended description / case study content (markdown). */
  longDesc?: string;
  /** Challenges faced and how they were solved (markdown). */
  challenges?: string;
  /** Array of screenshot URLs. */
  screenshots?: string[];
};

export type SiteHomeSettings = {
  focusTitle: string | null;
  focusDescription: string | null;
  githubUsername: string | null;
  leetcodeUsername: string | null;
  hacktheboxUsername: string | null;
  hackeroneUsername: string | null;
  resumeUrl: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  avatarUrl: string | null;
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
  slug: row.slug || undefined,
  longDesc: row.long_desc || undefined,
  challenges: row.challenges || undefined,
  screenshots: row.screenshots || [],
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
/** Public: only returns published posts (or scheduled posts whose time has passed). */
export const loadBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading blog posts:", error);
    return [];
  }

  return (data || []).map(mapBlogFromDb);
};

/** Admin: returns ALL posts including drafts, sorted newest first. */
export const loadAllBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading all blog posts:", error);
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
      author: post.author || null,
      status: post.status ?? "published",
      publish_at: post.publishAt || null,
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
      ...(updates.author !== undefined && { author: updates.author || null }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.publishAt !== undefined && { publish_at: updates.publishAt || null }),
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

export const deleteBlogPostsBulk = async (ids: string[]) => {
  if (!ids.length) return;
  const { error } = await supabase.from("blog_posts").delete().in("id", ids);
  if (error) console.error("Error bulk deleting blog posts:", error);
};

/** Convert any image File to WebP using Canvas API. Falls back to original if WebP not supported. */
async function toWebP(file: File, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(new File([blob], `${baseName}.webp`, { type: "image/webp" }));
        },
        "image/webp",
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export const uploadBlogMedia = async (file: File, folder = "blog-content"): Promise<string | null> => {
  // Convert to WebP for better compression and load times
  const webpFile = file.type.startsWith("image/") ? await toWebP(file) : file;
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  const { error } = await supabase.storage.from("blog-media").upload(key, webpFile, {
    cacheControl: "31536000", // 1 year — WebP files are content-addressed
    upsert: false,
    contentType: "image/webp",
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

export const loadProjectBySlug = async (slug: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapProjectFromDb(data);
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
    .select("focus_title, focus_description, github_username, leetcode_username, hackthebox_username, hackerone_username, resume_url, bio, linkedin_url, twitter_url, avatar_url")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.warn("site_home unavailable — apply latest migration:", error.message);
    return {
      focusTitle: null, focusDescription: null,
      githubUsername: null, leetcodeUsername: null,
      hacktheboxUsername: null, hackeroneUsername: null,
      resumeUrl: null, bio: null, linkedinUrl: null,
      twitterUrl: null, avatarUrl: null,
    };
  }
  if (!data) {
    return {
      focusTitle: null, focusDescription: null,
      githubUsername: null, leetcodeUsername: null,
      hacktheboxUsername: null, hackeroneUsername: null,
      resumeUrl: null, bio: null, linkedinUrl: null,
      twitterUrl: null, avatarUrl: null,
    };
  }
  return {
    focusTitle: data.focus_title,
    focusDescription: data.focus_description,
    githubUsername: data.github_username,
    leetcodeUsername: data.leetcode_username,
    hacktheboxUsername: data.hackthebox_username,
    hackeroneUsername: data.hackerone_username,
    resumeUrl: data.resume_url ?? null,
    bio: data.bio ?? null,
    linkedinUrl: data.linkedin_url ?? null,
    twitterUrl: data.twitter_url ?? null,
    avatarUrl: data.avatar_url ?? null,
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
    resumeUrl: patch.resumeUrl !== undefined ? patch.resumeUrl : existing.resumeUrl,
    bio: patch.bio !== undefined ? patch.bio : existing.bio,
    linkedinUrl: patch.linkedinUrl !== undefined ? patch.linkedinUrl : existing.linkedinUrl,
    twitterUrl: patch.twitterUrl !== undefined ? patch.twitterUrl : existing.twitterUrl,
    avatarUrl: patch.avatarUrl !== undefined ? patch.avatarUrl : existing.avatarUrl,
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
      resume_url: merged.resumeUrl,
      bio: merged.bio,
      linkedin_url: merged.linkedinUrl,
      twitter_url: merged.twitterUrl,
      avatar_url: merged.avatarUrl,
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

// ── CONTACT MESSAGES ──────────────────────────────────────────────────────────

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export const submitContactMessage = async (
  data: Pick<ContactMessage, "name" | "email" | "message">,
): Promise<boolean> => {
  const { error } = await supabase.from("contact_messages").insert({
    name: data.name.trim(),
    email: data.email.trim(),
    message: data.message.trim(),
  });
  if (error) {
    console.error("Error submitting contact message:", error);
    return false;
  }
  return true;
};

export const loadContactMessages = async (): Promise<ContactMessage[]> => {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error loading contact messages:", error);
    return [];
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    read: row.read,
    createdAt: row.created_at,
  }));
};

export const markContactMessageRead = async (id: string, read = true): Promise<boolean> => {
  const { error } = await supabase.from("contact_messages").update({ read }).eq("id", id);
  if (error) {
    console.error("Error marking message read:", error);
    return false;
  }
  return true;
};

export const deleteContactMessage = async (id: string): Promise<void> => {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) console.error("Error deleting contact message:", error);
};

// ── PAGE VIEW ANALYTICS ───────────────────────────────────────────────────────

export const trackPageView = async (path: string): Promise<void> => {
  try {
    await supabase.from("page_views").insert({
      path,
      referrer: document.referrer || null,
    });
  } catch {
    // silently fail — analytics should never break the page
  }
};

export type PageViewStat = { path: string; count: number };

export const loadPageViewStats = async (limit = 20): Promise<PageViewStat[]> => {
  const { data, error } = await supabase
    .from("page_views")
    .select("path")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) {
    console.error("Error loading page views:", error);
    return [];
  }
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.path] = (counts[row.path] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const loadTotalPageViews = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("page_views")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
};

// ── BLOG POST VIEW COUNTS ─────────────────────────────────────────────────────

export const incrementBlogPostViews = async (slug: string): Promise<void> => {
  try {
    // Try update first
    const { data } = await supabase
      .from("blog_post_views")
      .select("views")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      await supabase
        .from("blog_post_views")
        .update({ views: (data.views ?? 0) + 1 })
        .eq("slug", slug);
    } else {
      await supabase.from("blog_post_views").insert({ slug, views: 1 });
    }
  } catch {
    // silently fail
  }
};

export const loadBlogPostViews = async (slug: string): Promise<number> => {
  const { data } = await supabase
    .from("blog_post_views")
    .select("views")
    .eq("slug", slug)
    .maybeSingle();
  return data?.views ?? 0;
};

// ── SKILL PROGRESS HISTORY ────────────────────────────────────────────────────

export type SkillProgressPoint = { progress: number; recordedAt: string };

export const loadSkillProgressHistory = async (skillId: string): Promise<SkillProgressPoint[]> => {
  const { data, error } = await supabase
    .from("skill_progress_history")
    .select("progress, recorded_at")
    .eq("skill_id", skillId)
    .order("recorded_at", { ascending: true })
    .limit(30);
  if (error) return [];
  return (data || []).map((row: any) => ({
    progress: row.progress,
    recordedAt: row.recorded_at,
  }));
};

export const snapshotSkillProgress = async (skillId: string, progress: number): Promise<void> => {
  await supabase.from("skill_progress_history").insert({ skill_id: skillId, progress });
};

/** Estimated reading time in minutes (200 wpm average). */
export const estimateReadTime = (content: string, contentFormat: BlogContentFormat): number => {
  const text =
    contentFormat === "html"
      ? content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      : content.replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

/** Views grouped by day for the last N days — used in the analytics line chart. */
export type DailyViewStat = { date: string; views: number };

export const loadDailyPageViews = async (days = 30): Promise<DailyViewStat[]> => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("page_views")
    .select("created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (error) return [];

  const counts: Record<string, number> = {};
  // Pre-fill all days with 0
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    counts[key] = 0;
  }
  for (const row of data || []) {
    const key = (row.created_at as string).slice(0, 10);
    if (key in counts) counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.entries(counts).map(([date, views]) => ({ date, views }));
};

/** Unique visitor count approximated by distinct referrer+day combos (best-effort). */
export const loadTodayPageViews = async (): Promise<number> => {
  const today = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from("page_views")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lte("created_at", `${today}T23:59:59.999Z`);
  if (error) return 0;
  return count ?? 0;
};

/** All-time daily views — groups every page_view row by date. */
export const loadAllTimeDailyPageViews = async (): Promise<DailyViewStat[]> => {
  const { data, error } = await supabase
    .from("page_views")
    .select("created_at")
    .order("created_at", { ascending: true });

  if (error) return [];

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    const key = (row.created_at as string).slice(0, 10);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }));
};

/** Upload a resume/CV PDF to Supabase Storage and return its public URL. */
export const uploadResume = async (file: File): Promise<string | null> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const key = `resume/cv-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("blog-media").upload(key, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || "application/pdf",
  });
  if (error) {
    console.error("Error uploading resume:", error);
    return null;
  }
  const { data } = supabase.storage.from("blog-media").getPublicUrl(key);
  return data.publicUrl;
};

// ── NEWSLETTER ────────────────────────────────────────────────────────────────

export type NewsletterSubscriber = {
  id: string;
  email: string;
  confirmed: boolean;
  createdAt: string;
};

export const subscribeToNewsletter = async (email: string): Promise<"ok" | "duplicate" | "error"> => {
  const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
  if (!error) return "ok";
  // Postgres unique violation code
  if (error.code === "23505") return "duplicate";
  console.error("Newsletter subscribe error:", error);
  return "error";
};

export const loadNewsletterSubscribers = async (): Promise<NewsletterSubscriber[]> => {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("Error loading subscribers:", error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    email: row.email,
    confirmed: row.confirmed,
    createdAt: row.created_at,
  }));
};

export const deleteNewsletterSubscriber = async (id: string): Promise<void> => {
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) console.error("Error deleting subscriber:", error);
};

export const loadNewsletterSubscriberCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
};
