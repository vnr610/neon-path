import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput, SaberTextarea } from "@/components/saber/FormField";

const AdminBlog = () => (
  <AdminLayout title="Blog Posts">
    <AdminFormShell
      eyebrow="new post"
      title="Compose Blog Post"
      description="Inscribe a new entry into the journal — markdown supported, drafts auto-saved."
      submitLabel="Publish Post"
    >
      <FormSection title="Identity">
        <FormField id="title" label="Title" required hint="Keep under 60 characters for clean SEO.">
          <SaberInput id="title" placeholder="The title of your transmission" maxLength={120} />
        </FormField>
        <FormField id="slug" label="Slug" required hint="Lowercase, hyphen-separated. Auto-generated from title if blank.">
          <SaberInput id="slug" placeholder="post-slug" pattern="[a-z0-9-]+" />
        </FormField>
      </FormSection>

      <FormSection title="Content">
        <FormField id="excerpt" label="Excerpt" optional hint="Short summary surfaced in lists and meta tags.">
          <SaberTextarea id="excerpt" rows={2} placeholder="A single line that draws the reader in…" maxLength={240} />
        </FormField>
        <FormField id="content" label="Content (Markdown)" required>
          <SaberTextarea id="content" rows={12} placeholder="# Heading&#10;&#10;Begin the chronicle…" />
        </FormField>
      </FormSection>

      <FormSection title="Taxonomy">
        <FormField id="tags" label="Tags" optional hint="Comma-separated. Used for filtering and discovery.">
          <SaberInput id="tags" placeholder="cybersecurity, react, devlog" />
        </FormField>
      </FormSection>
    </AdminFormShell>
  </AdminLayout>
);

export default AdminBlog;
