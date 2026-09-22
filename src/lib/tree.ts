import { ItemMap, WorkspaceItem } from "./types";

export const ROOT_ID = "root";

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getChildren(items: ItemMap, parentId: string): WorkspaceItem[] {
  return Object.values(items)
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
}

export function getPath(items: ItemMap, id: string): WorkspaceItem[] {
  const path: WorkspaceItem[] = [];
  let current: WorkspaceItem | undefined = items[id];
  while (current) {
    path.unshift(current);
    current = current.parentId ? items[current.parentId] : undefined;
  }
  return path;
}

export function getDescendantIds(items: ItemMap, id: string): string[] {
  const result: string[] = [];
  const stack = [id];
  while (stack.length > 0) {
    const currentId = stack.pop()!;
    for (const item of Object.values(items)) {
      if (item.parentId === currentId) {
        result.push(item.id);
        stack.push(item.id);
      }
    }
  }
  return result;
}

export function nameExistsInFolder(
  items: ItemMap,
  parentId: string,
  name: string,
  excludeId?: string
): boolean {
  const normalized = name.trim().toLowerCase();
  return Object.values(items).some(
    (item) =>
      item.parentId === parentId &&
      item.id !== excludeId &&
      item.name.trim().toLowerCase() === normalized
  );
}

export function searchWorkspace(items: ItemMap, query: string): WorkspaceItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return Object.values(items)
    .filter((item) => item.id !== ROOT_ID && item.name.toLowerCase().includes(normalized))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
}
