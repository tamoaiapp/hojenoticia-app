/**
 * Módulo: Horóscopo.
 * Gera horóscopo dos 12 signos pro dia atual usando templates determinísticos
 * (seed = data + signo). Geração sem API de IA; conteúdo varia por dia/signo.
 *
 * Output: content/horoscopo/{YYYY-MM-DD}.json + latest.json
 */
import fs from 'fs';
import path from 'path';

const SIGNOS = [
  { slug: 'aries',       name: 'Áries',       periodo: '21/03 a 19/04', elemento: 'fogo',  regente: 'Marte'   },
  { slug: 'touro',       name: 'Touro',       periodo: '20/04 a 20/05', elemento: 'terra', regente: 'Vênus'   },
  { slug: 'gemeos',      name: 'Gêmeos',      periodo: '21/05 a 20/06', elemento: 'ar',    regente: 'Mercúrio'},
  { slug: 'cancer',      name: 'Câncer',      periodo: '21/06 a 22/07', elemento: 'água',  regente: 'Lua'     },
  { slug: 'leao',        name: 'Leão',        periodo: '23/07 a 22/08', elemento: 'fogo',  regente: 'Sol'     },
  { slug: 'virgem',      name: 'Virgem',      periodo: '23/08 a 22/09', elemento: 'terra', regente: 'Mercúrio'},
  { slug: 'libra',       name: 'Libra',       periodo: '23/09 a 22/10', elemento: 'ar',    regente: 'Vênus'   },
  { slug: 'escorpiao',   name: 'Escorpião',   periodo: '23/10 a 21/11', elemento: 'água',  regente: 'Plutão'  },
  { slug: 'sagitario',   name: 'Sagitário',   periodo: '22/11 a 21/12', elemento: 'fogo',  regente: 'Júpiter' },
  { slug: 'capricornio', name: 'Capricórnio', periodo: '22/12 a 19/01', elemento: 'terra', regente: 'Saturno' },
  { slug: 'aquario',     name: 'Aquário',     periodo: '20/01 a 18/02', elemento: 'ar',    regente: 'Urano'   },
  { slug: 'peixes',      name: 'Peixes',      periodo: '19/02 a 20/03', elemento: 'água',  regente: 'Netuno'  },
];

// templates por área — varia por signo e por dia
const TEMPLATES = {
  geral: [
    'O dia pede {atitude1} e atenção aos {area1}. Uma {situacao1} pode surgir e abrir um caminho que você ainda não tinha considerado.',
    'A energia de hoje favorece {atitude1}, principalmente em assuntos ligados a {area1}. Aproveite para colocar em prática algo que vinha adiando.',
    'Você está com {qualidade1} em alta, o que ajuda a resolver {area1}. Evite tomar decisões apressadas no fim do dia.',
    'Período propício para revisar {area1} e ajustar o que não está funcionando. Sua {qualidade1} será sua maior aliada.',
    'Dia de movimento — {situacao1} pode aparecer no caminho. Use sua {qualidade1} pra aproveitar a oportunidade sem se precipitar.',
  ],
  amor: [
    'Nas relações, vale comunicar o que sente sem rodeios. Quem está só pode atrair alguém com perfil {perfil1}.',
    'O setor afetivo pede {atitude2}. Casais podem aproveitar para conversar sobre {tema1}. Solteiros, atenção a quem demonstra {perfil1}.',
    'A área amorosa fica favorecida no período da tarde. Uma reaproximação ou um diálogo importante pode acontecer.',
    'Astralmente, é dia de cuidar dos vínculos próximos. Demonstre carinho — pequenos gestos contam mais que grandes declarações hoje.',
    'No amor, evite drama por bobagem. A energia do dia pede {atitude2} e abertura para ouvir o outro.',
  ],
  trabalho: [
    'No trabalho, foco em {area2}. Uma conversa com {pessoa1} pode trazer clareza sobre um projeto.',
    'Dia de produtividade média — priorize o que é urgente em {area2}. Não pegue tarefa nova até resolver o que está pendente.',
    'Excelente momento para colocar ordem na agenda profissional. Sua {qualidade2} será notada por quem decide.',
    'Algo relacionado a {area2} pode demandar atenção extra. Mantenha a {qualidade2} mesmo sob pressão.',
    'O ambiente profissional pede colaboração. Trabalhos em equipe rendem mais que ações individuais hoje.',
  ],
  dinheiro: [
    'No financeiro, evite gastos por impulso. É dia bom pra planejar do que pra gastar.',
    'O setor material fica neutro — não é dia de grandes movimentos. Confira pendências e atualize seu orçamento.',
    'Uma oportunidade financeira pode aparecer, mas avalie com calma antes de aceitar. Pesquise alternativas.',
    'Dinheiro pede atenção a detalhes. Revise contas, vencimentos e assinaturas que você não usa mais.',
    'Bom momento para conversar sobre {tema2} com quem divide gastos com você. Transparência evita atrito.',
  ],
  saude: [
    'A saúde pede {atitude3}. Hidratação e uma caminhada leve já fazem diferença hoje.',
    'Energia mediana — não exagere em atividades pesadas. O corpo agradece um ritmo mais tranquilo.',
    'Cuide do sono: dormir bem é o que vai recuperar sua disposição. Evite telas perto da hora de deitar.',
    'Boa fase para retomar uma rotina de autocuidado. Pequenos hábitos consistentes valem mais que mudanças radicais.',
    'Atenção a tensões no {parte_corpo1}. Pausas curtas durante o dia ajudam a aliviar.',
  ],
};

