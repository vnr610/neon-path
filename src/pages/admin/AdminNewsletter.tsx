import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  loadNewsletterSubscribers,
  loadNewsletterSubscriberCount,
  deleteNewsletterSubscriber,
  formatDate,
  type NewsletterSubscriber,
} from "@/lib/content";
import {
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Trash2,
  Users,
} from "lucide-react";

type BroadcastStatus = "idle" | "sending" | "success" | "error";

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Broadcast form
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState<BroadcastStatus>("idle");
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [subs, c] = await Promise.all([
      loadNewsletterSubscribers(),
      loadNewsletterSubscriberCount(),
    ]);
    setSubscribers(subs);
    setCount(c);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    await deleteNewsletterSubscriber(id);
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    setCount((c) => Math.max(0, c - 1));
  };

  const handleBroadcast = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setBroadcastStatus("sending");
    setBroadcastMsg("");

    try {
      const { data, error } = await supabase.functions.invoke("newsletter-broadcast", {
        body: { subject: subject.trim(), body: body.trim() },
      });
      if (error) throw error;
      setBroadcastStatus("success");
      setBroadcastMsg(`Sent to ${data?.sent ?? 0} subscriber${data?.sent !== 1 ? "s" : ""}.`);
      setSubject("");
      setBody("");
    } catch (err: any) {
      setBroadcastStatus("error");
      setBroadcastMsg(err?.message ?? "Broadcast failed. Check your Resend API key.");
    }
  };

  return (
    <AdminLayout title="Newsletter">
      <div className="space-y-10">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/40 mb-1">
              // newsletter · management
            </p>
            <h2 className="font-display text-2xl font-bold">Newsletter</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage subscribers and send broadcasts via Resend.
            </p>
          </div>
          <Button variant="outline" size="sm" className="saber-border gap-2" onClick={fetchData}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="saber-card p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-md saber-border flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-saber-blue" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Total subscribers</p>
              <p className="font-display text-3xl tabular-nums mt-0.5">
                {loading ? <span className="text-muted-foreground/30 animate-pulse">…</span> : count}
              </p>
            </div>
          </div>
          <div className="saber-card p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-md saber-border flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-saber-blue" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Resend status</p>
              <p className="text-sm font-mono mt-0.5 text-muted-foreground">
                {Deno !== undefined ? "Edge function ready" : "Ready"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Broadcast form ── */}
        <div className="saber-card p-6 sm:p-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-4">
            // send · broadcast
          </p>
          <h3 className="font-display text-lg font-semibold mb-5">Send to all subscribers</h3>

          {broadcastStatus === "success" ? (
            <div className="flex items-center gap-3 p-4 rounded-md border border-border/60 bg-muted/20">
              <CheckCircle2 className="h-5 w-5 text-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Broadcast sent</p>
                <p className="text-xs text-muted-foreground font-mono">{broadcastMsg}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground"
                onClick={() => setBroadcastStatus("idle")}
              >
                New broadcast
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="New writeup: Exploiting XSS in the wild"
                  maxLength={150}
                  className="w-full rounded-md border border-border/60 bg-background/60 px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Body
                </label>
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={"Hey,\n\nJust published a new writeup on...\n\nRead it here: https://..."}
                  rows={8}
                  maxLength={5000}
                  className="w-full rounded-md border border-border/60 bg-background/60 px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors resize-none"
                />
                <p className="text-[10px] text-muted-foreground/40 text-right tabular-nums">
                  {body.length} / 5000 · Separate paragraphs with a blank line
                </p>
              </div>

              {broadcastStatus === "error" && (
                <p className="text-sm text-destructive font-mono">{broadcastMsg}</p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={broadcastStatus === "sending" || count === 0}
                  className="bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 gap-2"
                >
                  {broadcastStatus === "sending" ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Sending…</>
                  ) : (
                    <><Send className="h-4 w-4" />Send to {count} subscriber{count !== 1 ? "s" : ""}</>
                  )}
                </Button>
                {count === 0 && (
                  <p className="text-xs text-muted-foreground font-mono">No subscribers yet.</p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* ── Subscriber list ── */}
        <div className="saber-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-0.5">
                // subscriber · list
              </p>
              <p className="text-sm font-medium">All subscribers</p>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/40 tabular-nums">
              {count} total
            </span>
          </div>

          {loading ? (
            <div className="divide-y divide-border/40">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="h-3 flex-1 rounded bg-muted/30 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted/20 animate-pulse" />
                </div>
              ))}
            </div>
          ) : subscribers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Mail className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No subscribers yet.</p>
              <p className="text-xs text-muted-foreground/50 font-mono mt-1">
                The subscribe form is in the footer of your site.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {subscribers.map((sub) => (
                <div key={sub.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-muted/10 transition-colors">
                  <div className="h-7 w-7 rounded-md saber-border flex items-center justify-center shrink-0">
                    <Mail className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                  <span className="font-mono text-sm flex-1 min-w-0 truncate">{sub.email}</span>
                  <span className="font-mono text-[10px] text-muted-foreground/40 shrink-0 hidden sm:block">
                    {formatDate(sub.createdAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground/40 hover:text-destructive shrink-0"
                    onClick={() => handleDelete(sub.id)}
                    title="Remove subscriber"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="px-6 py-3 border-t border-border/40 bg-background/20">
            <span className="font-mono text-[9px] text-muted-foreground/25 uppercase tracking-[0.22em]">
              vnr610 · realm · newsletter
            </span>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminNewsletter;
