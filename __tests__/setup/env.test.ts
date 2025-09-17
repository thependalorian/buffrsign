/**
 * Environment Configuration Tests
 * Tests that all required environment variables are properly loaded
 */

describe('Environment Configuration', () => {
  describe('Supabase Configuration', () => {
    it('should have Supabase URL configured', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^https:\/\/.*\.supabase\.co$/)
    })

    it('should have Supabase anon key configured', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toMatch(/^eyJ/)
    })

    it('should have service role key configured', () => {
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined()
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toMatch(/^eyJ/)
    })
  })

  describe('Database Configuration', () => {
    it('should have database URL configured', () => {
      expect(process.env.DATABASE_URL).toBeDefined()
      expect(process.env.DATABASE_URL).toMatch(/^postgresql:\/\//)
    })

    it('should have Supabase database URL configured', () => {
      expect(process.env.SUPABASE_DATABASE_URL).toBeDefined()
      expect(process.env.SUPABASE_DATABASE_URL).toMatch(/^postgresql:\/\//)
    })
  })

  describe('AI Services Configuration', () => {
    it('should have OpenAI API key configured', () => {
      expect(process.env.OPENAI_API_KEY).toBeDefined()
      expect(process.env.LLM_API_KEY).toBeDefined()
    })

    it('should have AI features enabled', () => {
      expect(process.env.ENABLE_AI_FEATURES).toBe('true')
      expect(process.env.ENABLE_DOCUMENT_INTELLIGENCE).toBe('true')
    })

    it('should have embedding configuration', () => {
      expect(process.env.EMBEDDING_MODEL).toBeDefined()
      expect(process.env.EMBEDDING_PROVIDER).toBeDefined()
    })
  })

  describe('Security Configuration', () => {
    it('should have JWT secret configured', () => {
      expect(process.env.JWT_SECRET).toBeDefined()
      expect(process.env.JWT_SECRET.length).toBeGreaterThanOrEqual(32)
    })

    it('should have encryption key configured', () => {
      expect(process.env.ENCRYPTION_KEY).toBeDefined()
    })

    it('should have proper hash salt rounds', () => {
      expect(process.env.HASH_SALT_ROUNDS).toBeDefined()
      expect(parseInt(process.env.HASH_SALT_ROUNDS)).toBeGreaterThanOrEqual(10)
    })
  })

  describe('Redis Configuration', () => {
    it('should have Redis configuration', () => {
      expect(process.env.REDIS_HOST).toBeDefined()
      expect(process.env.REDIS_PORT).toBeDefined()
      expect(process.env.REDIS_PASSWORD).toBeDefined()
    })
  })

  describe('File Upload Configuration', () => {
    it('should have file upload limits configured', () => {
      expect(process.env.MAX_FILE_SIZE).toBeDefined()
      expect(parseInt(process.env.MAX_FILE_SIZE)).toBeGreaterThan(0)
    })

    it('should have upload directory configured', () => {
      expect(process.env.UPLOAD_DIR).toBeDefined()
    })
  })
})