import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

function loadTs(name, dependencies = {}) {
  const source = fs.readFileSync(new URL(`../lib/${name}.ts`, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled.outputText)((name) => {
    assert.ok(name in dependencies, `Unexpected dependency ${name}`);
    return dependencies[name];
  }, module, module.exports);
  return module.exports;
}

const config = loadTs('loterias-config');
function statsFor(lottery, draws) {
  return loadTs('estatisticas', {
    './loterias-config': config,
    './loterias': { getDrawsByLoteria: () => draws },
  }).calcularEstatisticas(lottery);
}
const draw = (concurso, numeros) => ({ concurso, numeros, status: 'publicado', draw_date: '2026-11-01' });

test('Lotomania includes all 100 numbers, including 00 and 99', () => {
  const stats = statsFor('lotomania', [draw(3000, ['00', '99'])]);
  assert.equal(stats.totalNumeros, 100);
  assert.equal(stats.frequencias.length, 100);
  assert.equal(stats.frequencias.find(item => item.numero === '00').vezes, 1);
  assert.equal(stats.frequencias.find(item => item.numero === '99').vezes, 1);
  assert.ok(!stats.frequencias.some(item => item.numero === '100'));
});

test('+Milionária keeps its full universe even when the small sample has no 50', () => {
  const stats = statsFor('maismilionaria', [draw(403, ['01', '02', '03', '04', '05', '06'])]);
  assert.equal(stats.totalNumeros, 50);
  assert.equal(stats.frequencias.find(item => item.numero === '50').vezes, 0);
});

test('gaps in an archive do not become supposedly observed draws without a number', () => {
  const stats = statsFor('quina', [draw(7001, ['01']), draw(7090, ['02']), draw(7091, ['02'])]);
  assert.equal(stats.totalConcursos, 3);
  assert.equal(stats.frequencias.find(item => item.numero === '01').atrasoConcursos, 2);
  assert.equal(stats.frequencias.find(item => item.numero === '02').atrasoConcursos, 0);
  assert.equal(stats.frequencias.find(item => item.numero === '03').atrasoConcursos, undefined);
});

test('ticket prizes and positional digits are not presented as interchangeable dozen statistics', () => {
  assert.equal(statsFor('federal', [draw(6114, ['056338', '001871'])]), null);
  assert.equal(statsFor('super-sete', [draw(917, ['1', '9', '2', '9', '4', '6', '5'])]), null);
});
