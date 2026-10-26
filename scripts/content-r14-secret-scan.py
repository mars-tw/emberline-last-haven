"""Final read-only text scan, including PowerShell and newly generated reports."""
from pathlib import Path
import os,re,json
root=Path.cwd().resolve();assert root.name=='apocalypse-anthology'
excluded={'.git','node_modules','dist','.audit-tmp','.secrets'}
extensions={'.ts','.js','.mjs','.cjs','.json','.md','.txt','.log','.html','.css','.py','.ps1','.yml','.yaml','.toml','.xml','.webmanifest','.env'}
pattern=re.compile(r'sk-proj-[A-Za-z0-9_-]{20}|sk-[a-z0-9]{40}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')
hits=[];files=0
for folder,dirs,names in os.walk(root,followlinks=False):
 dirs[:]=[n for n in dirs if n not in excluded and not (Path(folder)/n).is_symlink() and (Path(folder)/n).resolve().is_relative_to(root) and not (hasattr(Path(folder)/n,'is_junction') and (Path(folder)/n).is_junction())]
 for name in names:
  p=Path(folder)/name
  if not p.resolve().is_relative_to(root) or p.is_symlink():continue
  if p.suffix.lower() not in extensions and name not in ['LICENSE','.gitignore','.gitattributes']:continue
  data=p.read_bytes()
  try:text=data.decode('utf-16') if data.startswith((b'\xff\xfe',b'\xfe\xff')) else data.decode('utf-8-sig')
  except UnicodeError:continue
  files+=1
  count=sum(1 for _ in pattern.finditer(text))
  if count:hits.append({'path':p.relative_to(root).as_posix(),'count':count})
result={'status':'VERIFIED' if not hits else 'BLOCKED','scope':'Repository text, including .ps1 and final reports; exclude .git/node_modules/dist/.audit-tmp and credential folders; do not follow links','filesScanned':files,'hits':sum(x['count'] for x in hits),'filesWithHits':hits}
(root/'docs/content/r15/regression/r14/secret-scan.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps({k:result[k] for k in ['status','filesScanned','hits']}))
raise SystemExit(0 if not hits else 1)
