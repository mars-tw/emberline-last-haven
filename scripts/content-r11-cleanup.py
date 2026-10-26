"""Inventory only. Deletion is a separate, scope-checked PowerShell operation."""
from pathlib import Path
import hashlib,json,re,subprocess
root=Path.cwd().resolve()
assert root.name=='apocalypse-anthology'
tracked=subprocess.check_output(['git','-c','core.quotepath=false','ls-files','-z']).decode('utf-8').split('\0')
media=re.compile(r'\.(png|jpe?g|webp|gif|mp4|webm)$',re.I)
consumers={}
def visit(value,owner):
    if isinstance(value,str):
        path=value.replace('\\','/').removeprefix('./')
        if media.search(path) and (root/path).is_file(): consumers.setdefault(path,set()).add(owner)
    elif isinstance(value,list):
        for v in value:visit(v,owner)
    elif isinstance(value,dict):
        for v in value.values():visit(v,owner)
# Current audit and retained historical verification scripts read these receipts and
# hash their image paths; Markdown-only links are not a reason to retain old media.
for p in (root/'docs').rglob('*.json'):
    if any(x in p.name for x in ['receipt','manifest','captures','comparison']):
        try:visit(json.loads(p.read_text(encoding='utf-8-sig')),p.relative_to(root).as_posix())
        except (ValueError,UnicodeError):pass
for folder in ['scripts','tests']:
    for p in (root/folder).rglob('*'):
        if p.suffix in ['.py','.ts','.mjs','.js']:
            text=p.read_text(encoding='utf-8')
            for m in re.finditer(r"['\"](docs/[^'\"`\n]+\.(?:png|jpg|jpeg|webp|gif|mp4|webm))['\"]",text):
                path=m.group(1)
                if (root/path).is_file():consumers.setdefault(path,set()).add(p.relative_to(root).as_posix())
delete=[];retained=[]
for name in tracked:
    if not (name.startswith('docs/content/') or name.startswith('docs/evidence/')) or not media.search(name):continue
    p=(root/name).resolve()
    assert p.is_relative_to(root) and p.is_relative_to(root/'docs')
    if not p.is_file():continue
    # The current round and store screenshots are outside the deletion scope.
    if name.startswith('docs/content/r11/'):continue
    row={'path':name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
    if name in consumers:retained.append({**row,'reason':'Retained test/verification hash or direct file consumer','consumers':sorted(consumers[name])})
    else:delete.append(row)
report={'status':'PREPARED','workspace':str(root),'scope':'tracked media only in docs/content and docs/evidence; no source artwork, Markdown, store screenshots or untracked files','deleteFiles':len(delete),'releaseBytes':sum(r['bytes'] for r in delete),'delete':delete,'retainedFiles':len(retained),'retained':retained}
out=root/'docs/content/r11/cleanup-plan.json';out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:report[k] for k in ['status','deleteFiles','releaseBytes','retainedFiles']},ensure_ascii=False))
