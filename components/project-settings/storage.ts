const keyFor = (projectId: string) => `onboarding:${projectId}`

export function loadOnboarding(projectId: string): any | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(keyFor(projectId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveOnboarding(projectId: string, data: any) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(keyFor(projectId), JSON.stringify(data))
  } catch {
    // ignore
  }
}

export function clearOnboarding(projectId: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(keyFor(projectId))
  } catch {
    // ignore
  }
}
