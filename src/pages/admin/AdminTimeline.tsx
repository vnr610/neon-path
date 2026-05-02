import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import {
  FormField,
  FormSection,
  SaberInput,
  SaberTextarea,
  SaberDatePicker,
} from "@/components/saber/FormField";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import {
  addTimelineEntry,
  deleteTimelineEntry,
  loadTimelineEntries,
  updateTimelineEntry,
  type TimelineEntry,
} from "@/lib/content";

const blankTimelineForm = {
  realm: "",
  title: "",
  desc: "",
};

const AdminTimeline = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankTimelineForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const data = await loadTimelineEntries();
      setEntries(data);
    };
    fetchEntries();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setDate(undefined);
    setFormData(blankTimelineForm);
    setStatus("idle");
    setStatusMessage(undefined);
    setErrors([]);
  };

  const handleEdit = (entry: TimelineEntry) => {
    setEditingId(entry.id);
    setDate(new Date(entry.date));
    setFormData({ realm: entry.realm, title: entry.title, desc: entry.desc ?? "" });
    setStatus("ready");
    setStatusMessage("Editing existing timeline entry.");
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    await deleteTimelineEntry(id);
    const data = await loadTimelineEntries();
    setEntries(data);
    if (editingId === id) resetForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setStatusMessage(undefined);
    setErrors([]);

    const realm = formData.realm.trim();
    const title = formData.title.trim();
    const desc = formData.desc.trim();
    const nextErrors: string[] = [];

    if (!date) nextErrors.push("Date is required.");
    if (!realm) nextErrors.push("Realm is required.");
    if (!title) nextErrors.push("Title is required.");

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      return;
    }

    if (editingId) {
      await updateTimelineEntry(editingId, {
        date: date.toISOString(),
        realm,
        title,
        desc: desc || undefined,
      });
      setStatus("success");
      setStatusMessage("Timeline updated successfully.");
    } else {
      await addTimelineEntry({
        date: date.toISOString(),
        realm,
        title,
        desc: desc || undefined,
      });
      setStatus("success");
      setStatusMessage("Timeline entry engraved.");
    }

    const data = await loadTimelineEntries();
    setEntries(data);
    resetForm();
  };

  return (
    <AdminLayout title="Timeline">
      <div className="grid gap-8 lg:grid-cols-[minmax(420px,1fr)_340px]">
        <AdminFormShell
          eyebrow={editingId ? "edit entry" : "new entry"}
          title={editingId ? "Update Timeline Entry" : "Add Timeline Entry"}
          description="Mark a milestone on the journey — small wins compound into mastery."
          submitLabel={editingId ? "Save Changes" : "Engrave Entry"}
          onSubmit={handleSubmit}
          status={status}
          statusMessage={statusMessage}
          errors={errors}
        >
          <FormSection title="When & Where">
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField id="date" label="Date" required>
                <SaberDatePicker
                  value={date}
                  onChange={setDate}
                  placeholder="Select milestone date"
                  disabledDates={(d) => d > new Date()}
                />
              </FormField>
              <FormField id="realm" label="Realm" required hint="Which discipline this milestone belongs to.">
                <SaberInput
                  name="realm"
                  value={formData.realm}
                  onChange={(e) => setFormData({ ...formData, realm: e.target.value })}
                  placeholder="Full Stack / Cyber"
                  maxLength={40}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="The Milestone">
            <FormField id="title" label="Title" required>
              <SaberInput
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="A single line worth remembering"
                maxLength={100}
              />
            </FormField>
            <FormField id="desc" label="Description" optional hint="Context, what changed, what was learned.">
              <SaberTextarea
                name="desc"
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                rows={5}
                placeholder="What happened? Why does it matter?"
                maxLength={800}
              />
            </FormField>
          </FormSection>
        </AdminFormShell>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Saved timeline</p>
              <p className="text-sm text-muted-foreground">Keep the path in order and update milestones as needed.</p>
            </div>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="saber-card p-6 text-muted-foreground">No timeline entries yet.</div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <article key={entry.id} className="saber-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                      <h3 className="mt-2 text-lg font-semibold">{entry.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{entry.realm}</p>
                      {entry.desc && <p className="mt-3 text-sm text-muted-foreground">{entry.desc}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                        <Edit3 className="h-4 w-4" /> Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
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

export default AdminTimeline;
