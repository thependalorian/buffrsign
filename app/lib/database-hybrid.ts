// lib/database-hybrid.ts
import { createClient } from '@supabase/supabase-js'
import { neon } from '@neondatabase/serverless'
import neo4j from 'neo4j-driver'

// Types
interface LoanData {
  id?: string;
  amount: number;
  interest_rate: number;
  term_months: number;
  borrower_id: string;
  created_at?: string;
}

// Primary database clients
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const neonClient = neon(process.env.NEON_DATABASE_URL!)
export const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
)

// Hybrid database service with fallback
export class HybridDatabaseService {
  private fallbackEnabled: boolean = true
  
  // Primary TypeScript operations
  async createLoan(loanData: LoanData) {
    try {
      // Try TypeScript/Supabase first
      const { data, error } = await supabase
        .from('loans')
        .insert(loanData)
        .select()
      
      if (error) throw error
      return data
    } catch (error) {
      if (this.fallbackEnabled) {
        // Fallback to Python backend
        return await this.fallbackToPython('create_loan', loanData)
      }
      throw error
    }
  }
  
  // Fallback to Python backend
  private async fallbackToPython(operation: string, data: any) {
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/${operation}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`Python backend fallback failed: ${response.statusText}`)
    }
    
    return await response.json()
  }
}