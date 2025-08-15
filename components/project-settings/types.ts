export type PartyRole = "Client" | "Accountant" | "Site Contact"

export type Contact = {
  name: string
  email: string
  phone?: string
  role?: PartyRole
  portalAccess?: boolean
}

export type Room = {
  name: string
  dimensions?: string
  constraints?: string
}

export type OnboardingData = {
  contacts: {
    primary?: Contact
    secondary?: Contact
    additional?: Contact[]
  }
  property: {
    siteAddress?: string
    accessNotes?: string
    parkingNotes?: string
    restrictions?: string
    uploads?: string[] // paths or URLs
  }
  rooms: Room[]
  deliveryBilling: {
    billingAddress?: string
    deliveryAddress?: string
    onsiteContact?: string
    deliveryWindows?: string
  }
  preferencesConsent: {
    communication?: ("Email" | "Portal" | "WhatsApp")[]
    styleTags?: string[]
    preferredVendors?: string[]
    consents?: {
      terms?: boolean
      privacy?: boolean
      marketing?: boolean
    }
  }
}
