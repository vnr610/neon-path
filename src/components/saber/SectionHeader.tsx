interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({ eyebrow, title, description, align = "left" }: SectionHeaderProps) {
  return (
    <div className={`mb-10 ${align === "center" ? "text-center mx-auto" : ""} max-w-2xl`}>
      {eyebrow && (
        <div className={`flex items-center gap-3 mb-3 ${align === "center" ? "justify-center" : ""}`}>
          <span className="h-px w-8 bg-saber-blue shadow-glow-blue" />
          <span className="text-xs uppercase tracking-[0.3em] text-saber-blue font-medium">{eyebrow}</span>
        </div>
      )}
      <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">{title}</h2>
      {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  );
}
