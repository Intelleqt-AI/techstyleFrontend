"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InviteOnboardDialog } from "@/components/project-settings/invite-onboard-dialog"
import { OnboardingWizard } from "@/components/project-settings/onboarding-wizard"
import { computeMissingFields, computeProgressPct } from "@/components/project-settings/utils"
import type { OnboardingData } from "@/components/project-settings/types"
import { saveProjectSettings } from "./actions"
import {
  Settings,
  Building2,
  ClipboardList,
  Truck,
  SlidersHorizontal,
  Users,
  Sparkles,
  Calendar,
  DollarSign,
  Building,
  Store,
  Home,
  Globe,
  Clock,
  Plus,
} from "lucide-react"

type SectionKey =
  | "overview"
  | "contacts"
  | "property"
  | "rooms"
  | "delivery"
  | "preferences"
  | "team"
  | "phases"
  | "contractors"
  | "automation"
  | "financial"
  | "timeline"

const sections: { key: SectionKey; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: Settings },
  { key: "contacts", label: "Contacts & Access", icon: Users },
  { key: "property", label: "Property", icon: Building2 },
  { key: "rooms", label: "Rooms", icon: ClipboardList },
  { key: "delivery", label: "Delivery & Billing", icon: Truck },
  { key: "preferences", label: "Preferences & Consent", icon: SlidersHorizontal },
  { key: "team", label: "Team", icon: Users },
  { key: "phases", label: "Phases", icon: Calendar },
  { key: "contractors", label: "Contractors", icon: Building },
  { key: "timeline", label: "Timeline", icon: Calendar },
  { key: "financial", label: "Financial", icon: DollarSign },
  { key: "automation", label: "Automation", icon: Sparkles },
]

