FROM openjdk:11-jdk

WORKDIR /app

COPY . /app
RUN ./gradlew build

CMD ["./gradlew", "run"]