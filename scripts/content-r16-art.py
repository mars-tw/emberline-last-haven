"""Project-owned transparent atlas: preserve generated alpha, remove faint fringe, crop portraits."""
from pathlib import Path
from PIL import Image
import hashlib,json,shutil,sys
import numpy as np
root=Path.cwd().resolve();assert root.name=='apocalypse-anthology'
source=root/'docs/art/generated/content-r16/rescue-support.png'
out=root/'public/art/content-r16';out.mkdir(parents=True,exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
if len(sys.argv)>1:
 source.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(sys.argv[1],source)
 im=Image.open(source).convert('RGBA');a=np.array(im);a[:,:,3]=np.where(a[:,:,3]<24,0,np.minimum(255,a[:,:,3].astype(float)*255/254)).astype('uint8');im=Image.fromarray(a)
 im.resize((768,512),Image.Resampling.LANCZOS).save(out/'rescue-support.webp',lossless=True)
 portraits=Image.new('RGBA',(128,64));portraits.paste(im.crop((340,280,610,550)).resize((64,64),Image.Resampling.LANCZOS),(0,0));portraits.paste(im.crop((990,10,1260,280)).resize((64,64),Image.Resampling.LANCZOS),(64,0));portraits.save(out/'rescue-portraits.webp',lossless=True)
 prefix=json.loads((root/'docs/art/PROMPTS_CONTENT_R15.json').read_text(encoding='utf-8'))['stylePrefix']
 prompts=dict(round='content-r16',tool='image_gen__imagegen',requestedModelSlug='gpt-image-2',actualModelSlug=None,stylePrefix=prefix,modelEvidence='BLOCKED: output exposes image_url/output_hint only, no model selection or actual slug',references=['public/art/content-r14/rescue-team.webp','public/art/r5/train.webp','public/art/content-r15/laoxi-duty.webp'],promptSummary=prefix+' Identity-preserve production atlas: two equal cells on transparent landscape. Lin Shu kneels with wrench repairing valve; A He stands watching window with dim lantern. Preserve grey-haired older mechanic and navy-coated adult woman from reference. Match train coarse gouache, etched contours, upper-left cool fill and warm lantern rim. Full figures and boots, transparent gutters, no environment, labels or UI. Intended gpt-image-2 if available; do not invent provenance.')
 (root/'docs/art/PROMPTS_CONTENT_R16.json').write_text(json.dumps(prompts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 assets=[]
 for name in ['rescue-support.webp','rescue-portraits.webp']:
  p=out/name;assets.append(dict(path=p.relative_to(root).as_posix(),sha256=sha(p),source=source.relative_to(root).as_posix(),sourceSha256=sha(source),dimensions=list(Image.open(p).size),hasAlpha=True,tool='image_gen__imagegen',license='MIT (project-owned art)',derivation='Preserve generated alpha, alpha<24 fringe removal; normalize max254 to255; proportional downsample; portraits crop exact same faces' if 'support' in name else 'Two 64px face crops from the same generated atlas'))
 m=dict(status='VERIFIED',round='content-r16',tool='image_gen__imagegen',generatedImages=1,runtimeImages=2,actualModelSlug=None,modelVerification=dict(status='BLOCKED',reason=prompts['modelEvidence']),assets=assets)
 (root/'docs/art/ASSET_MANIFEST_CONTENT_R16.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
m=json.loads((root/'docs/art/ASSET_MANIFEST_CONTENT_R16.json').read_text(encoding='utf-8'));metrics=[]
for r in m['assets']:
 p=root/r['path'];assert sha(p)==r['sha256'];assert sha(root/r['source'])==r['sourceSha256']
 im=Image.open(p).convert('RGBA');a=np.array(im)[:,:,3];assert a.min()==0 and a.max()>=250
 if 'support' in p.name:
  assert (a==0).mean()>.2
  for i in range(2):
   cell=im.crop((i*im.width//2,0,(i+1)*im.width//2,im.height));mask=np.array(cell)[:,:,3]>180;v=np.array(cell.convert('HSV'))[mask]/255
   metric=dict(person=['Lin Shu','A He'][i],brightness=float(v[:,2].mean()),nearBlack=float((v[:,2]<.15).mean()),saturation=float(v[:,1].mean()),lowSaturation=float((v[:,1]<.2).mean()))
   assert .30<=metric['brightness']<=.75 and metric['nearBlack']<.35 and metric['saturation']>=.32 and metric['lowSaturation']<.20,metric
   metrics.append(metric)
 if len(sys.argv)==1:
  rel=r['path'].removeprefix('public/');assert (root/'dist'/rel).read_bytes()==p.read_bytes();assert rel in (root/'dist/sw.js').read_text(encoding='utf-8')
(root/'docs/art/ART_GATES_CONTENT_R16.json').write_text(json.dumps(dict(status='VERIFIED',metrics=metrics,sourceHashesVerified=True,transparent=True,portraits=[64,64],offlineBytesVerified=len(sys.argv)==1,actualModelSlug=None),indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(status='VERIFIED',generatedImages=1,runtimeImages=2,metrics=metrics)))
