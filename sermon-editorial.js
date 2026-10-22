'use strict';
// Local, bounded editorial cleanup and provenance recovery. No doctrinal inference.
const sermonEditorial=(()=>{
 const wrappers=/^(?:주장의 출발점이 되는 관찰|관찰을 결론으로 잇는 해석|반론을 거쳐 지키는 주장의 경계|주장에서 삶으로 이어지는 응답|먼저 함께 풀 물음|답을 서두르지 않는 관찰|관찰 사이에서 찾을 연결|관찰 뒤에 발견한 결론|오늘 기억할 한 문장|한 문장의 뜻을 여는 설명|기억을 행동으로 바꾸는 한 선택|설명 뒤에 다시 듣는 요지|정직하게 꺼낼 질문|답이 있어도 남는 물음|범위를 분명히 한 응답|먼저 존중할 관점|반론이 지켜 주는 경계|양쪽을 판단할 본문의 관찰|긴장이 남아도 선택할 책임|장면 안에 남는 갈등|전환을 찾을 본문의 표현|전환을 읽는 의미|이야기에서 오늘로 돌아오기|해결할 문제를 묻는 출발점|해결책을 고를 판단 기준|실행과 점검을 묶은 계획|본문과 함께 다시 읽는 경험|해석과 적용의 경계|함께 시도할 작은 실천|함께 품은 필요|감사에서 시작할 응답|익숙함을 흔드는 물음|쉽게 풀리지 않는 물음의 무게|시선을 옮기는 단서|발견 이후의 새로운 시선|새 시선으로 내딛는 한 걸음|설교자의 적용 제안|원어 의미 관찰)\s*[:：]\s*/;
 const tags=/^\[(?:추천 이유|적용 한계|먼저 들을 질문|함께할 작은 실천|문맥|매튜 헨리 간결 주석 · 한국어 편집 요약)\]\s*/;
 const norm=s=>String(s||'').normalize('NFKC').replace(/[\s“”「」『』"'‘’.,!?。:：\[\]]/g,'');
 function unwrap(value){let s=String(value||'').trim(),old;do{old=s;s=s.replace(wrappers,'').replace(tags,'')}while(s!==old);return s}
 function segments(value){const s=String(value||''),out=[],stack=[];let part='',straight=false;const pairs={'“':'”','「':'」','『':'』'};for(let i=0;i<s.length;i++){const c=s[i];part+=c;if(pairs[c])stack.push(pairs[c]);else if(stack.at(-1)===c)stack.pop();if(c==='"')straight=!straight;const decimal=c==='.'&&/\d/.test(s[i+1]||'')&&(/\d/.test(s[i-1]||'')||/[A-Z0-9]{3}$/.test(s.slice(0,i)));if(!stack.length&&!straight&&(c==='\n'||(/[.!?。]/.test(c)&&!decimal))){if(part.trim())out.push(part.trim());part=''}}if(part.trim())out.push(part.trim());return out}
 function address(text){return sermonIntegrity.references(text)[0]?.reference||null}
 function known(value){const clean=unwrap(value),key=norm(clean);if(key.length<12)return null;
  // A previous built-in card used a relative reference. Keep a precise migration alias.
  if(key===norm('다음 절은 의인의 고난이 많다고 말합니다.'))return {reference:'PSA.34.19',anchor:'PSA.34.18',kind:'caution',text:'시편 34:19는 의인의 고난이 많다고 말합니다.'};
  const found=[];for(const card of library?.cards||[])for(const kind of ['context','reason','caution','question','action'])for(const line of segments(card[kind]||'')){if(norm(line)===key)found.push({reference:address(line)||card.ref,anchor:card.ref,kind,text:line})}
  const refs=new Set(found.map(x=>x.reference));return refs.size===1?found[0]:null;
 }
 function sourceReference(text,fallback){const lines=String(text).split('\n'),first=lines[0];if(/^\[|^성경|^본문|^원어/.test(first)){const explicit=address(first.startsWith('[')?(first.match(/^\[([^\]]+)\]/)||[])[1]||'':first);if(explicit)return explicit}
  const matches=lines.flatMap(segments).map(known).filter(Boolean),anchors=new Set(matches.map(x=>x.anchor));if(anchors.size===1)return [...anchors][0];
  const sourceLine=lines.find(line=>/^매튜 헨리 간결 주석 ·|^\[자료 맥락/.test(line));return sourceLine&&address(sourceLine)||fallback;
 }
 function preserveReference(text,reference){const first=String(text).split('\n')[0];if(address(first.startsWith('[')?(first.match(/^\[([^\]]+)\]/)||[])[1]||'':first)&&/^\[|^성경|^본문|^원어/.test(first))return text;return `[자료 맥락 · ${humanRef(reference)}]\n${text}`}
 const counseling=s=>/\[먼저 들을 질문\]|들려주시겠|도울 수 있는 일은 무엇|오늘은 이야기를 듣는 것이 좋/.test(s)||known(s)?.kind==='question';
 const genericQuestion=s=>/우리 삶의 어떤 질문과 연결|^「.+」[을를]/.test(s);
 function question(){return '이 말씀을 들은 뒤 오늘의 선택에서 무엇을 돌아보겠습니까?'}
 function kind(raw,field){if(counseling(raw))return '상담 질문';if(/한국어 기본 뜻|원어 의미 관찰|원어 사전|기본형:/.test(raw))return '원어 풀이';if(/\[함께할 작은 실천\]/.test(raw)||field==='application')return '실천 제안';if(/\[적용 한계\]|반론을 거쳐/.test(raw))return '해설';return field==='observation'?'관찰':'해설'}
 function sourceSentences(source){
  const lines=String(source.text||'').split('\n');let active=source.field,reference=source.reference,lemma='',lexicalBlock=false;
  const result=[];for(const raw of lines){
   const header=/^\s*\[[^\]]+\]/.test(raw)&&address(raw);
   if(header){reference=header;active=source.field;lemma='';lexicalBlock=/원어|사전/.test(raw)}
   if(/기본형:/.test(raw)){lemma=(raw.match(/기본형:\s*([^\n]+)/)||[])[1]||'';lexicalBlock=true}
   if(/\[먼저 들을 질문\]/.test(raw))active='counseling';else if(/\[함께할 작은 실천\]/.test(raw))active='application';
   if((/^영어 사전 뜻:/.test(raw)&&source.text.includes('한국어 기본 뜻:'))||/\([GH]\d+\)|기본형\/식별자|사전 의미와 본문의/.test(raw))continue;
   if(/^\s*(?:\[[^\]]+\]\s*$|출처[:：]|자료[:：]|요약[:：]|본문:|문맥·질문|말씀연구실\s*$|기본형:|선택한 형태:|형태 코드:|한국어 풀이:|원어 식별자:)/.test(raw)||/OSHB|Open Scriptures|CNTR|CC BY|https?:\/\//.test(raw))continue;
   for(const part of segments(raw)){if(counseling(part)||active==='counseling')continue;const recovered=known(part);let text=unwrap(recovered?.text||part),ref=recovered?.reference||address(part)||reference;
    if(/^(?:한국어 기본 뜻|영어 사전 뜻):/.test(text)){const meaning=text.replace(/^(?:한국어 기본 뜻|영어 사전 뜻):\s*/,'');text=lemma?`${lemma}의 사전 뜻: ${meaning}`:`사전에 적은 뜻: ${meaning}`}
    if(text.length<5)continue;
    result.push({text,id:source.id,reference:ref,field:active==='application'?'application':source.field,index:result.length,lexical:lexicalBlock||/[\u0370-\u03ff\u1f00-\u1fff\u0590-\u05ff]|원어|사전 뜻/.test(text),boundary:/\[적용 한계\]/.test(part)||recovered?.kind==='caution',editorialKind:kind(part,active)});
   }
  }return result;
 }
 const coaching=/검증할 주장으로|먼저 확인할 자료|다음 단락에서|관찰과 추론으로 이 진술|이후에는 주장 자체|이 관찰만으로 모든 결론|이 해석의 출발점은|서로의 이유를|본문의 문맥이 이 연결을|여러 뜻을 모두|이 뜻 중 본문의|관찰 없이 이 말을|더 충실한 설교|오늘의 주장은 본문이|이 조건을 지울 때|본문이 허락하는 범위|먼저 본문을 함께 살피며|어떤 표현에서 이 관찰|본문을 다시 대조|오늘은 이 한 문장을|연구하며 관찰한 내용은|근거 없이 결론부터|여기서 멈추어 물어|이 말을 듣고 삶에서|연구에서 주목한 단어|사전이 제시하는 의미 범위|이 관찰에 붙인 해석|관찰.*와 해석.*대조할 때|선택한 경계는|를 존중하려면 적용에서|라는 결론으로 넘어가며|이 주장에 동의하기 전에|관찰을 본문의 어느|관찰 앞뒤에서|앞뒤에서 반복되거나/;
 function printable(text){return segments(text).filter(s=>!coaching.test(s)&&!genericQuestion(s)&&!counseling(s)&&!/^원어 근거 ·|^출처:|^자료:|^근거 자료:|^단락의 역할:/.test(s)).map(unwrap).filter(Boolean)}
 function lexicalClaim(text,lexical){const naked=unwrap(text);const entries=lexical.filter(w=>norm(w.meaning)===norm(naked)||naked===w.term),entry=entries[0];if(new Set(entries.map(w=>w.term+'|'+w.reference)).size>1)return {ambiguous:true};if(entry)return {text:`${entry.term}의 사전 뜻은 ‘${entry.meaning}’입니다.`,label:'원어 풀이',reference:entry.reference};return null}
 function prepare(parsed,brief,lexical){
  const audit=[],issues=[],originalApp=parsed.application,originalQuestion=parsed.question;let app=unwrap(originalApp);
  if(counseling(originalApp)||!app||/\?\s*$/.test(app)){
   const related=known(originalApp),card=related&&(library?.cards||[]).find(c=>c.ref===related.anchor);
   app=card?.action||'본문을 다시 읽고, 오늘 실천할 한 가지를 적어 봅시다.';audit.push('상담 질문을 실천과 구분하고, 기록된 행동 또는 성찰 제안으로 정리했습니다.');
  }
  parsed.application=app;parsed.focus=unwrap(parsed.focus);
  if(genericQuestion(parsed.question)||!parsed.question){parsed.question=question(parsed.focus);audit.push('제목을 반복하는 자동 질문을 삶을 돌아보는 질문으로 정리했습니다.')}
  const replacements=new Map();
  for(const section of parsed.sections){const original=section.claim,raw=unwrap(original),lex=lexicalClaim(raw,lexical),recovered=known(raw);let claim=lex?.text||recovered?.text||raw;section.contentLabel=lex?.label||(/의 사전 뜻[:은]/.test(raw)?'원어 풀이':/해석|해설|의미|논증|반론|한계|경계|관점/.test(section.title+' '+original)?'해설':/실천|응답|적용|행동|초대/.test(section.title)?'실천 제안':'설교자 설명');
   if(counseling(original)||(norm(raw)===norm(unwrap(originalApp))&&app!==unwrap(originalApp))){claim=app;section.contentLabel='실천 제안'}
   if(lex?.ambiguous){issues.push({section:section.order,field:'claim-'+section.order,message:'같은 뜻의 원어 자료가 여러 개입니다. 이 단락에서 사용할 원어와 본문 주소를 문장에 적어 주세요.'})}
   if(lex&&!lex.ambiguous){section.evidence=humanRef(lex.reference);audit.push(`${section.order}번: 단어만 있던 관찰을 원어와 사전 뜻이 있는 문장으로 정리했습니다.`)}
   if(recovered&&recovered.reference!==address(parsed.reference)){section.evidence=humanRef(recovered.reference);section.contentLabel=['question','action'].includes(recovered.kind)?'실천 제안':'보조 본문 해설';section.scope=['question','action'].includes(recovered.kind)?'보조 본문에 연결한 실천 제안이며 성경의 직접 명령이 아님':'다른 본문의 해설이며 주 본문의 직접 진술이 아님';audit.push(`${section.order}번: 원래 자료의 출처 ${humanRef(recovered.reference)}를 복원했습니다. 주 본문과 구별해 표시합니다.`)}
   const relative=sermonIntegrity.relative;
   if(relative.test(claim)&&!address(claim)&&!recovered){issues.push({section:section.order,message:'“다음 절·앞 절”의 정확한 본문 주소를 확인해 문장 안에 적어 주세요.'});section.unresolved=true}
   if(/^사전에 적은 뜻:|^원어 의미 관찰:/.test(claim)||(!/[.!?。다요입니]|[가-힣].+(?:은|는|를|을|에|의)/.test(claim)&&claim.length<12)){issues.push({section:section.order,message:'단어만 있는 부분을 본문 관찰이나 뜻풀이 문장으로 보완해 주세요.'});section.unresolved=true}
   section.claim=claim;
   const lines=printable(section.spoken).map(line=>{const k=known(line);if(k)return k.text;return line}).filter(line=>norm(line)!==norm(raw)&&norm(line)!==norm(claim));

   section.spoken=lines.join(' ');
   section.reason=printable(section.reason).map(line=>known(line)?.text||line).filter(line=>norm(line)!==norm(raw)&&norm(line)!==norm(claim)).join(' ');section.response=counseling(section.response)?'':printable(section.response).join(' ');
   section.question=section.response;section.bridge='';replacements.set(norm(original),claim);replacements.set(norm(raw),claim);
   if(original!==claim&&!lex&&!recovered)audit.push(`${section.order}번: 설계용 머리말을 제거하고 인쇄할 문구만 남겼습니다.`);
  }
  const overview=(brief.points||[]).filter(p=>p&&!/보완 필요|^근거 자료:|^단락의 역할:|^원어 근거 ·/.test(p)).map(p=>p.replace(/^삶으로 연결:\s*/,'')).map(point=>replacements.get(norm(point))||replacements.get(norm(unwrap(point)))||unwrap(point)).map(point=>counseling(point)?app:known(point)?.text||point);
  return {parsed,audit:[...new Set(audit)],issues,overview,applicationLabel:'실천 제안',questionLabel:'함께 생각할 질문',originalQuestion};
 }
 return {unwrap,segments,address,known,sourceReference,preserveReference,sourceSentences,counseling,question,prepare,printable,norm};
})();
