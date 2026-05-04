import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

type Props = {
  children: string;
};

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-[0.15em] border border-border/40 bg-background/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all opacity-0 group-hover:opacity-100"
      aria-label="Copy code"
    >
      {copied ? (
        <><Check className="h-3 w-3 text-green-500" />Copied</>
      ) : (
        <><Copy className="h-3 w-3" />Copy</>
      )}
    </button>
  );
}

export function BlogMarkdown({ children }: Props) {
  return (
    <div className="prose prose-invert dark:prose-invert max-w-none prose-headings:font-display prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-a:text-saber-blue prose-a:no-underline hover:prose-a:underline prose-code:text-saber-purple prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/60 prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // External links open in new tab
          a: ({ href, children: c, ...rest }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {c}
            </a>
          ),
          // Code blocks with copy button
          pre: ({ children: c, ...rest }) => {
            // Extract raw text from the code element inside pre
            const codeEl = (c as any)?.props;
            const rawCode = typeof codeEl?.children === "string"
              ? codeEl.children
              : Array.isArray(codeEl?.children)
                ? codeEl.children.join("")
                : "";

            return (
              <div className="relative group">
                <pre {...rest} className="!p-4 !pr-16 overflow-x-auto">
                  {c}
                </pre>
                {rawCode && <CopyButton code={rawCode.replace(/\n$/, "")} />}
              </div>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
