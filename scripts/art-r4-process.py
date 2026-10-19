"""R4 reproducible crop/alpha cleanup, exposure calibration and compressed exports."""
from pathlib import Path
from PIL import Image, ImageOps, ImageFilter
import numpy as np
from collections import deque
import json, hashlib

root=Path(__file__).resolve().parents[1]
art=root/'docs/art'; out=root/'public/art/r4'; masters=art/'masters/r4'
for p in [out,*[masters/d for d in ['opaque','masks','rgba']]]:p.mkdir(parents=True,exist_ok=True)
prompts=json.loads((art/'PROMPTS_R4.json').read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def record(p):return {'path':p.relative_to(root).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size}
def clean(im):
    a=np.array(im.convert('RGBA'));a[a[:,:,3]<12]=0
    return Image.fromarray(a)
def isolate(im):
    a=np.array(clean(im));mask=a[:,:,3]>20;seen=np.zeros(mask.shape,bool);parts=[];h,w=mask.shape
    for y,x in zip(*np.where(mask)):
        if seen[y,x]:continue
        q=deque([(y,x)]);seen[y,x]=True;part=[]
        while q:
            yy,xx=q.popleft();part.append((yy,xx))
            for dy,dx in [(0,1),(0,-1),(1,0),(-1,0)]:
                ny,nx=yy+dy,xx+dx
                if 0<=ny<h and 0<=nx<w and mask[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;q.append((ny,nx))
        parts.append(part)
    if not parts:return im
    keep=np.zeros(mask.shape,'uint8')
    for y,x in max(parts,key=len):keep[y,x]=255
    vicinity=np.array(Image.fromarray(keep).filter(ImageFilter.MaxFilter(49)))>0
    for part in parts:
        if len(part)>12 and any(vicinity[y,x] for y,x in part):
            for y,x in part:keep[y,x]=255
    a[np.array(Image.fromarray(keep).filter(ImageFilter.MaxFilter(3)))==0]=0
    return Image.fromarray(a)
def fit(im,size,body=False):
    im=isolate(im) if body else clean(im);box=im.getchannel('A').getbbox();assert box
    crop=ImageOps.contain(im.crop(box),(size[0]-12,size[1]-12),Image.Resampling.LANCZOS)
    result=Image.new('RGBA',size);result.alpha_composite(crop,((size[0]-crop.width)//2,size[1]-crop.height-6))
    return clean(result)
def export(im,name,entry):
    p=out/name;fmt='WEBP' if p.suffix=='.webp' else 'PNG'
    im=im.convert('RGB') if fmt=='WEBP' else clean(im)
    im.save(p,format=fmt,**({'quality':85,'method':6} if fmt=='WEBP' else {'optimize':True}))
    entry['runtime'].append({**record(p),'size':list(im.size),'format':fmt})
def four(im,size):
    atlas=Image.new('RGBA',(size[0]*4,size[1]))
    for i in range(4):atlas.alpha_composite(fit(im.crop((round(i*im.width/4),0,round((i+1)*im.width/4),im.height)),size,True),(i*size[0],0))
    return atlas
assets=[]
references={'xi':['public/art/r3/xi-front.png','public/art/r3/xi-gunner.png'],'station':['public/art/r3/outpost-after.webp'],
 'night':['docs/art/masters/r4/original/xi.png'],'attack':['docs/art/masters/r4/original/xi.png'],
 'icons':['docs/art/masters/r4/original/xi.png','public/art/r3/truck.png'],'app':['docs/art/masters/r4/original/xi.png','public/art/r3/truck.png']}
for spec in prompts['assets']:
    ident=spec['id'];p=root/spec['source'];im=Image.open(p)
    entry={'id':ident,'round':4,'tool':prompts['tool'],'modelSlug':None,'original':record(p),'sourceSize':list(im.size),'runtime':[],
       'license':'Project-owned generated art; MIT distribution','attribution':'Emberline: Last Haven contributors / OpenAI image_gen'}
    entry['references']=[record(root/p) for p in references.get(ident,[])]
    if ident in ['xi','night','attack','climber','icons','logo']:
        assert im.mode=='RGBA' and im.getchannel('A').getextrema()[0]==0
        im=clean(im);q=masters/'rgba'/f'{ident}.png';im.save(q);entry['rgba']=record(q)
        q=masters/'masks'/f'{ident}.png';im.getchannel('A').save(q);entry['masks']=record(q)
        opaque=Image.new('RGB',im.size,'#657C8A');opaque.paste(im,mask=im.getchannel('A'))
        q=masters/'opaque'/f'{ident}.jpg';opaque.save(q,quality=90);entry['opaque']=record(q)
        entry['alphaProcess']='Native alpha retained; alpha <12 removed, invisible RGB zeroed, cell crop, bounding-box fit with 6px margin; no synthesized limbs.'
    if ident=='xi':
        split=620
        for i,name in enumerate(['front','side','back','portrait']):
            export(fit(im.crop((i*384,0,(i+1)*384,split)),(192,256) if i==3 else (160,288),True),f'xi-{name}.png',entry)
        export(four(im.crop((0,split,im.width,im.height)),(192,192)),'xi-gunner.png',entry)
        entry['frameMap']={'sheetSplitY':split,'columns':4,'gunner':['rest','anticipation','impact','recovery']}
    elif ident=='night':
        export(four(im,(192,256)),'xi-night.png',entry)
        entry['frameMap']={'columns':4,'phases':['listen','window','roof','duck']}
    elif ident=='attack':
        export(four(im,(192,256)),'xi-attack.png',entry)
        entry['frameMap']={'columns':4,'phases':['rest','anticipation','impact','recovery'],'damageSource':'unchanged campaign projectile collision'}
    elif ident=='climber':
        hsv=np.array(im.convert('RGB').convert('HSV')).astype(float);neutral=hsv[:,:,1]<.24*255;hsv[:,:,1][neutral]=.24*255
        a=np.array(im);a[:,:,:3]=np.array(Image.fromarray(hsv.astype('uint8'),'HSV').convert('RGB'));im=clean(Image.fromarray(a))
        entry['colorProcess']='Very low chroma cloth shadows given restrained S .24 floor; hue retained; not blue.'
        export(four(im,(192,192)),'climber-attack.png',entry)
        entry['frameMap']={'columns':4,'phases':['grip','anticipation','impact','recovery'],'impactSeconds':.2,'damageSource':'unchanged campaign.tick'}
    elif ident=='station':export(im.resize((768,1152),Image.Resampling.LANCZOS),'outpost-ready.webp',entry)
    elif ident=='panel':
        im=im.resize((768,384),Image.Resampling.LANCZOS);export(im,'panel.webp',entry)
        # Nine-slice texture tiling: preserve fiber proportions on tall tablet paper.
        tall=Image.new('RGB',(640,1400));middle=im.crop((0,32,768,352)).resize((640,267),Image.Resampling.LANCZOS)
        for y in range(27,1400-27,267):tall.paste(middle,(0,y))
        tall.paste(im.crop((0,0,768,32)).resize((640,27),Image.Resampling.LANCZOS),(0,0))
        tall.paste(im.crop((0,352,768,384)).resize((640,27),Image.Resampling.LANCZOS),(0,1373))
        export(tall,'panel-tall.webp',entry)
    elif ident=='icons':
        for i,name in enumerate(['supply','people','hull','armor']):export(fit(im.crop((i*im.width//4,0,(i+1)*im.width//4,im.height)),(96,96)),name+'.png',entry)
    elif ident=='logo':export(fit(im,(512,256)),'logo.png',entry)
    elif ident=='app':
        q=art/'proposals/app-store-r4-1024.png';im.convert('RGB').resize((1024,1024),Image.Resampling.LANCZOS).save(q);entry['proposal']=record(q)
        for size in [192,512]:export(im.resize((size,size),Image.Resampling.LANCZOS),f'app-{size}.png',entry)
    assets.append(entry)

# Existing true-pose enemies: lift painted midtones and add a one-pixel ink edge.
# This is a derived exposure/edge export, NOT counted as newly generated art.
derived={'id':'enemy-contrast','round':4,'tool':'Pillow / NumPy deterministic postprocess','modelSlug':None,'runtime':[],
 'license':'Project-owned generated art; MIT distribution','attribution':'Emberline: Last Haven contributors / OpenAI image_gen (R3 source)',
 'sources':[],'process':'R3 unchanged pose geometry; V gamma .74, neutral cloth hue kept cool-grey; one-pixel dark brown contour; native alpha and real animation timing retained.'}
for kind in ['runner','shambler']:
    for action in ['walk','attack','hurt','death']:
        p=root/f'public/art/r3/{kind}-{action}.png';im=Image.open(p).convert('RGBA');derived['sources'].append(record(p))
        a=np.array(im);hsv=np.array(im.convert('RGB').convert('HSV')).astype(float)
        hsv[:,:,2]=np.power(hsv[:,:,2]/255,.74)*255
        neutral=hsv[:,:,1]<.30*255;hsv[:,:,1][neutral]=.34*255
        rgb=np.array(Image.fromarray(hsv.astype('uint8'),'HSV').convert('RGB'));a[:,:,:3]=rgb
        im=clean(Image.fromarray(a));outline=Image.new('RGBA',im.size,(35,27,22,0));outline.putalpha(im.getchannel('A').filter(ImageFilter.MaxFilter(3)));outline.alpha_composite(im)
        export(outline,f'{kind}-{action}.png',derived)
assets.append(derived)
manifest={'status':'EXECUTED','round':4,'tool':prompts['tool'],'actualModelSlug':None,'requestedModelSlug':'gpt-image-2','modelNote':prompts['modelNote'],
 'generatedAssets':9,'runtimeFiles':sum(len(a['runtime']) for a in assets),'runtimeAddedBytes':sum(r['bytes'] for a in assets for r in a['runtime']),
 'baselinePublicBytes':sum(p.stat().st_size for p in (root/'public').rglob('*') if p.is_file() and 'r4' not in p.parts),'assets':assets}
(art/'ASSET_MANIFEST_R4.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
all_prompts=json.loads((art/'PROMPTS.json').read_text(encoding='utf-8'));all_prompts['round4']=prompts
(art/'PROMPTS.json').write_text(json.dumps(all_prompts,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
print('EXECUTED R4 exports',manifest['runtimeFiles'],manifest['runtimeAddedBytes'])
