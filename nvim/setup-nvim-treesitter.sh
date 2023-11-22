#!/usr/bin/env bash

# Copy the relevant `{highlights,locals,..}.scm` files to the
# nvim-treesitter queries directory.
#
# Assumes that you have installed nvim-treesitter.
#
# Variables                 Default
#  NVIM_DIR                 $HOME/.config/nvim
#  TREE_SITTER_QUERIES_DIR  $HOME/.config/nvim/queries
#

set -euo pipefail
IFS=$'\n\t'

# Go to project directory
cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null 2>&1

NVIM_DIR="${NVIM_DIR:-"$HOME/.config/nvim"}"

if [[ ! -d "${NVIM_DIR}" ]]; then
  cat << EOF
  NVIM config directory does not exist:
    ${NVIM_DIR}

  Create it or manually setup nvim-treesitter.
  You can set \$NVIM_DIR to choose another directory.
EOF
    exit 1
fi

mkdir -p "${NVIM_DIR}/ftdetect"
cp cds.vim "${NVIM_DIR}/ftdetect"
echo "Copied cds.vim to: ${NVIM_DIR}/ftdetect"

TREE_SITTER_QUERIES_DIR="${TREE_SITTER_QUERIES_DIR:-"$HOME/.config/nvim/queries"}"

if [[ ! -d "${TREE_SITTER_QUERIES_DIR}" ]]; then
  cat << EOF
Could not find 'queries' directory of nvim-treesitter:
  ${TREE_SITTER_QUERIES_DIR}

Did you install nvim-treesitter?
See <https://github.com/nvim-treesitter/nvim-treesitter>
EOF
  exit 1
fi

CDS_DIR="${TREE_SITTER_QUERIES_DIR}/cds"
mkdir -p "${CDS_DIR}"

cp ./*.scm "${CDS_DIR}"

echo "Copied queries to: ${TREE_SITTER_QUERIES_DIR}"
