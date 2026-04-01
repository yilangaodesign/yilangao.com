"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { CodeBlock } from "@ds/CodeBlock";

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

const basicSnippet = `import { CodeBlock } from "@ds/CodeBlock";

<CodeBlock
  code={\`const greeting = "Hello, world!";
console.log(greeting);\`}
  language="javascript"
/>`;

const filenameSnippet = `import { CodeBlock } from "@ds/CodeBlock";

<CodeBlock
  code={tsExample}
  language="typescript"
  filename="models/user.ts"
/>`;

const copyDownloadSnippet = `import { CodeBlock } from "@ds/CodeBlock";

<CodeBlock
  code={cssExample}
  language="css"
  filename="tokens.css"
  showCopy
  showDownload
/>`;

const scrollableSnippet = `import { CodeBlock } from "@ds/CodeBlock";

<CodeBlock
  code={longExample}
  language="typescript"
  filename="components/DataTable.tsx"
  maxHeight={200}
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
            <CodeBlock code={basicCode} language="javascript" />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With filename header"
          description="Shows a monospace filename in the header bar."
          code={filenameSnippet}
        >
          <div className="w-full max-w-lg">
            <CodeBlock
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
            <CodeBlock
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
            <CodeBlock
              code={longExample}
              language="typescript"
              filename="components/DataTable.tsx"
              maxHeight={200}
              showCopy
            />
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
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
                type: "number",
                description:
                  "Max height in pixels for scrollable overflow (e.g. 200)",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/CodeBlock/CodeBlock.tsx" />
      </div>
    </Shell>
  );
}
