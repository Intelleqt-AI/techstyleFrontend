"use server"

type SaveProjectSettingsInput = {
  projectId: string
  section: string
  payload: unknown
}

type FinalizeOnboardingInput = {
  projectId: string
  data: any
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Simulated persistence — replace with real DB later.
 */
export async function saveProjectSettings(input: SaveProjectSettingsInput) {
  await sleep(300)
  return { ok: true, section: input.section }
}

/**
 * Simulated onboarding finalize — would create portal users, rooms, kickoff tasks.
 */
export async function finalizeOnboarding(input: FinalizeOnboardingInput) {
  await sleep(600)
  const created = {
    portalUsers: input.data?.contacts?.length ?? 1,
    rooms: input.data?.rooms?.length ?? 0,
    tasks: 1,
  }
  return { ok: true, created }
}
