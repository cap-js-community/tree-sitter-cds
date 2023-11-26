#!/usr/bin/env bash

###########################################################
# Test everything that our CI does, but less verbose
###########################################################

set -Eeuo pipefail
IFS=$'\n\t'

cd "$(dirname "${BASH_SOURCE[0]}")/../.." > /dev/null 2>&1

npm --silent ci
npm --silent run build
npm --silent run test
./tools/checks/run_shellcheck.sh

cargo --quiet build
cargo --quiet test

cd test/bindings/node
npm --silent ci
npm --silent test
