"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileSignature, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/contexts/auth-context';
import { LoginCredentials } from '@/lib/auth/types';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { signIn, loading, user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const credentials: LoginCredentials = {
        email,
        password,
      };

      const { error } = await signIn(credentials);
      
      if (error) {
        setError(error);
      } else {
        setSuccess('Login successful! Redirecting...');
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push('/protected');
        }, 1000);
      }
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      // TODO: Implement password reset
      setSuccess('Password reset email sent! Check your inbox.');
    } catch {
      setError('Failed to send password reset email. Please try again.');
    }
  };

  // Redirect if already logged in
  if (user) {
    router.push('/protected');
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
          Welcome back to BuffrSign
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Sign in to your account to continue
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
              Remember me
            </span>
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Don&apos;t have an account?{' '}
          <a
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
          >
            Sign up for free
          </a>
        </p>
      </div>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Demo Credentials:</p>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Email: demo@buffrsign.com<br />
          Password: Demo123!
        </p>
      </div>
    </Card>
  );
}
