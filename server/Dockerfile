
FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
