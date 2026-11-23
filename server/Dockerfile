# Production Dockerfile for AI Lost and Found Backend
FROM node:20-alpine

WORKDIR /app

# Install build dependencies if needed
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source code
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]
