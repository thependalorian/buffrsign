"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileSignature, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/contexts/auth-context';
import { SignUpCredentials } from '@/lib/auth/types';

export function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { signUp, loading, user: _user } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    const credentials: SignUpCredentials = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      company_name: formData.companyName.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      role: 'user',
    };

    try {
      const { error: signUpError } = await signUp(credentials);
      
      if (signUpError) {
        setError(signUpError || 'Sign up failed. Please try again.');
        return;
      }

      setSuccess('Account created successfully! Please check your email to verify your account.');
      
      // Redirect to login after successful signup
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error:', err);
    }
  };

  // Redirect if already logged in
  if (_user) {
    router.push('/protected/dashboard');
    return null;
  }

  return (
    <Card className="p-8 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
          <FileSignature className="w-7 h-7 text-white" />
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create your BuffrSign account
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Start signing documents in minutes
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name *
            </Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name *
            </Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@company.com"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Company Name
          </Label>
          <Input
            id="companyName"
            name="companyName"
            type="text"
            placeholder="Your Company Ltd"
            value={formData.companyName}
            onChange={handleInputChange}
            className="w-full"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+264 81 123 4567"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password *
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full pr-10"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password *
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full pr-10"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            disabled={loading}
          />
          <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
            I agree to the{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
              Privacy Policy
            </a>
          </label>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <a
            href="/auth/login"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
          >
            Sign in
          </a>
        </p>
      </div>
    </Card>
  );
}
