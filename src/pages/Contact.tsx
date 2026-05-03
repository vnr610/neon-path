import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { SEO } from "@/components/saber/SEO";
import { Construction, Mail } from "lucide-react";

const Contact = () => {
  return (
    <SiteLayout>
      <SEO
        title="Contact"
        description="Send a message to VNR610 — open to collaborations, opportunities, and conversations."
        path="/contact"
      />
      <div className="container py-16 max-w-2xl">
        <PageHeader title="Contact" subtitle="Open channel. Send a transmission." />

        <div className="saber-card p-12 flex flex-col items-center gap-5 text-center animate-fade-up opacity-0">
          {/* Animated icon */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full saber-border flex items-center justify-center">
              <Mail className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border/60">
              <Construction className="h-3 w-3 text-muted-foreground/60" />
            </span>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground/40 mb-3">
              // channel · offline
            </p>
            <h2 className="font-display text-xl font-semibold mb-2">Coming soon</h2>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              The contact channel is being configured. Check back shortly.
            </p>
          </div>

          <div className="w-full border-t border-border/40 pt-5 mt-1">
            <p className="text-xs text-muted-foreground/50 font-mono">
              In the meantime, reach out directly at{" "}
              <a
                href="mailto:grindwithmt@gmail.com"
                className="text-saber-blue hover:underline"
              >
                grindwithmt@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Contact;
