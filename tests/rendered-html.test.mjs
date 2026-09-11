import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
const readableHtml = html.replaceAll("<!-- -->", "");
const responsesHtml = await readFile(new URL("../out/responses/index.html", import.meta.url), "utf8");
const readableResponsesHtml = responsesHtml.replaceAll("<!-- -->", "");

test("the public page contains the analysis and transparent denominator", () => {
  assert.match(readableHtml, /EDDA Survey/);
  assert.match(readableHtml, /Time, workload and stress/);
  assert.match(readableHtml, /8\/11/);
  assert.match(readableHtml, /Data Feminism/);
  assert.match(readableHtml, /Themes overlap/);
  assert.match(readableHtml, /href="\/edda-survey\/responses\/"/);
});

test("raw response text and timestamps are not published", () => {
  assert.doesNotMatch(readableHtml, /My colleagues keep saying they have no time/);
  assert.doesNotMatch(readableHtml, /The whole programme is not very/);
  assert.doesNotMatch(readableHtml, /The fact that there is no time allocated in our service planning/);
});

test("the response reader contains all respondents and all original answers", () => {
  assert.match(readableResponsesHtml, /All responses — EDDA Survey/);
  assert.match(readableResponsesHtml, /Respondent[\s\S]*01/);
  assert.match(readableResponsesHtml, /Respondent[\s\S]*07/);
  assert.match(readableResponsesHtml, /The fact that there is no time allocated in our service planning/);
  assert.match(readableResponsesHtml, /Know thy neighbour/);
  assert.match(readableResponsesHtml, /name="robots" content="noindex, nofollow"/);
});

for (const [route, title] of [['areas', 'Who can act'], ['dator', 'What futures'], ['comparison', 'Future orientation'], ['profiles', 'Recurring combined'], ['validation', 'Read, question']]) {
  test(`${route} is rendered with analysis, review and export controls`, async () => {
    const page = await readFile(new URL(`../out/${route}/index.html`, import.meta.url), 'utf8');
    assert.ok(page.includes(title));
    assert.ok(page.includes('Save review file'));
    assert.ok(page.includes('Open review file'));
    assert.ok(page.includes('Framework limitations and analytical tensions'));
    assert.ok(page.includes('Combined dataset CSV'));
  });
}
test('new respondents and accessible 4 by 5 matrix are exported', async () => {
  assert.match(readableResponsesHtml, /respondent-11/);
  assert.match(readableResponsesHtml, /EDDA camp/);
  const matrix = await readFile(new URL('../out/comparison/index.html', import.meta.url), 'utf8');
  assert.equal((matrix.match(/aria-pressed="false"/g) || []).length, 20);
});

test('sorting board renders all source cards with four initially empty drop areas',async()=>{
 const page=(await readFile(new URL('../out/sorting/index.html',import.meta.url),'utf8')).replaceAll('<!-- -->','');
 assert.equal((page.match(/draggable="true"/g)||[]).length,33);
 assert.equal((page.match(/data-archetype=/g)||[]).length,4);
 assert.equal((page.match(/Drop answers here/g)||[]).length,4);
 assert.ok(page.includes('0/33 answers placed'));
 assert.ok(page.includes('Respondent R11'));
 assert.ok(page.includes('Save arrangement'));
 assert.ok(page.includes('Open arrangement'));
 assert.ok(page.includes('/edda-survey/sorting/'));
});

test('AREAS sorting board has five empty positions and all original source cards',async()=>{
 const page=(await readFile(new URL('../out/areas-sorting/index.html',import.meta.url),'utf8')).replaceAll('<!-- -->','');
 assert.equal((page.match(/draggable="true"/g)||[]).length,33);
 assert.equal((page.match(/data-archetype=/g)||[]).length,5);
 assert.equal((page.match(/Drop answers here/g)||[]).length,5);
 for(const position of ['Architecting','Resisting','Exploiting','Avoiding','Shaped'])assert.ok(page.includes(`data-archetype="${position}"`));
 assert.ok(page.includes('0/33 answers placed'));assert.ok(page.includes('AREAS sorting board'));assert.ok(page.includes('/edda-survey/areas-sorting/'));
});
