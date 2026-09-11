import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const survey=JSON.parse(await readFile(new URL('../analysis/survey.json',import.meta.url),'utf8'));
let source=await readFile(new URL('../lib/sorting.ts',import.meta.url),'utf8');
source=source.replace("import survey from '../analysis/survey.json';",`const survey = ${JSON.stringify(survey)};`);
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {emptyBoard,sourceCards,addCard,removeCard,exportBoard,importBoard}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
test('board starts empty and retains all three exact answers for each respondent',()=>{
 assert.deepEqual(Object.values(emptyBoard()),[[],[],[],[]]);assert.equal(sourceCards.length,33);
 for(const r of survey.respondents)assert.deepEqual(sourceCards.filter(c=>c.respondent==='R'+r.id).map(c=>c.text),r.answers);
});
test('an answer can occupy two archetypes without duplication or source mutation',()=>{
 const first=addCard(emptyBoard(),'Continued Growth','R01-Q02');const both=addCard(first,'Discipline','R01-Q02');
 assert.deepEqual(both['Continued Growth'],['R01-Q02']);assert.deepEqual(both.Discipline,['R01-Q02']);assert.equal(addCard(both,'Discipline','R01-Q02'),both);
 const removed=removeCard(both,'Continued Growth','R01-Q02');assert.deepEqual(removed['Continued Growth'],[]);assert.deepEqual(removed.Discipline,['R01-Q02']);assert.deepEqual(first.Discipline,[]);
 assert.equal(sourceCards.length,33);assert.equal(addCard(both,'Collapse','unknown'),both);
});
test('saving and reopening preserves hybrids and rejects altered survey or invalid placements',()=>{
 const board=addCard(addCard(emptyBoard(),'Continued Growth','R03-Q02'),'Discipline','R03-Q02');assert.deepEqual(importBoard(exportBoard(board)),board);
 for(const mutate of [f=>f.source[0].text='edited',f=>f.placements.Collapse=['unknown'],f=>f.placements.Discipline=['R03-Q02','R03-Q02'],f=>f.snapshot='wrong']){
 const f=JSON.parse(exportBoard(board));mutate(f);assert.throws(()=>importBoard(JSON.stringify(f)));}
});
