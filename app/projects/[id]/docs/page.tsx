"use client"

import Link from "next/link"
import * as React from "react"
import { useRouter } from "next/navigation"
import { ProjectNav } from "@/components/project-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NotesFeed } from "@/components/notes-feed"
import { NotesSidePanel } from "@/components/notes-side-panel"
import { mockNotes } from "@/components/notes-mocks"
import type { Note } from "@/components/notes-types"
import { AIPill } from "@/components/ai-pill"

const baseFolders = [
  { id: 1, name: "Design Concepts", fileCount: 15, lastModified: "2024-02-06" },
  { id: 2, name: "Technical Drawings", fileCount: 8, lastModified: "2024-02-05" },
  // Removed Client Communications
  { id: 4, name: "Procurement Documents", fileCount: 6, lastModified: "2024-02-04" },
  { id: 5, name: "Site Photos", fileCount: 24, lastModified: "2024-02-07" },
  { id: 6, name: "Contracts & Legal", fileCount: 4, lastModified: "2024-01-28" },
]

const notesFolder = {
  id: 999,
  name: "Notes",
  items: 12,
  needsReview: 3,
  lastModified: "2024-02-07",
}

const recentFiles = [
  {
    id: 1,
    name: "Kitchen_Final_Design_v3.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "Jane Designer",
    uploadedAt: "2024-02-07T10:30:00",
  },
  {
    id: 2,
    name: "Site_Progress_Feb07.jpg",
    type: "image",
    size: "1.8 MB",
    uploadedBy: "Mike Chen",
    uploadedAt: "2024-02-07T14:15:00",
  },
  {
    id: 3,
    name: "Material_Specifications.xlsx",
    type: "spreadsheet",
    size: "856 KB",
    uploadedBy: "Sarah Johnson",
    uploadedAt: "2024-02-06T16:45:00",
  },
  {
    id: 4,
    name: "Electrical_Plans_v2.dwg",
    type: "cad",
    size: "3.2 MB",
    uploadedBy: "Tom Wilson",
    uploadedAt: "2024-02-06T11:20:00",
  },
]

function getFileIcon(type: string) {
  switch (type) {
    case "image":
      return <ImageIcon className="h-4 w-4 text-neutral-500" aria-hidden="true" />
    case "pdf":
      return <FileText className="h-4 w-4 text-neutral-500" aria-hidden="true" />
    case "spreadsheet":
      return <FileText className="h-4 w-4 text-neutral-500" aria-hidden="true" />
    case "cad":
      return <File className="h-4 w-4 text-neutral-500" aria-hidden="true" />
    default:
      return <File className="h-4 w-4 text-neutral-500" aria-hidden="true" />
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return "Yesterday"
  return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
}

export default function ProjectDocsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activePane, setActivePane] = React.useState<"notes" | "files">("notes")
  const [sideOpen, setSideOpen] = React.useState(false)
  const [selectedNote, setSelectedNote] = React.useState<Note | undefined>(undefined)

  function openNote(n: Note) {
    setSelectedNote(n)
    setSideOpen(true)
    console.log("analytics: open_side_panel", { noteId: n.id })
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
              <Input placeholder="Search documents & notes…" className="w-72 pl-9" />
            </div>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              {"Filter"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FolderOpen className="mr-2 h-4 w-4" />
              {"New Folder"}
            </Button>
            <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
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
                <DropdownMenuItem onSelect={() => console.log("new_note_from_zoom", { projectId: params.id })}>
                  {"From Zoom call (paste link or select past meeting)"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => console.log("new_note_from_site_visit", { projectId: params.id })}>
                  {"From Site Visit (upload audio/photos)"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => console.log("new_note_blank", { projectId: params.id })}>
                  {"Blank note (paste text)"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Folders Grid */}
        <div>
          <h3 className="mb-4 text-sm font-medium text-neutral-900">{"Folders"}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {baseFolders.map((folder) => (
              <Link
                key={folder.id}
                href={`/projects/${params.id}/docs/folders/${folder.id}`}
                className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                aria-label={`Open ${folder.name}`}
              >
                <Card className="cursor-pointer rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5 text-neutral-500" aria-hidden="true" />
                        <div>
                          <h4 className="font-medium text-neutral-900">{folder.name}</h4>
                          <p className="mt-1 text-xs text-neutral-500">
                            {folder.fileCount} files • Updated {formatDate(folder.lastModified)}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                            aria-label="Folder actions"
                          >
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
              aria-label="Open Notes"
            >
              <Card className="cursor-pointer rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          aria-hidden="true"
                          className="flex h-8 w-8 items-center justify-center rounded-md"
                          style={{ backgroundColor: "#F4F1FF" }}
                        >
                          <Folder className="h-5 w-5 text-neutral-600" />
                        </div>
                        <AIPill className="absolute -right-2 -top-2" />
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900">{"Notes"}</h4>
                        <p className="mt-1 text-xs text-neutral-500">
                          {notesFolder.items} items • {notesFolder.needsReview} need review • Updated 7 Feb
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                          aria-label="Notes actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => router.push(`/projects/${params.id}/docs/notes`)}>
                          {"Open Notes"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => console.log("new_note_from_notes_card", { projectId: params.id })}
                        >
                          {"New Note"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => console.log("manage_notes_defaults", { projectId: params.id })}
                        >
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
                    setActivePane(tab)
                    console.log("analytics: toggle_notes_files", { tab })
                  }}
                  aria-pressed={activePane === tab}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium",
                    activePane === tab ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  {tab === "notes" ? "Latest Notes" : "Recent Files"}
                </button>
              ))}
            </div>
          </div>

          {activePane === "notes" ? (
            <NotesFeed notes={mockNotes} onOpen={(n) => openNote(n)} className="border border-neutral-200" />
          ) : (
            <Card className="rounded-xl border border-neutral-200">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {recentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-3 transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 truncate font-medium text-neutral-900">{file.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-neutral-600">
                          <span>{file.size}</span>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={`/placeholder.svg?height=16&width=16&query=uploaded-by`} alt="" />
                              <AvatarFallback className="bg-neutral-900 text-[9px] text-white">
                                {file.uploadedBy
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {file.uploadedBy}
                          </div>
                          <div className="flex items-center gap-1">{formatDate(file.uploadedAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                        >
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
      <NotesSidePanel open={sideOpen} onOpenChange={setSideOpen} note={selectedNote} />
    </div>
  )
}
