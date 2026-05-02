import { supabase } from "@/integrations/supabase/client";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  createdAt: string;
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
};

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

  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    content: row.content,
    tags: row.tags || [],
    createdAt: row.created_at,
  }));
};

export const addBlogPost = async (post: Omit<BlogPost, "id" | "createdAt">) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding blog post:", error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || "",
    content: data.content,
    tags: data.tags || [],
    createdAt: data.created_at,
  };
};

export const updateBlogPost = async (id: string, updates: Partial<Omit<BlogPost, "id" | "createdAt">>) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.slug !== undefined && { slug: updates.slug }),
      ...(updates.excerpt !== undefined && { excerpt: updates.excerpt }),
      ...(updates.content !== undefined && { content: updates.content }),
      ...(updates.tags !== undefined && { tags: updates.tags }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating blog post:", error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || "",
    content: data.content,
    tags: data.tags || [],
    createdAt: data.created_at,
  };
};

export const deleteBlogPost = async (id: string) => {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) {
    console.error("Error deleting blog post:", error);
  }
};

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

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    desc: row.desc,
    repo: row.repo || undefined,
    live: row.live || undefined,
    stack: row.stack,
    cover: row.cover || undefined,
    createdAt: row.created_at,
  }));
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
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding project:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    desc: data.desc,
    repo: data.repo || undefined,
    live: data.live || undefined,
    stack: data.stack,
    cover: data.cover || undefined,
    createdAt: data.created_at,
  };
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
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    desc: data.desc,
    repo: data.repo || undefined,
    live: data.live || undefined,
    stack: data.stack,
    cover: data.cover || undefined,
    createdAt: data.created_at,
  };
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
