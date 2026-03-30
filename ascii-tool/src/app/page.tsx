"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { AsciiCanvas, type AsciiCanvasHandle } from "@/components/ascii-canvas";
import { ControlPanel } from "@/components/control-panel";
import { ProjectSidebar } from "@/components/project-sidebar";
import { Toolbar } from "@/components/toolbar";
import { VideoControls } from "@/components/video-controls";
import { ExportPanel } from "@/components/export-panel";
import { MediaDropzone } from "@/components/media-dropzone";
import { PresetGallery } from "@/components/preset-gallery";
import { ThemeToggle } from "@/components/theme-toggle";
import { useProjects, type Project } from "@/hooks/use-projects";
import { defaultSettings, type AsciiSettings } from "@/hooks/use-ascii-renderer";
import { useVideoTransform } from "@/hooks/use-video-transform";
import { useHistory } from "@/hooks/use-history";
import { useFFmpeg } from "@/hooks/use-ffmpeg";
import { loadMonoFonts } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const IMAGE_ACCEPT_TYPES = ["image/jpeg", "image/png", "image/svg+xml"];

const ASPECT_PRESETS: Record<string, number | undefined> = {
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  "1:1": 1,
  "9:16": 9 / 16,
  custom: undefined,
};

type MediaType = "video" | "image" | null;

