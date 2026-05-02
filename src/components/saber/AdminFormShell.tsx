import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AdminFormShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function AdminFormShell({ eyebrow, title, description, children }: AdminFormShellProps) {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-saber-blue mb-3">{eyebrow}</p>
        <h2 className="font-display text-3xl font-bold mb-2">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <form className="saber-card p-6 sm:p-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
        {children}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button type="button" variant="ghost" className="text-muted-foreground">Discard</Button>
          <Button type="submit" className="bg-gradient-saber text-primary-foreground border-0 shadow-glow-blue hover:opacity-90">
            Save Entry
          </Button>
        </div>
      </form>
    </div>
  );
}
