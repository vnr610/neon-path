interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="border-b border-border/60 pb-10 mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="h-px w-10 bg-gradient-saber" />
        <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Realm</span>
      </div>
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
        <span className="saber-text">{title}</span>
      </h1>
      {subtitle && <p className="text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}
