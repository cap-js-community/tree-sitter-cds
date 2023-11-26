#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

cd "$(dirname "${BASH_SOURCE[0]}")/../.." > /dev/null 2>&1

find . -type f -iname "*.sh" \
	-exec shellcheck --external-sources --color=always {} \+

echo "✅  No Errors"
