import { useEffect, useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { SEO } from "@/components/saber/SEO";
import { ScrollReveal } from "@/components/saber/ScrollReveal";
import { Button } from "@/components/ui/button";
import { BookMarked, CheckCircle2, Loader2, MessageSquare, Send, User } from "lucide-react";
import {
  loadGuestbookEntries,
  submitGuestbookEntry,
  formatDate,
  type GuestbookEntry,
} from "@/lib/content";

type Status = "idle" | "submitting" | "success" | "error";

const Guestbook = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadGuestbookEntries(true).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setStatus("submitting");
    setErrorMsg("");

    const ok = await submitGuestbookEntry({ name, message });
    if (ok) {
      setStatus("success");
      setName("");
      setMessage("");
    } else {
      setStatus("error");
      setErrorMsg("Transmission failed. Try again.");
    }
  };

  return (
    <SiteLayout>
      <SEO
        title="Guestbook"
        description="Leave a note for VNR610 — thoughts, shoutouts, or just saying hi."
        path="/guestbook"
      />
      <div className="container py-16 max-w-3xl">
        <PageHeader
          title="Guestbook"
          subtitle="Leave a note. Say hi. Drop a shoutout."
        />

        {/* ── Submit form ── */}
        <ScrollReveal animation="fade-up">
          {status === "success" ? (
            <div className="saber-card p-8 flex flex-col items-center gap-4 text-center mb-12">
              <CheckCircle2 className="h-10 w-10 text-saber-blue animate-saber-pulse" />
              <h2 className="font-display text-lg font-semibold">Entry received</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your note is pending approval and will appear here shortly.
              </p>
              <Button variant="outline" className="saber-border mt-1" onClick={() => setStatus("idle")}>
                Leave another note
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="saber-card p-6 mb-12 space-y-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-2">
                // sign · the · book
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="gb-name" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <User className="h-3 w-3" /> Name
                  </label>
                  <input
                    id="gb-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your handle"
                    maxLength={60}
                    className="w-full rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="gb-message" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <MessageSquare className="h-3 w-3" /> Message
                  </label>
                  <textarea
                    id="gb-message"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Say something…"
                    rows={3}
                    maxLength={300}
                    className="w-full rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground/40 text-right tabular-nums">{message.length} / 300</p>
                </div>
              </div>

              {errorMsg && <p className="text-xs text-destructive font-mono">{errorMsg}</p>}

              <Button
                type="submit"
                disabled={status === "submitting"}
                className="bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue"
              >
                {status === "submitting" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing…</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" />Sign the book</>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground/40 font-mono">
                Entries are reviewed before appearing publicly.
              </p>
            </form>
          )}
        </ScrollReveal>

        {/* ── Entries ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <BookMarked className="h-4 w-4 text-muted-foreground/50" />
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50">
              {loading ? "Loading…" : `${entries.length} entr${entries.length !== 1 ? "ies" : "y"}`}
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="saber-card h-20 animate-pulse bg-muted/20" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="saber-card p-10 text-center">
              <BookMarked className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No entries yet. Be the first to sign.</p>
            </div>
          ) : (
            entries.map((entry, i) => (
              <ScrollReveal key={entry.id} animation="fade-up" delay={i * 60}>
                <article className="saber-card p-5 flex gap-4">
                  {/* Avatar initial */}
                  <div className="h-9 w-9 shrink-0 rounded-md saber-border flex items-center justify-center font-display text-sm font-bold text-muted-foreground/60 select-none">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-semibold text-sm">{entry.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground/50">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{entry.message}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))
          )}
        </div>
      </div>
    </SiteLayout>
  );
};

export default Guestbook;
