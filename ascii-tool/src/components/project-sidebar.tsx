"use client";

import { cn } from "@/lib/utils";
import { Plus, Trash2, ImageIcon, Video } from "lucide-react";
import type { Project } from "@/hooks/use-projects";

interface ProjectSidebarProps {
  projects: Project[];
  loading: boolean;
  activeProjectId: string | null;
  onLoadProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
  className?: string;
}

export function ProjectSidebar({
  projects,
  loading,
  activeProjectId,
  onLoadProject,
  onDeleteProject,
  onNewProject,
  className,
}: ProjectSidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-panel border-r border-panel-border",
        className,
      )}
    >
      <div className="flex items-center justify-between px-3 py-3 border-b border-panel-border">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Projects
        </h3>
        <button
          type="button"
          onClick={onNewProject}
          className="flex items-center justify-center w-6 h-6 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="New project"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="px-3 py-4 text-sm text-muted-foreground">Loading...</p>
        )}

        {!loading && projects.length === 0 && (
          <div className="px-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload an image or video to get started.
            </p>
          </div>
        )}

        <ul className="py-1">
          {projects.map((project) => (
            <li key={project.id} className="group relative">
              <button
                type="button"
                onClick={() => onLoadProject(project)}
                className={cn(
                  "flex items-start gap-2.5 w-full px-3 py-2.5 text-left transition-colors",
                  activeProjectId === project.id
                    ? "bg-muted/80"
                    : "hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-sm shrink-0 mt-0.5",
                    activeProjectId === project.id
                      ? "bg-accent/10 text-accent"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {project.mediaType === "image" ? (
                    <ImageIcon className="w-3.5 h-3.5" />
                  ) : (
                    <Video className="w-3.5 h-3.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">
                    {project.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-sm text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete project"
                aria-label={`Delete ${project.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