const VARIAVEIS = {
  atitude1: ['paciência', 'iniciativa', 'cautela', 'coragem', 'flexibilidade', 'foco', 'serenidade'],
  atitude2: ['escuta ativa', 'sinceridade', 'leveza', 'presença', 'gentileza'],
  atitude3: ['equilíbrio', 'movimento', 'descanso', 'atenção ao corpo'],
  area1: ['rotina', 'família', 'estudos', 'projetos pessoais', 'relacionamentos', 'casa'],
  area2: ['organização', 'comunicação interna', 'um projeto antigo', 'um novo desafio', 'finanças do trabalho'],
  qualidade1: ['intuição', 'clareza mental', 'determinação', 'criatividade', 'sensibilidade'],
  qualidade2: ['disciplina', 'objetividade', 'capacidade de adaptação', 'empatia profissional'],
  situacao1: ['mensagem inesperada', 'oportunidade discreta', 'reencontro', 'convite', 'reflexão profunda'],
  perfil1: ['independente', 'carinhoso', 'comunicativo', 'discreto', 'criativo'],
  pessoa1: ['um colega', 'um superior', 'um cliente', 'uma pessoa do passado profissional'],
  tema1: ['planos futuros', 'rotina', 'finanças do casal', 'limites'],
  tema2: ['organização financeira', 'metas em comum', 'investimentos'],
  parte_corpo1: ['pescoço', 'ombros', 'lombar', 'estômago'],
};

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick(seed, arr) {
  return arr[seed % arr.length];
}

function fillTemplate(tpl, seed) {
  let s = seed;
  return tpl.replace(/\{(\w+)\}/g, (_, key) => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const arr = VARIAVEIS[key];
    if (!arr) return `{${key}}`;
    return pick(s, arr);
  });
}

