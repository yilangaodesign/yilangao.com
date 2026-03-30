"use client";
import { useState, useCallback, useEffect } from "react";
import { get, set, del } from "idb-keyval";
import type { AsciiSettings } from "./use-ascii-renderer";

export interface Project {
  id: string;
  name: string;
  mediaType: "video" | "image";
  mimeType: string;
  settings: AsciiSettings;
  createdAt: string;
  updatedAt: string;
  thumbnailDataUrl?: string;
}

const PROJECTS_KEY = "ascii-tool-projects";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadProjectList(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjectList(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProjects(loadProjectList());
    setLoading(false);
  }, []);

  const createProject = useCallback(
    async (file: File, name?: string, settings?: Partial<AsciiSettings>) => {
      const id = generateId();
      const isImage = file.type.startsWith("image/");

      const arrayBuffer = await file.arrayBuffer();
      await set(`media-${id}`, arrayBuffer);

      const project: Project = {
        id,
        name: name || file.name,
        mediaType: isImage ? "image" : "video",
        mimeType: file.type,
        settings: settings as AsciiSettings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [project, ...projects];
      setProjects(updated);
      saveProjectList(updated);
      return project;
    },
    [projects],
  );

  const updateProject = useCallback(
    async (id: string, updates: { name?: string; settings?: AsciiSettings; thumbnailDataUrl?: string }) => {
      const updated = projects.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p,
      );
      setProjects(updated);
      saveProjectList(updated);
      return updated.find((p) => p.id === id)!;
    },
    [projects],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      await del(`media-${id}`);
      const updated = projects.filter((p) => p.id !== id);
      setProjects(updated);
      saveProjectList(updated);
    },
    [projects],
  );

  const getMediaUrl = useCallback(async (id: string, mimeType: string): Promise<string | null> => {
    const data = await get(`media-${id}`) as ArrayBuffer | undefined;
    if (!data) return null;
    const blob = new Blob([data], { type: mimeType });
    return URL.createObjectURL(blob);
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getMediaUrl,
  };
}
