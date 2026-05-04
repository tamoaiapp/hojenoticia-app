import os, re, glob

content_dir = r'C:\Users\Notebook\hojenoticia-app\content'
mdx_files = glob.glob(os.path.join(content_dir, '**', '*.mdx'), recursive=True)

fixed_body = 0
fixed_desc = 0

for fp in mdx_files:
    with open(fp, encoding='utf-8') as f:
        raw = f.read()

    fm_match = re.match(r'^---\n(.*?)\n---\n(.*)', raw, re.DOTALL)
    if not fm_match:
        continue

    fm_text = fm_match.group(1)
    body = fm_match.group(2).strip()
    changed = False

    # --- Fix 1: strip TITULO/DESCRICAO/KEYWORDS lines from body ---
    body_lines = body.split('\n')
    new_body_lines = []
    extra_desc = None
    skip_next_empty = False

    i = 0
    while i < len(body_lines):
        line = body_lines[i]
        stripped = line.replace('*', '').strip()
        if re.match(r'^(TITULO|DESCRICAO|KEYWORDS):', stripped, re.IGNORECASE):
            if stripped.upper().startswith('DESCRICAO:'):
                extra_desc = re.sub(r'^DESCRICAO:\s*', '', stripped, flags=re.IGNORECASE).strip()
            skip_next_empty = True
            changed = True
        else:
            if skip_next_empty and line.strip() == '':
                skip_next_empty = False
                i += 1
                continue
            skip_next_empty = False
            new_body_lines.append(line)
        i += 1

    if changed:
        body = '\n'.join(new_body_lines).strip()
        fixed_body += 1

    # --- Fix 2: update description if it equals title ---
    title_m = re.search(r'^title:\s*"(.*)"', fm_text, re.MULTILINE)
    desc_m  = re.search(r'^description:\s*"(.*)"', fm_text, re.MULTILINE)

    new_desc = None
    if title_m and desc_m and title_m.group(1) == desc_m.group(1):
        # Use extra_desc from body DESCRICAO line if available
        if extra_desc and len(extra_desc) > 15:
            new_desc = extra_desc
        else:
            # Extract first real paragraph from body (skip headers, empty, lists)
            for line in body.split('\n'):
                stripped_l = line.strip()
                if stripped_l and not stripped_l.startswith('#') and not stripped_l.startswith('-') and not stripped_l.startswith('*') and not stripped_l.startswith('|') and len(stripped_l) > 40:
                    # Remove markdown links and formatting
                    clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\\1', stripped_l)
                    clean = re.sub(r'[*_`]', '', clean)
                    new_desc = clean[:200].strip()
                    break

        if new_desc and new_desc != title_m.group(1):
            safe_desc = new_desc.replace('\\', '\\\\').replace('"', "'")
            fm_text = re.sub(
                r'^(description:\s*)".*"',
                f'description: "{safe_desc}"',
                fm_text, flags=re.MULTILINE
            )
            fixed_desc += 1
            changed = True

    if changed:
        new_raw = f'---\n{fm_text}\n---\n\n{body}\n'
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(new_raw)

print(f'Fixed body (TITULO/DESCRICAO removed): {fixed_body}')
print(f'Fixed description (unique desc): {fixed_desc}')
