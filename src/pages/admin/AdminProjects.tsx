import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput, SaberTextarea } from "@/components/saber/FormField";

const AdminProjects = () => (
  <AdminLayout title="Projects">
    <AdminFormShell
      eyebrow="new project"
      title="Forge Project"
      description="Add a project to the vault — link the repository, the live build, and the tech behind it."
      submitLabel="Forge Entry"
    >
      <FormSection title="Overview">
        <FormField id="name" label="Project Name" required>
          <SaberInput id="name" placeholder="Codename or product title" maxLength={80} />
        </FormField>
        <FormField id="desc" label="Description" required hint="One paragraph. Lead with the problem it solves.">
          <SaberTextarea id="desc" rows={4} placeholder="What does it do? Who is it for?" maxLength={500} />
        </FormField>
      </FormSection>

      <FormSection title="Links">
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="repo" label="Repository URL" optional>
            <SaberInput id="repo" type="url" placeholder="https://github.com/…" inputMode="url" />
          </FormField>
          <FormField id="live" label="Live URL" optional>
            <SaberInput id="live" type="url" placeholder="https://…" inputMode="url" />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Presentation">
        <FormField id="stack" label="Tech Stack" required hint="Comma-separated. Order by prominence in the build.">
          <SaberInput id="stack" placeholder="React, Node, Postgres" />
        </FormField>
        <FormField id="cover" label="Cover Image URL" optional hint="16:9 recommended for clean grid display.">
          <SaberInput id="cover" type="url" placeholder="https://…" inputMode="url" />
        </FormField>
      </FormSection>
    </AdminFormShell>
  </AdminLayout>
);

export default AdminProjects;
