FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS dev
COPY . .
RUN mkdir -p uploads/images uploads/documents uploads/templates
EXPOSE 3001
CMD ["npm", "run", "server:watch"]

FROM deps AS production
COPY . .
RUN mkdir -p uploads/images uploads/documents uploads/templates
ENV NODE_ENV=production
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3001/health || exit 1
CMD ["npm", "run", "server"]
