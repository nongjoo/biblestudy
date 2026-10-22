'use strict';
// Passage-independent checks. Text identity and provenance are not semantic or doctrinal verification.
const sermonIntegrity=(()=>{
 const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 function scan(text){
  const found=[],safe=String(text||'').split('\n').filter(line=>!/OSHB|원문 절 번호|원문 번호/.test(line)).join('\n');
  for(const book of books){
   const names=[book.name,book.short,book.id].sort((a,b)=>b.length-a.length).map(escape).join('|');
   const rx=new RegExp('(?<![가-힣A-Za-z0-9])(?:'+names+')\\s*\\.?\\s*(\\d{1,3})(?:\\s*[:장.]\\s*(\\d{1,3}))?(?:\\s*[절편장])?(?:\\s*[–—~\\-]\\s*(?:(\\d{1,3})\\s*[:장.]\\s*)?(\\d{1,3}))?','giu');
   for(const m of safe.matchAll(rx)){
    const chapter=+m[1],verse=+(m[2]||1),endChapter=m[3]?+m[3]:!m[2]&&m[4]?+m[4]:chapter,endVerse=m[4]&&m[2]?+m[4]:verse;
    const invalid=chapter<1||chapter>book.chapters||verse<1||endChapter<chapter||endChapter>book.chapters||endVerse<1||(endChapter===chapter&&endVerse<verse);
    found.push({reference:`${book.id}.${chapter}.${verse}`,index:m.index,label:m[0],range:!!m[4],chapterOnly:!m[2],endChapter,endVerse,invalid});
   }
  }return found.sort((a,b)=>a.index-b.index);
 }
 function references(text){const map=new Map();for(const r of scan(text).filter(r=>!r.invalid)){const old=map.get(r.reference);if(!old||r.endChapter*1000+r.endVerse>old.endChapter*1000+old.endVerse)map.set(r.reference,r)}return [...map.values()]}
 const displayReference=value=>/^[1-3A-Z]{3}\.\d+\.\d+$/.test(String(value))?humanRef(value):String(value||'');
 const relative=/다음\s*절|이전\s*절|앞\s*절|뒷\s*절|앞선\s*절|이\s*구절|위\s*구절/;
 const key=s=>sermonEditorial.norm(s);
 // Read only the evidence appendix already selected for this sermon, never all saved notes.
 function sources(full){
  const appendix=String(full).split(/\n\s*근거 확인\s*\n/)[1]?.split(/\n\s*최종 리허설/)[0]||'';
  const items=[];let current=null;
  const flush=()=>{if(current)items.push(...sermonEditorial.sourceSentences(current))};
  for(const line of appendix.split('\n')){
   if(/·\s*(?:관찰|해석|적용|선택 본문|본문|원어).*?(?:노트|본문|자료)?\s*$/.test(line)&&references(line).length){flush();current={id:'source-'+items.length,reference:references(line)[0].reference,field:/관찰/.test(line)?'observation':/적용/.test(line)?'application':'interpretation',text:''}}
   else if(current)current.text+=(current.text?'\n':'')+line;
  }flush();return items;
 }
 function match(text,bank){const n=key(sermonEditorial.unwrap(text));return n.length<8?[]:bank.filter(x=>key(x.text)===n)}
 function bind(parsed,bank,audit){
  for(const s of parsed.sections){
   const matches=match(s.claim,bank),refs=[...new Set(matches.map(x=>x.reference))];
   s.provenance=refs.map(reference=>({reference,address:humanRef(reference),basis:'selected note sentence match; interpretation not verified'}));
   const explicit=references(s.claim);
   if(refs.length===1&&!explicit.length){s.evidence=humanRef(refs[0]);if(refs[0]!==references(parsed.reference)[0]?.reference){s.contentLabel=s.contentLabel==='원어 풀이'?'원어 풀이':'보조 본문 해설';s.scope='선택 노트의 보조 본문에 연결한 설명 · 주 본문의 직접 진술이 아님';audit.push(`${s.order}번: 선택 노트 문장의 출처 ${humanRef(refs[0])}를 연결했습니다.`)}}
   // Explicit addresses in the actual claim take precedence over a general P0/context list.
   s.claimReferences=explicit.length?explicit:refs.map(reference=>references(humanRef(reference))[0]).filter(Boolean);
   if(explicit.some(r=>r.reference!==references(parsed.reference)[0]?.reference)&&!refs.length){s.scope='문장에 명시한 본문에 연결한 설교자 해설 · 의미의 타당성은 직접 대조';if(s.contentLabel!=='원어 풀이'&&s.contentLabel!=='실천 제안')s.contentLabel='보조 본문 해설'}
   s.evidenceStatus=refs.length>1?'여러 노트에 같은 문장 · 출처 구별 필요':refs.length===1?'선택 노트 문장과 출처 연결':'설교자가 연결한 본문 · 해석 대조 필요';
  }
 }
 function fields(parsed,overview,lexical){
  const result=[['focus','중심 메시지',parsed.focus],['reference','주 본문',parsed.reference],['question','함께 생각할 질문',parsed.question],['application','실천 제안',parsed.application],...overview.map((t,i)=>['overview-'+i,`요약 ${i+1}`,t])].map(([field,label,text])=>({field,label,text,section:0}));
  for(const s of parsed.sections)for(const [field,label]of Object.entries({title:'제목',claim:'핵심 문장',spoken:'설명',reason:'논증',response:'성찰',evidence:'근거 주소'}))result.push({field:field+'-'+s.order,label:`${s.order}번 ${label}`,text:s[field]||'',section:s.order,references:references(s.evidence)});
  lexical.forEach((w,i)=>{result.push({field:'lexical-'+i,label:`원어 ${w.term}`,text:w.meaning,section:0,references:references(displayReference(w.reference))});result.push({field:'lexical-ref-'+i,label:`${w.term}의 본문 주소`,text:displayReference(w.reference),section:0,requireReference:true})});return result;
 }
 async function inspect(parsed,overview,lexical,edition){
  const issues=[],audit=[],slots=fields(parsed,overview,lexical),lookup=new Map();
  const issue=(slot,code,message)=>issues.push({section:slot.section,field:slot.field,code,message:slot.label+': '+message});
  const loadBook=async id=>{if(!lookup.has(id))lookup.set(id,data(`${edition}/${id}`).catch(()=>null));return lookup.get(id)};
  const all=slots.flatMap(slot=>scan(slot.text).map(r=>({slot,r})));
  // Validate every stated range endpoint, including references outside the 16-quotation print budget.
  for(const {slot,r}of all){
   if(r.invalid){issue(slot,'invalid-address',`“${r.label}”의 장·절 범위를 바로잡아 주세요.`);continue}
   const [book,ch,v]=r.reference.split('.'),corpus=await loadBook(book);if(!corpus)continue;
   if(!corpus[ch]?.[v]||(r.range&&!corpus[r.endChapter]?.[r.endVerse]))issue(slot,'missing-verse',`“${r.label}”의 시작 또는 끝 절을 선택한 판본에서 찾지 못했습니다. 주소나 판본을 확인해 주세요.`);
  }
  for(const slot of slots){
   const text=String(slot.text||''),refs=references(text),context=refs.length?refs:slot.references?.length?slot.references:references(parsed.reference);
   if(slot.requireReference&&!refs.length)issue(slot,'required-reference','확인할 성경 주소를 적어 주세요.');
   if(relative.test(text)&&!refs.length)issue(slot,'relative-reference','“이 구절·다음 절” 대신 정확한 성경 주소를 문장에 적어 주세요.');
   if(/\[(?:먼저 들을 질문|함께할 작은 실천|추천 이유|적용 한계)\]|(?:주장의 출발점|원어 의미 관찰)\s*[:：]/.test(text))issue(slot,'template-label','자료의 분류 머리말을 빼고 인쇄할 문장으로 적어 주세요.');
   if(/\b(?:PANEL_\d+|N\d+|P0)\b/.test(text))issue(slot,'internal-id','내부 자료 번호 대신 성경 주소나 실제 내용을 적어 주세요.');
   if(slot.field==='application'&&sermonEditorial.counseling(text))issue(slot,'counseling-action','상담 질문과 회중의 실천 제안을 구별해 주세요.');
   // Verify only explicitly designated Bible quotations. Ordinary quoted preacher speech stays explanation.
   const marked=/성경\s*(?:직접\s*)?인용|본문\s*인용|직접\s*인용/.test(text),explanation=/해설|의역|설교자|비유|기도문/.test(text);
   const quotes=[...text.matchAll(/[“「『"]([^”」』"\n]+)[”」』"]/g)];
   if(marked&&!quotes.length)issue(slot,'quote-delimiters','직접 인용문을 “ ” 안에 넣거나, 자신의 표현이면 ‘해설’로 바꿔 주세요.');
   for(let i=0;i<quotes.length;i++){
    const m=quotes[i],quote=m[1],after=text.slice(m.index+m[0].length,quotes[i+1]?.index||text.length),adjacent=references(after)[0],attached=adjacent&&/^[\s(（:：,，—–-]*$/.test(after.slice(0,adjacent.index));
    if(!marked&&!(attached&&!explanation))continue;
    const refsForQuote=attached?[adjacent]:context,texts=[];
    for(const r of refsForQuote){const [book,ch,v]=r.reference.split('.'),corpus=await loadBook(book);if(corpus){const end=r.range&&r.endChapter===+ch?r.endVerse:+v;for(let n=+v;n<=end;n++)if(corpus[ch]?.[n])texts.push(corpus[ch][n])}}
    if(!texts.some(t=>t===quote||quote.length>=8&&t.includes(quote)))issue(slot,'quote-mismatch',`직접 인용 “${quote.slice(0,45)}${quote.length>45?'…':''}”이 지정한 본문·판본과 일치하지 않습니다. 수록 원문을 그대로 쓰거나 해설로 구분하세요.`);
   }
  }
  for(const s of parsed.sections)if(s.provenance?.length>1&&!references(s.claim).length)issues.push({section:s.order,field:'claim-'+s.order,code:'ambiguous-source',message:`${s.order}번: 같은 문장이 여러 출처에 있습니다. 핵심 문장에 이번에 뜻한 성경 주소를 적어 구별해 주세요.`});
  const seen=new Map();for(const w of lexical){const id=w.term+'|'+w.reference,prior=seen.get(id);if(prior&&prior!==w.meaning)issues.push({section:0,field:'lexical',code:'lexical-conflict',message:`${w.term}: 같은 본문에 서로 다른 원어 풀이가 있습니다. 의미 범위를 하나의 카드로 정리해 주세요.`});seen.set(id,w.meaning)}
  audit.push('모든 인쇄 영역에 같은 점검 적용: 중심 메시지·요약·각 단락·실천·원어 카드.');
  return {issues:[...new Map(issues.map(x=>[x.field+'|'+x.code+'|'+x.message,x])).values()],audit,readBook:loadBook};
 }
 return {scan,references,displayReference,relative,sources,match,bind,fields,inspect};
})();
