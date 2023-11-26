-- Example init.lua file for tree-sitter-cds setup

-- We use lazy.nvim and nvim-treesitter:
--  - https://github.com/folke/lazy.nvim#-installation
--  - https://github.com/nvim-treesitter/nvim-treesitter/wiki/Installation#lazynvim

-- Install lazy.nvim
local lazypath = vim.fn.stdpath('data') .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    'git', 'clone', '--filter=blob:none',
    'https://github.com/folke/lazy.nvim.git',
    '--branch=stable', -- latest stable release
    lazypath,
  })
end
vim.opt.runtimepath:prepend(lazypath)

-- Install nvim-treesitter
require('lazy').setup({
  { 'nvim-treesitter/nvim-treesitter', build = ':TSUpdate' },
  'nvim-treesitter/playground'
})

-- Configure highlighting
-- See https://github.com/nvim-treesitter/nvim-treesitter#modules
require('nvim-treesitter.configs').setup {
    highlight  = { enable = true },
    playground = { enable = true }
}

-- Install tree-sitter-cds
local parser_config = require('nvim-treesitter.parsers').get_parser_configs()
parser_config.cds = {
  install_info = {
    -- local path or git repo
    -- url = '/path/to/tree-sitter-cds',
    url = 'https://github.com/cap-js-community/tree-sitter-cds.git',
    files = {'src/parser.c', 'src/scanner.c'},
    branch = 'main',
    generate_requires_npm = false,
    requires_generate_from_grammar = false
  },
  filetype = 'cds',
  -- additional filetypes that use this parser
  used_by = {'cdl', 'hdbcds'}
}
