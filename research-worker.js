'use strict';
importScripts('research-concepts.js?v=28','research-engine.js?v=28');
const cache=new Map();
const get=name=>{if(!cache.has(name))cache.set(name,fetch('data/'+name+'.json').then(r=>{if(!r.ok)throw Error('자료 파일: '+name);return r.json()}).catch(e=>{cache.delete(name);throw e}));return cache.get(name)};
let personal=[];
const send=(id,type,value)=>postMessage({id,type,...value});
const nt=new Set(['MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV']);
function scopeOK(book,p){return (p.scope==='all'||(p.scope==='nt')===nt.has(book))&&(p.language==='all'||(p.language==='greek')===nt.has(book))}
let lexSources;
async function lexicon(){if(!lexSources)lexSources=Promise.all(['lexicon-greek','lexicon-hebrew','greek-lemmas','hebrew-lemmas','hebrew-map','research-lexical-variants'].map(get)).then(([g,h,gl,hl,map,aliases])=>{
 const folded=new Map();for(const [lemma,refs] of Object.entries(gl)){const n=ResearchEngine.norm(aliases[lemma]||lemma);if(!folded.has(n))folded.set(n,[]);folded.get(n).push({lemma,refs})}
 const rows=[];for(const [language,lex,lemmas] of [['greek',g,gl],['hebrew',h,hl]])for(const e of Object.values(lex.entries)){
  const variants=language==='hebrew'?[{lemma:e.id,refs:lemmas[e.id]||[]}]:folded.get(ResearchEngine.norm(e.lemma))||[];if(!variants.some(v=>v.refs.length))continue;
  rows.push({...e,language,variants,text:[e.lemma,e.id,e.ko,e.definition,e.usage].filter(Boolean).join(' ')});
 }return {rows,map}
 }).catch(e=>{lexSources=null;throw e});return lexSources}
