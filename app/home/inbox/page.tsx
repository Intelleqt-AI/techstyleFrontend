"use client"

import { useMemo, useState } from "react"
import { HomeNav } from "@/components/home-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  AtSign,
  Bell,
  Archive,
  Search,
  Filter,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Reply,
  Forward,
  Star,
  Mail,
  Sparkles,
} from "lucide-react"

type InboxType = "all" | "mentions" | "system" | "emails" | "ai-notes"
type MessageType = "mention" | "system" | "comment" | "email" | "ai-note"
type NoteStatus = "needs_review" | "published"
type NoteSource = "zoom" | "mobile" | "upload"

type ConversationItem = {
  id: number
  sender: string
  content: string
  time: string
  avatar: string | null
}

type InboxItem = {
  id: number
  type: MessageType
  from: string
  message: string
  subject?: string
  project: string
  time: string
  unread: boolean
  avatar: string | null
  conversation: ConversationItem[]
  // Optional fields for AI Notes
  noteStatus?: NoteStatus
  noteSource?: NoteSource
  noteTitle?: string
}

const messages: InboxItem[] = [
  {
    id: 1,
    type: "mention",
    from: "Mike Johnson",
    message: "@jane Can you review the kitchen layout for the TechCorp project?",
    project: "Modern Office Space",
    time: "2h ago",
    unread: true,
    avatar: "/placeholder.svg?height=32&width=32",
    conversation: [
      {
        id: 1,
        sender: "Mike Johnson",
        content:
          "@jane Can you review the kitchen layout for the TechCorp project? I've attached the latest drawings and would love your feedback on the island placement.",
        time: "2h ago",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        id: 2,
        sender: "You",
        content: "Thanks Mike! I'll take a look at the drawings and get back to you by end of day.",
        time: "1h ago",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ],
  },
  {
    id: 2,
    type: "system",
    from: "System",
    message: "Budget approval required for Luxury Penthouse project",
    project: "Luxury Penthouse",
    time: "4h ago",
    unread: true,
    avatar: null,
    conversation: [
      {
        id: 1,
        sender: "System",
        content:
          "Budget approval required for Luxury Penthouse project. The current budget request exceeds the approved amount by $15,000.",
        time: "4h ago",
        avatar: null,
      },
    ],
  },
  {
    id: 3,
    type: "comment",
    from: "Sarah Wilson",
    message: "Added new lighting options to the mood board",
    project: "Boutique Hotel",
    time: "6h ago",
    unread: false,
    avatar: "/placeholder.svg?height=32&width=32",
    conversation: [
      {
        id: 1,
        sender: "Sarah Wilson",
        content:
          "Added new lighting options to the mood board. I think the pendant lights would work really well in the lobby area.",
        time: "6h ago",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ],
  },
  // Updated: David Chen item converted to an AI Note preview
  {
    id: 4,
    type: "ai-note",
    from: "David Chen",
    noteTitle: "Site Visit — Master Bedroom Flooring",
    message:
      "AI summary: Client wants to explore alternative flooring options for the master bedroom. Current hardwood feels too dark; consider lighter oak or warm-toned engineered wood with matt finish.",
    project: "Luxury Penthouse",
    time: "8h ago",
    unread: false,
    avatar: "/placeholder.svg?height=32&width=32",
    noteStatus: "needs_review",
    noteSource: "mobile",
    conversation: [
      {
        id: 1,
        sender: "AI Note",
        content:
          "Executive summary drafted. Tap 'Open' to review decisions and action items. Attachments include two photos and a voice memo.",
        time: "8h ago",
        avatar: null,
      },
    ],
  },
  {
    id: 5,
    type: "system",
    from: "System",
    message: "New contractor proposal received for electrical work",
    project: "Modern Office Space",
    time: "1d ago",
    unread: false,
    avatar: null,
    conversation: [
      {
        id: 1,
        sender: "System",
        content:
          "New contractor proposal received for electrical work on the Modern Office Space project. Review required within 48 hours.",
        time: "1d ago",
        avatar: null,
      },
    ],
  },
  // Example email item
  {
    id: 6,
    type: "email",
    from: "Emily Parker",
    subject: "Re: FF&E selections for breakout areas",
    message: "Hi team — attaching revised FF&E selections for the breakout areas. Let me know if you have questions.",
    project: "Modern Office Space",
    time: "3h ago",
    unread: true,
    avatar: "/placeholder.svg?height=32&width=32",
    conversation: [
      {
        id: 1,
        sender: "Emily Parker",
        content:
          "Hi team — attaching revised FF&E selections for the breakout areas. Please review the updated armchair and side table options. We can sync tomorrow if needed.",
        time: "3h ago",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        id: 2,
        sender: "You",
        content: "Thanks, Emily! Received. We'll review these selections and circle back with any questions.",
        time: "2h ago",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ],
  },
]

export default function InboxPage() {
  const [filter, setFilter] = useState<InboxType>("all")
  const [selectedMessage, setSelectedMessage] = useState<InboxItem | null>(messages[0])
  const [newMessage, setNewMessage] = useState("")

  const filteredMessages = useMemo(() => {
    switch (filter) {
      case "mentions":
        return messages.filter((m) => m.type === "mention")
      case "system":
        return messages.filter((m) => m.type === "system")
      case "emails":
        return messages.filter((m) => m.type === "email")
      case "ai-notes":
        return messages.filter((m) => m.type === "ai-note")
      case "all":
      default:
        return messages
    }
  }, [filter])

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HomeNav />

        {/* Header with filters, search, and actions */}
        <div className="flex items-center justify-between">
          {/* Left: Filter buttons */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-sm font-medium hover:text-white ${filter === "all" ? "text-white" : "text-gray-600"}`}
              style={filter === "all" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-sm font-medium hover:text-white ${filter === "mentions" ? "text-white" : "text-gray-600"}`}
              style={filter === "mentions" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
              onClick={() => setFilter("mentions")}
            >
              Mentions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-sm font-medium hover:text-white ${filter === "system" ? "text-white" : "text-gray-600"}`}
              style={filter === "system" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
              onClick={() => setFilter("system")}
            >
              System
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-sm font-medium hover:text-white ${filter === "emails" ? "text-white" : "text-gray-600"}`}
              style={filter === "emails" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
              onClick={() => setFilter("emails")}
            >
              Emails
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-sm font-medium hover:text-white ${filter === "ai-notes" ? "text-white" : "text-gray-600"}`}
              style={filter === "ai-notes" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
              onClick={() => setFilter("ai-notes")}
            >
              AI Notes
            </Button>
          </div>

          {/* Center: Search */}
          <div className="flex-1 flex justify-center px-8">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search inbox..."
                className="pl-10 bg-white border-gray-200 focus:border-gray-300 focus:ring-0"
              />
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 bg-transparent">
              <Archive className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          {/* Left Column: Messages List */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Recent Messages</h3>
            </div>

            <div className="overflow-y-auto h-full">
              <div className="divide-y divide-gray-100">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      message.unread ? "bg-[#FBEAE1]" : ""
                    } ${selectedMessage?.id === message.id ? "bg-gray-100" : ""}`}
                  >
                    {/* Unread indicator */}
                    {message.unread && <div className="w-2 h-2 bg-[#E07A57] rounded-full flex-shrink-0 mt-2" />}

                    {/* Avatar or fallback icon */}
                    <div className="flex-shrink-0">
                      {message.avatar ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={message.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                            {message.from
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Bell className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{message.from}</span>

                        {/* Type badges (neutral/brand-aligned) */}
                        {message.type === "mention" && (
                          <Badge className="bg-[#F1BBAA] text-[#CE6B4E] border-[#E68E71] text-xs">
                            <AtSign className="w-3 h-3 mr-1" />
                            Mention
                          </Badge>
                        )}
                        {message.type === "system" && (
                          <Badge className="bg-[#EFEAE2] text-[#7D786C] border-[#B6B0A4] text-xs">
                            <Bell className="w-3 h-3 mr-1" />
                            System
                          </Badge>
                        )}
                        {message.type === "comment" && (
                          <Badge className="bg-[#B9C7B7] text-[#6E7A58] border-[#8FA58F] text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Comment
                          </Badge>
                        )}
                        {message.type === "email" && (
                          <Badge variant="outline" className="text-gray-600 border-gray-300 bg-transparent text-xs">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Badge>
                        )}
                        {message.type === "ai-note" && (
                          <Badge variant="outline" className="text-gray-600 border-gray-300 bg-transparent text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Note
                          </Badge>
                        )}

                        <span className="text-xs text-gray-500">{message.time}</span>

                        {/* Optional small status chip for AI Note */}
                        {message.type === "ai-note" && message.noteStatus === "needs_review" && (
                          <Badge variant="outline" className="text-gray-600 border-gray-300 bg-transparent text-[10px]">
                            Needs review
                          </Badge>
                        )}
                      </div>

                      {/* Subject (if email) + snippet/message */}
                      <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                        {message.subject ? <span className="font-medium">{message.subject} — </span> : null}
                        {message.noteTitle ? <span className="font-medium">{message.noteTitle}: </span> : null}
                        {message.message}
                      </p>

                      {/* Project line (kept neutral) */}
                      <div className="text-xs text-gray-500">
                        Project: <span className="font-medium text-gray-700">{message.project}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMessages.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500">No items for this filter.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Detail View */}
          <div className="col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {selectedMessage ? (
              <>
                {/* Header (unchanged) */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {selectedMessage.avatar ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedMessage.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                            {selectedMessage.from
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Bell className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedMessage.from}</h3>
                      <p className="text-sm text-gray-500">{selectedMessage.project}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" aria-label="Star">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label="Reply">
                      <Reply className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label="Forward">
                      <Forward className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label="More options">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Detail body */}
                {selectedMessage.type === "ai-note" ? (
                  <>
                    {/* AI Note card preview (neutral styling, same palette) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="border border-gray-200 rounded-lg bg-white">
                        <div className="p-4 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-gray-600 border-gray-300 bg-transparent text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Note
                            </Badge>
                            {selectedMessage.noteSource && (
                              <span className="text-xs text-gray-500 capitalize">{selectedMessage.noteSource}</span>
                            )}
                            {selectedMessage.noteStatus === "needs_review" && (
                              <Badge
                                variant="outline"
                                className="text-gray-600 border-gray-300 bg-transparent text-[10px]"
                              >
                                Needs review
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-gray-900 text-white hover:bg-gray-800"
                              onClick={() => {
                                console.log("Approve AI Note")
                              }}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>

                        <div className="px-4 pb-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {selectedMessage.noteTitle || "AI-generated note"}
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">{selectedMessage.message}</p>
                          </div>

                          {/* Executive summary */}
                          <section aria-labelledby="exec-summary">
                            <h5 id="exec-summary" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Executive summary
                            </h5>
                            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                              <li>Lighter-toned flooring options preferred to increase perceived brightness.</li>
                              <li>Durability and low-maintenance prioritized due to anticipated foot traffic.</li>
                              <li>Consider acoustic underlay to mitigate echo in high-ceiling space.</li>
                            </ul>
                          </section>

                          {/* Decisions */}
                          <section aria-labelledby="decisions">
                            <h5 id="decisions" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Decisions
                            </h5>
                            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                              <li>Drop current hardwood SKU-1823 from shortlist.</li>
                              <li>Evaluate two oak samples with matte finish next visit.</li>
                            </ul>
                          </section>

                          {/* Action items */}
                          <section aria-labelledby="actions">
                            <h5 id="actions" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Action items
                            </h5>
                            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                              <li>Request quotes for engineered oak options by Friday.</li>
                              <li>Schedule on-site sample review with client next week.</li>
                            </ul>
                          </section>

                          {/* Risks */}
                          <section aria-labelledby="risks">
                            <h5 id="risks" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Risks / blockers
                            </h5>
                            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                              <li>Lead times on preferred SKUs may extend beyond current milestone.</li>
                            </ul>
                          </section>

                          {/* Recording / attachments (lightweight placeholders) */}
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-500">Attachments:</span>
                              <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                                Site photos (2)
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                                Voice memo
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Quick actions row (neutral) */}
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="text-gray-700 bg-transparent">
                              Assign to me
                            </Button>
                            <Button variant="outline" size="sm" className="text-gray-700 bg-transparent">
                              Create task
                            </Button>
                            <Button variant="outline" size="sm" className="text-gray-700 bg-transparent">
                              Jump to project
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Messages thread (kept unchanged for non AI Notes) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedMessage.conversation.map((msg) => (
                        <div key={msg.id} className="flex gap-3">
                          <div className="flex-shrink-0">
                            {msg.avatar ? (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={msg.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                  {msg.sender
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Bell className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">{msg.sender}</span>
                              <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-700">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply Input */}
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Type your reply..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="min-h-[80px] resize-none border-gray-200 focus:border-gray-300 focus:ring-0"
                          />
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" aria-label="Attach file">
                                <Paperclip className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" aria-label="Insert emoji">
                                <Smile className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800">
                              <Send className="w-4 h-4 mr-2" />
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a message to view the conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
