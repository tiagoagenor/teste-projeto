# Stage 1: Build client and prepare dependencies
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/

RUN npm install
RUN npm install --prefix client

COPY . .

RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["npm", "start"]
