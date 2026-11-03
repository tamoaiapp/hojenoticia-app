import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import sharp from 'sharp';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
async function read(path, status = 200) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, status, `${path} status`);
  return response.text();
}

const result = await read('/loterias/mega-sena/concurso-3080');
const sectionStart = result.indexOf('<section class="draw-result"');
const sectionEnd = result.indexOf('</section>', sectionStart);
const calloutStart = result.indexOf('<aside class="post-result-cta"');
assert.ok(sectionStart > 0 && sectionEnd > sectionStart && calloutStart > sectionEnd, 'CTA must follow the published result');
const callout = result.slice(calloutStart, result.indexOf('</aside>', calloutStart));
assert.match(callout, /href="\/loterias\/mega-sena\/probabilidades"/);
assert.equal((callout.match(/<a\b/g) || []).length, 1, 'Only the image is linked');
assert.match(callout, /<a class="post-result-image-link" href="\/loterias\/mega-sena\/probabilidades"/);
assert.doesNotMatch(callout, /post-result-button|<h2[^>]*>\s*<a/);
assert.match(callout, /Imagem ilustrativa gerada por IA/);
assert.match(callout, /data-ad-unit-id="32081506"/);
assert.match(callout, /data-ad-enabled="(?:true|false)"/);
const advertisingEnabled = callout.includes('data-ad-enabled="true"');
if (advertisingEnabled) {
  assert.match(callout, /Publicidade ao clicar/);
  assert.match(callout, /O clique também abre publicidade em outra aba/);
} else {
  assert.doesNotMatch(callout, /Publicidade ao clicar|Abre publicidade em outra aba/);
}
assert.doesNotMatch(callout, /Ao navegar, o site pode abrir publicidade em outra aba/);
assert.doesNotMatch(callout, /ganhei|ganhador|método para ganhar|window\.open|target="_blank"/i);
assert.doesNotMatch(result, /adsterra-popunder|https:\/\/abscloud\.org\//, 'Results must not load a page-wide popunder');
assert.doesNotMatch(await read('/'), /adsterra-popunder|https:\/\/abscloud\.org\//, 'Home must not load a page-wide popunder');
assert.doesNotMatch(await read('/loterias/lotofacil/concurso-3910'), /<aside class="post-result-cta"/);

const quina = await read('/loterias/quina/concurso-7157');
const quinaStart = quina.indexOf('<aside class="post-result-cta"');
assert.ok(quinaStart > 0, 'Published Quina results have an educational image');
const quinaCallout = quina.slice(quinaStart, quina.indexOf('</aside>', quinaStart));
assert.match(quinaCallout, /href="\/loterias\/quina\/estatisticas"/, 'Other games keep their own context');
assert.doesNotMatch(quinaCallout, /href="\/loterias\/mega-sena\/probabilidades"/);
assert.equal((quinaCallout.match(/<a\b/g) || []).length, 1);

const probabilities = await read('/loterias/mega-sena/probabilidades');
assert.doesNotMatch(probabilities, /adsterra-popunder|https:\/\/abscloud\.org\//, 'Image destination must not load a page-wide popunder');
assert.match(probabilities, /50\.063\.860/);
assert.match(probabilities, /rel="canonical" href="https:\/\/www\.hojenoticia\.com\/loterias\/mega-sena\/probabilidades"/);
assert.equal((probabilities.match(/<tr(?:\s|>)/g) || []).length, 16, '15 table rows plus heading');
assert.match(probabilities, /aria-label="Comparar quantidades de dezenas"/);
assert.match(probabilities, /href="#calculadora"/);
assert.match(await read('/sitemap.xml'), /\/loterias\/mega-sena\/probabilidades<\/loc>/);
await read('/loterias/quina/probabilidades', 404);

const hashes = new Set();
let bytes = 0;
let nextIndex = 1;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (nextIndex <= 20) {
    const id = String(nextIndex++).padStart(2, '0');
    const response = await fetch(`${base}/images/post-result/creative-${id}.webp`);
    assert.equal(response.status, 200, `creative-${id} status`);
    assert.match(response.headers.get('content-type'), /image\/webp/);
    const image = Buffer.from(await response.arrayBuffer());
    const meta = await sharp(image).metadata();
    assert.equal(meta.width, 960);
    assert.equal(meta.height, 640);
    assert.ok(image.length < 200000, 'Each optimized asset should be under 200 KB');
    hashes.add(crypto.createHash('sha256').update(image).digest('hex'));
    bytes += image.length;
  }
}));
assert.equal(hashes.size, 20, '20 distinct images required');
console.log(JSON.stringify({ base, calloutAfterResult: true, advertisingEnabled, futureUnaffected: true, probabilities: 'valid', distinctImages: hashes.size, imageBytes: bytes }, null, 2));
