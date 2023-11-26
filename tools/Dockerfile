# Build from project root directory
# Use this Dockerfile only for testing.

FROM ubuntu:22.04

RUN apt update && \
    apt upgrade -y && \
    apt install -y curl git neovim make g++ gcc python3 && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

COPY .. /opt/tree-sitter-cds

RUN cd /opt/tree-sitter-cds && \
    npm install && \
    ./node_modules/.bin/tree-sitter generate && \
    ./node_modules/.bin/tree-sitter test
