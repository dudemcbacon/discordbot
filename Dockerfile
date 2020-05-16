FROM node:alpine

RUN mkdir -p /usr/src/app

COPY bot.js /usr/src/app
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app

WORKDIR /usr/src/app

RUN yarn install

CMD npm start
