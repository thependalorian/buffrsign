# BuffrSign Frontend Dockerfile
# Multi-stage build for optimized Next.js production deployment

# =============================================================================
# DEPENDENCIES STAGE
# =============================================================================
FROM node:20-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# =============================================================================
# BUILDER STAGE
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# =============================================================================
# RUNNER STAGE
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/temp \
    && chown -R nextjs:nodejs /app/logs /app/uploads /app/temp

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set port environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]

# =============================================================================
# DEVELOPMENT STAGE
# =============================================================================
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/temp

# Expose port
EXPOSE 3000

# Set environment variables for development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Start development server
CMD ["npm", "run", "dev"]

# =============================================================================
# TESTING STAGE
# =============================================================================
FROM node:20-alpine AS testing

WORKDIR /app

# Install dependencies including dev dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for testing
ENV NODE_ENV=test
ENV NEXT_TELEMETRY_DISABLED=1

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/temp

# Run tests
CMD ["npm", "run", "test"]
