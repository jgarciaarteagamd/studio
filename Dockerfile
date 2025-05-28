# Dockerfile for Next.js with output: 'standalone'

# 1. Base image
FROM node:18-alpine AS base

# 2. Install dependencies only when package.json changes
FROM base AS deps
# What you should config.
ENV YARN_CACHE_FOLDER=/root/.cache/yarn
# Prevent build from running as root.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

WORKDIR /app
COPY --chown=nextjs:nodejs package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile --cache-folder $YARN_CACHE_FOLDER; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 3. Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

# This will leverage the `output: 'standalone'` in next.config.js
# It creates a .next/standalone folder with a minimal server and necessary files.
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 4. Production image, copy only the standalone output
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Create a non-root user and group for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone folder, static assets and public folder
# from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set the user to the non-root user
USER nextjs

EXPOSE 3000

# The `server.js` file is created by `output: 'standalone'`
CMD ["node", "server.js"]
