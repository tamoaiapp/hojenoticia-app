/** Compatibility entrypoint: lottery publications use the shared verified pipeline. */
if (process.argv.some(arg => arg.startsWith('--only='))) {
  throw new Error('Use node scripts/daily-update.mjs --only=loterias [--no-push]. The shared updater reconciles all configured lotteries.');
}
process.argv.push('--only=loterias');
await import('./daily-update.mjs');
