"""Inventory tracked, superseded media. Apply separately with scope-checked PowerShell."""
from pathlib import Path
import hashlib,json,re,subprocess
root=Path.cwd().resolve();assert root.name=='apocalypse-anthology'
media=re.compile(r'\.(png|jpe?g|webp|gif|mp4|webm)$',re.I)
tracked=subprocess.check_output(['git','-c','core.quotepath=false','ls-files','-z']).decode('utf-8').split('\0')
consumers={}
def visit(v,owner):
 if isinstance(v,str):
  name=v.replace('\\','/').removeprefix('./')
  if media.search(name) and (root/name).is_file():consumers.setdefault(name,set()).add(owner)
 elif isinstance(v,list):
  for x in v:visit(x,owner)
 elif isinstance(v,dict):
  for k,x in v.items():
   if k not in ['original','originalPath','historicalSource']:visit(x,owner)
# Old Markdown and historical receipts are retained history, not current validators.
# All active regression receipts now live under R12. Other active evidence/art gates stay.
for folder in ['docs/content/r12','docs/evidence','docs/art','docs/store']:
 for p in (root/folder).rglob('*.json'):
  if 'cleanup-' in p.name or p.name.startswith('cleanup'):continue
  if folder=='docs/content/r12' and ('cleanup' in str(p) or 'execution' in p.name):continue
  try:visit(json.loads(p.read_text(encoding='utf-8-sig')),p.relative_to(root).as_posix())
  except (ValueError,UnicodeError):pass
for folder in ['scripts','tests']:
 for p in (root/folder).rglob('*'):
  if p.suffix not in ['.py','.ts','.mjs','.js'] or p.name.endswith('cleanup.py'):continue
  s=p.read_text(encoding='utf-8')
  for m in re.finditer(r"['\"](docs/[^'\"`\n]+\.(?:png|jpg|jpeg|webp|gif|mp4|webm))['\"]",s):
   name=m[1]
   if (root/name).is_file():consumers.setdefault(name,set()).add(p.relative_to(root).as_posix())
delete=[];retained=[]
for name in tracked:
 if name.startswith('docs/evidence/content-r12/'):continue
 if not media.search(name) or not (re.match(r'docs/content/r(?:[1-9]|1[01])/',name) or name.startswith('docs/evidence/')):continue
 p=(root/name).resolve();assert p.is_relative_to(root/'docs') and p.is_relative_to(root)
 if not p.is_file():continue
 row={'path':name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
 if name in consumers:retained.append({**row,'reason':'An active test/verification receipt or direct script consumer reads/hashes this file','consumers':sorted(consumers[name])})
 else:delete.append(row)
out={'status':'PREPARED','workspace':str(root),'scope':'tracked old content/evidence media only; preserve all Markdown, untracked files, store and source art','deleteFiles':len(delete),'releaseBytes':sum(r['bytes'] for r in delete),'delete':delete,'retainedFiles':len(retained),'retained':retained}
Path('docs/content/r12/cleanup-plan.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:out[k] for k in ['status','deleteFiles','releaseBytes','retainedFiles']}))
