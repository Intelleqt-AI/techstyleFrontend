export type NoteVisibility = "private" | "project" | "studio"
export type NoteStatus = "needs_review" | "published"
export type NoteSource = "zoom" | "mobile" | "upload"

export interface NoteLink {
  type: "room" | "sku" | "contact" | "none"
  label?: string
  id?: string
}

export interface NoteAttachment {
  id: string
  name: string
  url: string
  type: string
}

export interface NoteAuthor {
  id: string
  name: string
  avatarUrl?: string
}

export interface Note {
  id: string
  title: string
  summary: string
  transcriptUrl?: string
  recordingUrl?: string
  source: NoteSource
  status: NoteStatus
  visibility: NoteVisibility
  projectId: string
  eventId?: string
  linked: NoteLink[]
  updatedAt: string
  author: NoteAuthor
  ai: {
    decisions: string[]
    actions: string[]
    risks: string[]
    confidence?: number
  }
  attachments: NoteAttachment[]
}
