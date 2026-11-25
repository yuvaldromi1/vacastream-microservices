FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

# Accept which service to run: Auth, Gateway, or Vacation
ARG SERVICE
ENV SERVICE=${SERVICE}

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy shared libraries
COPY Libraries/ ./Libraries/

# Copy all backend services (needed for workspace resolution)
COPY Backend/ ./Backend/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build shared libraries (restify first, then jwt which depends on it)
RUN pnpm --filter @yd/restify run build && pnpm --filter @yd/jwt run build

# Expose the service port (overridden by compose)
EXPOSE 3000 3001 3002

# Start the target service with ts-node
CMD ["sh", "-c", "cd Backend/${SERVICE} && npx ts-node src/app.ts"]
