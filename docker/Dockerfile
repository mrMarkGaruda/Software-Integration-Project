# Stage: install dependencies based on build args
ARG NODE_ENV=production
FROM node:16-alpine AS deps
WORKDIR /app

# Install Git for Husky
RUN apk add --no-cache git

# Copy package manifests
COPY package*.json ./

# Conditional install
RUN if [ "$NODE_ENV" = "development" ]; then \
      npm ci --no-audit --no-fund; \
    else \
      HUSKY_SKIP_INSTALL=1 HUSKY=0 npm ci --only=production --no-audit --no-fund; \
    fi

# Stage: builder
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage: development
FROM node:16-alpine AS dev
WORKDIR /app
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
# copy modules and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev"]

# Stage: production
FROM node:16-alpine AS prod
WORKDIR /app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV HUSKY_SKIP_INSTALL=1
ENV HUSKY=0
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY .env* ./
EXPOSE 8080
CMD ["node", "dist/src-ts/index.js"]