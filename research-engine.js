'use strict';
// Shared, deterministic retrieval. The vocabulary contains no preferred passages.
const ResearchEngine=(()=>{
 const concepts=typeof ResearchConcepts!=='undefined'?ResearchConcepts:require('./research-concepts.js');
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f\u0591-\u05c7\u1ab0-\u1aff]/g,'').normalize('NFC').toLowerCase().replace(/ς/g,'σ');
 const stop=/^(설교|말씀|본문|성경|원어|헬라어|히브리어|자료|관련|준비|내용|주제|대한|관한|통해|위한|위해|하도록|하려고|하고|싶|찾|보여|제공|하려|하나|이런|어떤|이러한|이러|있|없|성도|청중|오늘|이번|우리|사람|여러|함께|기반|중심|대해|전할|이야기|제시|알려|관점|가르치고|하려는데|부탁|the$|and$|sermon$|about$|please$|find$|bible$|verses?$)/i;
 const unique=a=>[...new Set(a.filter(Boolean))];
 const split=s=>unique(String(s||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean));
 function stem(s){return s.replace(/(?:으로부터|에게서|에서는|으로는|이라는|이라고|에서|에게|으로|처럼|보다|하고|하며|하는|하도록|들을|들이|의|을|를|은|는|이|가|에|도|과|와)$/,'')||s}
 const directionIds={listen:['comfort','lonely'],hope:['hope'],action:['service','generosity'],discern:['wisdom'],reconcile:['forgive','anger'],rest:['rest'],grief:['grief'],growth:['faith','patience'],gratitude:['gratitude','service'],celebrate:['gratitude','praise'],vocation:['work','steward'],belonging:['unity','hospitality']};
 function extractReferences(query,books=[]){let clean=query;const refs=[];for(const book of books){const aliases=unique([book.name,book.short,book.id]).sort((a,b)=>b.length-a.length).join('|'),re=new RegExp('(^|[^가-힣a-zA-Z0-9])('+aliases+')\\s*\\.?\\s*(\\d{1,3})(?:\\s*장\\s*|\\s*[:.]\\s*)(\\d{1,3})?(?:\\s*절)?(?:\\s*[-–~]\\s*(\\d{1,3})(?:\\s*절)?)?','gi');clean=clean.replace(re,(all,lead,name,ch,verse,end)=>{const chapter=+ch;if(chapter<1||chapter>book.chapters)return all;const start=verse?+verse:1,to=end?+end:verse?+verse:200;if(start<1||to<start||to>200)return all;refs.push({book:book.id,chapter,start,end:to,chapterOnly:!verse});return lead+' '})}return {clean,refs}}
 function plan(query,options={}){
  const referenceData=extractReferences(query,options.books||[]),excludes=split(options.exclude).map(norm).slice(0,15),deemphasized=[];
  const source=(options.keywords?.trim()||referenceData.clean).replace(/(^|\s)([가-힣a-zA-Z]+?)(?:은|는|이|가|을|를)?\s+(?:말고|제외하고|아니라)\s*/g,(all,lead,word)=>{deemphasized.push(word);return lead});
  const n=norm(source),groups=[],seen=new Set();
  const aliasMatch=a=>{const t=norm(a);if(!/[가-힣]/.test(t))return has(n,t);let at=n.indexOf(t);while(at>=0){if(at===0||!/[가-힣]/.test(n[at-1]))return true;at=n.indexOf(t,at+1)}return false};
  for(const c of concepts){const aliases=[...c.aliases,...c.en.filter(t=>t.length>3)];const hits=aliases.filter(aliasMatch);if(!hits.length||hits.every(a=>excludes.includes(norm(a))))continue;
   const usable=hits.filter(t=>!['임금','일','말','나이'].includes(t)),core=unique([...usable,...c.ko.slice(0,2),...c.en.slice(0,2)]).map(norm);
   groups.push({id:c.id,label:c.label,aliases:hits,position:Math.min(...hits.map(h=>n.indexOf(norm(h)))),specificity:Math.max(...hits.map(h=>h.length)),core,terms:unique([...usable,...c.ko,...c.en]).map(norm).filter(t=>!excludes.includes(t)&&!['일','종','의','왕','객'].includes(t)),weight:1+Math.min(.8,Math.max(...hits.map(a=>a.length))/12),kind:'concept'});hits.forEach(x=>seen.add(norm(x)))}
  const tokens=options.keywords?.trim()?split(source).flatMap(x=>x.split(/\s+/)):source.match(/[\p{L}\p{M}\d]+(?:[-'][\p{L}\d]+)*/gu)||[];
  for(let t of tokens){if(stop.test(t)||/[가-힣](?:합니다|습니다|니다|하고|하며|하는|하기|기도|려고|하려고|려는|한|하게|하게끔)$/.test(t))continue;t=/[가-힣]/.test(t)?stem(t):t;t=norm(t);if(t.length<2&&!/[\u0370-\u03ff\u0590-\u05ff]/.test(t))continue;if(stop.test(t)||excludes.includes(t)||[...seen].some(a=>a.includes(t)||t.startsWith(a)))continue;if(groups.some(g=>g.terms.includes(t)))continue;groups.push({id:'literal:'+t,label:t,aliases:[t],core:[t],terms:[t],weight:groups.some(g=>g.kind==='concept')?.65:1.8,position:n.indexOf(t),specificity:t.length,kind:'literal'});seen.add(t)}
  // The first substantive subject is an anchor, not a hand-picked passage list.
  const anchor=[...groups].sort((a,b)=>a.position-b.position||b.specificity-a.specificity)[0]?.id;
  const relations=[];if(groups.some(g=>g.id==='wages')&&/제때|체불|정당|권리|지급|억울|착취/.test(source))relations.push({id:'wages',label:'임금 지급·보호',terms:['당일','해가','압제','억울','떼어','공평','oppress','defraud','pay','paying','withheld','kept back']});
  if(groups.some(g=>g.id==='speech')&&/살리|상처|말실수|언어/.test(source))relations.push({id:'speech',label:'언어가 미치는 영향',terms:['찔','상처','생명','죽','온유','부드','heals','pierc','wound','life','gentle']});
  const direction=(directionIds[options.direction]||[]).flatMap(id=>{const c=concepts.find(c=>c.id===id);return c?[...c.ko,...c.en]:[]}).map(norm);
  return {query,deemphasized,references:referenceData.refs,groups:groups.slice(0,24),anchor,relations,exclude:excludes,direction:unique(direction),language:options.language||'all',scope:options.scope||'all',edition:options.edition||'kor'};
 }
 const matchers=new Map();
 function has(text,term){if(!term)return false;if(/^[a-z0-9][a-z0-9 '\-]*$/.test(term)){if(!matchers.has(term))matchers.set(term,new RegExp('(^|[^a-z0-9])'+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:s|ed|ing)?(?=$|[^a-z0-9])','i'));return matchers.get(term).test(text)}return text.includes(term)}
 function prepare(text){return norm(text)}
 function evidence(text,p){const n=prepare(text);if(p.exclude.some(x=>has(n,x)))return null;const matches=[];for(const g of p.groups){const terms=g.terms.filter(t=>has(n,t));if(terms.length)matches.push({id:g.id,label:g.label,terms,weight:g.weight,kind:g.kind,strength:terms.some(t=>g.core.includes(t))?1:.35})}const relations=(p.relations||[]).filter(r=>matches.some(m=>m.id===r.id&&m.strength===1)&&r.terms.some(t=>has(n,t)));return matches.length?{matches,relations:relations.map(r=>r.label),direction:p.direction.filter(t=>has(n,t)).slice(0,4)}:null}
 function rank(rows,p,{limit=120,collectIds=false}={}){
  if(!p.groups.length)return {rows:[],total:0};const found=[],df=new Map();
  for(const row of rows){const e=evidence(row.searchText??row.text,p);if(!e)continue;for(const m of e.matches)df.set(m.id,(df.get(m.id)||0)+1);found.push({row,...e})}
  const N=Math.max(1,rows.length);for(const x of found){let sum=0;for(const m of x.matches){const rarity=Math.log(1+(N-(df.get(m.id)||1)+.5)/((df.get(m.id)||1)+.5));sum+=m.weight*m.strength*(1+rarity)*Math.min(1.35,1+.1*(m.terms.length-1))}const len=(x.row.text||'').length;const lengthFactor=1/Math.sqrt(.85+Math.min(len,3000)/1500),anchored=x.matches.some(m=>m.id===p.anchor&&m.strength===1);x.score=sum*lengthFactor*(anchored?2.5:.6)*(1+1.4*x.matches.reduce((n,m)=>n+m.strength,0)/p.groups.length)*(1+x.relations.length);x.directionBoost=Math.min(x.score*.18,x.direction.length*.65);x.score+=x.directionBoost}
  found.sort((a,b)=>b.score-a.score||String(a.row.id).localeCompare(String(b.row.id)));return {rows:found.slice(0,limit).map(x=>({...x.row,score:+x.score.toFixed(3),matches:x.matches,relations:x.relations,directionMatches:x.direction})),total:found.length,...(collectIds?{ids:found.map(x=>x.row.id)}:{})};
 }
 function excerpt(text,terms,max=480){let at=-1;for(const t of terms){const i=norm(text).indexOf(norm(t));if(i>=0&&(at<0||i<at))at=i}const start=Math.max(0,at-100);return (start?'…':'')+text.slice(start,start+max)+(start+max<text.length?'…':'')}
 return {plan,rank,evidence,norm,has,split,excerpt,concepts,extractReferences};
})();
if(typeof module!=='undefined')module.exports=ResearchEngine;
