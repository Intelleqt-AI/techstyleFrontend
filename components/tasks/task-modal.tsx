"use client"

import * as React from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  CalendarIcon,
  Check,
  TagIcon,
  Users,
  GitBranch,
  Flag,
  Paperclip,
  ListTodo,
  GripVertical,
  Trash2,
  Folder,
  CircleDot,
  TypeIcon,
  Plus,
  Search,
  X,
  Smile,
  ImageIcon,
  Clock3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { TypeChip } from "@/components/chip"
import type {
  ListColumn,
  Phase,
  TeamMember,
  Task,
  Subtask,
  Priority,
  Status,
  Attachment,
} from "@/components/tasks/types"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  projectId: string
  projectName?: string
  lists: ListColumn[]
  phases: Phase[]
  team: TeamMember[]
  defaultListId?: string
  taskToEdit?: (Omit<Task, "assigneeIds"> & { assignees?: string[] }) | null
  onSave: (payload: Omit<Task, "id"> & { id?: string }) => void
}

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

type Comment = {
  id: string
  author: { id: string; name: string }
  body: string
  createdAt: number
}

type ActivityItem = {
  id: string
  text: string
  createdAt: number
}

export function TaskModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  lists,
  phases,
  team,
  defaultListId,
  taskToEdit,
  onSave,
}: Props) {
  // Core form state
  const [title, setTitle] = React.useState(taskToEdit?.title ?? "")
  const [listId, setListId] = React.useState(taskToEdit?.listId ?? defaultListId ?? lists[0]?.id ?? "")
  const [phaseId, setPhaseId] = React.useState<string | undefined>(taskToEdit?.phaseId)
  const [priority, setPriority] = React.useState<Priority>(taskToEdit?.priority ?? "medium")
  const [status, setStatus] = React.useState<Status>(taskToEdit?.status ?? "todo")
  const [assignees, setAssignees] = React.useState<string[]>(taskToEdit?.assignees ?? taskToEdit?.assigneeIds ?? [])
  const [dueDate, setDueDate] = React.useState<string | undefined>(taskToEdit?.dueDate)
  const [startDate, setStartDate] = React.useState<string | undefined>(taskToEdit?.startDate)
  // Duration (days) stored in estimateHours for compatibility
  const [estimateHours, setEstimateHours] = React.useState<number | undefined>(taskToEdit?.estimateHours ?? 1)
  const [tags, setTags] = React.useState<string[]>(taskToEdit?.tags ?? [])
  const [tagInput, setTagInput] = React.useState("")
  const [description, setDescription] = React.useState(taskToEdit?.description ?? "")
  const [attachments, setAttachments] = React.useState<Attachment[]>(taskToEdit?.attachments ?? [])
  const [subtasks, setSubtasks] = React.useState<Subtask[]>(
    taskToEdit?.subtasks?.length ? taskToEdit.subtasks : [{ id: crypto.randomUUID(), title: "", done: false }],
  )
  const [touched, setTouched] = React.useState(false)

  // Comments / Activity (local only in UI for now)
  const [comments, setComments] = React.useState<Comment[]>((taskToEdit as any)?.comments ?? [])
  const [newComment, setNewComment] = React.useState("")
  const [activity, setActivity] = React.useState<ActivityItem[]>(() => {
    const base: ActivityItem[] = []
    if (taskToEdit?.id) {
      base.push({
        id: "created",
        text: `Task created${taskToEdit?.title ? `: ${taskToEdit.title}` : ""}`,
        createdAt: (taskToEdit as any)?.createdAt ?? Date.now(),
      })
    }
    return base
  })

  const formRef = React.useRef<HTMLFormElement>(null)
  const titleRef = React.useRef<HTMLInputElement>(null)

  // Reset state on open
  React.useEffect(() => {
    if (open) {
      setTitle(taskToEdit?.title ?? "")
      setListId(taskToEdit?.listId ?? defaultListId ?? lists[0]?.id ?? "")
      setPhaseId(taskToEdit?.phaseId)
      setPriority(taskToEdit?.priority ?? "medium")
      setStatus(taskToEdit?.status ?? "todo")
      setAssignees(taskToEdit?.assignees ?? taskToEdit?.assigneeIds ?? [])
      setDueDate(taskToEdit?.dueDate)
      setStartDate(taskToEdit?.startDate)
      setEstimateHours(taskToEdit?.estimateHours ?? 1)
      setTags(taskToEdit?.tags ?? [])
      setTagInput("")
      setDescription(taskToEdit?.description ?? "")
      setAttachments(taskToEdit?.attachments ?? [])
      setSubtasks(
        taskToEdit?.subtasks?.length ? taskToEdit.subtasks : [{ id: crypto.randomUUID(), title: "", done: false }],
      )
      setTouched(false)
      setNewComment("")
      // Focus for quick entry after mount
      setTimeout(() => {
        const input = titleRef.current
        if (input) {
          // Focus without scrolling and avoid full-text selection highlight
          input.focus({ preventScroll: true })
          const len = input.value.length
          // Place caret at the end so nothing appears selected/blue
          try {
            input.setSelectionRange(len, len)
          } catch {}
        }
      }, 20)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, taskToEdit, defaultListId, lists?.[0]?.id])

  // Cmd/Ctrl + Enter to save
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }, [])

  function toggleAssignee(id: string) {
    setAssignees((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function addTagFromInput() {
    const v = tagInput.trim()
    if (v && !tags.includes(v)) setTags((prev) => [...prev, v])
    setTagInput("")
  }
  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function updateSubtask(id: string, patch: Partial<Subtask>) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }
  function addSubtask() {
    setSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title: "", done: false }])
  }
  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  // Always keep one empty subtask as a trailing row
  React.useEffect(() => {
    if (subtasks.length === 0 || subtasks[subtasks.length - 1].title.trim() !== "") {
      setSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title: "", done: false }])
    }
  }, [subtasks])

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const mapped = Array.from(files).map((f) => ({ name: f.name, size: f.size }))
    setAttachments(mapped)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!title.trim()) return

    const durationDays =
      typeof estimateHours === "number" && !Number.isNaN(estimateHours) && estimateHours > 0
        ? Math.floor(estimateHours)
        : 1

    const payload: Omit<Task, "id"> & { id?: string } = {
      id: taskToEdit?.id,
      projectId,
      title: title.trim(),
      listId, // kept for compatibility with lists
      phaseId: phaseId || undefined,
      priority,
      status,
      assigneeIds: assignees,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      estimateHours: durationDays,
      tags,
      description,
      attachments,
      subtasks: subtasks.filter((s) => s.title.trim() !== ""),
      createdAt: taskToEdit?.id ? ((taskToEdit as any).createdAt ?? Date.now()) : Date.now(),
      updatedAt: Date.now(),
    }
    onSave(payload)
    onOpenChange(false)
  }

  function initialsOf(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Label rail (160px) with small icon + label
  function Labeled({
    icon,
    label,
    children,
    alignTop = false,
  }: {
    icon: React.ReactNode
    label: string
    children: React.ReactNode
    alignTop?: boolean
  }) {
    return (
      <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
        <div className={cn("flex items-center gap-2 text-[13px] text-gray-600", alignTop && "self-start pt-1")}>
          <span className="text-gray-500">{icon}</span>
          <span className="truncate">{label}</span>
        </div>
        <div>{children}</div>
      </div>
    )
  }

  function AssigneesMultiSelect() {
    const [openPop, setOpenPop] = React.useState(false)
    const selected = team.filter((m) => assignees.includes(m.id))

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Popover open={openPop} onOpenChange={setOpenPop}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={openPop}
                className="w-full justify-between bg-white h-9 text-sm rounded-xl"
              >
                <span className="flex items-center gap-2 overflow-hidden">
                  {selected.length > 0 ? (
                    <>
                      <div className="flex -space-x-2">
                        {selected.slice(0, 4).map((m) => (
                          <Avatar key={m.id} className="h-6 w-6 ring-2 ring-white">
                            {/* @ts-ignore optional avatarUrl */}
                            <AvatarImage src={(m as any).avatarUrl || ""} alt={m.name} />
                            <AvatarFallback className="text-[10px]">{initialsOf(m.name)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="truncate text-sm text-gray-600">
                        {selected.length} selected{selected.length > 4 ? " +" + (selected.length - 4) : ""}
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center gap-2 text-gray-500">
                      <Search className="h-4 w-4" />
                      Search teammates…
                    </span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[360px] rounded-xl border border-gray-200 shadow-md" align="start">
              <Command>
                <CommandInput
                  placeholder="Search teammates…"
                  className="focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none"
                />
                <CommandEmpty>No people found.</CommandEmpty>
                <CommandList className="max-h-64">
                  <CommandGroup>
                    {team.map((m) => {
                      const checked = assignees.includes(m.id)
                      return (
                        <CommandItem
                          key={m.id}
                          value={m.name}
                          className="flex items-center gap-2"
                          onSelect={() => toggleAssignee(m.id)}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleAssignee(m.id)}
                            className="focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                          />
                          <Avatar className="h-6 w-6">
                            {/* @ts-ignore optional */}
                            <AvatarImage src={(m as any).avatarUrl || ""} alt={m.name} />
                            <AvatarFallback className="text-[10px]">{initialsOf(m.name)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{m.name}</span>
                          {checked && <Check className="ml-auto h-4 w-4 text-gray-500" />}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selected.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setAssignees([])}>
              Clear
            </Button>
          )}
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((m) => (
              <TypeChip key={m.id} label={m.name} className="cursor-pointer" onClick={() => toggleAssignee(m.id)} />
            ))}
          </div>
        )}
      </div>
    )
  }

  function handleAddComment() {
    const body = newComment.trim()
    if (!body) return
    const me = team.find((t) => t.id === assignees[0]) ?? ({ id: "me", name: "You" } as TeamMember)
    const c: Comment = {
      id: crypto.randomUUID(),
      author: { id: me.id, name: (me as any).name || "You" },
      body,
      createdAt: Date.now(),
    }
    setComments((prev) => [c, ...prev])
    setNewComment("")
    setActivity((prev) => [{ id: crypto.randomUUID(), text: "Added a comment", createdAt: Date.now() }, ...prev])
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Single rounded grey surface with balanced padding (28px top/side) */}
      <SheetContent
        side="right"
        className="v0-task-sheet w-full sm:max-w-[700px] md:max-w-[720px] h-full px-8 md:px-9 pt-10 md:pt-10 pb-0 bg-gray-50 rounded-2xl shadow-xl flex flex-col overflow-hidden mr-6 my-6"
      >
        <form
          ref={formRef}
          onSubmit={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 overflow-auto thin-scrollbar pr-2 overscroll-contain pb-20"
          aria-label="Task form"
        >
          {/* Title row */}
          <div className="pb-6">
            <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
              <div className="flex items-center gap-2 text-[13px] text-gray-600">
                <TypeIcon className="h-4 w-4 text-gray-500" />
                <span>Task Title</span>
              </div>
              <Input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add task name..."
                className={cn(
                  "bg-white h-10 text-[16px] md:text-[17px] font-medium rounded-xl",
                  !title.trim() && touched && "border-red-300 focus-visible:ring-red-200",
                )}
                aria-invalid={!title.trim() && touched}
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <Labeled icon={<Folder className="h-4 w-4" />} label="Project">
              <div className="text-sm text-gray-800">{projectName || "Current project"}</div>
            </Labeled>

            <Labeled icon={<CircleDot className="h-4 w-4" />} label="Status">
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger className="w-full bg-white h-9 text-sm rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To‑do</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="in_review">In review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </Labeled>

            <Labeled icon={<GitBranch className="h-4 w-4" />} label="Phase">
              <Select value={phaseId ?? "none"} onValueChange={(v) => setPhaseId(v === "none" ? undefined : v)}>
                <SelectTrigger className="w-full bg-white h-9 text-sm rounded-xl">
                  <SelectValue placeholder="No phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No phase</SelectItem>
                  {phases.map((p) => (
                    <SelectItem value={p.id} key={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Labeled>

            <Labeled icon={<Flag className="h-4 w-4" />} label="Priority">
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="w-full bg-white h-9 text-sm rounded-xl">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Labeled>

            <Labeled icon={<CalendarIcon className="h-4 w-4" />} label="Start Date">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white h-9 text-sm rounded-xl",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {startDate ? format(toDateFromYMD(startDate), "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 rounded-xl border border-gray-200 shadow-md" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate ? toDateFromYMD(startDate) : undefined}
                      onSelect={(d) => setStartDate(d ? format(d, "yyyy-MM-dd") : undefined)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {startDate && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStartDate(undefined)}>
                    Clear
                  </Button>
                )}
              </div>
            </Labeled>

            <Labeled icon={<CalendarIcon className="h-4 w-4" />} label="Due Date">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white h-9 text-sm rounded-xl",
                          !dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {dueDate ? format(toDateFromYMD(dueDate), "PPP") : "Pick due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 rounded-xl border border-gray-200 shadow-md" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate ? toDateFromYMD(dueDate) : undefined}
                        onSelect={(d) => setDueDate(d ? format(d, "yyyy-MM-dd") : undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {dueDate && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setDueDate(undefined)}>
                      Clear
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="1"
                    value={typeof estimateHours === "number" ? String(estimateHours) : ""}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === "") setEstimateHours(undefined)
                      else {
                        const n = Number(v)
                        setEstimateHours(Number.isNaN(n) ? undefined : Math.max(1, Math.floor(n)))
                      }
                    }}
                    className="bg-white h-9 text-sm rounded-xl"
                    aria-label="Duration (days)"
                  />
                  <span className="text-xs text-gray-500">Duration (days)</span>
                </div>
              </div>
            </Labeled>

            <Labeled icon={<TagIcon className="h-4 w-4" />} label="Tags">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a tag and press Enter (e.g., Kitchen)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTagFromInput()
                      }
                    }}
                    className="bg-white h-9 text-sm rounded-xl"
                  />
                  <Button type="button" variant="outline" onClick={addTagFromInput} className="bg-white h-9 rounded-xl">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <TypeChip
                        key={t}
                        label={
                          <span className="inline-flex items-center gap-1">
                            <span>{t}</span>
                            <button
                              type="button"
                              className="ml-0.5 rounded hover:bg-gray-100"
                              onClick={() => removeTag(t)}
                              aria-label={`Remove ${t}`}
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </Labeled>

            <Labeled icon={<Users className="h-4 w-4" />} label="Assignees">
              <AssigneesMultiSelect />
            </Labeled>

            <Labeled icon={<TypeIcon className="h-4 w-4" />} label="Description" alignTop>
              <Textarea
                placeholder="Add details… use @ to mention teammates. Attach files below."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[104px] bg-white text-sm rounded-xl"
              />
            </Labeled>

            <Labeled icon={<Paperclip className="h-4 w-4" />} label="Attachment" alignTop>
              <div className="space-y-2">
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={onFilesChange}
                  className="bg-white h-9 text-sm rounded-xl"
                />
                {attachments.length > 0 && (
                  <ul className="text-xs text-gray-600 list-disc pl-5">
                    {attachments.map((a) => (
                      <li key={a.name + a.size}>
                        {a.name} ({Math.round(a.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Labeled>

            <Labeled icon={<ListTodo className="h-4 w-4" />} label="Sub Tasks" alignTop>
              <div className="space-y-2">
                {subtasks.map((s, idx) => (
                  <div
                    key={s.id}
                    className={cn(
                      "flex items-center gap-2 rounded-xl bg-white/80 border border-gray-200 pl-2 pr-2 h-10",
                      s.title.trim() === "" && idx === subtasks.length - 1 && "opacity-80",
                    )}
                  >
                    <Checkbox
                      checked={s.done}
                      onCheckedChange={(v) => updateSubtask(s.id, { done: Boolean(v) })}
                      className="mr-1 focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                      aria-label="Toggle subtask"
                    />
                    <Input
                      value={s.title}
                      onChange={(e) => updateSubtask(s.id, { title: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          if (s.title.trim() !== "") addSubtask()
                        }
                      }}
                      placeholder={idx === subtasks.length - 1 ? "Subtask…" : ""}
                      className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent h-9 text-sm"
                    />
                    <GripVertical className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    {s.title.trim() !== "" && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-gray-700"
                        onClick={() => removeSubtask(s.id)}
                        aria-label="Remove subtask"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={addSubtask} className="gap-1">
                    <Plus className="h-4 w-4" /> Add subtask
                  </Button>
                </div>
              </div>
            </Labeled>
          </div>

          {/* Comments & Activity with rounded segmented tabs */}
          <div className="mt-6">
            <Separator className="mb-3" />
            <Tabs defaultValue="comments" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList className="bg-gray-200/60 rounded-full p-1 h-10">
                  <TabsTrigger
                    value="comments"
                    className="rounded-full h-8 px-4 text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    Comments
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="rounded-full h-8 px-4 text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    Activity
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="comments" className="mt-4">
                <div className="rounded-2xl border border-gray-200 bg-white">
                  <div className="p-4 md:p-5">
                    <Textarea
                      placeholder="Add Comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault()
                          handleAddComment()
                        }
                      }}
                      className="min-h-[120px] text-[14px] focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 md:px-5 pb-4 md:pb-5">
                    <Button
                      type="button"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="h-9 bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Comment
                    </Button>
                    <div className="flex items-center gap-3 text-gray-500">
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {comments.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {comments.map((c) => (
                      <li key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[10px]">{initialsOf(c.author.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-gray-900">{c.author.name}</span>
                              <span className="text-xs text-gray-500">{format(c.createdAt, "PP p")}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{c.body}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <ul className="space-y-3">
                  {activity.length === 0 ? (
                    <li className="text-sm text-gray-500">No activity yet.</li>
                  ) : (
                    activity.map((a) => (
                      <li
                        key={a.id}
                        className="rounded-xl border border-gray-200 bg-white p-3 flex items-center gap-3 text-sm"
                      >
                        <Clock3 className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-800">{a.text}</span>
                        <span className="ml-auto text-xs text-gray-500">{format(a.createdAt, "PP p")}</span>
                      </li>
                    ))
                  )}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </form>

        {/* Sticky footer dock with aligned actions */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
          <div className="h-16 px-7 md:px-7 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" className="h-10" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 bg-gray-900 text-white hover:bg-gray-800"
              onClick={() => formRef.current?.requestSubmit()}
            >
              Save <span className="ml-2 text-xs opacity-70">{"⌘⏎"}</span>
            </Button>
          </div>
        </div>

        {/* Scoped styles: neutral focus ring, rounded overlays, subtle scrollbar, close button inset */}
        <style jsx global>{`
          .v0-task-sheet > button[aria-label='Close'] {
            top: 22px !important;
            right: 18px !important;
          }
          .v0-task-sheet .thin-scrollbar::-webkit-scrollbar {
            width: 10px;
          }
          .v0-task-sheet .thin-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .v0-task-sheet .thin-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.12);
            border-radius: 8px;
            border: 2px solid transparent;
            background-clip: content-box;
          }
          .v0-task-sheet .thin-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
          }

          /* Neutral ring and no browser blue outlines within the sheet only */
          .v0-task-sheet {
            --ring: 0 0% 65%;
          }
          .v0-task-sheet :is(input, textarea, select, button, [role='combobox'], .cmdk-input):focus {
            outline: none !important;
          }
          .v0-task-sheet .cmdk-input:focus-visible {
            box-shadow: 0 0 0 2px hsl(0 0% 85%) !important;
            border-radius: 0.75rem;
          }

          /* Neutralize blue text selection inside the task sheet */
          .v0-task-sheet ::selection {
            background-color: hsl(0 0% 84%); /* light neutral gray */
            color: hsl(222 47% 11%); /* near-black text */
          }
          /* Ensure inputs and textareas follow the same selection color */
          .v0-task-sheet input::selection,
          .v0-task-sheet textarea::selection {
            background-color: hsl(0 0% 84%);
            color: hsl(222 47% 11%);
          }
        `}</style>
      </SheetContent>
    </Sheet>
  )
}

function toDateFromYMD(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
