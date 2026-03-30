"use client";

import { useState, useCallback } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";
import { Copy, Check, Download } from "lucide-react";

// ── Demo CodeBlock ───────────────────────────────────────────────────────────

function DemoCodeBlock({
  code,
  language,
  filename,
  showCopy = true,
  showDownload = false,
  maxHeight,
}: {
  code: string;
  language?: string;
  filename?: string;
  showCopy?: boolean;
  showDownload?: boolean;
  maxHeight?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const ext = language === "typescript" || language === "tsx" ? ".tsx" : language === "javascript" ? ".js" : language === "css" ? ".css" : ".txt";
    const name = filename || `snippet${ext}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, filename, language]);

  return (
    <div className="rounded-sm border border-border overflow-hidden bg-muted/30">
      {(filename || showCopy || showDownload) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
          {filename && (
            <span className="text-xs font-mono text-muted-foreground">
              {filename}
            </span>
          )}
          {!filename && <span />}
          <div className="flex items-center gap-1">
            {showDownload && (
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            {showCopy && (
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Copy"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      )}
      <pre
        className={cn("p-4 text-sm leading-relaxed font-mono text-foreground overflow-x-auto", maxHeight && "overflow-y-auto")}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Code snippets ────────────────────────────────────────────────────────────

const basicCode = `const greeting = "Hello, world!";
console.log(greeting);`;

const tsExample = `interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
}

function getDisplayName(user: User): string {
  return user.name || user.email;
}`;

const cssExample = `/* tokens.css */
:root {
  --color-accent: oklch(0.637 0.237 25.331);
  --color-background: oklch(0.985 0 0);
  --color-foreground: oklch(0.141 0 0);
  --radius-sm: 2px;
  --font-mono: "Geist Mono", monospace;
}`;

const longExample = `import { useState, useEffect, useCallback, useMemo } from "react";

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  filterable?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 20,
  onRowClick,
  sortable = true,
  filterable = false,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) return data;
    return data.filter((row) =>
      columns.some((col) =>
        String(row[col.key]).toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [data, columns, filter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="border border-border rounded-sm">
      {filterable && (
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter..."
          className="w-full px-4 py-2 border-b border-border"
        />
      )}
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} onClick={() => handleSort(col.key)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((row, i) => (
            <tr key={i} onClick={() => onRowClick?.(row)}>
              {columns.map((col) => (
                <td key={col.key}>{String(row[col.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`;

// ── Snippet strings for code preview tab ─────────────────────────────────────

const basicSnippet = `<DemoCodeBlock
  code={\`const greeting = "Hello, world!";
console.log(greeting);\`}
  language="javascript"
/>`;

const filenameSnippet = `<DemoCodeBlock
  code={tsExample}
  language="typescript"
  filename="models/user.ts"
/>`;

const copyDownloadSnippet = `<DemoCodeBlock
  code={cssExample}
  language="css"
  filename="tokens.css"
  showCopy
  showDownload
/>`;

const scrollableSnippet = `<DemoCodeBlock
  code={longExample}
  language="typescript"
  filename="components/DataTable.tsx"
  maxHeight="200px"
  showCopy
/>`;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CodeBlockPage() {
  return (
    <Shell title="CodeBlock">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="CodeBlock"
          description="Syntax-highlighted code display with optional filename header, copy-to-clipboard, and download controls. Supports scrollable overflow for long snippets."
        />

        <ComponentPreview
          title="Basic"
          description="Plain code block with copy button and no header."
          code={basicSnippet}
        >
          <div className="w-full max-w-lg">
            <DemoCodeBlock code={basicCode} language="javascript" />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With filename header"
          description="Shows a monospace filename in the header bar."
          code={filenameSnippet}
        >
          <div className="w-full max-w-lg">
            <DemoCodeBlock
              code={tsExample}
              language="typescript"
              filename="models/user.ts"
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Copy + Download"
          description="Both copy and download actions in the header."
          code={copyDownloadSnippet}
        >
          <div className="w-full max-w-lg">
            <DemoCodeBlock
              code={cssExample}
              language="css"
              filename="tokens.css"
              showCopy
              showDownload
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Scrollable (max height)"
          description="Long snippets are capped with overflow-y-auto. The header stays fixed."
          code={scrollableSnippet}
        >
          <div className="w-full max-w-lg">
            <DemoCodeBlock
              code={longExample}
              language="typescript"
              filename="components/DataTable.tsx"
              maxHeight="200px"
              showCopy
            />
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "code",
                type: "string",
                description: "The source code string to display",
              },
              {
                name: "language",
                type: "string",
                description:
                  "Language hint (used for file extension on download)",
              },
              {
                name: "filename",
                type: "string",
                description:
                  "Filename shown in the header bar",
              },
              {
                name: "showCopy",
                type: "boolean",
                default: "true",
                description: "Show a copy-to-clipboard button",
              },
              {
                name: "showDownload",
                type: "boolean",
                default: "false",
                description: "Show a download button",
              },
              {
                name: "maxHeight",
                type: "string",
                description:
                  'CSS max-height value (e.g. "200px") for scrollable overflow',
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/CodeBlock/CodeBlock.tsx
        </div>
      </div>
    </Shell>
  );
}
