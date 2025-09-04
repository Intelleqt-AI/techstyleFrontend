'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsPageHeader } from '@/components/settings/page-header';
import { SettingsSection } from '@/components/settings/section';
import useUser from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import { updateUser } from '@/supabase/API';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function UserProfilePage() {
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
    <>
      <SettingsPageHeader title="Profile" description="Update your personal information." />

      <SettingsSection title="Basic information" description="This will be visible to your team.">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={e => handleSubmit(e)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              value={currentUser?.name}
              onChange={value => {
                const e = {
                  target: {
                    name: 'name',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              id="name"
              placeholder="Jane Designer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              onChange={value => {
                const e = {
                  target: {
                    name: 'title',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              value={currentUser?.title}
              id="title"
              placeholder="Senior Interior Designer"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input readOnly value={currentUser?.email} id="email" type="email" placeholder="jane@techstyles.com" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" size="sm">
              Save changes
            </Button>
          </div>
        </form>
      </SettingsSection>
    </>
  );
}
