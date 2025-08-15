export interface Phase {
  id: string
  name: string
  color: string
}

export interface WorkPackage {
  id: string
  name: string
  defaultRole?: string
}

export const DefaultRoles = [
  "Lead Designer",
  "Project Manager",
  "Operations",
  "Contractor",
  "Consultant",
  "Client",
  "Electrician",
  "Plumber",
  "HVAC",
  "Joinery",
  "Painter / Decorator",
  "Flooring",
  "Tiling",
  "Lighting Supplier",
  "AV / IT",
  "Landscaping",
]
