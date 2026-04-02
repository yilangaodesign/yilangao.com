"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Dropzone } from "@ds/Dropzone";
import Image from "lucide-react/dist/esm/icons/image";
import FileText from "lucide-react/dist/esm/icons/file-text";

const noop = () => {};

const basicCode = `import { Dropzone } from "@ds/Dropzone";

<Dropzone onFiles={(files) => console.log(files)} />`;

const acceptCode = `import { Dropzone } from "@ds/Dropzone";

<Dropzone
  accept="image/*"
  onFiles={(files) => console.log(files)}
/>`;

const customCode = `import { Dropzone } from "@ds/Dropzone";

<Dropzone accept=".pdf,.doc,.docx" onFiles={...}>
  <div className="text-center">
    <FileText className="w-10 h-10 mx-auto text-muted-foreground" />
    <p className="mt-2 text-sm font-medium">Upload documents</p>
    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX</p>
  </div>
</Dropzone>`;

const disabledCode = `import { Dropzone } from "@ds/Dropzone";

<Dropzone disabled onFiles={() => {}} />`;

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
            <Dropzone onFiles={noop} />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With accepted formats"
          description="Restrict to specific file types — the accepted formats are shown as a hint."
          code={acceptCode}
        >
          <div className="w-full max-w-md">
            <Dropzone accept="image/*" onFiles={noop} />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Custom children"
          description="Replace default content with a custom layout using the children slot."
          code={customCode}
        >
          <div className="w-full max-w-md">
            <Dropzone accept=".pdf,.doc,.docx" onFiles={noop}>
              <div className="text-center">
                <Image className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  Upload documents
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX up to 10 MB
                </p>
              </div>
            </Dropzone>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Disabled"
          description="Disabled dropzone ignores drag, click, and file input events."
          code={disabledCode}
        >
          <div className="w-full max-w-md">
            <Dropzone disabled onFiles={noop} />
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
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
                default: "false",
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

        <SourcePath path="src/components/ui/Dropzone/Dropzone.tsx" />
      </div>
    </Shell>
  );
}
