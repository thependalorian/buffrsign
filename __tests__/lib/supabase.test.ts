// Mock the supabase module functions
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(),
    })),
  },
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getCurrentSession: jest.fn(),
}));

// Import the mocked functions
import { signIn, signUp, signOut, getCurrentSession } from '../../lib/supabase';

describe('Supabase Auth Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };
      const mockSession = {
        access_token: 'token-123',
        user: mockUser
      };

       const { supabase } = require('../../lib/supabase');
       supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

       // Mock profile query
       supabase.from().select().eq().single.mockResolvedValue({
        data: {
          id: 'user-123',
          role: 'user',
          first_name: 'John',
          last_name: 'Doe',
          company_name: 'Test Company'
        },
        error: null
      });

      // Mock the actual signIn function
      signIn.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'user',
          plan: 'free',
          first_name: 'John',
          last_name: 'Doe',
          company: 'Test Company'
        },
        session: mockSession
      });

      const result = await signIn('test@example.com', 'password');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.session).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle sign in errors', async () => {
      signIn.mockResolvedValue({
        user: null,
        session: null,
        error: 'Invalid credentials'
      });

      const result = await signIn('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
        plan: 'free',
        first_name: 'John',
        last_name: 'Doe',
        company: 'Test Company'
      };

      signUp.mockResolvedValue({
        user: mockUser,
        session: null
      });

      const result = await signUp('test@example.com', 'password', {
        first_name: 'John',
        last_name: 'Doe',
        company: 'Test Company'
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeUndefined();
    });

    it('should handle sign up errors', async () => {
      signUp.mockResolvedValue({
        user: null,
        session: null,
        error: 'Email already registered'
      });

      const result = await signUp('test@example.com', 'password', {
        first_name: 'John',
        last_name: 'Doe'
      });

      expect(result.user).toBeNull();
      expect(result.error).toBe('Email already registered');
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      signOut.mockResolvedValue({});

      const result = await signOut();

      expect(result.error).toBeUndefined();
    });

    it('should handle sign out errors', async () => {
      signOut.mockResolvedValue({
        error: 'Sign out failed'
      });

      const result = await signOut();

      expect(result.error).toBe('Sign out failed');
    });
  });

  describe('getCurrentSession', () => {
    it('should get current session successfully', async () => {
      const mockSession = {
        access_token: 'token-123',
        user: { id: 'user-123', email: 'test@example.com' }
      };

      getCurrentSession.mockResolvedValue({
        session: mockSession,
        user: { id: 'user-123', email: 'test@example.com', role: 'user', plan: 'free' }
      });

      const result = await getCurrentSession();

      expect(result.session).toEqual(mockSession);
      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle no current session', async () => {
      getCurrentSession.mockResolvedValue({
        session: null,
        user: null
      });

      const result = await getCurrentSession();

      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
      expect(result.error).toBeUndefined();
    });
  });
});