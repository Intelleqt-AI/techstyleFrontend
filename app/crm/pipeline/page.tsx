"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { CrmNav } from "@/components/crm-nav"
import { cn } from "@/lib/utils"
import { Building2, Users, FileText, Handshake, Trophy, X } from "lucide-react"

type StageId = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost"

type Deal = {
  id: string
  title: string
  company: string
  value: number
  owner: string
  stage: StageId
  closeDate?: string
}

const initialDeals: Deal[] = [
  { id: "d1", title: "Penthouse FF&E", company: "Smith Family", value: 85000, owner: "Jane", stage: "new" },
  { id: "d2", title: "Office Fit-out", company: "TechCorp Inc.", value: 140000, owner: "Sam", stage: "qualified" },
  {
    id: "d3",
    title: "Hotel Lobby Revamp",
    company: "Grandeur Hotels",
    value: 220000,
    owner: "Chris",
    stage: "proposal",
  },
  { id: "d4", title: "Townhouse Refresh", company: "Clay & Co", value: 42000, owner: "Ava", stage: "negotiation" },
  { id: "d5", title: "Showroom Styling", company: "Terra Home", value: 26000, owner: "Ivy", stage: "new" },
  { id: "d6", title: "Wellness Spa", company: "Sage Spa", value: 130000, owner: "Rae", stage: "qualified" },
  { id: "d7", title: "Boutique Cafe", company: "Ochre & Bean", value: 38000, owner: "Leo", stage: "proposal" },
]

const stages: { id: StageId; label: string; icon: React.ComponentType<{ className?: string }>; chipClass: string }[] = [
  { id: "new", label: "New", icon: Building2, chipClass: "bg-neutral-100 text-gray-700 border-gray-200" },
  { id: "qualified", label: "Qualified", icon: Users, chipClass: "bg-sage-300/40 text-olive-700 border-olive-700/20" },
  {
    id: "proposal",
    label: "Proposal",
    icon: FileText,
    chipClass: "bg-ochre-300/20 text-ochre-700 border-ochre-700/20",
  },
  { id: "negotiation", label: "Negotiation", icon: Handshake, chipClass: "bg-clay-50 text-clay-700 border-clay-200" },
  { id: "won", label: "Won", icon: Trophy, chipClass: "bg-sage-300 text-olive-700" },
  {
    id: "lost",
    label: "Lost",
    icon: X,
    chipClass: "bg-terracotta-600/10 text-terracotta-700 border-terracotta-700/20",
  },
]

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)

  function onDragStart(e: React.DragEvent<HTMLDivElement>, id: string) {
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, targetStage: StageId) {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage: targetStage } : d)))
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  const byStage = useMemo(() => {
    const map: Record<StageId, Deal[]> = {
      new: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    }
    for (const d of deals) map[d.stage].push(d)
    return map
  }, [deals])

  return (
    <div className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* CRM nav styled like Projects nav */}
        <CrmNav activeTab="pipeline" counts={{ leads: 12 }} />

        {/* White container wrapper for the entire board */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          <div className="flex gap-3 min-w-max">
            {stages.map((s) => {
              const IconComponent = s.icon
              return (
                <div
                  key={s.id}
                  className="bg-gray-50 rounded-xl flex flex-col max-h-[75vh] w-64 flex-shrink-0"
                  onDrop={(e) => onDrop(e, s.id)}
                  onDragOver={onDragOver}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <IconComponent className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-sm text-gray-900 truncate">{s.label}</span>
                      <span
                        className={cn("text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0", s.chipClass)}
                      >
                        {byStage[s.id].length}
                      </span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="px-3 pb-3 space-y-2 overflow-auto flex-1">
                    {byStage[s.id].map((d) => (
                      <div
                        key={d.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-gray-300 transition-colors cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => onDragStart(e, d.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium leading-5 text-gray-900 truncate">{d.title}</div>
                            <div className="text-xs text-gray-600 truncate mt-1">{d.company}</div>
                          </div>
                          <div className="text-sm font-medium text-gray-900 flex-shrink-0 ml-2">
                            {"£"}
                            {(d.value / 1000).toFixed(0)}
                            {"k"}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                          <span className="truncate">Owner: {d.owner}</span>
                          {d.closeDate ? (
                            <span className="flex-shrink-0 ml-2">Close: {d.closeDate}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {byStage[s.id].length === 0 && (
                      <div className="text-xs text-gray-500 px-3 py-6 text-center border border-dashed border-gray-300 rounded-lg bg-white/50">
                        Drag a deal here
                      </div>
                    )}

                    {/* Add Deal button - blank board underneath */}
                    <div className="mt-3 pt-2">
                      <button className="w-full text-sm text-gray-500 hover:text-gray-700 py-3 px-3 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors bg-white/30 hover:bg-white/50">
                        + Add Deal
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
