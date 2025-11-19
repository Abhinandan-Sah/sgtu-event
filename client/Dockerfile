# Multi-stage Dockerfile for SGTU Event Management Client (Next.js)
# Production-ready with optimizations

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

# Install security updates
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Stage 2: Build
FROM node:20-alpine AS build

# Install security updates
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

# Metadata labels
LABEL maintainer="SGTU Event Management Team" \
      version="1.0.0" \
      description="SGTU Event Management Client - Production Ready" \
      org.opencontainers.image.source="https://github.com/Abhinandan-Sah/sgtu-event"

# Install security updates and required packages
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache \
    dumb-init \
    curl \
    tini && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

WORKDIR /app

# Copy necessary files from build stage
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    TZ=Asia/Kolkata

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/hello || exit 1

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start Next.js server
CMD ["node", "server.js"]
