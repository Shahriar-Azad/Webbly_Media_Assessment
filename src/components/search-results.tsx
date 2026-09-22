import { useMemo } from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { getPath, searchWorkspace } from "@/lib/tree";
import { WorkspaceItem } from "@/lib/types";

interface SearchResultsProps {
  query: string;
  onNavigate: (item: WorkspaceItem) => void;
}

export function SearchResults({ query, onNavigate }: SearchResultsProps) {
  const items = useWorkspaceStore((s) => s.items);
  const results = useMemo(() => searchWorkspace(items, query), [items, query]);

  return (
    <div className="h-full overflow-y-auto px-2 py-2">
      {results.length === 0 ? (
        <p className="px-3 py-4 text-sm text-neutral-400">No results for &quot;{query}&quot;</p>
      ) : (
        results.map((item) => {
          const path = getPath(items, item.id);
          const parentPath = path
            .slice(0, -1)
            .map((p) => p.name)
            .join(" / ");
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item)}
              className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-neutral-50"
            >
              <span className="flex items-center gap-2 text-sm text-neutral-800">
                <span>{item.type === "folder" ? "📁" : "📄"}</span>
                {item.name}
              </span>
              <span className="text-xs text-neutral-400">{parentPath || "Workspace"}</span>
            </button>
          );
        })
      )}
    </div>
  );
}
