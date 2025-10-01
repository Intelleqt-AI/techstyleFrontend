'use client';

import React, { useState } from 'react';
import { saveSettings } from '@/app/settings/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Section } from '@/components/settings/section';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useActionState } from '@/hooks/useActionState';
import supabase from '@/supabase/supabaseClient';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import useUser from '@/hooks/useUser';

export default function UserSecurityPage() {
  const [state, formAction, pending] = useActionState(saveSettings as any, null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password: string) => {
    const minLength = /.{6,}/;
    const hasUppercase = /[A-Z]/;
    const hasNumber = /\d/;
    return minLength.test(password) && hasUppercase.test(password) && hasNumber.test(password);
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(e.currentTarget);
    const current = formData.get('current') as string;
    const newPass = formData.get('new') as string;
    const confirm = formData.get('confirm') as string;

    if (!current || !newPass || !confirm) {
      toast.error('All fields are required.');
      return;
    }

    if (newPass !== confirm) {
      toast.error('New passwords do not match.');
      return;
    }

    if (!validatePassword(newPass)) {
      toast.error('Password must be at least 6 characters, include one uppercase letter and one number.');
      return;
    }

    try {
      setLoading(true);

      // Reauthenticate current password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? '',
        password: current,
      });

      if (signInError) {
        toast.error('Current password is incorrect.');
        return;
      }

      // Update password if reauthentication succeeded
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPass,
      });

      if (updateError) throw updateError;

      toast.success('Password updated successfully!');
      form.reset();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong while updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Security</h1>
        <p className="text-sm text-gray-600">Protect your account by updating your password and enabling 2FA.</p>
      </div>

      {/* ---------- Password Section ---------- */}
      <Section title="Password" description="Use a strong password you don’t reuse elsewhere.">
        <form onSubmit={handlePasswordChange} className="grid gap-4 sm:grid-cols-2">
          {['current', 'new', 'confirm'].map(field => (
            <div key={field} className="relative">
              <Label htmlFor={field}>
                {field === 'current' ? 'Current password' : field === 'new' ? 'New password' : 'Confirm new password'}
              </Label>
              <Input
                id={field}
                name={field}
                type={showPassword[field as keyof typeof showPassword] ? 'text' : 'password'}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(field as any)}
                className="absolute right-3 top-[35px] text-gray-500 hover:text-gray-700"
              >
                {showPassword[field as keyof typeof showPassword] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          ))}
          <div className="sm:col-span-2 flex justify-end">
            <Button disabled={loading}>{loading ? 'Saving...' : 'Update password'}</Button>
          </div>
        </form>
      </Section>

      {/* ---------- 2FA Section ---------- */}
      <Section title="Two-factor authentication" description="Add an extra layer of security to your account.">
        <form
          action={async fd => {
            fd.set('section', 'Two-factor authentication');
            const res = await (formAction as any)(fd);
            if (res?.success) toast({ title: 'Saved', description: '2FA preference updated.' });
          }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <div className="font-medium text-gray-900">Authenticator app</div>
              <div className="text-sm text-gray-600">Use an app to generate verification codes.</div>
            </div>
            <Switch name="auth_app" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <div className="font-medium text-gray-900">SMS backup codes</div>
              <div className="text-sm text-gray-600">Send codes to your phone if you lose access.</div>
            </div>
            <Switch name="sms_backup" />
          </div>
          <div className="flex justify-end">
            <Button disabled={pending}>{pending ? 'Saving...' : 'Save 2FA settings'}</Button>
          </div>
        </form>
      </Section>

      {/* ---------- Active Sessions Section ---------- */}
      <Section title="Active sessions" description="Sign out devices you don’t recognize.">
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { device: 'MacBook Pro • Safari', loc: 'New York, US', last: '2 mins ago' },
                { device: 'iPhone 15 • Mobile Safari', loc: 'New York, US', last: 'Yesterday' },
              ].map(s => (
                <TableRow key={s.device}>
                  <TableCell className="font-medium">{s.device}</TableCell>
                  <TableCell>{s.loc}</TableCell>
                  <TableCell>{s.last}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Sign out
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>
    </div>
  );
}
