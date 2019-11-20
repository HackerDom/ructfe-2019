FROM node:latest
# RUN set -eux; \
	# groupadd -r example --gid=999; \
	# useradd -r -g example --uid=999 --home-dir=/app --shell=/bin/bash example;
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
# USER example
CMD [ "npm", "run", "prod" ]
