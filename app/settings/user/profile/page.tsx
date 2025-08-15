'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SettingsPageHeader } from '@/components/settings/page-header'
import { SettingsSection } from '@/components/settings/section'

export default function UserProfilePage() {
  return (
    <>
      <SettingsPageHeader
        title="Profile"
        description="Update your personal information."
      />

      <SettingsSection title="Basic information" description="This will be visible to your team.">
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Jane Designer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Senior Interior Designer" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jane@techstyles.com" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" size="sm">Save changes</Button>
          </div>
        </form>
      </SettingsSection>
    </>
  )
}
