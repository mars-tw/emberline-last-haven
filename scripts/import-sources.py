"""One-time read-only import. Run from the main repository only."""
from pathlib import Path
import hashlib,json,subprocess,shutil,re
root=Path(__file__).resolve().parents[1]
assert root.name=='apocalypse-anthology'
base=root.parent
repos={'ashes':base/'doomsday-shooter','storm':base/'storm-apocalypse','train':base/'廣告遊戲專案'}
records=[]
def copy(key,rel,target):
    source=repos[key]/rel; dest=root/target
    dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(source,dest)
    records.append({'repo':key,'source':rel,'target':target,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'bytes':source.stat().st_size})
for key in repos: copy(key,'LICENSE',f'vendor/{key}/LICENSE')
for f in ['config.js','rules.js','version.js']: copy('ashes','src/'+f,'vendor/ashes/src/'+f)
for f in ['test-r86-convoy-latch.js','test-rules.js','test-economy.js']: copy('ashes','scripts/'+f,'vendor/ashes/scripts/'+f)
(root/'vendor/ashes/package.json').write_text('{"type":"commonjs"}',encoding='utf-8')
for p in (repos['train']/'src/game').rglob('*.ts'):
    rel=p.relative_to(repos['train']).as_posix();copy('train',rel,'vendor/train/'+rel)
copy('train','src/ui/onboarding.ts','vendor/train/src/ui/onboarding.ts')
copy('train','spec/reboot-v2/mission-catalog.json','vendor/train/spec/reboot-v2/mission-catalog.json')
for f in ['r10-handover.test.ts','r9-night-watch.test.ts','save.test.ts']:
    copy('train','tests/'+f,'vendor/train/tests/'+f)
copy('storm','src/game/baitLayout.ts','src/origins/baitLayout.ts')
for f in ['baitLayout.ts','combatRules.ts','state.ts','waveDirector.ts','quality.ts','weather.ts','weatherProfiles.json']:
    copy('storm','src/game/'+f,'vendor/storm/src/game/'+f)
copy('storm','scripts/test-r25-rules.mjs','vendor/storm/scripts/test-r25-rules.mjs')
copy('ashes','CREDITS.md','vendor/ashes/CREDITS.md')
copy('train','README.md','vendor/train/SOURCE_README.md')
copy('ashes','assets/ui/start-art-manifest.json','vendor/ashes/start-art-manifest.json')
copy('train','public/assets/art/v23/a07-clips/manifest.json','vendor/train/a07-clips-manifest.json')
assets=['env/land.png','env/kenney_road_debris.png','vehicles/land.png','vehicles/trailer.png','vehicles/xi_gunner_attack.png','story/xi.png','ui/start-atmosphere-r79-low.png']
copy('ashes','assets/shelter/snow.png','vendor/ashes/assets/shelter/snow.png')
assets += [f'enemies/oga_{e}_{a}.png' for e in ['shambler','runner'] for a in ['walk','attack','hurt','death']]
for f in assets: copy('ashes','assets/'+f,'public/art/'+f)
for f in ['carriages/sleep.webp','a07-clips/listen.webp','a07-clips/startle.webp']:
    copy('train','public/assets/art/v23/'+f,'public/art/train/'+f)
# Retain exact source rules as an ESM subset; JS typing stays source-compatible.
raw=(repos['ashes']/'src/rules.js').read_text(encoding='utf-8')
subset=raw[raw.index('function latchConfig('):raw.index('function sanitizeRouteCompletions(')]
helper=raw[raw.index('function clamp('):raw.index('function hasFinitePoint(')]
out='// MIT: mars-tw, ashes-convoy R86. Exact subset; see source-manifest.json.\n'+helper+subset
out+='\nexport {isLatchableEnemy,pickLatchSlot,resolveLatchBiteDamage,updateShakeTracker,resolveMultiFlingParts,driftReady};\n'
(root/'src/origins/convoy.js').write_text(out,encoding='utf-8')
config=(repos['ashes']/'src/config.js').read_text(encoding='utf-8')
start=config.index('const CONVOY_LATCH =');end=config.index('\n};',start)+3
(root/'src/origins/latch-config.js').write_text(config[start:end]+'\nexport default {CONVOY_LATCH};\n',encoding='utf-8')
manifest={'status':'VERIFIED','sources':{k:{'folder':p.name,'head':subprocess.check_output(['git','-C',str(p),'rev-parse','HEAD'],text=True).strip(),'statusBefore':subprocess.check_output(['git','-C',str(p),'status','--porcelain'],text=True)} for k,p in repos.items()},'files':records}
(root/'docs/evidence').mkdir(parents=True,exist_ok=True)
(root/'docs/evidence/source-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'Imported {len(records)} files without changing source repositories')
