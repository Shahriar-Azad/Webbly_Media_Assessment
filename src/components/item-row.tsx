import { WorkspaceItem } from "@/lib/types";

interface ItemRowProps {
  item: WorkspaceItem;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function ItemRow({ item, onOpen, onRename, onDelete }: ItemRowProps) {
  return (
    <div className="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-neutral-50">
      <button
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-neutral-800"
      >
        <span className="shrink-0">{item.type === "folder" ? "📁" : "📄"}</span>
        <span className="truncate">{item.name}</span>
      </button>
      <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <button
          onClick={onRename}
          className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
        >
          Rename
        </button>
        <button
          onClick={onDelete}
          className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
