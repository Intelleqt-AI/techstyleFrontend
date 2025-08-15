import type { OnboardingData } from "./types"

export function computeMissingFields(data: OnboardingData): string[] {
  const missing: string[] = []

  // Contacts
  if (!data.contacts?.primary?.name) missing.push("Primary client name")
  if (!data.contacts?.primary?.email) missing.push("Primary client email")

  // Property
  if (!data.property?.siteAddress) missing.push("Site address")

  // Rooms — require at least one
  if (!data.rooms || data.rooms.length === 0) missing.push("At least one room")

  // Delivery & Billing
  if (!data.deliveryBilling?.billingAddress) missing.push("Billing address")
  if (!data.deliveryBilling?.deliveryAddress) missing.push("Delivery address")

  // Consents
  if (!data.preferencesConsent?.consents?.terms) missing.push("Accepted Terms")
  if (!data.preferencesConsent?.consents?.privacy) missing.push("Accepted Privacy")

  return missing
}

export function computeProgressPct(missing: string[]): number {
  const total = 6 // number of checks above
  const done = Math.max(0, total - missing.length)
  return Math.round((done / total) * 100)
}
