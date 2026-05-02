import DOMPurify from "dompurify";
import { BlogMarkdown } from "@/components/saber/BlogMarkdown";
import type { BlogContentFormat } from "@/lib/content";

type Props = {
  content: string;
  contentFormat: BlogContentFormat;
};

const htmlPurify = { USE_PROFILES: { html: true } as const };

export function BlogPostBody({ content, contentFormat }: Props) {
  if (contentFormat === "html") {
    const safe = DOMPurify.sanitize(content, htmlPurify);
    return (
      <div
        className="prose prose-invert dark:prose-invert max-w-none prose-headings:font-display prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-a:text-saber-blue prose-a:no-underline hover:prose-a:underline prose-code:text-saber-purple prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/60 prose-table:border-collapse prose-th:border prose-th:border-border prose-td:border prose-td:border-border"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  }

  return <BlogMarkdown>{content}</BlogMarkdown>;
}
