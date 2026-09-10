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
