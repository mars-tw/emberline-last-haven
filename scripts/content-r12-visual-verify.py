from pathlib import Path
from PIL import Image,ImageChops
import numpy as np
import json
base=Path('docs/content/r15/regression/r12');rows=[]
for zone in ['roof','window']:
 a=Image.open(base/f'phone-crew-{zone}-selected.png').convert('RGB');b=Image.open(base/f'phone-crew-{zone}-impact.png').convert('RGB')
 assert a.size==b.size==(1290,2796)
 diff=np.asarray(ImageChops.difference(a,b));changed=int(np.count_nonzero(diff.max(axis=2)>18));ratio=changed/(a.width*a.height)
 assert ratio>=.05,(zone,ratio)
 rows.append({'direction':zone,'selected':f'phone-crew-{zone}-selected.png','impact':f'phone-crew-{zone}-impact.png','changedAreaRatio':ratio,'threshold':.05,'pixelChannelDifferenceThreshold':18,'status':'VERIFIED'})
(base/'impact-pixel-difference.json').write_text(json.dumps({'status':'VERIFIED','method':'Unscaled original screenshots; RGB max channel difference >18; whole image area','results':rows},indent=2)+'\n',encoding='utf-8')
print(json.dumps(rows))
