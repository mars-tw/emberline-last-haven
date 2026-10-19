"""R4 asset, ordinary-input frame and store-image evidence. No human scores invented."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
from collections import Counter
import numpy as np
import json,hashlib,shutil
root=Path(__file__).resolve().parents[1];art=root/'docs/art';evidence=root/'docs/evidence/art-r5'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((art/'ASSET_MANIFEST_R4.json').read_text(encoding='utf-8'));assert m['generatedAssets']==9
checks=[];tiles=[]
for a in m['assets']:
    for key in ['original','rgba','masks','opaque','proposal']:
        if key in a:assert sha(root/a[key]['path'])==a[key]['sha256']
    for s in a.get('sources',[])+a.get('references',[]):assert sha(root/s['path'])==s['sha256']
    for f in a['runtime']:
        p=root/f['path'];im=Image.open(p);assert sha(p)==f['sha256'];assert list(im.size)==f['size'];assert im.format==f['format']
        row={'path':f['path'],'hashSizeFormat':True}
        if f['format']=='PNG':
            assert im.mode=='RGBA';arr=np.array(im);alpha=arr[:,:,3];visible=alpha>200
            if a['id']!='app':
                assert not np.any(arr[:,:,:3][alpha==0]);assert all(alpha[y,x]==0 for y,x in [(0,0),(0,-1),(-1,0),(-1,-1)])
                row['cornersTransparent']=True;row['invisibleRGBZero']=True
            if a['id'] in ['xi','night','attack','climber','enemy-contrast']:
                hsv=np.array(im.convert('RGB').convert('HSV'))/255.;v=hsv[:,:,2];s=hsv[:,:,1]
                metrics={'brightness':float(v[visible].mean()),'nearBlack':float((v[visible]<.15).mean()),'saturation':float(s[visible].mean()),'lowSaturation':float((s[visible]<.20).mean())}
                assert .30<=metrics['brightness']<=.75,(p,metrics)
                assert metrics['nearBlack']<.35 and metrics['saturation']>=.32 and metrics['lowSaturation']<.20,(p,metrics)
                row.update(metrics)
                animated=im.width>im.height*2 and ('xi-gunner' in p.name or a['id'] in ['night','attack','climber','enemy-contrast'])
                if animated:
                    fw=im.width//4;frames=[im.crop((i*fw,0,(i+1)*fw,im.height)) for i in range(4)]
                    assert len({f.tobytes() for f in frames})==4
                    masks=[np.array(f.getchannel('A'))>80 for f in frames]
                    diffs=[float((masks[i]!=masks[i+1]).mean()) for i in range(3)];assert min(diffs)>.005,(p,diffs)
                    row['adjacentAlphaDifference']=diffs
                    for i,f in enumerate(frames):tiles.append((f,p.stem+'-'+str(i)))
                else:tiles.append((im,p.stem))
        checks.append(row)
sheet=Image.new('RGB',(128*6,100*((len(tiles)+5)//6)),(75,84,88));draw=ImageDraw.Draw(sheet)
for i,(im,label) in enumerate(tiles):
    thumb=ImageOps.contain(im,(64,64),Image.Resampling.LANCZOS);x=i%6*128+(128-thumb.width)//2;y=i//6*100+4
    sheet.paste(thumb,(x,y),thumb);draw.text((i%6*128+3,i//6*100+74),label,fill='#f0e7d5')
sheet.save(art/'THUMBNAILS_64_R4.png')

captures=json.loads((art/'compare/r5-after/captures.json').read_text(encoding='utf-8-sig'));runtime=[]
assert captures['indexSha256']==sha(root/'dist/index.html')
for r in captures['records']:
    assert sha(root/r['path'])==r['sha256'];assert Image.open(root/r['path']).size==(r['viewport']['width'],r['viewport']['height'])
    v=r['visual'];width=r['viewport']['width'];scene=Path(r['path']).stem.split('-',1)[1];row={'path':r['path']}
    if scene!='journal':
        t=v['ticket'];pad=[]
        for text in t['text']:
            pad.extend([(text['x']-t['x'])/t['width'],(t['x']+t['width']-text['right'])/t['width']])
            assert min(pad)>=.06,(r['path'],text,t)
            assert text['y']>=t['y'] and text['bottom']<=t['y']+t['height']+.6,(r['path'],text,t)
            assert text['scroll']<=text['client']+1
        row['minimumTextSideFraction']=min(pad)
        if width==390:assert t['height']==75;row['paperReduction']=1-t['height']/94
    actors=v['telemetry']['actors']
    if width==390:
        for actor in actors:
            if actor['action']!='death':assert min(actor['visibleWidth'],actor['visibleHeight'])>=39.99,(r['path'],actor)
        if scene=='convoy':assert 0<v['telemetry']['roofRatio']<=1/3
    if scene=='bait':assert v['telemetry']['sceneArt']==('r5/outpost-wide.webp' if v['canvas']['width']/v['canvas']['height']>1.7 else 'r4/outpost-ready.webp')
    if scene=='common-progress':
        assert v['telemetry']['sceneArt']==('r5/outpost-wide.webp' if v['canvas']['width']/v['canvas']['height']>1.7 else 'r4/outpost-ready.webp')
        assert len(r['state']['progress']['divertedGroups'])>=2
        for group in r['state']['progress']['divertedGroups']:
            ledger=r['state']['progress']['diversion'][group]
            assert ledger['escaped']==ledger['total']
    if scene=='defense-crowd' and width==360:
        assert 7<=len([a for a in actors if a['id'].startswith('enemy')])<=9
    if scene=='night':
        xi=[a for a in actors if a['id']=='xi'];assert len(xi)==1 and xi[0]['path']=='r5/xi-night.png'
        # R6: before player input none of the three night actions is preselected.
        # Exact empty state replaces the old automatic threat-answer highlight.
        assert v['primary']==[]
    counts=Counter((a['path'],a['frame']) for a in actors if a['id'].startswith('enemy'))
    if scene!='convoy':assert max(counts.values(),default=0)<=2,(r['path'],counts)
    row['enemyCount']=sum(counts.values());row['maxSameEnemyPose']=max(counts.values(),default=0);runtime.append(row)
assert len(runtime)==56
assert sum('defense-crowd' in r['path'] for r in runtime)==7
store=json.loads((evidence/'store-captures.json').read_text(encoding='utf-8'))
assert store['indexSha256']==sha(root/'dist/index.html');assert len(store['screenshots'])==10
for r in store['screenshots']:
    p=root/r['path'];assert sha(p)==r['sha256'];assert Image.open(p).size==tuple(r['dimensions'])
    assert r['dimensions']==([1290,2796] if '/phone-' in r['path'] else [2064,2752])
    assert abs(r['route']['beamWidth']-r['route']['expected'])<1 and r['route']['opacity']=='1'
    if '02-convoy' in r['path']:
        climbers=[a for a in r['telemetry']['actors'] if a['path']=='r5/climber-attack.png'];assert len(climbers)>=3
        assert any(a['frame']==2 for a in climbers)
    if '05-night' in r['path']:assert any(a['id']=='xi' and a['path']=='r5/xi-night.png' for a in r['telemetry']['actors'])

background=Image.open(root/'public/art/r3/outpost-after.webp');hsv=np.array(background.convert('HSV'))/255.
groundV=float(hsv[int(background.height*.26):int(background.height*.65),int(background.width*.2):int(background.width*.8),2].mean())
enemyContrast=[{'path':r['path'],'spriteV':r['brightness'],'groundRegionV':groundV,'difference':r['brightness']-groundV} for r in checks if '/runner-' in r['path'] or '/shambler-' in r['path']]
assert min(r['difference'] for r in enemyContrast)>=.10

# Original-pixel comparison and small, unlabelled five-screen identity exercise.
scenes=['departure','convoy','bait','common-progress','night']
pairs=Image.new('RGB',(780,40+844*5),(43,38,32));d=ImageDraw.Draw(pairs);d.text((12,13),'R4 / BEFORE',fill='#f0e7d5');d.text((402,13),'R5 / AFTER',fill='#f0e7d5')
blind=Image.new('RGB',(5*88,100),(75,84,88));bd=ImageDraw.Draw(blind)
for i,scene in enumerate(scenes):
    for col,phase in enumerate(['before','after']):
        im=Image.open(art/f'compare/r5-{phase}/phone-{scene}.png').convert('RGB');assert im.size==(390,844);pairs.paste(im,(col*390,40+i*844))
    path=['xi-side.png','xi-gunner.png','xi-front.png','xi-attack.png','xi-night.png'][i];im=Image.open(root/'public/art/r4'/path)
    if im.width>im.height*2:im=im.crop((0,0,im.width//4,im.height))
    thumb=ImageOps.contain(im,(64,64),Image.Resampling.LANCZOS);blind.paste(thumb,(88*i+(88-thumb.width)//2,3),thumb);bd.text((88*i+38,78),str(i+1),fill='#f0e7d5')
pairs.save(art/'compare/R5_PHONE_PAIRS.webp',quality=87,method=6);blind.save(art/'BLIND_64_R4.png')
foils=Image.new('RGB',(7*88,100),(75,84,88));fd=ImageDraw.Draw(foils)
identity=[('r4/xi-side.png',0,'xi'),('r3/an-poses.png',0,'an'),('r4/xi-gunner.png',0,'xi'),('r4/xi-front.png',0,'xi'),('r3/an-poses.png',2,'an'),('r4/xi-attack.png',0,'xi'),('r4/xi-night.png',0,'xi')]
for i,(path,frame,who) in enumerate(identity):
    im=Image.open(root/'public/art'/path)
    if im.width>im.height*2:im=im.crop((frame*im.width//4,0,(frame+1)*im.width//4,im.height))
    thumb=ImageOps.contain(im,(64,64),Image.Resampling.LANCZOS);foils.paste(thumb,(88*i+(88-thumb.width)//2,3),thumb);fd.text((88*i+38,78),chr(65+i),fill='#f0e7d5')
foils.save(art/'BLIND_64_R4_WITH_FOILS.png')
(art/'BLIND_64_R4_KEY.json').write_text(json.dumps({'status':'PREPARED','answerKey':{chr(65+i):who for i,(_,_,who) in enumerate(identity)},'participants':0,'recognitionRate':None},indent=2),encoding='utf-8')
for view in ['phone','tablet','desktop']:
    for phase in ['before','after']:shutil.copyfile(art/f'compare/r5-{phase}/{view}-common-progress.png',evidence/f'{view}-{phase}.png')
thumbnails=Image.new('RGB',(5*129,280),(43,38,32))
for i,r in enumerate([r for r in store['screenshots'] if '/phone-' in r['path']]):thumbnails.paste(Image.open(root/r['path']).resize((129,280),Image.Resampling.LANCZOS),(i*129,0))
thumbnails.save(art/'STORE_THUMBNAILS_R5.png')
m['status']='VERIFIED';(art/'ASSET_MANIFEST_R4.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
result={'status':'VERIFIED','archiveAssetRound':4,'runtimeRegressionRound':5,'generatedAssets':9,'runtimeFiles':len(checks),'runtimeAddedBytes':m['runtimeAddedBytes'],'publicBytes':sum(p.stat().st_size for p in (root/'public').rglob('*') if p.is_file()),'checks':checks,'runtime':runtime,'storeScreenshots':10,'stateInjection':False,'enemyContrast':enemyContrast,
 'humanBlindRecognition':{'status':'BLOCKED','required':'>=80%','reason':'No recruited human participants; supplied unlabelled 64px five-scene sheet is not a measured recognition score.'},
 'sameStationHumanTest':{'status':'BLOCKED','reason':'Permanent landmarks visually cross-checked by executor, no independent text-covered human test.'},
 'independentScore':{'status':'BLOCKED','target':'>=9/10','lastHistoricalMuse':8.0,'reason':'No new independent review was commissioned; user prohibits external delegation.'}}
(art/'ART_GATES_R4.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
print(f"VERIFIED R4: {len(checks)} runtime files, 56 captures, ten native-size store shots, real three-climber impact")
