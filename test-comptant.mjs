import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:3000';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();

// ── helpers ────────────────────────────────────────────────────────────────
const ss = (name) => page.screenshot({ path: `/tmp/pw-${name}.png`, fullPage: false });

// ── 1. Auth ────────────────────────────────────────────────────────────────
console.log('1. Login...');
await page.goto(`${BASE}/login`);
await page.fill('input[type="email"]', 'akotoalvin@gmail.com');
await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'test');
await page.click('button[type="submit"]');
await page.waitForURL(/\/projets/, { timeout: 10000 });
await ss('01-dashboard');
console.log('   ✅ logged in');

// ── 2. Open an existing project wizard ────────────────────────────────────
console.log('2. Opening a project...');
// Find first project link
const firstProject = page.locator('a[href*="/projets/"]').first();
const href = await firstProject.getAttribute('href');
console.log('   → project href:', href);
await firstProject.click();
await page.waitForURL(/\/projets\//, { timeout: 8000 });
await ss('02-project-detail');

// Go to wizard edit
const editBtn = page.locator('a[href*="/wizard"]').first();
if (await editBtn.count() === 0) {
  // Try direct URL
  await page.goto(`${BASE}${href}/wizard`);
} else {
  await editBtn.click();
}
await page.waitForURL(/wizard/, { timeout: 8000 });
await ss('03-wizard-bloca');
console.log('   ✅ wizard open');

// ── 3. Navigate to BlocD (step 4) ─────────────────────────────────────────
console.log('3. Navigate to BlocD...');
// Click pill step 4 (Financement)
const step4 = page.locator('button').filter({ hasText: '4' });
if (await step4.count() > 0) {
  await step4.first().click();
} else {
  // Step through with "Suivant"
  for (let i = 0; i < 3; i++) {
    const suivant = page.locator('button').filter({ hasText: /suivant/i });
    if (await suivant.count() > 0) await suivant.click();
    await page.waitForTimeout(500);
  }
}
await page.waitForTimeout(800);
await ss('04-blocd-before');
console.log('   current URL:', page.url());

// Read current prix_achat to know what apport to set
const prixInput = page.locator('input').filter({ hasText: '' }).nth(0);

// ── 4. Read prix_achat & travaux from BlocC (recap) ───────────────────────
// We'll just set apport to a very large number to trigger comptant
// First check if the Taux card is visible
const tauxCard = page.locator('text=Taux d\'intérêt');
const tauxVisible = await tauxCard.isVisible().catch(() => false);
console.log('   Taux card initially visible:', tauxVisible);

// ── 5. Set apport to large value ──────────────────────────────────────────
console.log('4. Setting large apport to trigger comptant...');
const apportInput = page.locator('input#apport');
if (await apportInput.count() === 0) {
  console.log('   ⚠️  apport input not found by id, trying by label');
  // Try to find by label text
  const label = page.locator('label').filter({ hasText: /apport/i });
  if (await label.count() > 0) {
    const forAttr = await label.getAttribute('for');
    console.log('   label for:', forAttr);
  }
}
await apportInput.triple_click();
await apportInput.fill('999999');
await page.keyboard.press('Tab'); // trigger onChange
await page.waitForTimeout(600);
await ss('05-blocd-after-apport');

// ── 6. Check comptant banner ───────────────────────────────────────────────
console.log('5. Checking comptant banner...');
const banner = page.locator('text=Achat comptant détecté');
const bannerVisible = await banner.isVisible().catch(() => false);
console.log('   Banner "Achat comptant détecté" visible:', bannerVisible);

const tauxCardAfter = page.locator('text=Taux d\'intérêt');
const tauxAfter = await tauxCardAfter.isVisible().catch(() => false);
console.log('   Taux card hidden after comptant:', !tauxAfter);

// Check durée buttons are disabled
const dureeBtn = page.locator('button').filter({ hasText: '20 ans' });
const isDisabled = await dureeBtn.getAttribute('disabled').catch(() => null);
console.log('   Durée "20 ans" button disabled:', isDisabled !== null);

await ss('05-blocd-comptant');

// ── 7. Check RecapSticky badge ─────────────────────────────────────────────
console.log('6. Checking RecapSticky badge...');
const recapBadge = page.locator('text=Achat comptant').first();
const recapVisible = await recapBadge.isVisible().catch(() => false);
console.log('   RecapSticky "Achat comptant" badge visible:', recapVisible);

// ── 8. Save and go to project detail to test ScenarioPanel ────────────────
console.log('7. Saving wizard and going to ScenarioPanel...');
const saveBtn = page.locator('button').filter({ hasText: /enregistrer/i });
if (await saveBtn.count() > 0) {
  await saveBtn.click();
  await page.waitForTimeout(1500);
}
await ss('06-after-save');

// Navigate to project detail
await page.goto(`${BASE}${href}`);
await page.waitForURL(/\/projets\//, { timeout: 8000 });
await page.waitForTimeout(1000);
await ss('07-project-detail-comptant');

// ── 9. Run scenario calculation ────────────────────────────────────────────
console.log('8. Running scenario calc in ScenarioPanel...');
const loyerInput = page.locator('input#loyer');
if (await loyerInput.count() > 0) {
  await loyerInput.fill('800');
} else {
  // Try other loyer inputs
  const inputs = page.locator('input[type="number"]');
  const count = await inputs.count();
  console.log('   Number inputs found:', count);
  if (count > 0) await inputs.first().fill('800');
}

const calcBtn = page.locator('button').filter({ hasText: /calculer/i });
if (await calcBtn.count() > 0) {
  await calcBtn.click();
  await page.waitForTimeout(1500);
}
await ss('08-scenario-results');

// Check results
const comptantBadge = page.locator('text=Achat comptant — aucun crédit');
const badgeVisible = await comptantBadge.isVisible().catch(() => false);
console.log('   ScenarioPanel "Achat comptant — aucun crédit" visible:', badgeVisible);

// Capital emprunté metric should NOT be visible
const capitalMetric = page.locator('text=Capital emprunté');
const capitalVisible = await capitalMetric.isVisible().catch(() => false);
console.log('   "Capital emprunté" metric hidden:', !capitalVisible);

await ss('09-final-state');

// ── 10. Test edge: set apport back to normal → credit fields reappear ──────
console.log('9. Probe: reset apport to normal, go back to wizard...');
await page.goto(`${BASE}${href}/wizard`);
await page.waitForURL(/wizard/, { timeout: 8000 });
await page.waitForTimeout(500);
const step4Back = page.locator('button').filter({ hasText: '4' });
if (await step4Back.count() > 0) await step4Back.first().click();
await page.waitForTimeout(600);

const apportInputBack = page.locator('input#apport');
await apportInputBack.triple_click();
await apportInputBack.fill('30000');
await page.keyboard.press('Tab');
await page.waitForTimeout(600);
await ss('10-credit-restored');

const tauxRestored = await page.locator('text=Taux d\'intérêt').isVisible().catch(() => false);
console.log('   Taux card restored after reducing apport:', tauxRestored);

// ── Done ────────────────────────────────────────────────────────────────────
await browser.close();
console.log('\nAll screenshots written to /tmp/pw-*.png');
