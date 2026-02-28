# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Tell Puppeteer to skip downloading the browser (we will install it via apk)
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy package files separately to leverage layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies) for compilation
RUN npm ci --quiet

# Copy source code and config
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true
# Point Puppeteer to the system-installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Chromium and necessary fonts/libraries for PDF generation
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# Copy package files for production dependency installation
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --quiet --omit=dev

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist

# The backend listens on 3001
EXPOSE 3001

CMD ["node", "dist/index.js"]
