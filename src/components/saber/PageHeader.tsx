interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="border-b border-border/60 pb-10 mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="h-px w-10 bg-gradient-saber" />
        <span className="text-eyebrow">Realm</span>
      </div>
      <h1 className="text-display-lg mb-4">
        <span className="saber-text">{title}</span>
      </h1>
      {subtitle && <p className="text-body max-w-2xl">{subtitle}</p>}
    </div>
  );
}
