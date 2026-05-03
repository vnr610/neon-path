import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput } from "@/components/saber/FormField";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, ExternalLink, FileUp, ImagePlus, LayoutTemplate, Loader2, X } from "lucide-react";
import { loadSiteHome, saveSiteHomeSettings, uploadResume, uploadBlogMedia } from "@/lib/content";

const AdminHome = () => {
  // Handles
  const [githubUsername, setGithubUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [hacktheboxUsername, setHacktheboxUsername] = useState("");
  const [hackeroneUsername, setHackeroneUsername] = useState("");
  // Profile
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  // Resume
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  // Form
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
      setBio(s.bio ?? "");
      setLinkedinUrl(s.linkedinUrl ?? "");
      setTwitterUrl(s.twitterUrl ?? "");
      setAvatarUrl(s.avatarUrl ?? "");
      setResumeUrl(s.resumeUrl ?? "");
    });
    return () => { cancelled = true; };
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setResumeError("File too large — max 10 MB."); return; }
    setUploadingResume(true);
    setResumeError("");
    const url = await uploadResume(file);
    setUploadingResume(false);
    if (url) { setResumeUrl(url); } else { setResumeError("Upload failed. Check storage bucket permissions."); }
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setAvatarError("File too large — max 5 MB."); return; }
    setUploadingAvatar(true);
    setAvatarError("");
    const url = await uploadBlogMedia(file, "avatars");
    setUploadingAvatar(false);
    if (url) { setAvatarUrl(url); } else { setAvatarError("Upload failed."); }
    if (avatarInputRef.current) avatarInputRef.current.value = "";
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
      bio: bio.trim() || null,
      linkedinUrl: linkedinUrl.trim() || null,
      twitterUrl: twitterUrl.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
    });

    if (!ok) {
      setStatus("error");
      setErrors(["Could not save. Confirm the migration is applied and you are signed in as admin."]);
      return;
    }
    setStatus("success");
    setStatusMessage("Profile saved successfully.");
  };

  const handleDiscard = () => {
    loadSiteHome().then((s) => {
      setGithubUsername(s.githubUsername ?? "");
      setLeetcodeUsername(s.leetcodeUsername ?? "");
      setHacktheboxUsername(s.hacktheboxUsername ?? "");
      setHackeroneUsername(s.hackeroneUsername ?? "");
      setBio(s.bio ?? "");
      setLinkedinUrl(s.linkedinUrl ?? "");
      setTwitterUrl(s.twitterUrl ?? "");
      setAvatarUrl(s.avatarUrl ?? "");
      setResumeUrl(s.resumeUrl ?? "");
      setStatus("idle");
      setStatusMessage(undefined);
      setErrors([]);
      setResumeError("");
      setAvatarError("");
    });
  };

  return (
    <AdminLayout title="Home page">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <AdminFormShell
          eyebrow="site profile"
          title="Profile & handles"
          description="Your bio, social links, avatar, resume, and external platform handles."
          submitLabel="Save profile"
          onSubmit={handleSubmit}
          onDiscard={handleDiscard}
          status={status}
          statusMessage={statusMessage}
          errors={errors}
        >
          {/* ── Profile section ── */}
          <FormSection title="Profile">

            {/* Avatar */}
            <FormField id="avatarUrl" label="Profile photo" optional hint="Upload a square image (JPG/PNG, max 5 MB)">
              <div className="space-y-2">
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar preview" className="h-14 w-14 rounded-md object-cover border border-border/60" />
                  ) : (
                    <div className="h-14 w-14 rounded-md border border-dashed border-border/60 flex items-center justify-center">
                      <ImagePlus className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" className="saber-border"
                      onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}>
                      {uploadingAvatar ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading…</> : <><FileUp className="mr-2 h-3.5 w-3.5" />Upload</>}
                    </Button>
                    {avatarUrl && (
                      <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => setAvatarUrl("")}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                {avatarError && <p className="text-xs text-destructive font-mono">{avatarError}</p>}
              </div>
            </FormField>

            {/* Bio */}
            <FormField id="bio" label="Bio" optional hint="Write in plain text. Separate paragraphs with a blank line.">
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="I'm a developer and security researcher from Nepal..."
                rows={6}
                maxLength={2000}
                className="w-full rounded-md border border-border/60 bg-background/60 px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors resize-none"
              />
              <p className="text-[10px] text-muted-foreground/40 text-right tabular-nums mt-1">{bio.length} / 2000</p>
            </FormField>
          </FormSection>

          {/* ── Social links ── */}
          <FormSection title="Social links">
            <FormField id="linkedinUrl" label="LinkedIn URL" optional hint="Full URL — e.g. https://linkedin.com/in/yourname">
              <SaberInput name="linkedinUrl" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" maxLength={200} />
            </FormField>
            <FormField id="twitterUrl" label="Twitter / X URL" optional hint="Full URL — e.g. https://x.com/yourhandle">
              <SaberInput name="twitterUrl" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/…" maxLength={200} />
            </FormField>
          </FormSection>

          {/* ── Platform handles ── */}
          <FormSection title="Platform handles">
            <FormField id="githubUsername" label="GitHub username" optional hint="Handle only — e.g. vnr610">
              <SaberInput name="githubUsername" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="vnr610" maxLength={80} />
            </FormField>
            <FormField id="leetcodeUsername" label="LeetCode username" optional hint="From leetcode.com/u/…">
              <SaberInput name="leetcodeUsername" value={leetcodeUsername} onChange={(e) => setLeetcodeUsername(e.target.value)} placeholder="vnrbl0" maxLength={80} />
            </FormField>
            <FormField id="hacktheboxUsername" label="Hack The Box profile ID" optional hint="Segment after /users/ in your HTB URL">
              <SaberInput name="hacktheboxUsername" value={hacktheboxUsername} onChange={(e) => setHacktheboxUsername(e.target.value)} placeholder="2529205" maxLength={80} />
            </FormField>
            <FormField id="hackeroneUsername" label="HackerOne username" optional hint="Profile slug from hackerone.com/…">
              <SaberInput name="hackeroneUsername" value={hackeroneUsername} onChange={(e) => setHackeroneUsername(e.target.value)} placeholder="vnr610" maxLength={80} />
            </FormField>
          </FormSection>

          {/* ── Resume ── */}
          <FormSection title="Resume / CV">
            <FormField id="resumeUrl" label="Resume file" optional hint="Upload a PDF or paste a direct URL.">
              <div className="space-y-2">
                <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="saber-border shrink-0"
                    onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume}>
                    {uploadingResume ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading…</> : <><FileUp className="mr-2 h-3.5 w-3.5" />Upload PDF</>}
                  </Button>
                  {resumeUrl && (
                    <>
                      <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                        <a href={resumeUrl} target="_blank" rel="noreferrer"><ExternalLink className="mr-1.5 h-3.5 w-3.5" />Preview</a>
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => setResumeUrl("")}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
                {resumeError && <p className="text-xs text-destructive font-mono">{resumeError}</p>}
                {resumeUrl ? (
                  <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                    <Download className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <p className="font-mono text-[10px] text-muted-foreground truncate flex-1">{resumeUrl}</p>
                  </div>
                ) : (
                  <SaberInput name="resumeUrl" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://… or upload above" maxLength={500} />
                )}
              </div>
            </FormField>
          </FormSection>
        </AdminFormShell>

        {/* ── Sidebar ── */}
        <aside className="space-y-4">
          <div className="saber-card p-6">
            <LayoutTemplate className="h-8 w-8 text-saber-blue mb-4" />
            <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em] mb-2">Featured grid</p>
            <p className="text-sm text-muted-foreground mb-4">
              Pin up to three builds on the home page from{" "}
              <Link to="/admin/projects" className="text-saber-blue hover:underline">Projects</Link>
              : enable <span className="text-foreground">Show on home page</span> and pick slot order.
            </p>
            <Button asChild variant="outline" size="sm" className="saber-border w-full">
              <Link to="/admin/projects">Manage project slots <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="saber-card p-6 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">Preview links</p>
            <Button asChild variant="outline" size="sm" className="saber-border w-full">
              <Link to="/about">View About page <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="saber-border w-full">
              <Link to="/">View Home page <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
};

export default AdminHome;
