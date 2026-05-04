import os, re, glob

# PT-BR words that stay lowercase in title case (prepositions, articles, conjunctions)
LOWER_WORDS = {
    'a', 'as', 'o', 'os', 'um', 'uma', 'uns', 'umas',
    'de', 'da', 'do', 'das', 'dos', 'num', 'numa', 'nuns', 'numas',
    'em', 'na', 'no', 'nas', 'nos',
    'e', 'ou', 'mas', 'nem', 'pois', 'porém', 'contudo', 'todavia',
    'com', 'sem', 'sob', 'sobre', 'ante', 'até', 'após', 'para', 'por',
    'que', 'se', 'ao', 'aos', 'à', 'às',
}

# Known abbreviations that should stay UPPER
ABBREVIATIONS = {'F1', 'BBB', 'DNA', 'HIV', 'CPF', 'CNPJ', 'STF', 'STJ', 'TSE',
                 'PT', 'MDB', 'PL', 'PP', 'PDT', 'PSB', 'PSD', 'DEM', 'PCO',
                 'CNJ', 'SUS', 'INSS', 'FGTS', 'IPCA', 'PIB', 'IGP', 'CDI',
                 'UFC', 'NBA', 'NFL', 'FIFA', 'CBF', 'MBL', 'UE', 'ONU', 'OMS',
                 'IA', 'GPT', 'EUA', 'UK', 'SP', 'RJ', 'MG', 'RS', 'BA', 'PR',
                 'TV', 'DJ', 'MC', 'VIP', 'CEO', 'CCTV', 'CVE', 'CV', 'PCC',
                 'RS', 'PE', 'CE', 'AM', 'PA', 'GO', 'MT', 'MS', 'TO', 'SC',
                 'AC', 'RO', 'RR', 'AP', 'AL', 'SE', 'RN', 'PB', 'PI', 'MA',
                 'ES', 'DF', 'MG',
                 }

def to_title_case_pt(text):
    words = text.split()
    result = []
    for i, word in enumerate(words):
        # Remove punctuation for checking
        clean = re.sub(r'[^a-zA-ZÀ-ÿ0-9]', '', word).upper()

        # Always capitalize first word
        if i == 0:
            result.append(word.capitalize())
            continue

        # Known abbreviations stay upper
        if clean in ABBREVIATIONS:
            result.append(word.upper())
            continue

        # Words with numbers or special chars keep as-is but capitalize first letter
        if re.search(r'[0-9]', word):
            result.append(word.capitalize())
            continue

        # Lowercase prepositions/articles (except start of sentence after colon/dash)
        word_clean_lower = re.sub(r'[^a-zA-ZÀ-ÿ]', '', word).lower()
        if word_clean_lower in LOWER_WORDS:
            # But capitalize if after colon/dash separator
            prev = words[i-1] if i > 0 else ''
            if prev.endswith(':') or prev.endswith('—') or prev.endswith('-'):
                result.append(word.capitalize())
            else:
                result.append(word.lower())
            continue

        result.append(word.capitalize())

    return ' '.join(result)

def is_mostly_caps(title):
    letters = [c for c in title if c.isalpha()]
    if len(letters) < 5:
        return False
    upper = sum(1 for c in letters if c.isupper())
    return (upper / len(letters)) > 0.70

content_dir = r'C:\Users\Notebook\hojenoticia-app\content'
mdx_files = glob.glob(os.path.join(content_dir, '**', '*.mdx'), recursive=True)

fixed = 0
for fp in mdx_files:
    with open(fp, encoding='utf-8') as f:
        raw = f.read()

    fm_match = re.match(r'^---\n(.*?)\n---\n(.*)', raw, re.DOTALL)
    if not fm_match:
        continue
    fm_text = fm_match.group(1)
    body = fm_match.group(2)

    title_m = re.search(r'^title:\s*"(.*)"', fm_text, re.MULTILINE)
    if not title_m:
        continue

    orig_title = title_m.group(1)
    if not is_mostly_caps(orig_title):
        continue

    new_title = to_title_case_pt(orig_title)
    if new_title == orig_title:
        continue

    safe_title = new_title.replace('\\', '\\\\').replace('"', "'")
    new_fm = re.sub(
        r'^(title:\s*)".*"',
        f'title: "{safe_title}"',
        fm_text, flags=re.MULTILINE
    )

    new_raw = f'---\n{new_fm}\n---\n{body}'
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(new_raw)

    fixed += 1
    if fixed <= 5:
        print(f'  {orig_title[:60]}')
        print(f'  -> {new_title[:60]}')

print(f'\nFixed ALL CAPS titles: {fixed}')
