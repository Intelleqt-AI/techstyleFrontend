import type { Phase, WorkPackage } from "./types"

export const DEFAULT_PHASES: Phase[] = [
  { id: "phase-discovery", name: "Discovery", color: "#6B7280" }, // gray-500
  { id: "phase-concept", name: "Concept Design", color: "#C7654F" }, // clay
  { id: "phase-dd", name: "Design Development", color: "#9CA3AF" }, // gray-400
  { id: "phase-technical", name: "Technical Drawings", color: "#3B82F6" }, // blue-500
  { id: "phase-procurement", name: "Procurement", color: "#8B5CF6" }, // violet-500
  { id: "phase-implementation", name: "Site / Implementation", color: "#10B981" }, // emerald-500
]

export const DEFAULT_WORK_PACKAGES: WorkPackage[] = [
  { id: "wp-electrical", name: "Electrical", defaultRole: "Electrician" },
  { id: "wp-plumbing", name: "Plumbing", defaultRole: "Plumber" },
  { id: "wp-hvac", name: "HVAC", defaultRole: "HVAC" },
  { id: "wp-joinery", name: "Joinery", defaultRole: "Joinery" },
  { id: "wp-painting", name: "Painting & Decorating", defaultRole: "Painter / Decorator" },
  { id: "wp-flooring", name: "Flooring", defaultRole: "Flooring" },
  { id: "wp-tiling", name: "Tiling", defaultRole: "Tiling" },
  { id: "wp-lighting", name: "Lighting", defaultRole: "Lighting Supplier" },
  { id: "wp-av", name: "AV / IT", defaultRole: "AV / IT" },
  { id: "wp-landscaping", name: "Landscaping", defaultRole: "Landscaping" },
]

export const DEFAULT_TASKS_PER_PHASE: Record<string, string> = {
  "phase-discovery": [
    "Client kickoff meeting",
    "Site survey and measurements",
    "Brief capture and requirements gathering",
    "Budget alignment and feasibility study",
    "Programme outline and timeline",
    "Stakeholder identification",
  ].join("\n"),
  "phase-concept": [
    "Mood boards and style direction",
    "Initial space planning and layouts",
    "Key materials and finishes selection",
    "Concept presentation preparation",
    "Client concept review meeting",
    "Concept refinements",
  ].join("\n"),
  "phase-dd": [
    "Detailed floor plans and layouts",
    "Specifications and material schedules",
    "FF&E schedule and sourcing",
    "Joinery details and custom elements",
    "Lighting and electrical plans",
    "Design development sign-off",
  ].join("\n"),
  "phase-technical": [
    "Technical drawings and construction details",
    "Coordination with consultants",
    "Building regulations compliance",
    "Contractor tender documentation",
    "Issue drawings for pricing",
    "Technical specifications finalization",
  ].join("\n"),
  "phase-procurement": [
    "Issue RFQs to suppliers and contractors",
    "Compare bids and proposals",
    "Negotiate terms and pricing",
    "Issue purchase orders",
    "Track lead times and delivery schedules",
    "Confirm all POs placed",
  ].join("\n"),
  "phase-implementation": [
    "Site coordination and project management",
    "Progress monitoring and quality control",
    "Snag list capture and resolution",
    "Deliveries scheduling and coordination",
    "Practical completion inspection",
    "Client handover and final walkthrough",
  ].join("\n"),
}
