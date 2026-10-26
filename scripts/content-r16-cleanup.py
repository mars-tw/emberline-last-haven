"""Delete only hash-bound named superseded media or this round's known intermediates."""
from pathlib import Path
import json,hashlib,subprocess,sys,re
root=Path.cwd().resolve();assert root.name=='apocalypse-anthology'
dir=root/'docs/content/r16';dir.mkdir(parents=True,exist_ok=True)
tracked=set(subprocess.check_output(['git','-c','core.quotepath=false','ls-files','-z']).decode('utf-8').split('\0'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
mode=sys.argv[1];assert mode in ['--old','--temp']
targets=[];retained=[]
if mode=='--old':
 targets=[root/p for p in sorted(tracked) if p.startswith('docs/content/r15/review-set/') and p.endswith('.png') and (root/p).is_file()]
 # All other old media remain only under read/hash contracts. Record the actual referencing files.
 consumers={}
 def visit(v,owner):
  if isinstance(v,str):
   s=v.replace('\\','/').removeprefix('./')
   if s in tracked and re.search(r'\.(png|webp|jpe?g|gif|mp4|webm)$',s,re.I):consumers.setdefault(s,set()).add(owner)
  elif isinstance(v,list):
   for x in v:visit(x,owner)
  elif isinstance(v,dict):
   for k,x in v.items():
    if k not in ['original','historicalSource']:visit(x,owner)
 for folder in ['docs/content','docs/evidence','docs/art','docs/store']:
  for p in (root/folder).rglob('*.json'):
   if 'cleanup' in p.name or 'migration' in p.name or p==root/'docs/content/r15/review-set-manifest.json':continue
   try:visit(json.loads(p.read_text(encoding='utf-8-sig')),p.relative_to(root).as_posix())
   except (ValueError,UnicodeError):pass
 for name in sorted(tracked):
  if not re.search(r'\.(png|webp|jpe?g|gif|mp4|webm)$',name,re.I) or not (re.match(r'docs/content/r(?:[1-9]|1[0-5])/',name) or name.startswith('docs/evidence/')):continue
  p=root/name
  if p in targets or not p.is_file():continue
  retained.append(dict(path=name,bytes=p.stat().st_size,reason='Retained executable regression input/output or source/hash comparison contract; ordinary full check regenerates/reads these original files',contracts=sorted(consumers.get(name,[]))))
else:
 targets=[p for p in (root/'.audit-tmp').glob('r16-*') if p.is_file()]
 for name in ['r15-r12-marker-failure.png','r15-r12-marker-failure.json']:
  p=root/'.audit-tmp'/name
  if p.is_file():targets.append(p)
 generated=Path(r'C:\Users\digimkt\.codex\generated_images\01a15fec-d8eb-77f0-90bf-58a5de452b55\exec-85a3fd92-1726-4fe0-b931-e6cc4f6c86b1.png').resolve()
 if generated.is_file():
  assert sha(generated)==sha(root/'docs/art/generated/content-r16/rescue-support.png');targets.append(generated)
rows=[]
for p in targets:
 p=p.resolve();assert p.is_file() and not p.is_symlink()
 if mode=='--old':assert p.is_relative_to(root/'docs/content/r15/review-set') and p.relative_to(root).as_posix() in tracked
 else:assert p.is_relative_to(root/'.audit-tmp') or p==generated
 rows.append(dict(path=p.relative_to(root).as_posix() if p.is_relative_to(root) else str(p),bytes=p.stat().st_size,sha256=sha(p)))
label='old-evidence' if mode=='--old' else 'temp'
plan=dict(status='PREPARED',workspace=str(root),deleteFiles=len(rows),releaseBytes=sum(r['bytes'] for r in rows),delete=rows,retained=retained,retainedFiles=len(retained),scope='Only named tracked R15 superseded review copies; current review contracts consume R16. Original old gameplay/hash inputs retained, Markdown/untracked/store/source art untouched.' if mode=='--old' else 'Only own R16 helper/build files, marker diagnostics produced in this run, and exact duplicate generated image after source hash verification. No system temp files manually created; browser profiles close in finally.')
(dir/(label+'-cleanup-plan.json')).write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for p,row in zip(targets,rows):
 assert sha(p)==row['sha256'];p.unlink()
assert all(not p.exists() for p in targets)
plan['status']='VERIFIED';plan['netReleasedBytes']=plan['releaseBytes'];plan['gitHistoryReduced']=False
(dir/(label+'-cleanup.json')).write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:plan[k] for k in ['status','deleteFiles','releaseBytes','retainedFiles']}))
