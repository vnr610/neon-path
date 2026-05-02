import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput, SaberTextarea } from "@/components/saber/FormField";

const AdminTimeline = () => (
  <AdminLayout title="Timeline">
    <AdminFormShell
      eyebrow="new entry"
      title="Add Timeline Entry"
      description="Mark a milestone on the journey — small wins compound into mastery."
      submitLabel="Engrave Entry"
    >
      <FormSection title="When & Where">
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="date" label="Date" required>
            <SaberInput id="date" type="date" />
          </FormField>
          <FormField id="realm" label="Realm" required hint="Which discipline this milestone belongs to.">
            <SaberInput id="realm" placeholder="Full Stack / Cyber" maxLength={40} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="The Milestone">
        <FormField id="title" label="Title" required>
          <SaberInput id="title" placeholder="A single line worth remembering" maxLength={100} />
        </FormField>
        <FormField id="desc" label="Description" optional hint="Context, what changed, what was learned.">
          <SaberTextarea id="desc" rows={5} placeholder="What happened? Why does it matter?" maxLength={800} />
        </FormField>
      </FormSection>
    </AdminFormShell>
  </AdminLayout>
);

export default AdminTimeline;
