FROM mhart/alpine-node:12
RUN set -eux; \
    addgroup -g 1000 -S staff && \
    adduser -u 1000 -S staff -G staff
#RUN mkdir -p /app
COPY package.json /app/
WORKDIR /app

RUN npm install --only=production

COPY .babelrc webpack.config.js /app/
COPY ./scripts /app/scripts
COPY ./src /app/src
RUN npm run build && echo done && chown -R staff:staff /app/

USER staff
CMD [ "npm", "run", "prod" ]
