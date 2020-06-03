FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
EXPOSE 80
ENV PORT=80
CMD [ "npm", "start" ]
