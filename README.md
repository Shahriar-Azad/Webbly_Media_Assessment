# Mini Workspace Explorer

A browser-based file manager built for the Webbly Media frontend assessment. You can create, browse, rename, delete, search and edit folders/text files entirely on the client, with everything persisted to `localStorage`.

## Running it locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. No environment variables or backend are required — the app is fully client-side.

To build for production:

```bash
npm run build
npm start
```

## Project structure

```
src/
  app/
    layout.tsx        root layout, page metadata
    page.tsx           renders WorkspaceExplorer
    globals.css         tailwind import + base styles
  components/
    workspace-explorer.tsx   top-level layout, owns all dialog/navigation state
    sidebar.tsx               folder tree, expand/collapse + selection highlight
    tree-node.tsx              recursive node used by the sidebar
    breadcrumb.tsx             clickable path trail
    folder-view.tsx            listing of a folder's children + create toolbar
    item-row.tsx                single row in the listing (open/rename/delete)
    file-editor.tsx             textarea editor with dirty-state tracking
    search-results.tsx          flat, workspace-wide search results
    name-dialog.tsx             create/rename modal
    confirm-dialog.tsx          delete + unsaved-changes confirmation modal
  store/
    workspace-store.ts   Zustand store: all state + mutations
  lib/
    types.ts              WorkspaceItem, ItemMap, ContentMap
    tree.ts                 pure helpers (path, children, search, id generation)
    seed.ts                  initial demo data
```

## State management

State lives in a single Zustand store (`src/store/workspace-store.ts`), persisted to `localStorage` via Zustand's `persist` middleware. It holds:

- `items` — every folder/file in the workspace
- `contents` — file id → text content
- `selectedFolderId` — the folder currently shown in the main panel
- `openFileId` — the file currently open in the editor, if any
- `editorDirty` — whether the editor has unsaved changes

All mutations (`createItem`, `renameItem`, `deleteItem`, `selectFolder`, `openFile`, `saveFileContent`) live as actions on the store, so components stay presentational and call a single action rather than juggling multiple `setState` calls. I went with Zustand over plain Context because the store is read from several unrelated branches of the tree (sidebar, breadcrumb, search, editor) and Zustand's selector-based subscriptions mean each component only re-renders when the slice it actually reads changes, without needing to split the app into several nested providers.

Navigation itself is handled with local component state in `WorkspaceExplorer`, not the store or the URL — there's no backend and nothing that needs to be shareable via a link, so keeping "what dialog is open" / "is a navigation pending" as local `useState` avoided adding routing complexity for no real benefit.

## File-system data structure

Each item is a flat record, not a nested object:

```ts
interface WorkspaceItem {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
}
```

Everything lives in a single `Record<string, WorkspaceItem>` keyed by id, and the tree is reconstructed on demand by filtering on `parentId` (see `getChildren`, `getPath`, `getDescendantIds` in `src/lib/tree.ts`). I chose this over a nested `children: Item[]` tree because:

- Renaming, deleting, or moving an item is an O(1) lookup + a shallow object spread, instead of a recursive walk to find and replace a node inside a nested structure.
- Cascading delete is just "collect every id whose ancestor chain includes the deleted id," which is a simple traversal over a flat map.
- It matches the shape the assessment brief specifies almost exactly, and it's what the `persist` middleware serializes to `localStorage` without any extra transformation.

The workspace root is a fixed item with `id: "root"` and `parentId: null`; it can't be renamed or deleted, which is enforced in the store rather than the UI so it holds regardless of which component calls the action.

## Notable implementation decisions

- **Duplicate names** are rejected case-insensitively within the same parent folder, both on create and rename (`nameExistsInFolder`). Empty/whitespace-only names are rejected the same way.
- **Cascading delete**: deleting a folder recursively collects every descendant id and removes it from both `items` and `contents` in one update. The confirmation dialog tells you exactly how many items will go with it.
- **Deleting the currently open folder or file**: the store checks whether the deleted id (or one of its descendants) is the active `selectedFolderId` or `openFileId`, and if so falls back to the deleted item's parent (or the editor closes). This is enforced in the store itself so it can't be bypassed regardless of which UI path triggers the delete.
- **Unsaved file changes**: the editor keeps its own draft in local state, separate from the saved content in the store, so it can tell you're "dirty" before you've committed anything. Any navigation that would discard that draft — clicking a folder, opening another file, using the breadcrumb or search — is routed through a single `requestNavigate` guard in `WorkspaceExplorer` that intercepts and asks for confirmation first. A `beforeunload` listener covers closing the tab or refreshing mid-edit.
- **Search** matches folder and file names case-insensitively anywhere in the workspace (not just the current folder), and shows each result's parent path so it's clear where a match lives before you click it. Selecting a result reuses the same navigation path as clicking through the tree, so the sidebar auto-expands to reveal it.
- **Empty states** are explicit rather than a blank panel: an empty folder shows a short prompt to create something, and the sidebar tree only lists folders (files only ever appear in the main panel and search), which keeps the tree from getting cluttered on deeper workspaces.
- **Responsive layout**: the sidebar is a permanent column on desktop and collapses into a slide-in drawer (with a backdrop) behind a hamburger toggle below the `md` breakpoint, since a fixed 256px sidebar next to a file listing doesn't fit on a phone-width screen.
