FROM node:16-alpine AS builder

# Set working directory
WORKDIR /app

# Install git (required for husky)
RUN apk add --no-cache git

# Copy package files and install dependencies
COPY package*.json ./

# Skip husky install during npm ci
ENV HUSKY_SKIP_INSTALL=1
ENV HUSKY=0
RUN npm ci --no-audit --no-fund

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Set node environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV HUSKY_SKIP_INSTALL=1
ENV HUSKY=0

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --no-audit --no-fund

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy additional files
COPY .env* ./

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/src-ts/index.js"]