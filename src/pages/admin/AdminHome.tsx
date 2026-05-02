import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput } from "@/components/saber/FormField";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutTemplate } from "lucide-react";
import { loadSiteHome, saveSiteHomeSettings } from "@/lib/content";

const AdminHome = () => {
  const [githubUsername, setGithubUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [hacktheboxUsername, setHacktheboxUsername] = useState("");
  const [hackeroneUsername, setHackeroneUsername] = useState("");
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
    });
    return () => { cancelled = true; };
  }, []);

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
      setStatus("idle");
      setStatusMessage(undefined);
      setErrors([]);
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
