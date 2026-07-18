import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { it } from 'node:test';

const CLI = path.join(__dirname, '..', 'dist', 'cli.js');
const TSCONFIG = path.join(__dirname, 'tsconfig.json');

it('CLI exits non-zero when main() throws (a crash must not report success)', () => {
  const crash = `
    process.cwd = () => {
      throw new TypeError("Cannot read properties of undefined (reading 'readFile')");
    };
    require(${JSON.stringify(CLI)});
  `;

  const res = spawnSync(process.execPath, ['-e', crash], { encoding: 'utf8' });

  assert.notStrictEqual(
    res.status,
    0,
    `expected a non-zero exit on crash, got ${res.status}\n${res.stderr}`
  );
  assert.match(res.stderr, /readFile|TypeError/);
});

it('CLI still exits 0 on a clean, non-crashing run', () => {
  const res = spawnSync(process.execPath, [CLI, '--project', TSCONFIG], {
    encoding: 'utf8'
  });

  assert.strictEqual(res.status, 0, res.stderr);
  assert.match(res.stdout, /No XSS vulnerabilities found/);
});
