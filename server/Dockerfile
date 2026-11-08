
FROM node:22-bookworm

WORKDIR /app

# Install OpenSSL and its development libraries
RUN apt-get update && \
    apt-get install -y openssl libssl-dev ca-certificates && \
    openssl version && \
    ldconfig

COPY package*.json ./

RUN npm ci

COPY . .

# Generate Prisma Client inside the Docker environment
RUN npx prisma generate

ENV NODE_ENV=production

CMD ["npm", "start"]
