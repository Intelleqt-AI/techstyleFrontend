import { DEFAULT_PHASES, DEFAULT_TASKS_PER_PHASE } from "./defaults"
import type { Phase } from "./types"

export interface TemplatesBundle {
  phases: Phase[]
  tasksPerPhase: Record<string, string>
}

const STORAGE_KEY = "techstyles-templates"
const STUDIO_DEFAULT_KEY = "techstyles-studio-default"

export function loadTemplates(): TemplatesBundle {
  if (typeof window === "undefined") {
    return {
      phases: DEFAULT_PHASES,
      tasksPerPhase: DEFAULT_TASKS_PER_PHASE,
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        phases: parsed.phases || DEFAULT_PHASES,
        tasksPerPhase: parsed.tasksPerPhase || DEFAULT_TASKS_PER_PHASE,
      }
    }
  } catch (error) {
    console.warn("Failed to load templates from localStorage:", error)
  }

  return {
    phases: DEFAULT_PHASES,
    tasksPerPhase: DEFAULT_TASKS_PER_PHASE,
  }
}

export function saveTemplates(bundle: TemplatesBundle): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle))
  } catch (error) {
    console.warn("Failed to save templates to localStorage:", error)
  }
}

export function resetToTechstylesDefaults(): TemplatesBundle {
  const defaults = {
    phases: DEFAULT_PHASES,
    tasksPerPhase: DEFAULT_TASKS_PER_PHASE,
  }

  saveTemplates(defaults)
  return defaults
}

export function saveAsStudioDefault(bundle: TemplatesBundle): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STUDIO_DEFAULT_KEY, JSON.stringify(bundle))
  } catch (error) {
    console.warn("Failed to save studio default to localStorage:", error)
  }
}

export function loadStudioDefault(): TemplatesBundle | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(STUDIO_DEFAULT_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn("Failed to load studio default from localStorage:", error)
  }

  return null
}
