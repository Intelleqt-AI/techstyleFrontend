import { Section } from "@/components/settings/section"
import { PermissionsMatrix } from "@/components/settings/permissions-matrix"

export default function RolesPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Roles & permissions</h1>
        <p className="text-sm text-gray-600">Define granular access for members across the workspace.</p>
      </div>

      <Section title="Permissions matrix" description="Customize permissions for each role.">
        <PermissionsMatrix />
      </Section>
    </div>
  )
}
