# Use Node.js 22 as base
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
