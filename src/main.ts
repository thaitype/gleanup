import { cli } from 'cleye';
import tinyGlob from 'tiny-glob';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import clipboard from 'clipboardy';

const argv = cli({
  name: 'readup',
  parameters: ['<directory>'],
  flags: {
    ext: {
      type: String,
      description: 'Filter by file extension (e.g. .ts)',
      default: '',
    },
    print: {
      type: Boolean,
      description: 'Also print to stdout',
      default: false,
    },
  },
});

const cwd = path.resolve(argv._.directory);
const extFilter = argv.flags.ext;

async function listFilesWithContent() {
  const files = await tinyGlob('**', { cwd });

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
  let output = `Working Directory: ${cwd}\n\n`;
  output += files
    .map(f => `--------\n// Path: ${f.path}\n\n${f.content}`)
    .join('\n\n');

  await clipboard.write(output);

  if (argv.flags.print) {
    console.log(output);
  }

  console.log(`📋 Copied ${files.length} file(s) from ${cwd} to clipboard.`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});