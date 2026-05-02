import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput } from "@/components/saber/FormField";

const AdminCertifications = () => (
  <AdminLayout title="Certifications">
    <AdminFormShell
      eyebrow="new credential"
      title="Add Certification"
      description="Record an earned credential — verification links and badge art keep it credible."
      submitLabel="Seal Credential"
    >
      <FormSection title="Credential">
        <FormField id="name" label="Certification Name" required>
          <SaberInput id="name" placeholder="e.g. OSCP" maxLength={100} />
        </FormField>
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="issuer" label="Issuer" required>
            <SaberInput id="issuer" placeholder="Issuing organization" maxLength={80} />
          </FormField>
          <FormField id="date" label="Date Issued" required>
            <SaberInput id="date" type="date" />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Proof">
        <FormField id="url" label="Verification URL" optional hint="Public link reviewers can click to verify.">
          <SaberInput id="url" type="url" placeholder="https://…" inputMode="url" />
        </FormField>
        <FormField id="badge" label="Badge Image URL" optional hint="PNG or SVG — square aspect renders best.">
          <SaberInput id="badge" type="url" placeholder="https://…" inputMode="url" />
        </FormField>
      </FormSection>
    </AdminFormShell>
  </AdminLayout>
);

export default AdminCertifications;
