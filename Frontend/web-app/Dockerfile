# Stage 1: Build the React app
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /build

# Copy workspace root files (needed for catalog: resolution)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all workspace packages so pnpm can resolve the full lockfile
COPY Frontend/web-app/ ./Frontend/web-app/
COPY Backend/Auth/package.json ./Backend/Auth/package.json
COPY Backend/Gateway/package.json ./Backend/Gateway/package.json
COPY Backend/Vacation/package.json ./Backend/Vacation/package.json
COPY Libraries/ ./Libraries/

# Install all dependencies (catalog: specifiers require full workspace)
RUN pnpm install --no-frozen-lockfile

# Set the API URL at build time (gateway exposed on host port 3000)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}

# Build the app
RUN cd Frontend/web-app && npx vite build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY Frontend/web-app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from stage 1
COPY --from=build /build/Frontend/web-app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
