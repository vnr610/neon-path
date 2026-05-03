import { useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { SEO } from "@/components/saber/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Mail, MessageSquare, Send, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Status = "idle" | "submitting" | "success" | "error";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const { data, error } = await supabase.functions.invoke("contact-notify", {
        body: { name: name.trim(), email: email.trim(), message: message.trim() },
      });

      if (error || !data?.ok) {
        throw new Error(error?.message ?? "Unknown error");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Contact submit error:", err);
      setStatus("error");
      setErrorMsg("Transmission failed. Check your connection and try again.");
    }
  };

  return (
    <SiteLayout>
      <SEO
        title="Contact"
        description="Send a message to VNR610 — open to collaborations, opportunities, and conversations."
        path="/contact"
      />
      <div className="container py-16 max-w-2xl">
        <PageHeader title="Contact" subtitle="Open channel. Send a transmission." />

        {status === "success" ? (
          <div className="saber-card p-10 flex flex-col items-center gap-4 text-center animate-fade-up opacity-0">
            <CheckCircle2 className="h-12 w-12 text-saber-blue animate-saber-pulse" />
            <h2 className="font-display text-xl font-semibold">Message received</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Your transmission has been logged. I'll respond when the signal clears.
            </p>
            <Button variant="outline" className="saber-border mt-2" onClick={() => setStatus("idle")}>
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="saber-card p-8 space-y-6 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
            <p className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground/40">
              // open · channel
            </p>

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="contact-name" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                <User className="h-3 w-3" /> Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your handle"
                maxLength={100}
                className="w-full rounded-md border border-border/60 bg-background/60 px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="contact-email" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                <Mail className="h-3 w-3" /> Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                maxLength={200}
                className="w-full rounded-md border border-border/60 bg-background/60 px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="contact-message" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                <MessageSquare className="h-3 w-3" /> Message
              </label>
              <textarea
                id="contact-message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                rows={6}
                maxLength={2000}
                className="w-full rounded-md border border-border/60 bg-background/60 px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors resize-none"
              />
              <p className="text-[10px] text-muted-foreground/40 text-right tabular-nums">
                {message.length} / 2000
              </p>
            </div>

            {errorMsg && (
              <p className="text-sm text-destructive font-mono">{errorMsg}</p>
            )}

            <Button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue"
            >
              {status === "submitting" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Transmitting…</>
              ) : (
                <><Send className="mr-2 h-4 w-4" />Send transmission</>
              )}
            </Button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
};

export default Contact;
