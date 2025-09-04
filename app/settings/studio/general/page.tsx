'use client';

import { saveSettings } from '@/app/settings/actions';
import { Section } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useActionState } from '@/hooks/useActionState';
import useUser from '@/hooks/useUser';
import { updateUser } from '@/supabase/API';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StudioGeneralPage() {
  const { user, isLoading } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoading) return;
    setCurrentUser(user);
  }, [user?.email, isLoading]);

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users', user?.email]);
      toast.success('Profile Updated');
    },
    onError: error => {
      console.log(error);
      toast('Error! Try again');
    },
  });

  const handleUpdate = e => {
    const { name, value } = e.target;
    console.log(name, value);
    setCurrentUser(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate(currentUser);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Studio settings</h1>
        <p className="text-sm text-gray-600">Organization-wide configuration for Techstyles Studio.</p>
      </div>

      <Section title="General" description="Studio name, contact details, and address.">
        <form onSubmit={e => handleSubmit(e)} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="studioName">Studio name</Label>
            <Input
              value={currentUser?.studioName}
              id="studioName"
              name="studioName"
              onChange={value => {
                const e = {
                  target: {
                    name: 'studioName',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              defaultValue="Techstyles"
            />
          </div>
          <div>
            <Label htmlFor="studioEmail">Support email</Label>
            <Input
              value={currentUser?.studioEmail}
              onChange={value => {
                const e = {
                  target: {
                    name: 'studioEmail',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              id="studioEmail"
              name="studioEmail"
              type="email"
              defaultValue="support@techstyles.com"
            />
          </div>
          <div>
            <Label htmlFor="studioPhone">Phone</Label>
            <Input
              onChange={value => {
                const e = {
                  target: {
                    name: 'studioPhone',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              value={currentUser?.studioPhone}
              id="studioPhone"
              name="studioPhone"
              defaultValue="+1 (555) 123-4567"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="studioAddress">Address</Label>
            <Textarea
              onChange={value => {
                const e = {
                  target: {
                    name: 'studioAddress',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              value={currentUser?.studioAddress}
              id="studioAddress"
              name="studioAddress"
              placeholder="Street, City, State, Zip, Country"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button>Save</Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
