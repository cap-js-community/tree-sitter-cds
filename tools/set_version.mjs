#!/usr/bin/env node

// Set the version of tree-sitter-cds in all files containing its version number.
// Requires Node 20.11 or later.

'use strict';

import path from 'node:path';
import fs from 'node:fs';

const project_dir = path.join(import.meta.dirname, '..');

const new_version = process.argv[2];

if (!new_version) {
  console.error('Missing argument: ./tools/set_version.mjs <version>');
  process.exit(1);
}

const version_files = [
  'package.json',
  'Cargo.toml',
  'pyproject.toml',
  'Makefile',
  'test/bindings/node/package.json',
  'bindings/rust/README.md',
];

const version_regexes = [
  /"version": "(?<version>[\d.]+)"/, // package.json
  /version = "(?<version>[\d.]+)"/,  // Cargo.toml
  /VERSION := (?<version>[\d.]+)/,   // Makefile
  /tree-sitter-cds = "~(?<version>[\d.]+)"/ // Rust example
];

version_files.forEach(update_version);

console.error(`
Don't forget to run these commands to update lock files!

  npm run build
  npm update
  cargo update
  cd test/bindings/node
  npm update
  cd ../../..
`);

async function update_version(file) {
  const abs_file = path.join(project_dir, file);
  const content = await fs.promises.readFile(abs_file, 'utf-8');

  for (const re of version_regexes) {
    let r = re.exec(content);
    if (r?.groups?.version) {
      let a = r[0].replace(r.groups.version, new_version);
      let new_content = content.replace(r[0], a);
      await fs.promises.writeFile(abs_file, new_content);
      return;
    }
  }

  console.error('Could not update:', file);
}
