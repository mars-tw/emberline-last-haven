"""Deterministic R2 exports: generated native alpha, padded atlas cells and hashes."""
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
from collections import deque
import numpy as np
import hashlib, json, shutil

root = Path(__file__).resolve().parents[1]
art = root / 'docs/art'
out = root / 'public/art/r2'
masters = art / 'masters/r2'
for p in [out, *[masters / s for s in ['original', 'opaque', 'masks', 'rgba']]]:
    p.mkdir(parents=True, exist_ok=True)
prompts = json.loads((art / 'PROMPTS_R2.json').read_text(encoding='utf-8'))
records = []

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def clean(im):
    a = np.array(im.convert('RGBA'))
    a[a[:, :, 3] <= 8] = 0
    return Image.fromarray(a)

def isolate_pose(im):
    """Remove disconnected neighboring-cell fragments; retain near-body details."""
    a=np.array(im.convert('RGBA'));mask=a[:,:,3]>8;seen=np.zeros(mask.shape,bool);parts=[]
    height,width=mask.shape
    for y,x in zip(*np.where(mask)):
        if seen[y,x]:continue
        q=deque([(y,x)]);seen[y,x]=True;part=[]
        while q:
            yy,xx=q.popleft();part.append((yy,xx))
            for dy,dx in [(0,1),(0,-1),(1,0),(-1,0)]:
                ny,nx=yy+dy,xx+dx
                if 0<=ny<height and 0<=nx<width and mask[ny,nx] and not seen[ny,nx]:
                    seen[ny,nx]=True;q.append((ny,nx))
        parts.append(part)
    if not parts:return im
    body=max(parts,key=len);keep=np.zeros(mask.shape,dtype='uint8')
    for y,x in body:keep[y,x]=255
    vicinity=np.array(Image.fromarray(keep).filter(ImageFilter.MaxFilter(17)))>0
    for part in parts:
        if any(vicinity[y,x] for y,x in part):
            for y,x in part:keep[y,x]=255
    support=np.array(Image.fromarray(keep).filter(ImageFilter.MaxFilter(3)))>0
    a[~support]=0
    return Image.fromarray(a)

def cell(im, col, row, columns, rows):
    return im.crop((round(col * im.width / columns), round(row * im.height / rows),
                    round((col + 1) * im.width / columns), round((row + 1) * im.height / rows)))

