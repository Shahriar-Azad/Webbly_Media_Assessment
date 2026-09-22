import { ContentMap, ItemMap } from "./types";
import { ROOT_ID } from "./tree";

export function createSeedItems(): ItemMap {
  return {
    [ROOT_ID]: { id: ROOT_ID, name: "Workspace", type: "folder", parentId: null },
    projects: { id: "projects", name: "Projects", type: "folder", parentId: ROOT_ID },
    webbly: { id: "webbly", name: "Webbly", type: "folder", parentId: "projects" },
    personal: { id: "personal", name: "Personal", type: "folder", parentId: "projects" },
    documents: { id: "documents", name: "Documents", type: "folder", parentId: ROOT_ID },
    notes: { id: "notes", name: "notes.txt", type: "file", parentId: "webbly" },
    tasks: { id: "tasks", name: "tasks.txt", type: "file", parentId: "webbly" },
    readme: { id: "readme", name: "README.txt", type: "file", parentId: ROOT_ID },
  };
}

export function createSeedContents(): ContentMap {
  return {
    notes:
      "Kickoff notes\n- Align on scope for the assessment task\n- Stack: Next.js, TypeScript, Zustand, Tailwind\n- Demo before the deadline",
    tasks: "- [ ] Sidebar tree view\n- [ ] Create / rename / delete\n- [ ] Workspace-wide search\n- [ ] Persist to localStorage",
    readme:
      "Mini Workspace Explorer\n\nBrowse folders from the sidebar, click a file to open and edit it, and use the search bar to find anything across the workspace.",
  };
}
