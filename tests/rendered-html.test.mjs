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
  assert.match(readableHtml, /4\/7/);
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
