import assert from 'node:assert/strict';
/** R9 replaces battlefield-wide foot-label bounds with stricter body attachment. */
export function assertLocalNumbers(t){
 for(const [i,l] of t.labels.entries()){
  const a=t.actors.find(a=>a.id==='enemy-'+l.id),k=t.cssScale;assert.ok(a,'each ID names a live actor');
  assert.ok(l.x>=10&&l.x+l.w<=350&&l.y>=10&&l.y+l.h<=482,'whole number remains in battlefield');
  assert.equal(l.x+l.w/2,a.x/k,'number is directly over its actor');
  assert.ok(Math.abs(l.y+l.h/2-(a.y-a.visibleHeight)/k)<=13,'number is within 13 units of own head');
  for(const q of t.labels.slice(i+1))assert.ok(l.x+l.w<=q.x||q.x+q.w<=l.x||l.y+l.h<=q.y||q.y+q.h<=l.y,'numbers do not overlap');
  for(const body of t.actors){const x=body.x/k,y=body.y/k,w=body.visibleWidth/k,h=body.visibleHeight/k;assert.ok(l.x+l.w<x-w/2||l.x>x+w/2||l.y+l.h<y-h||l.y>y,'number does not obscure any actor');}
 }
}
