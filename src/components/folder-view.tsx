import { ItemType, WorkspaceItem } from "@/lib/types";
import { getChildren } from "@/lib/tree";
import { useWorkspaceStore } from "@/store/workspace-store";
import { ItemRow } from "./item-row";

interface FolderViewProps {
  folderId: string;
  onOpenFolder: (id: string) => void;
  onOpenFile: (id: string) => void;
  onCreate: (type: ItemType) => void;
  onRename: (item: WorkspaceItem) => void;
  onDelete: (item: WorkspaceItem) => void;
}

export function FolderView({
  folderId,
  onOpenFolder,
  onOpenFile,
  onCreate,
  onRename,
  onDelete,
}: FolderViewProps) {
  const items = useWorkspaceStore((s) => s.items);
  const folder = items[folderId];
  const children = getChildren(items, folderId);

  if (!folder) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3">
        <button
          onClick={() => onCreate("folder")}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          + New Folder
        </button>
        <button
          onClick={() => onCreate("file")}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          + New File
        </button>
        <span className="ml-auto text-xs text-neutral-400">
          {children.length} item{children.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {children.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-neutral-400">
            <p className="text-sm">This folder is empty</p>
            <p className="text-xs">Use the buttons above to add a folder or file</p>
          </div>
        ) : (
          children.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onOpen={() => (item.type === "folder" ? onOpenFolder(item.id) : onOpenFile(item.id))}
              onRename={() => onRename(item)}
              onDelete={() => onDelete(item)}
            />
          ))
        )}
      </div>
    </div>
  );
}
