import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { updateLoterias } from './loterias.mjs';

test('recovers a result whose local forecast date is still in the future', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hojenoticia-loterias-'));
  const dir = path.join(root, 'content', 'loterias', 'mega-sena');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'concurso-3057.mdx'), 'status: publicado\n');
  fs.writeFileSync(path.join(dir, 'concurso-3058.mdx'), 'status: aguardando\ndraw_date: "2026-11-04"\n');
  fs.writeFileSync(path.join(dir, 'concurso-3059.mdx'), 'status: aguardando\ndraw_date: "2026-11-07"\n');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(url, 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena');
    return new Response(JSON.stringify({
      numero: 3058,
      dataApuracao: '15/09/2026',
      listaDezenas: ['01', '02', '03', '04', '05', '06'],
      numeroConcursoProximo: 3059,
      dataProximoConcurso: '17/09/2026',
      valorEstimadoProximoConcurso: 1000000,
      listaRateioPremio: [{ numeroDeGanhadores: 0, valorPremio: 0 }],
    }), { status: 200 });
  };

  try {
    const result = await updateLoterias({ root, today: '2026-11-03' });
    assert.deepEqual(result.errors, []);
    assert.match(fs.readFileSync(path.join(dir, 'concurso-3058.mdx'), 'utf-8'), /status: publicado[\s\S]*draw_date: "2026-09-15"/);
    assert.equal(fs.existsSync(path.join(dir, 'concurso-3059.mdx')), false);
  } finally {
    globalThis.fetch = originalFetch;
    fs.rmSync(root, { recursive: true, force: true });
  }
});
