#!/usr/bin/env bash

# Copy the relevant `{highlights,locals,..}.scm` files to the
# nvim-treesitter queries directory.
#
# Assumes that you have installed nvim-treesitter.
#
# Environment Variable    Default
#   NVIM_CONFIG_DIR       ':echo stdpath("config")'
#   NVIM_QUERIES_DIR      $NVIM_CONFIG_DIR/queries
#
# See `:h rtp` for Neovim's runtime configuration paths.

set -euo pipefail
IFS=$'\n\t'

cd "$(dirname "${BASH_SOURCE[0]}")/.." > /dev/null 2>&1

# Neovim configuration directory.  Most often just ~/.config/nvim
NVIM_CONFIG_DIR="${NVIM_CONFIG_DIR:-"$(nvim --headless -c 'echo stdpath("config")' -c 'q' 2>&1)"}"

if [[ ! -d "${NVIM_CONFIG_DIR:?}" ]]; then
  mkdir -p "${NVIM_CONFIG_DIR}"
  echo "Created Neovim config directory, as it did not exist: ${NVIM_CONFIG_DIR}"
fi

mkdir -p "${NVIM_CONFIG_DIR}/ftdetect"
cp ./nvim/cds.vim "${NVIM_CONFIG_DIR}/ftdetect"
echo "Copied cds.vim to: ${NVIM_CONFIG_DIR}/ftdetect"

NVIM_QUERIES_DIR="${NVIM_QUERIES_DIR:-"${NVIM_CONFIG_DIR}/queries"}"
CDS_DIR="${NVIM_QUERIES_DIR}/cds"
mkdir -p "${CDS_DIR}"
cp ./nvim/*.scm "${CDS_DIR}"
echo "Copied queries to: ${CDS_DIR}"
