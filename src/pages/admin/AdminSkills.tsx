import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput } from "@/components/saber/FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import { LevelBadge } from "@/components/saber/LevelBadge";
import { SaberProgress } from "@/components/saber/SaberProgress";
import {
  addSkill,
  deleteSkill,
  loadSkills,
  updateSkill,
  type Skill,
} from "@/lib/content";

const triggerCls =
  "w-full h-10 rounded-md bg-background/40 border border-border/60 px-3.5 text-sm font-mono hover:border-foreground/30 focus:border-foreground/70 focus:ring-0 focus:ring-offset-0 transition-all";

const blankSkillForm = {
  name: "",
  category: "",
  level: "",
  progress: "0",
};

const AdminSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankSkillForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      const data = await loadSkills();
      setSkills(data);
    };
    fetchSkills();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData(blankSkillForm);
    setStatus("idle");
    setStatusMessage(undefined);
    setErrors([]);
  };

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      progress: String(skill.progress),
    });
    setStatus("ready");
    setStatusMessage("Editing existing skill.");
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    await deleteSkill(id);
    const data = await loadSkills();
    setSkills(data);
    if (editingId === id) resetForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setStatusMessage(undefined);
    setErrors([]);

    const name = formData.name.trim();
    const category = formData.category.trim();
    const level = formData.level.trim();
    const progress = Number(formData.progress);
    const nextErrors: string[] = [];

    if (!name) nextErrors.push("Skill name is required.");
    if (!category) nextErrors.push("Category is required.");
    if (!level) nextErrors.push("Realm level is required.");
    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      nextErrors.push("Progress must be a whole number between 0 and 100.");
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      return;
    }

    if (editingId) {
      await updateSkill(editingId, { name, category: category as "fullstack" | "cyber", level, progress });
      setStatus("success");
      setStatusMessage("Skill updated successfully.");
    } else {
      await addSkill({ name, category: category as "fullstack" | "cyber", level, progress });
      setStatus("success");
      setStatusMessage("Skill added to the codex.");
    }

    const data = await loadSkills();
    setSkills(data);
    resetForm();
  };

  return (
    <AdminLayout title="Skills">
      <div className="grid gap-8 lg:grid-cols-[minmax(420px,1fr)_340px]">
        <AdminFormShell
          eyebrow={editingId ? "edit skill" : "new skill"}
          title={editingId ? "Update Skill" : "Add Skill"}
          description="Catalog a new discipline within a realm — track mastery from Initiate to Grandmaster."
          submitLabel={editingId ? "Save Changes" : "Add to Codex"}
          onSubmit={handleSubmit}
          status={status}
          statusMessage={statusMessage}
          errors={errors}
        >
          <FormSection title="Definition">
            <FormField id="name" label="Skill Name" required hint="The canonical name as you'd say it aloud.">
              <SaberInput
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. TypeScript"
                maxLength={60}
              />
            </FormField>
          </FormSection>

          <FormSection title="Classification">
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField id="category" label="Category" required>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
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
              <SaberInput
                name="progress"
                type="number"
                min={0}
                max={100}
                step={1}
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                placeholder="0"
              />
            </FormField>
          </FormSection>
        </AdminFormShell>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Saved skills</p>
              <p className="text-sm text-muted-foreground">Edit or delete existing entries in the codex.</p>
            </div>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>

          {skills.length === 0 ? (
            <div className="saber-card p-6 text-muted-foreground">No saved skills yet.</div>
          ) : (
            <div className="space-y-3">
              {skills.map((skill) => (
                <article key={skill.id} className="saber-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <LevelBadge
                        label={skill.category === "fullstack" ? "Full Stack" : "Cybersecurity"}
                        variant={skill.category === "fullstack" ? "blue" : "purple"}
                      />
                      <h3 className="mt-3 text-lg font-semibold">{skill.name}</h3>
                      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">{skill.level}</p>
                      <div className="mt-4 max-w-xs">
                        <SaberProgress label="Progress" value={skill.progress} variant={skill.category === "fullstack" ? "blue" : "purple"} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(skill)}>
                        <Edit3 className="h-4 w-4" /> Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(skill.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminSkills;
