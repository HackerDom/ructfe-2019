FROM openjdk:11-jdk

WORKDIR /app

COPY . /app
RUN ./gradlew fatJar

CMD ["java", "-jar", "build/libs/ructfe-1.0-SNAPSHOT.jar"]
