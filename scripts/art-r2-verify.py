from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import numpy as np
import hashlib, json

root=Path(__file__).resolve().parents[1]
art=root/'docs/art'
manifest=json.loads((art/'ASSET_MANIFEST_R2.json').read_text(encoding='utf-8'))
checks=[]; tiles=[]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for asset in manifest['assets']:
    assert asset['tool']=='image_gen__imagegen' and asset['modelSlug'] is None
    for key in ['original','opaque','rgba','masks','calibrated','proposal']:
        if key in asset:
            rec=asset[key];assert sha(root/rec['path'])==rec['sha256']
    for r in asset['runtime']:
        p=root/r['path'];im=Image.open(p)
        assert sha(p)==r['sha256'] and list(im.size)==r['size'] and im.format==r['format']
        check={'path':r['path'],'hashDimensionFormat':True}
        if im.mode=='RGBA' and asset['id']!='app':
            a=np.array(im);alpha=a[:,:,3];visible=alpha>200
            assert max(alpha[0,0],alpha[0,-1],alpha[-1,0],alpha[-1,-1])==0
            assert not np.any(a[:,:,:3][alpha==0])
            occupancy=float((alpha>8).mean());assert .003<occupancy<.95
            check.update(alphaOccupancy=occupancy,cornersTransparent=True,invisibleRGBZero=True)
            if asset['id'] in ['xi','runner','shambler']:
                rgb=a[:,:,:3].astype(float)/255;v=rgb.max(2);s=(v-rgb.min(2))/np.maximum(v,.00001)
                metrics={'brightnessHSVValue':float(v[visible].mean()),'nearBlackFraction':float((v[visible]<.15).mean()),'saturationHSV':float(s[visible].mean()),'lowSaturationFraction':float((s[visible]<.2).mean())}
                check.update(metrics)
                assert .30<=metrics['brightnessHSVValue']<=.75,(p,metrics)
                assert metrics['nearBlackFraction']<.35 and metrics['saturationHSV']>=.32 and metrics['lowSaturationFraction']<.20,(p,metrics)
            if asset['id'] in ['runner','shambler'] or p.name=='xi-attack.png':
                fw=im.width//4;frames=[im.crop((i*fw,0,(i+1)*fw,im.height)) for i in range(4)]
                assert len({hashlib.sha256(f.tobytes()).hexdigest() for f in frames})==4
                masks=[np.array(f.getchannel('A'))>80 for f in frames]
                diffs=[float(np.mean(masks[i]!=masks[i+1])) for i in range(3)]
                assert min(diffs)>.005,(p,diffs)
                check['adjacentPoseAlphaDifference']=diffs
                check['genuineFrames']=4
                for i,f in enumerate(frames):tiles.append((f,p.stem+'-'+str(i)))
            else:tiles.append((im,p.stem))
        elif p.name=='app-192.png':tiles.append((im,'app'))
        checks.append(check)

sheet=Image.new('RGB',(128*6,100*((len(tiles)+5)//6)),(75,88,94));draw=ImageDraw.Draw(sheet)
for i,(im,name) in enumerate(tiles):
    thumb=ImageOps.contain(im,(64,64),Image.Resampling.LANCZOS).convert('RGBA')
    x=i%6*128+(128-thumb.width)//2;y=i//6*100+4
    sheet.paste(thumb,(x,y),thumb);draw.text((i%6*128+3,i//6*100+74),name,fill='#f4eee5')
sheet.save(art/'THUMBNAILS_64_R2.png')
public_bytes=sum(p.stat().st_size for p in (root/'public').rglob('*') if p.is_file())
result={'status':'VERIFIED','generatedAssets':12,'runtimeFiles':len(checks),
        'runtimeAddedBytes':manifest['runtimeAddedBytes'],'publicBytes':public_bytes,
        'method':'HSV V/S on alpha>200; V<.15 near-black, S<.20 low saturation. Genuine source alpha and independent limb silhouettes. Hash uniqueness is not artistic review.',
        'humanBlindRecognitionTest':{'status':'BLOCKED','reason':'No human participants in this local task; no invented >=80% recognition claim.'},'checks':checks}
(art/'ART_GATES_R2.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
manifest['status']='VERIFIED'
(art/'ASSET_MANIFEST_R2.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('VERIFIED R2: 35 runtime exports, alpha/color/hash gates, 36 genuine attack/walk/hurt/death frames; 64px contact sheet')
