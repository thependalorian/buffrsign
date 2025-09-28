import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider, useAuth } from '../../lib/auth-context'

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getCurrentSession: jest.fn(),
  refreshSession: jest.fn(),
}))

// Import mocked functions
import { signIn, signUp, signOut, getCurrentSession, refreshSession } from '../../lib/supabase'

// Test component to access auth context
const TestComponent = () => {
  const { _user, loading, signIn, signOut } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="_user">{_user ? _user.email : 'No User'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getCurrentSession to return no _user by default
    getCurrentSession.mockResolvedValue({
      session: null,
      _user: null
    });
  });

  it('should provide auth context to children', () => {
    act(() => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
    })

    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByTestId('_user')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('should handle initial loading state', () => {
    act(() => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
    })

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
  })

  it('should handle no _user state', async () => {
    act(() => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('_user')).toHaveTextContent('No User')
    })
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      act(() => {
        render(<TestComponent />)
      })
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })
})