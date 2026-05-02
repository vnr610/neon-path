import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell } from "@/components/saber/AdminFormShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Field = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const AdminSkills = () => (
  <AdminLayout title="Skills">
    <AdminFormShell eyebrow="// new skill" title="Add Skill" description="Catalog a new discipline within a realm.">
      <Field id="name" label="Skill Name"><Input id="name" placeholder="e.g. TypeScript" className="bg-background/60 saber-border" /></Field>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="category" label="Category">
          <Select><SelectTrigger id="category" className="bg-background/60 saber-border"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fullstack">Full Stack</SelectItem>
              <SelectItem value="cyber">Cybersecurity</SelectItem>
            </SelectContent></Select>
        </Field>
        <Field id="level" label="Realm Level">
          <Select><SelectTrigger id="level" className="bg-background/60 saber-border"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="initiate">Initiate</SelectItem>
              <SelectItem value="apprentice">Apprentice</SelectItem>
              <SelectItem value="knight">Knight</SelectItem>
              <SelectItem value="master">Master</SelectItem>
              <SelectItem value="grandmaster">Grandmaster</SelectItem>
            </SelectContent></Select>
        </Field>
      </div>
      <Field id="progress" label="Progress (0-100)"><Input id="progress" type="number" min={0} max={100} placeholder="0" className="bg-background/60 saber-border" /></Field>
    </AdminFormShell>
  </AdminLayout>
);

export default AdminSkills;
