import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput } from "@/components/saber/FormField";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, ExternalLink, FileUp, LayoutTemplate, Loader2, X } from "lucide-react";
import { loadSiteHome, saveSiteHomeSettings, uploadResume } from "@/lib/content";

const AdminHome = () => {
  const [githubUsername, setGithubUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [hacktheboxUsername, setHacktheboxUsername] = useState("");
  const [hackeroneUsername, setHackeroneUsername] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadSiteHome().then((s) => {
      if (cancelled) return;
      setGithubUsername(s.githubUsername ?? "");
      setLeetcodeUsername(s.leetcodeUsername ?? "");
      setHacktheboxUsername(s.hacktheboxUsername ?? "");
      setHackeroneUsername(s.hackeroneUsername ?? "");
      setResumeUrl(s.resumeUrl ?? "");
    });
    return () => { cancelled = true; };
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large — max 10 MB.");
      return;
    }
    setUploading(true);
    setUploadError("");
    const url = await uploadResume(file);
    setUploading(false);
    if (url) {
      setResumeUrl(url);
    } else {
      setUploadError("Upload failed. Check storage bucket permissions.");
    }
    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setStatusMessage(undefined);
    setErrors([]);

    const ok = await saveSiteHomeSettings({
      githubUsername: githubUsername.trim() || null,
      leetcodeUsername: leetcodeUsername.trim() || null,
      hacktheboxUsername: hacktheboxUsername.trim() || null,
      hackeroneUsername: hackeroneUsername.trim() || null,
      resumeUrl: resumeUrl.trim() || null,
    });

    if (!ok) {
      setStatus("error");
      setErrors(["Could not save. Confirm the site_home migration is applied and you are signed in as admin."]);
      return;
    }

    setStatus("success");
    setStatusMessage("Handles saved. Skills scan will use these on next run.");
  };

  const handleDiscard = () => {
    loadSiteHome().then((s) => {
      setGithubUsername(s.githubUsername ?? "");
      setLeetcodeUsername(s.leetcodeUsername ?? "");
      setHacktheboxUsername(s.hacktheboxUsername ?? "");
      setHackeroneUsername(s.hackeroneUsername ?? "");
      setResumeUrl(s.resumeUrl ?? "");
      setStatus("idle");
      setStatusMessage(undefined);
      setErrors([]);
      setUploadError("");
    });
  };

  return (
    <AdminLayout title="Home page">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <AdminFormShell
          eyebrow="profile handles"
          title="Sync handles"
          description="External profile usernames used to sync achievements on the Skills page and auto-derive skill progress."
          submitLabel="Save handles"
          onSubmit={handleSubmit}
          onDiscard={handleDiscard}
          status={status}
          statusMessage={statusMessage}
          errors={errors}
        >
          <FormSection title="Sync handles">
            <FormField
              id="githubUsername"
              label="GitHub username"
              optional
              hint="Handle only — e.g. vnr610"
            >
              <SaberInput
                name="githubUsername"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="vnr610"
                maxLength={80}
              />
            </FormField>
            <FormField
              id="leetcodeUsername"
              label="LeetCode username"
              optional
              hint="From leetcode.com/u/… — e.g. vnrbl0"
            >
              <SaberInput
                name="leetcodeUsername"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="vnrbl0"
                maxLength={80}
              />
            </FormField>
            <FormField
              id="hacktheboxUsername"
              label="Hack The Box profile ID"
              optional
              hint="Segment after /users/ in your HTB URL — often numeric"
            >
              <SaberInput
                name="hacktheboxUsername"
                value={hacktheboxUsername}
                onChange={(e) => setHacktheboxUsername(e.target.value)}
                placeholder="2529205"
                maxLength={80}
              />
            </FormField>
            <FormField
              id="hackeroneUsername"
              label="HackerOne username"
              optional
              hint="Profile slug from hackerone.com/… — e.g. vnr610"
            >
              <SaberInput
                name="hackeroneUsername"
                value={hackeroneUsername}
                onChange={(e) => setHackeroneUsername(e.target.value)}
                placeholder="vnr610"
                maxLength={80}
              />
            </FormField>
            <FormField
              id="resumeUrl"
              label="Resume / CV"
              optional
              hint="Upload a PDF or paste a direct URL. Shown as a download button on the About page."
            >
              {/* Upload button */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeUpload}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="saber-border shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading…</>
                    ) : (
                      <><FileUp className="mr-2 h-3.5 w-3.5" />Upload PDF</>
                    )}
                  </Button>
                  {resumeUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <a href={resumeUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Preview
                      </a>
                    </Button>
                  )}
                  {resumeUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setResumeUrl("")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-destructive font-mono">{uploadError}</p>
                )}

                {/* Current URL display / manual override */}
                {resumeUrl ? (
                  <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                    <Download className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <p className="font-mono text-[10px] text-muted-foreground truncate flex-1">{resumeUrl}</p>
                  </div>
                ) : (
                  <SaberInput
                    name="resumeUrl"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://… or upload above"
                    maxLength={500}
                  />
                )}
              </div>
            </FormField>
          </FormSection>
        </AdminFormShell>

        <aside className="space-y-4">
          <div className="saber-card p-6">
            <LayoutTemplate className="h-8 w-8 text-saber-blue mb-4" />
            <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em] mb-2">Featured grid</p>
            <p className="text-sm text-muted-foreground mb-4">
              Pin up to three builds on the home page from{" "}
              <Link to="/admin/projects" className="text-saber-blue hover:underline">
                Projects
              </Link>
              : enable <span className="text-foreground">Show on home page</span> and pick slot order.
            </p>
            <Button asChild variant="outline" size="sm" className="saber-border w-full">
              <Link to="/admin/projects">
                Manage project slots
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
};

export default AdminHome;
