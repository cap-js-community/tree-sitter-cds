#!/usr/bin/env bash

###########################################################
# Test that all query files (*.scm) are valid.
#
# We use tree-sitter's CLI tools for that.  If a file
# contains capture groups that are not valid (e.g. a typo),
# then the CLI exists with code 1 and prints "Query compilation
# failed" on stderr.
###########################################################

set -Eeuo pipefail
IFS=$'\n\t'

cd "$(dirname "${BASH_SOURCE[0]}")/../.." > /dev/null 2>&1

echo "Checking files:"
find queries nvim -type f -iname '*.scm' -print0 | \
  xargs -0 -I % sh -c 'echo %; tree-sitter query --quiet "%" examples/empty.cds >/dev/null;'
