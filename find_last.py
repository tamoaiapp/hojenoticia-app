import os, re, glob

content_dir = r'C:\Users\Notebook\hojenoticia-app\content'
mdx_files = glob.glob(os.path.join(content_dir, '**', '*.mdx'), recursive=True)

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

    if title_m and desc_m and title_m.group(1) == desc_m.group(1):
        print('File:', fp)
        print('Title:', title_m.group(1))
        print('Body start:')
        for line in body.split('\n')[:5]:
            print(' ', repr(line))
        break
