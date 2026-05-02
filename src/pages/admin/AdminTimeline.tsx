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

const AdminTimeline = () => (
  <AdminLayout title="Timeline">
    <AdminFormShell eyebrow="// new entry" title="Add Timeline Entry" description="Mark a milestone on the journey.">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="date" label="Date"><Input id="date" type="date" className="bg-background/60 saber-border" /></Field>
        <Field id="realm" label="Realm"><Input id="realm" placeholder="Full Stack / Cyber" className="bg-background/60 saber-border" /></Field>
      </div>
      <Field id="title" label="Title"><Input id="title" placeholder="Milestone title" className="bg-background/60 saber-border" /></Field>
      <Field id="desc" label="Description"><Textarea id="desc" rows={4} placeholder="What happened?" className="bg-background/60 saber-border" /></Field>
    </AdminFormShell>
  </AdminLayout>
);

export default AdminTimeline;
