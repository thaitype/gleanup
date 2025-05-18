import { cli } from 'cleye';
import { glob } from 'glob';
import { readFile, stat, writeFile } from 'fs/promises';
import path from 'path';
import clipboard from 'clipboardy';
import c from 'ansis';
import { MARK_BULLET, MARK_CHECK, MARK_INFO } from './constant';
import { version } from './version';

const argv = cli({
  name: 'gleanup',
  parameters: ['[directory]'],
  flags: {
    ext: {
      type: String,
      description: 'Filter by file extension (e.g. .ts)',
      default: '',
    },
    output: {
      type: String,
      description: 'Write output to a file (Markdown format)',
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
    pattern: {
      type: String,
      description: 'Glob pattern to match files (default: "**")',
      default: '**',
    },
  },
});

const DEFUALT_IGNORE = ['node_modules/**', '.git/**', 'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'bun.lock'];

const cwd = path.resolve(argv._.directory || process.cwd());
const extFilter = argv.flags.ext;
const ignorePatterns = argv.flags.ignore;

async function listFilesWithContent() {
  const files = await glob(argv.flags.pattern, {
    cwd,
    ignore: [...DEFUALT_IGNORE, ...ignorePatterns],
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
  console.log(c.bold(c.blue(`\n${MARK_INFO} Gleanup - File dumper v${version}`)));

  console.log(`\n${MARK_INFO} Searching for files in:\n   ${cwd}\n`);
  if (extFilter) {
    console.log(`${MARK_BULLET} Extension: "${extFilter}"`);
  } else {
    console.log(`${MARK_BULLET} Extension: "all"`);
  }
  console.log(`${MARK_BULLET} Pattern: "${argv.flags.pattern}"`);
  console.log(`${MARK_BULLET} Ignoring:`);
  const allIgnore = [...DEFUALT_IGNORE, ...ignorePatterns];
  for (const ig of allIgnore) {
    console.log(`   ${MARK_BULLET} ${ig}`);
  }
  const files = await listFilesWithContent();

  let output = `## 🧾 File dump from \`${cwd}\`\n\n`;

  output += files
    .map(f => {
      const ext = path.extname(f.path).slice(1) || ''; // เอานามสกุลไปใช้กับ code block
      return `### \`${f.path}\`\n\n\`\`\`${ext}\n${f.content}\n\`\`\`\n`;
    })
    .join('\n');

  console.log(c.bold(`\n${MARK_INFO} Files collected:`));
  for (const file of files) {
    console.log(`   ${MARK_BULLET} ${file.path}`);
  }

  if (argv.flags.output) {
    const outputPath = path.resolve(argv.flags.output);
    await writeFile(outputPath, output, 'utf-8');
    console.log(`📝 Written output to ${outputPath}`);
  }

  await clipboard.write(output);

  if (argv.flags.print) {
    console.log(output);
  }

  if(files.length === 0) {
    throw new Error('No files found matching the criteria.');
  }

  console.log(c.green(`\n${MARK_CHECK} Copied ${files.length} file(s) from ${cwd} to clipboard`));
}
main().catch(err => {
  console.error('\n❌ Error:\n', err);
  process.exit(1);
});