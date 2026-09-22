import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ContentMap, ItemMap, ItemType, OperationResult } from "@/lib/types";
import { generateId, getDescendantIds, nameExistsInFolder, ROOT_ID } from "@/lib/tree";
import { createSeedContents, createSeedItems } from "@/lib/seed";

interface WorkspaceState {
  items: ItemMap;
  contents: ContentMap;
  selectedFolderId: string;
  openFileId: string | null;
  editorDirty: boolean;
  setEditorDirty: (dirty: boolean) => void;
  createItem: (parentId: string, name: string, type: ItemType) => OperationResult;
  renameItem: (id: string, name: string) => OperationResult;
  deleteItem: (id: string) => void;
  selectFolder: (id: string) => void;
  openFile: (id: string) => void;
  closeFile: () => void;
  saveFileContent: (id: string, content: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      items: createSeedItems(),
      contents: createSeedContents(),
      selectedFolderId: ROOT_ID,
      openFileId: null,
      editorDirty: false,

      setEditorDirty: (dirty) => set({ editorDirty: dirty }),

      createItem: (parentId, rawName, type) => {
        const name = rawName.trim();
        if (!name) return { ok: false, error: "Name cannot be empty." };

        const state = get();
        const parent = state.items[parentId];
        if (!parent || parent.type !== "folder") {
          return { ok: false, error: "Cannot create item here." };
        }
        if (nameExistsInFolder(state.items, parentId, name)) {
          return { ok: false, error: `"${name}" already exists in this folder.` };
        }

        const id = generateId();
        set((s) => ({
          items: { ...s.items, [id]: { id, name, type, parentId } },
          contents: type === "file" ? { ...s.contents, [id]: "" } : s.contents,
        }));
        return { ok: true };
      },

      renameItem: (id, rawName) => {
        const name = rawName.trim();
        if (!name) return { ok: false, error: "Name cannot be empty." };
        if (id === ROOT_ID) return { ok: false, error: "The workspace root can't be renamed." };

        const state = get();
        const target = state.items[id];
        if (!target) return { ok: false, error: "Item no longer exists." };
        if (target.parentId && nameExistsInFolder(state.items, target.parentId, name, id)) {
          return { ok: false, error: `"${name}" already exists in this folder.` };
        }

        set((s) => ({
          items: { ...s.items, [id]: { ...s.items[id], name } },
        }));
        return { ok: true };
      },

      deleteItem: (id) => {
        if (id === ROOT_ID) return;
        const state = get();
        const target = state.items[id];
        if (!target) return;

        const idsToDelete = new Set([id, ...getDescendantIds(state.items, id)]);
        const nextItems = { ...state.items };
        const nextContents = { ...state.contents };
        idsToDelete.forEach((deletedId) => {
          delete nextItems[deletedId];
          delete nextContents[deletedId];
        });

        let nextSelectedFolderId = state.selectedFolderId;
        if (idsToDelete.has(nextSelectedFolderId)) {
          nextSelectedFolderId = target.parentId ?? ROOT_ID;
        }

        let nextOpenFileId = state.openFileId;
        if (nextOpenFileId && idsToDelete.has(nextOpenFileId)) {
          nextOpenFileId = null;
        }

        set({
          items: nextItems,
          contents: nextContents,
          selectedFolderId: nextSelectedFolderId,
          openFileId: nextOpenFileId,
          editorDirty: nextOpenFileId ? state.editorDirty : false,
        });
      },

      selectFolder: (id) => set({ selectedFolderId: id, openFileId: null, editorDirty: false }),

      openFile: (id) => {
        const item = get().items[id];
        if (!item || item.type !== "file") return;
        set({
          openFileId: id,
          selectedFolderId: item.parentId ?? ROOT_ID,
          editorDirty: false,
        });
      },

      closeFile: () => set({ openFileId: null, editorDirty: false }),

      saveFileContent: (id, content) => {
        set((s) => ({
          contents: { ...s.contents, [id]: content },
          editorDirty: false,
        }));
      },
    }),
    {
      name: "mini-workspace-explorer",
      partialize: (state) => ({
        items: state.items,
        contents: state.contents,
        selectedFolderId: state.selectedFolderId,
        openFileId: state.openFileId,
      }),
    }
  )
);
