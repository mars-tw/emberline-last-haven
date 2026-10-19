"""Reproducible R5 exports. Native alpha, true poses and source files retained."""
from pathlib import Path
from PIL import Image,ImageOps,ImageFilter
import numpy as np
import json,hashlib
root=Path(__file__).resolve().parents[1];art=root/'docs/art';out=root/'public/art/r5';masters=art/'masters/r5'
for p in [out,*[masters/s for s in ['rgba','masks','opaque']]]:p.mkdir(parents=True,exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def rec(p):return {'path':p.relative_to(root).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size}
def clean(im):
 a=np.array(im.convert('RGBA'));a[a[:,:,3]<12]=0;return Image.fromarray(a)
def fit(im,size):
 im=clean(im);box=im.getchannel('A').getbbox();assert box
 tile=ImageOps.contain(im.crop(box),(size[0]-12,size[1]-12),Image.Resampling.LANCZOS);result=Image.new('RGBA',size)
 result.alpha_composite(tile,((size[0]-tile.width)//2,size[1]-tile.height-6));return clean(result)
def export(im,name,entry):
 p=out/name;fmt='WEBP' if p.suffix=='.webp' else 'PNG';im=im.convert('RGB') if fmt=='WEBP' else clean(im)
 if name.startswith('app-'):im=im.convert('RGB').quantize(colors=256,method=Image.Quantize.MEDIANCUT).convert('RGBA')
 im.save(p,format=fmt,**({'quality':84,'method':6} if fmt=='WEBP' else {'optimize':True}))
 entry['runtime'].append({**rec(p),'size':list(im.size),'format':fmt})
prompts=json.loads((art/'PROMPTS_R5.json').read_text(encoding='utf-8'));assets=[]
for source in prompts['assets']:
 ident=source['id'];p=root/source['source'];im=Image.open(p)
 entry={'id':ident,'round':5,'tool':'image_gen__imagegen','modelSlug':None,'original':rec(p),'runtime':[],
  'license':'Project-owned generated art; MIT distribution','attribution':'Emberline: Last Haven contributors / OpenAI image_gen'}
 entry['references']=[rec(root/q) for q in source.get('references',[])]
 if im.mode=='RGBA':
  im=clean(im)
  for kind,stage in [('rgba',im),('masks',im.getchannel('A')),('opaque',Image.alpha_composite(Image.new('RGBA',im.size,'#657C8A'),im).convert('RGB'))]:
   q=masters/kind/(ident+'.png');stage.save(q,optimize=True);entry[kind]=rec(q)
  entry['alphaProcess']='Native generated alpha retained; alpha <12 removed, invisible RGB zeroed, padded crop; no synthetic limbs or matte substitution.'
 if ident=='station-wide':export(im.resize((1280,488),Image.Resampling.LANCZOS),'outpost-wide.webp',entry)
 elif ident=='night-wide':export(im.resize((1280,488),Image.Resampling.LANCZOS),'train-wide.webp',entry)
 elif ident=='night':export(im.resize((768,1152),Image.Resampling.LANCZOS),'train.webp',entry)
 elif ident=='xi':
  split=528
  for i,name in enumerate(['front','side','back','portrait']):export(fit(im.crop((i*384,0,(i+1)*384,split)),(192,256) if i==3 else (160,288)),f'xi-{name}.png',entry)
  atlas=Image.new('RGBA',(768,256))
  for i in range(4):atlas.alpha_composite(fit(im.crop((i*384,split,(i+1)*384,im.height)),(192,256)),(i*192,0))
  export(atlas,'xi-night.png',entry);entry['frameMap']={'columns':4,'splitY':split,'poses':['listen','window','roof','duck']}
 elif ident=='props':
  for i,name in enumerate(['bait','wreckage','fence','battery']):export(fit(im.crop((i*im.width//4,0,(i+1)*im.width//4,im.height)),(144,144)),name+'.png',entry)
 elif ident=='icons':
  for i,name in enumerate(['supply','people','hull','armor']):export(fit(im.crop((i*im.width//4,0,(i+1)*im.width//4,im.height)),(96,96)),name+'.png',entry)
 elif ident=='panel':
  im=im.resize((768,384),Image.Resampling.LANCZOS);export(im,'panel.webp',entry)
  tall=Image.new('RGB',(640,1400));middle=im.crop((0,24,768,360)).resize((640,280),Image.Resampling.LANCZOS)
  for y in range(20,1380,280):tall.paste(middle,(0,y))
  for a,b,y in [(0,24,0),(360,384,1380)]:tall.paste(im.crop((0,a,768,b)).resize((640,20),Image.Resampling.LANCZOS),(0,y))
  export(tall,'panel-tall.webp',entry)
 elif ident=='logo':export(fit(im,(512,256)),'logo.png',entry)
 elif ident=='app':
  q=art/'proposals/app-store-r5-1024.png';im.convert('RGB').resize((1024,1024),Image.Resampling.LANCZOS).save(q);entry['proposal']=rec(q)
  for n in [192,512]:export(im.resize((n,n),Image.Resampling.LANCZOS),f'app-{n}.png',entry)
 assets.append(entry)

derived={'id':'retained-motion-and-coastal-scene','round':5,'tool':'Pillow / NumPy deterministic postprocess','modelSlug':None,'runtime':[],'sources':[],
 'license':'Project-owned generated art; MIT distribution','attribution':'Emberline: Last Haven contributors / OpenAI image_gen (R2/R4 source)',
 'process':'Retain real limb poses, alpha, damage timing. Enemies V gamma .84, 1px cold-grey outer rim. Gunner/attack retained canonical adult face. Departure only re-encoded, same authored scene.'}
for kind in ['runner','shambler']:
 for action in ['walk','attack','hurt','death']:
  p=root/f'public/art/r4/{kind}-{action}.png';derived['sources'].append(rec(p));im=Image.open(p).convert('RGBA');a=np.array(im);hsv=np.array(im.convert('RGB').convert('HSV')).astype(float)
  hsv[:,:,2]=255*(hsv[:,:,2]/255)**.84;rgb=np.array(Image.fromarray(hsv.astype('uint8'),'HSV').convert('RGB'));a[:,:,:3]=rgb
  alpha=a[:,:,3];rim=np.array(Image.fromarray(alpha).filter(ImageFilter.MaxFilter(3)));outside=(rim>100)&(alpha<40)
  a[outside]=[135,159,174,220];export(clean(Image.fromarray(a)),f'{kind}-{action}.png',derived)
for name in ['climber-attack.png','xi-gunner.png','xi-attack.png']:
 p=root/'public/art/r4'/name;derived['sources'].append(rec(p));export(Image.open(p),name,derived)
p=root/'public/art/r2/departure.webp';derived['sources'].append(rec(p));export(Image.open(p),'departure.webp',derived)
assets.append(derived)
manifest={'status':'EXECUTED','round':5,'tool':prompts['tool'],'actualModelSlug':None,'modelNote':prompts['modelNote'],'generatedAssets':len(prompts['assets']),'runtimeAddedBytes':sum(r['bytes'] for a in assets for r in a['runtime']),'assets':assets}
(art/'ASSET_MANIFEST_R5.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
all_prompts=json.loads((art/'PROMPTS.json').read_text(encoding='utf-8'));all_prompts['round5']=prompts
(art/'PROMPTS.json').write_text(json.dumps(all_prompts,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
print('EXECUTED R5:',len(assets),'entries,',manifest['runtimeAddedBytes'],'runtime bytes')
