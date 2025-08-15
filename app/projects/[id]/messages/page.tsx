"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { ProjectNav } from "@/components/project-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Filter,
  Mail,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Zap,
  Star,
  StarOff,
  Share2,
  MoreHorizontal,
  Paperclip,
  Send,
  Archive,
  EllipsisVertical,
  PaperclipIcon,
  Reply,
  Forward,
  Smile,
  Pin,
  PinOff,
  BellOff,
  MoveRight,
  AlertCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type SourceType = "Email" | "Portal" | "System" | "AI"

type Thread = {
  id: number
  from: string
  avatar: string
  type: SourceType
  title: string
  preview: string
  projectItem: string
  received: string
  unread: boolean
  selected?: boolean
  actionCount: number
  online?: boolean
  hasAttachments?: boolean
  pinned?: boolean
  starred?: boolean
  messageCount?: number
  lastUpdated?: string
  aiNeedsReview?: boolean
}

type Msg = {
  id: number
  sender: string
  avatar: string
  message: string
  timestamp: string
  isClient: boolean
  attachments: { name: string; type: "image" | "file"; size: string }[]
  source?: SourceType
}

const initialThreads: Thread[] = [
  {
    id: 2,
    from: "Lighting Supplier",
    avatar: "LS",
    type: "Email",
    title: "Quote #LS-2024-001 - Pendant Lights",
    preview: "Please find attached our quote...",
    projectItem: "Pendant Lights",
    received: "4h ago",
    unread: false,
    selected: true,
    actionCount: 0,
    hasAttachments: true,
    pinned: true,
    starred: true,
    messageCount: 12,
    lastUpdated: "2:45 PM",
  },
  {
    id: 1,
    from: "Sarah Johnson",
    avatar: "SJ",
    type: "Portal",
    title: "Kitchen layout approval needed",
    preview: "Few questions about the island placement...",
    projectItem: "Kitchen Island",
    received: "2h ago",
    unread: true,
    actionCount: 2,
    online: true,
    hasAttachments: false,
    messageCount: 9,
    lastUpdated: "3:20 PM",
  },
  {
    id: 3,
    from: "Techstyles AI",
    avatar: "AI",
    type: "AI",
    title: "3 tasks completed, 2 require attention",
    preview: "Daily project summary; please review decisions...",
    projectItem: "Daily Summary",
    received: "6h ago",
    unread: true,
    actionCount: 1,
    hasAttachments: false,
    messageCount: 8,
    lastUpdated: "5:05 PM",
    aiNeedsReview: true,
  },
  {
    id: 4,
    from: "Mike Chen",
    avatar: "MC",
    type: "Portal",
    title: "Electrical outlet placement question",
    preview: "Need clarification on placement?",
    projectItem: "Electrical Work",
    received: "1d ago",
    unread: false,
    actionCount: 1,
    online: true,
    hasAttachments: true,
    messageCount: 5,
    lastUpdated: "Yesterday",
  },
  {
    id: 5,
    from: "System",
    avatar: "SY",
    type: "System",
    title: "Spec update: Flooring finish v3",
    preview: "Spec sheet updated by Jane • parquet oak • see Doc...",
    projectItem: "Flooring",
    received: "2d ago",
    unread: false,
    actionCount: 0,
    hasAttachments: false,
    messageCount: 3,
    lastUpdated: "2 days ago",
  },
]

const baseConversation: Msg[] = [
  {
    id: 1,
    sender: "Sarah Johnson",
    avatar: "SJ",
    message: "Hi team! I reviewed the latest kitchen design...",
    timestamp: "2:30 PM",
    isClient: true,
    attachments: [],
    source: "Portal",
  },
  {
    id: 2,
    sender: "Jane Designer",
    avatar: "JD",
    message: "Thanks! What specific questions do you have?",
    timestamp: "2:45 PM",
    isClient: false,
    attachments: [],
    source: "Portal",
  },
  {
    id: 3,
    sender: "Sarah Johnson",
    avatar: "SJ",
    message: "Could we move it closer to the window? See references attached.",
    timestamp: "3:15 PM",
    isClient: true,
    attachments: [
      { name: "kitchen-inspiration-1.jpg", type: "image", size: "2.4 MB" },
      { name: "kitchen-inspiration-2.jpg", type: "image", size: "1.8 MB" },
    ],
    source: "Portal",
  },
]

// Icon for source
function getTypeIcon(type: SourceType) {
  switch (type) {
    case "Email":
      return Mail
    case "Portal":
      return MessageSquare
    case "System":
      return Zap
    case "AI":
      return Sparkles
    default:
      return MessageSquare
  }
}

