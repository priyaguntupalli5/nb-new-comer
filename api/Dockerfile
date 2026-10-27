# Build from the repository root: docker build -f api/Dockerfile .
FROM node:22-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json .npmrc ./
COPY api/package.json api/
COPY web/package.json web/
RUN npm ci -w api
COPY api api
RUN npx -w api prisma generate && npm run build -w api

FROM node:22-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/api/package.json api/
COPY --from=build /app/api/dist api/dist
COPY --from=build /app/api/prisma api/prisma
WORKDIR /app/api
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
