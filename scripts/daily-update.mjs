/**
 * ORQUESTRADOR DIÁRIO — roda 1x por dia (Task Scheduler ~21h30).
 *
 * Faz TODOS os updates locais e ao final faz UM ÚNICO commit + push.
 * Isso garante 1 build/dia no Vercel (economia de minutos de build).
 *
 * Ordem:
 *   1. Loterias  — atualiza concursos "aguardando" → "publicado"
 *   2. Câmbio    — busca dólar/euro/bitcoin/ouro do dia
 *   3. Horóscopo — gera previsão dos 12 signos pro dia seguinte
 *   4. Feriados  — atualiza JSON estático (raramente muda, mas check semanal)
 *
 * Cada módulo é resiliente: se um falhar, os outros continuam.
 * No final, commit único agrega tudo.
 *
 * Uso:
 *   node scripts/daily-update.mjs            # roda tudo + commit/push
 *   node scripts/daily-update.mjs --no-push  # roda tudo, não faz commit
 *   node scripts/daily-update.mjs --only=cambio,horoscopo
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import { updateLoterias } from './modules/loterias.mjs';
import { updateCambio } from './modules/cambio.mjs';
import { updateHoroscopo } from './modules/horoscopo.mjs';
import { updateFeriados } from './modules/feriados.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const MODULES = {
  loterias:  updateLoterias,
  cambio:    updateCambio,
  horoscopo: updateHoroscopo,
  feriados:  updateFeriados,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const onlyFlag = args.find(a => a.startsWith('--only='));
  const only = onlyFlag ? onlyFlag.split('=')[1].split(',').map(s => s.trim()) : null;
  const noPush = args.includes('--no-push');
  return { only, noPush };
}

async function main() {
  const { only, noPush } = parseArgs();
  const today = new Date().toISOString().split('T')[0];

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  DAILY UPDATE — ${today}`);
  console.log(`${'='.repeat(60)}\n`);

  const toRun = only
    ? only.filter(k => MODULES[k])
    : Object.keys(MODULES);

  const stats = {};
  for (const key of toRun) {
    console.log(`\n▶  Módulo: ${key.toUpperCase()}`);
    console.log('-'.repeat(60));
    try {
      const result = await MODULES[key]({ root: ROOT, today });
      stats[key] = result;
      console.log(`✅ ${key}: ${result.summary || 'ok'}`);
    } catch (e) {
      stats[key] = { error: e.message };
      console.error(`❌ ${key}: ${e.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('  RESUMO');
  console.log(`${'='.repeat(60)}`);
  for (const [key, s] of Object.entries(stats)) {
    if (s.error) console.log(`  ❌ ${key.padEnd(12)} ${s.error}`);
    else console.log(`  ✅ ${key.padEnd(12)} ${s.summary || 'ok'}`);
  }

  const totalChanges = Object.values(stats).reduce((acc, s) => acc + (s.changes || 0), 0);

  if (totalChanges === 0) {
    console.log('\nℹ️  Sem mudanças hoje. Nenhum commit feito.');
    return;
  }

  if (noPush) {
    console.log(`\n📦 ${totalChanges} mudança(s) prontas. --no-push: não vou commitar.`);
    return;
  }

  console.log(`\n📦 ${totalChanges} mudança(s) detectadas. Commitando...`);
  try {
    process.chdir(ROOT);
    execSync('git add content/', { stdio: 'inherit' });
    const changeLines = Object.entries(stats)
      .filter(([, s]) => s.changes > 0)
      .map(([k, s]) => `${k}: ${s.summary}`)
      .join(' | ');
    const msg = `daily-update ${today} — ${changeLines}`;
    execSync(`git diff --cached --quiet || git commit -m "${msg.replace(/"/g, "'")}"`, { stdio: 'inherit', shell: true });
    execSync('git push', { stdio: 'inherit' });
    console.log('\n🚀 Deploy iniciado no Vercel (1 build/dia).');
  } catch (e) {
    console.error('Erro no git push:', e.message);
    process.exit(1);
  }
}

main().catch(e => { console.error('Erro fatal:', e); process.exit(1); });
