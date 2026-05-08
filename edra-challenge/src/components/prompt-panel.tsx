"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import X from "lucide-react/dist/esm/icons/x";
import { Button } from "@ds/Button";
import { FolderTree } from "./folder-tree";
import { SearchInput, type SearchInputHandle } from "./search-input";
import { usePromptPanel } from "./home-content";
import { generateView } from "@/app/actions";
import type { PromptViewResult } from "@/app/actions";
import type { FolderNode, FolderMeta } from "@/lib/queries";
import styles from "./prompt-panel.module.scss";

type UserMessage = { role: "user"; text: string };
type AssistantMessage = {
  role: "assistant";
  tree: FolderNode;
  folderMeta: FolderMeta;
  viewId: string;
  viewName: string;
  docCount: number;
  folderCount: number;
};
type ChatMessage = UserMessage | AssistantMessage;

function countTree(node: FolderNode): { docs: number; folders: number } {
  let docs = node.documents.length;
  let folders = node.children.length;
  for (const child of node.children) {
    const sub = countTree(child);
    docs += sub.docs;
    folders += sub.folders;
  }
  return { docs, folders };
}

function deserializeResult(result: PromptViewResult): AssistantMessage {
  const folderMeta: FolderMeta = new Map(result.folderMetaEntries);
  const counts = countTree(result.tree);
  return {
    role: "assistant",
    tree: result.tree,
    folderMeta,
    viewId: result.viewId,
    viewName: result.viewName,
    docCount: counts.docs,
    folderCount: counts.folders,
  };
}

export function PromptPanel() {
  const context = usePromptPanel();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<SearchInputHandle>(null);

  const activePrompt = context?.activePrompt ?? null;

  // Slide-in on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    sentinelRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Fire initial prompt on mount
  useEffect(() => {
    if (!activePrompt) return;
    let cancelled = false;

    async function run() {
      setMessages([{ role: "user", text: activePrompt! }]);
      setLoading(true);
      try {
        const result = await generateView(activePrompt!);
        if (cancelled) return;
        setMessages((prev) => [...prev, deserializeResult(result)]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(
    async (query: string) => {
      const text = query.trim();
      if (!text || loading) return;

      searchRef.current?.clear();
      setMessages((prev) => [...prev, { role: "user", text }]);
      setLoading(true);

      try {
        const result = await generateView(text);
        setMessages((prev) => [...prev, deserializeResult(result)]);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => context?.setActivePrompt(null), 350);
  }, [context]);

  const latestViewId = [...messages]
    .reverse()
    .find((m): m is AssistantMessage => m.role === "assistant")?.viewId;

  const handleSave = useCallback(() => {
    if (latestViewId) {
      router.push(`/workspace?view=${latestViewId}`);
    }
  }, [latestViewId, router]);

  return (
    <>
      <div
        className={`${styles.backdrop} ${visible ? styles.backdropVisible : ""}`}
        onClick={handleClose}
      />
      <div className={`${styles.panel} ${visible ? styles.panelVisible : ""}`}>
        {/* Header */}
        <div className={styles.header}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
          <Button
            size="sm"
            emphasis="bold"
            onClick={handleSave}
            disabled={!latestViewId}
          >
            Save to workspace
          </Button>
        </div>

        {/* Chat thread */}
        <div ref={threadRef} className={styles.thread}>
          {messages.map((msg, i) => {
            if (msg.role === "user") {
              return (
                <div key={i} className={styles.userBubble}>
                  {msg.text}
                </div>
              );
            }

            const isActuallyLatest = (() => {
              for (let j = messages.length - 1; j >= 0; j--) {
                if (messages[j].role === "assistant") return j === i;
              }
              return false;
            })();

            if (!isActuallyLatest) {
              return (
                <div key={i} className={styles.collapsedSummary}>
                  {msg.viewName} &mdash; {msg.docCount} docs, {msg.folderCount}{" "}
                  folders
                </div>
              );
            }

            return (
              <div key={i} className={styles.assistantResponse}>
                <span className={styles.viewLabel}>{msg.viewName}</span>
                <div className={styles.readOnlyTree}>
                  <FolderTree
                    root={msg.tree}
                    folderMeta={msg.folderMeta}
                    viewId={msg.viewId}
                  />
                </div>
              </div>
            );
          })}

          {loading && (
            <div className={styles.loading}>
              <span className={styles.loadingDots}>
                <span />
                <span />
                <span />
              </span>
              Organizing your documents&hellip;
            </div>
          )}

          <div ref={sentinelRef} />
        </div>

        {/* Bottom input */}
        <div className={styles.inputBar}>
          <SearchInput
            ref={searchRef}
            compact
            autoFocus
            disabled={loading}
            onPromptSubmit={handleSubmit}
            onGroupByNavigate={(viewId) =>
              router.push(`/workspace?view=${viewId}`)
            }
            hidePlusMenu
          />
        </div>
      </div>
    </>
  );
}
