import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import {
  FormField,
  FormSection,
  SaberInput,
  SaberDatePicker,
} from "@/components/saber/FormField";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import {
  addCertification,
  deleteCertification,
  loadCertifications,
  updateCertification,
  type Certification,
} from "@/lib/content";

const blankCertificationForm = {
  name: "",
  issuer: "",
  url: "",
  badge: "",
};

const AdminCertifications = () => {
  const [issueDate, setIssueDate] = useState<Date | undefined>(undefined);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankCertificationForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchCertifications = async () => {
      const data = await loadCertifications();
      setCertifications(data);
    };
    fetchCertifications();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setIssueDate(undefined);
    setFormData(blankCertificationForm);
    setStatus("idle");
    setStatusMessage(undefined);
    setErrors([]);
  };

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id);
    setIssueDate(new Date(cert.date));
    setFormData({
      name: cert.name,
      issuer: cert.issuer,
      url: cert.url ?? "",
      badge: cert.badge ?? "",
    });
    setStatus("ready");
    setStatusMessage("Editing existing certification.");
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    await deleteCertification(id);
    const data = await loadCertifications();
    setCertifications(data);
    if (editingId === id) resetForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setStatusMessage(undefined);
    setErrors([]);

    const name = formData.name.trim();
    const issuer = formData.issuer.trim();
    const url = formData.url.trim();
    const badge = formData.badge.trim();
    const nextErrors: string[] = [];

    if (!name) nextErrors.push("Certification name is required.");
    if (!issuer) nextErrors.push("Issuer is required.");
    if (!issueDate) nextErrors.push("Date issued is required.");

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      return;
    }

    if (editingId) {
      await updateCertification(editingId, {
        name,
        issuer,
        date: issueDate.toISOString(),
        url: url || undefined,
        badge: badge || undefined,
      });
      setStatus("success");
      setStatusMessage("Certification updated successfully.");
    } else {
      await addCertification({
        name,
        issuer,
        date: issueDate.toISOString(),
        url: url || undefined,
        badge: badge || undefined,
      });
      setStatus("success");
      setStatusMessage("Certification sealed.");
    }

    const data = await loadCertifications();
    setCertifications(data);
    resetForm();
  };

  return (
    <AdminLayout title="Certifications">
      <div className="grid gap-8 lg:grid-cols-[minmax(420px,1fr)_340px]">
        <AdminFormShell
          eyebrow={editingId ? "edit credential" : "new credential"}
          title={editingId ? "Update Certification" : "Add Certification"}
          description="Record an earned credential — verification links and badge art keep it credible."
          submitLabel={editingId ? "Save Changes" : "Seal Credential"}
          onSubmit={handleSubmit}
          status={status}
          statusMessage={statusMessage}
          errors={errors}
        >
          <FormSection title="Credential">
            <FormField id="name" label="Certification Name" required>
              <SaberInput
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. OSCP"
                maxLength={100}
              />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField id="issuer" label="Issuer" required>
                <SaberInput
                  name="issuer"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="Issuing organization"
                  maxLength={80}
                />
              </FormField>
              <FormField id="date" label="Date Issued" required>
                <SaberDatePicker
                  value={issueDate}
                  onChange={setIssueDate}
                  placeholder="Select issue date"
                  disabledDates={(d) => d > new Date()}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Proof">
            <FormField id="url" label="Verification URL" optional hint="Public link reviewers can click to verify.">
              <SaberInput
                name="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://…"
                inputMode="url"
              />
            </FormField>
            <FormField id="badge" label="Badge Image URL" optional hint="PNG or SVG — square aspect renders best.">
              <SaberInput
                name="badge"
                type="url"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="https://…"
                inputMode="url"
              />
            </FormField>
          </FormSection>
        </AdminFormShell>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Saved certifications</p>
              <p className="text-sm text-muted-foreground">Manage credentials and verification links.</p>
            </div>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>

          {certifications.length === 0 ? (
            <div className="saber-card p-6 text-muted-foreground">No certifications recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {certifications.map((cert) => (
                <article key={cert.id} className="saber-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{cert.issuer}</p>
                      <h3 className="mt-2 text-lg font-semibold">{cert.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{new Date(cert.date).toLocaleDateString()}</p>
                      {cert.url && (
                        <a href={cert.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-saber-blue hover:underline">
                          Verify credential
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(cert)}>
                        <Edit3 className="h-4 w-4" /> Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(cert.id)}>
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

export default AdminCertifications;
