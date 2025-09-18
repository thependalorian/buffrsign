#!/bin/bash

# Custom Vercel build script to ensure all dependencies are properly installed
echo "Starting custom Vercel build process..."

# Install dependencies with legacy peer deps to avoid conflicts
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Verify tailwindcss is installed
echo "Verifying tailwindcss installation..."
npm list tailwindcss

# Run the build
echo "Running Next.js build..."
npm run build

echo "Build completed successfully!"
