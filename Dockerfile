# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies for compilation
RUN npm install

# Copy source code and config
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist

# The backend listens on 3001
EXPOSE 3001

CMD ["node", "dist/index.js"]
