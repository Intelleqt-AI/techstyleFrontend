"use client"

import { useState } from "react"
import { Section } from "@/components/settings/section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createApiKey, revokeApiKey } from "@/app/settings/actions"
import { Badge } from "@/components/ui/badge"

type ApiKey = { id: string; token: string; createdAt: string; lastUsed?: string }

export default function ApiPage() {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: "k1", token: "tsk_••••_a1b2", createdAt: "2025-06-01", lastUsed: "2025-08-01" },
  ])
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    setCreating(true)
    const res = await createApiKey(new FormData())
    if (res?.success && res.token) {
      setKeys((prev) => [
        ...prev,
        { id: `k_${Date.now()}`, token: mask(res.token), createdAt: new Date().toISOString().slice(0, 10) },
      ])
    }
    setCreating(false)
  }

  function mask(token: string) {
    return token.slice(0, 4) + "••••" + token.slice(-4)
  }

  async function handleRevoke(id: string) {
    await revokeApiKey(new FormData())
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">API & webhooks</h1>
        <p className="text-sm text-gray-600">Manage API keys and webhook endpoints.</p>
      </div>

      <Section title="API keys" description="Create and revoke API tokens for programmatic access.">
        <div className="flex justify-end">
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Creating..." : "Create key"}
          </Button>
        </div>
        <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.token}</TableCell>
                  <TableCell>{k.createdAt}</TableCell>
                  <TableCell>{k.lastUsed || <Badge className="bg-gray-100 text-gray-900">Never</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleRevoke(k.id)}>
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {keys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    No API keys yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Webhooks" description="Receive real-time events in your systems.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Endpoint URL</Label>
            <Input id="webhookUrl" placeholder="https://example.com/webhooks/techstyles" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookSecret">Signing secret</Label>
            <Input id="webhookSecret" type="password" placeholder="whsec_••••••••" />
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline">Send test event</Button>
        </div>
      </Section>
    </div>
  )
}
