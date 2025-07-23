# Godot WSL LSP

Simple LSP server that sits between Neovim instance on WSL and the Godot LSP server running on Windows.

This server's only purpose is to convert the Windows and WSL path back and forth, to have a seamless experience editing GDScript files on Neovim running inside WSL (while Godot is still running on Windows).

# Setup

You can find more information on the entire setup process in [this gist](https://gist.github.com/lucasecdb/2baf6d328a10d7fea9ec085d868923a0).

The updated configuration from the previous gist using this server would be:

```lua
-- after/ftplugin/gdscript.lua

local cmd = { "godot-wsl-lsp" }
local pipe = "/tmp/godot.pipe"

vim.lsp.start({
    name = "Godot",
    cmd = cmd,
    filetypes = { "gdscript" },
    root_dir = vim.fs.dirname(vim.fs.find({ "project.godot", ".git" }, {
        upward = true,
        path = vim.fs.dirname(vim.api.nvim_buf_get_name(0))
    })[1]),
    on_attach = function(client, bufnr)
        vim.api.nvim_command('echo serverstart("' .. pipe .. '")')
    end
})
```

## Setup using `neovim/nvim-lspconfig`

If you're using neovim's official `nvim-lspconfig`, you can omit setting up the lsp server using the naked `vim.lsp` API and `ftplugin`. In this case, the following configuration is recommended:

```lua
local lspconfig = require("lspconfig")

lspconfig.gdscript.setup({
    cmd = { "godot-wsl-lsp" },
})
```

# WSL mirrored networking mode

If you're using WSL's 'mirrored' networking mode (supported since [WSL 2.0.0](https://github.com/microsoft/WSL/releases/tag/2.0.0), you can use the `--useMirroredNetworking` flag when starting your lsp server:

```lua
cmd = { "godot-wsl-lsp", "--useMirroredNetworking" }
```

# Manually specifying what host to connect

If you prefer, you can also specify the host ip address you wish to connect manually:

```lua
cmd = { "godot-wsl-lsp", "--host", "1.2.3.4" }
```

# Improving path conversion performance

If you are experiencing long latency between nvim and the lsp, the `--experimentalFastPathConversion` flag may improve performance:

```lua
cmd = { "godot-wsl-lsp", "--useMirroredNetworking", "--experimentalFastPathConversion" }
```
