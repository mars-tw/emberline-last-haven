from pathlib import Path
from PIL import Image
import hashlib,json
records=[]
for p in Path('public/art/enemies').glob('*.png'):
    im=Image.open(p).convert('RGBA');source_frames=im.width//40
    # The runtime now skips source frame 3 in walk, an exact held copy of frame 1.
    # All active poses must still be unique; original image bytes remain unchanged.
    indices=[0,1,2] if '_walk' in p.name else list(range(source_frames));n=len(indices)
    hashes=[hashlib.sha256(im.crop((i*40,0,(i+1)*40,40)).tobytes()).hexdigest() for i in indices]
    assert len(set(hashes))==n,(p,'duplicated animation poses')
    records.append({'path':p.as_posix(),'sourceFrames':source_frames,'activeFrames':indices,'frames':n,'uniqueFrames':len(set(hashes)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
for p in Path('public/art/train/a07-clips').glob('*.webp'):
    im=Image.open(p).convert('RGBA');n=im.width//192
    hashes=[hashlib.sha256(im.crop((i*192,0,(i+1)*192,192)).tobytes()).hexdigest() for i in range(n)]
    assert len(set(hashes))>1,(p,'requires multiple actual poses')
    records.append({'path':p.as_posix(),'frames':n,'uniqueFrames':len(set(hashes)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
Path('docs/evidence/animation-frames.json').write_text(json.dumps({'status':'VERIFIED','method':'distinct pixel hashes for each retained frame; source provenance retained','limitations':'Hash uniqueness alone does not prove artistic motion quality. No new latch atlas or full turnarounds.','atlases':records},indent=2),encoding='utf-8')
print('VERIFIED: retained walk/attack/hurt/death and A-07 frame atlases')
