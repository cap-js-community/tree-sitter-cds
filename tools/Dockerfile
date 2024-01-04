# Build / Generate grammar from project root directory.
# Can be used to create the grammar in reproducible way.
#
# Usage:
#  cd tree-sitter-cds
#  docker build --pull -t "tree-sitter-cds:ci" -f tools/Dockerfile .
#  docker run --rm --volume "$(pwd):/opt/tree-sitter-cds" "tree-sitter-cds:ci"

FROM ubuntu:23.04

RUN apt update && \
    apt upgrade -y && \
    apt install -y curl git neovim make g++ gcc python3 && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm instal -g npm

VOLUME /opt/tree-sitter-cds

CMD cd /opt/tree-sitter-cds && \
    echo "npm ci" && npm ci && \
    echo "npm run build" && npm run build && \
    echo "npm run test" && npm run test
