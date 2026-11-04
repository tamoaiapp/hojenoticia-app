import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../lib/draw-editorial.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { getDrawSearchCopy, getDrawResultParagraphs, removeManagedDrawContent } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const base = overrides => ({ loteria: 'quina', concurso: 7158, status: 'publicado', draw_date: '2026-11-03', numeros: ['23', '25', '44', '51', '68'], ganhadores: 0, premio_principal: 0, rateio: [], ...overrides });

test('future metadata never exposes an unconfirmed legacy date or old prize', () => {
  const record = base({ status: 'aguardando', schedule_status: 'unconfirmed', draw_date: '2026-05-12', premio_principal: 1234567, numeros: [] });
  const text = JSON.stringify(getDrawSearchCopy(record, 'Quina'));
  assert.ok(text.includes('7158'));
  assert.ok(!text.includes('12/05/2026'));
  assert.ok(!text.includes('1234567'));
  assert.deepEqual(getDrawResultParagraphs(record, 'Quina'), []);
});

test('confirmed and published metadata distinguish schedule from result', () => {
  const pending = getDrawSearchCopy(base({ status: 'aguardando', schedule_status: 'confirmed', numeros: [] }), 'Quina');
  const published = getDrawSearchCopy(base(), 'Quina');
  assert.ok(pending.title.includes('03/11/2026'));
  assert.ok(!pending.description.includes('23, 25, 44'));
  assert.ok(published.description.includes('23, 25, 44, 51, 68'));
  assert.notEqual(pending.description, published.description);
});

test('missing rateio does not convert the default winner count into an asserted zero', () => {
  const unknown = getDrawResultParagraphs(base(), 'Quina').join(' ');
  const confirmed = getDrawResultParagraphs(base({ rateio: [{ faixa: 1, descricao: '5 acertos', ganhadores: 0, premio: 0 }], acumulou: true }), 'Quina').join(' ');
  assert.doesNotMatch(unknown, /zero apostas ganhadoras/);
  assert.match(confirmed, /zero apostas ganhadoras/);
  assert.match(confirmed, /acumulou/);
});

test('Federal tickets retain leading zeroes and the official prize order', () => {
  const numbers = ['056338', '001871', '024389', '062267', '030022'];
  const text = getDrawResultParagraphs(base({ loteria: 'federal', numeros: numbers }), 'Loteria Federal').join(' ');
  assert.ok(text.indexOf(numbers[0]) < text.indexOf(numbers[1]));
  assert.ok(text.indexOf(numbers[1]) < text.indexOf(numbers[4]));
  assert.ok(numbers.every(number => text.includes(number)));
  assert.doesNotMatch(text, /zero apostas ganhadoras/);
});

test('Super Sete keeps repeated digits associated with all seven positions', () => {
  const text = getDrawResultParagraphs(base({ loteria: 'super-sete', numeros: ['1', '9', '2', '9', '4', '6', '5'] }), 'Super Sete').join(' ');
  assert.match(text, /coluna 2: 9/);
  assert.match(text, /coluna 4: 9/);
  assert.match(text, /coluna 7: 5/);
});

test('two Dupla Sena draws and +Milionaria trevos remain separate facts', () => {
  const text = getDrawResultParagraphs(base({ loteria: 'dupla-sena', numeros: ['01', '02', '03', '04', '05', '06'], numeros_segundo_sorteio: ['11', '12', '13', '14', '15', '16'] }), 'Dupla Sena').join(' ');
  assert.match(text, /01 – 02 – 03 – 04 – 05 – 06/);
  assert.match(text, /11 – 12 – 13 – 14 – 15 – 16/);
  const trevos = getDrawResultParagraphs(base({ loteria: 'maismilionaria', trevos_sorteados: ['2', '6'] }), '+Milionária').join(' ');
  assert.match(trevos, /2 e 6/);
});

test('replacing recognised boilerplate preserves separately authored sections', () => {
  const input = '## Resultado do concurso 7158\n\nO número do concurso e a data identificam o resultado apresentado nesta página.\n\n## Nota da redação\n\nDetalhamento apurado pelo editor.\n\n## Fonte e correções\n\nReferência para conferência: fonte oficial.';
  const cleaned = removeManagedDrawContent(input);
  assert.match(cleaned, /Nota da redação/);
  assert.match(cleaned, /Detalhamento apurado pelo editor/);
  assert.doesNotMatch(cleaned, /O número do concurso e a data identificam|Referência para conferência/);
});

test('rendering editorial content never changes factual fields or source timestamps', () => {
  const record = base({ rateio: [{ faixa: 1, descricao: '5 acertos', ganhadores: 1, premio: 12345.67 }], source_checked_at: '2026-11-04T06:23:36Z', published_at: '2026-11-04T06:23:36Z' });
  const before = JSON.stringify(record);
  getDrawResultParagraphs(record, 'Quina');
  getDrawSearchCopy(record, 'Quina');
  assert.equal(JSON.stringify(record), before);
});
