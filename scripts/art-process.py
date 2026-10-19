"""R1 deterministic image exports; preserves generated alpha, no synthetic art."""
from pathlib import Path
from PIL import Image, ImageOps
import json, hashlib, shutil
import numpy as np

root=Path(__file__).resolve().parents[1]
art=root/'docs/art'; runtime=root/'public/art/r1'
runtime.mkdir(parents=True,exist_ok=True)
for stage in ['original','opaque','masks','rgba']:(art/'masters'/stage).mkdir(parents=True,exist_ok=True)
prompts=json.loads((art/'PROMPTS.json').read_text(encoding='utf-8'))
records=[]; outputs=[]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def export(im,name,size,fmt='PNG'):
    bounds=(size[0]-4,size[1]-4) if fmt=='PNG' and im.mode=='RGBA' else size
    im=ImageOps.contain(im,bounds,Image.Resampling.LANCZOS)
    if fmt=='PNG' and im.mode=='RGBA':
        canvas=Image.new('RGBA',size);canvas.alpha_composite(im,((size[0]-im.width)//2,(size[1]-im.height)//2));a=np.array(canvas);a[a[:,:,3]<=8]=0;im=Image.fromarray(a)
    p=(art/'proposals'/name) if name=='app-store-1024.png' else runtime/name
    p.parent.mkdir(parents=True,exist_ok=True)
    im.save(p,format=fmt,**({'quality':83,'method':6} if fmt=='WEBP' else {'optimize':True}))
    outputs.append({'path':p.relative_to(root).as_posix(),'size':list(im.size),'bytes':p.stat().st_size,'sha256':sha(p),'format':fmt})
    return im
for r in prompts['assets']:
    ident=r['id'];source=Path(r['source']);original=art/'masters/original'/f'{ident}.png';shutil.copyfile(source,original)
    im=Image.open(original);entry={'id':ident,'original':original.relative_to(root).as_posix(),'originalSha256':sha(original),'sourceDimensions':list(im.size),'tool':'image_gen__imagegen','modelSlug':None,'license':'Project-owned generated art; MIT distribution','attribution':'Emberline: Last Haven contributors / OpenAI image_gen','runtime':[]}
    before=len(outputs)
    if im.mode=='RGBA':
        # Native tool alpha was verified. Preserve silhouette and soft edges;
        # only zero invisible RGB, as required by the requested matte pipeline.
        a=np.array(im);a[a[:,:,3]<=8]=0;im=Image.fromarray(a)
        for stage,img in [('rgba',im),('masks',im.getchannel('A')),('opaque',Image.alpha_composite(Image.new('RGBA',im.size,(43,32,32,255)),im).convert('RGB'))]:
            p=art/'masters'/stage/f'{ident}.png';img.save(p,optimize=True);entry[stage]={'path':p.relative_to(root).as_posix(),'sha256':sha(p)}
        entry['postprocess']='Native alpha retained; alpha <=8 and invisible RGB zeroed; no matte removal required; opaque viewing master + mask + RGBA kept.'
    if ident in ['departure','train']:export(im,ident+'.webp',(1536,1024),'WEBP')
    elif ident in ['road','outpost']:export(im,ident+'.webp',(768,1152),'WEBP')
    elif ident=='panel':export(im,'panel.webp',(512,512),'WEBP')
    elif ident=='xi':
        for i,view in enumerate(['front','side','back']):
            crop=im.crop((i*im.width//3,0,(i+1)*im.width//3,im.height));bbox=crop.getchannel('A').getbbox();crop=crop.crop(bbox)
            export(crop,f'xi-{view}.png',(256,512))
            if i==0:export(crop.crop((0,0,crop.width,int(crop.height*.55))),'xi-portrait.png',(256,320))
    elif ident=='an':
        sheet=Image.new('RGBA',(192*4,256))
        for i in range(4):
            crop=im.crop((i*im.width//4,0,(i+1)*im.width//4,im.height));crop=ImageOps.contain(crop,(188,252),Image.Resampling.LANCZOS);sheet.alpha_composite(crop,(i*192+(192-crop.width)//2,(256-crop.height)//2))
        export(sheet,'an-poses.png',(768,256))
        entry['frameMap']={'columns':4,'frameSize':[192,256],'poses':['listen','eyes-closed-listen','look-up','startle'],'timing':'listening uses first two genuine poses; observation uses look-up; impact uses startle. No damage rules changed.'}
    elif ident=='vehicles':
        for i,name in enumerate(['truck','trailer']):
            crop=im.crop((i*im.width//2,0,(i+1)*im.width//2,im.height));export(crop.crop(crop.getchannel('A').getbbox()),name+'.png',(192,384))
    elif ident=='bait':export(im.crop(im.getchannel('A').getbbox()),'bait.png',(128,160))
    elif ident=='icons':
        for i,name in enumerate(['supply','people','hull','armor']):
            crop=im.crop((i*im.width//4,0,(i+1)*im.width//4,im.height));export(crop.crop(crop.getchannel('A').getbbox()),name+'.png',(64,64))
    elif ident=='logo':export(im.crop(im.getchannel('A').getbbox()),'logo.png',(640,256))
    elif ident=='app':
        export(im,'app-512.png',(512,512));export(im,'app-192.png',(192,192));export(im,'app-store-1024.png',(1024,1024))
    entry['runtime']=outputs[before:];records.append(entry)
live=[o for o in outputs if o['path'].startswith('public/')]
manifest={'status':'EXECUTED','generatedAssets':len(records),'runtimeFiles':len(live),'tool':'image_gen__imagegen','requestedModelSlug':'gpt-image-2','actualModelSlug':None,'modelNote':prompts['modelNote'],'baselinePublicBytes':4909166,'runtimeAddedBytes':sum(o['bytes'] for o in live),'assets':records}
(art/'ASSET_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'generated':len(records),'runtime':len(live),'addedBytes':manifest['runtimeAddedBytes']},ensure_ascii=False))
