"use client";

import { useState, useRef, useCallback } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";
import { Upload, Image, FileText } from "lucide-react";

function DemoDropzone({
  accept,
  multiple = true,
  onFiles,
  disabled = false,
  maxSize,
  children,
  className,
}: {
  accept?: string;
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
  disabled?: boolean;
  maxSize?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;
      const arr = Array.from(files);
      const filtered = maxSize ? arr.filter((f) => f.size <= maxSize) : arr;
      setFileNames(filtered.map((f) => f.name));
      onFiles?.(filtered);
    },
    [disabled, maxSize, onFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-sm transition-colors cursor-pointer min-h-[160px]",
        isDragOver
          ? "border-accent bg-accent/5"
          : "border-border hover:border-foreground/30",
        disabled && "opacity-50 pointer-events-none cursor-not-allowed",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
      {children || (
        <>
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Drop files here or click to browse
            </p>
            {accept && (
              <p className="text-xs text-muted-foreground mt-1">
                Accepted: {accept}
              </p>
            )}
          </div>
        </>
      )}
      {fileNames.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {fileNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-muted rounded-sm text-muted-foreground"
            >
              <FileText className="w-3 h-3" />
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const basicCode = `import { Dropzone } from "@/components/ui/Dropzone/Dropzone";

<Dropzone onFiles={(files) => console.log(files)} />`;

const acceptCode = `import { Dropzone } from "@/components/ui/Dropzone/Dropzone";

<Dropzone
  accept="image/*"
  onFiles={(files) => console.log(files)}
/>`;

const customCode = `import { Dropzone } from "@/components/ui/Dropzone/Dropzone";

<Dropzone accept=".pdf,.doc,.docx" onFiles={...}>
  <div className="text-center">
    <FileText className="w-10 h-10 mx-auto text-muted-foreground" />
    <p className="mt-2 text-sm font-medium">Upload documents</p>
    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX</p>
  </div>
</Dropzone>`;

const disabledCode = `import { Dropzone } from "@/components/ui/Dropzone/Dropzone";

<Dropzone disabled />`;

export default function DropzonePage() {
  return (
    <Shell title="Dropzone">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Dropzone"
          description="Drag-and-drop file upload area with click-to-browse fallback. Supports accepted file types, size limits, and custom slot content."
        />

        <ComponentPreview
          title="Basic"
          description="Default dropzone with upload icon and prompt text. Accepts any file type."
          code={basicCode}
        >
          <div className="w-full max-w-md">
            <DemoDropzone />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With accepted formats"
          description="Restrict to specific file types — the accepted formats are shown as a hint."
          code={acceptCode}
        >
          <div className="w-full max-w-md">
            <DemoDropzone accept="image/*" />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Custom children"
          description="Replace default content with a custom layout using the children slot."
          code={customCode}
        >
          <div className="w-full max-w-md">
            <DemoDropzone accept=".pdf,.doc,.docx">
              <div className="text-center">
                <Image className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  Upload documents
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX up to 10 MB
                </p>
              </div>
            </DemoDropzone>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Disabled"
          description="Disabled dropzone ignores drag, click, and file input events."
          code={disabledCode}
        >
          <div className="w-full max-w-md">
            <DemoDropzone disabled />
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "accept",
                type: "string",
                description:
                  'File type filter passed to the hidden input (e.g. "image/*", ".pdf").',
              },
              {
                name: "multiple",
                type: "boolean",
                default: "true",
                description: "Allow selecting multiple files.",
              },
              {
                name: "onFiles",
                type: "(files: File[]) => void",
                description: "Called with the array of accepted files.",
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Disables drag, click, and reduces opacity.",
              },
              {
                name: "maxSize",
                type: "number",
                description:
                  "Maximum file size in bytes. Files exceeding this are silently filtered out.",
              },
              {
                name: "children",
                type: "ReactNode",
                description:
                  "Custom content replacing the default icon and text.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Dropzone/Dropzone.tsx
        </div>
      </div>
    </Shell>
  );
}
