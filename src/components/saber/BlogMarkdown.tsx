import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";

// Custom dark theme matching the site's saber aesthetic
const saberTheme: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': {
    color: "#e2e8f0",
    background: "none",
    fontFamily: '"Fira Code", "Fira Mono", "Cascadia Code", Consolas, monospace',
    fontSize: "0.875rem",
    lineHeight: "1.7",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    tabSize: 2,
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#e2e8f0",
    background: "transparent",
    fontFamily: '"Fira Code", "Fira Mono", "Cascadia Code", Consolas, monospace',
    fontSize: "0.875rem",
    lineHeight: "1.7",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    tabSize: 2,
    hyphens: "none",
    padding: "1.25rem",
    margin: "0",
    overflow: "auto",
  },
  comment: { color: "#64748b", fontStyle: "italic" },
  prolog: { color: "#64748b" },
  doctype: { color: "#64748b" },
  cdata: { color: "#64748b" },
  punctuation: { color: "#94a3b8" },
  property: { color: "#93c5fd" },   // saber-blue light
  tag: { color: "#93c5fd" },
  boolean: { color: "#f472b6" },
  number: { color: "#fb923c" },
  constant: { color: "#fb923c" },
  symbol: { color: "#fb923c" },
  deleted: { color: "#f87171" },
  selector: { color: "#86efac" },
  "attr-name": { color: "#86efac" },
  string: { color: "#86efac" },     // green for strings
  char: { color: "#86efac" },
  builtin: { color: "#86efac" },
  inserted: { color: "#86efac" },
  operator: { color: "#94a3b8" },
  entity: { color: "#fbbf24", cursor: "help" },
  url: { color: "#86efac" },
  variable: { color: "#e2e8f0" },
  atrule: { color: "#c084fc" },     // purple for keywords
  "attr-value": { color: "#86efac" },
  function: { color: "#60a5fa" },   // blue for functions
  "class-name": { color: "#fbbf24" },
  keyword: { color: "#c084fc" },    // saber-purple for keywords
  regex: { color: "#fb923c" },
  important: { color: "#f87171", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
};

// Map common aliases to display names
const LANG_DISPLAY: Record<string, string> = {
  js: "JavaScript", javascript: "JavaScript",
  ts: "TypeScript", typescript: "TypeScript",
  jsx: "JSX", tsx: "TSX",
  py: "Python", python: "Python",
  sh: "Shell", bash: "Bash", shell: "Shell", zsh: "Zsh",
  sql: "SQL",
  json: "JSON",
  yaml: "YAML", yml: "YAML",
  toml: "TOML",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  rs: "Rust", rust: "Rust",
  go: "Go",
  java: "Java",
  kt: "Kotlin", kotlin: "Kotlin",
  c: "C",
  cpp: "C++",
  cs: "C#",
  php: "PHP",
  rb: "Ruby", ruby: "Ruby",
  swift: "Swift",
  md: "Markdown", markdown: "Markdown",
  dockerfile: "Dockerfile",
  nginx: "Nginx",
  xml: "XML",
  graphql: "GraphQL",
  powershell: "PowerShell", ps1: "PowerShell",
  http: "HTTP",
  diff: "Diff",
  text: "Text", txt: "Text", plaintext: "Text",
};

function langLabel(lang: string): string {
  const key = lang.toLowerCase().trim();
  return LANG_DISPLAY[key] ?? lang.toUpperCase();
}

type Props = { children: string };

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-[0.15em] border border-border/40 bg-background/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all opacity-0 group-hover:opacity-100"
      aria-label="Copy code"
    >
      {copied
        ? <><Check className="h-3 w-3 text-green-500" />Copied</>
        : <><Copy className="h-3 w-3" />Copy</>}
    </button>
  );
}

export function BlogMarkdown({ children }: Props) {
  return (
    <div className="prose prose-invert dark:prose-invert max-w-none
      prose-headings:font-display
      prose-p:text-foreground/90
      prose-li:text-foreground/90
      prose-strong:text-foreground
      prose-a:text-saber-blue prose-a:no-underline hover:prose-a:underline
      prose-code:text-saber-purple prose-code:bg-muted/40 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: c, ...rest }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{c}</a>
          ),

          code({ node, className, children: codeChildren, ...rest }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.[1] ?? "";
            const rawCode = String(codeChildren).replace(/\n$/, "");
            const isInline = !match && !String(codeChildren).includes("\n");

            // Inline code — plain styled span
            if (isInline) {
              return (
                <code className={className} {...rest}>
                  {codeChildren}
                </code>
              );
            }

            // Block code — syntax highlighted with header bar
            return (
              <div className="group relative rounded-xl overflow-hidden border border-border/60 bg-[#0d1117] my-6 not-prose">
                {/* Header bar: language label + copy button */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-[#161b22]">
                  <div className="flex items-center gap-2">
                    {/* Traffic light dots */}
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    {lang && (
                      <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/60">
                        {langLabel(lang)}
                      </span>
                    )}
                  </div>
                  <CopyButton code={rawCode} />
                </div>

                {/* Syntax highlighted code */}
                <SyntaxHighlighter
                  style={saberTheme}
                  language={lang || "text"}
                  PreTag="div"
                  showLineNumbers={rawCode.split("\n").length > 4}
                  lineNumberStyle={{
                    color: "#334155",
                    fontSize: "0.75rem",
                    paddingRight: "1.5rem",
                    userSelect: "none",
                    minWidth: "2.5rem",
                  }}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: "#0d1117",
                    padding: "1.25rem",
                    fontSize: "0.875rem",
                    lineHeight: "1.7",
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                    },
                  }}
                >
                  {rawCode}
                </SyntaxHighlighter>
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
