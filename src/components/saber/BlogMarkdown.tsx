import ReactMarkdown from "react-markdown";

type Props = {
  children: string;
};

export function BlogMarkdown({ children }: Props) {
  return (
    <div className="prose prose-invert dark:prose-invert max-w-none prose-headings:font-display prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-a:text-saber-blue prose-a:no-underline hover:prose-a:underline prose-code:text-saber-purple prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/60">
      <ReactMarkdown
        components={{
          a: ({ href, children: c, ...rest }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {c}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
