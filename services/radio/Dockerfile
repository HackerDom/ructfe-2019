FROM ubuntu:18.04

RUN set -eux; \
	groupadd -r radio --gid=999; \
	useradd -r -g radio --uid=999 --home-dir=/app --shell=/bin/bash radio;

ENV APP_DIR /app
ENV SECRET_PATH /secrets/

RUN mkdir -p $APP_DIR
RUN mkdir -p $SECRET_PATH
RUN chown radio:radio $APP_DIR
RUN chown radio:radio $SECRET_PATH

USER radio
WORKDIR $APP_DIR

COPY .build/ $APP_DIR
COPY config.yaml.example config.yaml
COPY scripts $APP_DIR/scripts
COPY ./secrets/db_password.example $SECRET_PATH/db_password
COPY ./docker-entry.sh $APP_DIR

EXPOSE 4553
CMD [ "/app/docker-entry.sh" ]
