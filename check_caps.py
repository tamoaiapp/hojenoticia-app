import os, re, glob

content_dir = r'C:\Users\Notebook\hojenoticia-app\content'
mdx_files = glob.glob(os.path.join(content_dir, '**', '*.mdx'), recursive=True)

all_caps = []
for fp in mdx_files:
    with open(fp, encoding='utf-8') as f:
        raw = f.read()
    fm_match = re.match(r'^---\n(.*?)\n---', raw, re.DOTALL)
    if not fm_match:
        continue
    fm_text = fm_match.group(1)
    title_m = re.search(r'^title:\s*"(.*)"', fm_text, re.MULTILINE)
    if title_m:
        t = title_m.group(1)
        # Count uppercase letters vs total letters
        letters = [c for c in t if c.isalpha()]
        if len(letters) > 5:
            upper = sum(1 for c in letters if c.isupper())
            ratio = upper / len(letters)
            # ALL CAPS: >70% uppercase AND at least 5 uppercase letters
            if ratio > 0.70 and upper >= 5:
                all_caps.append((fp, t))

print(f'ALL CAPS titles: {len(all_caps)}')
print('Examples:')
for fp, t in all_caps[:10]:
    print(f'  {t[:80]}')
