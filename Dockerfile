FROM mhart/alpine-node:6

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app

RUN npm install node-pre-gyp -g

RUN npm install
COPY . /app

CMD ["npm", "start"]
