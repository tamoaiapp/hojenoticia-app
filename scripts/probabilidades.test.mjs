import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

// Execute the real library without adding a TypeScript runtime dependency.
const source = fs.readFileSync(new URL('../lib/probabilidades.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics.length, 0, 'The probability library must transpile successfully');
const probabilityModule = { exports: {} };
new Function('require', 'module', 'exports', compiled.outputText)((name) => {
  assert.fail(`Unexpected dependency ${name}`);
}, probabilityModule, probabilityModule.exports);

const {
  combinacoes,
  calcularMegaSena,
  tabelaMegaSena,
  MEGA_SENA_TOTAL_RESULTADOS,
  MEGA_SENA_MIN_DEZENAS,
  MEGA_SENA_MAX_DEZENAS,
  MEGA_SENA_FONTE,
} = probabilityModule.exports;

// Independent fixture, checked against the Caixa portal on 2026-11-03.
// Source: https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx
// Section: Probabilidade. Columns: selected numbers, Sena, Quina, Quadra (1 in).
// In particular, the current portal lists 65 for Quadra with 13 selected numbers.
// No prices or prize-distribution rules are reproduced here.
const CAIXA_ODDS = [
  [6, 50063860, 154518, 2332],
  [7, 7151980, 44981, 1038],
  [8, 1787995, 17192, 539],
  [9, 595998, 7791, 312],
  [10, 238399, 3973, 195],
  [11, 108363, 2211, 129],
  [12, 54182, 1317, 90],
  [13, 29175, 828, 65],
  [14, 16671, 544, 48],
  [15, 10003, 370, 37],
  [16, 6252, 260, 29],
  [17, 4045, 188, 23],
  [18, 2697, 139, 19],
  [19, 1845, 105, 16],
  [20, 1292, 81, 13],
];

// Independent counting method: Pascal's additive recurrence, limited to k <= 6.
// This deliberately does not call combinacoes or repeat its BigInt product loop.
function pascalCounts(n) {
  const counts = [1, 0, 0, 0, 0, 0, 0];
  for (let row = 1; row <= n; row++) {
    for (let k = Math.min(row, 6); k >= 1; k--) counts[k] += counts[k - 1];
  }
  return counts;
}

test('all 45 rounded odds match the independent current Caixa table', () => {
  const rows = tabelaMegaSena();
  assert.equal(rows.length, 15);
  for (const [index, expected] of CAIXA_ODDS.entries()) {
    const actual = rows[index];
    assert.equal(actual.dezenas, expected[0]);
    assert.deepEqual(actual.faixas.map(item => item.acertos), [6, 5, 4]);
    assert.deepEqual(actual.faixas.map(item => item.nome), ['Sena', 'Quina', 'Quadra']);
    assert.deepEqual(
      actual.faixas.map(item => Math.round(item.umaEm)),
      expected.slice(1),
      `${actual.dezenas} selected numbers must match the official Sena, Quina and Quadra odds`,
    );
  }
});

test('six selected numbers have one Sena result out of exactly 50,063,860', () => {
  const simple = calcularMegaSena(6);
  assert.equal(MEGA_SENA_TOTAL_RESULTADOS, 50063860);
  assert.equal(simple.totalResultados, 50063860);
  assert.equal(simple.combinacoesCobertas, 1);
  assert.deepEqual(simple.faixas.map(item => item.resultadosFavoraveis), [1, 324, 21465]);
  assert.equal(simple.faixas[0].umaEm, 50063860);
  assert.equal(simple.faixas[0].probabilidade, 1 / 50063860);
});

test('seven and twenty selected numbers cover the exact number of six-number combinations', () => {
  const seven = calcularMegaSena(7);
  assert.equal(seven.combinacoesCobertas, 7);
  assert.equal(seven.faixas[0].resultadosFavoraveis, 7);
  assert.equal(seven.faixas[0].umaEm, 7151980);

  const twenty = calcularMegaSena(20);
  assert.equal(twenty.combinacoesCobertas, 38760);
  assert.equal(twenty.faixas[0].resultadosFavoraveis, 38760);
  assert.equal(twenty.faixas[0].probabilidade, 38760 / 50063860);
});

test('each exact-hit distribution is normalized and matches independent Pascal counts', () => {
  assert.equal(pascalCounts(60)[6], 50063860);
  for (let n = 6; n <= 20; n++) {
    const selected = pascalCounts(n);
    const remaining = pascalCounts(60 - n);
    const distribution = selected.map((count, k) => count * remaining[6 - k]);
    assert.equal(distribution.reduce((sum, count) => sum + count, 0), 50063860, `Vandermonde identity for n=${n}`);

    const result = calcularMegaSena(n);
    assert.equal(result.combinacoesCobertas, selected[6]);
    for (const faixa of result.faixas) {
      assert.equal(faixa.resultadosFavoraveis, distribution[faixa.acertos], `Exactly ${faixa.acertos} hits for n=${n}`);
      assert.ok(Number.isSafeInteger(faixa.resultadosFavoraveis));
      assert.equal(faixa.probabilidade, distribution[faixa.acertos] / 50063860);
      assert.equal(faixa.umaEm, 50063860 / distribution[faixa.acertos]);
      assert.ok(faixa.probabilidade > 0 && faixa.probabilidade < 1);
    }
  }
});

test('combination boundary cases are exact and reject eight invalid or unsafe inputs', () => {
  assert.equal(combinacoes(0, 0), 1);
  assert.equal(combinacoes(60, 0), 1);
  assert.equal(combinacoes(60, 60), 1);
  assert.equal(combinacoes(20, 6), 38760);

  const invalid = [[-1, 0], [60, 61], [61, 6], [6.5, 2], [60, -1], [NaN, 6], [Infinity, 6], [60, 30]];
  for (const args of invalid) assert.throws(() => combinacoes(...args), RangeError);
});

test('Mega-Sena rejects eight inputs outside the integer 6-to-20 domain', () => {
  const invalid = [0, 5, 21, 6.5, NaN, Infinity, '6', undefined];
  for (const value of invalid) assert.throws(() => calcularMegaSena(value), RangeError);
});

test('the supported range and source identify the official Mega-Sena rules', () => {
  assert.equal(MEGA_SENA_MIN_DEZENAS, 6);
  assert.equal(MEGA_SENA_MAX_DEZENAS, 20);
  assert.equal(MEGA_SENA_FONTE, 'https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx');
});
