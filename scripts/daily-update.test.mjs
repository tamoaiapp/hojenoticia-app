import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { collectUpdates, parseArgs, summarizeUpdates } from './daily-update.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));

test('defaults run all modules; selected modules retain order and are not run twice', () => {
  assert.deepEqual(parseArgs([]), { only: null, noPush: false });
  assert.deepEqual(parseArgs(['--no-push', '--only= loterias,cambio,loterias ']), {
    only: ['loterias', 'cambio'], noPush: true,
  });
});

test('empty, unknown and repeated module flags are rejected instead of succeeding without an update', () => {
  for (const args of [
    ['--only='], ['--only= '], ['--only=loterias,'], ['--only=,cambio'],
    ['--only=lotarias'], ['--only=loterias,missing'], ['--only=toString'],
    ['--only=loterias', '--only=cambio'], ['--only'], ['--no-puhs'], ['unexpected'],
  ]) assert.throws(() => parseArgs(args), /inválido|apenas uma vez|desconhecido/);
});

test('invalid CLI arguments fail before logs, writes, collection or git operations', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hoje-update-cli-'));
  try {
    const result = spawnSync(process.execPath, [path.join(directory, 'daily-update.mjs'), '--only=lotarias', '--no-push'], {
      cwd: fixture, encoding: 'utf8', timeout: 10_000,
      env: { ...process.env, GITHUB_OUTPUT: path.join(fixture, 'output'), GITHUB_STEP_SUMMARY: path.join(fixture, 'summary') },
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Módulo inválido/);
    assert.equal(result.stdout, '');
    assert.deepEqual(fs.readdirSync(fixture), []);
  } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
});

test('one failed module does not stop valid updates; partial failures stay visible in the summary', async () => {
  const calls = [], errors = [], warnings = [];
  const modules = {
    loterias: async options => {
      calls.push(['loterias', options]);
      return { changes: 2, errors: ['quina: HTTP 503'], summary: 'partial' };
    },
    cambio: async options => {
      calls.push(['cambio', options]);
      throw new Error('Fonte HTTP 429');
    },
    horoscopo: async options => {
      calls.push(['horoscopo', options]);
      return { changes: 2, summary: 'updated', warnings: ['Fonte com aviso\n20%'] };
    },
  };
  const stats = await collectUpdates({ root: '/synthetic', today: '2026-11-08', modules,
    logger: { log() {}, error: value => errors.push(value), warn: value => warnings.push(value) },
  });
  assert.deepEqual(calls.map(([name]) => name), ['loterias', 'cambio', 'horoscopo']);
  assert.ok(calls.every(([, options]) => options.root === '/synthetic' && options.today === '2026-11-08'));
  assert.deepEqual(summarizeUpdates(stats), { totalChanges: 4, failedModules: ['loterias', 'cambio'] });
  assert.ok(errors.some(value => value.includes('title=Atualização de loterias::quina: HTTP 503')));
  assert.ok(errors.some(value => value.includes('title=Atualização de cambio::Fonte HTTP 429')));
  assert.deepEqual(warnings, ['::warning title=Atualização de horoscopo::Fonte com aviso%0A20%25']);
});

test('unchanged failed collection is a failure; warnings alone are reported without a false failure', () => {
  assert.deepEqual(summarizeUpdates({ cambio: { error: 'HTTP 429' } }), { totalChanges: 0, failedModules: ['cambio'] });
  assert.deepEqual(summarizeUpdates({ cambio: { changes: 0, warnings: ['alternate source'] } }), { totalChanges: 0, failedModules: [] });
});

test('selection limits the collected modules, preserving independent no-op updates', async () => {
  const stats = await collectUpdates({ today: '2026-11-08', only: ['loterias'], modules: {
    loterias: async () => ({ changes: 0, summary: 'unchanged' }),
    cambio: async () => { throw new Error('must not be called'); },
  }, logger: { log() {}, warn() {}, error() {} } });
  assert.deepEqual(stats, { loterias: { changes: 0, summary: 'unchanged' } });
  assert.deepEqual(summarizeUpdates(stats), { totalChanges: 0, failedModules: [] });
});

for (const updaterExit of [0, 7]) {
  test(`Windows wrapper resolves its own repository and propagates updater status ${updaterExit}`, { skip: process.platform !== 'win32' }, () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hoje-wrapper-'));
    try {
      const scripts = path.join(fixture, 'scripts');
      fs.mkdirSync(scripts);
      const wrapper = path.join(scripts, 'run-updater.ps1');
      fs.copyFileSync(path.join(directory, 'run-updater.ps1'), wrapper);
      const quoted = value => `'${value.replaceAll("'", "''")}'`;
      const command = [
        'function Test-NetConnection { return $true }',
        `function node { if ($PWD.Path -ne ${quoted(fixture)}) { $global:LASTEXITCODE = 99 } else { $global:LASTEXITCODE = ${updaterExit} }; Write-Output 'synthetic updater' }`,
        `& ${quoted(wrapper)}`,
      ].join('; ');
      const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', command], { cwd: os.tmpdir(), encoding: 'utf8', timeout: 20_000 });
      assert.equal(result.error, undefined);
      if (updaterExit === 0) assert.equal(result.status, 0, result.stderr);
      else assert.notEqual(result.status, 0, result.stderr);
      const logs = fs.readdirSync(path.join(scripts, 'logs'));
      assert.equal(logs.length, 1);
      assert.match(fs.readFileSync(path.join(scripts, 'logs', logs[0]), 'utf8'), new RegExp(`Exit code: ${updaterExit}`));
    } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
  });
}
