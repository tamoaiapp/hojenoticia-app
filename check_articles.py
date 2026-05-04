import os, re, glob

content_dir = r'C:\Users\Notebook\hojenoticia-app\content'
mdx_files = glob.glob(os.path.join(content_dir, '**', '*.mdx'), recursive=True)

desc_eq_title = []
titulo_in_body = []
short_desc = []

for fp in mdx_files:
    with open(fp, encoding='utf-8') as f:
        raw = f.read()

    fm_match = re.match(r'^---\n(.*?)\n---\n(.*)', raw, re.DOTALL)
    if not fm_match:
        continue
    fm_text = fm_match.group(1)
    body = fm_match.group(2).strip()

    title_m = re.search(r'^title:\s*"(.*)"', fm_text, re.MULTILINE)
    desc_m  = re.search(r'^description:\s*"(.*)"', fm_text, re.MULTILINE)

    if title_m and desc_m:
        t = title_m.group(1)
        d = desc_m.group(1)
        if t == d:
            desc_eq_title.append(fp)
        if len(d) < 30:
            short_desc.append((fp, d))

    if re.search(r'^(TITULO|DESCRICAO|KEYWORDS):', body, re.MULTILINE | re.IGNORECASE):
        titulo_in_body.append(fp)

print(f'Total: {len(mdx_files)}')
print(f'desc == title: {len(desc_eq_title)}')
print(f'TITULO/DESCRICAO in body: {len(titulo_in_body)}')
print(f'Short desc (<30 chars): {len(short_desc)}')
if titulo_in_body:
    print('Remaining body issues:')
    for f in titulo_in_body[:3]:
        print(' ', f)
