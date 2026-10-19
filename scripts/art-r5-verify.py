"""R5 native asset and real runtime gates; no subjective scores fabricated."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import numpy as np
import json,hashlib
root=Path(__file__).resolve().parents[1];art=root/'docs/art';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((art/'ASSET_MANIFEST_R5.json').read_text(encoding='utf-8'));assert m['generatedAssets']==9
checks=[];tiles=[]
for asset in m['assets']:
 for key in ['original','rgba','masks','opaque','proposal']:
  if key in asset:assert sha(root/asset[key]['path'])==asset[key]['sha256']
 for r in asset.get('sources',[])+asset.get('references',[]):assert sha(root/r['path'])==r['sha256']
 for r in asset['runtime']:
  p=root/r['path'];im=Image.open(p);assert sha(p)==r['sha256'];assert list(im.size)==r['size'];assert im.format==r['format'];row={'path':r['path']}
  if im.mode=='RGBA' and 'app-' not in p.name:
   a=np.array(im);alpha=a[:,:,3];visible=alpha>200
   assert all(alpha[y,x]==0 for y,x in [(0,0),(0,-1),(-1,0),(-1,-1)])
   assert not np.any(a[:,:,:3][alpha==0]);assert .003<float((alpha>8).mean())<.95
   row['alphaOccupancy']=float((alpha>8).mean())
   if any(n in p.name for n in ['xi-','runner-','shambler-','climber-']):
    hsv=np.array(im.convert('HSV'))/255.;v=hsv[:,:,2];s=hsv[:,:,1]
    metrics={'brightness':float(v[visible].mean()),'nearBlack':float((v[visible]<.15).mean()),'saturation':float(s[visible].mean()),'lowSaturation':float((s[visible]<.20).mean())}
    assert .30<=metrics['brightness']<=.75,(p,metrics)
    assert metrics['nearBlack']<.35 and metrics['saturation']>=.32 and metrics['lowSaturation']<.20,(p,metrics)
    row.update(metrics)
   animated=im.width>im.height*2 and any(n in p.name for n in ['-walk','-attack','-hurt','-death','-gunner','-night'])
   if animated:
    fw=im.width//4;frames=[im.crop((i*fw,0,(i+1)*fw,im.height)) for i in range(4)]
    assert len({f.tobytes() for f in frames})==4;masks=[np.array(f.getchannel('A'))>80 for f in frames]
    diffs=[float((masks[i]!=masks[i+1]).mean()) for i in range(3)];assert min(diffs)>.005,(p,diffs)
    row['adjacentAlphaDifference']=diffs
    tiles.extend((f,p.stem+'-'+str(i)) for i,f in enumerate(frames))
   else:tiles.append((im,p.stem))
  checks.append(row)
ground=np.array(Image.open(root/'public/art/r4/outpost-ready.webp').convert('HSV'))/255.
groundV=float(ground[int(ground.shape[0]*.26):int(ground.shape[0]*.65),int(ground.shape[1]*.2):int(ground.shape[1]*.8),2].mean())
enemyContrast=[{'path':r['path'],'spriteV':r['brightness'],'groundRegionV':groundV,'difference':r['brightness']-groundV} for r in checks if '/runner-' in r['path'] or '/shambler-' in r['path']]
assert min(r['difference'] for r in enemyContrast)>=.10
sheet=Image.new('RGB',(6*128,((len(tiles)+5)//6)*96),'#4b5458');draw=ImageDraw.Draw(sheet)
for i,(im,label) in enumerate(tiles):
 t=ImageOps.contain(im,(64,64),Image.Resampling.LANCZOS);sheet.paste(t,(i%6*128+(128-t.width)//2,i//6*96+2),t);draw.text((i%6*128+2,i//6*96+72),label,fill='#f0e7d5')
sheet.save(art/'THUMBNAILS_64_R5.png')
c=json.loads((art/'compare/r5-after/captures.json').read_text(encoding='utf-8'));assert c['indexSha256']==sha(root/'dist/index.html');assert len(c['records'])==56
stationCanvases={}
for r in c['records']:
 assert sha(root/r['path'])==r['sha256'];t=r['visual']['telemetry'];scene=Path(r['path']).stem.split('-',1)[1]
 if scene in ['bait','defense-active','defense-crowd','common-progress']:
  assert t['sceneArt']==('r5/outpost-wide.webp' if r['visual']['canvas']['width']/r['visual']['canvas']['height']>1.7 else 'r4/outpost-ready.webp')
  key=(r['viewport']['width'],r['viewport']['height']);box=r['visual']['canvas']
  if key in stationCanvases:assert box==stationCanvases[key],(r['path'],box,stationCanvases[key])
  else:stationCanvases[key]=box
 if scene=='night':
  assert t['sceneArt'] in ['r5/train.webp','r5/train-wide.webp'] and any(a['path']=='r5/xi-night.png' for a in t['actors'])
  if r['viewport']['width']>700 and r['viewport']['height']<=500:
   assert r['visual']['contact']['height']<=24
   assert r['visual']['contact']['y']+r['visual']['contact']['height']<=r['visual']['canvas']['y']+r['visual']['canvas']['height']
 if scene!='journal':
  for text in r['visual']['ticket']['text']:assert text['scroll']<=text['client']+1
stores=json.loads((root/'docs/evidence/art-r5/store-captures.json').read_text(encoding='utf-8'));assert stores['indexSha256']==c['indexSha256'];assert len(stores['screenshots'])==10
for r in stores['screenshots']:
 p=root/r['path'];assert sha(p)==r['sha256'];assert list(Image.open(p).size)==r['dimensions'];assert r['dimensions']==([1290,2796] if '/phone-' in r['path'] else [2064,2752])
 if r['state'] is None:assert '01-departure' in r['path']
 assert r['route']['distance']=='%s / 9'%((r['state']['segment'] if r['state'] is not None else 0)+1)
 assert r['route']['distanceClear'] and r['route']['labelsAboveBeam']
phone=[r for r in stores['screenshots'] if '/phone-' in r['path']];thumb=Image.new('RGB',(129*5,280),'#2b2620')
for i,r in enumerate(phone):thumb.paste(Image.open(root/r['path']).resize((129,280),Image.Resampling.LANCZOS),(i*129,0))
thumb.save(art/'STORE_THUMBNAILS_R5.png')
blind=Image.new('RGB',(88*5,96),'#4b5458');d=ImageDraw.Draw(blind)
for i,name in enumerate(['xi-side.png','xi-gunner.png','xi-front.png','xi-attack.png','xi-night.png']):
 im=Image.open(root/'public/art/r5'/name)
 if im.width>im.height*2:im=im.crop((0,0,im.width//4,im.height))
 t=ImageOps.contain(im,(64,64),Image.Resampling.LANCZOS);blind.paste(t,(i*88+(88-t.width)//2,2),t);d.text((i*88+39,76),str(i+1),fill='#f0e7d5')
blind.save(art/'BLIND_64_R5.png')
flip=[Image.open(art/f'compare/r5-after/phone-{n}.png').convert('RGB') for n in ['bait','common-progress']]
flip[0].save(art/'compare/R5_STATION_FLICKER.webp',save_all=True,append_images=flip[1:],duration=700,loop=0,quality=85,method=6)
m['status']='VERIFIED';(art/'ASSET_MANIFEST_R5.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
result={'status':'VERIFIED','round':5,'generatedAssets':9,'runtimeFiles':len(checks),'runtimeAddedBytes':m['runtimeAddedBytes'],'publicBytes':sum(p.stat().st_size for p in (root/'public').rglob('*') if p.is_file()),'assetChecks':checks,'enemyContrast':enemyContrast,'screenshots':56,'storeScreenshots':10,'sameStationMother':{'portrait':'r4/outpost-ready.webp','landscape':'r5/outpost-wide.webp'},'stateInjection':False,'humanBlindRecognition':{'status':'BLOCKED','participants':0,'recognitionRate':None},'independentScore':{'status':'BLOCKED','historicalMuseR4':8.0,'newScore':None,'target':9.0},'physicalDevicesAndNativeBuilds':'BLOCKED'}
(art/'ART_GATES_R5.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
print('VERIFIED R5:',len(checks),'assets, 56 captures, 10 store images, native alpha and dual colour gates')
