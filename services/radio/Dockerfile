FROM golang:1.13-buster

ENV APP_DIR /app
ENV SECRET_PATH /run/secrets/
RUN mkdir -p $APP_DIR
WORKDIR $APP_DIR

COPY .build/ $APP_DIR
COPY config.yaml.example config.yaml
COPY scripts $APP_DIR/scripts
COPY ./secrets/db_password.example /run/secrets/db_password
COPY ./docker-entry.sh $APP_DIR

EXPOSE 4553
CMD [ "/app/docker-entry.sh" ]
