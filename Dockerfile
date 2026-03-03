# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Tell Puppeteer to skip downloading the browser (we will install it via apk)
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy backend package files separately to leverage layer caching
COPY backend/package.json backend/package-lock.json ./backend/

# Install all dependencies for the backend
RUN cd backend && npm install --quiet

# Copy backend source code and config
COPY backend/ ./backend/

# Build the NestJS project
RUN cd backend && npm run build

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

# Copy backend package files for production dependency installation
COPY backend/package.json backend/package-lock.json ./backend/

# Install only production dependencies for the backend
RUN cd backend && npm install --quiet --omit=dev

# Copy compiled code from builder stage
COPY --from=builder /app/backend/dist ./backend/dist

# The backend listens on 3001
EXPOSE 3001

# Run the NestJS application
CMD ["node", "backend/dist/main.js"]
