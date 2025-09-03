export type Phase = {
  id: string;
  name: string;
  color: string; // hex
};

export type WorkPackage = {
  id: string;
  name: string;
  defaultRole?: string; // optional contractor role
};

// A small, opinionated set of contractor roles commonly assigned to work packages.
// You can extend this in the UI without changing code.
export const DefaultRoles: string[] = [
  'General Contractor',
  'Electrician',
  'Plumber',
  'HVAC',
  'Carpentry',
  'Joinery',
  'Painter / Decorator',
  'Flooring',
  'Tiling',
  'Lighting Supplier',
  'AV / IT',
  'Landscaping',
];
