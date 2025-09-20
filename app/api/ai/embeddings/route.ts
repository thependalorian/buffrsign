// BuffrSign Platform - Embeddings API Route
// Generates embeddings using OpenAI to match Python backend

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// ============================================================================
// OPENAI CLIENT CONFIGURATION
// ============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// EMBEDDINGS API ROUTE
// ============================================================================

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Generate embedding using OpenAI
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Same as Python backend
      input: text,
    });

    const embedding = response.data[0].embedding;

    return NextResponse.json({
      success: true,
      embedding,
      model: 'text-embedding-3-small',
      usage: response.usage,
    });

  } catch {
    console.error('Embeddings API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}
