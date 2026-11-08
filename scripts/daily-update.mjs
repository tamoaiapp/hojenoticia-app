/**
 * Atualização geral diária; execuções adicionais podem usar --only=loterias.
 *
 * Faz TODOS os updates locais e ao final faz UM ÚNICO commit + push.
 * Só há commit quando o conteúdo muda. A rotina leve de loterias pode
 * publicar um novo resultado ou uma correção após a divulgação oficial.
 *
 * Ordem:
 *   1. Loterias  — atualiza concursos "aguardando" → "publicado"
 *   2. Câmbio    — consulta seis pares em reais, com fontes alternativas
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
import fs from 'node:fs';
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

export function parseArgs(args = process.argv.slice(2)) {
  let only = null;
  let noPush = false;
  for (const arg of args) {
    if (arg === '--no-push') {
      noPush = true;
    } else if (arg.startsWith('--only=')) {
      if (only !== null) throw new Error('Use --only apenas uma vez.');
      const selected = arg.slice('--only='.length).split(',').map(value => value.trim());
      if (selected.some(key => !Object.hasOwn(MODULES, key))) {
        throw new Error(`Módulo inválido em --only. Opções: ${Object.keys(MODULES).join(', ')}.`);
      }
      only = [...new Set(selected)];
    } else {
      throw new Error(`Argumento desconhecido: ${arg}. Use --no-push ou --only=modulo.`);
    }
  }
  return { only, noPush };
}

const workflowMessage = value => String(value).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');

export async function collectUpdates({ root = ROOT, today, only = null, modules = MODULES, logger = console }) {
  const toRun = only ?? Object.keys(modules);
  const stats = {};
  for (const key of toRun) {
    logger.log(`\n▶  Módulo: ${key.toUpperCase()}`);
    logger.log('-'.repeat(60));
    try {
      const result = await modules[key]({ root, today });
      stats[key] = result;
      for (const warning of result.warnings ?? []) {
        logger.warn(`::warning title=Atualização de ${key}::${workflowMessage(warning)}`);
      }
      if (result.errors?.length) {
        logger.error(`❌ ${key}: ${result.summary || 'falhas na atualização'}`);
        for (const error of result.errors) logger.error(`::error title=Atualização de ${key}::${workflowMessage(error)}`);
      } else {
        logger.log(`✅ ${key}: ${result.summary || 'ok'}`);
      }
    } catch (e) {
      stats[key] = { error: e.message };
      logger.error(`::error title=Atualização de ${key}::${workflowMessage(e.message)}`);
    }
  }
  return stats;
}

export function summarizeUpdates(stats) {
  return {
    totalChanges: Object.values(stats).reduce((acc, result) => acc + (result.changes || 0), 0),
    failedModules: Object.keys(stats).filter(key => stats[key].error || stats[key].errors?.length),
  };
}

async function main() {
  const { only, noPush } = parseArgs();
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  DAILY UPDATE — ${today}`);
  console.log(`${'='.repeat(60)}\n`);

  const stats = await collectUpdates({ today, only });

  console.log(`\n${'='.repeat(60)}`);
  console.log('  RESUMO');
  console.log(`${'='.repeat(60)}`);
  for (const [key, s] of Object.entries(stats)) {
    if (s.error || s.errors?.length) console.log(`  ❌ ${key.padEnd(12)} ${s.error || s.summary}`);
    else console.log(`  ✅ ${key.padEnd(12)} ${s.summary || 'ok'}`);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    const cell = value => String(value ?? '').replace(/[\r\n]/g, ' ').replace(/\|/g, '\\|');
    const rows = Object.entries(stats).map(([key, result]) => {
      const failed = result.error || result.errors?.length;
      const status = failed ? 'Falha' : result.warnings?.length ? 'Atualizado com aviso' : 'OK';
      const detail = [result.error || result.summary, ...(result.errors ?? []), ...(result.warnings ?? [])].filter(Boolean).join('; ');
      return `| ${cell(key)} | ${status} | ${cell(detail)} |`;
    });
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
      '## Atualização de conteúdo', '', '| Módulo | Estado | Detalhes |', '| --- | --- | --- |', ...rows, '',
      'Falhas preservam os registros anteriores. O horário da fonte não é substituído pelo horário desta execução.', '',
    ].join('\n'));
  }

  const { totalChanges, failedModules } = summarizeUpdates(stats);
  const hasFailures = failedModules.length > 0;
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `failed_modules=${failedModules.join(',')}\n`);
  }

  if (totalChanges === 0) {
    console.log('\nℹ️  Sem mudanças hoje. Nenhum commit feito.');
    if (hasFailures) process.exitCode = 1;
    return;
  }

  if (noPush) {
    console.log(`\n📦 ${totalChanges} mudança(s) prontas. --no-push: não vou commitar.`);
    if (hasFailures) process.exitCode = 1;
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
    console.log('\n🚀 Alterações enviadas para o fluxo de deploy do repositório.');
    if (hasFailures) process.exitCode = 1;
  } catch (e) {
    console.error('Erro no git push:', e.message);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch(e => { console.error('Erro fatal:', e.message); process.exit(1); });
}
