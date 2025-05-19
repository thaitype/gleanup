import { cli } from 'cleye';
import { globby } from 'globby';
import { readFile, stat, writeFile } from 'fs/promises';
import path from 'path';
import clipboard from 'clipboardy';
import c from 'ansis';
import { MARK_BULLET, MARK_CHECK, MARK_ERROR, MARK_INFO } from './constant';
import { version } from './version';
import { existsSync } from 'fs';
import { isText } from 'istextorbinary';
import prettyBytes from 'pretty-bytes';
import { error } from 'console';

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

function logger(...args: any[]) {
  if (argv.flags.print) return;
  console.log(...args);
}

const DEFUALT_IGNORE = ['.git/**', 'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'bun.lock'];

const cwd = path.resolve(argv._.directory || process.cwd());
const extFilter = argv.flags.ext;
const ignorePatterns = argv.flags.ignore;

async function listFilesWithContent() {
  const files = await globby(argv.flags.pattern, {
    cwd,
    ignore: [...DEFUALT_IGNORE, ...ignorePatterns],
    gitignore: true,
  });

  const results = await Promise.all(
    files.map(async file => {
      const fullPath = path.join(cwd, file);
      const fileStat = await stat(fullPath);
      if (!fileStat.isFile()) return null;

      // ⛔ Skip non-text files
      const isTextFile = isText(fullPath);
      if (!isTextFile) return null;

      if (extFilter && !file.endsWith(extFilter)) return null;

      return {
        path: file,
        content: await readFile(fullPath, 'utf-8'),
      };
    })
  );

  return results.filter(Boolean) as { path: string; content: string }[];
}

function checkGitIgnore() {
  const gitignorePath = path.join(cwd, '.gitignore');
  const hasGitignore = existsSync(gitignorePath);

  if (hasGitignore) {
    logger(`   ${MARK_BULLET} ${c.bold('.gitignore')} found – applying its rules`);
  } else {
    logger(`   ${MARK_BULLET} ${c.bold('.gitignore')} not found – no rules applied`);
  }
}

function logInfomation() {
  logger(c.bold(c.blue(`\n${c.bgBlue('Gleanup')} v${version} - Dump files as Markdown to clipboard\n`)));

  logger(`\n${MARK_INFO} Target directory::\n   ${cwd}\n`);
  logger(`${MARK_INFO} Scan settings:`);
  if (extFilter) {
    logger(`   ${MARK_BULLET} Extension: .${extFilter}`);
  } else {
    logger(`   ${MARK_BULLET} Extension: (no filter)`);
  }
  logger(`   ${MARK_BULLET} Pattern: "${argv.flags.pattern}"`);
  logger(`   ${MARK_BULLET} Ignored: ${ignorePatterns.length === 0 ? '(none)' : ignorePatterns.map(p => `"${p}"`).join(', ')}`);
  checkGitIgnore();
}

function outputStats(content: string) {
  const byteSize = Buffer.byteLength(content, 'utf-8');
  const readableSize = prettyBytes(byteSize);

  logger(c.bold(`\n${MARK_INFO} Summary Output size: ${readableSize}`));
}

async function main() {
  logInfomation();

  const files = await listFilesWithContent();

  let output = `## 🧾 File dump from \`${cwd}\`\n\n`;

  output += files
    .map(f => {
      const ext = path.extname(f.path).slice(1) || ''; // เอานามสกุลไปใช้กับ code block
      return `### \`${f.path}\`\n\n\`\`\`${ext}\n${f.content}\n\`\`\`\n`;
    })
    .join('\n');

  logger(c.bold(`\n${MARK_INFO} Files collected:`));
  for (const file of files) {
    logger(`   ${MARK_BULLET} ${file.path}`);
  }

  if (argv.flags.output) {
    const outputPath = path.resolve(argv.flags.output);
    await writeFile(outputPath, output, 'utf-8');
    logger(`📝 Written output to ${outputPath}`);
  }

  await clipboard.write(output);

  if (argv.flags.print) {
    console.log(output);
  }

  if (files.length === 0) {
    throw new Error('No files found matching the criteria.');
  }

  outputStats(output);
  logger(c.green(`\n${MARK_CHECK} Copied ${files.length} file(s) to clipboard from:\n  ${cwd}\n`));
  logger(c.bold(`${MARK_CHECK} Done!\n`));
}
main().catch(err => {
  if (err instanceof Error) {
    if (err.message.includes('No files found matching the criteria.')) {
      console.error(c.red(`\n${MARK_ERROR} Error: ${err.message}\n`));
    } else {
      console.error(c.red(`\n${MARK_ERROR} Something wrong: `), err);
    }
  } else {
    console.error(c.red(`\n${MARK_ERROR} Something wrong: ${err}\n`));
  }
  process.exit(1);
});