def fit(im, size):
    im = clean(im)
    bounds = im.getchannel('A').getbbox()
    assert bounds
    crop = ImageOps.contain(im.crop(bounds), (size[0] - 8, size[1] - 8), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', size)
    canvas.alpha_composite(crop, ((size[0] - crop.width) // 2, size[1] - crop.height - 4))
    return clean(canvas)

def export(im, name, entry, fmt='PNG'):
    path = out / name
    if fmt == 'PNG':
        im = clean(im)
    im.save(path, format=fmt, **({'quality':82, 'method':6} if fmt == 'WEBP' else {'optimize':True}))
    entry['runtime'].append({'path':path.relative_to(root).as_posix(), 'sha256':sha(path),
                             'bytes':path.stat().st_size, 'size':list(im.size), 'format':fmt})

for r in prompts['assets']:
    ident = r['id']
    original = masters / 'original' / (ident + '.png')
    shutil.copyfile(r['source'], original)
    im = Image.open(original)
    entry = {'id':ident, 'round':2, 'tool':'image_gen__imagegen', 'modelSlug':None,
             'original':{'path':original.relative_to(root).as_posix(), 'sha256':sha(original)},
             'sourceSize':list(im.size), 'runtime':[],
             'license':'Project-owned generated art; MIT distribution',
             'attribution':'Emberline: Last Haven contributors / OpenAI image_gen'}
    if im.mode == 'RGBA':
        im = clean(im)
        for stage, image in [('rgba',im), ('masks',im.getchannel('A')),
                             ('opaque',Image.alpha_composite(Image.new('RGBA',im.size,(43,38,32,255)),im).convert('RGB'))]:
            path = masters / stage / (ident + '.png')
            image.save(path, optimize=True)
            entry[stage] = {'path':path.relative_to(root).as_posix(), 'sha256':sha(path)}
        entry['postprocess'] = 'Native generated alpha retained; invisible RGB zeroed. Padded runtime cells; opaque viewing master, alpha mask and RGBA master retained. No artificial silhouette or frame generation.'
    if ident in ['departure','train']:
        export(im.resize((1536,1024),Image.Resampling.LANCZOS), ident+'.webp', entry, 'WEBP')
    elif ident == 'road':
        # Three contiguous authored segments, not three copies of one tile.
        im = im.resize((720,2160),Image.Resampling.LANCZOS)
        pixels = np.array(im).astype(float)
        overlap = 144
        loop = pixels[overlap:].copy()
        weight = np.linspace(0,1,overlap)[:,None,None]
        loop[-overlap:] = loop[-overlap:]*(1-weight)+pixels[:overlap]*weight
        im = Image.fromarray(loop.astype('uint8')).resize((720,2160),Image.Resampling.LANCZOS)
        entry['postprocess']='144px end-to-start overlap blend, then three contiguous distinct segments; top/bottom transition follows adjacent source rows, no mirrored vehicle copies.'
        for row in range(3):
            export(cell(im,0,row,1,3), f'road-{row}.webp', entry, 'WEBP')
    elif ident == 'outpost':
        export(im.resize((768,1152),Image.Resampling.LANCZOS),'outpost.webp',entry,'WEBP')
    elif ident == 'panel':
        export(im.resize((640,640),Image.Resampling.LANCZOS),'panel.webp',entry,'WEBP')
    elif ident == 'xi':
        for col,name in enumerate(['front','side','back','portrait']):
            export(fit(isolate_pose(cell(im,col,0,4,2)),(192,256) if col==3 else (160,288)),f'xi-{name}.png',entry)
        atlas = Image.new('RGBA',(192*4,256))
        for col in range(4):
            atlas.alpha_composite(fit(isolate_pose(cell(im,col,1,4,2)),(192,256)),(col*192,0))
        export(atlas,'xi-attack.png',entry)
        entry['frameMap'] = {'columns':4,'rows':1,'frameSize':[192,256], 'phases':['rest','anticipation','impact','recovery'], 'timing':'Existing projectile timer p.shot; visual does not apply damage.'}
    elif ident in ['runner','shambler']:
        # Keep hue and geometry; lift exposure and chroma for gray-road readability.
        alpha = im.getchannel('A')
        hsv = np.array(im.convert('RGB').convert('HSV')).astype(float)
        hsv[:,:,1] = np.minimum(255, hsv[:,:,1] * 1.5)
        hsv[:,:,2] = np.power(hsv[:,:,2] / 255, .66) * 255
        im = Image.fromarray(hsv.astype('uint8'), 'HSV').convert('RGBA')
        im.putalpha(alpha)
        im = clean(im)
        calibrated = masters / 'rgba' / (ident+'-calibrated.png')
        im.save(calibrated,optimize=True)
        entry['calibrated']={'path':calibrated.relative_to(root).as_posix(),'sha256':sha(calibrated)}
        entry['colorCalibration']={'hue':'unchanged','saturationMultiplier':1.5,'valueGamma':0.66,'purpose':'Legible colored midtones; original masters retained.'}
        # Keep each source cell's scale and anchor. Do not independently enlarge poses.
        for row,action in enumerate(['walk','attack','hurt','death']):
            atlas = Image.new('RGBA',(192*4,192))
            for col in range(4):
                crop = ImageOps.contain(isolate_pose(cell(im,col,row,4,4)),(184,184),Image.Resampling.LANCZOS)
                atlas.alpha_composite(crop,(col*192+(192-crop.width)//2,192-crop.height-4))
            export(atlas,f'{ident}-{action}.png',entry)
        entry['frameMap'] = {'columns':4,'frameSize':[192,192],'actions':['walk','attack','hurt','death'], 'impactFrame':2,'impactSeconds':{'latched':0.2,'defense':0.32},'hurtSeconds':0.24,'deathSeconds':0.65,'walk':'Four genuine limb poses, per-entity phase offset; reduced motion uses same frames at lower rate.'}
    elif ident == 'props':
        for row,names in enumerate([['wreck','sign','luggage','concrete'],['bait-west','bait-center','bait-east','barricade']]):
            for col,name in enumerate(names):
                export(fit(cell(im,col,row,4,2),(192,224)),name+'.png',entry)
    elif ident == 'icons':
        # The generated sheet is 3:1; all four items occupy equal width quarters.
        for col,name in enumerate(['supply','people','hull','armor']):
            export(fit(cell(im,col,0,4,1),(80,80)),name+'.png',entry)
    elif ident == 'logo':
        export(fit(im,(640,280)),'logo.png',entry)
    elif ident == 'app':
        for size in [192,512]:
            export(im.resize((size,size),Image.Resampling.LANCZOS),f'app-{size}.png',entry)
        proposal = art / 'proposals/app-store-r2-1024.png'
        im.resize((1024,1024),Image.Resampling.LANCZOS).save(proposal,optimize=True)
        entry['proposal']={'path':proposal.relative_to(root).as_posix(),'sha256':sha(proposal)}
    records.append(entry)

live = [r for a in records for r in a['runtime']]
manifest = {'status':'EXECUTED','round':2,'tool':prompts['tool'],'actualModelSlug':None,
            'requestedModelSlug':'gpt-image-2','modelNote':prompts['modelNote'],
            'generatedAssets':len(records),'runtimeFiles':len(live),'baselinePublicBytes':8025025,
            'runtimeAddedBytes':sum(r['bytes'] for r in live),'assets':records}
(art / 'ASSET_MANIFEST_R2.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
old=json.loads((art/'PROMPTS.json').read_text(encoding='utf-8'))
old['round2']={'file':'PROMPTS_R2.json','stylePrefix':prompts['stylePrefix'],'assets':prompts['assets'],'modelNote':prompts['modelNote']}
(art/'PROMPTS.json').write_text(json.dumps(old,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'status':'EXECUTED','generated':len(records),'runtime':len(live),'bytes':manifest['runtimeAddedBytes']}))
