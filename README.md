# gleanup

> CLI tool to collect source files into a Markdown-formatted bundle – perfect for LLMs, code review, or context sharing.

**gleanup** reads files recursively from a directory, and outputs their content as neatly formatted Markdown – ready to paste into a chat or documentation. It can also copy the result to your clipboard or write to a file.

## ✨ Features

- 📦 Recursively read files in a directory
- 📝 Output Markdown with syntax-highlighted code blocks
- 📋 Copy to clipboard for instant use in ChatGPT or Notion
- 🔥 Ignore common folders (`node_modules`, `.git`, `dist`, etc.)
- 🧾 Optional file output (`--output context.md`)
- 🎯 Filter by file extension (`--ext .ts`)

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

### Read a specific folder and write to file

```bash
npx gleanup ./src --output context.md
```

### Filter by extension and print to console

```bash
npx gleanup . --ext .ts --print
```

### Ignore specific folders

```bash
npx gleanup . --ignore dist --ignore '**/*.test.ts'
```

## ⚙️ Options

| Flag          | Description                                      | Example                   |
| ------------- | ------------------------------------------------ | ------------------------- |
| `[directory]` | Base folder to scan (default: current directory) | `npx gleanup ./my-folder` |
| `--ext`       | Filter by file extension                         | `--ext .ts`               |
| `--ignore`    | Glob patterns to exclude (can use multiple)      | `--ignore dist/**`        |
| `--print`     | Also print output to terminal                    | `--print`                 |
| `--output`    | Write output to file (Markdown format)           | `--output context.md`     |

## 💡 Use Cases

* Paste full context into **ChatGPT / Claude / Gemini**
* Review all project files in one go
* Attach full code context to GitHub PR or Jira
* Copy source as Markdown for docs or blog posts

## 🛠️ Future Ideas

* Support `.gitignore` automatically
* Highlight diffs or line numbers
* Format output as JSON or plain text

## 🧙‍♂️ Author

Made with 💛 by [@mildronize](https://github.com/mildronize)

## 🧾 License

MIT

