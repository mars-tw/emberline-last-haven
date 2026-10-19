"""R3 asset and exact runtime evidence gates. Does not invent human recognition scores."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
from collections import Counter
import numpy as np
import json,hashlib
root=Path(__file__).resolve().parents[1];art=root/'docs/art'
manifest=json.loads((art/'ASSET_MANIFEST_R3.json').read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
checks=[];tiles=[];blue=[]
for asset in manifest['assets']:
    for key in ['original','opaque','rgba','masks','proposal']:
        if key in asset:assert sha(root/asset[key]['path'])==asset[key]['sha256']
    assert asset['tool']=='image_gen__imagegen' and asset['modelSlug'] is None
    for r in asset['runtime']:
        p=root/r['path'];im=Image.open(p);assert sha(p)==r['sha256'];assert list(im.size)==r['size'];assert im.format==r['format']
        check={'path':r['path'],'hashSizeFormat':True}
        if asset['id'] in ['xi','an','runner','shambler','truck','icons','logo']:
            assert im.mode=='RGBA';a=np.array(im);alpha=a[:,:,3];visible=alpha>200
            assert not np.any(a[:,:,:3][alpha==0]);assert max(alpha[0,0],alpha[0,-1],alpha[-1,0],alpha[-1,-1])==0
            check.update(cornersTransparent=True,invisibleRGBZero=True,alphaOccupancy=float((alpha>8).mean()))
            if asset['id'] in ['xi','an','runner','shambler']:
                hsv=np.array(im.convert('RGB').convert('HSV')).astype(float)/255;v=hsv[:,:,2];s=hsv[:,:,1]
                metrics={'brightness':float(v[visible].mean()),'nearBlack':float((v[visible]<.15).mean()),'saturation':float(s[visible].mean()),'lowSaturation':float((s[visible]<.20).mean())};check.update(metrics)
                assert .30<=metrics['brightness']<=.75,(p,metrics)
                assert metrics['nearBlack']<.35 and metrics['saturation']>=.32 and metrics['lowSaturation']<.20,(p,metrics)
            animated=asset['id'] in ['runner','shambler','an'] or p.name=='xi-gunner.png'
            if animated:
                fw=im.width//4;frames=[im.crop((i*fw,0,(i+1)*fw,im.height)) for i in range(4)]
                assert len({sha256.tobytes() for sha256 in frames})==4
                masks=[np.array(f.getchannel('A'))>80 for f in frames]
                diffs=[float((masks[i]!=masks[i+1]).mean()) for i in range(3)];assert min(diffs)>.005,(p,diffs)
                check['adjacentAlphaDifference']=diffs
                for i,f in enumerate(frames):tiles.append((f,p.stem+'-'+str(i)))
            else:tiles.append((im,p.stem))
            if asset['id'] in ['runner','shambler']:
                old=Image.open(root/'public/art/r2'/p.name).convert('RGBA');oldh=np.array(old.convert('RGB').convert('HSV')).astype(float)/255;oldm=np.array(old)[:,:,3]>200
                h=np.array(im.convert('RGB').convert('HSV')).astype(float)/255
                oldblue=oldm&(oldh[:,:,0]>.49)&(oldh[:,:,0]<.72);newblue=visible&(h[:,:,0]>.49)&(h[:,:,0]<.72)
                ratio=float(h[:,:,1][newblue].mean()/oldh[:,:,1][oldblue].mean());blue.append({'path':r['path'],'blueSaturationRelativeToR2':ratio})
        checks.append(check)
sheet=Image.new('RGB',(128*6,100*((len(tiles)+5)//6)),(75,84,88));draw=ImageDraw.Draw(sheet)
for i,(im,label) in enumerate(tiles):
    thumb=ImageOps.contain(im,(64,64),Image.Resampling.LANCZOS);x=i%6*128+(128-thumb.width)//2;y=i//6*100+4;sheet.paste(thumb,(x,y),thumb);draw.text((i%6*128+3,i//6*100+74),label,fill='#f0e7d5')
sheet.save(art/'THUMBNAILS_64_R3.png')
blind=Image.new('RGB',(3*100,100),(75,84,88));d=ImageDraw.Draw(blind)
for i,path in enumerate(['public/art/r3/xi-portrait.png','public/art/r3/an-poses.png','public/art/r3/xi-side.png']):
    im=Image.open(root/path)
    if 'an-poses' in path:im=im.crop((0,0,im.width//4,im.height))
    t=ImageOps.contain(im,(64,64),Image.Resampling.LANCZOS);blind.paste(t,(i*100+(100-t.width)//2,3),t);d.text((i*100+43,76),str(i+1),fill='#f0e7d5')
blind.save(art/'BLIND_64_R3.png')

captures=json.loads((art/'compare/r3-after/captures.json').read_text(encoding='utf-8'));runtime=[]
for r in captures['records']:
    assert sha(root/r['path'])==r['sha256'];assert Image.open(root/r['path']).size==(r['viewport']['width'],r['viewport']['height']);v=r['visual'];width=r['viewport']['width'];scene=Path(r['path']).stem.split('-',1)[1]
    row={'path':r['path'],'viewport':r['viewport']}
    if scene!='journal':
        t=v['ticket'];pad=[]
        for text in t['text']:
            pad.extend([(text['x']-t['x'])/t['width'],(t['x']+t['width']-text['right'])/t['width']])
            assert min(pad)>=.06,(r['path'],text,t)
            assert text['y']>=t['y'] and text['bottom']<=t['y']+t['height']+.6,(r['path'],text,t)
            assert text['scroll']<=text['client']+1,(r['path'],text)
        row['minimumTextSideFraction']=min(pad);row['textFullyInside']=True
    a=v['telemetry']['actors'];s=r['state']
    if width==390:
        for actor in a:
            if actor['action']!='death':assert min(actor['visibleWidth'],actor['visibleHeight'])>=39.99,(r['path'],actor)
        if scene=='convoy':assert 0<v['telemetry']['roofRatio']<=1/3;row['roofRatio']=v['telemetry']['roofRatio']
    counts=Counter((actor['path'],actor['frame']) for actor in a if actor['id'].startswith('enemy'))
    assert max(counts.values(),default=0)<=2,(r['path'],counts)
    row['maxSameEnemyPose']=max(counts.values(),default=0)
    row['distinctEnemyPoses']=len(counts)
    if scene=='common-progress':
        assert v['telemetry']['sceneArt']=='r3/outpost-after.webp'
        assert len(counts)>=3,(r['path'],counts)
    if scene=='bait':assert v['telemetry']['sceneArt']=='r2/outpost.webp'
    if scene=='night':assert len(v['primary'])==1 and v['primary'][0] in ['counter-roof','counter-window']
    assert v['beam']=='''""''',(r['path'],v['beam'])
    runtime.append(row)
assert len(runtime)==49
blue_mean=sum(b['blueSaturationRelativeToR2'] for b in blue)/len(blue)
assert .65<=blue_mean<=.75,blue_mean
manifest['status']='VERIFIED';(art/'ASSET_MANIFEST_R3.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
result={'status':'VERIFIED','generatedAssets':10,'runtimeFiles':len(checks),'runtimeAddedBytes':manifest['runtimeAddedBytes'],'publicBytes':sum(p.stat().st_size for p in (root/'public').rglob('*') if p.is_file()),
 'blueSaturationRelativeToR2Mean':blue_mean,'blue':blue,'checks':checks,'runtime':runtime,'headless':True,'stateInjection':False,
 'humanBlindRecognition':{'status':'BLOCKED','required':'>=80%','reason':'No human participants; blind contact sheet provided, no fabricated recognition score.'},
 'poseLimitScope':'All 49 ordinary-input captures; not an arbitrary stress-state guarantee. Attack frame remains tied to impact age.'}
(art/'ART_GATES_R3.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
print(f'VERIFIED R3: {len(checks)} runtime files, 49 captures, paper 6%, actors 40px, roof <=1/3, blue saturation ratio {blue_mean:.3f}')
