"""Convert transparent production atlas and verify source, alpha, palette and offline copy."""
from pathlib import Path
from PIL import Image
import json, hashlib, numpy as np

root=Path.cwd().resolve()
assert root.name=='apocalypse-anthology'
manifest=root/'docs/art/ASSET_MANIFEST_CONTENT_R15.json'
if __name__=='__main__':
 m=json.loads(manifest.read_text(encoding='utf-8'))
 assert m['tool']=='image_gen__imagegen' and m['actualModelSlug'] is None
 assert m['modelVerification']['status']=='BLOCKED'
 metrics=[]
 for r in m['assets']:
  for key,hashkey in [('source','sourceSha256'),('path','sha256')]:
   assert hashlib.sha256(Path(r[key]).read_bytes()).hexdigest()==r[hashkey]
  im=Image.open(r['path']).convert('RGBA');assert list(im.size)==r['dimensions']
  a=np.array(im)[:,:,3];assert a.min()==0 and a.max()==255 and (a==0).mean()>.2
  for i in range(2):
   cell=im.crop((i*im.width//2,0,(i+1)*im.width//2,im.height));v=np.array(cell.convert('HSV'))/255;mask=np.array(cell)[:,:,3]>180;v=v[mask]
   metric=dict(state=['listen','hurt'][i],brightness=float(v[:,2].mean()),nearBlack=float((v[:,2]<.15).mean()),saturation=float(v[:,1].mean()),lowSaturation=float((v[:,1]<.2).mean()))
   assert .30<=metric['brightness']<=.75 and metric['nearBlack']<.35 and metric['saturation']>=.32 and metric['lowSaturation']<.20,metric
   metrics.append(metric)
  relative=r['path'].removeprefix('public/');assert Path('dist',relative).read_bytes()==Path(r['path']).read_bytes();assert relative in Path('dist/sw.js').read_text(encoding='utf-8')
 Path('docs/art/ART_GATES_CONTENT_R15.json').write_text(json.dumps(dict(status='VERIFIED',metrics=metrics,sourceHashesVerified=True,transparent=True,offlineBytesIdentical=True,actualModelSlug=None,modelVerification='BLOCKED tool does not expose model slug'),indent=2)+'\n',encoding='utf-8')
 print('VERIFIED R15 source/alpha/HSV/offline atlas; model slug remains BLOCKED')
