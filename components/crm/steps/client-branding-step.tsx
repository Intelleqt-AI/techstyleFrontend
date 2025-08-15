"use client"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building2, User } from "lucide-react"
import type { ProposalData } from "../proposal-drawer"

interface Client {
  id: string
  name: string
  type: "individual" | "company"
  email: string
  phone: string
}

interface ClientBrandingStepProps {
  data: ProposalData
  onUpdate: (updates: Partial<ProposalData>) => void
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Johnson Family Trust",
    type: "individual",
    email: "contact@johnsonfamily.com",
    phone: "+1 (555) 123-4567",
  },
  {
    id: "2",
    name: "Tech Innovations Inc",
    type: "company",
    email: "projects@techinnovations.com",
    phone: "+1 (555) 987-6543",
  },
  {
    id: "3",
    name: "Smith Residence",
    type: "individual",
    email: "mary.smith@email.com",
    phone: "+1 (555) 456-7890",
  },
  {
    id: "4",
    name: "Global Enterprises Ltd",
    type: "company",
    email: "design@globalent.com",
    phone: "+1 (555) 321-0987",
  },
]

const brandingPresets = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean lines, neutral colors, contemporary feel",
    colors: ["#1F1D1A", "#F5F4F2", "#E07A57"],
  },
  {
    id: "luxury-classic",
    name: "Luxury Classic",
    description: "Rich materials, warm tones, timeless elegance",
    colors: ["#2C1810", "#D4AF37", "#8B4513"],
  },
  {
    id: "fresh-contemporary",
    name: "Fresh Contemporary",
    description: "Bright spaces, natural elements, modern comfort",
    colors: ["#2E5266", "#8FA58F", "#F0F4F1"],
  },
]

export function ClientBrandingStep({ data, onUpdate }: ClientBrandingStepProps) {
  const selectedClient = data.client ? mockClients.find((c) => c.id === data.client) : null
  const selectedPreset = data.branding || ""

  const handleClientSelect = (clientId: string) => {
    const client = mockClients.find((c) => c.id === clientId)
    onUpdate({
      client: clientId,
      contact: client?.email || "",
    })
  }

  const handlePresetSelect = (presetId: string) => {
    onUpdate({ branding: presetId })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 bg-orange-50 rounded-lg border border-orange-200">
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <User className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Client & Branding</h3>
          <p className="text-sm text-gray-600">Select the client and branding preset for this proposal</p>
        </div>
      </div>

      {/* Client Selection */}
      <div className="space-y-3">
        <Label htmlFor="client" className="text-sm font-medium text-gray-700">
          Client *
        </Label>
        <Select value={data.client || ""} onValueChange={handleClientSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {mockClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex items-center gap-2">
                  {client.type === "company" ? (
                    <Building2 className="w-4 h-4 text-gray-500" />
                  ) : (
                    <User className="w-4 h-4 text-gray-500" />
                  )}
                  <span>{client.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {client.type === "company" ? "Company" : "Individual"}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selected Client Preview */}
        {selectedClient && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                {selectedClient.type === "company" ? (
                  <Building2 className="w-5 h-5 text-gray-600" />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{selectedClient.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {selectedClient.type === "company" ? "Company" : "Individual"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedClient.email} • {selectedClient.phone}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Branding Preset Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Branding Preset *</Label>
        <div className="grid gap-3">
          {brandingPresets.map((preset) => (
            <div
              key={preset.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPreset === preset.id
                  ? "border-orange-300 bg-orange-50 ring-2 ring-orange-200"
                  : "border-gray-200 hover:border-orange-200 bg-white"
              }`}
              onClick={() => handlePresetSelect(preset.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{preset.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  {preset.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
