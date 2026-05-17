# ─────────────────────────────────────────
# Stage 1: Build — React + Vite
# ─────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDeps for build)
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Serve — Nginx (lightweight)
# ─────────────────────────────────────────
FROM nginx:alpine

# Copy built React app to nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (handles React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
