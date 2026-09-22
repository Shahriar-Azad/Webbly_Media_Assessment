import { useState } from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { getPath, ROOT_ID } from "@/lib/tree";
import { TreeNode } from "./tree-node";

interface SidebarProps {
  onSelect: (id: string) => void;
}

export function Sidebar({ onSelect }: SidebarProps) {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([ROOT_ID]));
  const [lastSelectedFolderId, setLastSelectedFolderId] = useState(selectedFolderId);

  if (selectedFolderId !== lastSelectedFolderId) {
    setLastSelectedFolderId(selectedFolderId);
    const path = getPath(items, selectedFolderId);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      path.forEach((item) => next.add(item.id));
      return next;
    });
  }

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const root = items[ROOT_ID];
  if (!root) return null;

  return (
    <aside className="h-full w-64 overflow-y-auto border-r border-neutral-200 bg-neutral-50 py-3">
      <TreeNode
        item={root}
        items={items}
        depth={0}
        selectedFolderId={selectedFolderId}
        expandedIds={expandedIds}
        onToggle={toggle}
        onSelect={onSelect}
      />
    </aside>
  );
}
