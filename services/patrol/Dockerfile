FROM openjdk:11-jdk-slim

WORKDIR /app

COPY . /app
RUN ./gradlew build

CMD ["./gradlew", "run"]