export default function AsciiToolPage() {
  const [settings, setSettings] = useState<AsciiSettings>({ ...defaultSettings });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(450);
  const [renderScale, setRenderScale] = useState(1);
  const [aspectPreset, setAspectPreset] = useState("16:9");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const history = useHistory({
    settings: { ...defaultSettings },
    layer: { x: 0, y: 0, w: 800, h: 450 },
  });

  const handleLayerCommit = useCallback(
    (layer: { x: number; y: number; w: number; h: number }) => {
      history.push({ settings, layer });
    },
    [settings, history],
  );

  const videoTransform = useVideoTransform({ onLayerCommit: handleLayerCommit });
  const canvasHandle = useRef<AsciiCanvasHandle>(null);
  const ffmpeg = useFFmpeg();

  const {
    projects,
    loading: projectsLoading,
    createProject,
    updateProject,
    deleteProject,
    getMediaUrl,
  } = useProjects();

  useEffect(() => {
    loadMonoFonts();
  }, []);

  const videoSrc = mediaType === "video" ? mediaUrl : null;
  const imageSrc = mediaType === "image" ? mediaUrl : null;
  const hasMedia = !!mediaUrl;

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const imageFile = files.find((f) => IMAGE_ACCEPT_TYPES.includes(f.type));
      const videoFile = files.find((f) => f.type.startsWith("video/"));
      const file = imageFile || videoFile;
      if (!file) return;

      const isImage = !!imageFile;

      try {
        const project = await createProject(file, file.name, settings);
        setActiveProject(project);
        const url = await getMediaUrl(project.id, file.type);
        setMediaUrl(url);
        setMediaType(isImage ? "image" : "video");
      } catch {
        const url = URL.createObjectURL(file);
        setMediaUrl(url);
        setMediaType(isImage ? "image" : "video");
        setActiveProject(null);
      }

      setIsPlaying(false);
      setCurrentTime(0);
      setShowUploader(false);
    },
    [createProject, settings, getMediaUrl],
  );

  const handleLoadProject = useCallback(
    async (project: Project) => {
      setActiveProject(project);
      if (project.settings) setSettings(project.settings);
      const url = await getMediaUrl(project.id, project.mimeType);
      setMediaUrl(url);
      setMediaType(project.mediaType);
      setIsPlaying(false);
      setCurrentTime(0);
      setShowUploader(false);
    },
    [getMediaUrl],
  );

  const handleDeleteProject = useCallback(
    async (id: string) => {
      await deleteProject(id);
      if (activeProject?.id === id) {
        setActiveProject(null);
        setMediaUrl(null);
        setMediaType(null);
        setIsPlaying(false);
      }
      setConfirmDeleteId(null);
    },
    [deleteProject, activeProject?.id],
  );

  const handleSettingsChange = useCallback(
    (newSettings: AsciiSettings) => {
      setSettings(newSettings);
      history.push({ settings: newSettings, layer: videoTransform.layer });
      if (activeProject) {
        updateProject(activeProject.id, { settings: newSettings }).catch(() => {});
      }
    },
    [activeProject, updateProject, videoTransform.layer, history],
  );

  const handlePresetApply = useCallback(
    (preset: Partial<AsciiSettings>) => {
      const merged = { ...settings, ...preset };
      handleSettingsChange(merged);
    },
    [settings, handleSettingsChange],
  );

  const handleUndo = useCallback(() => {
    const snapshot = history.undo();
    if (!snapshot) return;
    setSettings(snapshot.settings);
    videoTransform.setLayerDirect(snapshot.layer);
    if (activeProject) {
      updateProject(activeProject.id, { settings: snapshot.settings }).catch(() => {});
    }
  }, [history, videoTransform, activeProject, updateProject]);

  const handleRedo = useCallback(() => {
    const snapshot = history.redo();
    if (!snapshot) return;
    setSettings(snapshot.settings);
    videoTransform.setLayerDirect(snapshot.layer);
    if (activeProject) {
      updateProject(activeProject.id, { settings: snapshot.settings }).catch(() => {});
    }
  }, [history, videoTransform, activeProject, updateProject]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && key === "z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      else if (mod && key === "z" && e.shiftKey) { e.preventDefault(); handleRedo(); }
      else if (mod && key === "y") { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo]);

  const handleTimeUpdate = useCallback((time: number, dur: number) => {
    setCurrentTime(time);
    setDuration(dur);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
    canvasHandle.current?.seekTo(time);
  }, []);

  const handleCanvasSizeChange = useCallback(
    (w: number, h: number) => {
      setCanvasWidth(w);
      setCanvasHeight(h);
      videoTransform.setCanvasSize(w, h);
    },
    [videoTransform],
  );

  const handleMediaLoaded = useCallback(
    (w: number, h: number) => {
      setCanvasWidth(w);
      setCanvasHeight(h);
      videoTransform.fitToCanvas(w, h);
      videoTransform.setCanvasSize(w, h);
    },
    [videoTransform],
  );

  const handleAspectPresetChange = useCallback(
    (value: string) => {
      setAspectPreset(value);
      const ratio = ASPECT_PRESETS[value];
      if (ratio) {
        handleCanvasSizeChange(canvasWidth, Math.round(canvasWidth / ratio));
      }
    },
    [canvasWidth, handleCanvasSizeChange],
  );

  const handleCanvasWidthInput = useCallback(
    (w: number) => {
      const ratio = ASPECT_PRESETS[aspectPreset];
      if (ratio) {
        handleCanvasSizeChange(w, Math.round(w / ratio));
      } else {
        handleCanvasSizeChange(w, canvasHeight);
      }
    },
    [aspectPreset, canvasHeight, handleCanvasSizeChange],
  );

  const handleCanvasHeightInput = useCallback(
    (h: number) => {
      const ratio = ASPECT_PRESETS[aspectPreset];
      if (ratio) {
        handleCanvasSizeChange(Math.round(h * ratio), h);
      } else {
        handleCanvasSizeChange(canvasWidth, h);
      }
    },
    [aspectPreset, canvasWidth, handleCanvasSizeChange],
  );

  const handleExportMp4 = useCallback(async () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const blob = await ffmpeg.exportMp4({
      canvas,
      settings: settings as unknown as Record<string, unknown>,
      fps: 30,
      durationSeconds: duration || 5,
      width: canvasWidth,
      height: canvasHeight,
      onFrame: (frameIndex) => {
        const time = frameIndex / 30;
        canvasHandle.current?.seekTo(time);
      },
    });

    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ascii-art.mp4";
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [ffmpeg, settings, duration, canvasWidth, canvasHeight]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left sidebar: Projects */}
      <div className="w-[220px] shrink-0 hidden lg:block">
        <ProjectSidebar
          projects={projects}
          loading={projectsLoading}
          activeProjectId={activeProject?.id || null}
          onLoadProject={handleLoadProject}
          onDeleteProject={(id) => setConfirmDeleteId(id)}
          onNewProject={() => setShowUploader(true)}
        />
      </div>

      {/* Center: Canvas area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          aspectPreset={aspectPreset}
          onAspectPresetChange={handleAspectPresetChange}
          onCanvasWidthChange={handleCanvasWidthInput}
          onCanvasHeightChange={handleCanvasHeightInput}
          hasMedia={hasMedia}
          onResetLayer={() => videoTransform.fitToCanvas(canvasWidth, canvasHeight)}
        />

        <div
          className="flex-1 flex items-center justify-center p-6 bg-canvas-bg overflow-auto"
          onPointerDown={() => videoTransform.deselect()}
        >
          {!hasMedia && !showUploader ? (
            <MediaDropzone onFilesSelected={handleFilesSelected} />
          ) : showUploader ? (
            <div className="relative w-full max-w-lg">
              <button
                type="button"
                onClick={() => setShowUploader(false)}
                className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-7 h-7 rounded-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <MediaDropzone
                onFilesSelected={handleFilesSelected}
                compact
              />
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              <AsciiCanvas
                ref={canvasHandle}
                videoSrc={videoSrc}
                imageSrc={imageSrc}
                settings={settings}
                isPlaying={isPlaying}
                onPlayStateChange={setIsPlaying}
                onTimeUpdate={handleTimeUpdate}
                width={canvasWidth}
                height={canvasHeight}
                videoTransform={videoTransform}
                renderScale={renderScale}
                onMediaLoaded={handleMediaLoaded}
              />
            </div>
          )}
        </div>

        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          hasMedia={hasMedia}
          mediaType={mediaType}
          onPlayPause={() => setIsPlaying((p) => !p)}
          onSeek={handleSeek}
          onUploadNew={() => setShowUploader(true)}
        />
      </div>

      {/* Right sidebar: Controls + Export */}
      <div className="w-[300px] shrink-0 flex flex-col border-l border-border bg-panel hidden md:flex">
        <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            ASCII Art Studio
          </span>
          <ThemeToggle />
        </div>
        <PresetGallery onApply={handlePresetApply} />
        <div className="flex-1 overflow-y-auto">
          <ControlPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        </div>
        <ExportPanel
          canvasHandle={canvasHandle}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          hasMedia={hasMedia}
          mediaType={mediaType}
          ffmpegProgress={ffmpeg.progress}
          ffmpegLoading={ffmpeg.loading}
          onExportMp4={handleExportMp4}
        />
      </div>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-card rounded-sm border border-border shadow-lg p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-foreground">Delete Project</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This will permanently remove this project and its media from your browser. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="h-9 px-4 text-sm font-medium text-foreground border border-border rounded-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProject(confirmDeleteId)}
                className="h-9 px-4 text-sm font-medium text-white bg-error rounded-sm hover:brightness-90 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
