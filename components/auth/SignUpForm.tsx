/**
 * Sign Up Form Component for BuffrSign
 * 
 * This component provides a comprehensive sign up form with support for
 * email/password registration and Google OAuth.
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/contexts/auth-context';
import { SignUpCredentials } from '@/lib/auth/types';
import { validateSignUpCredentials } from '@/lib/auth/utils';
import { Loader2, Eye, EyeOff, Mail, Lock, User, Building, Phone } from 'lucide-react';

interface SignUpFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showSocialAuth?: boolean;
  className?: string;
}

export function SignUpForm({ 
  onSuccess, 
  onError, 
  showSocialAuth = true,
  className = ""
}: SignUpFormProps) {
  const { signUp, signInWithGoogle, loading } = useAuth();
  const [formData, setFormData] = useState<SignUpCredentials>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof SignUpCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Validate form data
      const validationErrors = validateSignUpCredentials(formData);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map(error => error.message);
        setErrors(errorMessages);
        onError?.(errorMessages.join(', '));
        return;
      }

      // Attempt sign up
      const result = await signUp(formData);
      
      if (result.error) {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Sign up failed';
        setErrors([errorMessage]);
        onError?.(errorMessage);
      } else {
        onSuccess?.();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors([errorMessage]);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsSubmitting(true);
      const result = await signInWithGoogle();
      
      if (result.error) {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Google sign up failed';
        setErrors([errorMessage]);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign up failed';
      setErrors([errorMessage]);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Join BuffrSign</CardTitle>
        <CardDescription className="text-center">
          Create your BuffrSign account to start signing documents
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {errors.length > 0 && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="first_name"
                  type="text"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Company Name Field */}
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name (Optional)</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="company_name"
                type="text"
                placeholder="Your Company"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+264 81 123 4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Sign Up Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Social Authentication */}
          {showSocialAuth && (
            <>
              <div className="flex items-center w-full">
                <Separator className="flex-1" />
                <span className="mx-2 text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>

              {/* Google Sign Up */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
