"use client";
import { useState, useCallback, useRef } from "react";

export interface FFmpegProgress {
  frame: number;
  totalFrames: number;
  percent: number;
}

export interface UseFFmpegReturn {
  loaded: boolean;
  loading: boolean;
  progress: FFmpegProgress | null;
  exportMp4: (params: {
    canvas: HTMLCanvasElement;
    settings: Record<string, unknown>;
    fps: number;
    durationSeconds: number;
    width: number;
    height: number;
    onFrame: (frameIndex: number) => void;
  }) => Promise<Blob | null>;
  cancel: () => void;
}

export function useFFmpeg(): UseFFmpegReturn {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<FFmpegProgress | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ffmpegRef = useRef<any>(null);
  const cancelledRef = useRef(false);

  const ensureLoaded = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setLoading(true);
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ffmpeg;
      setLoaded(true);
      return ffmpeg;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportMp4 = useCallback(
    async ({
      canvas,
      fps,
      durationSeconds,
      width,
      height,
      onFrame,
    }: {
      canvas: HTMLCanvasElement;
      settings: Record<string, unknown>;
      fps: number;
      durationSeconds: number;
      width: number;
      height: number;
      onFrame: (frameIndex: number) => void;
    }): Promise<Blob | null> => {
      cancelledRef.current = false;
      const ffmpeg = await ensureLoaded();
      if (!ffmpeg) return null;

      const totalFrames = Math.ceil(fps * durationSeconds);
      setProgress({ frame: 0, totalFrames, percent: 0 });

      for (let i = 0; i < totalFrames; i++) {
        if (cancelledRef.current) {
          setProgress(null);
          return null;
        }

        onFrame(i);

        await new Promise((r) => setTimeout(r, 16));

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/png"),
        );
        if (!blob) continue;

        const data = new Uint8Array(await blob.arrayBuffer());
        const filename = `frame${String(i).padStart(6, "0")}.png`;
        await ffmpeg.writeFile(filename, data);

        setProgress({
          frame: i + 1,
          totalFrames,
          percent: Math.round(((i + 1) / totalFrames) * 80),
        });
      }

      setProgress({ frame: totalFrames, totalFrames, percent: 85 });

      await ffmpeg.exec([
        "-framerate", String(fps),
        "-i", "frame%06d.png",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-s", `${width}x${height}`,
        "-y",
        "output.mp4",
      ]);

      setProgress({ frame: totalFrames, totalFrames, percent: 95 });

      const outputData = await ffmpeg.readFile("output.mp4");
      const outputBlob = new Blob([outputData], { type: "video/mp4" });

      for (let i = 0; i < totalFrames; i++) {
        try {
          await ffmpeg.deleteFile(`frame${String(i).padStart(6, "0")}.png`);
        } catch { /* cleanup best-effort */ }
      }
      try { await ffmpeg.deleteFile("output.mp4"); } catch { /* cleanup best-effort */ }

      setProgress({ frame: totalFrames, totalFrames, percent: 100 });
      return outputBlob;
    },
    [ensureLoaded],
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  return { loaded, loading, progress, exportMp4, cancel };
}