function gerarHoroscopo(signo, dateISO) {
  const seed = hashSeed(`${signo.slug}-${dateISO}`);
  const out = {};
  let s = seed;

  for (const area of Object.keys(TEMPLATES)) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const tpl = pick(s, TEMPLATES[area]);
    out[area] = fillTemplate(tpl, s);
  }

  // Número da sorte (1-99) e cor da sorte
  const cores = ['vermelho', 'azul', 'verde', 'amarelo', 'roxo', 'rosa', 'branco', 'preto', 'dourado', 'prata', 'laranja'];
  s = (s * 16807) & 0x7fffffff;
  out.numero_sorte = (s % 99) + 1;
  s = (s * 48271) & 0x7fffffff;
  out.cor_sorte = pick(s, cores);

  return out;
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function readSnapshot(file) {
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  let data;
  try { data = JSON.parse(raw); } catch { return null; }
  const textFields = ['name', 'periodo', 'elemento', 'regente', ...Object.keys(TEMPLATES), 'cor_sorte'];
  if (!data || !validDate(data.date) || !data.signos || typeof data.signos !== 'object' || Array.isArray(data.signos)) return null;
  const stamp = typeof data.updated_at === 'string' ? new Date(data.updated_at) : null;
  if (!stamp || !Number.isFinite(stamp.getTime()) || stamp.toISOString() !== data.updated_at) return null;
  if (Object.keys(data.signos).length !== SIGNOS.length || !SIGNOS.every(signo => {
    const value = data.signos[signo.slug];
    return value && value.slug === signo.slug && textFields.every(field => typeof value[field] === 'string' && value[field].trim()) && Number.isInteger(value.numero_sorte) && value.numero_sorte >= 1 && value.numero_sorte <= 99;
  })) return null;
  return { data, raw };
}

function stableJSON(value) {
  if (Array.isArray(value)) return `[${value.map(stableJSON).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJSON(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

// Formatting, key order and the time of a repeated execution are not new content.
function sameContent(snapshot, data) {
  return !!snapshot && stableJSON({ date: snapshot.data.date, signos: snapshot.data.signos }) === stableJSON({ date: data.date, signos: data.signos });
}

export async function updateHoroscopo({ root, today, now = new Date() }) {
  if (!validDate(today)) throw new Error('Data do horóscopo inválida; use YYYY-MM-DD com uma data existente.');
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new Error('Horário de geração do horóscopo inválido.');
  const OUT_DIR = path.join(root, 'content', 'horoscopo');

  const data = {
    date: today,
    updated_at: now.toISOString(),
    signos: {},
  };

  for (const signo of SIGNOS) {
    data.signos[signo.slug] = {
      ...signo,
      ...gerarHoroscopo(signo, today),
    };
  }

  const latestPath = path.join(OUT_DIR, 'latest.json');
  const dailyPath  = path.join(OUT_DIR, `${today}.json`);

  const daily = readSnapshot(dailyPath), latest = readSnapshot(latestPath);
  // An unchanged day is also the source for repairing latest.json, retaining its
  // original generation time and bytes (including a Windows CRLF checkout).
  const snapshot = sameContent(daily, data) ? daily : sameContent(latest, data) ? latest : { data, raw: JSON.stringify(data, null, 2) };
  let changes = 0;
  const write = (file, raw) => {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(file, raw, 'utf8');
    changes++;
  };
  if (!sameContent(daily, data)) write(dailyPath, snapshot.raw);

  let targetLatest = snapshot;
  if (latest && latest.data.date > today) targetLatest = latest;
  else if (!latest) {
    // A retrospective repair must not point latest at an older day when a valid
    // newer daily snapshot survives, even if latest itself was lost or corrupt.
    const newerDays = fs.readdirSync(OUT_DIR).filter(name => /^\d{4}-\d{2}-\d{2}\.json$/.test(name) && name.slice(0, 10) > today).sort().reverse();
    for (const name of newerDays) {
      const saved = readSnapshot(path.join(OUT_DIR, name));
      if (saved && saved.data.date === name.slice(0, 10)) { targetLatest = saved; break; }
    }
  }
  if (!sameContent(latest, targetLatest.data)) write(latestPath, targetLatest.raw);

  return { changes, summary: changes ? `12 signos disponíveis; ${changes} arquivo(s) atualizado(s)` : 'horóscopo do dia já existe; nenhum conteúdo alterado' };
}
