# Dockerfile for 'admin-service'

# --- Stage 1: Build ---
# Use a specific version of Node for reproducibility
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Copy only the necessary package and config files first
# This leverages Docker's layer caching. The build only re-runs `npm install`
# if these specific files change, not on every code change.
COPY package.json package-lock.json ./
COPY tsconfig.base.json nx.json ./

# 2. Install dependencies for the entire monorepo
# This is necessary for the build step to work
RUN npm install

# 3. Copy the rest of the source code
COPY . .

# 4. Build the specific application.
# Nx will automatically create a pruned package.json in the output directory
# if your project's build target is configured correctly.
RUN npx nx build admin-service --configuration=production


# --- Stage 2: Production Runtime ---
FROM node:20-alpine
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# 5. Copy the pruned package.json from the build output
COPY --from=builder /app/dist/apps/admin-service/package.json ./package.json

# 6. Install ONLY the production dependencies for 'product-service'
RUN npm install --omit=dev

# 7. Copy the built application code and prisma schema
COPY --from=builder /app/dist/apps/product-service .
COPY --from=builder /app/prisma ./prisma

# Expose the correct port
EXPOSE 3008

# 8. Run the application using the correct file name
CMD ["node", "main.js"]