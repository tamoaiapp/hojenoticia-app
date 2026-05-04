import os, re, glob

# Patterns indicating stripped accents in PT-BR
PATTERNS = [
    r'\bBilionri[ao]\b',     # Bilionário
    r'\bCorao\b',             # Coração
    r'\bFamli[ao]\b',         # Família
    r'\bCoras\b',             # Corações
    r'\bHist[r]i[ao]\b',     # História
    r'\bHist[r]i[ao]s\b',
    r'\bSequnci\b',           # Sequência
    r'\bPreviso\b',           # Previsão
    r'\bAtuaes\b',            # Atuações
    r'\bcriao\b',             # Criação
    r'\bEleio\b',             # Eleição
    r'\bInfografia\b',
    r'\bBilin[g]ue\b',
    r'\bInformaes\b',         # Informações
    r'\bRelaes\b',            # Relações
    r'\bFuncio\b',            # Função
    r'\bArmri[ao]\b',         # Armário
    r'\bIrm\b',               # Irmão
    r'\bIrs\b',               # Irãs
    r'\bAmric[ao]\b',         # América
    r'\bMxic[ao]\b',          # México
    r'\bPaulisto\b',          # Paulistão
    r'\bBrasileiro\b.*\bFem\b', # with context
    r'\b[A-Z][a-z]*nri[ao]\b',  # words ending in nrio/nria without tilde
    r'\bGaroto\b.*\bCax\b',
    r'\b[A-Z][a-z]*oli[ao]\b',
    r' H \d+ Anos\b',         # "H 65 Anos" = "Há 65 Anos"
    r'\bSeu Corao\b',
    r'\bSuas Mos\b',          # Suas Mãos
    r'\bNao\b',               # Não
    r'\bEntao\b',             # Então
    r'\bIrmao\b',             # Irmão
]

content_dir = r'C:\Users\Notebook\hojenoticia-app\content'
mdx_files = glob.glob(os.path.join(content_dir, '**', '*.mdx'), recursive=True)

deleted = 0
kept = []

for fp in mdx_files:
    with open(fp, encoding='utf-8') as f:
        raw = f.read()

    fm_match = re.match(r'^---\n(.*?)\n---', raw, re.DOTALL)
    if not fm_match:
        continue
    fm_text = fm_match.group(1)
    title_m = re.search(r'^title:\s*"(.*)"', fm_text, re.MULTILINE)
    if not title_m:
        continue

    title = title_m.group(1)
    bad = False
    for pattern in PATTERNS:
        if re.search(pattern, title, re.IGNORECASE):
            bad = True
            break

    if bad:
        print(f'DELETE: {title[:70]}')
        os.remove(fp)
        deleted += 1

print(f'\nDeleted: {deleted}')