// Display label mapping (AI => AI notes)
function getTypeLabel(type: SourceType) {
  if (type === "AI") return "AI notes"
  return type
}

// Neutral source pill with text
function SourcePill({ type }: { type: SourceType }) {
  const Icon = getTypeIcon(type)
  const label = getTypeLabel(type)
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-neutral-100 text-gray-700 px-2.5 py-1 text-[11px] font-medium leading-none">
      <Icon className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
      {label}
    </span>
  )
}

// Heuristic: action required
function getActionRequiredCount(t: Thread) {
  let count = 0
  if (t.actionCount > 0) count += t.actionCount
  if (t.preview.trim().endsWith("?")) count += 1
  if (t.hasAttachments) count += 1
  if (t.type === "AI" && t.aiNeedsReview) count += 1
  return count
}

export default function ProjectMessagesPage({ params }: { params: { id: string } }) {
  const [threads, setThreads] = useState<Thread[]>(initialThreads)
  const [selectedThreadId, setSelectedThreadId] = useState<number>(
    initialThreads.find((t) => t.selected)?.id ?? initialThreads[0].id,
  )
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<"All" | "Action-Required" | "Starred">("All")
  const [selectedSources, setSelectedSources] = useState<Set<SourceType>>(new Set())
  const [sendVia, setSendVia] = useState<"Email" | "Portal">("Portal")
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingList] = useState(false)
  const { toast } = useToast()

  const selectedThread = useMemo(() => threads.find((t) => t.id === selectedThreadId)!, [threads, selectedThreadId])

  const conversation: Msg[] = useMemo(() => {
    const msgs = [...baseConversation]
    if (selectedThread?.type === "Email") {
      msgs.unshift({
        id: 0,
        sender: "Lighting Supplier",
        avatar: "LS",
        message: "Dear Jane, attached is our updated quote for the pendant lights.",
        timestamp: "1:55 PM",
        isClient: false,
        attachments: [{ name: "Quote-LS-2024-001.pdf", type: "file", size: "320 KB" }],
        source: "Email",
      })
      while (msgs.length < 8) {
        msgs.push({
          id: msgs.length + 10,
          sender: "Jane Designer",
          avatar: "JD",
          message: "Noted, thanks. We will review and get back to you.",
          timestamp: "2:10 PM",
          isClient: false,
          attachments: [],
          source: "Email",
        })
      }
    }
    if (selectedThread?.type === "AI") {
      return msgs.map((m) => ({ ...m, source: "AI" as SourceType }))
    }
    return msgs
  }, [selectedThread])

  const filteredThreads = useMemo(() => {
    let list = threads.slice()

    if (tab === "Action-Required") {
      list = list.filter((t) => getActionRequiredCount(t) > 0)
    } else if (tab === "Starred") {
      list = list.filter((t) => t.starred)
    }

    if (selectedSources.size > 0) {
      list = list.filter((t) => selectedSources.has(t.type))
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (t) =>
          t.from.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.preview.toLowerCase().includes(q) ||
          t.projectItem.toLowerCase().includes(q),
      )
    }

    list.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
    return list
  }, [threads, tab, selectedSources, query])

  const pinned = filteredThreads.filter((t) => t.pinned)
  const unpinned = filteredThreads.filter((t) => !t.pinned)

  function toggleSource(type: SourceType) {
    setSelectedSources((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function clearSources() {
    setSelectedSources(new Set())
  }

  function markAllRead() {
    setThreads((prev) => prev.map((t) => ({ ...t, unread: false })))
    toast({ title: "All messages marked as read" })
  }

  function onStar(t: Thread) {
    setThreads((prev) => prev.map((x) => (x.id === t.id ? { ...x, starred: !x.starred } : x)))
  }

  function onPin(t: Thread) {
    setThreads((prev) => prev.map((x) => (x.id === t.id ? { ...x, pinned: !x.pinned } : x)))
  }

  function onApproveAI(t: Thread) {
    if (t.type !== "AI") return
    setThreads((prev) =>
      prev.map((x) =>
        x.id === t.id ? { ...x, aiNeedsReview: false, actionCount: Math.max(0, x.actionCount - 1) } : x,
      ),
    )
    toast({ title: "AI Note approved" })
  }

  const showAISummary = (selectedThread?.messageCount ?? conversation.length) > 6
  const actionCountForSelected = getActionRequiredCount(selectedThread ?? initialThreads[0])

  // Placeholder project name for header subline
  const projectName = "Luxury Penthouse"

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Top toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedSources.size === 0 ? "default" : "outline"}
              size="sm"
              className={
                selectedSources.size === 0
                  ? "h-9 px-4 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded-md"
                  : "h-9 px-4 text-sm text-gray-700 border-gray-300 bg-transparent hover:bg-gray-50 rounded-md"
              }
              onClick={clearSources}
            >
              All
            </Button>
            <Button
              variant={selectedSources.has("Email") ? "default" : "outline"}
              size="sm"
              className={
                selectedSources.has("Email")
                  ? "h-9 px-4 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded-md"
                  : "h-9 px-4 text-sm text-gray-700 border-gray-300 bg-transparent hover:bg-gray-50 rounded-md"
              }
              onClick={() => toggleSource("Email")}
            >
              Emails
            </Button>
            <Button
              variant={selectedSources.has("Portal") ? "default" : "outline"}
              size="sm"
              className={
                selectedSources.has("Portal")
                  ? "h-9 px-4 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded-md"
                  : "h-9 px-4 text-sm text-gray-700 border-gray-300 bg-transparent hover:bg-gray-50 rounded-md"
              }
              onClick={() => toggleSource("Portal")}
            >
              Portal
            </Button>
            <Button
              variant={selectedSources.has("AI") ? "default" : "outline"}
              size="sm"
              className={
                selectedSources.has("AI")
                  ? "h-9 px-4 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded-md"
                  : "h-9 px-4 text-sm text-gray-700 border-gray-300 bg-transparent hover:bg-gray-50 rounded-md"
              }
              onClick={() => toggleSource("AI")}
            >
              AI notes
            </Button>
          </div>

          <div className="flex-1 flex justify-center px-8">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-gray-300 focus:ring-0"
                aria-label="Search messages"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700 border-gray-300 bg-transparent rounded-md text-xs"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="text-gray-700 border-gray-300 bg-transparent rounded-md text-xs"
            >
              <Archive className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: thread list */}
          <aside className="bg-white border border-gray-200 rounded-xl shadow-sm">
            {/* Header: three filter pills (clay/terracotta active) */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {(["All", "Action-Required", "Starred"] as const).map((t) => (
                  <Button
                    key={t}
                    variant={tab === t ? "default" : "outline"}
                    size="sm"
                    className={
                      tab === t
                        ? "h-8 px-3 text-sm rounded-full bg-[#C76850] text-white hover:bg-[#B85C47] shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]"
                        : "h-8 px-3 text-sm rounded-full text-slate-700 border border-slate-300 bg-white hover:bg-slate-50"
                    }
                    onClick={() => setTab(t)}
                    aria-pressed={tab === t}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            {pinned.length > 0 && (
              <div className="px-4 pt-3 text-[11px] text-gray-500 uppercase tracking-wide">Pinned</div>
            )}

            <div className="divide-y divide-gray-100">
              {isLoadingList &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`s-${i}`} className="p-4 min-h-[72px] animate-pulse">
                    <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
                    <div className="h-3 w-48 bg-neutral-200 rounded" />
                  </div>
                ))}

              {pinned.map((thread) => (
                <ThreadRow
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThreadId === thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  onStar={() => onStar(thread)}
                  onPin={() => onPin(thread)}
                />
              ))}

              {unpinned.map((thread) => (
                <ThreadRow
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThreadId === thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  onStar={() => onStar(thread)}
                  onPin={() => onPin(thread)}
                />
              ))}

              {!isLoadingList && filteredThreads.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-600">
                  {tab === "All"
                    ? "No messages yet. Connect email or start a portal thread."
                    : "You’re all caught up 🙌"}
                </div>
              )}
            </div>
          </aside>

          {/* Right: reading pane */}
          <section className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
            {selectedThread ? (
              <>
                {/* Sticky header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatars stacked */}
                        <div className="flex -space-x-2">
                          <Avatar className="w-7 h-7 ring-2 ring-white">
                            <AvatarFallback className="bg-gray-900 text-white text-[10px] font-semibold">
                              {selectedThread.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-7 h-7 ring-2 ring-white">
                            <AvatarFallback className="bg-neutral-300 text-gray-700 text-[10px] font-semibold">
                              JD
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="min-w-0">
                          {/* Top line: title only (no pills) */}
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900 truncate">{selectedThread.title}</h3>
                          </div>

                          {/* Subline: project chip + compact icons (no text) */}
                          <div className="mt-1 flex items-center gap-3">
                            <span className="inline-flex items-center rounded-md border border-gray-300 text-gray-700 px-2 py-0.5 text-[11px]">
                              {projectName}
                            </span>

                            {/* Source icon only */}
                            <HeaderIconForSource type={selectedThread.type} />

                            {/* Action/attention icon-only */}
                            {(actionCountForSelected > 0 ||
                              (selectedThread.type === "AI" && selectedThread.aiNeedsReview)) && (
                              <span
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C76850] text-white"
                                title="Needs attention"
                                aria-label="Needs attention"
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                              </span>
                            )}

                            {/* Attachment indicator (icon only) */}
                            {selectedThread.hasAttachments && (
                              <Paperclip className="h-4 w-4 text-gray-500" aria-label="Has attachments" />
                            )}

                            <p className="text-[11px] text-gray-500">
                              {`${selectedThread.messageCount ?? conversation.length} messages • last updated ${selectedThread.lastUpdated ?? "recently"}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Header actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => onStar(selectedThread)}
                          aria-label={selectedThread.starred ? "Unstar" : "Star"}
                        >
                          {selectedThread.starred ? (
                            <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-gray-700"
                          aria-label="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500 hover:text-gray-700"
                              aria-label="More"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>
                              Copy link
                            </DropdownMenuItem>
                            <DropdownMenuItem>Open in portal/email</DropdownMenuItem>
                            <DropdownMenuItem>Print</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI summary (unchanged) */}
                {showAISummary && (
                  <div className="m-4 border border-gray-200 rounded-lg bg-neutral-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-1">Key points</h4>
                          <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                            <li>Lighting quote received; variant A preferred.</li>
                            <li>Client asked for island position adjustments.</li>
                            <li>Electrical outlet placement pending confirmation.</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-1">Decisions</h4>
                          <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                            <li>Proceed with matte black pendants.</li>
                            <li>Island moved 10cm towards the window.</li>
                            <li>Awaiting final approval from client.</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-1">Next steps</h4>
                          <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                            <li>Confirm electrical layout with contractor.</li>
                            <li>Update drawing set and circulate.</li>
                            <li>Send PO draft for lights.</li>
                          </ul>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col gap-2">
                        <ConvertDialog triggerLabel="Convert → Task" type="Task" />
                        <ConvertDialog triggerLabel="Convert → RFI" type="RFI" />
                        <ConvertDialog triggerLabel="Convert → PO" type="PO" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conversation */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {conversation.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "group relative flex items-start gap-3",
                        message.isClient ? "justify-start" : "justify-end",
                      )}
                    >
                      {message.isClient && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-900 text-white text-xs font-semibold">
                            {message.avatar}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("max-w-md", message.isClient ? "order-2" : "order-1")}>
                        <div
                          className={cn(
                            "rounded-lg p-3",
                            message.isClient ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-white",
                          )}
                        >
                          {/* tiny source icon + time */}
                          <div
                            className={cn(
                              "mb-1 flex items-center gap-2 text-[11px]",
                              message.isClient ? "text-gray-600" : "text-neutral-300",
                            )}
                          >
                            <TinySourceIcon type={message.source ?? selectedThread.type} />
                            <span>{message.timestamp}</span>
                          </div>
                          <p className="text-sm">{message.message}</p>

                          {message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded border">
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4" />
                                    <span className="text-xs">{attachment.name}</span>
                                    <span className="text-[11px] text-gray-500">{attachment.size}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="text-xs h-6 bg-transparent">
                                      Add to Vision Board
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs h-6 bg-transparent">
                                      Create PO
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* micro-toolbar */}
                        <div
                          className={cn(
                            "absolute -right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                            message.isClient ? "" : "right-auto -left-1",
                          )}
                        >
                          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-1 flex items-center gap-1">
                            <IconGhostButton
                              icon={Reply}
                              label="Reply"
                              onClick={() => toast({ title: "Reply (placeholder)" })}
                            />
                            <IconGhostButton
                              icon={Forward}
                              label="Forward"
                              onClick={() => toast({ title: "Forward (placeholder)" })}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem>Convert to Task</DropdownMenuItem>
                                <DropdownMenuItem>Convert to RFI</DropdownMenuItem>
                                <DropdownMenuItem>Convert to PO</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Save to Docs</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      {!message.isClient && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-900 text-white text-xs font-semibold">
                            {message.avatar}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>

                {/* Composer */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Write a reply…"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[72px] resize-y"
                        aria-label="Message composer"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="text-xs bg-transparent">
                            <PaperclipIcon className="w-4 h-4 mr-1" />
                            Attach
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs bg-transparent">
                            <Smile className="w-4 h-4 mr-1" />
                            Emoji
                          </Button>
                          <div className="ml-2 inline-flex rounded-lg border border-gray-200">
                            {(["Email", "Portal"] as const).map((ch) => (
                              <button
                                key={ch}
                                type="button"
                                onClick={() => setSendVia(ch)}
                                className={cn(
                                  "px-3 py-1.5 text-xs font-medium rounded-md",
                                  sendVia === ch ? "bg-neutral-100 text-gray-900" : "text-gray-700 hover:bg-neutral-50",
                                )}
                                aria-pressed={sendVia === ch}
                              >
                                Send as {ch}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedThread.type === "AI" && selectedThread.aiNeedsReview && (
                            <Button variant="outline" size="sm" onClick={() => onApproveAI(selectedThread)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="bg-gray-900 text-white hover:bg-gray-800"
                            onClick={() => {
                              toast({ title: `Send via ${sendVia} (placeholder)` })
                              setNewMessage("")
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a message to view the conversation</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function ThreadRow({
  thread,
  isSelected,
  onClick,
  onStar,
  onPin,
}: {
  thread: Thread
  isSelected: boolean
  onClick: () => void
  onStar: () => void
  onPin: () => void
}) {
  const Icon = getTypeIcon(thread.type)
  const actionRequired = getActionRequiredCount(thread)
  const label = getTypeLabel(thread.type)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={cn(
        "group relative p-4 min-h-[72px] cursor-pointer transition-colors",
        isSelected ? "bg-greige-100" : "hover:bg-slate-50",
      )}
    >
      {/* right-edge kebab on hover */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onStar}>
              {thread.starred ? <StarOff className="h-4 w-4 mr-2" /> : <Star className="h-4 w-4 mr-2" />}
              {thread.starred ? "Unstar" : "Star"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPin}>
              {thread.pinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
              {thread.pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BellOff className="h-4 w-4 mr-2" />
              Mute
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MoveRight className="h-4 w-4 mr-2" />
              Move to…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-start gap-3">
        <Avatar className="w-6 h-6">
          <AvatarFallback className="bg-gray-900 text-white text-[10px] font-semibold">{thread.avatar}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Line 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn("text-sm truncate", thread.unread ? "font-semibold text-gray-900" : "text-gray-900")}>
                {thread.from}
              </span>
              {/* Source pill with text (AI => AI notes) */}
              <span className="inline-flex items-center rounded-md border border-gray-200 bg-neutral-100 text-gray-700 px-2.5 py-1 text-[11px] leading-none font-medium">
                <Icon className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {label}
              </span>
              {/* attachments icon remains inline */}
              {thread.hasAttachments && (
                <Paperclip className="w-3.5 h-3.5 text-gray-400" aria-label="Has attachments" />
              )}
            </div>
            <span className="text-xs text-gray-500 shrink-0">{thread.received}</span>
          </div>

          {/* Line 2 */}
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs text-gray-600 truncate flex-1">
              {thread.title} — {thread.preview}
            </p>
            {/* Removed text StatusBadge to keep the row cleaner */}
          </div>

          {/* Bottom: project chip with compact icons (action/attention next to pill) */}
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-gray-300 text-gray-700 px-2 py-0.5 text-[11px]">
              {thread.projectItem}
            </span>
            {(actionRequired > 0 || (thread.type === "AI" && thread.aiNeedsReview)) && (
              <AlertCircle className="h-4 w-4 text-[#C76850]" aria-label="Needs attention" title="Needs attention" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function HeaderIconForSource({ type }: { type: SourceType }) {
  const Icon = getTypeIcon(type)
  return <Icon className="h-4 w-4 text-gray-600" aria-label={getTypeLabel(type)} title={getTypeLabel(type)} />
}

function TinySourceIcon({ type }: { type: SourceType }) {
  const Icon = getTypeIcon(type)
  return <Icon className="h-3.5 w-3.5" aria-hidden="true" />
}

function IconGhostButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
}) {
  return (
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClick} aria-label={label} title={label}>
      <Icon className="h-4 w-4" />
    </Button>
  )
}

function ConvertDialog({ triggerLabel, type }: { triggerLabel: string; type: "Task" | "RFI" | "PO" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs bg-transparent whitespace-nowrap rounded-md">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Convert to ${type}`}</DialogTitle>
          <DialogDescription>Front-end only placeholder. Select options and confirm to continue.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 w-24">Assignee</label>
            <Input placeholder="Search or select…" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 w-24">Due date</label>
            <Input type="date" />
          </div>
          <div className="flex items-start gap-2">
            <label className="text-sm text-gray-700 w-24 mt-2">Include</label>
            <Textarea placeholder="Paste bullets or select from summary…" className="min-h-[100px]" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button className="bg-gray-900 text-white hover:bg-gray-800">Convert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
