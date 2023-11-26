# Development

## Setup

### tree-sitter setup

Some files in this repository are _auto generated_.  For example
`src/parser.c`.  We do this so that users can download and use the grammar
more easily.  We don't expect the grammar to change frequently.

To work on the grammar, clone this repository and install NPM dependencies:

```sh
git clone https://github.com/cap-js-community/tree-sitter-cds.git
cd tree-sitter-cds
npm install
```

Note that you need `tree-sitter` in your `$PATH`.  Either install it globally
using NPM or other package managers (e.g. MacPorts) or install it locally using
NPM and add the `.bin` directory to your `$PATH`:

```sh
export PATH="${PATH}:./node_modules/.bin/"
```

To generate the grammar and run our tests, use:

```sh
tree-sitter generate
tree-sitter test
```


### Git

We use [Conventional Commits] and have a default commit message
template, that has some tips. Install it via:

```sh
cd tree-sitter-cds
git config commit.template tools/etc/git-default-commit-message.txt
```


## Debugging

For debugging this grammar, use [nvim-treesitter/playground][].
Use their settings and ensure that you are using _NeoVim Nightly_.


## Docker

This repository provides a basic Dockerfile. It only serves for testing our
build steps.

```sh
cd tree-sitter-cds
docker build --pull -t "tree-sitter-cds:dev" -f tools/Dockerfile .
```

[nvim-treesitter/playground]: https://github.com/nvim-treesitter/playground
[Conventional Commits]: https://www.conventionalcommits.org/en/v1.0.0/
