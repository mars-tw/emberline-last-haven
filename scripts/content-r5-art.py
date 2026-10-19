"""Deterministic atlas slicing/resizing; no drawing or replacement art."""
from pathlib import Path
from PIL import Image
import hashlib,json,shutil
root=Path(__file__).resolve().parents[1]
source=Path(r'C:\Users\digimkt\.codex\generated_images\01a150dd-a695-75e3-8a60-343574eed59e\exec-e89bfbd0-0f8e-44b1-a203-971906341477.png')
master=root/'docs/art/masters/content-r5/cases.png';master.parent.mkdir(parents=True,exist_ok=True)
shutil.copy2(source,master)
im=Image.open(master).convert('RGBA');out=root/'public/art/content-r5';out.mkdir(parents=True,exist_ok=True)
items=[]
for i,name in enumerate(['rescue','repair']):
    cut=im.crop((i*im.width//2,0,(i+1)*im.width//2,im.height));cut.thumbnail((320,320),Image.Resampling.LANCZOS)
    dest=out/(name+'.webp');cut.save(dest,lossless=True)
    items.append(dict(id=name,path=dest.relative_to(root).as_posix(),dimensions=cut.size,sha256=hashlib.sha256(dest.read_bytes()).hexdigest()))
manifest=dict(status='VERIFIED',round='content-r5',tool='image_gen__imagegen',modelSlug=None,modelEvidence='Built-in tool does not expose a model slug; no invented gpt-image-2 assertion.',generatedImages=1,runtimeIllustrations=2,source=dict(path=master.relative_to(root).as_posix(),sha256=hashlib.sha256(master.read_bytes()).hexdigest(),dimensions=im.size),processing='Pillow: exact left/right half crop and lossless WebP resize only; original alpha preserved',assets=items)
(root/'docs/art/ASSET_MANIFEST_CONTENT_R5.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(manifest,ensure_ascii=True))
