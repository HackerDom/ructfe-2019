FROM nimlang/nim

# Create user, so we reduce attack surface on docker itself (most 0 days won't work, I hope :D)
# Adapted from https://github.com/docker-library/postgres/blob/4a82eb932030788572b637c8e138abb94401640c/12/Dockerfile
RUN set -eux; \
	groupadd -r example --gid=999; \
	useradd -r -g example --uid=999 --home-dir=/app --shell=/bin/bash example;

COPY src/example_service /app/

USER example

CMD ["/app/example_service"]
