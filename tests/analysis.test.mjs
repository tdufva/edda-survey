import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const coding=JSON.parse(await readFile(new URL('../analysis/coding.json',import.meta.url),'utf8'));
const survey=JSON.parse(await readFile(new URL('../analysis/survey.json',import.meta.url),'utf8'));
let source=await readFile(new URL('../lib/analysis.ts',import.meta.url),'utf8');
source=source.replace("import baseline from '../analysis/coding.json';",`const baseline = ${JSON.stringify(coding)};`).replace("import survey from '../analysis/survey.json';",`const survey = ${JSON.stringify(survey)};`);
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {aggregate,matrix,combined,profiles,parseReview,csv,initialCoding}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
test('fresh survey is represented exactly once per answer, with verbatim evidence and meaning units',()=>{
 assert.equal(survey.respondents.length,11);assert.equal(coding.length,33);assert.equal(new Set(coding.map(r=>r.id)).size,33);
 for(const r of coding){const person=survey.respondents.find(p=>'R'+p.id===r.respondent_id);assert.equal(r.original_response,person.answers[Number(r.question_id.slice(1))-1]);assert.ok(r.original_response.includes(r.dator_quote));assert.ok(r.original_response.includes(r.areas_quote));assert.ok(r.meaning_units.length);for(const u of r.meaning_units)assert.ok(r.original_response.includes(u.text));}
});
test('no futures are forced into present barriers; primary counts reconcile',()=>{
 const a=aggregate(coding);assert.equal(a.denominator,33);assert.equal(a.unclear,11);assert.equal(a.distribution.reduce((n,d)=>n+d.primary,0)+a.unclear,33);
 assert.equal(a.distribution.find(d=>d.archetype==='Collapse').associated,0);assert.equal(a.distribution.find(d=>d.archetype==='Transformation').associated,0);
 for(const r of coding.filter(r=>r.question_id==='Q01'))assert.equal(r.dator_primary,'Unclear / Not classifiable');
});
test('multi-coded answers count once per cell, with primary and secondary matches separated',()=>{
 const row=structuredClone(coding.find(r=>r.id==='R09-Q03'));const m=matrix([row]);const occupied=m.filter(c=>c.count);assert.equal(occupied.length,4);assert.ok(occupied.every(c=>c.count===1&&c.denominator===1&&c.percent===100));assert.equal(occupied.reduce((n,c)=>n+c.primary_primary,0),1);assert.equal(matrix([row],true).filter(c=>c.count).length,1);assert.equal(combined([row])[0].matrix_position.length,4);
});
test('zero denominators produce zeros rather than NaN',()=>{assert.equal(matrix([]).length,20);assert.ok(matrix([]).every(c=>c.count===0&&c.percent===0));assert.equal(aggregate([]).unclear,0);assert.deepEqual(profiles([]),[]);});
test('researcher change updates all derived counts without modifying AI baseline',()=>{
 const rows=structuredClone(coding);const r=rows.find(r=>r.id==='R09-Q03');r.dator_primary='Transformation';r.dator_secondary=[];r.researcher_validated=true;
 assert.equal(aggregate(rows).distribution.find(d=>d.archetype==='Transformation').primary,1);assert.equal(matrix(rows).find(c=>c.dator==='Transformation'&&c.areas==='Architecting').primary_primary,1);assert.equal(initialCoding.find(r=>r.id==='R09-Q03').dator_primary,'Continued Growth');
});
test('review roundtrip preserves source, corrections, meaning units and validation',()=>{
 const rows=structuredClone(coding);rows[0].researcher_notes='Alternative reading';rows[0].researcher_validated=true;rows[0].origin='Researcher interpretation';
 const parsed=parseReview(JSON.stringify({schema_version:1,rows,notes:'Researcher memo'}));assert.deepEqual(parsed.rows,rows);assert.equal(parsed.notes,'Researcher memo');
});
test('review import rejects changed source, duplicate IDs and invalid codes atomically',()=>{
 for(const mutate of [r=>r[0].original_response='Rewritten',r=>r[1]=r[0],r=>r[0].dator_primary='Invented',r=>r[0].areas_secondary=['Shaped'],r=>r[0].dator_quote='Not in answer',r=>r[0].dator_confidence='Certain']){
  const rows=structuredClone(coding);mutate(rows);assert.throws(()=>parseReview(JSON.stringify({schema_version:1,rows})));assert.equal(initialCoding.length,33);
 }
});
test('CSV escapes quotations, preserves line breaks and neutralises spreadsheet formulas',()=>{
 const text=csv([{id:'R01',quote:'a "quoted"\nanswer',formula:'=1+1',codes:['Discipline','Continued Growth']}]);assert.ok(text.includes('"a ""quoted""\nanswer"'));assert.ok(text.includes("\"'=1+1\""));
});
test('thematic counts reconcile with traceable membership and denominator',async()=>{
 const themes=JSON.parse(await readFile(new URL('../analysis/thematic.json',import.meta.url),'utf8'));
 for(const t of themes){const ids=t.answer_ids.split(';');assert.equal(ids.length,t.count);assert.equal(new Set(ids).size,t.count);assert.equal(t.denominator,11);for(const id of ids)assert.ok(coding.some(r=>r.id===id));}
});
