import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell } from "@/components/saber/AdminFormShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Field = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const AdminCertifications = () => (
  <AdminLayout title="Certifications">
    <AdminFormShell eyebrow="// new credential" title="Add Certification" description="Record an earned credential.">
      <Field id="name" label="Certification Name"><Input id="name" placeholder="e.g. OSCP" className="bg-background/60 saber-border" /></Field>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="issuer" label="Issuer"><Input id="issuer" placeholder="Issuing organization" className="bg-background/60 saber-border" /></Field>
        <Field id="date" label="Date Issued"><Input id="date" type="date" className="bg-background/60 saber-border" /></Field>
      </div>
      <Field id="url" label="Verification URL"><Input id="url" placeholder="https://..." className="bg-background/60 saber-border" /></Field>
      <Field id="badge" label="Badge Image URL"><Input id="badge" placeholder="https://..." className="bg-background/60 saber-border" /></Field>
    </AdminFormShell>
  </AdminLayout>
);

export default AdminCertifications;
