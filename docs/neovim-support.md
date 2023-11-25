## NeoVim Support

_State_: To be re-worked.  The mentioned plugin manager is deprecated.

We support NeoVim using nvim-treesitter.

To use tree-sitter-cds with NeoVim, please install nvim-treesitter and ensure
your NeoVim version is a recent one.  See:

 - <https://github.com/nvim-treesitter/nvim-treesitter#quickstart>
 - <https://github.com/neovim/neovim/wiki/Building-Neovim>

Personally, I use the settings from <https://github.com/David-Kunz/vim>.
If you use [`wbthomason/packer`](https://github.com/wbthomason/packer.nvim),
I propose these settings (add it to your config, e.g. `~/.config/nvim/init.lua`):

<details>
<summary>Click to see details</summary>

```lua
vim.cmd [[packadd packer.nvim]]
require('packer').startup(function(use)
  use 'wbthomason/packer.nvim'
  use { 'nvim-treesitter/nvim-treesitter', run = ':TSUpdate' }
  -- use 'nvim-treesitter/playground'
  end
)

-- ...

cmd('set foldmethod=expr')
cmd('set foldexpr=nvim_treesitter#foldexpr()')

local parser_config = require('nvim-treesitter.parsers').get_parser_configs()
parser_config.cds = {
      install_info = {
            -- local path or git repo
            url = "https://github.com/cap-js-community/tree-sitter-cds.git",
            -- url = "/path/to/tree-sitter-cds",
            branch = "main",
            files = { "src/parser.c", "src/scanner.c" }
      },
      filetype = "cds",
      -- additional filetypes that use this parser
      used_by = { "cdl", "hdbcds" }
}

require "nvim-treesitter.configs".setup {
      highlight = {
            enable = true
      },
      indent = {
            enable = true
      },
      incremental_selection = {
            enable = true,
            keymaps = {
                  init_selection = "gnn",
                  node_incremental = "grn",
                  scope_incremental = "grc",
                  node_decremental = "grm",
            },
      }
}
```

</details>

After this, run these commands in `nvim`:

```
:PackerInstall
:TSInstall cds
```

This compiles the C files and creates the tree-sitter parser for CDS.

Note that there are two things left to do for proper syntax highlighting:

1. Tell NeoVim to associate `*.cds` files with filetype `cds` using [ftdetect][]
2. Tell nvim-treesitter to use our `queries/`

Both can be done swiftly using [`setup-nvim-treesitter.sh`] of this repository.
Execute it and all `queries/` as well as `cds.vim` will be installed to:

- `$HOME/.local/share/nvim/site/pack/packer/start/nvim-treesitter/queries/`
- `$HOME/.config/nvim/ftdetect/cds.vim`

[`setup-nvm-treesitter.sh`]: ../nvim/setup-nvm-treesitter.sh
[ftdetect]: https://neovim.io/doc/user/filetype.html

