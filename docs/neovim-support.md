## NeoVim Support

We support NeoVim using nvim-treesitter.

## Setup

To use tree-sitter-cds with NeoVim, please install nvim-treesitter and ensure
your NeoVim version is a recent one (>=0.9.1).  
Afterward, configure tree-sitter-cds according to the nvim-treesitter guide
and add tree-sitter-cds's queries to NeoVim for syntax highlighting.

1. [Install NeoVim][nvim-install]
   Ensure that you have NeoVim v0.9.1 or later.  If not, you may need to build it yourself,
   see [Build NeoVim][nvim-build].
2. [Install nvim-tree-sitter](https://github.com/nvim-treesitter/nvim-treesitter#quickstart)
3. [Install custom parsers][nvim-add-parser]
4. [Add queries][nvim-add-queries]

We have a convenience script to copy all queries (`*.scm` files) to
NeoVim's `queries` directory: `./nvim/setup-nvim-treesitter.sh`.
If you update tree-sitter-cds, you will also have to update the queries
again using this script.

## Setup Guide with `lazy.nvim`

In case you are not familiar with NeoVim, here is a basic setup guide
for NeoVim with the `lazy.nvim` plugin manager.

We use [this Dockerfile](../nvim/Ubuntu.Dockerfile) to `test tree-sitter-cds`' setup. 

First, [Install NeoVim][nvim-install]. Ensure that you have NeoVim v0.9.1 or later.
If not, you may need to build it yourself, see [Build NeoVim][nvim-build].

After that, install `lazy.nvim` by following their [installation guide][lazy-vim-install].
If you don't know where NeoVim's config directory is, run
`nvim --headless -c ':echo stdpath("config")' -c ':qa'`.

Finally, install `nvim-treesitter`. They have [instructions for `lazy.nvim`][treesitter-lazy-nvim].
Don't forget to [install a custom parser for CDS][nvim-add-parser]
and [add queries][nvim-add-queries].

We have a convenience script to copy all queries (`*.scm` files) to
NeoVim's `queries` directory: `./nvim/setup-nvim-treesitter.sh`.
This script also adds a `cds.vim` files for [ftdetect].

If you want a copy&paste solution, use:

```sh
# Assuming you're inside the tree-sitter-cds folder.
./nvim/setup-nvim-treesitter.sh
NVIM_CONFIG_DIR="$(nvim --headless -c ':echo stdpath("config")' -c ':qa' 2>&1)"
cp nvim/init.lua "${NVIM_CONFIG_DIR:?}/"

nvim --headless -c "Lazy" -c "qa"
nvim --headless -c ':TSInstallSync cds' -c ':qa'
```

Also run `:checkhealth lazy` and `:checkhealth nvim-treesitter` to ensure
that everything is installed and configured correctly.

## Update

When you update tree-sitter-cds via `:TSUpdate cds`, you will also have to
install/update the queries again. See [setup](#setup) above.

Run `:checkhealth` to ensure that everything works as intended.

Note that the grammar (and queries) may change drastically until v1 is reached.

[ftdetect]: https://neovim.io/doc/user/filetype.html
[nvim-install]: https://github.com/neovim/neovim/wiki/Installing-Neovim
[nvim-build]: https://github.com/neovim/neovim/wiki/Building-Neovim
[lazy-vim-install]: https://github.com/folke/lazy.nvim#-installation
[treesitter-lazy-nvim]: https://github.com/nvim-treesitter/nvim-treesitter/wiki/Installation#lazynvim
[nvim-add-parser]: https://github.com/nvim-treesitter/nvim-treesitter#adding-parsers
[nvim-add-queries]: https://github.com/nvim-treesitter/nvim-treesitter#adding-queries
