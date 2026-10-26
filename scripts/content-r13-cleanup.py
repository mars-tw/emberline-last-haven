"""Prepare tracked old-media inventory; apply with the separately scope-checked PowerShell script."""
from pathlib import Path
import hashlib,json,re,subprocess
root=Path.cwd().resolve();assert root.name=='apocalypse-anthology'
media=re.compile(r'\.(png|jpe?g|webp|gif|mp4|webm)$',re.I)
tracked=subprocess.check_output(['git','-c','core.quotepath=false','ls-files','-z']).decode('utf-8').split('\0')
consumers={}
def visit(value,owner):
 if isinstance(value,str):
  name=value.replace('\\','/').removeprefix('./')
  if media.search(name) and (root/name).is_file():consumers.setdefault(name,set()).add(owner)
 elif isinstance(value,list):
  for v in value:visit(v,owner)
 elif isinstance(value,dict):
  for key,v in value.items():
   if key not in ['original','originalPath','historicalSource']:visit(v,owner)
# Current art/store/evidence contracts still consume old comparison images.
for folder in ['docs/evidence','docs/art','docs/store']:
 for p in (root/folder).rglob('*.json'):
  if 'cleanup' in p.name:continue
  try:visit(json.loads(p.read_text(encoding='utf-8-sig')),p.relative_to(root).as_posix())
  except (ValueError,UnicodeError):pass
for folder in ['scripts','tests']:
 for p in (root/folder).rglob('*'):
  if p.suffix not in ['.py','.ts','.mjs','.js'] or 'cleanup' in p.name:continue
  for m in re.finditer(r"['\"](docs/[^'\"`\n]+\.(?:png|jpe?g|webp|gif|mp4|webm))['\"]",p.read_text(encoding='utf-8')):
   if (root/m[1]).is_file():consumers.setdefault(m[1],set()).add(p.relative_to(root).as_posix())
delete=[];retained=[]
for name in tracked:
 if not media.search(name) or not (re.match(r'docs/content/r(?:[1-9]|1[0-2])/',name) or name.startswith('docs/evidence/')):continue
 p=(root/name).resolve();assert p.is_relative_to(root/'docs')
 if not p.is_file():continue
 row={'path':name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
 if name in consumers:retained.append({**row,'reason':'Current test/art/store evidence contract reads or hashes this image','consumers':sorted(consumers[name])})
 else:delete.append(row)
plan={'status':'PREPARED','workspace':str(root),'scope':'Only tracked superseded R1-R12 content/evidence media. Preserve untracked files, Markdown, store, source art and actual verification inputs. Old R12 receipt JSON is read only as state fixture, not as image evidence. Regression outputs now go to R13.','deleteFiles':len(delete),'releaseBytes':sum(r['bytes'] for r in delete),'delete':delete,'retainedFiles':len(retained),'retained':retained}
(root/'docs/content/r13/cleanup-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:plan[k] for k in ['status','deleteFiles','releaseBytes','retainedFiles']}))