export default function ProjectSettingsPage() {
  const params = useParams<{ id: string }>()
  const projectId = params?.id ?? "project-1"
  const [selected, setSelected] = useState<SectionKey>("overview")
  const [wizardOpen, setWizardOpen] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    contacts: { additional: [] },
    property: {},
    rooms: [],
    deliveryBilling: {},
    preferencesConsent: {},
  })

  // Mock project data that would normally come from an API or store
  const [projectData, setProjectData] = useState({
    title: "Chelsea Penthouse",
    code: "LUX-001",
    summary: "Luxury penthouse redesign in Chelsea with focus on sustainable materials and modern aesthetics.",
    type: "residential",
    currency: "GBP",
    timezone: "Europe/London",
    budget: "850000",
    taxRate: "20",
    startDate: "2024-09-01",
    endDate: "2025-03-15",
    notes:
      "Client prefers minimalist design with warm tones. Previous designer left detailed notes in the shared drive.",
    team: [
      { id: "1", name: "Jane Designer", role: "Lead Designer", avatar: "/avatars/jane.jpg" },
      { id: "2", name: "Tom Manager", role: "Project Manager", avatar: "/avatars/tom.jpg" },
      { id: "3", name: "Sarah Procurement", role: "Procurement Lead", avatar: "/avatars/sarah.jpg" },
    ],
    phases: [
      { name: "Discovery & Planning", duration: "2 weeks", description: "Initial consultation and space assessment" },
      { name: "Design Development", duration: "4 weeks", description: "Concept creation and design refinement" },
      { name: "Documentation", duration: "3 weeks", description: "Technical drawings and specifications" },
      { name: "Implementation", duration: "8 weeks", description: "Procurement and installation" },
    ],
    contractors: [
      {
        id: "1",
        name: "ABC Plumbing",
        trade: "Plumbing",
        contact: "John Smith",
        email: "john@abcplumbing.com",
        phone: "+44 20 1234 5678",
        portalAccess: true,
      },
      {
        id: "2",
        name: "Elite Carpentry",
        trade: "Carpentry",
        contact: "Sarah Johnson",
        email: "sarah@elitecarpentry.co.uk",
        phone: "+44 20 8765 4321",
        portalAccess: false,
      },
    ],
  })

  const missing = useMemo(() => computeMissingFields(onboardingData), [onboardingData])
  const progressPct = useMemo(() => computeProgressPct(missing), [missing])

  async function handleSave(section: SectionKey, payload: unknown) {
    await saveProjectSettings({ projectId, section, payload })
    // In a real app, you would update the state with the response
    // For now, we'll just simulate a successful save
    console.log(`Saved ${section} settings:`, payload)
  }

  return (
    <main className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with CTA and onboarding progress */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Project Settings</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={missing.length === 0 ? "default" : "secondary"}>
                {missing.length === 0 ? "Onboarding complete" : `${missing.length} fields remaining`}
              </Badge>
              <div className="w-40">
                <Progress value={progressPct} />
              </div>
            </div>
          </div>
          <InviteOnboardDialog projectId={projectId} onStartWizard={() => setWizardOpen(true)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sticky Sections nav */}
          <aside className="lg:col-span-3">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm">Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <nav className="grid gap-1">
                  {sections.map((s) => {
                    const Icon = s.icon
                    const active = selected === s.key
                    return (
                      <Button
                        key={s.key}
                        variant={active ? "secondary" : "ghost"}
                        className={`justify-start ${active ? "bg-neutral-100" : ""}`}
                        onClick={() => setSelected(s.key)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {s.label}
                      </Button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Section form */}
          <section className="lg:col-span-9">
            {selected === "overview" && (
              <OverviewForm
                value={projectData}
                onChange={(data) => setProjectData({ ...projectData, ...data })}
                onSave={(p) => handleSave("overview", p)}
              />
            )}
            {selected === "contacts" && (
              <ContactsForm
                value={onboardingData}
                onChange={setOnboardingData}
                onSave={(p) => handleSave("contacts", p)}
              />
            )}
            {selected === "property" && (
              <PropertyForm
                value={onboardingData}
                onChange={setOnboardingData}
                onSave={(p) => handleSave("property", p)}
              />
            )}
            {selected === "rooms" && (
              <RoomsForm value={onboardingData} onChange={setOnboardingData} onSave={(p) => handleSave("rooms", p)} />
            )}
            {selected === "delivery" && (
              <DeliveryForm
                value={onboardingData}
                onChange={setOnboardingData}
                onSave={(p) => handleSave("delivery", p)}
              />
            )}
            {selected === "preferences" && (
              <PreferencesForm
                value={onboardingData}
                onChange={setOnboardingData}
                onSave={(p) => handleSave("preferences", p)}
              />
            )}
            {selected === "team" && (
              <TeamForm
                value={projectData}
                onChange={(data) => setProjectData({ ...projectData, ...data })}
                onSave={(p) => handleSave("team", p)}
              />
            )}
            {selected === "phases" && (
              <PhasesForm
                value={projectData}
                onChange={(data) => setProjectData({ ...projectData, ...data })}
                onSave={(p) => handleSave("phases", p)}
              />
            )}
            {selected === "contractors" && (
              <ContractorsForm
                value={projectData}
                onChange={(data) => setProjectData({ ...projectData, ...data })}
                onSave={(p) => handleSave("contractors", p)}
              />
            )}
            {selected === "timeline" && (
              <TimelineForm
                value={projectData}
                onChange={(data) => setProjectData({ ...projectData, ...data })}
                onSave={(p) => handleSave("timeline", p)}
              />
            )}
            {selected === "financial" && (
              <FinancialForm
                value={projectData}
                onChange={(data) => setProjectData({ ...projectData, ...data })}
                onSave={(p) => handleSave("financial", p)}
              />
            )}
            {selected === "automation" && <AutomationForm onSave={(p) => handleSave("automation", p)} />}
          </section>
        </div>
      </div>

      {/* Wizard */}
      <OnboardingWizard
        projectId={projectId}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCompleted={({ missing: m, progressPct: pct }) => {
          // reflect completion in header badges
          // no-op for now; you can hook real data as needed.
        }}
      />
    </main>
  )
}

/* Forms — lightweight, aligned to global UI */

function OverviewForm({
  value,
  onChange,
  onSave,
}: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Project title</Label>
          <Input
            id="title"
            className="mt-1"
            placeholder="Chelsea Penthouse"
            value={value.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="code">Project code</Label>
          <Input
            id="code"
            className="mt-1"
            placeholder="LUX-001"
            value={value.code}
            onChange={(e) => onChange({ code: e.target.value })}
          />
          <p className="text-xs text-ink-muted mt-1">Used in file names and POs.</p>
        </div>
        <div>
          <Label htmlFor="type">Project type</Label>
          <Select value={value.type} onValueChange={(val) => onChange({ type: val })}>
            <SelectTrigger className="mt-1 bg-white border-borderSoft focus:ring-0 focus:border-borderSoft">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-borderSoft">
              <SelectItem value="residential" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Residential
                </div>
              </SelectItem>
              <SelectItem value="commercial" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Commercial
                </div>
              </SelectItem>
              <SelectItem value="hospitality" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Store className="w-4 h-4 mr-2" />
                  Hospitality
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            className="mt-1"
            rows={4}
            placeholder="Short project summary…"
            value={value.summary}
            onChange={(e) => onChange({ summary: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value)}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ContactsForm({
  value,
  onChange,
  onSave,
}: {
  value: OnboardingData
  onChange: (v: OnboardingData) => void
  onSave: (p: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contacts & Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Primary client</Label>
            <Input
              className="mt-1"
              placeholder="Name"
              value={value.contacts.primary?.name ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  contacts: { ...value.contacts, primary: { ...(value.contacts.primary ?? {}), name: e.target.value } },
                })
              }
            />
            <Input
              className="mt-2"
              type="email"
              placeholder="Email"
              value={value.contacts.primary?.email ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  contacts: {
                    ...value.contacts,
                    primary: { ...(value.contacts.primary ?? {}), email: e.target.value },
                  },
                })
              }
            />
            <Input
              className="mt-2"
              placeholder="Phone"
              value={value.contacts.primary?.phone ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  contacts: {
                    ...value.contacts,
                    primary: { ...(value.contacts.primary ?? {}), phone: e.target.value },
                  },
                })
              }
            />
            <div className="mt-3 flex items-center gap-2">
              <Switch
                checked={!!value.contacts.primary?.portalAccess}
                onCheckedChange={(v) =>
                  onChange({
                    ...value,
                    contacts: { ...value.contacts, primary: { ...(value.contacts.primary ?? {}), portalAccess: v } },
                  })
                }
              />
              <span className="text-sm">Grant portal access</span>
            </div>
          </div>
          <div>
            <Label>Secondary client</Label>
            <Input
              className="mt-1"
              placeholder="Name"
              value={value.contacts.secondary?.name ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  contacts: {
                    ...value.contacts,
                    secondary: { ...(value.contacts.secondary ?? {}), name: e.target.value },
                  },
                })
              }
            />
            <Input
              className="mt-2"
              type="email"
              placeholder="Email"
              value={value.contacts.secondary?.email ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  contacts: {
                    ...value.contacts,
                    secondary: { ...(value.contacts.secondary ?? {}), email: e.target.value },
                  },
                })
              }
            />
            <Input
              className="mt-2"
              placeholder="Role (Client, Accountant, Site Contact)"
              value={value.contacts.secondary?.role ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  contacts: {
                    ...value.contacts,
                    secondary: { ...(value.contacts.secondary ?? {}), role: e.target.value as any },
                  },
                })
              }
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value.contacts)}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PropertyForm({
  value,
  onChange,
  onSave,
}: {
  value: OnboardingData
  onChange: (v: OnboardingData) => void
  onSave: (p: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Property</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Site address</Label>
          <Input
            className="mt-1"
            placeholder="Search address…"
            value={value.property.siteAddress ?? ""}
            onChange={(e) => onChange({ ...value, property: { ...value.property, siteAddress: e.target.value } })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Access & parking notes</Label>
            <Textarea
              className="mt-1"
              rows={3}
              value={value.property.accessNotes ?? ""}
              onChange={(e) => onChange({ ...value, property: { ...value.property, accessNotes: e.target.value } })}
            />
          </div>
          <div>
            <Label>Building restrictions</Label>
            <Textarea
              className="mt-1"
              rows={3}
              value={value.property.restrictions ?? ""}
              onChange={(e) => onChange({ ...value, property: { ...value.property, restrictions: e.target.value } })}
            />
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value.property)}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RoomsForm({
  value,
  onChange,
  onSave,
}: {
  value: OnboardingData
  onChange: (v: OnboardingData) => void
  onSave: (p: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rooms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input
            placeholder="Room name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const input = e.currentTarget as HTMLInputElement
                if (input.value.trim()) {
                  const rooms = [...(value.rooms ?? []), { name: input.value.trim() }]
                  onChange({ ...value, rooms })
                  input.value = ""
                }
              }
            }}
          />
          <div className="md:col-span-2 text-sm text-muted-foreground flex items-center">
            {"Press Enter to add room"}
          </div>
        </div>
        <div className="space-y-2">
          {(value.rooms ?? []).map((room, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                value={room.name}
                onChange={(e) => {
                  const next = [...(value.rooms ?? [])]
                  next[idx] = { ...next[idx], name: e.target.value }
                  onChange({ ...value, rooms: next })
                }}
              />
              <Input
                placeholder="Dimensions"
                value={room.dimensions ?? ""}
                onChange={(e) => {
                  const next = [...(value.rooms ?? [])]
                  next[idx] = { ...next[idx], dimensions: e.target.value }
                  onChange({ ...value, rooms: next })
                }}
              />
              <Input
                placeholder="Delivery constraints"
                value={room.constraints ?? ""}
                onChange={(e) => {
                  const next = [...(value.rooms ?? [])]
                  next[idx] = { ...next[idx], constraints: e.target.value }
                  onChange({ ...value, rooms: next })
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value.rooms)}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DeliveryForm({
  value,
  onChange,
  onSave,
}: {
  value: OnboardingData
  onChange: (v: OnboardingData) => void
  onSave: (p: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Delivery & Billing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Billing address</Label>
          <Input
            className="mt-1"
            value={value.deliveryBilling.billingAddress ?? ""}
            onChange={(e) =>
              onChange({ ...value, deliveryBilling: { ...value.deliveryBilling, billingAddress: e.target.value } })
            }
          />
        </div>
        <div>
          <Label>Delivery address</Label>
          <Input
            className="mt-1"
            value={value.deliveryBilling.deliveryAddress ?? ""}
            onChange={(e) =>
              onChange({ ...value, deliveryBilling: { ...value.deliveryBilling, deliveryAddress: e.target.value } })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>On‑site contact</Label>
            <Input
              className="mt-1"
              value={value.deliveryBilling.onsiteContact ?? ""}
              onChange={(e) =>
                onChange({ ...value, deliveryBilling: { ...value.deliveryBilling, onsiteContact: e.target.value } })
              }
            />
          </div>
          <div>
            <Label>Delivery windows</Label>
            <Input
              className="mt-1"
              placeholder="e.g., Mon‑Fri 9–5"
              value={value.deliveryBilling.deliveryWindows ?? ""}
              onChange={(e) =>
                onChange({ ...value, deliveryBilling: { ...value.deliveryBilling, deliveryWindows: e.target.value } })
              }
            />
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value.deliveryBilling)}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PreferencesForm({
  value,
  onChange,
  onSave,
}: {
  value: OnboardingData
  onChange: (v: OnboardingData) => void
  onSave: (p: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preferences & Consent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Style tags</Label>
          <Input
            className="mt-1"
            placeholder="modern, warm minimalism"
            value={(value.preferencesConsent.styleTags ?? []).join(", ")}
            onChange={(e) =>
              onChange({
                ...value,
                preferencesConsent: {
                  ...value.preferencesConsent,
                  styleTags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        </div>
        <div>
          <Label>Preferred vendors</Label>
          <Input
            className="mt-1"
            placeholder="Vendor A, Vendor B"
            value={(value.preferencesConsent.preferredVendors ?? []).join(", ")}
            onChange={(e) =>
              onChange({
                ...value,
                preferencesConsent: {
                  ...value.preferencesConsent,
                  preferredVendors: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={!!value.preferencesConsent.consents?.marketing}
              onCheckedChange={(v) =>
                onChange({
                  ...value,
                  preferencesConsent: {
                    ...value.preferencesConsent,
                    consents: { ...value.preferencesConsent.consents, marketing: v },
                  },
                })
              }
            />
            <span className="text-sm">Marketing opt‑in</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.preferencesConsent.consents?.terms}
                onChange={(e) =>
                  onChange({
                    ...value,
                    preferencesConsent: {
                      ...value.preferencesConsent,
                      consents: { ...value.preferencesConsent.consents, terms: e.target.checked },
                    },
                  })
                }
              />
              <span>
                {"Agree to "}
                <a href="#" className="underline">
                  Terms
                </a>
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value.preferencesConsent.consents?.privacy}
                onChange={(e) =>
                  onChange({
                    ...value,
                    preferencesConsent: {
                      ...value.preferencesConsent,
                      consents: { ...value.preferencesConsent.consents, privacy: e.target.checked },
                    },
                  })
                }
              />
              <span>
                {"Agree to "}
                <a href="#" className="underline">
                  Privacy
                </a>
              </span>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value.preferencesConsent)}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TimelineForm({
  value,
  onChange,
  onSave,
}: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  // Format date for display in input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0] // YYYY-MM-DD format for input
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              className="mt-1"
              value={formatDateForInput(value.startDate)}
              onChange={(e) => onChange({ startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              type="date"
              className="mt-1"
              value={formatDateForInput(value.endDate)}
              onChange={(e) => onChange({ endDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={value.timezone} onValueChange={(val) => onChange({ timezone: val })}>
            <SelectTrigger
              id="timezone"
              className="mt-1 bg-white border-borderSoft focus:ring-0 focus:border-borderSoft"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-borderSoft">
              <SelectItem value="Europe/London" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  London (GMT)
                </div>
              </SelectItem>
              <SelectItem value="America/New_York" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  New York (EST)
                </div>
              </SelectItem>
              <SelectItem value="Europe/Paris" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Paris (CET)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value)}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function FinancialForm({
  value,
  onChange,
  onSave,
}: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Financial</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              className="mt-1"
              placeholder="850000"
              value={value.budget}
              onChange={(e) => onChange({ budget: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="taxRate">Tax/VAT rate (%)</Label>
            <Input
              id="taxRate"
              className="mt-1"
              placeholder="20"
              value={value.taxRate}
              onChange={(e) => onChange({ taxRate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={value.currency} onValueChange={(val) => onChange({ currency: val })}>
            <SelectTrigger
              id="currency"
              className="mt-1 bg-white border-borderSoft focus:ring-0 focus:border-borderSoft"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-borderSoft">
              <SelectItem value="GBP" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  GBP (£)
                </div>
              </SelectItem>
              <SelectItem value="USD" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  USD ($)
                </div>
              </SelectItem>
              <SelectItem value="EUR" className="focus:bg-greige-50 focus:text-ink">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  EUR (€)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value)}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AutomationForm({ onSave }: { onSave: (p: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Automation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium">Kickoff Pack</div>
            <p className="text-sm text-muted-foreground mt-1">{"Auto‑generate tasks when onboarding completes."}</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium">Notifications</div>
            <p className="text-sm text-muted-foreground mt-1">{"Notify team when clients join the portal."}</p>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => onSave({})}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamForm({ value, onChange, onSave }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  const addTeamMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: "",
      role: "",
      avatar: "",
    }
    onChange({ team: [...(value.team || []), newMember] })
  }

  const updateTeamMember = (index: number, updates: any) => {
    const updatedTeam = [...(value.team || [])]
    updatedTeam[index] = { ...updatedTeam[index], ...updates }
    onChange({ team: updatedTeam })
  }

  const removeTeamMember = (index: number) => {
    const updatedTeam = [...(value.team || [])]
    updatedTeam.splice(index, 1)
    onChange({ team: updatedTeam })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Team Members</CardTitle>
          <Button onClick={addTeamMember} size="sm" className="bg-clay-600 hover:bg-clay-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {(value.team || []).map((member: any, index: number) => (
            <div key={member.id || index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-clay-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-clay-600">
                  {member.name
                    ? member.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                    : "TM"}
                </span>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Full name"
                  value={member.name}
                  onChange={(e) => updateTeamMember(index, { name: e.target.value })}
                />
                <Input
                  placeholder="Role (e.g., Lead Designer)"
                  value={member.role}
                  onChange={(e) => updateTeamMember(index, { role: e.target.value })}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTeamMember(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>
          ))}
          {(!value.team || value.team.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No team members assigned yet. Click "Add Member" to get started.
            </div>
          )}
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value.team)}>Save Team</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PhasesForm({ value, onChange, onSave }: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  const addPhase = () => {
    const newPhase = {
      name: "",
      duration: "",
      description: "",
    }
    onChange({ phases: [...(value.phases || []), newPhase] })
  }

  const updatePhase = (index: number, updates: any) => {
    const updatedPhases = [...(value.phases || [])]
    updatedPhases[index] = { ...updatedPhases[index], ...updates }
    onChange({ phases: updatedPhases })
  }

  const removePhase = (index: number) => {
    const updatedPhases = [...(value.phases || [])]
    updatedPhases.splice(index, 1)
    onChange({ phases: updatedPhases })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Project Phases</CardTitle>
          <Button onClick={addPhase} size="sm" className="bg-clay-600 hover:bg-clay-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add Phase
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {(value.phases || []).map((phase: any, index: number) => (
            <Card key={index} className="border-borderSoft bg-greige-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-white text-ink-muted border-borderSoft">
                      Phase {index + 1}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhase(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Phase Name</Label>
                      <Input
                        className="mt-1"
                        placeholder="e.g., Discovery & Planning"
                        value={phase.name}
                        onChange={(e) => updatePhase(index, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Duration</Label>
                      <Input
                        className="mt-1"
                        placeholder="e.g., 2 weeks"
                        value={phase.duration}
                        onChange={(e) => updatePhase(index, { duration: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Description</Label>
                    <Textarea
                      className="mt-1"
                      placeholder="Brief description of this phase..."
                      value={phase.description}
                      onChange={(e) => updatePhase(index, { description: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!value.phases || value.phases.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No phases defined yet. Click "Add Phase" to create your project timeline.
            </div>
          )}
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value.phases)}>Save Phases</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ContractorsForm({
  value,
  onChange,
  onSave,
}: { value: any; onChange: (v: any) => void; onSave: (p: any) => void }) {
  const addContractor = () => {
    const newContractor = {
      id: Date.now().toString(),
      name: "",
      trade: "",
      contact: "",
      email: "",
      phone: "",
      portalAccess: false,
    }
    onChange({ contractors: [...(value.contractors || []), newContractor] })
  }

  const updateContractor = (index: number, updates: any) => {
    const updatedContractors = [...(value.contractors || [])]
    updatedContractors[index] = { ...updatedContractors[index], ...updates }
    onChange({ contractors: updatedContractors })
  }

  const removeContractor = (index: number) => {
    const updatedContractors = [...(value.contractors || [])]
    updatedContractors.splice(index, 1)
    onChange({ contractors: updatedContractors })
  }

  const inviteToPortal = (contractor: any) => {
    // This would trigger the contractor portal invitation
    console.log(`Inviting ${contractor.name} to contractor portal`)
    // Update portal access status
    const index = value.contractors.findIndex((c: any) => c.id === contractor.id)
    if (index !== -1) {
      updateContractor(index, { portalAccess: true })
    }
  }

  const commonTrades = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Flooring",
    "HVAC",
    "Roofing",
    "Masonry",
    "Glazing",
    "Landscaping",
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Contractors</CardTitle>
          <Button onClick={addContractor} size="sm" className="bg-clay-600 hover:bg-clay-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add Contractor
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {(value.contractors || []).map((contractor: any, index: number) => (
            <Card key={contractor.id || index} className="border-borderSoft bg-greige-50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-clay-100 rounded-full flex items-center justify-center">
                        <Building className="w-5 h-5 text-clay-600" />
                      </div>
                      <div>
                        <div className="font-medium">{contractor.name || "New Contractor"}</div>
                        <div className="text-sm text-muted-foreground">{contractor.trade}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contractor.portalAccess ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          Portal Access
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => inviteToPortal(contractor)}
                          className="bg-clay-600 text-white hover:bg-clay-700"
                        >
                          Invite to Portal
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContractor(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Company Name</Label>
                      <Input
                        className="mt-1"
                        placeholder="e.g., ABC Plumbing Ltd"
                        value={contractor.name}
                        onChange={(e) => updateContractor(index, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Trade</Label>
                      <Select value={contractor.trade} onValueChange={(val) => updateContractor(index, { trade: val })}>
                        <SelectTrigger className="mt-1 bg-white border-borderSoft focus:ring-0 focus:border-borderSoft">
                          <SelectValue placeholder="Select trade" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-borderSoft">
                          {commonTrades.map((trade) => (
                            <SelectItem key={trade} value={trade} className="focus:bg-greige-50 focus:text-ink">
                              {trade}
                            </SelectItem>
                          ))}
                          <SelectItem value="Other" className="focus:bg-greige-50 focus:text-ink">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm">Contact Person</Label>
                      <Input
                        className="mt-1"
                        placeholder="Primary contact name"
                        value={contractor.contact}
                        onChange={(e) => updateContractor(index, { contact: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Email</Label>
                      <Input
                        className="mt-1"
                        type="email"
                        placeholder="contact@company.com"
                        value={contractor.email}
                        onChange={(e) => updateContractor(index, { email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Phone</Label>
                      <Input
                        className="mt-1"
                        placeholder="+44 20 1234 5678"
                        value={contractor.phone}
                        onChange={(e) => updateContractor(index, { phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-borderSoft">
                    <Switch
                      checked={contractor.portalAccess}
                      onCheckedChange={(checked) => updateContractor(index, { portalAccess: checked })}
                    />
                    <span className="text-sm">Grant contractor portal access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!value.contractors || value.contractors.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No contractors assigned yet. Click "Add Contractor" to get started.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Button onClick={() => onSave(value.contractors)}>Save Contractors</Button>
        </div>
      </CardContent>
    </Card>
  )
}
