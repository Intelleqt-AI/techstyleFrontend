"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { ProjectNav } from "@/components/project-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  ImageIcon,
  File,
  Folder,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  FolderOpen,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotesFeed } from "@/components/notes-feed";
import { NotesSidePanel } from "@/components/notes-side-panel";
import { mockNotes } from "@/components/notes-mocks";
import type { Note } from "@/components/notes-types";
import { AIPill } from "@/components/ai-pill";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Modal from "react-modal";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import {
  getAllFiles,
  createFolder,
  uploadDoc,
  downloadFolderAsZip,
} from "@/supabase/API";

// Derived from storage
type DerivedFolder = {
  id: string;
  name: string;
  fileCount: number;
  lastModified?: string;
};

const notesFolder = {
  id: 999,
  name: "Notes",
  items: 12,
  needsReview: 3,
  lastModified: "2024-02-07",
};

type DerivedFile = {
  id: string;
  name: string;
  type: string;
  sizeBytes?: number;
  uploadedAt?: string;
};

function getFileIcon(type: string) {
  switch (type) {
    case "image":
      return (
        <ImageIcon className="h-4 w-4 text-neutral-500" aria-hidden="true" />
      );
    case "pdf":
      return (
        <FileText className="h-4 w-4 text-neutral-500" aria-hidden="true" />
      );
    case "spreadsheet":
      return (
        <FileText className="h-4 w-4 text-neutral-500" aria-hidden="true" />
      );
    case "cad":
      return <File className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
    default:
      return <File className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

export default function ProjectDocsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [activePane, setActivePane] = React.useState<"notes" | "files">(
    "notes"
  );
  const [sideOpen, setSideOpen] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState<Note | undefined>(
    undefined
  );
  const [currentPath] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [uploadModal, setUploadModal] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState("");
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [fileQueue, setFileQueue] = React.useState<File[]>([]);
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [currentDoc, setCurrentDoc] = React.useState<any>(null);

  // Fetch files/folders
  const {
    data: filesResp,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["GetAllFiles", params.id, currentPath],
    queryFn: () => getAllFiles(params.id, currentPath),
    enabled: !!params.id,
  });

  const allItems = React.useMemo(() => {
    const list = filesResp?.data || [];
    return list.map((item: any) => ({ ...item, isFolder: !item.metadata }));
  }, [filesResp]);

  const derivedFolders = React.useMemo<DerivedFolder[]>(() => {
    return allItems
      .filter((d: any) => d.isFolder)
      .map((f: any) => ({
        id: encodeURIComponent(f.name),
        name: f.name,
        fileCount: 0,
        lastModified: f.created_at,
      }));
  }, [allItems]);

  const derivedRecentFiles = React.useMemo<DerivedFile[]>(() => {
    const filesOnly = allItems.filter((d: any) => !d.isFolder);
    const toType = (mime?: string) => {
      if (!mime) return "file";
      if (mime.startsWith("image/")) return "image";
      if (mime.includes("pdf")) return "pdf";
      if (mime.includes("sheet") || mime.includes("excel"))
        return "spreadsheet";
      return "file";
    };
    return filesOnly
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 8)
      .map((f: any) => ({
        id: f.id,
        name: f.name,
        type: toType(f?.metadata?.mimetype),
        sizeBytes: f?.metadata?.size,
        uploadedAt: f.created_at,
      }));
  }, [allItems]);

  // Mutations
  const createFolderMutation = useMutation({
    mutationFn: (vars: any) => createFolder(vars),
    onMutate: () => toast.loading("Creating folder...", { id: "folder-toast" }),
    onSuccess: () => {
      toast.dismiss("folder-toast");
      toast.success("Folder created successfully!");
      setModalOpen(false);
      setNewFolderName("");
      refetch();
    },
    onError: () => {
      toast.dismiss("folder-toast");
      toast.error("Failed to create folder.");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (vars: any) => uploadDoc(vars),
    onMutate: () => toast.loading("Uploading...", { id: "upload-toast" }),
    onSuccess: () => {
      toast.dismiss("upload-toast");
      toast.success("Uploaded successfully!");
      setFileQueue([]);
      setUploadModal(false);
      refetch();
    },
    onError: () => {
      toast.dismiss("upload-toast");
      toast.error("Failed to upload document.");
    },
  });

  const downloadFolderMutation = useMutation({
    mutationFn: (vars: any) => downloadFolderAsZip(vars),
    onMutate: () => {
      setIsDownloading(true);
      toast.loading("Preparing download...", { id: "download-toast" });
    },
    onSuccess: (downloadUrl: any, variables: any) => {
      toast.dismiss("download-toast");
      toast.success("Download ready!");
      const link = document.createElement("a");
      link.href = String(downloadUrl);
      link.setAttribute("download", `${variables.folderName}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    },
    onError: () => {
      toast.dismiss("download-toast");
      toast.error("Failed to download folder.");
      setIsDownloading(false);
    },
  });

  function formatSize(size?: number) {
    if (!size && size !== 0) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function downloadFile(url: string, fileName: string) {
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Network response was not ok");
        return r.blob();
      })
      .then((blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(objectUrl);
      })
      .catch(() => toast.error("Download failed"));
  }

  function openViewer(url: string, name: string) {
    setCurrentDoc([{ uri: url, fileName: name }]);
    setViewerOpen(true);
  }

  function fileUrl(name: string) {
    return `${
      process.env.NEXT_PUBLIC_SUPABASE_URL
    }/storage/v1/object/public/docs/${params.id}/${
      currentPath ? currentPath + "/" : ""
    }${name}`;
  }

  function openNote(n: Note) {
    setSelectedNote(n);
    setSideOpen(true);
    console.log("analytics: open_side_panel", { noteId: n.id });
  }

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Actions Bar */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <Input
                placeholder="Search documents & notes…"
                className="w-72 pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              {"Filter"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(true)}>
              <FolderOpen className="mr-2 h-4 w-4" />
              {"New Folder"}
            </Button>
            <Button
              className="bg-neutral-900 text-white hover:bg-neutral-800"
              onClick={() => setUploadModal(true)}>
              <Upload className="mr-2 h-4 w-4" />
              {"Upload Files"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                  {"✨ New Note"}
                  <ChevronDown className="ml-1 h-4 w-4 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() =>
                    console.log("new_note_from_zoom", { projectId: params.id })
                  }>
                  {"From Zoom call (paste link or select past meeting)"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    console.log("new_note_from_site_visit", {
                      projectId: params.id,
                    })
                  }>
                  {"From Site Visit (upload audio/photos)"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    console.log("new_note_blank", { projectId: params.id })
                  }>
                  {"Blank note (paste text)"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Folders Grid */}
        <div>
          <h3 className="mb-4 text-sm font-medium text-neutral-900">
            {"Folders"}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {derivedFolders.map((folder) => (
              <Link
                key={folder.id}
                href={`/projects/${params.id}/docs/folders/${folder.id}`}
                className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                aria-label={`Open ${folder.name}`}>
                <Card className="cursor-pointer rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Folder
                          className="h-5 w-5 text-neutral-500"
                          aria-hidden="true"
                        />
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            {folder.name}
                          </h4>
                          <p className="mt-1 text-xs text-neutral-500">
                            {folder.fileCount} files • Updated{" "}
                            {folder.lastModified
                              ? formatDate(folder.lastModified)
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                            aria-label="Folder actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>{"Open"}</DropdownMenuItem>
                          <DropdownMenuItem>{"Rename"}</DropdownMenuItem>
                          <DropdownMenuItem>{"Move"}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Notes smart folder */}
            <button
              type="button"
              onClick={() => router.push(`/projects/${params.id}/docs/notes`)}
              className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
              aria-label="Open Notes">
              <Card className="cursor-pointer rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          aria-hidden="true"
                          className="flex h-8 w-8 items-center justify-center rounded-md"
                          style={{ backgroundColor: "#F4F1FF" }}>
                          <Folder className="h-5 w-5 text-neutral-600" />
                        </div>
                        <AIPill className="absolute -right-2 -top-2" />
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900">
                          {"Notes"}
                        </h4>
                        <p className="mt-1 text-xs text-neutral-500">
                          {notesFolder.items} items • {notesFolder.needsReview}{" "}
                          need review • Updated 7 Feb
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                          aria-label="Notes actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            router.push(`/projects/${params.id}/docs/notes`)
                          }>
                          {"Open Notes"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            console.log("new_note_from_notes_card", {
                              projectId: params.id,
                            })
                          }>
                          {"New Note"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            console.log("manage_notes_defaults", {
                              projectId: params.id,
                            })
                          }>
                          {"Manage defaults (visibility, review workflow)"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </button>
          </div>
        </div>

        {/* Two-state panel: Latest Notes (default) / Recent Files */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-neutral-300 bg-white p-0.5">
              {(["notes", "files"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActivePane(tab);
                    console.log("analytics: toggle_notes_files", { tab });
                  }}
                  aria-pressed={activePane === tab}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium",
                    activePane === tab
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-700 hover:bg-neutral-50",
                  ].join(" ")}>
                  {tab === "notes" ? "Latest Notes" : "Recent Files"}
                </button>
              ))}
            </div>
          </div>

          {activePane === "notes" ? (
            <NotesFeed
              notes={mockNotes}
              onOpen={(n) => openNote(n)}
              className="border border-neutral-200"
            />
          ) : (
            <Card className="rounded-xl border border-neutral-200">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {derivedRecentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-3 transition-colors hover:bg-neutral-50">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 truncate font-medium text-neutral-900">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-neutral-600">
                          <span>{formatSize(file.sizeBytes)}</span>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage
                                src={`/placeholder.svg?height=16&width=16&query=uploaded-by`}
                                alt=""
                              />
                              <AvatarFallback className="bg-neutral-900 text-[9px] text-white">
                                {"TS"}
                              </AvatarFallback>
                            </Avatar>
                            {"Team"}
                          </div>
                          <div className="flex items-center gap-1">
                            {file.uploadedAt
                              ? formatDate(file.uploadedAt)
                              : "-"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                          onClick={() =>
                            openViewer(fileUrl(file.name), file.name)
                          }>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                          onClick={() =>
                            downloadFile(fileUrl(file.name), file.name)
                          }>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Side Panel for notes */}
      <NotesSidePanel
        open={sideOpen}
        onOpenChange={setSideOpen}
        note={selectedNote}
      />

      {/* Create Folder Modal */}
      <Modal
        className="!h-[250px] !max-w-[500px] !py-7"
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Folder Create Modal">
        <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Create Folder</p>
            </div>
          </div>
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={() => setModalOpen(false)}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="py-4 my-7">
          <Input
            placeholder="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!newFolderName.trim())
                return toast.error("Folder name cannot be empty");
              createFolderMutation.mutate({
                projectId: params.id,
                folderName: newFolderName,
                path: currentPath,
              });
            }}>
            Create
          </Button>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        className="!h-[400px] !max-w-[600px] !py-7"
        isOpen={uploadModal}
        onRequestClose={() => setUploadModal(false)}
        contentLabel="Upload Modal">
        <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Upload Documents</p>
            </div>
          </div>
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={() => setUploadModal(false)}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <input
            type="file"
            multiple
            className="block w-full rounded-md border border-neutral-300 p-2"
            onChange={(e) => setFileQueue(Array.from(e.target.files || []))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!fileQueue.length) return toast.error("Select files first");
                if (fileQueue.length === 1) {
                  uploadMutation.mutate({
                    file: fileQueue[0],
                    id: params.id,
                    path: currentPath,
                    projectID: undefined,
                    task: undefined,
                  });
                } else {
                  toast.loading(`Uploading ${fileQueue.length} files...`, {
                    id: "upload-toast",
                  });
                  let completed = 0;
                  let failed = 0;
                  fileQueue.forEach((f) => {
                    uploadDoc({
                      file: f,
                      id: params.id,
                      path: currentPath,
                      projectID: undefined,
                      task: undefined,
                    })
                      .then(() => {
                        completed++;
                        if (completed + failed === fileQueue.length) {
                          toast.dismiss("upload-toast");
                          toast.success(
                            `Uploaded ${completed}/${fileQueue.length} files`
                          );
                          setFileQueue([]);
                          setUploadModal(false);
                          refetch();
                        }
                      })
                      .catch(() => {
                        failed++;
                        if (completed + failed === fileQueue.length) {
                          toast.dismiss("upload-toast");
                          toast.error("Some uploads failed");
                          refetch();
                        }
                      });
                  });
                }
              }}>
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* Viewer Modal */}
      <Modal
        className="!h-[90vh] !max-w-[1200px] !py-7"
        isOpen={viewerOpen}
        onRequestClose={() => setViewerOpen(false)}
        contentLabel="Document Viewer">
        <div className="navbar  flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2" />
          <div className="buttons flex items-center gap-4 !mt-0 px-2">
            {currentDoc && currentDoc[0]?.fileName && (
              <button
                onClick={() =>
                  downloadFile(currentDoc[0].uri, currentDoc[0].fileName)
                }
                className="text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
                title="Download with original filename">
                <Download className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setViewerOpen(false)}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div style={{ marginTop: "20px", width: "100%", height: "500px" }}>
          <DocViewer
            pluginRenderers={DocViewerRenderers}
            className="DocViewr"
            documents={currentDoc || []}
            config={{
              header: {
                disableHeader: false,
                disableFileName: false,
                retainURLParams: false,
              },
            }}
            style={{ height: "100%" }}
          />
        </div>
      </Modal>
    </div>
  );
}
