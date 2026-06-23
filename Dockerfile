# Stage 1: Build the TypeScript code
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and tsconfig
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies for compilation)
RUN npm ci

# Copy the source code
COPY src ./src

# Compile TypeScript to JavaScript (generates dist/)
RUN npm run build

# Stage 2: Create the minimal production runner image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled files from stage 1
COPY --from=builder /app/dist ./dist

# Expose the default microservice port
EXPOSE 5001

# Set the production environment flag
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
