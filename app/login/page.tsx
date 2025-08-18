'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { resetPassword, signInWithEmail } from '@/supabase/API';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) {
        toast.error('Invalid credentials');
        return;
      }
      if (data) {
        router.push('/');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResetting(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast.error('Failed to send reset email. Please try again.');
      } else {
        toast.success('Password reset email sent! Check your inbox.');
        setIsResetMode(false);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isResetMode ? 'Reset Password' : 'Welcome back'}</CardTitle>
          <CardDescription>
            {isResetMode ? 'Enter your email to receive a password reset link' : 'Enter your credentials to access your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isResetMode ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => setIsResetMode(true)} className="text-sm underline">
                  Forgot your password?
                </button>
              </div>
              <p className="text-sm text-center">
                Don&apos;t have an account?{' '}
                <Link className="font-bold underline" href="/register">
                  Sign up
                </Link>
              </p>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handlePasswordReset}>
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isResetting}>
                {isResetting ? 'Sending...' : 'Send Reset Email'}
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => setIsResetMode(false)} className="text-sm underline">
                  Back to login
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
