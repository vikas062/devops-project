# ─────────────────────────────────────────
# Backend — Node.js (Express API)
# ─────────────────────────────────────────
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Skip Puppeteer Chromium download (saves 300MB + 30min build time)
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy package files first (layer caching)
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose API port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start server
CMD ["node", "src/index.js"]
