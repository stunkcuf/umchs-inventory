FROM node:18-alpine

# Set working directory to app
WORKDIR /app

# Copy backend package files only
COPY backend/package*.json ./

# Install dependencies  
RUN npm install --only=production

# Copy backend application code
COPY backend/ ./

# Expose port
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/data/inventory.db

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start the application directly with node
CMD ["node", "src/server.js"]
