FROM alpine:3.6

ENV APP_DIR /app
ENV SECRET_PATH /run/secrets/
RUN mkdir -p $APP_DIR
WORKDIR $APP_DIR
COPY .build/ $APP_DIR

EXPOSE 4553
CMD [ "/app/radio" ]
