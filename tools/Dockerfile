# Build / Generate grammar from project root directory.
#
# Usage:
#  cd tree-sitter-cds
#  docker build --pull -t "tree-sitter-cds:ci" -f tools/Dockerfile .
#  docker run --rm --volume "$(pwd):/opt/tree-sitter-cds" -it "tree-sitter-cds:ci" /bin/bash
#  # Inside the image
#  cd /opt/tree-sitter-cds
#  npm run build

FROM ubuntu:23.04

RUN apt update && \
    apt upgrade -y && \
    apt install -y curl git neovim make g++ gcc python3 && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

VOLUME /opt/tree-sitter-cds

RUN cd /opt/tree-sitter-cds && \
    npm install && \
    ./node_modules/.bin/tree-sitter generate && \
    ./node_modules/.bin/tree-sitter test
