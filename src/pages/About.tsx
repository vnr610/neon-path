import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { User } from "lucide-react";

const About = () => {
  return (
    <SiteLayout>
      <div className="container py-16 max-w-4xl">
        <PageHeader title="About" subtitle="The path, the discipline, the philosophy." />

        <div className="grid md:grid-cols-[200px_1fr] gap-10">
          <div>
            <div className="aspect-square saber-card flex items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Handle</p>
              <p className="font-display text-sm">VNR610</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-3">Realm</p>
              <p className="font-mono text-xs text-saber-blue">Full Stack · Cybersec</p>
            </div>
          </div>

          <article className="prose prose-invert max-w-none">
            <div className="saber-card p-8 sm:p-10 space-y-4 not-prose">
              <p className="text-xs uppercase tracking-[0.3em] text-saber-blue mb-2">// bio.md</p>
              <p className="text-muted-foreground leading-relaxed italic">
                Bio content awaits inscription. This space will hold the story, the journey, and the
                guiding principles.
              </p>
              <div className="border-t border-border/60 pt-4 mt-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Status</p>
                <p className="text-sm font-mono mt-1"><span className="text-saber-blue">●</span> Awaiting content</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </SiteLayout>
  );
};

export default About;
