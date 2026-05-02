import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell } from "@/components/saber/AdminFormShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Field = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const AdminBlog = () => (
  <AdminLayout title="Blog Posts">
    <AdminFormShell eyebrow="// new post" title="Compose Blog Post" description="Inscribe a new entry into the journal.">
      <Field id="title" label="Title"><Input id="title" placeholder="Post title" className="bg-background/60 saber-border" /></Field>
      <Field id="slug" label="Slug"><Input id="slug" placeholder="post-slug" className="bg-background/60 saber-border" /></Field>
      <Field id="excerpt" label="Excerpt"><Textarea id="excerpt" rows={2} placeholder="Short summary..." className="bg-background/60 saber-border" /></Field>
      <Field id="content" label="Content (Markdown)"><Textarea id="content" rows={10} placeholder="# Heading..." className="bg-background/60 saber-border font-mono text-xs" /></Field>
      <Field id="tags" label="Tags"><Input id="tags" placeholder="comma, separated, tags" className="bg-background/60 saber-border" /></Field>
    </AdminFormShell>
  </AdminLayout>
);

export default AdminBlog;
