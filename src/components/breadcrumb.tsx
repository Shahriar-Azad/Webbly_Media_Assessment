import { WorkspaceItem } from "@/lib/types";

interface BreadcrumbProps {
  path: WorkspaceItem[];
  onNavigateFolder: (id: string) => void;
}

export function Breadcrumb({ path, onNavigateFolder }: BreadcrumbProps) {
  return (
    <nav className="flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap text-sm text-neutral-500">
      {path.map((item, index) => {
        const isLast = index === path.length - 1;
        return (
          <span key={item.id} className="flex shrink-0 items-center gap-1">
            {index > 0 && <span className="text-neutral-300">/</span>}
            {isLast ? (
              <span className="font-medium text-neutral-900">{item.name}</span>
            ) : (
              <button
                onClick={() => onNavigateFolder(item.id)}
                className="hover:text-blue-600 hover:underline"
              >
                {item.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
