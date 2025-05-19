# gleanup

[![CI](https://github.com/thaitype/gleanup/actions/workflows/main.yml/badge.svg)](https://github.com/thaitype/gleanup/actions/workflows/main.yml) [![NPM Version](https://img.shields.io/npm/v/gleanup) ](https://www.npmjs.com/package/gleanup)[![npm downloads](https://img.shields.io/npm/dt/gleanup)](https://www.npmjs.com/package/gleanup)

> CLI tool to collect source files into a Markdown-formatted bundle – perfect for LLMs, code review, or context sharing.

**gleanup** reads files recursively from a directory, and outputs their content as neatly formatted Markdown – ready to paste into a chat or documentation. It can also copy the result to your clipboard or write to a file.

## ✨ Features

- 📦 Recursively read files in a directory
- 📝 Output Markdown with syntax-highlighted code blocks
- 📋 Copy to clipboard for instant use in ChatGPT, Claude, or Notion
- 🧠 Automatically ignores files listed in `.gitignore`
- 🔥 Skips binary files (e.g. images, PDFs, archives)
- 🧾 Optional file output via `--output`
- 🎯 Filter by file extension via `--ext`
- 💬 Clean, minimal logs (auto-suppressed when `--print` is used)

## 🧪 Installation & Usage

You can run it directly with `npx`:

```bash
npx gleanup
````

Or install it globally:

```bash
npm install -g gleanup
```

## 🚀 Examples

### Read current folder and copy result

```bash
npx gleanup
```

### Use a custom glob pattern

```bash
npx gleanup . --pattern 'src/**/*.ts'
```

### Filter by extension and print to console

```bash
npx gleanup . --ext .ts --print
```

### Ignore specific folders

```bash
npx gleanup . --ignore dist --ignore '**/*.test.ts'
```

### Read a specific folder and write to file

```bash
npx gleanup ./src --output context.md
```

## ⚙️ Options

| Flag          | Description                                              | Example                   |
| ------------- | -------------------------------------------------------- | ------------------------- |
| `[directory]` | Base folder to scan (default: current working directory) | `npx gleanup ./project`   |
| `--pattern`   | Custom glob pattern for matching files (default: `"**"`) | `--pattern 'src/**/*.ts'` |
| `--ext`       | Filter files by extension                                | `--ext .ts`               |
| `--ignore`    | Glob patterns to exclude (can be used multiple times)    | `--ignore dist/**`        |
| `--output`    | Write Markdown output to a file                          | `--output context.md`     |
| `--print`     | Also print the Markdown output to terminal (no logs)     | `--print`                 |

## 💡 Use Cases

* Paste full context into **ChatGPT / Claude / Gemini**
* Review all project files in one go
* Attach full code context to GitHub PR or Jira
* Copy source as Markdown for docs or blog posts


## 🧙‍♂️ Author

Made with 💛 by [@mildronize](https://github.com/mildronize)

## 🧾 License

MIT

