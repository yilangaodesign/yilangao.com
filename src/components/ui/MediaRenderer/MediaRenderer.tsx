interface MediaRendererProps {
  src: string;
  mimeType?: string | null;
  alt?: string;
  className?: string;
}

export default function MediaRenderer({
  src,
  mimeType,
  alt = '',
  className,
}: MediaRendererProps) {
  if (mimeType?.startsWith('video/')) {
    return (
      <video
        src={src}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
      />
    );
  }

  return <img src={src} alt={alt} className={className} />;
}
