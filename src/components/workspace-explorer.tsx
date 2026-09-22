"use client";

import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { getDescendantIds, getPath, ROOT_ID } from "@/lib/tree";
import { ItemType, WorkspaceItem } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { Breadcrumb } from "./breadcrumb";
import { FolderView } from "./folder-view";
import { FileEditor } from "./file-editor";
import { SearchResults } from "./search-results";
import { NameDialog } from "./name-dialog";
import { ConfirmDialog } from "./confirm-dialog";

type NameDialogState =
  | { mode: "create-folder" | "create-file"; targetId: string }
  | { mode: "rename"; targetId: string; initialValue: string };

interface ConfirmDialogState {
  title: string;
  message: string;
  danger?: boolean;
  onConfirm: () => void;
}

export function WorkspaceExplorer() {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const openFileId = useWorkspaceStore((s) => s.openFileId);
  const editorDirty = useWorkspaceStore((s) => s.editorDirty);
  const createItem = useWorkspaceStore((s) => s.createItem);
  const renameItem = useWorkspaceStore((s) => s.renameItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const selectFolder = useWorkspaceStore((s) => s.selectFolder);
  const openFile = useWorkspaceStore((s) => s.openFile);

  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nameDialog, setNameDialog] = useState<NameDialogState | null>(null);
  const [nameDialogError, setNameDialogError] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!items[selectedFolderId]) {
      selectFolder(ROOT_ID);
    }
  }, [items, selectedFolderId, selectFolder]);

  function requestNavigate(action: () => void) {
    if (editorDirty) {
      setPendingNavigation(() => action);
    } else {
      action();
    }
  }

  function handleSelectFolder(id: string) {
    requestNavigate(() => {
      selectFolder(id);
      setSearchQuery("");
      setSidebarOpen(false);
    });
  }

  function handleOpenFile(id: string) {
    requestNavigate(() => {
      openFile(id);
      setSearchQuery("");
    });
  }

  function handleSearchNavigate(item: WorkspaceItem) {
    if (item.type === "folder") {
      handleSelectFolder(item.id);
    } else {
      handleOpenFile(item.id);
    }
  }

  function handleCreate(type: ItemType) {
    setNameDialog({ mode: type === "folder" ? "create-folder" : "create-file", targetId: selectedFolderId });
    setNameDialogError("");
  }

  function handleRenameRequest(item: WorkspaceItem) {
    setNameDialog({ mode: "rename", targetId: item.id, initialValue: item.name });
    setNameDialogError("");
  }

  function handleDeleteRequest(item: WorkspaceItem) {
    const descendantCount = item.type === "folder" ? getDescendantIds(items, item.id).length : 0;
    setConfirmDialog({
      title: `Delete "${item.name}"?`,
      message:
        descendantCount > 0
          ? `This folder contains ${descendantCount} item${descendantCount === 1 ? "" : "s"}. Deleting it will remove everything inside.`
          : `This ${item.type} will be permanently deleted.`,
      danger: true,
      onConfirm: () => {
        deleteItem(item.id);
        setConfirmDialog(null);
      },
    });
  }

  function handleNameDialogSubmit(name: string) {
    if (!nameDialog) return;
    const result =
      nameDialog.mode === "rename"
        ? renameItem(nameDialog.targetId, name)
        : createItem(nameDialog.targetId, name, nameDialog.mode === "create-folder" ? "folder" : "file");

    if (result.ok) {
      setNameDialog(null);
      setNameDialogError("");
    } else {
      setNameDialogError(result.error ?? "Something went wrong.");
    }
  }

  const basePath = getPath(items, selectedFolderId);
  const openFileItem = openFileId ? items[openFileId] : null;
  const breadcrumbPath = openFileItem ? [...basePath, openFileItem] : basePath;

  let mainContent;
  if (searchQuery.trim()) {
    mainContent = <SearchResults query={searchQuery} onNavigate={handleSearchNavigate} />;
  } else if (openFileId && items[openFileId]) {
    mainContent = <FileEditor key={openFileId} fileId={openFileId} />;
  } else if (items[selectedFolderId]) {
    mainContent = (
      <FolderView
        folderId={selectedFolderId}
        onOpenFolder={handleSelectFolder}
        onOpenFile={handleOpenFile}
        onCreate={handleCreate}
        onRename={handleRenameRequest}
        onDelete={handleDeleteRequest}
      />
    );
  } else {
    mainContent = null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-neutral-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-40 h-full transform transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onSelect={handleSelectFolder} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-neutral-200 px-3 py-3 sm:px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="shrink-0 rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 md:hidden"
          >
            ☰
          </button>
          <div className="min-w-0 flex-1">
            <Breadcrumb path={breadcrumbPath} onNavigateFolder={handleSelectFolder} />
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspace..."
            className="w-36 shrink-0 rounded-md border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-64"
          />
        </div>
        <div className="min-h-0 flex-1">{mainContent}</div>
      </div>

      {nameDialog && (
        <NameDialog
          title={
            nameDialog.mode === "rename"
              ? "Rename"
              : nameDialog.mode === "create-folder"
                ? "New Folder"
                : "New Text File"
          }
          initialValue={nameDialog.mode === "rename" ? nameDialog.initialValue : ""}
          confirmLabel={nameDialog.mode === "rename" ? "Rename" : "Create"}
          error={nameDialogError}
          onSubmit={handleNameDialogSubmit}
          onCancel={() => {
            setNameDialog(null);
            setNameDialogError("");
          }}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          danger={confirmDialog.danger}
          confirmLabel="Delete"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {pendingNavigation && (
        <ConfirmDialog
          title="Discard unsaved changes?"
          message="You have unsaved changes in this file. Discard them and continue?"
          confirmLabel="Discard"
          danger
          onConfirm={() => {
            const action = pendingNavigation;
            setPendingNavigation(null);
            action();
          }}
          onCancel={() => setPendingNavigation(null)}
        />
      )}
    </div>
  );
}
