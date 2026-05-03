import { useEffect, useRef, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  loadNewsletterSubscribers,
  loadNewsletterSubscriberCount,
  deleteNewsletterSubscriber,
  loadBlogPosts,
  formatDate,
  type NewsletterSubscriber,
  type BlogPost,
} from "@/lib/content";
import { useAiBlogAssist } from "@/hooks/useAiBlogAssist";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Users,
  Wand2,
  X,
} from "lucide-react";

type BroadcastStatus = "idle" | "sending" | "success" | "error";

// ─── Animated typing text ─────────────────────────────────────────────────────

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    idx.current = 0;
    if (!text) return;

    const id = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 8); // fast typewriter

    return () => clearInterval(id);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && (
        <span className="inline-block w-[2px] h-[1em] bg-foreground/60 ml-0.5 align-middle animate-pulse" />
      )}
    </span>
  );
}

// ─── Scanning animation overlay ──────────────────────────────────────────────

function AiScanOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none z-10">
      {/* Scan line */}
      <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-foreground/30 to-transparent animate-scan-line" />
      {/* Corner accents */}
      <svg className="absolute top-2 left-2 h-4 w-4 text-foreground/30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M0 6 V0 H6" />
      </svg>
      <svg className="absolute top-2 right-2 h-4 w-4 text-foreground/30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 6 V0 H10" />
      </svg>
      <svg className="absolute bottom-2 left-2 h-4 w-4 text-foreground/30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M0 10 V16 H6" />
      </svg>
      <svg className="absolute bottom-2 right-2 h-4 w-4 text-foreground/30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 10 V16 H10" />
      </svg>
      {/* Status text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border/60 rounded-md px-4 py-2">
          <Sparkles className="h-3.5 w-3.5 text-foreground/60 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
            AI composing…
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [postDropdownOpen, setPostDropdownOpen] = useState(false);

  // Broadcast form
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState<BroadcastStatus>("idle");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [aiAnimating, setAiAnimating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const ai = useAiBlogAssist();

  const fetchData = async () => {
    setLoading(true);
    const [subs, c, blogPosts] = await Promise.all([
      loadNewsletterSubscribers(),
      loadNewsletterSubscriberCount(),
      loadBlogPosts(),
    ]);
    setSubscribers(subs);
    setCount(c);
    setPosts(blogPosts);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleExportCsv = () => {
    if (subscribers.length === 0) return;
    const csv = ["email,subscribed_at", ...subscribers.map((s) => `${s.email},${s.createdAt}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    await deleteNewsletterSubscriber(id);
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    setCount((c) => Math.max(0, c - 1));
  };

  // Select a blog post and auto-fill redirect URL
  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    setPostDropdownOpen(false);
    // Auto-fill subject if empty
    if (!subject.trim()) {
      setSubject(`New writeup: ${post.title}`);
    }
    // Auto-fill redirect URL
    const siteUrl = window.location.origin.replace("/admin", "");
    setRedirectUrl(`${siteUrl}/writeups/${post.slug}`);
    setAiGenerated(false);
  };

  // AI generate email body from selected post
  const handleAiGenerate = async () => {
    if (!selectedPost) return;
    setAiAnimating(true);
    setBody("");
    setAiGenerated(false);

    const result = await ai.run({
      action: "write-newsletter",
      title: selectedPost.title,
      content: selectedPost.excerpt || selectedPost.content.slice(0, 500),
      tags: selectedPost.tags.join(", "),
    });

    setAiAnimating(false);

    if (result) {
      setBody(result);
      setAiGenerated(true);
    }
  };

  const handleBroadcast = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setBroadcastStatus("sending");
    setBroadcastMsg("");

    // Append redirect link to body if set
    const fullBody = redirectUrl.trim()
      ? `${body.trim()}\n\nRead the full writeup here → ${redirectUrl.trim()}`
      : body.trim();

    try {
      const { data, error } = await supabase.functions.invoke("newsletter-broadcast", {
        body: { subject: subject.trim(), body: fullBody },
      });
      if (error) throw error;
      setBroadcastStatus("success");
      setBroadcastMsg(`Sent to ${data?.sent ?? 0} subscriber${data?.sent !== 1 ? "s" : ""}.`);
      setSubject("");
      setBody("");
      setRedirectUrl("");
      setSelectedPost(null);
      setAiGenerated(false);
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
              Select a writeup, let AI draft the email, then broadcast to all subscribers.
            </p>
          </div>
          <Button variant="outline" size="sm" className="saber-border gap-2" onClick={fetchData}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
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
              <Sparkles className="h-4 w-4 text-saber-blue" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">AI model</p>
              <p className="text-sm font-mono mt-0.5 text-muted-foreground">Llama 3.3 · Groq</p>
            </div>
          </div>
        </div>

        {/* ── Broadcast composer ── */}
        <div className="saber-card p-6 sm:p-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">
            // compose · broadcast
          </p>
          <h3 className="font-display text-lg font-semibold mb-6">Compose & send</h3>

          {broadcastStatus === "success" ? (
            <div className="flex items-center gap-3 p-5 rounded-lg border border-border/60 bg-muted/20 animate-fade-up opacity-0">
              <CheckCircle2 className="h-6 w-6 text-foreground shrink-0" />
              <div>
                <p className="text-sm font-semibold">Broadcast sent</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{broadcastMsg}</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground"
                onClick={() => setBroadcastStatus("idle")}>
                New broadcast
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBroadcast} className="space-y-6">

              {/* Step 1 — Select blog post */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/60 text-[10px] font-mono text-muted-foreground shrink-0">1</span>
                  <label className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Select a writeup <span className="text-muted-foreground/40">(optional — enables AI)</span>
                  </label>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPostDropdownOpen((o) => !o)}
                    className="w-full flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/60 px-4 py-2.5 text-sm font-mono text-left hover:border-foreground/40 transition-colors"
                  >
                    {selectedPost ? (
                      <span className="flex items-center gap-2 min-w-0">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                        <span className="truncate">{selectedPost.title}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">Choose a blog post…</span>
                    )}
                    <div className="flex items-center gap-2 shrink-0">
                      {selectedPost && (
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedPost(null); setRedirectUrl(""); setAiGenerated(false); }}
                          className="text-muted-foreground/40 hover:text-foreground transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground/50 transition-transform ${postDropdownOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {postDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-md border border-border/60 bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
                      <div className="max-h-56 overflow-y-auto divide-y divide-border/40">
                        {posts.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-muted-foreground font-mono">No writeups yet.</p>
                        ) : posts.map((post) => (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => handleSelectPost(post)}
                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                          >
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{post.title}</p>
                              <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">
                                {formatDate(post.createdAt)}
                                {post.tags.length > 0 && ` · ${post.tags.slice(0, 2).join(", ")}`}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 — Subject */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/60 text-[10px] font-mono text-muted-foreground shrink-0">2</span>
                  <label className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Subject line</label>
                </div>
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

              {/* Step 3 — AI generate body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/60 text-[10px] font-mono text-muted-foreground shrink-0">3</span>
                    <label className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Email body</label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedPost || ai.loading || aiAnimating}
                    onClick={handleAiGenerate}
                    className={`saber-border gap-2 transition-all ${
                      selectedPost
                        ? "border-foreground/40 text-foreground hover:bg-foreground/10"
                        : "opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {ai.loading || aiAnimating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Generating…</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                          {aiGenerated ? "Regenerate with AI" : "Generate with AI"}
                        </span>
                        <Sparkles className="h-3 w-3 text-muted-foreground/60" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Body textarea with scan overlay */}
                <div className="relative">
                  <AiScanOverlay visible={ai.loading || aiAnimating} />
                  <textarea
                    required
                    value={body}
                    onChange={(e) => { setBody(e.target.value); setAiGenerated(false); }}
                    placeholder={"Write your email body here, or select a writeup above and click Generate with AI…"}
                    rows={10}
                    maxLength={5000}
                    className="w-full rounded-md border border-border/60 bg-background/60 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors resize-none leading-relaxed"
                  />
                  {/* Typewriter effect overlay when AI just generated */}
                  {aiGenerated && body && (
                    <div className="absolute inset-0 rounded-md bg-background/60 px-4 py-3 text-sm font-mono leading-relaxed pointer-events-none overflow-hidden">
                      <TypewriterText text={body} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {aiGenerated && (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60">
                        <Sparkles className="h-3 w-3" />
                        AI generated · edit freely
                      </span>
                    )}
                    {ai.error && (
                      <span className="text-[10px] text-destructive font-mono">{ai.error}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 tabular-nums">{body.length} / 5000</p>
                </div>
              </div>

              {/* Step 4 — Redirect link */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/60 text-[10px] font-mono text-muted-foreground shrink-0">4</span>
                  <label className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Redirect link <span className="text-muted-foreground/40">(appended to email)</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="https://yoursite.com/writeups/post-slug"
                    className="flex-1 rounded-md border border-border/60 bg-background/60 px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors"
                  />
                  {redirectUrl && (
                    <a
                      href={redirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 w-10 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title="Preview link"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {redirectUrl && (
                  <p className="text-[10px] text-muted-foreground/50 font-mono flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    Will be appended as: "Read the full writeup here → {redirectUrl}"
                  </p>
                )}
              </div>

              {/* Preview card */}
              {(subject || body) && (
                <div className="rounded-lg border border-border/40 bg-muted/10 p-4 space-y-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40">// email preview</p>
                  {subject && (
                    <p className="text-sm font-semibold">{subject}</p>
                  )}
                  {body && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {body}
                    </p>
                  )}
                  {redirectUrl && (
                    <p className="text-xs text-saber-blue font-mono">
                      Read the full writeup here → {redirectUrl}
                    </p>
                  )}
                </div>
              )}

              {broadcastStatus === "error" && (
                <p className="text-sm text-destructive font-mono">{broadcastMsg}</p>
              )}

              {/* Send button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={broadcastStatus === "sending" || count === 0 || !subject.trim() || !body.trim()}
                  className="bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 gap-2 shadow-glow-blue"
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
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-0.5">
                // subscriber · list
              </p>
              <p className="text-sm font-medium">All subscribers</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground/40 tabular-nums">{count} total</span>
              {subscribers.length > 0 && (
                <Button variant="outline" size="sm" className="saber-border gap-1.5" onClick={handleExportCsv}>
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>

          {/* Resend tip */}
          <div className="px-6 py-3 border-b border-border/40 bg-muted/10 flex items-start gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground/50 font-mono leading-relaxed">
              Resend free tier only sends to verified contacts. Export CSV → upload to{" "}
              <a href="https://resend.com/contacts" target="_blank" rel="noreferrer" className="text-saber-blue hover:underline">
                resend.com/contacts
              </a>{" "}
              to verify subscribers, then broadcasts will reach them.
            </p>
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
                <div key={sub.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-muted/10 transition-colors group">
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
                    className="h-7 w-7 text-muted-foreground/20 hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleDelete(sub.id)}
                    title="Remove subscriber"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="px-6 py-3 border-t border-border/40 bg-background/20 flex items-center justify-between">
            <span className="font-mono text-[9px] text-muted-foreground/25 uppercase tracking-[0.22em]">
              vnr610 · realm · newsletter
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/25 tabular-nums">
              {count} subscriber{count !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminNewsletter;
