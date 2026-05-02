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

const AdminProjects = () => (
  <AdminLayout title="Projects">
    <AdminFormShell eyebrow="// new project" title="Forge Project" description="Add a project to the vault.">
      <Field id="name" label="Project Name"><Input id="name" placeholder="Project name" className="bg-background/60 saber-border" /></Field>
      <Field id="desc" label="Description"><Textarea id="desc" rows={3} placeholder="What does it do?" className="bg-background/60 saber-border" /></Field>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="repo" label="Repository URL"><Input id="repo" placeholder="https://github.com/..." className="bg-background/60 saber-border" /></Field>
        <Field id="live" label="Live URL"><Input id="live" placeholder="https://..." className="bg-background/60 saber-border" /></Field>
      </div>
      <Field id="stack" label="Tech Stack"><Input id="stack" placeholder="React, Node, Postgres" className="bg-background/60 saber-border" /></Field>
      <Field id="cover" label="Cover Image URL"><Input id="cover" placeholder="https://..." className="bg-background/60 saber-border" /></Field>
    </AdminFormShell>
  </AdminLayout>
);

export default AdminProjects;
