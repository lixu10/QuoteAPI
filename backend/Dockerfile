FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 py3-pip

COPY package*.json ./

RUN npm install --production

COPY . .

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["npm", "start"]
