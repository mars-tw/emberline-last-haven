export async function nightSignal(page){await page.clock.runFor(1800);return page.locator('#contact-signal').innerText();}
/** Existing regression journeys take the new mandatory relay decision via real UI. */
export async function assignRole(page,role,person){
 if(await page.locator('#relay-roster').count())await page.locator('#relay-roster').click();
 const b=page.locator(`#crew-${role}-${person}`);
 if(await b.getAttribute('aria-pressed')==='true')return;
 await b.click();await page.locator('#crew-apply').click();
 if(await page.locator('#crew-apply').getAttribute('data-risk')==='true')await page.locator('#crew-apply').click();
}
/** Production action now has a free preview followed by the same-lane confirmation. */
export async function commitBait(page,selector){await page.locator(selector).click();if(await page.locator('#bait-cancel').isVisible())await page.locator(selector).click();}
export async function continueJourney(page){
 if(await page.locator('#next').isDisabled()){
  if(!await page.locator('#dispatch').evaluate(d=>d.open))await page.locator('#dispatch-open').click();
  await page.locator(await page.locator('#relay-rescue').isEnabled()?'#relay-rescue':'#relay-repair').click();await page.locator('#relay-depart').click();
  await page.locator('#dispatch-close').click();
 }
 await page.locator('#next').click();
}
