import {readFile,mkdir,writeFile} from 'node:fs/promises';
import ts from 'typescript';
const root=new URL('../',import.meta.url);
const coding=JSON.parse(await readFile(new URL('analysis/coding.json',root),'utf8'));
const survey=JSON.parse(await readFile(new URL('analysis/survey.json',root),'utf8'));
let source=await readFile(new URL('lib/analysis.ts',root),'utf8');
source=source.replace("import baseline from '../analysis/coding.json';",`const baseline = ${JSON.stringify(coding)};`).replace("import survey from '../analysis/survey.json';",`const survey = ${JSON.stringify(survey)};`);
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const a=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
await mkdir(new URL('analysis/exports/',root),{recursive:true});
const exports={
 'dator-coding.json':coding.map(r=>({respondent_id:r.respondent_id,question_id:r.question_id,original_response:r.original_response,dator_primary:r.dator_primary,dator_secondary:r.dator_secondary,dator_confidence:r.dator_confidence,dator_rationale:r.dator_rationale,quote:r.dator_quote,meaning_units:r.meaning_units,researcher_validated:r.researcher_validated})),
 'dator-aggregate.json':a.aggregate(coding),
 'matrix.json':a.matrix(coding).map(({matches,...cell})=>cell),
 'combined.json':a.combined(coding),
 'quotations.json':coding.map(r=>({id:r.id,quote:r.dator_quote,areas_quote:r.areas_quote,themes:r.themes})),
 'profiles.json':a.profiles(coding),
 'reflexive-notes.json':a.reflexiveNotes
};
for(const [file,value] of Object.entries(exports))await writeFile(new URL('analysis/exports/'+file,root),JSON.stringify(value,null,2)+'\n');
await writeFile(new URL('analysis/exports/combined.csv',root),a.csv(a.combined(coding)).replaceAll("\r\n", "\n"));
await writeFile(new URL('analysis/exports/report.md',root),a.report(coding,''));
console.log('Exported the dated AI baseline. Current researcher reviews export from the application.');
