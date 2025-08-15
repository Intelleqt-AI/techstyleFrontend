"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, GripVertical, Plus, MoreHorizontal, Trash2, RotateCcw, Save } from "lucide-react"
import { DEFAULT_PHASES, DEFAULT_TASKS_PER_PHASE } from "@/components/templates/defaults"

const colorPalette = [
  "#6366f1", // indigo
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
]

const ownerRoles = [
  "Lead Designer",
  "Project Manager",
  "Senior Designer",
  "Junior Designer",
  "Procurement Lead",
  "Site Lead",
]

export default function TemplatesPage() {
  const [phases, setPhases] = useState(DEFAULT_PHASES)
  const [selectedPhase, setSelectedPhase] = useState(phases[0]?.id || "")
  const [tasks, setTasks] = useState(DEFAULT_TASKS_PER_PHASE)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; phaseId: string; phaseName: string }>({
    open: false,
    phaseId: "",
    phaseName: "",
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validatePhase = (phase: any, allPhases: any[]) => {
    const errors: Record<string, string> = {}

    // Check for duplicate names
    const duplicates = allPhases.filter((p) => p.name.toLowerCase() === phase.name.toLowerCase() && p.id !== phase.id)
    if (duplicates.length > 0) {
      errors[`${phase.id}-name`] = "Phase name already exists"
    }

    // Validate duration
    if (phase.duration < 0 || phase.duration > 365) {
      errors[`${phase.id}-duration`] = "Duration must be between 0-365 days"
    }

    return errors
  }

  const updatePhase = (phaseId: string, updates: Partial<(typeof phases)[0]>) => {
    const updatedPhases = phases.map((phase) => (phase.id === phaseId ? { ...phase, ...updates } : phase))

    // Validate the updated phase
    const updatedPhase = updatedPhases.find((p) => p.id === phaseId)
    if (updatedPhase) {
      const errors = validatePhase(updatedPhase, updatedPhases)
      setValidationErrors((prev) => ({ ...prev, ...errors }))
    }

    setPhases(updatedPhases)
    setHasUnsavedChanges(true)
  }

  const addPhase = () => {
    const newPhase = {
      id: `phase-${Date.now()}`,
      name: "New Phase",
      color: colorPalette[phases.length % colorPalette.length],
      duration: 10,
      ownerRole: "Lead Designer",
      usedByProjects: 0,
    }
    setPhases([...phases, newPhase])
    setSelectedPhase(newPhase.id)
    setHasUnsavedChanges(true)
  }

  const deletePhase = (phaseId: string) => {
    const phase = phases.find((p) => p.id === phaseId)
    if (!phase) return

    if (phase.usedByProjects > 0) {
      setDeleteDialog({ open: true, phaseId, phaseName: phase.name })
    } else {
      setPhases(phases.filter((p) => p.id !== phaseId))
      if (selectedPhase === phaseId) {
        setSelectedPhase(phases[0]?.id || "")
      }
      setHasUnsavedChanges(true)
    }
  }

  const confirmDelete = () => {
    setPhases(phases.filter((p) => p.id !== deleteDialog.phaseId))
    if (selectedPhase === deleteDialog.phaseId) {
      setSelectedPhase(phases[0]?.id || "")
    }
    setDeleteDialog({ open: false, phaseId: "", phaseName: "" })
    setHasUnsavedChanges(true)
  }

  const resetToDefaults = () => {
    setPhases(DEFAULT_PHASES)
    setTasks(DEFAULT_TASKS_PER_PHASE)
    setSelectedPhase(DEFAULT_PHASES[0]?.id || "")
    setHasUnsavedChanges(false)
    setValidationErrors({})
  }

  const saveChanges = () => {
    // Here you would save to your backend
    setHasUnsavedChanges(false)
    setValidationErrors({})
  }

  const selectedPhaseTasks = tasks[selectedPhase] || ""
  const hasValidationErrors = Object.keys(validationErrors).length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Templates & Taxonomy</h1>
          <p className="text-sm text-gray-600 mt-1">Studio-wide phases and default tasks used to seed new projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Techstyles defaults
          </Button>
          <Button onClick={saveChanges} disabled={hasValidationErrors} className="relative">
            <Save className="h-4 w-4 mr-2" />
            Save as default
            {hasUnsavedChanges && <div className="absolute -top-1 -right-1 h-2 w-2 bg-orange-500 rounded-full" />}
          </Button>
        </div>
      </div>

      {/* Section A: Phases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Phases</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Set studio phases. Reorder with drag handle, rename inline, and pick a color.
            </p>
          </div>
          <Button onClick={addPhase} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add phase
          </Button>
        </CardHeader>
        <CardContent>
          {phases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No phases configured</p>
              <Button onClick={addPhase}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first phase
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 rounded-lg">
                <div className="col-span-1"></div>
                <div className="col-span-1">Color</div>
                <div className="col-span-4">Phase Name</div>
                <div className="col-span-2">Duration</div>
                <div className="col-span-2">Default Owner</div>
                <div className="col-span-1">Usage</div>
                <div className="col-span-1"></div>
              </div>

              {/* Data Rows */}
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  className="grid grid-cols-12 gap-4 px-3 py-3 items-center hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                >
                  {/* Drag Handle */}
                  <div className="col-span-1 flex justify-center">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                  </div>

                  {/* Color Chip */}
                  <div className="col-span-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="w-6 h-6 rounded border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: phase.color }}
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="p-2">
                        <div className="grid grid-cols-4 gap-2">
                          {colorPalette.map((color) => (
                            <button
                              key={color}
                              className="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              onClick={() => updatePhase(phase.id, { color })}
                            />
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Phase Name */}
                  <div className="col-span-4">
                    <div className="space-y-1">
                      <Input
                        value={phase.name}
                        onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                        className={`border-0 bg-transparent p-0 h-auto font-medium focus:bg-white focus:border focus:px-2 focus:py-1 ${
                          validationErrors[`${phase.id}-name`] ? "text-red-600" : ""
                        }`}
                      />
                      {validationErrors[`${phase.id}-name`] && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors[`${phase.id}-name`]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="365"
                        value={phase.duration}
                        onChange={(e) => updatePhase(phase.id, { duration: Number.parseInt(e.target.value) || 0 })}
                        className={`w-16 h-8 text-sm ${
                          validationErrors[`${phase.id}-duration`] ? "border-red-300" : ""
                        }`}
                      />
                      <span className="text-sm text-gray-500">days</span>
                    </div>
                    {validationErrors[`${phase.id}-duration`] && (
                      <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors[`${phase.id}-duration`]}
                      </div>
                    )}
                  </div>

                  {/* Default Owner */}
                  <div className="col-span-2">
                    <Select
                      value={phase.ownerRole}
                      onValueChange={(value) => updatePhase(phase.id, { ownerRole: value })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ownerRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Usage */}
                  <div className="col-span-1">
                    {phase.usedByProjects > 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        Used by {phase.usedByProjects}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">Unused</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => deletePhase(phase.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete phase
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section B: Default tasks per phase */}
      <Card>
        <CardHeader>
          <CardTitle>Default tasks per phase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Phase:</label>
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a phase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase.id} value={phase.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: phase.color }} />
                      {phase.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="One task per line (e.g., Client kickoff meeting)"
              value={selectedPhaseTasks}
              onChange={(e) => {
                setTasks({ ...tasks, [selectedPhase]: e.target.value })
                setHasUnsavedChanges(true)
              }}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">Tip: Paste a list — we'll keep one line per task.</p>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setTasks({ ...tasks, [selectedPhase]: DEFAULT_TASKS_PER_PHASE[selectedPhase] || "" })
                setHasUnsavedChanges(true)
              }}
            >
              Reset to Techstyles defaults
            </Button>
            <Button onClick={saveChanges}>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Phase</DialogTitle>
            <DialogDescription>
              The phase "{deleteDialog.phaseName}" is currently used by{" "}
              {phases.find((p) => p.id === deleteDialog.phaseId)?.usedByProjects} projects. Deleting it will remove it
              from all projects. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, phaseId: "", phaseName: "" })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Phase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
