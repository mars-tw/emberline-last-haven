"""Inventory only tracked superseded media; list every remaining verification consumer."""
from pathlib import Path
import subprocess,json,re,hashlib
root=Path.cwd().resolve();assert root.name=='apocalypse-anthology'
tracked=subprocess.check_output(['git','-c','core.quotepath=false','ls-files','-z']).decode('utf-8').split('\0')
media=re.compile(r'\.(png|jpe?g|webp|gif|mp4|webm)$',re.I);consumers={}
def visit(v,owner):
 if isinstance(v,str):
  p=v.replace('\\','/').removeprefix('./')
  if media.search(p) and (root/p).is_file():consumers.setdefault(p,set()).add(owner)
 elif isinstance(v,list):
  for x in v:visit(x,owner)
 elif isinstance(v,dict):
  for k,x in v.items():
   if k not in ['original','originalPath','historicalSource']:visit(x,owner)
for folder in ['docs/evidence','docs/art','docs/store','docs/content/r15']:
 for p in (root/folder).rglob('*.json'):
  if any(s in p.name for s in ['cleanup','migration']):continue
  try:visit(json.loads(p.read_text(encoding='utf-8-sig')),p.relative_to(root).as_posix())
  except (ValueError,UnicodeError):pass
for folder in ['scripts','tests']:
 for p in (root/folder).rglob('*'):
  if p.suffix not in ['.mjs','.js','.ts','.py'] or any(s in p.name for s in ['cleanup','migrate']):continue
  for m in re.finditer(r"['\"](docs/[^'\"`\n]+\.(?:png|jpe?g|webp|gif|mp4|webm))['\"]",p.read_text(encoding='utf-8')):
   if (root/m[1]).is_file():consumers.setdefault(m[1],set()).add(p.relative_to(root).as_posix())
delete=[];retained=[]
for name in tracked:
 if not media.search(name) or not (re.match(r'docs/content/r(?:[1-9]|1[0-4])/',name) or name.startswith('docs/evidence/')):continue
 p=(root/name).resolve();assert p.is_relative_to(root/'docs')
 if not p.is_file():continue
 row=dict(path=name,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest())
 if name in consumers:retained.append(dict(**row,reason='An executable verification contract reads/hashes this exact file; preserved under user test-input exception',consumers=sorted(consumers[name])))
 else:delete.append(row)
migration=json.loads((root/'docs/content/r15/regression-migration.json').read_text(encoding='utf-8'))
plan=dict(status='PREPARED',workspace=str(root),deleteFiles=len(delete),releaseBytes=sum(r['bytes'] for r in delete),delete=delete,retainedFiles=len(retained),retained=retained,migratedMediaFiles=migration['mediaFiles'],scope='Only tracked superseded R1-R14/evidence media, after regression consumers migrated to current R15. Never untracked files, Markdown, store screenshots or source art. releaseBytes is removed old-path bytes, not Git history or net disk saving; migrated test inputs occupy current paths.')
(root/'docs/content/r15/cleanup-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:plan[k] for k in ['status','deleteFiles','releaseBytes','retainedFiles','migratedMediaFiles']}))
