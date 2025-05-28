
# Dockerfile for MedLog - Next.js Application

# ---- Base Stage ----
# Use an official Node.js runtime as a parent image.
# Alpine Linux is used for its small size.
FROM node:18-alpine AS base

# Set the working directory in the container.
WORKDIR /app

# ---- Dependencies Stage ----
# Install dependencies. This layer is cached and only rebuilt if package.json or lock files change.
FROM base AS deps
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ---- Builder Stage ----
# Copy source code and build the Next.js application.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variable for Next.js build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# ---- Runner Stage (Final Production Image) ----
# Create a new, smaller image for running the application.
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# If you are using the Next.js standalone output mode (output: 'standalone' in next.config.ts),
# uncomment the following lines and remove the ones after them.
# COPY --from=builder /app/public ./public
# COPY --from=builder --chown=node:node /app/.next/standalone ./
# COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# USER node
# EXPOSE 3000
# ENV PORT 3000
# CMD ["node", "server.js"]

# If NOT using standalone output (default Next.js behavior):
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the app runs on (Next.js default is 3000).
# You can change this with the PORT environment variable if your start script respects it.
EXPOSE 3000

# Command to run the application.
# `npm start` typically runs `next start`.
CMD ["npm", "start"]
