import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput } from "@/components/saber/FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const triggerCls =
  "w-full h-10 rounded-md bg-background/40 border border-border/60 px-3.5 text-sm font-mono hover:border-foreground/30 focus:border-foreground/70 focus:ring-0 focus:ring-offset-0 transition-all";

const AdminSkills = () => (
  <AdminLayout title="Skills">
    <AdminFormShell
      eyebrow="new skill"
      title="Add Skill"
      description="Catalog a new discipline within a realm — track mastery from Initiate to Grandmaster."
      submitLabel="Add to Codex"
    >
      <FormSection title="Definition">
        <FormField id="name" label="Skill Name" required hint="The canonical name as you'd say it aloud.">
          <SaberInput id="name" placeholder="e.g. TypeScript" maxLength={60} />
        </FormField>
      </FormSection>

      <FormSection title="Classification">
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="category" label="Category" required>
            <Select>
              <SelectTrigger id="category" className={triggerCls}>
                <SelectValue placeholder="Select realm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fullstack">Full Stack</SelectItem>
                <SelectItem value="cyber">Cybersecurity</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="level" label="Realm Level" required>
            <Select>
              <SelectTrigger id="level" className={triggerCls}>
                <SelectValue placeholder="Select rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initiate">Initiate</SelectItem>
                <SelectItem value="apprentice">Apprentice</SelectItem>
                <SelectItem value="knight">Knight</SelectItem>
                <SelectItem value="master">Master</SelectItem>
                <SelectItem value="grandmaster">Grandmaster</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Progression">
        <FormField id="progress" label="Progress" hint="A whole number from 0 to 100 representing mastery.">
          <SaberInput id="progress" type="number" min={0} max={100} step={1} placeholder="0" />
        </FormField>
      </FormSection>
    </AdminFormShell>
  </AdminLayout>
);

export default AdminSkills;
