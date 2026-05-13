/**
 * Módulo: Feriados nacionais brasileiros (Lei 662/49, 6.802/80, 10.607/02).
 * Calcula automaticamente os móveis (Páscoa, Carnaval, Sexta-feira Santa, Corpus Christi)
 * via algoritmo de Gauss / Meeus. Gera JSON estático.
 *
 * Output: content/feriados/{ano}.json
 */
import fs from 'fs';
import path from 'path';

function pascoa(ano) {
  // Algoritmo de Meeus/Jones/Butcher (Páscoa gregoriana)
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmtISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function weekday(date) {
  return ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'][date.getDay()];
}

function gerarFeriados(ano) {
  const p = pascoa(ano);
  const carnaval = addDays(p, -47);
  const carnavalSegunda = addDays(p, -48);
  const sextaSanta = addDays(p, -2);
  const corpus = addDays(p, 60);

  const fixos = [
    { data: `${ano}-01-01`, nome: 'Confraternização Universal', tipo: 'nacional',  facultativo: false },
    { data: `${ano}-04-21`, nome: 'Tiradentes',                  tipo: 'nacional',  facultativo: false },
    { data: `${ano}-05-01`, nome: 'Dia do Trabalhador',          tipo: 'nacional',  facultativo: false },
    { data: `${ano}-09-07`, nome: 'Independência do Brasil',     tipo: 'nacional',  facultativo: false },
    { data: `${ano}-10-12`, nome: 'Nossa Senhora Aparecida',     tipo: 'nacional',  facultativo: false },
    { data: `${ano}-11-02`, nome: 'Finados',                     tipo: 'nacional',  facultativo: false },
    { data: `${ano}-11-15`, nome: 'Proclamação da República',    tipo: 'nacional',  facultativo: false },
    { data: `${ano}-11-20`, nome: 'Dia da Consciência Negra',    tipo: 'nacional',  facultativo: false },
    { data: `${ano}-12-25`, nome: 'Natal',                       tipo: 'nacional',  facultativo: false },
  ];

  const moveis = [
    { data: fmtISO(carnavalSegunda), nome: 'Carnaval (segunda)',  tipo: 'nacional', facultativo: true  },
    { data: fmtISO(carnaval),        nome: 'Carnaval',            tipo: 'nacional', facultativo: true  },
    { data: fmtISO(sextaSanta),      nome: 'Sexta-feira Santa',   tipo: 'nacional', facultativo: false },
    { data: fmtISO(p),               nome: 'Páscoa',              tipo: 'nacional', facultativo: false },
    { data: fmtISO(corpus),          nome: 'Corpus Christi',      tipo: 'nacional', facultativo: true  },
  ];

  const todos = [...fixos, ...moveis]
    .map(f => ({
      ...f,
      dia_semana: weekday(new Date(f.data + 'T12:00:00')),
    }))
    .sort((a, b) => a.data.localeCompare(b.data));

  return todos;
}

export async function updateFeriados({ root }) {
  const OUT_DIR = path.join(root, 'content', 'feriados');
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  // Sempre cobrir ano corrente, próximo e o seguinte
  const anos = [anoAtual, anoAtual + 1, anoAtual + 2];
  let changes = 0;

  for (const ano of anos) {
    const data = {
      ano,
      atualizado_em: new Date().toISOString().split('T')[0],
      feriados: gerarFeriados(ano),
    };
    const fp = path.join(OUT_DIR, `${ano}.json`);
    const newContent = JSON.stringify(data, null, 2);
    const prev = fs.existsSync(fp) ? fs.readFileSync(fp, 'utf-8') : '';
    if (prev !== newContent) {
      fs.writeFileSync(fp, newContent, 'utf-8');
      changes++;
    }
  }

  return {
    changes,
    summary: changes === 0 ? 'feriados atualizados' : `${changes} ano(s) regravados`,
  };
}
