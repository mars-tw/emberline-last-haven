"""Verify actual R9 generation provenance, inherited HSV gates and offline bytes."""
from pathlib import Path
from PIL import Image
import json,hashlib,numpy as np
m=json.loads(Path('docs/art/ASSET_MANIFEST_CONTENT_R9.json').read_text(encoding='utf-8'))
assert m['tool']=='image_gen__imagegen' and m['actualModelSlug'] is None
assert m['generationCalls']==4 and m['generatedImages']==2 and m['runtimeIllustrations']==4
for r in [*m['sources'],*m['assets']]:
 p=Path(r['path']);assert hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256'];assert list(Image.open(p).size)==r['dimensions']
metrics={}
for r in m['assets']:
 p=Path(r['path']);im=Image.open(p);hsv=np.array(im.convert('HSV'))/255;alpha=np.array(im.convert('RGBA'))[:,:,3]>180;v=hsv[alpha]
 metric=dict(brightness=float(v[:,2].mean()),nearBlack=float((v[:,2]<.15).mean()),saturation=float(v[:,1].mean()),lowSaturation=float((v[:,1]<.2).mean()));metrics[p.as_posix()]=metric
 if 'portrait' in p.name:
  assert im.size==(384,384);assert .30<=metric['brightness']<=.75;assert metric['nearBlack']<.35;assert metric['saturation']>=.32;assert metric['lowSaturation']<.20
 else:
  a=np.array(im.convert('RGBA'))[:,:,3];assert a.min()==0 and a.max()==255;assert (a==0).mean()>.20
 relative=p.as_posix().removeprefix('public/');assert Path('dist',relative).read_bytes()==p.read_bytes();assert relative in Path('dist/sw.js').read_text(encoding='utf-8')
portraits=[v['saturation'] for p,v in metrics.items() if 'portrait' in p];spread=max(portraits)-min(portraits);assert spread<.15
Path('docs/art/ART_GATES_CONTENT_R9.json').write_text(json.dumps(dict(status='VERIFIED',metrics=metrics,portraitSaturationSpread=spread,sourceHashesVerified=True,offlineBytesIdentical=True,modelSlug=None,humanIdentityTest='BLOCKED'),indent=2)+'\n',encoding='utf-8')
print('VERIFIED R9: actual generation sources, all portrait HSV gates, transparent roof pose, identical offline bytes')
