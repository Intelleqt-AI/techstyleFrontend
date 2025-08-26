'use client';

import { saveSettings } from '@/app/settings/actions';
import { Section } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useActionState } from '@/hooks/useActionState';

export default function StudioGeneralPage() {
  const { toast } = useToast();
  const [state, formAction, pending] = useActionState(saveSettings as any, null);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Studio settings</h1>
        <p className="text-sm text-gray-600">Organization-wide configuration for Techstyles Studio.</p>
      </div>

      <Section title="General" description="Studio name, contact details, and address.">
        <form
          action={async fd => {
            fd.set('section', 'Studio General');
            const res = await (formAction as any)(fd);
            if (res?.success) toast({ title: 'Saved', description: 'Studio general settings saved.' });
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label htmlFor="studioName">Studio name</Label>
            <Input id="studioName" name="studioName" defaultValue="Techstyles" />
          </div>
          <div>
            <Label htmlFor="studioEmail">Support email</Label>
            <Input id="studioEmail" name="studioEmail" type="email" defaultValue="support@techstyles.com" />
          </div>
          <div>
            <Label htmlFor="studioPhone">Phone</Label>
            <Input id="studioPhone" name="studioPhone" defaultValue="+1 (555) 123-4567" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" placeholder="Street, City, State, Zip, Country" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button disabled={pending}>{pending ? 'Saving...' : 'Save general'}</Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
