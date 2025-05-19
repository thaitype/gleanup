import { cli } from 'cleye';
// import { glob } from 'glob';
import { globby } from 'globby';
import { readFile, stat, writeFile } from 'fs/promises';
import path from 'path';
import clipboard from 'clipboardy';
import c from 'ansis';
import { MARK_BULLET, MARK_CHECK, MARK_INFO } from './constant';
import { version } from './version';
import { existsSync } from 'fs';

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
    console.log(`   ${MARK_BULLET} ${c.bold('.gitignore')} found – applying its rules`);
  } else {
    console.log(`   ${MARK_BULLET} ${c.bold('.gitignore')} not found – no rules applied`);
  }
}

function logInfomation() {
  console.log(c.bold(c.blue(`\n${MARK_INFO} ${c.bgBlue('Gleanup')} v${version} - Dump files as Markdown to clipboard\n`)));

  console.log(`\n${MARK_INFO} Target directory::\n   ${cwd}\n`);
  console.log(`${MARK_INFO} Scan settings:`);
  if (extFilter) {
    console.log(`   ${MARK_BULLET} Extension: .${extFilter}`);
  } else {
    console.log(`   ${MARK_BULLET} Extension: (no filter)`);
  }
  console.log(`   ${MARK_BULLET} Pattern: "${argv.flags.pattern}"`);
  console.log(`   ${MARK_BULLET} Ignored: ${ignorePatterns.length === 0 ? '(none)' : ignorePatterns.map(p => `"${p}"`).join(', ')}`);
  checkGitIgnore();
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

  if (files.length === 0) {
    throw new Error('No files found matching the criteria.');
  }

  console.log(c.green(`\n${MARK_CHECK} Copied ${files.length} file(s) to clipboard from:\n  ${cwd}\n`));
}
main().catch(err => {
  console.error('\n❌ Error:\n', err);
  process.exit(1);
});