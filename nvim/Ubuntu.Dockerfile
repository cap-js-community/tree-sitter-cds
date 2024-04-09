# Build from project root directory:
#   docker build --pull -t "tree-sitter-cds:nvim-guide" -f nvim/Ubuntu.Dockerfile .
#   docker run --rm -it tree-sitter-cds:nvim-guide /bin/bash
#   nvim /opt/tree-sitter-cds/examples/entity.cds
# Test the nvim config guide for https://github.com/cap-js-community/tree-sitter-cds

FROM ubuntu:lunar-20231128

RUN apt update && apt upgrade -y && \
    apt install -y \
      curl tar git \
      cmake make \
      unzip gettext \
      g++ gcc python3 && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Neovim
RUN git clone --depth=1 --single-branch --branch=stable https://github.com/neovim/neovim && \
    cd neovim && make CMAKE_BUILD_TYPE=RelWithDebInfo && \
    make install

COPY .. /opt/tree-sitter-cds

RUN cd /opt/tree-sitter-cds && \
    rm -rf node_modules/ build/ && \
    ./nvim/setup-nvim-treesitter.sh && \
    NVIM_CONFIG_DIR="$(nvim --headless -c ':echo stdpath("config")' -c ':qa' 2>&1)" && \
    cp ./nvim/init.lua "${NVIM_CONFIG_DIR:?}/"  && \
    nvim --headless -c ":Lazy" -c ":qa" && \
    nvim --headless -c ':TSInstallSync cds' -c ':qa'
