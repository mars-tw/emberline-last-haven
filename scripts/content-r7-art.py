"""R7 opaque portrait source, color gates and offline integration; no human score."""
from pathlib import Path
from PIL import Image
import numpy as np
import json, hashlib
manifest=Path('docs/art/ASSET_MANIFEST_CONTENT_R7.json')
m=json.loads(manifest.read_text(encoding='utf-8'))
assert m['tool']=='image_gen__imagegen' and m['actualModelSlug'] is None
assert m['generatedImages']==1 and m['generationCalls']==2
for item in [m['source'],m['draftSource'],*m['assets']]:
    p=Path(item['path'])
    assert hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256']
    assert list(Image.open(p).size)==item['dimensions']
im=Image.open(m['assets'][0]['path'])
assert im.size==(320,320) and im.format=='WEBP'
assert Image.open('docs/art/masters/content-r7/an-portrait-64.png').size==(64,64)
a=np.array(im.convert('HSV'))/255
metrics={'brightness':float(a[:,:,2].mean()),'nearBlack':float((a[:,:,2]<.15).mean()),'saturation':float(a[:,:,1].mean()),'lowSaturation':float((a[:,:,1]<.20).mean())}
assert .30<=metrics['brightness']<=.75
assert metrics['nearBlack']<.35 and metrics['saturation']>=.32 and metrics['lowSaturation']<.20
assert 'art/content-r7/an-portrait.webp' in Path('dist/sw.js').read_text(encoding='utf-8')
assert Path('dist/art/content-r7/an-portrait.webp').read_bytes()==Path(m['assets'][0]['path']).read_bytes()
Path('docs/art/ART_GATES_CONTENT_R7.json').write_text(json.dumps({'status':'VERIFIED','metrics':metrics,'alpha':'not_applicable: intentionally opaque portrait, no cutout requested','nativeSize':[1254,1254],'runtimeSize':[320,320],'thumbnailSize':[64,64],'offlineBytesIdentical':True,'physicalDevices':0,'human64pxRecognition':'BLOCKED'},indent=2),encoding='utf-8')
print('VERIFIED R7 portrait: source hashes, HSV gates, 64px thumbnail and identical offline bytes')
