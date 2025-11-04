FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --only=production
RUN cd backend && npm install --only=production

# Copy application code
COPY backend/ ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/data/inventory.db
ENV JWT_SECRET=change-this-secret-key

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start the application
CMD ["npm", "start"]
