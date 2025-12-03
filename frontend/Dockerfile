FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
