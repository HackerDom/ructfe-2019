FROM openjdk:11-jdk-slim

RUN set -eux; \
	groupadd -r example --gid=999; \
	useradd -r -g example --uid=999 --home-dir=/app --shell=/bin/bash locator;

WORKDIR /app

COPY . /app

# RUN ./gradlew fatJar

# RUN chown -R locator /app

# USER locator

# CMD ["java", "-jar", "build/libs/ructfe-1.0-SNAPSHOT.jar"]
