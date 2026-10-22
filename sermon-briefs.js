'use strict';
/* v63 · 원고 작성 지시문과 수정 지시문.
   원칙: 외부 AI가 '설교를 쓰는 법'을 알 수 있게 쓰고, 기계용 JSON은 넣지 않는다.
   수정 지시문은 실패 항목만, 원고의 정확한 문장·숫자를 짚어 그 부분만 고치게 한다. */
(()=>{
 const get=id=>document.getElementById(id);
 const C=window.DelegationCore;
 const W=()=>delegationWorkflow;
 const clean=s=>String(s||'').trim();
 const GOOD=`# 좋은 설교의 기준 (이 원고가 반드시 지킬 것 · 앱이 원고를 받은 뒤 그대로 점검합니다)
1. 본문에서 나온 설교: 하고 싶은 말에 구절을 붙이지 않습니다. 각 대지에서 근거 절을 "N절은 …라고 말씀합니다"처럼 직접 읽고, 본문에 나오는 인물·사물·동작의 낱말을 설명 속에 살려 씁니다. 듣고 나면 "오늘 이 본문이 이런 뜻이었구나"가 남아야 합니다.
2. 한 문장을 향해: 설교 전체가 중심 문장 하나로 모입니다. 대지마다 그 대지의 핵심 문장 하나를 분명히 남깁니다.
3. 하나님이 주어: "우리가 더 노력하자"로 끝나지 않습니다. 각 대지에서 우리의 할 일보다 먼저 하나님(예수님)이 본문에서 하신 일과 지금 하시는 일을 "하나님은 …하십니다"처럼 분명히 말합니다. 권면은 그 은혜에 대한 응답으로 놓습니다.
4. 삶에 닿는 말: 추상적인 교훈 대신 청중의 실제 하루 장면(직장·가정·식탁·출퇴근길·병상 등)을 대지마다 하나씩, 서로 다르게 그립니다. 사실처럼 보이는 일화나 통계는 만들지 않습니다.
5. 흐름: 대지가 나열되지 않고 앞으로 움직입니다. 각 대지의 끝에 다음 대지로 넘어가는 한두 문장을 둡니다.
6. 은혜 안의 구체적 적용: 누가·언제·무엇을 할지 분명하게, 그러나 율법적인 부담이 아니라 받은 은혜에 대한 응답으로 제시합니다.
7. 정직함: 본문이 약속하지 않은 것을 약속하지 않습니다("반드시 성공한다", "모든 문제가 사라진다" 같은 단정 금지). 원어·배경을 과장하지 않습니다.
8. 설교자가 먼저 들은 말씀: 설교자 자신도 이 말씀 앞에 선 사람이라는 고백을 한두 문장 담습니다(예: "저도 이 말씀 앞에서 …를 돌아보게 됩니다"). 구체적인 사건을 지어내지 않고, 말씀 앞에서의 마음으로만 씁니다.
9. 사랑으로 마음을 울리는 설교: 꾸짖기보다 품고, 정죄하기보다 초대합니다. 지친 사람의 마음을 알아주는 따뜻한 말로 시작해, 결론에서는 하나님의 사랑과 은혜, 소망으로 마음을 붙듭니다. 감정을 과장하지 말고 진실하게, 듣는 이의 심금을 울리도록 씁니다.`;
 const EDITION={kor:'개역한글(앱 내장 공개본)',web:'WEB',asv:'ASV',bsb:'BSB'};
 let booksCache=null;
 async function books(){if(!booksCache){const r=await fetch('data/books.json?v='+(typeof APP_VERSION!=='undefined'?APP_VERSION:''));booksCache=await r.json()}return booksCache}
 async function passageLines(reference){
  const p=W().sourcePacket();
  if(p.useOwn&&clean(p.ownText)){
   // 사용자가 붙여 넣은 판본(예: 개역개정)은 손대지 않고 그대로 전달한다.
   return clean(p.ownText).split(/\n/).map(x=>x.trim()).filter(Boolean).map(x=>x.replace(/\s*\|\s*/,'  '));
  }
  try{
   const list=await books();const edition=get('dwEdition')?.value||'kor';
   const name=clean(reference);const book=list.filter(b=>[b.name,b.short,b.id].some(n=>name.startsWith(n))).sort((a,b)=>b.name.length-a.name.length)[0];
   if(!book)return [];
   const data=await (await fetch(`data/${edition}/${book.id}.json?v=${window.APP_VERSION||''}`)).json();
   return C.range(reference,list,{[book.id]:data}).map(r=>{const [,c,v]=r.split('.');return `${book.name} ${c}:${v}  ${data[c][v]}`});
  }catch(e){return []}
 }
 function notesText(p){
  const n=p.researchNotes||{};const parts=[['관찰',n.observation],['해석',n.interpretation],['적용',n.application]].filter(([,v])=>clean(v));
  return parts.map(([k,v])=>`[${k}]\n${clean(v).slice(0,2500)}`).join('\n\n');
 }
 function selectedSources(){try{const raw=window.researchPipeline?.designSources()||'';const m=raw.match(/\[[\s\S]*\]\s*$/);if(!m)return '';const data=JSON.parse(m[0]);return data.slice(0,8).map((x,i)=>`${i+1}. ${clean(x.text).slice(0,600)}${x.from?`  (출처: ${clean(x.from)})`:''}`).join('\n')}catch(e){return ''}}

 async function manuscript(){
  const p=W().sourcePacket(),a=p.anchor;
  if(!a.passage||!a.center||!a.audience)throw Error('설계에서 본문 범위·중심 문장·청중 상황을 먼저 적어 주세요.');
  if(a.points.length<3)throw Error('설계에서 대지를 3개 이상 적어 주세요. 각 대지에는 근거 절이 필요합니다.');
  const text=await passageLines(a.passage);
  const pts=a.points.map((x,i)=>{let s=`  ${i+1}. ${x.title}  (근거: ${x.reference||'근거 절을 본문 안에서 정해 주세요'})`;if(x.opening)s+=`\n     · 이 대지를 여는 문장(설교자 작성, 그대로 사용): ${x.opening}`;if(x.bridge)s+=`\n     · 다음 대지로 넘어가는 문장(그대로 사용): ${x.bridge}`;return s}).join('\n');
  const lex=a.lexical.filter(x=>!x.supplemental).map(x=>`  · ${x.word} (${x.reference})`).join('\n');
  const quotes=a.quotes.map(q=>`  · ${q.reference}: "${q.text}"`).join('\n');
  const notes=notesText(p),src=selectedSources();
  const ill=a.illustration?`  · 사용할 예화(1개, 아래 출처의 사실만): ${a.illustration}\n    출처: ${a.illustrationUrl||'(출처 링크 없음 · 확인 필요)'}`:'  · 예화 없음. 일화·통계·인물 이야기를 지어내지 말고, 본문 장면과 청중의 평범한 일상 장면 묘사로 대신합니다.';
  const per=Math.round(3600/a.points.length/100)*100;
  return `# 역할
당신은 20년 이상 주일 강단을 지켜 온 한국 교회 설교자이자 설교학 편집자입니다. 아래 설교 설계를 바탕으로, 목회자가 주일 예배에서 그대로 읽어도 되는 20분 분량의 설교 원고를 씁니다. 설계는 설교자가 직접 정한 것이므로 방향을 바꾸지 않고, 설교자의 목소리로 완성합니다.

# 설교 설계 (바꾸지 말 것)
- 본문: ${a.passage}
- 중심 문장: "${a.center}"
  → 원고에 이 문장을 글자 그대로 2~3회 씁니다. 서론 끝에서 선언하고, 결론에서 다시 선언합니다.
- 청중: ${a.audience}
${a.question?`- 청중이 품은 질문: "${a.question}"\n  → 서론을 이 질문으로 엽니다. 설교 전체가 이 질문에 답해 가는 여정이 되게 합니다.\n`:''}${a.emotion?`- 감정 흐름: ${a.emotion}\n  → 서론에서 결론까지 이 순서로 청중의 마음이 움직이게 배치합니다.\n`:''}- 대지 (이 순서대로):
${pts}
- 적용 (결론에서 구체적인 행동으로 제시):
${a.applications.map(x=>'  · '+x).join('\n')||'  · 설계에 적용이 없습니다. 결론에서 이번 주에 할 수 있는 행동 하나를 제안합니다.'}
${ill}

# 본문 (${p.useOwn?'설교자가 붙여 넣은 판본':EDITION[p.edition]||'앱 기준 판본'})
${text.join('\n')||'(본문을 불러오지 못했습니다. 설교자가 확인한 본문을 사용하세요.)'}
${quotes?`\n# 직접 인용할 구절 (큰따옴표 안에는 이 글자 그대로만)\n${quotes}\n`:''}${lex?`\n# 원어 (주 본문에서 확인한 단어만 사용)\n${lex}\n`:''}${notes?`\n# 설교자의 연구 노트 (해석의 근거로 사용하되 문장을 옮겨 적지 말고 설교자의 말로 녹일 것)\n${notes}\n`:''}${src?`\n# 설교자가 고른 연구 자료 (출처가 있는 내용만 사실로 사용)\n${src}\n`:''}
# 구성과 분량 (공백 제외 4,500~5,500자)
1. 서론 · 약 600자
   청중이 실제로 겪는 장면 하나로 질문을 열고, 본문의 상황을 짧게 소개한 뒤 중심 문장을 선언합니다.
2. 대지 ${a.points.length}개 · 각 약 ${per}자
   각 대지는 소제목("1. 대지 제목")으로 시작하고 다음 네 걸음으로 씁니다.
   ① 본문 관찰 — 근거 절을 읽고 무엇이 쓰여 있는지 짚습니다.
   ② 의미 — ${lex?'앞뒤 문맥과 원어로':'앞뒤 문맥으로'} 그 말씀이 당시 무엇을 뜻했는지 설명합니다.
   ③ 오늘 — 청중의 구체적인 하루 장면에 연결합니다. 대지마다 다른 장면을 씁니다.
   ④ 연결 — 다음 대지로 자연스럽게 넘어가는 한두 문장.
3. 결론 · 약 700자
   대지를 한 문장씩 묶어 중심 문장으로 모으고, 적용을 '언제·어디서·무엇을' 할지 분명한 행동으로 제시합니다. 중심 문장을 다시 선언합니다.
4. 마무리 기도 · 약 250자
   하나님께 드리는 기도로만 씁니다. 청중에게 지시하는 말("생각해 봅시다" 등)은 넣지 않습니다.

${GOOD}

# 문체
- 강단에서 말하는 존댓말 설교체("~습니다"). 한 문장은 50자 안팎, 한 문단은 2~4문장.
- 아래 '출력' 형식의 표시(#, ##, >) 외에는 머리표·굵은 글씨·표·이모지를 쓰지 않습니다.
- 중심 문장과 청중의 질문 말고는 같은 문장을 되풀이하지 않습니다.
- "첨부", "자료에 따르면", "설계", "노트", "프롬프트"처럼 원고를 만든 과정을 드러내는 말을 쓰지 않습니다. 연구 내용은 설교자 자신의 말로 전합니다.

# 사실 규칙
- 큰따옴표로 성경을 인용할 때는 위 본문${quotes?'과 인용 구절':''}의 글자만 씁니다. 다른 구절은 따옴표 없이 "~라고 말씀합니다"로 풀어 말합니다.
- 원어는 위 목록에 있는 단어만 씁니다${lex?'':' (목록이 없으므로 원어를 쓰지 않습니다)'}. 스트롱 번호는 쓰지 않습니다.
- 통계·인물 일화·역사 사실을 새로 만들지 않습니다.

${outputFormat(a)}`;
 }

 // 원고 작성·수정 지시문이 함께 쓰는 출력 형식. 앱이 이 형식을 읽어 인쇄용 원고와 제작 문안을 만든다.
 function outputFormat(a){
  const pts=(a.points||[]).map((x,i)=>`## ${i+1}. ${x.title||'대지 제목'}${x.reference?` (${x.reference})`:''}\n(대지 본문 문단들)`).join('\n\n');
  return `# 출력 형식 (이 형식 그대로 · 앱이 인쇄용 원고와 제작물로 바로 사용합니다)
# 설교 제목
본문: ${a.passage||'성경 본문'}

## 들어가며
(서론 문단들)

${pts||'## 1. 대지 제목 (근거 절)\n(대지 본문 문단들)'}

## 맺으며
(결론 문단들 · 적용 문장 · 중심 문장 선언)

## 마무리 기도
(기도문)

- 문단 사이에는 빈 줄을 하나 둡니다.
- 대지마다 그 대지의 핵심 문장 하나를 그 자리에서 "> "로 시작하는 단독 줄로 둡니다(같은 문장을 다른 곳에 한 번 더 쓰지 않습니다). 결론의 중심 문장 선언도 "> "로 둡니다.
- 적용은 "이번 주에 …하십시오"처럼 누가·언제·무엇을 하는지 드러나는 독립된 한 문장으로 씁니다.
- 원고 전문만 씁니다. 작성 설명, 수정 목록, 후기, 코드 블록 표시(\`\`\`)는 붙이지 않습니다.`;
 }

 // 실패 항목 → 구체적 수정 지시
 function fixLine(r,a){
  const d=r.detail||{};
  switch(r.code){
   case 'P2':return `중심 문장 "${a.center}"이(가) 원고에 글자 그대로 없습니다. 서론 끝과 결론에 이 문장을 글자 그대로 넣습니다.`;
   case 'P3':return (d.missing||[]).length?`다음 대지를 다루는 단락이 원고에서 확인되지 않습니다. 설계 순서의 자리에 해당 대지를 소제목과 함께 넣고, 근거 절을 읽고 풀어 줍니다.\n${d.missing.map(p=>`   - "${p.title}" (근거: ${p.reference||'근거 절 없음'})`).join('\n')}`:`대지를 설계대로 ${a.points.length}개로 정리합니다.`;
   case 'P5':return (d.bad||[]).length?`아래 성경 인용을 판본 글자 그대로 고칩니다.\n${d.bad.map(q=>`   - ${q.reference}: "${q.expected}"`).join('\n')}`:'';
   case 'P7':{const out=[];if((d.missing||[]).length)out.push(`아래 적용이 원고에 없습니다. 결론부에 언제·어디서·무엇을 할지 분명한 행동으로 넣습니다.\n${d.missing.map(x=>'   - '+x).join('\n')}`);if(d.prayerBad)out.push('마무리 기도 안에 있는 청중 지시문("생각해 봅시다" 등)을 하나님께 드리는 기도 문장으로 바꿉니다.');return out.join('\n')}
   case 'P8':{const n=d.count||0;return n<4500?`분량이 공백 제외 ${n.toLocaleString()}자입니다. 약 ${(4700-n).toLocaleString()}자를 보충해 4,500~5,500자로 맞춥니다. 새 사실을 만들지 말고, 가장 짧은 대지의 본문 관찰과 오늘의 장면을 넓힙니다.`:`분량이 공백 제외 ${n.toLocaleString()}자입니다. 약 ${(n-5300).toLocaleString()}자를 줄여 4,500~5,500자로 맞춥니다. 반복 설명과 긴 수식어부터 줄이고, 중심 문장·대지·적용은 남깁니다.`}
   case 'P9':return `아래 문장이 되풀이됩니다. 한 번만 남기고 나머지 자리는 다른 표현이나 새로운 설명으로 바꿉니다.\n${(d.repeats||[]).slice(0,6).map(x=>`   - "${x.text}" (${x.n}회)`).join('\n')}`;
   case 'P10':{const out=[];if(d.ordered===false)out.push('대지가 설계 순서와 다르게 배치되어 있습니다. 설계 순서대로 단락을 옮깁니다.');if(d.endHasCenter===false)out.push(`결론부(원고 마지막 30%)에 중심 문장 "${a.center}"을(를) 글자 그대로 다시 선언합니다.`);return out.join('\n')}
   case 'P11':{const out=[];if((d.labels||[]).length)out.push(`설계용 표시(${[...new Set(d.labels)].join(', ')})를 지우고 자연스러운 설교 문장으로 바꿉니다.`);if((d.fragments||[]).length)out.push(`잘린 문장을 완성합니다.\n${d.fragments.map(x=>`   - "${x}"`).join('\n')}`);return out.join('\n')}
   case 'P12':return `원고를 만든 과정이 드러나는 문장입니다. 내용은 살리고, 설교자가 직접 말하는 문장으로 바꿉니다(예: "첨부된 해설에 따르면" → "이 구절을 깊이 묵상해 보면").\n${(d.sentences||[]).map(x=>`   - "${x}"`).join('\n')}`;
   case 'P13':return `본문에서 나온 설교가 되도록 본문 말씀을 더 직접 다룹니다. 각 대지에서 근거 절을 "N절은 …라고 말씀합니다"처럼 읽고, 본문에 나오는 인물·사물·동작의 낱말을 설명 속에 살려 씁니다. (지금 본문 낱말 ${d.used??'?'}/${d.total??'?'}개 사용 · 기준 ${d.need??'?'}개, 절 언급 ${d.mentions??0}곳)`;
   case 'P14':return `하나님이 주어가 되게 합니다. 각 대지에서 우리의 할 일보다 먼저 하나님(예수님)이 본문에서 하신 일과 지금 하시는 일을 "하나님은 …하십니다"처럼 분명히 말합니다(지금 ${d.god??0}문장 · 기준 ${d.need??3}문장).${d.graceFirst===false?' 지금은 첫 권면("…하십시오")이 하나님의 일보다 먼저 나옵니다. 은혜를 먼저 말하고 권면은 그 응답으로 옮깁니다.':''}`;
   case 'P15':return `청중의 실제 하루 장면을 넣습니다. 직장·가정·식탁·출퇴근길·병상처럼 구체적인 장면을 대지마다 하나씩, 서로 다르게 그립니다(지금 대지 ${d.secs??'?'}개 중 ${d.lifeSecs??0}개에 삶의 장면). 사실처럼 보이는 일화나 통계는 만들지 않습니다.`;
   case 'P16':return `대지가 나열되지 않고 이어지도록, 각 대지의 끝에 다음 대지로 넘어가는 한두 문장(예: "이제 시선은 …로 옮겨 갑니다", "그렇다면 …")을 넣습니다(지금 ${d.bridged??0}/${d.gaps??'?'}곳).`;
   case 'P17':return `본문이 약속하지 않은 단정입니다. 본문이 말하는 만큼만 말하도록 고칩니다.\n${(d.sentences||[]).map(x=>`   - "${x}"`).join('\n')}`;
   case 'P18':return `설교 전체가 사랑의 마음으로 듣는 이를 품도록 다듬습니다. 꾸짖는 말보다 위로하고 초대하는 말을 쓰고, 결론에서는 하나님의 사랑과 은혜, 소망으로 마음을 따뜻하게 붙듭니다(지금 사랑·위로의 말 ${d.size??0}종 · 기준 ${d.need??4}종${d.tailHope===false?' · 결론에 은혜·소망의 말이 없음':''}). 감정을 과장하지 말고 진실하게 씁니다.`;
   case 'P19':return `설교자가 먼저 이 말씀 앞에 선 마음을 서론이나 결론에 한두 문장 넣습니다(예: "저도 이 말씀 앞에서 제 마음을 돌아보게 됩니다"). 구체적인 사건은 지어내지 않고, 말씀 앞에서의 고백으로만 씁니다.`;
   default:return '';
  }
 }
 const AI_FIXABLE=['P2','P3','P4','P5','P7','P8','P9','P10','P11','P12','P13','P14','P15','P16','P17','P18','P19'];
 const GOOD_CODES=['P13','P14','P15','P16','P17','P18','P19'];
 // 노트에 모은 원어(히브리어·헬라어)를 정리한다. lemma는 사전 기본형, translit은 영문 음역.
 function lexicalItems(p){
  if(typeof NoteLexicalCheck==='undefined')return [];
  const report=NoteLexicalCheck.compare(p.researchNotes||{},clean(p.manuscript));
  return report.items.map(item=>{
   const lemmaLine=item.source.split('\n').find(l=>/\([GH]\d+\)/.test(l))||'';
   const lemma=(lemmaLine.match(/^\s*(\S+)\s*\([GH]\d+\)/)||[])[1]||item.word;
   const translit=(lemmaLine.match(/\([GH]\d+\)\s*·\s*([A-Za-z][A-Za-z’' -]+)/)||[])[1]||'';
   const lang=/[\u0590-\u05ff]/.test(lemma)?'히브리어':'헬라어';
   const ko=(item.source.match(/한국어 기본 뜻:\s*([^\n]+)/)||[])[1]||'';
   return {lemma,translit:translit.trim(),lang,reference:item.reference,gloss:(ko||item.gloss||'').trim(),found:item.matches.length>0};
  });
 }
 const refNums=r=>{const m=String(r||'').match(/(\d+)\s*[:장]\s*(\d+)(?:\s*[-~–]\s*(?:(\d+)\s*[:장]\s*)?(\d+))?/);return m?{c:+m[1],v1:+m[2],c2:m[3]?+m[3]:+m[1],v2:m[4]?+m[4]:+m[2]}:null};
 function pointsFor(reference,a){const r=refNums(reference);if(!r)return [];const at=r.c*1000+r.v1;return a.points.map((p,i)=>{const q=refNums(p.reference);return q&&at>=q.c*1000+q.v1&&at<=q.c2*1000+q.v2?i:-1}).filter(i=>i>=0)}
 function noteLines(text,limit){return clean(text).split('\n').map(x=>x.trim()).filter(x=>x&&!/^\[|^출처:|^한국어 풀이:|CC BY|https?:|^사전 의미|^선택한 형태|^영어 사전 뜻|\([GH]\d+\)|^한국어 기본 뜻/.test(x)).slice(0,limit)}
 function materials(p,lex){
  const n=p.researchNotes||{},out=[];
  if(lex.length)out.push('[원어 노트]\n'+lex.map(x=>`- ${x.lemma}${x.translit?` (${x.translit})`:''} · ${x.lang} · ${x.reference||'출처 절 미기록'}${x.gloss?` · 뜻: ${x.gloss}`:''}`).join('\n'));
  const obs=noteLines(n.observation,12),int=noteLines(n.interpretation,16),app=noteLines(n.application,8);
  if(obs.length)out.push('[관찰 노트]\n'+obs.map(x=>'- '+x).join('\n'));
  if(int.length)out.push('[해석 노트]\n'+int.map(x=>'- '+x).join('\n'));
  if(app.length)out.push('[적용 노트]\n'+app.map(x=>'- '+x).join('\n'));
  const src=selectedSources();if(src)out.push('[설교자가 고른 연구 자료 · 출처가 있는 내용만 사실로 사용]\n'+src);
  return out.join('\n\n');
 }
 function lexicalFix(lex,a){
  const missing=lex.filter(x=>!x.found);if(!missing.length)return '';
  return `연구 노트에 모은 원어가 원고에 빠져 있습니다. 각 원어를 해당 대지의 '의미' 설명 자리에 2~4문장으로 넣습니다. 원어는 아래 표기를 글자 그대로 쓰고, 앞에 한글 음역을, 뒤에 뜻을 붙입니다(예: "피스티스(πίστις), 곧 믿음과 신뢰를 뜻하는 이 말은 …"). 사전의 뜻을 나열하지 말고 본문 장면 안에서 그 단어가 무엇을 드러내는지 설명합니다.\n${missing.map(x=>{const at=pointsFor(x.reference,a);return `   - ${x.lemma}${x.translit?` (영문 음역 ${x.translit})`:''} · ${x.lang} · ${x.reference||'출처 절 미기록'}${x.gloss?` · 뜻: ${x.gloss}`:''} → ${at.length===1?`${at[0]+1}번째 대지 "${a.points[at[0]].title}"`:at.length?`${at.map(i=>i+1).join('·')}번째 대지 중 문맥에 맞는 곳`:'근거 절이 가까운 대지'}`}).join('\n')}`;
 }
 function applicationFix(r,a,p){
  const d=r.detail||{},out=[];
  if(!a.applications.length){
   const fromNotes=noteLines(p.researchNotes?.application,8);
   out.push(`원고에 청중이 실제로 할 적용이 분명하지 않습니다. 결론부('맺으며')에 적용 1~3개를 넣습니다. 각 적용은 "이번 주에 …하십시오"처럼 누가·언제·무엇을 하는지 드러나는 독립된 한 문장입니다.${fromNotes.length?`\n   아래 적용 노트를 우선 사용합니다.\n${fromNotes.slice(0,4).map(x=>'   - '+x).join('\n')}`:'\n   대지에서 나온 행동으로, 이번 주에 실제로 할 수 있는 크기로 씁니다.'}`);
  }
  const fixed=fixLine(r,a);if(fixed)out.push(fixed);
  return out.join('\n');
 }
 function repair(report){
  const p=W().sourcePacket(),a=p.anchor;
  const lex=lexicalItems(p);
  const rows=report.rows.filter(r=>!r.manualOverride&&AI_FIXABLE.includes(r.code)&&(r.status==='실패'||((r.code==='P4'||GOOD_CODES.includes(r.code))&&r.status!=='통과')));
  const fails=rows.map(r=>r.code==='P4'?lexicalFix(lex,a):r.code==='P7'?applicationFix(r,a,p):fixLine(r,a)).filter(Boolean);
  if(!fails.length)return null;
  const mats=materials(p,lex);
  return `# 역할
당신은 20년 이상 주일 강단을 지켜 온 한국 교회 설교자이자 설교학 편집자입니다. 아래 원고는 앱의 원고·앵커 검사를 거쳤습니다. 검사에서 드러난 부족한 곳을 설교자의 연구 노트로 보완해, 주일 강단에서 그대로 읽고 인쇄할 '최종 설교 원고'를 완성합니다. 보완할 곳 외의 문장은 고치지 않습니다. 설교자의 목소리, 본문 해석, 예화, 대지 순서를 그대로 지킵니다.

# 설교 설계 (바꾸지 말 것)
- 본문: ${a.passage}
- 중심 문장: "${a.center}" (글자 그대로 유지, 결론에서 다시 선언)
${a.audience?`- 청중: ${a.audience}\n`:''}${a.question?`- 청중이 품은 질문: "${a.question}"\n`:''}- 대지 순서: ${a.points.map((x,i)=>`${i+1}. ${x.title}${x.reference?` (${x.reference})`:''}`).join(' / ')}
${a.applications.length?`- 적용: ${a.applications.join(' / ')}\n`:''}
# 검사 결과 · 반드시 보완할 곳 (${fails.length}가지)
${fails.map((x,i)=>`${i+1}. ${x}`).join('\n\n')}
${mats?`\n# 보완에 쓸 설교자의 연구 자료 (노트에서 모음)\n보완할 곳에만 사용합니다. 자료의 문장을 그대로 옮기지 말고 설교자의 말로 녹입니다. 자료에 없는 사실은 만들지 않습니다.\n\n${mats}\n`:''}
${GOOD}
# 지킬 것
- 검사를 통과한 부분의 문장은 그대로 둡니다. 보완한 문장은 앞뒤 문장과 자연스럽게 이어지게 씁니다.
- 성경 인용은 원고에 이미 있는 글자를 바꾸지 않습니다(위에서 지정한 인용만 고칩니다).
- 원어는 위 원어 노트에 있는 단어만 씁니다. 스트롱 번호는 쓰지 않습니다. 새로운 통계·일화·성경 구절을 만들지 않습니다.
- 보완 뒤에도 분량은 공백 제외 4,500~5,500자입니다. 늘어난 만큼 반복 설명을 줄여 맞춥니다.
- "첨부", "자료에 따르면", "노트", "설계", "프롬프트", "검사"처럼 원고를 만든 과정을 드러내는 말을 쓰지 않습니다.
- 마무리 기도는 하나님께 드리는 기도로만 씁니다.

# 원고
<<<원고 시작>>>
${clean(p.manuscript)}
<<<원고 끝>>>

${outputFormat(a)}`;
 }
 function manualList(report){return report.rows.filter(r=>r.status==='확인 필요'||(r.status==='실패'&&!AI_FIXABLE.includes(r.code))).filter(r=>!r.manualOverride&&r.code!=='P4'&&!GOOD_CODES.includes(r.code))}
 window.SermonBriefs={manuscript,repair,manualList,fixLine,lexicalItems,outputFormat};
})();
