FROM node:12.18.3-alpine3.9
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8085
CMD ["npm", "start"]
