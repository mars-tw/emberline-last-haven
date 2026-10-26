"""Preserve exact raw console/controller bytes; make committed text UTF-8/LF."""
from pathlib import Path
import json,gzip,hashlib
root=Path.cwd().resolve();assert root.name=='apocalypse-anthology'
base=root/'docs/content/r15/regression/r12';raw_base=base/'attempts/raw-console'
ledger_path=base/'evidence-text-format.json'
changed=json.loads(ledger_path.read_text(encoding='utf-8'))['files'] if ledger_path.exists() else []
previous_paths={row['path'] for row in changed};normalized_this_run=0
for p in sorted(base.rglob('*')):
 if not p.is_file() or p==ledger_path or p.suffix not in ['.json','.txt','.log'] or p.is_relative_to(raw_base):continue
 original=p.read_bytes()
 try:text=original.decode('utf-16') if original.startswith((b'\xff\xfe',b'\xfe\xff')) else original.decode('utf-8-sig')
 except UnicodeError:continue
 canonical=('\n'.join(line.rstrip() for line in text.splitlines()).rstrip('\n')+'\n').encode('utf-8')
 if canonical==original:continue
 if p.suffix=='.json':assert json.loads(canonical)==json.loads(text),'JSON values must remain identical'
 relative=p.relative_to(base);relative_path=p.relative_to(root).as_posix();raw=raw_base/relative.with_suffix(relative.suffix+'.gz');raw.parent.mkdir(parents=True,exist_ok=True)
 existing=next((row for row in changed if row['path']==relative_path),None)
 if raw.exists():
  assert gzip.decompress(raw.read_bytes())==original or (existing and (existing['canonicalSha256']==hashlib.sha256(original).hexdigest() or p.name in ['archive-index.json','secret-scan.json'])),'do not overwrite an earlier raw source'
 else:raw.write_bytes(gzip.compress(original,mtime=0))
 p.write_bytes(canonical)
 if relative_path not in previous_paths:
  changed.append({'path':relative_path,'canonicalSha256':hashlib.sha256(canonical).hexdigest(),'rawPath':raw.relative_to(root).as_posix(),'rawSha256':hashlib.sha256(original).hexdigest(),'method':'Only encoding, line endings and trailing console padding normalized; original raw bytes retained as gzip'})
 elif p.name not in ['archive-index.json','secret-scan.json']:
  existing['canonicalSha256']=hashlib.sha256(canonical).hexdigest()
 normalized_this_run+=1
for p in base.rglob('archive-index.json'):
 data=json.loads(p.read_text(encoding='utf-8-sig'))
 for row in data.get('files',[]):
  target=root/row['path']
  if not target.is_file():continue
  current=hashlib.sha256(target.read_bytes()).hexdigest()
  if current!=row['sha256']:
   row.setdefault('originalRawSha256',row['sha256']);row['sha256']=current
   match=next((x for x in changed if x['path']==row['path']),None)
   if match:row['originalRawPath']=match['rawPath']
 data['format']='Archived text is UTF-8/LF; original raw console/controller bytes are retained in raw-console where normalization was needed.'
 p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
for row in changed:
 assert hashlib.sha256(gzip.decompress((root/row['rawPath']).read_bytes())).hexdigest()==row['rawSha256']
 current=hashlib.sha256((root/row['path']).read_bytes()).hexdigest()
 if current!=row['canonicalSha256']:
  assert Path(row['path']).name in ['archive-index.json','secret-scan.json'],'Unexpected evidence mutation'
  row.setdefault('normalizedSourceSha256',row['canonicalSha256'])
  row['canonicalSha256']=current
  row['metadataRefreshReason']='Archive digest metadata or final scan scope refreshed after normalization; original raw source remains unchanged.'
ledger_path.write_text(json.dumps({'status':'VERIFIED','normalizedFiles':len(changed),'normalizationJsonValuesUnchanged':True,'rawBytesRetained':True,'archiveIndexDigestMetadataUpdated':True,'files':changed},ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps({'status':'VERIFIED','normalizedFiles':len(changed),'normalizedThisRun':normalized_this_run,'normalizationJsonValuesUnchanged':True,'rawBytesRetained':True}))
