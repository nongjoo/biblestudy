'use strict';
// Four editorial lenses over the same selected evidence; no generated facts or API.
const sermonPerspectives=(()=>{
 const fields=['claim','reason','spoken','bridge','response'];
 const phaseMap={deductive:['assert','observe','reason','limit','respond'],inductive:['ask','observe','pattern','reveal','return'],thesis:['assert','explain','scene','practice','echo'],question:['ask','limit','reframe','answer','review'],tension:['position','counter','criterion','reframe','responsibility'],narrative:['scene','tension','turn','explain','return'],problem:['problem','causes','criterion','compare','plan'],practice:['scene','reread','discern','practice','review'],grace:['need','limit','gift','motive','respond'],discovery:['ask','tension','clue','reframe','invitation']};
 const questions={
  assert:'이 말씀이 지금 나에게 왜 필요한가요?',observe:'어떤 표현을 보고 그런 의미를 읽었나요?',reason:'그 관찰이 왜 이 결론으로 이어지나요?',limit:'다른 상황에 있는 사람에게도 똑같이 말할 수 있나요?',respond:'그래서 이번 주 무엇부터 시작하면 좋을까요?',ask:'이 물음을 나도 정직하게 꺼내도 될까요?',pattern:'여러 관찰을 함께 놓으면 무엇이 보이나요?',reveal:'앞에서 살핀 내용을 한 문장으로 모으면 무엇인가요?',return:'말씀을 듣기 전과 지금, 같은 장면이 어떻게 다르게 보이나요?',explain:'그 말의 뜻을 조금 더 쉽게 설명해 줄 수 있나요?',scene:'이 이야기를 내 자리에서 들으면 무엇이 눈에 들어올까요?',practice:'내 형편에서 감당할 수 있는 한 걸음은 무엇일까요?',echo:'오늘 집으로 돌아가며 어떤 한 문장을 기억하면 좋을까요?',reframe:'처음 질문의 전제를 바꾸어 볼 필요는 없을까요?',answer:'이 말씀으로 답할 수 있는 것과 더 물어야 할 것은 무엇인가요?',review:'실천한 뒤 무엇을 함께 돌아보면 좋을까요?',position:'이 관점이 소중하게 지키려는 것은 무엇인가요?',counter:'이 관점에 동의하기 어려운 사정도 들어 줄 수 있나요?',criterion:'무엇을 기준으로 두 관점을 판단해야 하나요?',responsibility:'긴장이 남아 있어도 내가 책임질 몫은 무엇일까요?',tension:'이 물음이 내게 쉽게 풀리지 않는 이유는 무엇일까요?',turn:'본문의 어느 대목에서 시선이 바뀌나요?',problem:'지금 우리가 실제로 겪는 어려움은 무엇인가요?',causes:'확인한 원인과 아직 추측하는 원인은 어떻게 다른가요?',compare:'혼자 시작하는 길과 함께 의논하는 길에는 어떤 차이가 있나요?',plan:'누구와 언제 시작하고 어떻게 돌아보면 좋을까요?',reread:'본문을 함께 읽으니 경험의 어느 부분이 새롭게 보이나요?',discern:'본문의 뜻과 내가 제안한 방법은 어떻게 다른가요?',need:'말씀 앞에서 지금 무엇이 필요하다고 느끼나요?',gift:'본문에서 하나님이 하시는 일은 무엇인가요?',motive:'이 행동을 대가를 얻으려고 하나요, 받은 것에 응답하려고 하나요?',clue:'처음에는 지나쳤지만 다시 보아야 할 표현은 무엇인가요?',invitation:'새롭게 본 것을 어떤 작은 선택으로 이어 갈 수 있을까요?'
 };
 const turns={
  assert:'먼저 이 말의 근거를 본문에서 확인해 보겠습니다.',observe:'지금 본 표현을 앞뒤 문맥에 놓고 의미를 살펴보겠습니다.',reason:'이 연결이 성립하는 범위도 정직하게 살펴보겠습니다.',limit:'이 경계를 존중하면서 감당할 응답을 생각해 보겠습니다.',respond:'이 응답을 마음에 품고 우리의 자리로 돌아가겠습니다.',ask:'답을 서두르지 않고 본문이 보여 주는 것부터 보겠습니다.',pattern:'이제 관찰들을 모아 처음 물음에 응답해 보겠습니다.',reveal:'그 발견을 우리가 살아갈 한 장면에 비추어 보겠습니다.',return:'오늘의 한 걸음을 기억하며 말씀을 마음에 담겠습니다.',explain:'이 뜻을 구체적인 장면에 놓아 보겠습니다.',scene:'그 장면에서 쉽게 풀리지 않는 질문에 머물러 보겠습니다.',practice:'이 시도를 한 뒤 무엇을 배웠는지 돌아볼 수 있습니다.',echo:'오늘 들은 한 문장과 함께 다음 선택으로 나아가겠습니다.',reframe:'달라진 물음 앞에서 가능한 응답을 살펴보겠습니다.',answer:'그 응답을 시도한 뒤에도 남을 질문을 함께 가져가겠습니다.',review:'다음 만남에서 서로 배운 것을 다시 나누겠습니다.',position:'이 관점에 대한 정직한 반론도 들어 보겠습니다.',counter:'두 관점을 함께 살필 본문의 기준을 찾아보겠습니다.',criterion:'이 기준을 가지고 가능한 응답을 비교해 보겠습니다.',responsibility:'쉽게 끝내지 않고 책임 있게 걸어가겠습니다.',tension:'이 물음을 품고 본문의 한 표현에 주목하겠습니다.',turn:'이 전환이 드러내는 뜻을 문맥에서 풀어 보겠습니다.',problem:'겉으로 보이는 현상과 원인을 나누어 살피겠습니다.',causes:'성급한 진단 대신 본문의 판단 기준으로 나아가겠습니다.',compare:'이제 현실에서 시도할 한 가지 방법을 정해 보겠습니다.',plan:'계획을 작게 시작하고 다음 만남에서 돌아보겠습니다.',reread:'새롭게 보이는 점과 해석의 경계를 구별하겠습니다.',discern:'이 구별을 가지고 작게 시도할 실천을 정해 보겠습니다.',need:'그 필요를 채우려는 우리의 해법도 돌아보겠습니다.',gift:'받은 것을 확인했다면 응답의 동기를 살펴보겠습니다.',motive:'이제 감사에서 시작할 한 걸음으로 초대하겠습니다.',clue:'그 단서를 가지고 처음 질문을 새롭게 보겠습니다.',invitation:'이 작은 초대를 마음에 담고 삶으로 나아가겠습니다.'
 };
 function build(input,draft,index){
  const p=input.packet,profile=sermonRhetoric.profiles[p.structure]||sermonRhetoric.profiles.deductive,stage=draft.stages[index],seed=stage.seed||stage,r=draft.research;
  if(!r)return [];
  const phase=(phaseMap[p.structure]||phaseMap.deductive)[index],delayed=['inductive','discovery'].includes(p.structure)&&index<3;
  const C=draft.thesis||r.thesis,Q=draft.question||r.question,O=r.obs.text;
  const A=r.action?.text||'이번 주 자신의 선택 한 가지를 적고 오늘의 말씀에 비추어 돌아봅시다.';
  const L=r.limit?.text,localQuestion=questions[phase],route=profile.route[index];
  const center=delayed?'아직 결론을 내리지 않고 이 관찰의 문맥을 더 살펴보겠습니다.':C;
  const evidenceLabel=s=>humanRef(s.reference)+' · '+({observation:'관찰',interpretation:'해석·원어',application:'적용'}[s.field]||s.field);
  const next=index<4?`다음 단계에서는 ‘${profile.route[index+1]}’로 나아갑니다.`:'새 주제를 더하지 않고 첫 질문과 삶의 응답을 연결합니다.';
  const lexical=(draft.summary?.lexical||[]).find(w=>seed.ids?.includes(w.id));
  const word=lexical?`\n연구에서 주목한 ‘${lexical.lemma}’의 사전 의미 범위는 ‘${lexical.meaning}’입니다. ${humanRef(lexical.reference)}의 문맥 안에서 어떤 의미가 적절한지 확인해 봅시다.`:'';
  const idsFor=refs=>[...new Set([...(input.sources.some(s=>s.id==='P0')?['P0']:[]),...refs.filter(Boolean).map(s=>s.id)])].filter(id=>input.sources.some(s=>s.id===id));
  function candidate(id,title,method,why,values,refs,notice=''){
   const ids=id==='text'?[...seed.ids]:idsFor(refs);
   return {id,title,method,why,notice,fields:Object.fromEntries(fields.map(f=>[f,String(values[f]||'')])),ids,sourceKeys:ids.map(id=>{const s=input.sources.find(s=>s.id===id);return JSON.stringify([s.reference,s.field,s.text])}),evidence:ids.map(id=>evidenceLabel(input.sources.find(s=>s.id===id)))};
  }
  const sourceQuestion=`“${O}”라는 관찰에서 어떤 표현을 더 살펴야 할까요?`;
  const listener={claim:`청중의 물음으로 여는 ${route}: ${localQuestion}`,reason:`청중의 질문 “${Q}”를 이 단계의 물음 “${localQuestion}”로 구체화합니다. 관찰 “${O}”를 응답의 출발점으로 놓고, 청중의 마음을 임의로 단정하지 않습니다.`,spoken:`이런 질문을 품고 들을 수 있습니다. “${localQuestion}”\n${index===4?A:O}\n${delayed?'답을 미리 정하지 않고 이 표현이 놓인 문맥을 함께 살펴봅시다.':index===4?'이 제안을 각자의 형편에서 가능한 한 걸음으로 조정해 봅시다.':`이 질문과 함께 붙잡을 중심은 이렇습니다. ${C}`}`,bridge:turns[phase],response:index===4?`“${A}”를 언제, 어느 정도까지 시도할 수 있을지 스스로 정해 봅시다.`:`지금 내게 가장 가까운 물음은 무엇입니까? ${localQuestion}`};
  const boundary={claim:`범위를 분명히 하는 ${route}: ${L&&!delayed?L:localQuestion}`,reason:`${L?`선택 노트의 경계 “${L}”를 존중합니다.`:'별도의 반론 자료가 없어 적용 범위를 묻는 검토 질문을 제안합니다.'} 관찰 “${O}”와 ${delayed?'그 문맥':`중심 진술 “${C}”`} 사이에 생략한 조건이 있는지 살핍니다. 반대 입장을 실제 누군가의 주장처럼 만들어 소개하지 않습니다.`,spoken:`한 가지 질문을 더 품어 봅시다. ${localQuestion}\n${L&&!delayed?L:`이 관찰을 앞뒤 조건 없이 넓혀도 되는지 살펴야 합니다. ${O}`}\n${index===4?`그래서 “${A}”를 모두에게 같은 방식으로 강요하지 않고 가능한 응답으로 제안합니다.`:delayed?'지금은 단정하기보다 질문을 열어 두고 더 읽겠습니다.':`이 경계 안에서 오늘의 중심을 붙잡겠습니다. ${C}`}`,bridge:index<4?`이 물음을 지우지 않은 채 다음 내용을 살펴보겠습니다. ${turns[phase]}`:turns[phase],response:index===4?`누군가에게 과도한 부담을 주지 않으면서 “${A}”를 실천할 방법은 무엇입니까?`:`이 단락을 듣고 “제 사정은 조금 다릅니다”라고 말할 수 있는 경우도 있습니까? ${L||'본문의 실제 조건을 다시 확인해 봅시다.'}`};
  const community={claim:`함께 듣는 ${route}: ${index===4?A:localQuestion}`,reason:`같은 관찰 “${O}”를 서로 다른 자리에서 듣는 사람을 생각합니다. 개인의 느낌만으로 뜻을 정하지 않고 본문 문맥을 확인한 뒤, 공동체 안에서 누구의 목소리가 더 필요한지 묻습니다.${index===4?` 적용 자료 “${A}”에서는 내 몫과 함께 의논할 몫을 구별합니다.`:''}`,spoken:`이 말씀을 나 혼자 듣는 것이 아니라 서로 다른 형편의 이웃과 함께 듣고 있다고 생각해 봅시다.\n${index===4?A:O}\n${delayed?'어떤 부분이 서로 다르게 들리는지 먼저 이야기하고, 답은 본문을 더 살핀 뒤 함께 찾아보겠습니다.':index===4?'내가 할 수 있는 한 가지와 함께 의논할 한 가지를 나누되 다른 사람의 참여를 당연하게 요구하지 않겠습니다.':`“${C}”라는 말을 함께 들을 때, 놓치고 있던 이웃의 사정은 없습니까?`}`,bridge:index<4?`서로 다른 사정을 마음에 두고 함께 읽어 보겠습니다. ${turns[phase]}`:turns[phase],response:index===4?`내가 시작할 일, 도움을 청할 사람, 함께 돌아볼 시간을 정합시다. ${A}`:`“${localQuestion}”를 함께 묻기 위해 아직 듣지 못한 사람의 이야기는 무엇입니까?`};
  // Protect the defining move of the structure rather than letting a lens flatten every stage.
  if(['observe','pattern','clue','turn'].includes(phase)){
   listener.spoken=`“${localQuestion}”라고 물으며 이 관찰을 다시 들어 봅시다. ${O}${word}\n${delayed?'아직 답을 서두르지 않겠습니다.':'이 표현이 다음 설명에 어떤 단서를 주는지 살펴봅시다.'}`;
   listener.reason+=` 이 단계에서는 해답보다 관찰을 먼저 확인합니다. ${sourceQuestion}`;
  }
  if(['reason','criterion','explain','reread'].includes(phase)){
   listener.spoken=`“${localQuestion}”라는 물음에 근거를 놓고 답하겠습니다. ${O}\n연구에서 정리한 해석은 “${r.meaning.text}”입니다. 무엇을 관찰했고 어떻게 해석했는지 구별하며 이 연결을 확인해 봅시다.${word}`;
   boundary.spoken=`이 설명에서 건너뛰면 안 되는 부분이 있습니다. ${O}\n이 관찰과 “${r.meaning.text}”라는 해석 사이에 본문이 말하지 않은 전제를 넣지는 않았습니까? ${L||'문맥이 지지하는 범위를 더 살펴보겠습니다.'}${word}`;
  }
  if(phase==='causes')for(const v of [listener,boundary,community])v.spoken+='\n확인한 사실과 원인에 대한 추측은 구별하겠습니다. 아직 듣지 못한 사정은 단정하지 않겠습니다.';
  if(phase==='compare'){
   listener.spoken=`“${A}”를 시도하는 두 길을 비교해 봅시다. 혼자 작게 시작하면 바로 움직일 수 있지만 사정을 놓칠 수 있습니다. 함께 의논하면 다른 시각을 얻지만 상대의 동의와 시간이 필요합니다. 지금 우리의 형편에서는 어느 방법이 더 적절합니까?`;
   boundary.spoken=`“${A}”를 하려 할 때 좋은 의도만 확인하지 않겠습니다. 혼자 시도할 때 놓칠 사정과 함께 의논할 때 필요한 동의를 비교합시다. ${L||'두 방법 모두 누가 부담을 지는지 살펴야 합니다.'}`;
   community.spoken=`“${A}”를 두 가지 방식으로 생각해 봅시다. 각자 작은 범위에서 시작하는 방법과, 함께 계획을 세우는 방법입니다. 공동체는 누가 더 열심인지 평가하기보다 각 방법에서 도움이 필요한 사람이 누구인지 들어야 합니다.`;
  }
  if(phase==='review')for(const v of [listener,boundary,community])v.spoken+='\n실천 뒤에는 무엇이 도움이 되었는지, 무엇이 어려웠는지, 다음에는 무엇을 바꿀지 함께 돌아봅시다.';
  if(phase==='scene'){
   const scene=p.scene?.trim()||`함께 본문을 읽다가 이 관찰 앞에서 잠시 멈춥니다. ${O}`;
   listener.spoken=`${scene}\n이 장면을 듣는 자리에서 “${localQuestion}”라고 물어봅시다.`;
   boundary.spoken=`${scene}\n장면을 듣고 바로 결론을 내리기 전에, 기록된 것과 내가 짐작한 것을 구별해 봅시다. ${L||'이 장면에 없는 대사나 감정을 사실처럼 더하지 않겠습니다.'}`;
   community.spoken=`${scene}\n이 장면을 서로 다른 형편에 있는 사람들과 함께 듣는다고 생각해 봅시다. 어떤 부분을 먼저 듣게 되는지 이야기해 봅시다.`;
  }
  if(phase==='gift'){
   listener.spoken=seed.spoken+'\n이 공급을 듣는 자리에서 묻겠습니다. “'+localQuestion+'”';
   boundary.spoken=seed.spoken+'\n이 말씀의 대상과 조건을 지우고 누구에게나 같은 결과를 약속하지 않겠습니다.';
   community.spoken=seed.spoken+'\n이 말씀을 함께 듣는 공동체 안에서, 받은 것을 어떻게 기억하고 나눌 수 있을지 생각해 봅시다.';
   for(const v of [listener,boundary,community])v.reason=seed.reason+'\n'+v.reason;
  }
  if(phase==='motive')for(const v of [listener,boundary,community])v.spoken+='\n이 행동을 은혜를 얻는 대가로 만들기보다, 받은 것에 대한 응답인지 돌아보겠습니다.';
  if(phase==='echo')for(const v of [listener,boundary,community])v.spoken+=`\n처음의 한 문장을 다시 기억합시다. ${C}`;
  const shared=[r.obs,...(delayed?[]:[r.core,r.meaning]),...(index===4?[r.action]:[]),...(lexical?[{id:lexical.id}]:[])];
  if(phase==='gift')shared.push(...seed.ids.map(id=>input.sources.find(s=>s.id===id)));
  const choices=[
   candidate('text',lexical?'본문·원어 근거':'본문 근거','표현과 문맥에서 주장으로',`‘${route}’를 본문의 관찰과 연결하는 최초 초안입니다. ${next}`,seed,[],lexical?'사전 의미 전체를 이 구절의 뜻으로 단정하지 않습니다.':''),
   candidate('listener','청중의 질문','물음에서 발견으로',`이 단계의 핵심을 “${localQuestion}”라는 청중의 물음으로 풀어 봅니다.`,listener,shared),
   candidate('boundary','반론과 경계','조건을 살펴 주장을 명료하게',`‘${route}’에서 설명이 지나치게 넓어지는 부분을 살펴봅니다.`,boundary,[...shared,r.limit],L?'선택 노트에 기록된 경계를 활용한 예문입니다.':'별도 반론 노트가 없어 확인 질문을 제시합니다. 실제 반대 주장을 발견했다는 뜻은 아닙니다.'),
   candidate('community','공동체의 시각','나의 자리에서 이웃의 자리로',`‘${route}’를 서로 다른 형편의 사람들이 함께 듣는 관점으로 바꿉니다.`,community,shared,'공동체에 대한 제안이며, 본문이 명령한 사실로 덧붙이지 않습니다.')
  ];
  for(const choice of choices){choice.phase=phase;choice.route=route;choice.delayed=delayed}
  return choices;
 }
 function merge(current,incoming){const a=String(current||''),b=String(incoming||'').trim(),normalize=s=>s.replace(/\s+/g,' ').trim();if(!b)return {error:'덧붙일 문장이 없습니다.'};if(normalize(a).includes(normalize(b)))return {error:'같은 문장이 이미 들어 있습니다.'};const value=a.trim()?a.replace(/\s+$/,'')+'\n\n'+b:b;return value.length>10000?{error:'입력란의 길이를 초과합니다. 문장을 줄인 뒤 다시 넣어 주세요.'}:{value}}
 return {build,fields,merge};
})();
