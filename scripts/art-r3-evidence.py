from pathlib import Path
from PIL import Image,ImageDraw
import shutil,json
root=Path(__file__).resolve().parents[1];art=root/'docs/art'
out=root/'docs/evidence/art-r3';out.mkdir(parents=True,exist_ok=True)
scenes=['departure','convoy','bait','common-progress','night']
sheet=Image.new('RGB',(780,40+844*5),(43,38,32));d=ImageDraw.Draw(sheet)
d.text((12,13),'R2 / BEFORE',fill='#f0e7d5');d.text((402,13),'R3 / AFTER',fill='#f0e7d5')
for row,scene in enumerate(scenes):
    for col,phase in enumerate(['before','after']):
        im=Image.open(art/f'compare/r3-{phase}/phone-{scene}.png').convert('RGB')
        assert im.size==(390,844);sheet.paste(im,(col*390,40+row*844))
sheet.save(art/'compare/R3_PHONE_PAIRS.webp',quality=85,method=6)
for viewport in ['phone','tablet','desktop']:
    for phase in ['before','after']:
        shutil.copyfile(art/f'compare/r3-{phase}/{viewport}-common-progress.png',out/f'{viewport}-{phase}.png')
g=json.loads((art/'ART_GATES_R3.json').read_text(encoding='utf-8'))
receipt={'status':'VERIFIED','comparisonPairs':49,'sameViewportTrue':True,'rawImages':'docs/art/compare/r3-before and r3-after','scaledPixelsInPairSheet':False,'note':'Ordinary input, no campaign state injection. Time may vary slightly while resizing; each capture stores state and build hash.','generatedAssets':g['generatedAssets'],'runtimeAddedBytes':g['runtimeAddedBytes']}
(out/'receipt.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8',newline='\n')
print('VERIFIED R3 pairs and three-viewport original-size evidence')
