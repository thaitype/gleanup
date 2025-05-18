import { cli } from 'cleye';
import { glob } from 'glob';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import clipboard from 'clipboardy';

const argv = cli({
  name: 'gleanup',
  parameters: ['[directory]'],
  flags: {
    ext: {
      type: String,
      description: 'Filter by file extension (e.g. .ts)',
      default: '',
    },
    ignore: {
      type: [String],
      description: 'Glob patterns to ignore (e.g. node_modules/**)',
      default: [],
    },
    print: {
      type: Boolean,
      description: 'Also print to stdout',
      default: false,
    },
  },
});

const cwd = path.resolve(argv._.directory || process.cwd());
const extFilter = argv.flags.ext;
const ignorePatterns = argv.flags.ignore;

async function listFilesWithContent() {
  const files = await glob('**', {
    cwd,
    ignore: ['node_modules/**', '.git/**', 'pnpm-lock.yaml', ...ignorePatterns],
  });

  const results = await Promise.all(
    files.map(async file => {
      const fullPath = path.join(cwd, file);
      const fileStat = await stat(fullPath);
      if (!fileStat.isFile()) return null;
      if (extFilter && !file.endsWith(extFilter)) return null;

      return {
        path: file,
        content: await readFile(fullPath, 'utf-8'),
      };
    })
  );

  return results.filter(Boolean) as { path: string; content: string }[];
}

async function main() {
  const files = await listFilesWithContent();

  let output = `## 🧾 File dump from \`${cwd}\`\n\n`;

  output += files
    .map(f => {
      const ext = path.extname(f.path).slice(1) || ''; // เอานามสกุลไปใช้กับ code block
      return `### \`${f.path}\`\n\n\`\`\`${ext}\n${f.content}\n\`\`\`\n`;
    })
    .join('\n');

  for (const file of files) {
    console.log(`File: ${file.path}`);
  }

  await clipboard.write(output);

  if (argv.flags.print) {
    console.log(output);
  }

  console.log(`📋 Copied ${files.length} file(s) from ${cwd} to clipboard (Markdown format).`);
}
main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});