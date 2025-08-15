"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Plus, ArrowLeft, ArrowRight, Check, Upload, MapPin } from "lucide-react"
import type { OnboardingData, Contact, Room } from "./types"
import { loadOnboarding, saveOnboarding, clearOnboarding } from "./storage"
import { computeMissingFields, computeProgressPct } from "./utils"
import { finalizeOnboarding } from "@/app/projects/[id]/settings/actions"

type Props = {
  projectId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCompleted?: (result: { missing: string[]; progressPct: number }) => void
}

const stepTitles = [
  "Contacts & Access",
  "Property Details",
  "Rooms & Areas",
  "Delivery & Billing",
  "Preferences & Consent",
]

export function OnboardingWizard({ projectId, open = false, onOpenChange, onCompleted }: Props) {
  const [isOpen, setIsOpen] = useState(open)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    contacts: { additional: [] },
    property: {},
    rooms: [],
    deliveryBilling: {},
    preferencesConsent: {},
  })

  // Sync external control
  useEffect(() => setIsOpen(open), [open])
  useEffect(() => onOpenChange?.(isOpen), [isOpen]) // eslint-disable-line

  // Load previous session
  useEffect(() => {
    const saved = loadOnboarding(projectId)
    if (saved) {
      setData(saved.data ?? data)
      setStep(saved.step ?? 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  // Autosave
  useEffect(() => {
    saveOnboarding(projectId, { data, step })
  }, [projectId, data, step])

  const missing = useMemo(() => computeMissingFields(data), [data])
  const progressPct = useMemo(() => computeProgressPct(missing), [missing])

  function next() {
    setStep((s) => Math.min(stepTitles.length - 1, s + 1))
  }
  function prev() {
    setStep((s) => Math.max(0, s - 1))
  }

  async function submit() {
    setSaving(true)
    try {
      await finalizeOnboarding({ projectId, data })
      clearOnboarding(projectId)
      onCompleted?.({ missing, progressPct })
      setIsOpen(false)
    } finally {
      setSaving(false)
    }
  }

  // Helpers for updates
  const updateContact = (key: "primary" | "secondary", patch: Partial<Contact>) => {
    setData((d) => ({ ...d, contacts: { ...d.contacts, [key]: { ...(d.contacts as any)[key], ...patch } } }))
  }
  const addAdditional = () => {
    setData((d) => ({
      ...d,
      contacts: { ...d.contacts, additional: [...(d.contacts?.additional ?? []), { name: "", email: "" }] },
    }))
  }
  const updateAdditional = (idx: number, patch: Partial<Contact>) => {
    setData((d) => {
      const list = [...(d.contacts?.additional ?? [])]
      list[idx] = { ...list[idx], ...patch }
      return { ...d, contacts: { ...d.contacts, additional: list } }
    })
  }
  const removeAdditional = (idx: number) => {
    setData((d) => {
      const list = [...(d.contacts?.additional ?? [])]
      list.splice(idx, 1)
      return { ...d, contacts: { ...d.contacts, additional: list } }
    })
  }

  const addRoom = (name: string) => {
    const room: Room = { name }
    setData((d) => ({ ...d, rooms: [...(d.rooms ?? []), room] }))
  }

  const updateRoom = (idx: number, patch: Partial<Room>) => {
    setData((d) => {
      const list = [...(d.rooms ?? [])]
      list[idx] = { ...list[idx], ...patch }
      return { ...d, rooms: list }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Client Portal Onboarding</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stepper */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>{`Step ${step + 1} of ${stepTitles.length}`}</div>
              <div>{progressPct}% complete</div>
            </div>
            <Progress value={progressPct} className="mt-2" />
            <div className="mt-2 text-sm font-medium">{stepTitles[step]}</div>
          </div>

          <Separator />

          {/* Steps */}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Primary client</div>
                <Label htmlFor="pc-name">Name</Label>
                <Input
                  id="pc-name"
                  className="mt-1"
                  value={data.contacts.primary?.name ?? ""}
                  onChange={(e) => updateContact("primary", { name: e.target.value })}
                />
                <div className="mt-3">
                  <Label htmlFor="pc-email">Email</Label>
                  <Input
                    id="pc-email"
                    className="mt-1"
                    type="email"
                    value={data.contacts.primary?.email ?? ""}
                    onChange={(e) => updateContact("primary", { email: e.target.value })}
                  />
                </div>
                <div className="mt-3">
                  <Label htmlFor="pc-phone">Phone</Label>
                  <Input
                    id="pc-phone"
                    className="mt-1"
                    value={data.contacts.primary?.phone ?? ""}
                    onChange={(e) => updateContact("primary", { phone: e.target.value })}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Checkbox
                    id="pc-portal"
                    checked={!!data.contacts.primary?.portalAccess}
                    onCheckedChange={(v) => updateContact("primary", { portalAccess: !!v })}
                  />
                  <Label htmlFor="pc-portal">Grant portal access</Label>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Secondary client</div>
                <Label htmlFor="sc-name">Name</Label>
                <Input
                  id="sc-name"
                  className="mt-1"
                  value={data.contacts.secondary?.name ?? ""}
                  onChange={(e) => updateContact("secondary", { name: e.target.value })}
                />
                <div className="mt-3">
                  <Label htmlFor="sc-email">Email</Label>
                  <Input
                    id="sc-email"
                    className="mt-1"
                    type="email"
                    value={data.contacts.secondary?.email ?? ""}
                    onChange={(e) => updateContact("secondary", { email: e.target.value })}
                  />
                </div>
                <div className="mt-3">
                  <Label htmlFor="sc-role">Assign role</Label>
                  <Input
                    id="sc-role"
                    className="mt-1"
                    placeholder="Client / Accountant / Site Contact"
                    value={data.contacts.secondary?.role ?? ""}
                    onChange={(e) => updateContact("secondary", { role: e.target.value as any })}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Additional contacts</div>
                  <Button variant="outline" size="sm" onClick={addAdditional}>
                    <Plus className="w-4 h-4 mr-1" /> Add contact
                  </Button>
                </div>
                <div className="space-y-3">
                  {(data.contacts.additional ?? []).map((c, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Input
                        placeholder="Name"
                        value={c.name ?? ""}
                        onChange={(e) => updateAdditional(idx, { name: e.target.value })}
                      />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={c.email ?? ""}
                        onChange={(e) => updateAdditional(idx, { email: e.target.value })}
                      />
                      <Input
                        placeholder="Phone"
                        value={c.phone ?? ""}
                        onChange={(e) => updateAdditional(idx, { phone: e.target.value })}
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`ad-${idx}-portal`}
                          checked={!!c.portalAccess}
                          onCheckedChange={(v) => updateAdditional(idx, { portalAccess: !!v })}
                        />
                        <Label htmlFor={`ad-${idx}-portal`}>Portal</Label>
                        <Button type="button" variant="ghost" className="ml-auto" onClick={() => removeAdditional(idx)}>
                          {"Remove"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="addr">Site address</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    id="addr"
                    placeholder="Start typing address…"
                    value={data.property.siteAddress ?? ""}
                    onChange={(e) =>
                      setData((d) => ({ ...d, property: { ...d.property, siteAddress: e.target.value } }))
                    }
                  />
                  <Button variant="outline">
                    <MapPin className="w-4 h-4 mr-1" /> Lookup
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Access & parking notes</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    value={data.property.accessNotes ?? ""}
                    onChange={(e) =>
                      setData((d) => ({ ...d, property: { ...d.property, accessNotes: e.target.value } }))
                    }
                  />
                </div>
                <div>
                  <Label>Building restrictions</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    value={data.property.restrictions ?? ""}
                    onChange={(e) =>
                      setData((d) => ({ ...d, property: { ...d.property, restrictions: e.target.value } }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Upload drawings/photos</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" /> Upload files
                  </Button>
                  <span className="text-sm text-muted-foreground">Optional</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["Kitchen", "Living Room", "Dining Room", "Bedroom", "Bathroom", "Office", "Outdoor"].map((r) => (
                  <Button key={r} variant="outline" size="sm" onClick={() => addRoom(r)}>
                    {r}
                  </Button>
                ))}
                <Button size="sm" variant="secondary" onClick={() => addRoom("Custom")}>
                  <Plus className="w-4 h-4 mr-1" /> Add custom
                </Button>
              </div>
              <div className="space-y-3">
                {(data.rooms ?? []).map((room, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input value={room.name} onChange={(e) => updateRoom(idx, { name: e.target.value })} />
                    <Input
                      placeholder="Dimensions (e.g., 5m x 4m)"
                      value={room.dimensions ?? ""}
                      onChange={(e) => updateRoom(idx, { dimensions: e.target.value })}
                    />
                    <Input
                      placeholder="Delivery constraints"
                      value={room.constraints ?? ""}
                      onChange={(e) => updateRoom(idx, { constraints: e.target.value })}
                    />
                  </div>
                ))}
                {(!data.rooms || data.rooms.length === 0) && (
                  <div className="text-sm text-muted-foreground">{"No rooms added yet."}</div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Billing address</Label>
                <Input
                  className="mt-1"
                  value={data.deliveryBilling.billingAddress ?? ""}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      deliveryBilling: { ...d.deliveryBilling, billingAddress: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label>Delivery address</Label>
                <Input
                  className="mt-1"
                  value={data.deliveryBilling.deliveryAddress ?? ""}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      deliveryBilling: { ...d.deliveryBilling, deliveryAddress: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>On‑site contact</Label>
                  <Input
                    className="mt-1"
                    value={data.deliveryBilling.onsiteContact ?? ""}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        deliveryBilling: { ...d.deliveryBilling, onsiteContact: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Delivery windows</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g., Mon‑Fri 9:00–17:00"
                    value={data.deliveryBilling.deliveryWindows ?? ""}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        deliveryBilling: { ...d.deliveryBilling, deliveryWindows: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label>Communication preferences</Label>
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  {(["Email", "Portal", "WhatsApp"] as const).map((m) => {
                    const checked = (data.preferencesConsent.communication ?? []).includes(m)
                    return (
                      <label key={m} className="inline-flex items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const current = new Set(data.preferencesConsent.communication ?? [])
                            if (v) current.add(m)
                            else current.delete(m)
                            setData((d) => ({
                              ...d,
                              preferencesConsent: {
                                ...d.preferencesConsent,
                                communication: Array.from(current) as any,
                              },
                            }))
                          }}
                        />
                        <span>{m}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label>Style tags</Label>
                <Input
                  className="mt-1"
                  placeholder="Comma‑separated (e.g., modern, mid‑century)"
                  value={(data.preferencesConsent.styleTags ?? []).join(", ")}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      preferencesConsent: {
                        ...d.preferencesConsent,
                        styleTags: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                />
              </div>

              <div>
                <Label>Preferred vendors</Label>
                <Input
                  className="mt-1"
                  placeholder="Comma‑separated (e.g., Vendor A, Vendor B)"
                  value={(data.preferencesConsent.preferredVendors ?? []).join(", ")}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      preferencesConsent: {
                        ...d.preferencesConsent,
                        preferredVendors: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Consents</div>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={!!data.preferencesConsent.consents?.terms}
                    onCheckedChange={(v) =>
                      setData((d) => ({
                        ...d,
                        preferencesConsent: {
                          ...d.preferencesConsent,
                          consents: { ...d.preferencesConsent.consents, terms: !!v },
                        },
                      }))
                    }
                  />
                  <span>
                    {"I agree to the "}
                    <a href="#" className="underline">
                      Terms
                    </a>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={!!data.preferencesConsent.consents?.privacy}
                    onCheckedChange={(v) =>
                      setData((d) => ({
                        ...d,
                        preferencesConsent: {
                          ...d.preferencesConsent,
                          consents: { ...d.preferencesConsent.consents, privacy: !!v },
                        },
                      }))
                    }
                  />
                  <span>
                    {"I agree to the "}
                    <a href="#" className="underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={!!data.preferencesConsent.consents?.marketing}
                    onCheckedChange={(v) =>
                      setData((d) => ({
                        ...d,
                        preferencesConsent: {
                          ...d.preferencesConsent,
                          consents: { ...d.preferencesConsent.consents, marketing: !!v },
                        },
                      }))
                    }
                  />
                  <span>Opt‑in to marketing</span>
                </label>
              </div>
            </div>
          )}

          <Separator />

          {/* Missing summary */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={missing.length === 0 ? "default" : "secondary"}>
              {missing.length === 0 ? (
                <span className="flex items-center">
                  <Check className="w-3.5 h-3.5 mr-1" /> {"All required complete"}
                </span>
              ) : (
                `${missing.length} missing`
              )}
            </Badge>
            {missing.slice(0, 3).map((m, i) => (
              <Badge key={i} variant="outline">
                {m}
              </Badge>
            ))}
            {missing.length > 3 && (
              <span className="text-xs text-muted-foreground">{`+${missing.length - 3} more`}</span>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={prev} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4 mr-1" /> {"Back"}
            </Button>
            <Button variant="ghost" onClick={next} disabled={step === stepTitles.length - 1}>
              {"Next"} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {step === stepTitles.length - 1 ? (
            <Button className="bg-clay-500 hover:bg-clay-600 text-white" onClick={submit} disabled={saving}>
              {saving ? "Submitting…" : "Submit & Finish"}
            </Button>
          ) : (
            <Button className="bg-neutral-900 text-white" onClick={next}>
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
