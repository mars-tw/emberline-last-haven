"""Read back actual captures; create local comparison evidence, never fake a scene."""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
import json, hashlib, shutil

root=Path(__file__).resolve().parents[1];art=root/'docs/art'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((art/'compare/r2-before/captures.json').read_text(encoding='utf-8'))
after=json.loads((art/'compare/r2-after/captures.json').read_text(encoding='utf-8'))
assert len(before['records'])==len(after['records'])==25
assert after['indexSha256']==sha(root/'dist/index.html')
records=[]
for rec in after['records']:
    p=root/rec['path'];assert sha(p)==rec['sha256']
    im=Image.open(p);assert list(im.size)==list(rec['viewport'].values())
    hsv=np.array(im.convert('HSV')).astype(float)
    # Saturated warm signal, not low-saturation beige paper or brown shadow.
    warm=(hsv[:,:,0]<43)&(hsv[:,:,1]>=255*.35)&(hsv[:,:,2]>=255*.30)
    fraction=float(warm.mean());assert fraction<.30,(p,fraction)
    actors=rec['visual']['actors']
    if rec['viewport']['width']==390:
        for a in actors:
            if a['action']!='death':assert min(a['visibleWidth'],a['visibleHeight'])>=39.99
    # Before first input a fresh campaign has no durable localStorage entry yet.
    counts={};enemies=rec['state']['progress']['enemies'] if rec['state'] else []
    for a in actors:
        if not a['id'].startswith('enemy-'):continue
        ident=int(a['id'].split('-')[1]);enemy=next(e for e in enemies if e['id']==ident)
        key=enemy['type']+'-'+a['action']+'-'+str(a['frame']);counts[key]=counts.get(key,0)+1
    assert max(counts.values(),default=0)<=2,(p,counts)
    records.append({'path':rec['path'],'warmSignalAreaFraction':fraction,'actors':actors,'sampledMaxIdenticalEnemyPose':max(counts.values(),default=0)})

phone=next(r for r in after['records'] if r['path'].endswith('phone-convoy.png'))
assert phone['state']['progress']['time']<10 and phone['state']['progress']['enemies']
assert len([p for p in phone['visual']['artPaths'] if p.startswith('r2/')])==27
evidence=root/'docs/evidence/art-r2';evidence.mkdir(parents=True,exist_ok=True)
for viewport in ['phone','tablet','landscape']:
    for phase in ['before','after']:
        source=art/f'compare/r2-{phase}/{viewport}-bait.png'
        shutil.copyfile(source,evidence/f'{viewport}-{phase}.png')

# Labeled 1:1 pairs, only existing screenshot pixels resized for the report sheet.
scenes=['departure','convoy','bait','night','journal']
sheet=Image.new('RGB',(390*2,46+844*len(scenes)),(39,46,48));d=ImageDraw.Draw(sheet)
d.text((12,14),'R1 / BEFORE',fill='#f0e7d5');d.text((402,14),'R2 / AFTER',fill='#f0e7d5')
for row,scene in enumerate(scenes):
    for col,phase in enumerate(['before','after']):
        im=Image.open(art/f'compare/r2-{phase}/phone-{scene}.png').convert('RGB')
        sheet.paste(im,(col*390,46+row*844))
sheet.save(art/'compare/R2_PHONE_PAIRS.webp',quality=85,method=6)

result={'status':'VERIFIED','headless':True,'stateInjection':False,'indexSha256':after['indexSha256'],
        'capturePairs':25,'firstEnemyBeforeSeconds':phone['state']['progress']['time'],
        'phoneVisibleActorMinimumPixels':40,'newRuntimeImagesLoaded':27,
        'nightHotspots':'Passenger/window observations and one correct roof/window counter asserted via actual mouse input in art-capture.mjs phone run.',
        'warmMethod':'Pillow HSV: H<43/255 (60 degrees), S>=.35, V>=.30 over complete screenshot; threshold <.30.',
        'poseLimit':'<=2 identical enemy type/action/frame in these 25 screenshots only; not a guarantee for every possible simulation state.',
        'records':records}
(art/'RUNTIME_GATES_R2.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print('VERIFIED 25 screenshot pairs, warm area <30%, phone actors >=40px, first enemy <10s, sampled pose count <=2')
