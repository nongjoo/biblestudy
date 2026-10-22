'use strict';
// Extractive note planning: selected source wording + editorial transitions, no inference API.
const sermonPatterns=(()=>{
 const tones={
  exposition:{label:'해설 중심',opening:'먼저 본문을 함께 살피며 이 질문의 실마리를 찾아보겠습니다.',intent:'본문의 관찰에서 해석으로 이동하는 이유를 차근차근 설명합니다.',response:'이 해석이 실제 선택으로 이어지는 과정을 생각해 봅시다.',close:'오늘 발견한 의미를 이번 주의 한 장면에서 다시 확인해 봅시다.'},
  comfort:{label:'위로·격려',opening:'각자가 지나온 사정과 마음의 속도는 다를 수 있습니다. 서둘러 결론을 강요하지 않고 이 말씀 앞에 함께 머물러 보겠습니다.',intent:'청중의 어려움을 단정하지 않고, 실천을 선택 가능한 초대로 제시합니다.',response:'모든 것을 한 번에 바꾸지 않아도 좋습니다. 감당할 수 있는 한 걸음을 함께 생각해 봅시다.',close:'오늘 당장 다 해내지 못하더라도, 이 질문과 함께 다시 걸어갈 수 있습니다.'},
  challenge:{label:'성찰·결단',opening:'오늘 이 질문을 다른 사람에게 돌리기 전에, 우리 자신의 선택을 먼저 돌아보겠습니다.',intent:'막연한 다짐보다 실제 선택과 책임을 묻되, 본문에 없는 의무나 결과를 덧붙이지 않습니다.',response:'동의하는 데서 멈추지 않고 무엇을 바꿀지 정해 봅시다. 실행할 한 가지와 돌아볼 시간을 선택해 봅시다.',close:'이번 주 한 가지를 실천하고, 다음 만남에서 무엇을 배웠는지 돌아봅시다.'}
 };

 const stop=new Set(['그리고','그러나','그래서','하지만','본문','설교','노트','연구','말씀','대한','통해','위해','것이다','있다','한다','하는','이것','그것','우리는','우리','사람','이러한','선택','중심','주제','찾기']);
 function tokens(text){return new Set((text.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]{2,}/gu)||[]).map(x=>x.replace(/(에서는|으로는|에게는|으로|에서|에게|은|는|이|가|을|를|의|와|과|도)$/u,'')).filter(x=>x.length>1&&!stop.has(x)))}
 function overlap(a,b){const aa=tokens(a),bb=tokens(b);return [...aa].filter(x=>bb.has(x)).length}
 function sentences(s){return sermonEditorial.sourceSentences(s)}
 const cite=x=>`[${x.id} · ${humanRef(x.reference)}]`,quote=x=>`“${x.text}” ${cite(x)}`;
 const label=x=>x.text.length>65?x.text.slice(0,65)+'…':x.text;
 function choose(list,q,ref,used=new Set()){return list.filter(x=>!used.has(x.text)).map(x=>({x,rank:overlap(x.text,q)*3+(x.reference===ref?2:0)+(x.text.length>=20&&x.text.length<=240?2:0)-x.index*.02})).sort((a,b)=>b.rank-a.rank)[0]?.x}
 async function propose(input){
  await readyLibrary.catch(()=>{});
  const p={...input.packet},sources=input.sources.map(s=>({...s,reference:s.id==='P0'?s.reference:sermonEditorial.sourceReference(s.text,s.reference)})),notes=sources.filter(s=>s.id!=='P0'&&s.text.trim());
  if(!notes.length)return {error:'먼저 사용할 연구 노트를 하나 이상 선택해 주세요. 본문에 제한 없이 관찰·해석·적용 중 어느 노트로도 시작할 수 있습니다.'};
  const bank=notes.flatMap(sentences);if(!bank.length)return {error:'선택한 노트에서 설계할 문장을 찾지 못했습니다. 출처 주소 외에 관찰이나 생각을 한 문장 이상 적어 주세요.'};
  const t=tones[p.tone]||tones.exposition,q=[p.focus,p.question].filter(Boolean).join(' '),used=new Set();
  const core=choose(bank.filter(x=>x.field==='interpretation'&&!x.lexical),q,p.reference)||choose(bank.filter(x=>x.field==='observation'&&!x.lexical),q,p.reference)||choose(bank.filter(x=>!x.lexical),q,p.reference)||bank[0];used.add(core.text);
  const obs=choose(bank.filter(x=>x.field==='observation'),core.text+' '+q,p.reference,used)||choose(bank.filter(x=>x.field!=='application'&&!x.lexical),q,p.reference,used)||core;used.add(obs.text);
  const reservedLimit=choose(bank.filter(x=>x.boundary||/아니다|한계|강요|정죄|주의|단정|그러나|하지만|다만/.test(x.text)),core.text,p.reference,new Set([core.text]));
  const meaning=choose(bank.filter(x=>x.field==='interpretation'&&!x.lexical&&x.text!==reservedLimit?.text),core.text,p.reference,used)||core;used.add(meaning.text);
  const lexical=choose(bank.filter(x=>x.lexical),core.text,p.reference),action=choose(bank.filter(x=>x.field==='application'),core.text+' '+q,p.reference),limit=reservedLimit||choose(bank.filter(x=>x.boundary||/아니|않|그러나|하지만|다만|경계|주의|구별|강요|한계/.test(x.text)),core.text,p.reference,new Set([core.text])),extra=choose(bank.filter(x=>x.field!=='application'),core.text,p.reference,used);
  const question=p.question?.trim()||sermonEditorial.question(p.focus?.trim()||core.text),thesis=core.field==='application'?'설교자의 적용 제안: '+core.text:core.text;
  const built=sermonRhetoric.build({p,t,core,obs,meaning,action,limit,extra,lexical,sources,thesis,question,bank});
  const stages=built.stages,layout=stages.map(s=>s.role);
  const matched=[...new Set(stages.flatMap(s=>s.ids).filter(id=>id!=='P0'))],missing=['observation','interpretation','application'].filter(f=>!notes.some(s=>s.field===f));
  const guard=[...built.gaps,'노트 문장을 발췌하고 구조별 연결 문장을 붙인 초안입니다. 노트에 적힌 해석의 옳고 그름을 자동 판정하지 않습니다.',missing.length?'자료가 적은 영역: '+missing.map(f=>({observation:'관찰',interpretation:'해석',application:'적용'}[f])).join('·')+'. 보완 안내를 확인하세요.':'',new Set(notes.map(s=>s.reference)).size>1?'여러 본문의 문맥을 같은 뜻으로 단정하지 마세요.':'',p.structure==='grace'?'은혜와 응답 구조에 필요한 하나님의 공급과 응답 근거가 노트에 있는지 확인하세요. 없는 해석을 자동으로 추가하지 않습니다.':''].filter(Boolean).join(' ');
  return {input:{packet:p,sources},draft:{thesis,question,stages},research:{core,obs,meaning,action,limit,extra,lexical,thesis,question},summary:{title:label(core),passage:p.referenceLabel,focus:p.focus||'선택 노트에서 중심 진술 추출',audience:p.audience,guard,matched,held:notes.filter(s=>!matched.includes(s.id)).map(s=>s.id),focusMatch:!p.focus||overlap(core.text,p.focus)>0,tone:t.label,coreSource:core.id,method:'선택 노트·구조별 논증·작성 안내와 예문',roles:layout,route:built.profile.route,reveal:built.profile.reveal,weights:built.profile.weights,pointIndices:built.profile.points,lexical:built.lexicalNotes}};
 }
 return {propose,tones};
})();
