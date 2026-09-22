# Mini Workspace Explorer

A simple file manager built with Next.js and TypeScript. You can create, rename, delete and search folders and text files, and edit file content in a basic text editor. Everything is saved in the browser with localStorage, so your data is still there after a refresh.

## How to run

```
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Project structure

- `src/app` - main Next.js pages and layout
- `src/components` - all UI parts (sidebar, breadcrumb, file editor, dialogs, etc.)
- `src/store` - Zustand store that holds all the app state
- `src/lib` - helper functions and types for working with the file/folder tree

## State management

The app state (folders, files, selected folder, open file) is managed with Zustand. It's simple to set up and doesn't need much boilerplate. The store also uses Zustand's persist middleware to automatically save everything to localStorage.

## File system data structure

Each folder or file is stored as a simple object:

```
{ id, name, type, parentId }
```

All items are kept together in one object (id -> item), and the folder tree is built by checking each item's `parentId`. This makes it easy to add, rename, delete and search items without manually walking through a nested structure.

## Implementation decisions

- Duplicate names are not allowed inside the same folder (case-insensitive check).
- Deleting a folder also deletes everything inside it, and shows a warning with the item count first.
- If you're editing a file and try to navigate away without saving, the app asks for confirmation first.
- Search checks the whole workspace, not just the current folder. Clicking a result opens that file or folder directly.
- The sidebar turns into a slide-in menu on smaller screens so it works on mobile too.
