# Stage 1: base - Installs all dependencies
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Stage 2: dev - For local development with hot-reloading
FROM base AS dev
WORKDIR /app
COPY . .
# Expose port and run the development server
EXPOSE 5173
CMD ["pnpm", "run", "dev"]

# Stage 3: build - Creates the static production build
FROM base AS build
WORKDIR /app
COPY . .
RUN pnpm run build

# Stage 4: prod - Serves the static build using Nginx
FROM nginx:1.25-alpine AS prod
# Copy built assets from the 'build' stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
