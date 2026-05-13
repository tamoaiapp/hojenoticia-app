/**
 * Módulo: Horóscopo.
 * Gera horóscopo dos 12 signos pro dia atual usando templates determinísticos
 * (seed = data + signo). Custo zero, conteúdo varia por dia/signo.
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

export async function updateHoroscopo({ root, today }) {
  const OUT_DIR = path.join(root, 'content', 'horoscopo');
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const data = {
    date: today,
    updated_at: new Date().toISOString(),
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

  // Se já existe arquivo do dia idêntico, não recria
  const newContent = JSON.stringify(data, null, 2);
  if (fs.existsSync(dailyPath) && fs.readFileSync(dailyPath, 'utf-8') === newContent) {
    return { changes: 0, summary: 'horóscopo do dia já existe' };
  }

  fs.writeFileSync(latestPath, newContent, 'utf-8');
  fs.writeFileSync(dailyPath, newContent, 'utf-8');

  return { changes: 1, summary: '12 signos gerados' };
}
