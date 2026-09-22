import { ItemMap, WorkspaceItem } from "@/lib/types";
import { getChildren } from "@/lib/tree";

interface TreeNodeProps {
  item: WorkspaceItem;
  items: ItemMap;
  depth: number;
  selectedFolderId: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

export function TreeNode({
  item,
  items,
  depth,
  selectedFolderId,
  expandedIds,
  onToggle,
  onSelect,
}: TreeNodeProps) {
  const children = getChildren(items, item.id).filter((child) => child.type === "folder");
  const isExpanded = expandedIds.has(item.id);
  const isSelected = item.id === selectedFolderId;
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        onClick={() => onSelect(item.id)}
        style={{ paddingLeft: depth * 14 + 8 }}
        className={`flex cursor-pointer items-center gap-1 rounded-md py-1.5 pr-2 text-sm ${
          isSelected
            ? "bg-blue-100 font-medium text-blue-900"
            : "text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(item.id);
          }}
          className={`flex h-4 w-4 shrink-0 items-center justify-center text-[10px] text-neutral-400 ${
            hasChildren ? "" : "invisible"
          }`}
        >
          {isExpanded ? "▾" : "▸"}
        </button>
        <span className="shrink-0">📁</span>
        <span className="truncate">{item.name}</span>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              items={items}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
