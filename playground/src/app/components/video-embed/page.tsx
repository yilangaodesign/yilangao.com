"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { VideoEmbed } from "@ds/VideoEmbed";
import { parseVideoEmbedUrl } from "@lib/parse-video-embed";

const code = `import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { parseVideoEmbedUrl } from "@/lib/parse-video-embed";

const parsed = parseVideoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
if (parsed) {
  return (
    <VideoEmbed
      provider={parsed.provider}
      embedUrl={parsed.embedUrl}
      autoplayUrl={parsed.autoplayUrl}
      autoThumbnailUrl={parsed.autoThumbnailUrl}
      isVertical={parsed.isVertical}
    />
  );
}`;

type DemoProps = {
  title: string;
  description: string;
  url: string;
  posterUrl?: string;
  caption?: string;
};

function Demo({ title, description, url, posterUrl, caption }: DemoProps) {
  const parsed = parseVideoEmbedUrl(url);

  return (
    <ComponentPreview title={title} description={description} code={code}>
      <div className="w-full max-w-3xl">
        {parsed ? (
          <VideoEmbed
            provider={parsed.provider}
            embedUrl={parsed.embedUrl}
            autoplayUrl={parsed.autoplayUrl}
            autoThumbnailUrl={parsed.autoThumbnailUrl}
            isVertical={parsed.isVertical}
            posterUrl={posterUrl}
            caption={caption}
          />
        ) : (
          <div className="text-xs text-muted-foreground">
            Failed to parse URL: {url}
          </div>
        )}
        <p className="text-xs font-mono text-muted-foreground mt-2 break-all">
          {url}
        </p>
      </div>
    </ComponentPreview>
  );
}

export default function VideoEmbedPage() {
  return (
    <Shell title="VideoEmbed">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="VideoEmbed"
          description="Privacy-mode iframe embed for YouTube, Vimeo, and Loom. Click-to-load poster defers provider cookies and cuts LCP. Auto-thumbnail for YouTube; custom poster override for any provider. Zero corner radius per portfolio identity."
        />

        <Demo
          title="YouTube (standard)"
          description="Public YouTube watch URL. Idle state shows the auto-thumbnail (i.ytimg.com/vi/<id>/hqdefault.jpg). On click, swaps to youtube-nocookie embed with autoplay=1."
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        />

        <Demo
          title="YouTube Shorts (vertical)"
          description="YouTube Shorts URL. Aspect ratio switches to 9/16 automatically."
          url="https://www.youtube.com/shorts/dQw4w9WgXcQ"
        />

        <Demo
          title="YouTube with timestamp"
          description="?t= or ?start= query parameters are preserved. The embed begins playback at the specified second."
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42"
        />

        <Demo
          title="Vimeo (public)"
          description="Public Vimeo URL. Uses player.vimeo.com with ?dnt=1 (do-not-track) and chromeless params (title=0, byline=0, portrait=0)."
          url="https://vimeo.com/76979871"
        />

        <Demo
          title="Vimeo (private hash)"
          description="Private-share URLs include a hash segment (vimeo.com/<id>/<hash>). The hash is forwarded as ?h=<hash> on the embed URL so private videos play back."
          url="https://vimeo.com/76979871/abc123def4"
        />

        <Demo
          title="Loom"
          description="Loom share URL (loom.com/share/<id>). Rendered via loom.com/embed/<id>. No auto-thumbnail available - falls back to the neutral dark placeholder."
          url="https://www.loom.com/share/abc123def456789012345678abcdef01"
        />

        <Demo
          title="YouTube + custom poster"
          description="When posterUrl is provided, it overrides the provider's auto-thumbnail. Use this for hand-picked cover frames."
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          posterUrl="https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg"
          caption="Custom poster example"
        />

        <Demo
          title="Vimeo without poster (neutral placeholder)"
          description="Providers without a static thumbnail URL (Vimeo, Loom) fall back to a neutral dark frame with the provider label. Upload a custom poster in the CMS to replace it."
          url="https://vimeo.com/76979871"
        />

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "provider", type: `"youtube" | "vimeo" | "loom"`, description: "Embed provider. Returned by parseVideoEmbedUrl." },
              { name: "embedUrl", type: "string", description: "Idle iframe URL - used until the user clicks the poster. Does not include autoplay=1." },
              { name: "autoplayUrl", type: "string", description: "URL swapped in on user activation. Includes autoplay=1 so playback fires from the gesture." },
              { name: "autoThumbnailUrl", type: "string | null", description: "Provider-derived static thumbnail. YouTube only; Vimeo/Loom return null." },
              { name: "posterUrl", type: "string?", description: "User-supplied custom poster image. Takes precedence over autoThumbnailUrl." },
              { name: "isVertical", type: "boolean?", description: "True for YouTube Shorts. Switches aspect ratio to 9/16." },
              { name: "caption", type: "string?", description: "Accessible label for the play button and iframe title." },
              { name: "className", type: "string?", description: "Additional class names on the outer wrapper." },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Behavior</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Idle state renders a native <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">&lt;button&gt;</code> with an accessible name - Enter/Space activate it.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Iframe is NOT mounted until the user activates the button - no provider cookies or network requests until then.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Once loaded, the iframe stays mounted - we do not swap back to the poster on pause.
            </li>
          </ul>
        </div>

        <SourcePath path="src/components/ui/VideoEmbed/VideoEmbed.tsx · src/lib/parse-video-embed.ts" />
      </div>
    </Shell>
  );
}
