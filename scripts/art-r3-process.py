"""R3 generated art exports; only crop, alpha cleanup, color calibration and resize."""
from pathlib import Path
from PIL import Image, ImageOps, ImageFilter
from collections import deque
import numpy as np
import hashlib, json, shutil

root=Path(__file__).resolve().parents[1]
art=root/'docs/art';out=root/'public/art/r3';masters=art/'masters/r3'
for p in [out,*[masters/s for s in ['original','opaque','masks','rgba']]]:p.mkdir(parents=True,exist_ok=True)
prompts=json.loads((art/'PROMPTS_R3.json').read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def record(p):return {'path':p.relative_to(root).as_posix(),'sha256':sha(p),'bytes':p.stat().st_size}
def clean(im):
    a=np.array(im.convert('RGBA'));a[a[:,:,3]<=8]=0
    return Image.fromarray(a)
def isolate(im,body_only=False):
    a=np.array(clean(im));mask=a[:,:,3]>8;seen=np.zeros(mask.shape,bool);parts=[];h,w=mask.shape
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
    if body_only:
        for y,x in max(parts,key=len):keep[y,x]=255
        vicinity=np.array(Image.fromarray(keep).filter(ImageFilter.MaxFilter(17)))>0
    for part in parts:
        if (body_only and any(vicinity[y,x] for y,x in part)) or (not body_only and len(part)>=max(12,max(map(len,parts))*.002)):
            for y,x in part:keep[y,x]=255
    a[np.array(Image.fromarray(keep).filter(ImageFilter.MaxFilter(3)))==0]=0
    return Image.fromarray(a)
def fit(im,size,body_only=False):
    im=isolate(im,body_only);box=im.getchannel('A').getbbox();assert box
    crop=ImageOps.contain(im.crop(box),(size[0]-8,size[1]-8),Image.Resampling.LANCZOS)
    result=Image.new('RGBA',size);result.alpha_composite(crop,((size[0]-crop.width)//2,size[1]-crop.height-4))
    return clean(result)
def cell(im,col,row,cols=4,rows=4):return im.crop((round(col*im.width/cols),round(row*im.height/rows),round((col+1)*im.width/cols),round((row+1)*im.height/rows)))
def export(im,name,entry):
    p=out/name;fmt='WEBP' if p.suffix=='.webp' else 'PNG'
    im=im.convert('RGB') if fmt=='WEBP' else clean(im)
    im.save(p,format=fmt,**({'quality':83,'method':6} if fmt=='WEBP' else {'optimize':True}))
    entry['runtime'].append({**record(p),'size':list(im.size),'format':fmt})
records=[]
baseline=sum(p.stat().st_size for p in (root/'public').rglob('*') if p.is_file() and 'r3' not in p.parts)
for asset in prompts['assets']:
    ident=asset['id'];original=masters/'original'/f'{ident}.png';shutil.copyfile(asset['source'],original);im=Image.open(original)
    entry={'id':ident,'round':3,'tool':prompts['tool'],'modelSlug':None,'original':record(original),'sourceSize':list(im.size),'runtime':[],
           'license':'Project-owned generated art; MIT distribution','attribution':'Emberline: Last Haven contributors / OpenAI image_gen'}
    if ident in ['xi','an','runner','shambler','truck','icons','logo']:
        assert im.mode=='RGBA' and im.getchannel('A').getextrema()[0]==0,ident
        im=clean(im)
        if ident in ['runner','shambler']:
            # Lift midtones without reintroducing the R2 saturation boost of 1.5.
            hsv=np.array(im.convert('RGB').convert('HSV')).astype(float)
            hsv[:,:,2]=np.power(hsv[:,:,2]/255,.78)*255
            # Low-chroma shadow pixels receive a restrained earth tint, not blue.
            neutral=hsv[:,:,1]<.22*255
            hsv[:,:,0][neutral]=22
            hsv[:,:,1][neutral]=.32*255
            blue=(hsv[:,:,0]>.49*255)&(hsv[:,:,0]<.72*255)
            hsv[:,:,1][blue]=np.minimum(255,hsv[:,:,1][blue]*2.0)
            alpha=im.getchannel('A');im=Image.fromarray(hsv.astype('uint8'),'HSV').convert('RGBA');im.putalpha(alpha);im=clean(im)
            entry['colorCalibration']={'valueGamma':.78,'blueHueRange':[.49,.72],'blueSaturationMultiplierOnNewMaster':2.0,'neutralShadowTint':{'threshold':.22,'hue255':22,'saturation':.32},'note':'New generated master was too desaturated; calibrate only blue against R2 runtime to target ~30% reduction. Gray shadows receive earth tint. Original generated image retained.'}
        for stage,view in [('rgba',im),('masks',im.getchannel('A')),('opaque',Image.alpha_composite(Image.new('RGBA',im.size,(75,84,88,255)),im).convert('RGB'))]:
            p=masters/stage/f'{ident}.png';view.save(p,optimize=True);entry[stage]=record(p)
        entry['postprocess']='Generated native alpha retained. Alpha<=8 RGB zeroed, disconnected tiny artifacts removed, explicit source crops padded and resized. No invented geometry or animation frames.'
    if ident=='xi':
        # Generated layout uses a taller top row, record actual source rectangles.
        split=round(im.height*.60);entry['sourceSplitY']=split
        for col,name in enumerate(['front','side','back','portrait']):
            crop=im.crop((round(col*im.width/4),0,round((col+1)*im.width/4),split))
            export(fit(crop,(192,256) if col==3 else (160,288),body_only=True),f'xi-{name}.png',entry)
        atlas=Image.new('RGBA',(192*4,192))
        for col in range(4):atlas.alpha_composite(fit(im.crop((round(col*im.width/4),split,round((col+1)*im.width/4),im.height)),(192,192)),(col*192,0))
        export(atlas,'xi-gunner.png',entry)
        entry['frameMap']={'columns':4,'frameSize':[192,192],'phases':['rest','anticipation','impact','recovery'],'timing':'Existing gunnerFrame(p.shot,.6); damage remains projectile collision.'}
    elif ident=='an':
        atlas=Image.new('RGBA',(192*4,256))
        for col in range(4):atlas.alpha_composite(fit(cell(im,col,0,4,1),(192,256)),(col*192,0))
        export(atlas,'an-poses.png',entry)
        entry['frameMap']={'columns':4,'frameSize':[192,256],'actions':['listen','eyes-closed','caution','startle'],'note':'Real distinct hand, facial and torso poses; existing night rules select frame.'}
    elif ident in ['runner','shambler']:
        for row,action in enumerate(['walk','attack','hurt','death']):
            atlas=Image.new('RGBA',(192*4,192))
            for col in range(4):
                pose=ImageOps.contain(isolate(cell(im,col,row)),(184,184),Image.Resampling.LANCZOS)
                atlas.alpha_composite(pose,(192*col+(192-pose.width)//2,192-pose.height-4))
            export(atlas,f'{ident}-{action}.png',entry)
        entry['frameMap']={'columns':4,'frameSize':[192,192],'actions':['walk','attack','hurt','death'],'impactFrame':2,'impactSeconds':{'latched':.2,'defense':.32},'hurtSeconds':.24,'deathSeconds':.65}
    elif ident=='outpost':export(im.resize((768,1152),Image.Resampling.LANCZOS),'outpost-after.webp',entry)
    elif ident=='panel':export(im.resize((640,640),Image.Resampling.LANCZOS),'panel.webp',entry)
    elif ident=='truck':export(fit(im,(256,448)),'truck.png',entry)
    elif ident=='icons':
        # Two survivor portraits belong to one resource icon. Preserve both.
        cuts=[(0,.235),(.235,.393),(.59,.81),(.81,1)];entry['sourceCutsXFraction']=cuts
        entry['iconNote']='People icon uses only the actual brown-bob Xi portrait; generated gray-haired unused concept is excluded.'
        for (left,right),name in zip(cuts,['supply','people','hull','armor']):export(fit(im.crop((round(left*im.width),0,round(right*im.width),im.height)),(96,96)),name+'.png',entry)
    elif ident=='logo':export(fit(im,(640,250)),'logo.png',entry)
    elif ident=='app':
        for size in [192,512]:export(im.resize((size,size),Image.Resampling.LANCZOS),f'app-{size}.png',entry)
        p=art/'proposals/app-store-r3-1024.png';im.convert('RGB').resize((1024,1024),Image.Resampling.LANCZOS).save(p,optimize=True);entry['proposal']=record(p)
    records.append(entry)
live=[r for a in records for r in a['runtime']]
manifest={'status':'EXECUTED','round':3,'tool':prompts['tool'],'actualModelSlug':None,'requestedModelSlug':'gpt-image-2','modelNote':prompts['modelNote'],
          'generatedAssets':len(records),'runtimeFiles':len(live),'baselinePublicBytes':baseline,'runtimeAddedBytes':sum(r['bytes'] for r in live),'assets':records}
(art/'ASSET_MANIFEST_R3.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
old=json.loads((art/'PROMPTS.json').read_text(encoding='utf-8'));old['round3']={'file':'PROMPTS_R3.json','stylePrefix':prompts['stylePrefix'],'assets':prompts['assets'],'modelNote':prompts['modelNote']}
(art/'PROMPTS.json').write_text(json.dumps(old,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
print(json.dumps({'status':'EXECUTED','generated':len(records),'runtimeFiles':len(live),'addedBytes':manifest['runtimeAddedBytes']}))
