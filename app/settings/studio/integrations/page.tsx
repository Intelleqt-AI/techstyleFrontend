'use client';

import { useState } from 'react';
import { Section } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, PlugZap, ExternalLink } from 'lucide-react';
import GmailIntegration from '@/components/settings/GmailIntegration';

type Integration = {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected';
  fields?: { key: string; label: string; placeholder?: string }[];
};

const initial: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payments and invoicing.',
    status: 'disconnected',
    fields: [{ key: 'apiKey', label: 'Secret key', placeholder: 'sk_live_...' }],
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync invoices and expenses.',
    status: 'disconnected',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Channel notifications and mentions.',
    status: 'connected',
    fields: [{ key: 'botToken', label: 'Bot token', placeholder: 'xoxb-...' }],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync docs and knowledge base.',
    status: 'disconnected',
    fields: [{ key: 'integrationToken', label: 'Integration token' }],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows between apps.',
    status: 'disconnected',
  },
];

export default function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>(initial);
  const [openId, setOpenId] = useState<string | null>(null);

  function saveIntegration() {
    setItems(prev => prev.map(i => (i.id === openId ? { ...i, status: 'connected' } : i)));
    setOpenId(null);
  }

  function disconnect(id: string) {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, status: 'disconnected' } : i)));
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-600">Connect Techstyles Studio to your tools.</p>
      </div>

      <Section title="Available integrations" description="Connect, configure, and manage integrations.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(i => (
            <Card key={i.id} className="border-gray-200">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-900">{i.name}</span>
                  <Badge variant={i.status === 'connected' ? 'default' : 'secondary'} className="capitalize">
                    {i.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">{i.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                {i.status === 'connected' ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Connected</span>
                    </div>
                    <Button variant="outline" onClick={() => disconnect(i.id)}>
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Dialog open={openId === i.id} onOpenChange={open => setOpenId(open ? i.id : null)}>
                    <DialogTrigger asChild>
                      <Button>Connect</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <PlugZap className="h-5 w-5 text-gray-600" />
                          Connect {i.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {(i.fields || []).map(f => (
                          <div key={f.key} className="space-y-1">
                            <Label htmlFor={`${i.id}-${f.key}`}>{f.label}</Label>
                            <Input id={`${i.id}-${f.key}`} placeholder={f.placeholder} />
                          </div>
                        ))}
                        <a
                          href="https://vercel.com/integrations"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gray-500 underline"
                        >
                          Learn more <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenId(null)}>
                          Cancel
                        </Button>
                        <Button onClick={saveIntegration}>Connect</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}

          <GmailIntegration />
        </div>
      </Section>
    </div>
  );
}
