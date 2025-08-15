import type { Note } from "./notes-types"

export const mockNotes: Note[] = [
  {
    id: "n1",
    title: "Client kick-off — layout priorities",
    summary:
      "Discussed open-plan preference, kitchen island size constraints, and lighting scenes. Agreed to finalize layout v2 by next week.",
    source: "zoom",
    status: "needs_review",
    visibility: "project",
    projectId: "p1",
    eventId: "ev_101",
    linked: [{ type: "room", label: "Kitchen", id: "room_kitchen" }],
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: { id: "u1", name: "Jane Designer" },
    ai: {
      decisions: ["Use oak veneer for island panels", "Keep corridor width ≥ 42 inches"],
      actions: ["Request countertop samples", "Schedule site measure for island clearance"],
      risks: ["Lead times on lighting pendants could delay install"],
      confidence: 0.84,
    },
    attachments: [{ id: "a1", name: "call-recording.mp4", url: "#", type: "video/mp4" }],
  },
  {
    id: "n2",
    title: "Site visit — lighting rough-in check",
    summary:
      "Verified ceiling heights and noted ductwork shift. Photos captured. Bedroom dimmer orientation to be reversed.",
    source: "mobile",
    status: "published",
    visibility: "project",
    projectId: "p1",
    eventId: "ev_102",
    linked: [
      { type: "room", label: "Bedroom 1", id: "room_b1" },
      { type: "sku", label: "Pendant 3121", id: "sku_3121" },
    ],
    updatedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    author: { id: "u2", name: "Mike Chen" },
    ai: {
      decisions: ["Move pendant box 200mm east to clear beam"],
      actions: ["Confirm updated RCP with GC", "Order longer canopy kit"],
      risks: [],
    },
    attachments: [
      { id: "a2", name: "rough-in.jpg", url: "#", type: "image/jpeg" },
      { id: "a3", name: "ductwork.jpg", url: "#", type: "image/jpeg" },
    ],
  },
  {
    id: "n3",
    title: "Spec upload — fabric swatches recap",
    summary:
      "Consolidated options for sofa and lounge chair textiles. Recommendations lean toward stain-resistant performance fabrics.",
    source: "upload",
    status: "needs_review",
    visibility: "project",
    projectId: "p1",
    linked: [{ type: "contact", label: "Procurement", id: "ct_proc" }],
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    author: { id: "u3", name: "Sarah Johnson" },
    ai: {
      decisions: ["Prioritize performance velvet for sofa"],
      actions: ["Get updated quote for 18 yards", "Verify rub count ≥ 50k"],
      risks: ["Possible color variance between dye lots"],
    },
    attachments: [{ id: "a4", name: "swatches.pdf", url: "#", type: "application/pdf" }],
  },
]
