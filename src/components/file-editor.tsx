import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/store/workspace-store";

interface FileEditorProps {
  fileId: string;
}

export function FileEditor({ fileId }: FileEditorProps) {
  const item = useWorkspaceStore((s) => s.items[fileId]);
  const savedContent = useWorkspaceStore((s) => s.contents[fileId] ?? "");
  const saveFileContent = useWorkspaceStore((s) => s.saveFileContent);
  const setEditorDirty = useWorkspaceStore((s) => s.setEditorDirty);
  const editorDirty = useWorkspaceStore((s) => s.editorDirty);

  const [draft, setDraft] = useState(savedContent);

  useEffect(() => {
    setEditorDirty(draft !== savedContent);
  }, [draft, savedContent, setEditorDirty]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (editorDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editorDirty]);

  if (!item) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
        <span className="truncate text-sm font-medium text-neutral-800">{item.name}</span>
        {editorDirty && <span className="shrink-0 text-xs text-amber-600">Unsaved changes</span>}
        <button
          onClick={() => saveFileContent(fileId, draft)}
          disabled={!editorDirty}
          className="ml-auto shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          Save
        </button>
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none p-4 font-mono text-sm text-neutral-800 outline-none"
      />
    </div>
  );
}
