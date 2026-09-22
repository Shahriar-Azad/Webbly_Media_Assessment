export type ItemType = "folder" | "file";

export interface WorkspaceItem {
  id: string;
  name: string;
  type: ItemType;
  parentId: string | null;
}

export type ItemMap = Record<string, WorkspaceItem>;
export type ContentMap = Record<string, string>;

export interface OperationResult {
  ok: boolean;
  error?: string;
}
