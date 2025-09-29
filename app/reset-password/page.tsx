'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import supabase from '@/supabase/supabaseClient';
import { updatePassword } from '@/supabase/API';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [errors, setErrors] = useState({});
  const route = useRouter();

  // Check if user has valid reset sessions
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Supabase uses URL fragments (#) for auth tokens after verification
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        // Check both hash and search params
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const type = hashParams.get('type') || searchParams.get('type');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');

        console.log('Hash params:', window.location.hash);
        console.log('Search params:', window.location.search);
        console.log('Extracted tokens:', { accessToken, type, refreshToken });

        if (accessToken && type === 'recovery') {
          // Set the session with the tokens from URL
          if (refreshToken) {
            try {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              console.log('Session set result:', { data, error });

              if (error) {
                console.error('Failed to set session:', error);
                setIsValidSession(false);
              } else {
                setIsValidSession(true);
              }
            } catch (sessionError) {
              console.error('Session error:', sessionError);
              setIsValidSession(false);
            }
          } else {
            // Even without refresh token, if we have access token and type=recovery, allow reset
            setIsValidSession(true);
          }
        } else {
          console.log('Missing required tokens or wrong type');
          setIsValidSession(false);
        }
        setIsCheckingSession(false);
      } catch (error) {
        console.error('Session check error:', error);
        toast.error('Failed to verify reset link');
        setIsValidSession(false);
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  // Password strength checker
  useEffect(() => {
    const checkStrength = password => {
      setPasswordStrength({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    };

    if (newPassword) {
      checkStrength(newPassword);
    }
  }, [newPassword]);

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        toast.error('Failed to update password: ' + error.message);
      } else {
        toast.success('Password updated successfully! You can now log in with your new password.');
        route.push('/login');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Reset Link</CardTitle>
            <CardDescription>This password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <p className="text-sm text-gray-600">Please request a new password reset link from the login page.</p>
              <Button onClick={() => route.push('/login')} className="w-full">
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={errors.newPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Password Requirements:</Label>
                <div className="space-y-1">
                  {Object.entries({
                    length: 'At least 8 characters',
                    uppercase: 'One uppercase letter',
                    lowercase: 'One lowercase letter',
                    number: 'One number',
                    special: 'One special character',
                  }).map(([key, text]) => (
                    <div key={key} className="flex items-center space-x-2">
                      {passwordStrength[key] ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                      <span className={`text-sm ${passwordStrength[key] ? 'text-green-600' : 'text-red-600'}`}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={isLoading || !isPasswordStrong}>
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => route.push('/login')}
                className="text-sm text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
