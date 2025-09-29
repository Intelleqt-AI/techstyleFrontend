'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import supabase from '@/supabase/supabaseClient';
import { useState } from 'react';
import { toast } from 'sonner';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Email validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  // Password validation
  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character (@$!%*?&)';

    return undefined;
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return undefined;
  };

  // Validate all fields
  const validateForm = (data: FormData): FormErrors => {
    return {
      email: validateEmail(data.email),
      password: validatePassword(data.password),
      confirmPassword: validateConfirmPassword(data.confirmPassword, data.password),
    };
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Validate in real-time if field has been touched
    if (touched[field]) {
      const newErrors = validateForm(newFormData);
      setErrors(newErrors);
    }
  };

  // Handle input blur (mark as touched)
  const handleInputBlur = (field: keyof FormData) => {
    setTouched({ ...touched, [field]: true });
    const newErrors = validateForm(formData);
    setErrors(newErrors);
  };

  // Check if form is valid
  const isFormValid = () => {
    const formErrors = validateForm(formData);
    return !formErrors.email && !formErrors.password && !formErrors.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    toast.warning('Registration disabled . Contact administrator for details');
    return;
    e.preventDefault();
    // Mark all fields as touched
    setTouched({ email: true, password: true, confirmPassword: true });

    // Validate form
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    // Check if there are any errors
    if (formErrors.email || formErrors.password || formErrors.confirmPassword) {
      return;
    }

    setIsLoading(true);
    // Disables
    try {
      // Register user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `https://techstyle-frontend-7hvj.vercel.app/?onboarding=true`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: 'Registration successful!',
          description: 'Please check your email to verify your account.',
          variant: 'default',
        });

        // Set session data for email verification authorization
        sessionStorage.setItem('pendingEmailVerification', 'true');
        sessionStorage.setItem('pendingVerificationEmail', formData.email);

        // Simulate successful registration and navigate to verify-email
        const state = {
          fromRegister: true,
          email: formData.email,
        };

        window.history.pushState(state, '', '/verify-email');

        // Navigate to a confirmation page or login
        router.push('/verify-email');
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle specific Supabase errors
      let errorMessage = 'Registration failed. Please try again.';

      if (error.message) {
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        } else if (error.message.includes('Password should be')) {
          errorMessage = error.message;
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">Enter your credentials to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  onBlur={() => handleInputBlur('email')}
                  className={`pl-10 ${errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
              {errors.email && touched.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  onBlur={() => handleInputBlur('password')}
                  className={`pl-10 ${errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
              {errors.password && touched.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleInputBlur('confirmPassword')}
                  className={`pl-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
              {errors.confirmPassword && touched.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={isLoading || !isFormValid()}>
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>

            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <button type="button" className="font-bold  underline" onClick={() => router.push('/login')}>
                Login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