async function execute(id,input){
 const p=ResearchEngine.plan(input.query,{...input,books:await get('books')}),warnings=[];send(id,'progress',{message:'성경 전체의 본문과 검색 어휘를 준비하고 있습니다…'});
 const [primary,web,korean]=await Promise.all([get(p.edition+'-search'),get('web-search'),get('kor-search')]);
 const english=new Map(web.map(r=>[r.slice(0,3).join('.'),r[3]]));
 const chapterSets=list=>{const m=new Map();for(const r of list){const k=r[0]+'.'+r[1];m.set(k,(m.get(k)||[]).concat(r[2]))}return new Map([...m].map(([k,v])=>[k,v.sort((a,b)=>a-b).join(',')]))};
 const primarySets=chapterSets(primary),webSets=chapterSets(web),koSets=chapterSets(korean),koText=new Map(korean.map(r=>[r.slice(0,3).join('.'),r[3]])),uncertain=new Set([...primarySets].filter(([k,v])=>v!==webSets.get(k)).map(([k])=>k));
 const rows=primary.filter(r=>scopeOK(r[0],p)).map(r=>{const id=r.slice(0,3).join('.'),chapter=r[0]+'.'+r[1],secondary=[p.edition==='web'||uncertain.has(chapter)?'':english.get(id)||'',p.edition==='kor'||uncertain.has(chapter)||koSets.get(chapter)!==webSets.get(chapter)?'':koText.get(id)||''].join('\n');return {id,book:r[0],chapter:r[1],verse:r[2],text:r[3],searchText:r[3]+'\n'+secondary,edition:p.edition,numberingNotice:uncertain.has(chapter)}});
 send(id,'progress',{message:rows.length.toLocaleString()+'개 절을 검색하고 원어의 실제 사용 구절을 대조합니다…'});
 const result=ResearchEngine.rank(rows,p,{collectIds:true}),byRef=new Map(rows.map(r=>[r.id,r])),directRows=new Map();let words=[];
 const explicit=rows.filter(r=>p.references.some(x=>x.book===r.book&&x.chapter===r.chapter&&x.start<=r.verse&&r.verse<=x.end)&&!p.exclude.some(x=>ResearchEngine.has(ResearchEngine.norm(r.text),x))).map(r=>({...r,score:999,matches:[{label:'직접 지정한 본문',terms:[],visibleTerms:[]}],directionMatches:[]}));
 try{const lex=await lexicon(),ranked=ResearchEngine.rank(lex.rows.filter(e=>p.language==='all'||p.language===e.language),p,{limit:80});
  for(const entry of ranked.rows){
   const refs=new Map();for(const variant of entry.variants)for(const r of variant.refs){const native=r.join('.'),standards=entry.language==='hebrew'?(lex.map.toStandard[native]||[native]):[native];for(const standard of standards){const [book,ch,v]=standard.split('.'),row=byRef.get(standard),fallback=!row&&scopeOK(book,p)&&uncertain.has(book+'.'+ch)&&english.get(standard);if((row||fallback)&&!refs.has(standard))refs.set(standard,{ref:standard,native,lemma:variant.lemma,text:row&&!row.numberingNotice?row.text:english.get(standard)||'',edition:row&&!row.numberingNotice?p.edition:'web',numberingNotice:!row||row.numberingNotice})}}
   const occurrences=[...refs.values()];if(!occurrences.length)continue;
   const top=new Map(result.rows.map((r,i)=>[r.id,i]));occurrences.sort((a,b)=>(top.get(a.ref)??9999)-(top.get(b.ref)??9999));const overlap=occurrences.filter(r=>top.has(r.ref)).length;
   words.push({id:entry.id,lemma:entry.lemma,translit:entry.translit,ko:entry.ko,definition:entry.definition,usage:entry.usage,language:entry.language,matches:entry.matches,score:entry.score*(1+Math.min(1,overlap/4)),overlap,total:occurrences.length,occurrences:occurrences.slice(0,8)});
   if(ResearchEngine.has(ResearchEngine.norm(input.query),ResearchEngine.norm(entry.id))||ResearchEngine.has(ResearchEngine.norm(input.query),ResearchEngine.norm(entry.lemma)))for(const r of occurrences){if(p.exclude.some(x=>ResearchEngine.has(ResearchEngine.norm(r.text),x)))continue;const [book,chapter,verse]=r.ref.split('.');directRows.set(r.ref,{id:r.ref,book,chapter:+chapter,verse:+verse,text:r.text,edition:r.edition,numberingNotice:false,score:entry.score,matches:entry.matches,directionMatches:[],originalMatch:entry.lemma+' · '+entry.id})}
  }
  words.sort((a,b)=>b.score-a.score);words=words.slice(0,12);
  // Direct lemma/Strong queries are joined to real occurrence indexes, never to a guessed passage.
  if(directRows.size){result.rows=[...directRows.values(),...result.rows.filter(r=>!directRows.has(r.id))];result.total=new Set([...(result.ids||[]),...directRows.keys()]).size}
 }catch(e){warnings.push('원어 자료를 읽지 못했습니다. 본문 결과는 사용할 수 있습니다.')}
 let commentary={rows:[],total:0};try{send(id,'progress',{message:'공개 주석과 선택한 개인 자료의 관련 대목을 찾고 있습니다…'});const comments=await get('research-commentary');commentary=ResearchEngine.rank(comments.filter(r=>scopeOK(r.book,p)),p,{limit:30});commentary.rows=commentary.rows.map(r=>({...r,text:ResearchEngine.excerpt(r.text,r.matches.flatMap(m=>m.terms),650)}))}catch{warnings.push('공개 주석 검색 자료를 불러오지 못했습니다.')}
 const local=ResearchEngine.rank(personal.map(r=>({...r,searchText:r.title+'\n'+r.text})),p,{limit:60});local.rows=local.rows.map(r=>({...r,text:ResearchEngine.excerpt(r.text,r.matches.flatMap(m=>m.terms),650)}));
 if(explicit.length){result.rows=[...explicit,...result.rows.filter(r=>!explicit.some(x=>x.id===r.id))];result.total=new Set([...(result.ids||[]),...directRows.keys(),...explicit.map(r=>r.id)]).size}
 result.rows=result.rows.slice(0,120).map(r=>{const {searchText,...rest}=r;const visible=r.matches.map(m=>({...m,visibleTerms:m.terms.filter(t=>ResearchEngine.has(ResearchEngine.norm(r.text),t))}));return {...rest,matches:visible}});
 delete result.ids;send(id,'result',{plan:p,bible:result,words,commentary,personal:local,warnings,searched:rows.length});
}
onmessage=async e=>{const {id,type,input,rows}=e.data;if(type==='personal'){personal=rows||[];return}if(type!=='search')return;try{await execute(id,input)}catch(error){send(id,'error',{message:error.message||'검색 자료를 읽지 못했습니다. 다시 시도하세요.'})}};
