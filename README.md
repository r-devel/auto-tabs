# Auto Tabs

A VS Code extension that automatically converts spaces to tabs, providing Emacs-like `indent-tabs-mode` behavior.

## Installation

1. Go to the [GitHub releases page](https://github.com/r-devel/auto-tabs/releases)
2. Download the latest `.vsix` file from the release assets
3. Open VS Code/Positron.
4. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the Command Palette
5. Type "Extensions: Install from VSIX..." and select it
6. Browse to the downloaded `.vsix` file and select it
7. The extension will be installed and activated automatically

## Features

- **Smart Tab**: Press Tab to add indentation that automatically converts to tabs when threshold is reached
- **Document Formatting**: Format entire documents or single lines
- **Configurable**: Choose between leading-spaces-only or all-spaces conversion

## Commands

- `auto-tabs.format` - Format entire document
- `auto-tabs.formatLine` - Format current line only
- `auto-tabs.smartTab` - Smart tab with automatic space-to-tab conversion

## Configuration

```json
{
  "autoTabs.convertAllSpaces": false
}
```

- `autoTabs.convertAllSpaces`: When `true`, converts all space sequences to tabs. When `false` (default), only converts leading spaces.

## Key Bindings

The Tab key is automatically bound to `auto-tabs.smartTab` for C files, providing real-time indentation with space-to-tab conversion.

## Recommended Settings for R Core Development

Add this to your `.vscode/settings.json`:

```json
{
    "[c]": {
        "editor.defaultFormatter": "r-devel.auto-tabs",
        "editor.insertSpaces": true,
        "editor.indentSize": 4,
        "editor.tabSize": 8,
        "editor.detectIndentation": false,
        "editor.formatOnSave": false,
    }
}
```

## Development

```bash
npm install
npm run compile
npm test
```

## License

MIT
