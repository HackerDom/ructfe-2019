FROM ubuntu:18.04

RUN set -eux

RUN apt update && \
    apt install -y fcgiwrap \
                   binutils \
                   libboost-system1.62.0 \
                   libboost-iostreams1.62.0 \
                   libboost-filesystem1.62.0 \
                   libboost-serialization1.62.0

RUN groupadd -r -g 999 engine && \
    useradd -r -g 999 -u 999 -d /var/engine -s /bin/false engine

WORKDIR /var/engine/

RUN mkdir -p data && \
    chown engine:engine data && \
    touch data/.protected

ADD bin/engine engine

RUN strip --strip-all engine && \
    chmod +x engine

USER engine

ENTRYPOINT ["fcgiwrap", "-c", "32", "-s", "tcp:0.0.0.0:31337", "-p", "/var/engine/engine"]
