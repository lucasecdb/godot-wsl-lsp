# Godot WSL LSP

Simple LSP server that sits between Neovim instance on WSL and the Godot LSP server running on Windows.

This server only purpose is to convert the Windows and WSL path back and forth, to have a seamless experience editing GDScript files on Neovim running inside WSL (while Godot is still running on Windows).

# Setup with `neovim/nvim-lspconfig`

If you're using neovim's official `nvim-lspconfig`, the following configuration is recommended:

```lua
local lspconfig = require("lspconfig")

lspconfig.gdscript.setup({
    cmd = { "godot-wsl-lsp", "--useMirroredNetworking" },
})
```

If you're using WSL's 'mirrored' networking mode, use the `--useMirroredNetworking` flag when starting your LSP client.
