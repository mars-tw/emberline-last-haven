from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import numpy as np
import hashlib,json

root=Path(__file__).resolve().parents[1];art=root/'docs/art'
manifest=json.loads((art/'ASSET_MANIFEST.json').read_text(encoding='utf-8'))
checks=[];tiles=[]
for asset in manifest['assets']:
    assert asset['tool']=='image_gen__imagegen' and asset['modelSlug'] is None
    for r in asset['runtime']:
        p=root/r['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256']
        im=Image.open(p);assert list(im.size)==r['size'];assert im.format==r['format']
        if im.mode!='RGBA':continue
        a=np.array(im);alpha=a[:,:,3];rgb=a[:,:,:3].astype(float)/255;v=rgb.max(2);sat=(v-rgb.min(2))/np.maximum(v,.00001);visible=alpha>200
        assert max(alpha[0,0],alpha[0,-1],alpha[-1,0],alpha[-1,-1])==0
        assert not np.any(a[:,:,:3][alpha==0]);assert 0.003<float((alpha>8).mean())<.95
        record={'path':r['path'],'alphaOccupancy':float((alpha>8).mean()),'fourCornersTransparent':True,'transparentRGBZero':True}
        if asset['id'] in ['xi','an']:
            metrics={'brightnessHSVValue':float(v[visible].mean()),'nearBlackFraction':float((v[visible]<.15).mean()),'saturationHSV':float(sat[visible].mean()),'lowSaturationFraction':float((sat[visible]<.2).mean())}
            record.update(metrics);assert .30<=metrics['brightnessHSVValue']<=.75;assert metrics['nearBlackFraction']<.35;assert metrics['saturationHSV']>=.32;assert metrics['lowSaturationFraction']<.20
        checks.append(record)
        if asset['id']=='an':
            frames=[im.crop((i*192,0,(i+1)*192,256)) for i in range(4)]
            masks=[np.array(f.getchannel('A'))>8 for f in frames]
            diffs=[float(np.mean(masks[i]!=masks[i+1])) for i in range(3)]
            assert min(diffs)>.01;record['adjacentPoseAlphaDifference']=diffs
            assert len({hashlib.sha256(f.tobytes()).hexdigest() for f in frames})==4
            for i,f in enumerate(frames):tiles.append((f,f'an-{i}'))
        elif p.name!='logo.png':tiles.append((im,p.stem))
tiles.append((Image.open(root/'public/art/r1/app-192.png'),'app-icon'))
sheet=Image.new('RGB',(128*6,100*((len(tiles)+5)//6)),(78,69,67));d=ImageDraw.Draw(sheet)
for i,(im,name) in enumerate(tiles):
    # Actual native 64px image, not a magnified image mislabeled as a thumbnail.
    thumb=ImageOps.contain(im,(64,64),Image.Resampling.LANCZOS).convert('RGBA');x=i%6*128+(128-thumb.width)//2;y=i//6*100+4;sheet.paste(thumb,(x,y),thumb);d.text((i%6*128+7,i//6*100+74),name,fill='#fff0dd')
sheet.save(art/'THUMBNAILS_64.png')
result={'status':'VERIFIED','method':'HSV value brightness on alpha >200 visible pixels; near-black V<0.15; low saturation S<0.20; alpha/magic/dimension/hash gates. Visual inspection of silhouettes and pose differences remains required.','generatedAssets':manifest['generatedAssets'],'runtimeAddedBytes':manifest['runtimeAddedBytes'],'baselinePublicBytes':manifest['baselinePublicBytes'],'runtimeGrowthPercent':round(manifest['runtimeAddedBytes']/manifest['baselinePublicBytes']*100,2),'checks':checks}
(art/'ART_GATES.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
manifest['status']='VERIFIED'
(art/'ASSET_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(f"VERIFIED {len(checks)} RGBA runtime assets, color gates and four distinct A-07 poses")
