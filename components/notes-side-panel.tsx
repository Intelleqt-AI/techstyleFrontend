"use client"

import type * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Note } from "./notes-types"
import { formatRelative, NoteStatusPill, SourceIcon } from "./notes-utils"
import { ChevronDown } from "lucide-react"

export function NotesSidePanel({
  open,
  onOpenChange,
  note,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  note?: Note
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-[560px]">
        {note ? (
          <div className="flex h-full flex-col">
            <SheetHeader className="mb-2">
              <SheetTitle className="flex items-center gap-2 text-base">
                <SourceIcon source={note.source} />
                <span className="truncate">{note.title}</span>
                <NoteStatusPill status={note.status} />
              </SheetTitle>
              <div className="text-xs text-neutral-600">
                {"by "}
                <span className="font-medium text-neutral-800">{note.author.name}</span>
                {" • "}
                {formatRelative(note.updatedAt)}
              </div>
            </SheetHeader>

            <Tabs defaultValue="summary" className="flex-1">
              <TabsList className="mb-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <Section title="Executive summary">
                  <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-800">
                    {note.summary ? (
                      <li>{note.summary}</li>
                    ) : (
                      <li className="text-neutral-500">{"No summary available."}</li>
                    )}
                  </ul>
                </Section>

                <Section title="Decisions">
                  {note.ai.decisions.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-800">
                      {note.ai.decisions.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyLine />
                  )}
                </Section>

                <Section title="Action items">
                  {note.ai.actions.length ? (
                    <ul className="space-y-1 text-sm text-neutral-800">
                      {note.ai.actions.map((a, i) => (
                        <li key={i} className="flex items-center justify-between gap-2">
                          <span className="flex-1">{a}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 bg-transparent"
                            onClick={() => console.log("convert_to_task", { noteId: note.id, bullet: a })}
                          >
                            {"Convert to task"}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyLine />
                  )}
                </Section>

                <Section title="Risks / blockers">
                  {note.ai.risks.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-800">
                      {note.ai.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyLine />
                  )}
                </Section>

                <Section title="Recording & attachments">
                  <div className="space-y-2 text-sm">
                    {note.recordingUrl ? (
                      <div>
                        <a
                          href={note.recordingUrl}
                          className="text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
                        >
                          {"Recording link"}
                        </a>
                      </div>
                    ) : null}
                    {note.attachments.length ? (
                      <ul className="space-y-1">
                        {note.attachments.map((a) => (
                          <li key={a.id} className="text-neutral-700">
                            <a
                              href={a.url}
                              className="underline underline-offset-4 hover:text-neutral-900"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {a.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-neutral-500">{"No attachments."}</p>
                    )}
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="transcript" className="space-y-3">
                {note.transcriptUrl ? (
                  <Card className="p-4 text-sm leading-6 text-neutral-800">
                    {/* Placeholder text to represent transcript area */}
                    <p>{"Transcript available at: "}</p>
                    <a
                      href={note.transcriptUrl}
                      className="text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
                    >
                      {note.transcriptUrl}
                    </a>
                  </Card>
                ) : (
                  <Card className="p-4 text-sm text-neutral-600">{"No transcript available."}</Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-3">
                <Card className="p-4 text-sm text-neutral-700">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>{"Note created"}</li>
                    <li>{"AI summary generated"}</li>
                    {note.status === "published" ? <li>{"Approved and published"}</li> : null}
                  </ul>
                </Card>
              </TabsContent>
            </Tabs>

            <SheetFooter className="mt-3 flex items-center justify-between gap-2">
              <div className="text-xs text-neutral-600">{"Visibility: " + note.visibility}</div>
              <div className="flex items-center gap-2">
                {note.status === "needs_review" ? (
                  <Button
                    variant="outline"
                    className="bg-transparent"
                    onClick={() => console.log("approve_from_panel", { noteId: note.id })}
                  >
                    {"Approve"}
                  </Button>
                ) : null}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-transparent">
                      {"Convert →"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => console.log("convert", { type: "task", id: note.id })}>
                      Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => console.log("convert", { type: "rfi", id: note.id })}>
                      RFI
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => console.log("convert", { type: "po", id: note.id })}>
                      PO
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      {"Share"}
                      <ChevronDown className="ml-1 h-4 w-4 opacity-80" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => console.log("share_visibility", { v: "private" })}>
                      Private
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => console.log("share_visibility", { v: "project" })}>
                      Project team
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => console.log("share_visibility", { v: "studio" })}>
                      Studio
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SheetFooter>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
      {children}
    </div>
  )
}

function EmptyLine() {
  return <p className="text-sm text-neutral-500">{"—"}</p>
}
