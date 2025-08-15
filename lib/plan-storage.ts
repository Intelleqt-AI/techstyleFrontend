export type ISODate = string

export type PlanPhase = {
  id: string
  name: string
  start: ISODate
  end: ISODate
  owner: string
  progress: number // 0..1
  risk?: "Low" | "Medium" | "High" | string
  expanded: boolean
  color?: string // optional brand tint per phase
}

export type WorkPackage = {
  id: string
  phaseId: string
  name: string
  start: ISODate
  end: ISODate
}

export type Milestone = {
  id: string
  phaseId: string
  name: string
  date: ISODate
}

export type PlanSnapshot = {
  phases: PlanPhase[]
  workPackages: WorkPackage[]
  milestones: Milestone[]
}

const key = (projectId: string) => `techstyles:plan:${projectId}`

export function savePlan(projectId: string, snapshot: PlanSnapshot): boolean {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(key(projectId), JSON.stringify(snapshot))
    return true
  } catch {
    return false
  }
}

export function loadPlan(projectId: string): PlanSnapshot | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(key(projectId))
    if (!raw) return null
    return JSON.parse(raw) as PlanSnapshot
  } catch {
    return null
  }
}
