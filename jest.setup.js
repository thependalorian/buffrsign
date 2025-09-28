import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder for Jest JSDOM environment
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock crypto for randomUUID
global.crypto = {
  ...global.crypto,
  randomUUID: jest.fn(() => 'mock-random-uuid'),
};

// Mock the global File object for tests that interact with file uploads
global.File = class MockFile {
  constructor(fileBits, fileName, options) {
    this.name = fileName;
    this.lastModified = options?.lastModified || Date.now();
    this.size = options?.size || fileBits.join('').length; // Default size to content length
    this.type = options?.type || 'application/octet-stream'; // Default type
    this._fileBits = fileBits; // Store fileBits to create ArrayBuffer from
  }

  // Mock the arrayBuffer method
  async arrayBuffer() {
    // Simulate creating an ArrayBuffer from fileBits
    const text = this._fileBits.join('');
    const encoder = new TextEncoder();
    return encoder.encode(text).buffer;
  }
};

// Mock Next.js server components globally
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    json: jest.fn(async () => JSON.parse(init.body)),
    headers: new Headers(init.headers),
    cookies: {
      get: jest.fn((name) => ({
        value: `mock-${name}-cookie-value`
      }))
    }
  })),
  NextResponse: jest.fn().mockImplementation((body, init) => ({
    json: jest.fn(async () => JSON.parse(body)),
    status: init.status,
    headers: new Headers(init.headers)
  })),
}));