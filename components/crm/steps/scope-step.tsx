"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, FileText, Wand2 } from "lucide-react"
import type { ProposalData } from "../proposal-drawer"

interface ScopeStepProps {
  data: ProposalData
  onUpdate: (updates: Partial<ProposalData>) => void
}

const scopeTemplates = [
  {
    id: "residential",
    name: "Residential Interior",
    content: `## Project Scope

### Design Development
- Initial consultation and space assessment
- Concept development and mood boards
- Space planning and layout optimization
- Material and finish selection
- Custom furniture design and specification

### Documentation
- Detailed drawings and specifications
- 3D visualizations and renderings
- Material schedules and procurement lists
- Installation coordination

### Project Management
- Contractor coordination and oversight
- Quality control and site visits
- Timeline management and progress reporting
- Final styling and installation supervision`,
  },
  {
    id: "commercial",
    name: "Commercial Space",
    content: `## Project Scope

### Strategic Planning
- Brand alignment and space strategy
- Workflow optimization analysis
- Compliance and accessibility review
- Sustainability considerations

### Design Services
- Concept development and presentations
- Space planning and furniture layouts
- Material selection and specification
- Lighting and technology integration

### Implementation
- Construction documentation
- Vendor coordination and procurement
- Installation management
- Post-occupancy evaluation`,
  },
  {
    id: "hospitality",
    name: "Hospitality Design",
    content: `## Project Scope

### Concept Development
- Brand experience design
- Guest journey mapping
- Operational flow optimization
- Ambiance and atmosphere creation

### Design Execution
- Public area design and layout
- Guest room prototyping
- F&B space design
- Wayfinding and signage systems

### Project Delivery
- FF&E specification and procurement
- Art and accessory curation
- Installation coordination
- Staff training and handover`,
  },
]

export function ScopeStep({ data, onUpdate }: ScopeStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("write")

  const handleAIGenerate = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const generatedScope = `## Project Scope

### Initial Consultation & Assessment
- Comprehensive site survey and space analysis
- Client brief development and requirements gathering
- Budget alignment and timeline establishment
- Stakeholder identification and communication protocols

### Design Development Phase
- Concept development with mood boards and inspiration
- Space planning and layout optimization
- Material palette and finish selection
- Custom furniture design and specification
- Lighting design and technology integration

### Documentation & Visualization
- Detailed technical drawings and specifications
- 3D renderings and virtual walkthroughs
- Material schedules and procurement documentation
- Installation guides and coordination plans

### Project Management & Delivery
- Contractor selection and coordination
- Quality control and regular site inspections
- Timeline management and progress reporting
- Final installation supervision and styling
- Post-completion support and warranty coordination

*This scope was generated based on your project requirements and can be customized as needed.*`

    onUpdate({ scope: generatedScope })
    setIsGenerating(false)
    setActiveTab("write")
  }

  const handleTemplateSelect = (template: (typeof scopeTemplates)[0]) => {
    onUpdate({ scope: template.content })
    setActiveTab("write")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-greige-50 rounded-lg border border-borderSoft">
        <div className="w-10 h-10 bg-clay-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-clay-600" />
        </div>
        <div>
          <h3 className="font-semibold text-ink">Scope of Work</h3>
          <p className="text-sm text-ink-muted">Define what's included in this proposal</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-greige-100">
          <TabsTrigger value="write" className="data-[state=active]:bg-white">
            Write Custom
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-white">
            Use Template
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-white">
            AI Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-ink">
                Scope Description <span className="text-red-500">*</span>
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="gap-2 bg-black border-black text-white hover:bg-black/90"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                AI Enhance
              </Button>
            </div>
            <Textarea
              placeholder="Describe the project scope, deliverables, and what's included..."
              value={data.scope || ""}
              onChange={(e) => onUpdate({ scope: e.target.value })}
              rows={12}
              className="bg-white resize-none font-mono text-sm border-borderSoft focus:ring-0 focus:border-borderSoft"
            />
            <p className="text-xs text-ink-muted">
              Use Markdown formatting for better presentation. This will be formatted in the final proposal.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {scopeTemplates.map((template) => (
              <Card key={template.id} className="border-borderSoft hover:border-clay-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-ink-muted" />
                        <h4 className="font-medium text-ink">{template.name}</h4>
                      </div>
                      <p className="text-sm text-ink-muted line-clamp-2">
                        {template.content
                          .split("\n")
                          .find((line) => line.includes("###"))
                          ?.replace("### ", "") || "Professional template for this project type"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                      className="gap-2 bg-white border-borderSoft hover:bg-greige-50"
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card className="border-amber-100 bg-[#FFFDF5]">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Wand2 className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-ink mb-2">AI-Powered Scope Generation</h4>
                  <p className="text-sm text-ink-muted mb-4">
                    Generate a comprehensive project scope based on your client and project details.
                  </p>
                </div>
                <Button
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !data.client}
                  className="gap-2 bg-black hover:bg-black/90 text-white"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {isGenerating ? "Generating..." : "Generate Scope"}
                </Button>
                {!data.client && (
                  <p className="text-xs text-ink-muted">Complete client selection first to enable AI generation</p>
                )}
              </div>
            </CardContent>
          </Card>

          {isGenerating && (
            <Card className="border-borderSoft">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-sm text-ink-muted">Analyzing project requirements...</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {data.scope && (
        <Card className="border-sage-200 bg-sage-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-sage-100 text-sage-800">
                Ready
              </Badge>
              <span className="text-sm font-medium text-sage-900">Scope defined</span>
            </div>
            <p className="text-sm text-sage-700">{data.scope.length} characters • Ready for pricing</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
