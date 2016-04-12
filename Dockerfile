FROM mhart/alpine-node:4.4.2
RUN mkdir -p /usr/src/cquiz
WORKDIR /usr/src/cquiz
COPY ./package.json /usr/src/cquiz
RUN npm install
COPY . /usr/src/cquiz
EXPOSE 5000
CMD ["node", "app.js"]
