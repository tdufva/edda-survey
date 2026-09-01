import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
const readableHtml = html.replaceAll("<!-- -->", "");

test("the public page contains the analysis and transparent denominator", () => {
  assert.match(readableHtml, /EDDA Survey/);
  assert.match(readableHtml, /Time, workload and stress/);
  assert.match(readableHtml, /4\/7/);
  assert.match(readableHtml, /Data Feminism/);
  assert.match(readableHtml, /Themes overlap/);
});

test("raw response text and timestamps are not published", () => {
  assert.doesNotMatch(readableHtml, /My colleagues keep saying they have no time/);
  assert.doesNotMatch(readableHtml, /The whole programme is not very/);
  assert.doesNotMatch(readableHtml, /The fact that there is no time allocated in our service planning/);
});
