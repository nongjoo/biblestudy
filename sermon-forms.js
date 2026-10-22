'use strict';
/* v79 · 설교 형식(논증과 전달 구조) 엔진
   흐름 정리에서 고른 구조(연역형·귀납형·두괄식·문답형·긴장과 통합형·내러티브형·문제와 대안형·성찰과 실천형·은혜와 응답형·발견의 흐름형)에 따라
   ① 설교의 자리(여는 자리 · 움직임 3~4개 · 닫는 자리)를 정하고
   ② 연구 노트의 설교 초안을 문장 단위로 나눠 각 자리의 역할에 맞게 다시 배치하며
   ③ 원고 작성 지시문에 그 형식의 작성 규칙(중심 문장을 언제 말하는지, 각 움직임이 무엇을 하는지)을 넣는다.
   같은 초안이라도 구조를 바꾸면 자리·순서·대지 제목·중심 문장의 위치가 달라진다. */
window.SermonForms=(()=>{
 // role: 초안에서 무엇을 가져올지 · late: 중심 문장이 이 자리에서 처음 선언됨
 const F={
  deductive:{short:'연역형',logic:'핵심 주장을 먼저 선언하고, 본문의 근거로 그 주장을 증명한 뒤, 반론을 정직하게 다루고 실천으로 맺습니다.',center:'early',
   open:{role:'claim',label:'먼저 전할 핵심 주장',guide:'서론 끝에서 중심 문장을 분명히 선언하고, 오늘 설교가 무엇을 보여 줄지 예고합니다.'},
   moves:[{role:'point',label:'본문에서 확인한 근거 1',guide:'주장을 지지하는 첫째 근거를 근거 절에서 보여 줍니다. 대지 제목은 "왜 그런가"에 대한 답이 되게 씁니다.'},
          {role:'point',label:'본문에서 확인한 근거 2 · 근거가 주장을 지지하는 이유',guide:'둘째 근거와 함께, 근거가 어떻게 주장을 받쳐 주는지 논리를 잇습니다.'},
          {role:'point',label:'본문에서 확인한 근거 3',guide:'셋째 근거로 주장을 완성합니다. 앞의 근거와 겹치지 않게 다른 각도에서.'},
          {role:'limit',label:'예상되는 반론과 적용의 한계',guide:'청중이 품을 "그래도…"를 정직하게 꺼내고, 본문 안에서 답합니다. 주장을 과장하지 않습니다.',opt:true}],
   close:{role:'apply',label:'청중이 선택할 구체적인 실천',guide:'중심 문장을 다시 선언하고, 이번 주에 선택할 행동을 분명하게 제시합니다.'},
   write:['서론의 마지막 문단에서 중심 문장을 글자 그대로 선언합니다.','각 대지는 중심 주장을 뒷받침하는 "근거"입니다. 대지 첫 문장에서 그 대지가 주장의 어떤 이유인지 밝힙니다.','반론의 자리가 있으면 청중의 의문을 공정하게 말하고 본문으로 답합니다.','결론에서 중심 문장을 다시 선언하고 실천으로 맺습니다.']},
  inductive:{short:'귀납형',logic:'삶의 질문에서 출발해 본문의 세부를 함께 관찰하고, 관찰이 쌓여 핵심 메시지에 도달합니다. 결론을 미리 말하지 않습니다.',center:'late',
   open:{role:'question',label:'삶에서 출발하는 열린 질문',guide:'결론을 말하지 않고, 청중이 실제로 겪는 장면과 질문으로 엽니다.'},
   moves:[{role:'obs',label:'본문의 세부 관찰 1',guide:'근거 절에 실제로 쓰인 단어·동작·인물을 함께 살핍니다. 해석보다 관찰을 먼저.'},
          {role:'obs',label:'본문의 세부 관찰 2',guide:'두 번째 관찰. 앞의 관찰과 이어지는 실마리를 남깁니다.'},
          {role:'pattern',label:'관찰에서 반복되는 흐름 발견',guide:'관찰들이 한 방향을 가리키는 것을 청중과 함께 발견합니다.'},
          {role:'late',label:'이제 도달하는 핵심 메시지',guide:'여기서 처음으로 중심 문장을 선언합니다. 발견의 결론으로.'}],
   close:{role:'apply',label:'새롭게 보이는 삶의 실천',guide:'발견한 메시지로 다시 보는 삶과 이번 주의 실천.'},
   write:['서론과 앞의 대지에서는 중심 문장을 말하지 않습니다. 질문과 관찰로 긴장을 유지합니다.','대지 1~2는 본문의 세부 관찰, 대지 3은 반복되는 흐름의 발견입니다.','마지막 대지에서 중심 문장을 처음으로 선언하고, 결론에서 한 번 더 선언합니다.','한 사례를 모든 사람에게 일반화하지 않습니다.']},
  thesis:{short:'두괄식',logic:'요지를 첫머리에 한 문장으로 말하고, 본문 설명과 일상 장면으로 풀어 준 뒤, 첫 문장을 새롭게 되짚으며 마칩니다.',center:'first',
   open:{role:'claim',label:'한 문장으로 먼저 말할 요지',guide:'설교의 첫 문단 첫 문장에서 중심 문장을 말합니다.'},
   moves:[{role:'explain',label:'요지를 이해하게 하는 본문 설명',guide:'근거 절과 문맥으로 요지가 본문에서 나온 것임을 보여 줍니다.'},
          {role:'everyday',label:'일상의 장면으로 풀어 주기',guide:'청중의 하루에서 요지가 보이는 구체적 장면 하나.'},
          {role:'apply1',label:'요지와 연결되는 한 가지 적용',guide:'적용은 하나로 좁혀 분명하게.'}],
   close:{role:'recap',label:'첫 문장을 새롭게 되짚으며 마무리',guide:'처음의 요지를 같은 글자로, 그러나 이제는 깊어진 의미로 다시 말합니다.'},
   write:['원고의 첫 문단 첫 문장이 중심 문장입니다.','대지는 설명 → 일상 장면 → 한 가지 적용의 순서입니다.','마지막 문단에서 첫 문장을 그대로 다시 말하며 마칩니다.']},
  question:{short:'문답형',logic:'청중이 실제로 품은 질문을 정직하게 꺼내고, 익숙한 답의 한계를 짚은 뒤, 본문으로 질문을 다시 보게 하여 잠정적 응답에 이릅니다.',center:'late',
   open:{role:'question',label:'청중이 실제로 품고 있는 질문',guide:'질문을 틀린 답으로 몰지 않고, 그 질문이 왜 절실한지 공감하며 엽니다.'},
   moves:[{role:'tension',label:'익숙한 답으로 충분하지 않은 이유',guide:'흔히 하는 대답이 왜 마음에 닿지 않는지 정직하게.'},
          {role:'point',label:'본문이 질문을 다시 보게 하는 지점',guide:'근거 절이 질문 자체를 새롭게 보게 하는 장면.'},
          {role:'late',label:'본문에 근거한 잠정적 응답',guide:'여기서 중심 문장을 응답으로 선언합니다. 모든 것을 다 안다는 듯 말하지 않습니다.'}],
   close:{role:'reflect',label:'함께 실천하고 다시 물을 질문',guide:'실천 하나와, 한 주 동안 다시 물을 질문으로 맺습니다.'},
   write:['서론은 청중의 질문으로 엽니다. 중심 문장은 셋째 대지(응답)에서 처음 선언합니다.','첫째 대지에서 익숙한 답의 한계를 정직하게 다룹니다.','결론은 다시 물을 질문으로 끝납니다.']},
  tension:{short:'긴장과 통합형',logic:'우리가 붙잡은 관점과 그에 대한 정직한 반론을 공정하게 듣고, 본문이 드러내는 더 깊은 긴장을 지나 관점을 다시 세웁니다.',center:'late',
   open:{role:'view',label:'우리가 붙잡고 있는 관점',guide:'청중이 당연하게 여기는 생각을 그대로, 존중하며 꺼냅니다.'},
   moves:[{role:'tension',label:'그 관점에 대한 가장 정직한 반론',guide:'반론을 허수아비로 만들지 않고 가장 강하게 말합니다.'},
          {role:'point',label:'본문이 드러내는 더 깊은 긴장',guide:'근거 절이 두 관점 모두를 넘어서는 긴장을 보여 줍니다.'},
          {role:'late',label:'본문을 통해 다시 구성하는 관점',guide:'중심 문장을 새 관점으로 선언합니다. 쉬운 타협이 아니라 본문의 재구성.'}],
   close:{role:'reflect',label:'남는 질문과 책임 있는 실천',guide:'다 풀리지 않는 질문을 인정하고, 책임 있는 실천을 제시합니다.'},
   write:['서론에서 청중의 관점을 공정하게 소개합니다.','첫째 대지의 반론도 공정하고 강하게 씁니다.','중심 문장은 셋째 대지에서 재구성된 관점으로 선언합니다. 억지 정반합이나 쉬운 타협을 피합니다.']},
  narrative:{short:'내러티브형',logic:'본문의 장면·인물·갈등·전환을 이야기의 순서대로 따라가며, 전환이 드러내는 메시지를 청중의 이야기로 가져옵니다.',center:'late',
   open:{role:'scene',label:'본문의 실제 장면과 배경',guide:'본문의 첫 장면을 현재형으로, 성경에 있는 사실만으로 그립니다.'},
   moves:[{role:'point',label:'인물이 마주한 갈등과 선택',guide:'인물이 무엇 앞에서 머뭇거리고 무엇을 선택했는지.'},
          {role:'point',label:'본문에서 일어난 전환',guide:'이야기가 바뀌는 결정적 순간. 근거 절을 그대로 들려줍니다.'},
          {role:'late',label:'전환이 드러내는 메시지',guide:'전환이 무엇을 말하는지 중심 문장으로 선언합니다.'}],
   close:{role:'apply',label:'오늘 청중의 이야기로 돌아오기',guide:'본문의 이야기가 청중의 한 주에서 이어지게 합니다.'},
   write:['본문 장면의 순서를 따라갑니다. 성경에 없는 대사·감정을 사실처럼 만들어 넣지 않습니다.','대지 소제목은 이야기의 장면이 드러나게 씁니다.','중심 문장은 전환 뒤(셋째 대지)에서 처음 선언합니다.']},
  problem:{short:'문제와 대안형',logic:'공동체가 겪는 구체적인 문제를 관찰하고 원인을 나눈 뒤, 본문이 주는 가치와 방향으로 대안과 그 한계를 살펴 실행으로 이어 갑니다.',center:'mid',
   open:{role:'problem',label:'구체적으로 관찰되는 문제',guide:'과장하지 않고, 청중이 고개를 끄덕일 구체적 장면으로.'},
   moves:[{role:'cause',label:'개인·관계·제도 차원의 원인 구분',guide:'원인을 한 사람의 믿음 탓으로 돌리지 않고 여러 층으로 나눕니다.'},
          {role:'point',label:'본문이 제시하는 가치와 방향',guide:'근거 절에서 문제를 다시 보게 하는 가치. 여기서 중심 문장을 선언합니다.'},
          {role:'limit',label:'가능한 대안과 각각의 한계',guide:'실제 대안과 그 한계를 정직하게.'}],
   close:{role:'apply',label:'이번 주 실행할 행동과 확인 방법',guide:'누가·언제·무엇을, 그리고 어떻게 돌아볼지.'},
   write:['서론에서 문제를 구체적으로 보여 줍니다. 고난의 원인을 개인의 믿음 탓으로 단정하지 않습니다.','둘째 대지에서 본문의 가치와 함께 중심 문장을 선언합니다.','결론의 실천에는 확인 방법을 함께 씁니다.']},
  practice:{short:'성찰과 실천형',logic:'공동체의 경험을 본문으로 다시 읽고, 나의 해석과 본문의 의미를 구분한 뒤, 작은 실천과 성찰의 질문으로 이어 갑니다.',center:'mid',
   open:{role:'experience',label:'돌아볼 경험 또는 공동체의 상황',guide:'경험을 존중하며 꺼냅니다.'},
   moves:[{role:'point',label:'본문으로 경험을 다시 읽기',guide:'근거 절의 빛으로 경험을 다시 봅니다.'},
          {role:'point',label:'나의 해석과 본문의 의미 구분',guide:'내가 원하던 의미와 본문이 말하는 의미를 구분합니다. 중심 문장을 여기서.'},
          {role:'apply',label:'개인과 공동체의 작은 실천',guide:'개인의 변화와 공동체의 책임을 함께.'}],
   close:{role:'reflect',label:'실천 후 다시 성찰할 질문',guide:'한 주 뒤 스스로 물을 질문으로 맺습니다.'},
   write:['경험을 존중하되 본문의 의미와 구별합니다.','둘째 대지에서 중심 문장을 선언합니다.','결론은 실천 후 다시 성찰할 질문으로 맺습니다.']},
  grace:{short:'은혜와 응답형',logic:'우리가 함께 겪는 필요에서 출발해 익숙한 해법의 한계를 지나, 본문이 보여 주는 하나님의 공급을 발견하고, 은혜에서 나오는 응답으로 나아갑니다.',center:'late',
   open:{role:'need',label:'공유하는 구체적인 필요',guide:'설교자도 함께 겪는 필요로 엽니다. 고난을 개인의 죄로 단정하지 않습니다.'},
   moves:[{role:'limit',label:'익숙한 해법의 한계',guide:'더 노력하기·참기 같은 익숙한 해법이 왜 충분하지 않은지.'},
          {role:'grace',label:'본문에서 발견하는 하나님의 공급',guide:'근거 절에서 하나님(예수님)이 무엇을 하시는지. 주어가 하나님이 되게.'},
          {role:'late',label:'은혜가 바꾸는 관점과 동기',guide:'중심 문장을 선언하고, 은혜가 행동의 동기가 됨을 보여 줍니다.'}],
   close:{role:'apply',label:'개인과 공동체의 응답',guide:'의무가 아니라 은혜에 대한 응답으로서의 실천.'},
   write:['적용은 "해야 한다"가 아니라 은혜에 대한 응답으로 씁니다.','둘째 대지의 주어는 하나님(예수님)입니다.','중심 문장은 셋째 대지에서 처음 선언합니다.']},
  discovery:{short:'발견의 흐름형',logic:'청중의 균형을 흔드는 질문으로 시작해 긴장을 깊게 하고, 본문에서 전환의 단서를 발견한 뒤, 달라진 관점으로 삶을 다시 보며 초대로 맺습니다(유진 로우리의 설교 플롯).',center:'late',
   open:{role:'question',label:'청중의 균형을 흔드는 질문',guide:'익숙한 생각을 흔드는 질문이나 장면. 답은 아직 말하지 않습니다.'},
   moves:[{role:'tension',label:'긴장이 풀리지 않는 이유',guide:'왜 쉽게 풀리지 않는지 긴장을 더 깊게 분석합니다.'},
          {role:'point',label:'본문에서 발견하는 전환의 단서',guide:'근거 절에서 뜻밖의 단서를 발견합니다. 이야기가 뒤집히는 순간.'},
          {role:'late',label:'달라진 관점으로 다시 보는 삶',guide:'중심 문장을 선언하고, 복음의 빛으로 삶을 다시 봅니다.'}],
   close:{role:'apply',label:'이번 주를 향한 초대',guide:'명령보다 초대의 말투로, 이번 주에 해 볼 한 가지.'},
   write:['서론에서 중심 문장을 말하지 않습니다. 균형을 흔드는 질문으로 시작합니다.','첫째 대지에서 긴장을 깊게 하고, 둘째 대지에서 본문의 전환 단서를 발견합니다.','중심 문장은 셋째 대지에서 처음 선언하고 결론의 초대에서 다시 말합니다.']}
 };
 const ORD=['첫째','둘째','셋째','넷째'];
 const X=()=>window.SermonExtract;
 const str=v=>String(v??'');
 const sents=t=>(X()?X().splitSentences(str(t)):str(t).split(/(?<=[.!?])\s+|\n+/)).map(x=>x.replace(/^\s*>\s*/,'').trim()).filter(x=>x.length>=6);
 const clip=(t,n)=>{t=str(t).trim();return t.length<=n?t:t.slice(0,n).replace(/\s+\S*$/,'')+'…'};
 const questionOf=t=>{const m=str(t).match(/["“]([^"”]{4,60}\?)["”]/);return m?m[1]:str(t)};
 const titleOf=t=>{let s=questionOf(t).replace(/^[\s"“'‘>]+/,'').replace(/[.。!]+$/,'').trim();if(s.length>42){const c=s.split(/,\s/)[0];s=c.length>=10&&c.length<=42?c:s.slice(0,42).replace(/\s+\S*$/,'')+'…'}return s};
 // 움직임 제목으로 가장 알맞은 문장: 주장처럼 끝나고, 주소로 시작하지 않고, 중심 문장과 닿는 짧은 문장
 function bestTitle(ss,center){const cw=str(center).split(/\s+/).map(w=>w.slice(0,2)).filter(w=>w.length===2);let best='',sc=-99;
  for(const x0 of ss){const x=str(x0).trim();if(x.length<8)continue;let v=0;if(x.length<=45)v+=2;else v-=1;if(/(니다|다)[.!]?$/.test(x))v+=2;if(/^(?:[가-힣]+\s)?\d+\s*(?:장|절)|^\d|^[가-힣]+복음|^[가-힣]+서\s\d/.test(x))v-=3;if(/\d+\s*절/.test(x))v-=1;if(/[?？]/.test(x))v-=1;if(/(십시오|하세요)/.test(x))v-=2;v+=cw.filter(w=>x.includes(w)).length*0.7;if(/^(하지만|그러나|그리고|또|그래서)/.test(x))v-=1;if(v>sc){sc=v;best=x}}
  return titleOf(best.replace(/^(하지만|그러나|그리고|그래서)\s*/,''))}
 // 문장 속 'N장 N절', 'N절과 N절'을 근거 절로
 function refFrom(text,ctx,fallback){const t=str(text);let m=t.match(/(\d+)\s*장\s*(\d+)\s*절(?:\s*(?:부터|에서|~|-)\s*(\d+)\s*절)?/);const fb=str(fallback).match(/(\d+)\s*:\s*\d+/);const ch=m?m[1]:(fb?fb[1]:(str(ctx.chapter)||''));
  if(m&&ctx.book)return `${ctx.book} ${m[1]}:${m[2]}${m[3]?'-'+m[3]:''}`;
  m=t.match(/(\d+)\s*절(?:\s*(?:과|와|부터|에서|~|-)\s*(\d+)\s*절)?/);if(m&&ctx.book&&ch)return `${ctx.book} ${ch}:${m[1]}${m[2]?'-'+m[2]:''}`;return ''}
 const GENERIC={intro:/^(?:\d+[.)]\s*)?(?:도입|서론|들어가며|여는\s*말)$/,claim:/^(?:\d+[.)]\s*)?(?:중심\s*주장|핵심(?:\s*주장|\s*메시지)?|요지|주제)$/,explain:/^(?:\d+[.)]\s*)?(?:본문\s*(?:설명|해설|관찰|해석)|말씀\s*(?:설명|해설)|본론)$/,apply:/^(?:\d+[.)]\s*)?(?:구체적인\s*)?(?:적용|실천|삶의\s*적용)$/,conclusion:/^(?:\d+[.)]\s*)?(?:결론|맺으며|마무리)$/};
 const RX={tension:/(못합|못하|없습|어렵|두렵|불안|지치|지쳐|무력|막막|부족|흔들|머뭇|좌절|낙심|의미가\s*있을까|소용|헛|무시)/,tension2:/(하지만|그런데|오히려|왜\s|어째서)/,cause:/(때문|이유|원인|까닭|구조|제도|관계)/,limit:/(한계|모든\s*경우|조건|쉽지\s*않|그렇다고|그렇다면|반드시.*아니|오해|다만)/,grace:/(은혜|하나님께서|하나님은|하나님이|주님께서|예수께서|예수님은|예수님이|공급|선물|용서|붙드|베푸|보시고|보셨)/,everyday:/(직장|가정|아이|자녀|부모|출근|퇴근|식탁|회사|학교|이웃|동료|친구|카톡|문자|전화|병원|시장|아침|저녁|일터|지하철)/,question:/[?？]/,imper:/(십시오|하세요|해 보세요|합시다)[.!]?$/};
 // 초안을 재료로 나누기
 function pool(draft,ctx){
  const p={center:str(ctx.center).trim(),question:str(ctx.question).trim(),apps:(ctx.apps||[]).filter(Boolean),intro:[],concl:[],points:[],claim:[],explain:[],applyS:[],all:[],verses:ctx.verses||[]};
  const doc=X()&&draft?X().parse(draft,{}):null;
  if(doc){for(const s of doc.sections){const text=s.blocks.filter(b=>b.type!=='h').map(b=>b.lines.join(' ')).join('\n');const ss=sents(text);const quote=s.blocks.find(b=>b.type==='quote')?.lines.join(' ')||'';p.all.push(...ss);(p.quotes||=[]).push(...s.blocks.filter(b=>b.type==='quote').map(b=>({kind:s.kind,t:b.lines.join(' ')})));
    const t=str(s.title).trim();
    if(s.kind==='intro')p.intro.push(...ss);else if(s.kind==='conclusion')p.concl.push(...ss);else if(s.kind==='prayer')continue;
    else if(s.kind==='point'){if(GENERIC.intro.test(t))p.intro.push(...ss);else if(GENERIC.claim.test(t)){p.claim.push(...ss);if(quote)p.claim.unshift(quote)}else if(GENERIC.explain.test(t))p.explain.push({ref:s.ref,ss,quote});else if(GENERIC.apply.test(t))p.applyS.push(...ss);else if(GENERIC.conclusion.test(t))p.concl.push(...ss);else p.points.push({title:t,ref:s.ref,ss,quote})}}}
  // '본문 설명'이 한 덩어리면 근거 절·문단 단위로 쪼개 대지 재료로 쓴다
  if(p.points.length<3&&p.explain.length){for(const e of p.explain){const chunk=Math.max(2,Math.ceil(e.ss.length/Math.max(1,3-p.points.length)));for(let i=0;i<e.ss.length&&p.points.length<4;i+=chunk){const part=e.ss.slice(i,i+chunk);const ref=refFrom(part.join(' '),ctx,p.points[p.points.length-1]?.ref||e.ref)||e.ref||'';if(ref&&!ctx.chapter){const m=ref.match(/(\d+):/);if(m)ctx.chapter=m[1]}p.points.push({title:'',ref,ss:part,quote:''})}}}
  if(!p.apps.length)p.apps=p.applyS.filter(x=>/(십시오|하세요|해 보세요|합시다|하겠습니다|이번 주)/.test(x)).slice(0,3);
  if(!p.question){const q=[...p.intro,...p.all].find(x=>RX.question.test(x));p.question=q?questionOf(q):''}
  p.points.forEach(pt=>{if(!pt.ref)pt.ref=refFrom(pt.ss.join(' '),ctx,'')});
  if(!p.center)p.center=p.claim.find(x=>x.length>=8&&x.length<=70)||(p.quotes||[]).filter(q=>q.kind==='conclusion').map(q=>q.t).find(x=>x.length>=6&&x.length<=70)||(p.quotes||[]).map(q=>q.t).find(x=>x.length>=6&&x.length<=70)||'';p.center=p.center.replace(/^\s*>\s*/,'').trim();
  return p}
 let HOLD=new Map(),ROLE='';
 const take=(arr,used,n,re)=>{const out=[];for(const x of arr){if(out.length>=n)break;if(used.has(x))continue;const h=HOLD.get(x);if(h&&h!==ROLE)continue;if(re&&!re.test(x))continue;out.push(x);used.add(x)}return out};
 function pointKey(pt){return pt.quote||pt.ss.find(x=>x.length>=12&&x.length<=90)||pt.ss[0]||''}
 // 한 자리 채우기
 function fillSlot(slot,p,state,idx,form){const used=state.used;ROLE=slot.role;const out={label:slot.label,guide:slot.guide,role:slot.role,title:'',ref:'',key:'',body:[]};
  const nextPoint=()=>p.points[state.pi++]||null;
  const usePoint=(pt,style)=>{if(!pt)return false;out.ref=pt.ref||'';const k=pointKey(pt);const t=pt.title||bestTitle([pt.quote,...pt.ss].filter(Boolean),p.center);
    out.title=style==='obs'&&!pt.title?bestTitle(pt.ss.filter(x=>!/(하나님|예수님은|믿음은)/.test(x)).concat(pt.ss),p.center):t;
    out.key=k;out.body=[...take(pt.ss,used,4)];return true};
  switch(slot.role){
   case 'claim':out.title=titleOf(p.center||p.claim[0]||'');out.key=p.center||p.claim[0]||'';out.body=[...take(p.intro,used,2),...take(p.claim,used,2)];break;
   case 'question':out.title=p.question?titleOf(p.question):titleOf(p.intro[0]||'');out.key=p.question||p.intro[0]||'';out.body=take(p.intro,used,2);if(!out.body.length)out.body=take(p.all,used,2);break;
   case 'scene':out.title=p.verses[0]?titleOf(p.verses[0].text):titleOf(p.intro[0]||'본문의 장면');out.ref=p.verses[0]?.label||'';out.key=p.verses[0]?.text||p.intro[0]||'';out.body=[...p.verses.slice(0,2).map(v=>`${v.label} ${v.text}`),...take(p.intro,used,2)];break;
   case 'view':case 'experience':case 'need':case 'problem':{const re=slot.role==='problem'||slot.role==='need'?RX.tension:null;const b=take(p.intro,used,3,re);if(b.length<2)b.push(...take(p.intro,used,3-b.length));out.body=b;out.key=b[0]||p.question||'';out.title=bestTitle(b,'')||titleOf(p.question||slot.label);break}
   case 'tension':case 'limit':case 'cause':{const re=RX[slot.role];let b=take([...p.intro,...p.all],used,3,re);if(slot.role==='tension'&&b.length<2)b.push(...take([...p.intro,...p.all],used,2-b.length,RX.tension2));if(!b.length&&slot.role==='limit')b=take(p.all,used,2,RX.tension);
     if(!b.length){const pt=nextPoint();if(pt){usePoint(pt,'reason');break}}
     out.body=b;out.key=b[0]||'';out.title=b[0]?bestTitle(b,''):slot.label;break}
   case 'point':{const pt=nextPoint();if(!usePoint(pt,form.center==='early'?'reason':'plain')){const b=take(p.all,used,3);out.body=b;out.key=b[0]||'';out.title=titleOf(b[0]||slot.label)}break}
   case 'obs':{const pt=nextPoint();if(!usePoint(pt,'obs')){const v=p.verses[idx+1]||p.verses[idx];if(v){out.ref=v.label;out.title=`${v.label} · ${titleOf(v.text)}`;out.key=v.text;out.body=[`${v.label} ${v.text}`]}}break}
   case 'pattern':{const pt=nextPoint();if(pt){usePoint(pt,'plain')}else{const b=take(p.all,used,3);out.body=b;out.key=b[0]||'';out.title=titleOf(b[0]||slot.label)}break}
   case 'explain':{const pt=nextPoint();usePoint(pt,'plain');const more=nextPoint();if(more){out.body.push(...take(more.ss,used,3));if(!out.ref)out.ref=more.ref}break}
   case 'everyday':{const b=take([...p.points.flatMap(x=>x.ss),...p.intro,...p.all].filter(x=>!RX.imper.test(x)),used,3,RX.everyday);out.body=b.length?b:take(p.all,used,2);out.key=out.body[0]||'';out.title=titleOf(out.key||slot.label);break}
   case 'grace':{const b=take([...p.points.flatMap(x=>x.ss),...p.all],used,4,RX.grace);const pt=p.points[state.pi];if(pt&&(!b.length||pt.ss.some(x=>RX.grace.test(x)))){state.pi++;usePoint(pt,'plain');out.body=[...out.body,...b].slice(0,5)}else{out.body=b;out.key=b[0]||'';out.title=titleOf(b[0]||slot.label);out.ref=p.points[0]?.ref||''}break}
   case 'late':{out.title=titleOf(p.center||p.claim[0]||'');out.key=p.center||'';const pt=p.points[state.pi];if(pt&&state.pi<p.points.length){state.pi++;out.ref=pt.ref||'';out.body=[...take(pt.ss,used,3)]}out.body.push(...take([...p.claim,...p.concl],used,2));if(!out.ref)out.ref=p.points[p.points.length-1]?.ref||'';break}
   case 'apply':case 'apply1':{const ap=slot.role==='apply1'?p.apps.slice(0,1):p.apps.slice(0,3);out.title=slot.role==='apply1'?titleOf(ap[0]||'이번 주의 한 걸음'):'이번 주의 한 걸음';out.key=ap[0]||'';out.body=[...ap,...take(p.concl,used,2)];break}
   case 'recap':out.title=titleOf(p.center);out.key=p.center;out.body=[...take(p.concl,used,3)];break;
   case 'reflect':{const q=p.question?p.question:'';out.title=q?titleOf(q):'다시 물을 질문';out.key=q;out.body=[...p.apps.slice(0,1),...take(p.concl,used,2),q?`(한 주 동안 다시 물을 질문) ${q}`:''].filter(Boolean);break}
  }
  out.body=[...new Set(out.body.filter(Boolean))].slice(0,5);out.title=clip(out.title,48);return out}
 // 초안 → 이 형식의 흐름
 function compose(formId,ctx){ctx={...ctx};if(!ctx.chapter){const m=str(ctx.passage||ctx.verses?.[0]?.label).match(/(\d+)\s*:/);if(m)ctx.chapter=m[1]}if(!ctx.book){const m=str(ctx.passage).match(/^(\D+?)\s*\d/);if(m)ctx.book=m[1].trim()}const form=F[formId]||F.deductive;
  // 초안이 실제로 말하는 성경(예: '마태복음 9장')을 우선한다 · 지난 설계의 본문이 남아 있어도 초안을 따른다
  try{const names=(typeof books!=='undefined'?books:[]).map(b=>b.name).sort((a,b)=>b.length-a.length);const d=str(ctx.draft);let best='',n=0,ch='';for(const nm of names){const re=new RegExp(nm+'\\s*(\\d+)\\s*(?:장|:)','g');let m,c=0,first='';while((m=re.exec(d))){c++;if(!first)first=m[1]}if(c>n){n=c;best=nm;ch=first}}if(best&&!ctx.book){ctx.book=best;if(ch)ctx.chapter=ch}}catch(e){}
  const p=pool(ctx.draft||'',ctx);const state={used:new Set(),pi:0};
  // 여는 자리·닫는 자리는 마지막에 채워 재료를 대지에 먼저 양보한다(단, 서론 재료는 여는 자리의 것)
  const n=form.moves.filter(m=>!m.opt).length,optUse=form.moves.some(m=>m.opt)&&(p.points.length>=4||p.all.some(x=>RX.limit.test(x)));
  const slots=form.moves.filter(m=>!m.opt||optUse);
  HOLD=new Map();for(const m of slots){const re=m.role==='tension'?RX.tension:m.role==='everyday'?RX.everyday:m.role==='limit'?RX.limit:m.role==='cause'?RX.cause:null;if(!re)continue;let k=0;for(const x of [...p.intro,...p.all]){if(k>=2)break;if(!HOLD.has(x)&&re.test(x)&&!RX.imper.test(x)&&!(form.open.role==='question'&&RX.question.test(x))){HOLD.set(x,m.role);k++}}}
  const open=fillSlot(form.open,p,state,0,form);
  const moves=slots.map((s,i)=>fillSlot(s,p,state,i,form));
  // 남은 대지 재료(초안의 4번째 대지 등)는 버리지 않고 가장 가까운 움직임에 붙인다
  while(state.pi<p.points.length){const pt=p.points[state.pi++];const host=moves.filter(m=>['point','obs','late','explain','grace','pattern'].includes(m.role)).pop()||moves[moves.length-1];host.body.push(...take(pt.ss,state.used,2));if(!host.ref&&pt.ref)host.ref=pt.ref}
  HOLD=new Map();const close=fillSlot(form.close,p,state,moves.length,form);ROLE='';
  const ordinal=form.center==='early';moves.forEach((m,i)=>{if(ordinal&&m.role==='point'&&m.title&&!/^(첫째|둘째|셋째|넷째)/.test(m.title))m.title=`${ORD[i]}, ${m.title}`});
  return {form:formId,name:form.short,logic:form.logic,center:p.center,open,moves,close,stats:{points:p.points.length,sentences:p.all.length,usedFrom:ctx.draft?'draft':'notes'}}}
 // 원고 지시문에 넣을 형식 규칙
 function promptBlock(formId,plan){const form=F[formId];if(!form)return null;
  const centerRule={early:'원고에 이 문장을 글자 그대로 2~3회 씁니다. 서론의 마지막 문단에서 먼저 선언하고, 결론에서 다시 선언합니다.',first:'원고의 첫 문단 첫 문장으로 이 문장을 말하고, 마지막 문단에서 같은 글자로 다시 말합니다.',late:'서론과 앞의 대지에서는 이 문장을 말하지 않습니다. 아래 형식에서 정한 자리에서 처음 선언하고, 결론에서 한 번 더 선언합니다(모두 2회).',mid:'아래 형식에서 정한 대지에서 처음 선언하고, 결론에서 다시 선언합니다.'}[form.center];
  const line=(s,i)=>{const d=plan?.[i];return d};
  const movesTxt=form.moves.map((m,i)=>`   ${i+1}번째 대지 · ${m.label}${m.opt?' (있을 때)':''}\n      ${m.guide}`).join('\n');
  const composition=`# 설교 형식 · ${form.short} (설교자가 고른 논증과 전달 구조 · 반드시 이 흐름으로)
${form.logic}

1. 들어가며 · ${form.open.label} · 약 600자
   ${form.open.guide}
2. 대지 · 각 대지가 아래 자리의 역할을 하게 씁니다 (대지 수는 위 설계의 대지 수를 따름)
${movesTxt}
   각 대지는 소제목("1. 대지 제목")으로 시작하고, 근거 절을 읽어 무엇이 쓰여 있는지 짚은 뒤 그 자리의 역할을 다하고, 다음 자리로 넘어가는 한두 문장으로 잇습니다. 대지마다 다른 삶의 장면을 씁니다.
3. 맺으며 · ${form.close.label} · 약 700자
   ${form.close.guide}
4. 마무리 기도 · 약 250자
   하나님께 드리는 기도로만 씁니다. 청중에게 지시하는 말("생각해 봅시다" 등)은 넣지 않습니다.

# 이 형식에서 꼭 지킬 것
${form.write.map(x=>'- '+x).join('\n')}`;
  return {centerRule,composition,form}}
 // 흐름 보드에 정리한 '자리별 내용'을 지시문 재료로
 function planText(board){if(!board||!board.form||!F[board.form])return '';const f=F[board.form];const b=x=>str(x).split('\n').map(y=>y.trim()).filter(Boolean).map(y=>'      · '+y).join('\n');
  const parts=[];if(board.opening?.trim())parts.push(`   [들어가며 · ${f.open.label}]\n${b(board.opening)}`);
  (board.moves||[]).forEach((m,i)=>{if(!m.title)return;const lab=m.label||f.moves[Math.min(i,f.moves.length-1)].label;parts.push(`   [${i+1}번째 대지 · ${lab}] ${m.title}${m.ref?` (${m.ref})`:''}${m.body?.trim()?'\n'+b(m.body):''}`)});
  if(board.closing?.trim())parts.push(`   [맺으며 · ${f.close.label}]\n${b(board.closing)}`);
  return parts.length?`# 설교자가 흐름 보드에 자리별로 정리한 내용 (초안에서 옮김 · 이 내용을 살려 그 자리에서 쓸 것, 문장은 다듬어도 됨)\n${parts.join('\n')}`:''}
 return {forms:F,compose,promptBlock,planText,pool}
})();
// 원고 작성 지시문 · 최종 원고 지시문에 고른 형식을 반영
(function(){const SB=window.SermonBriefs;if(!SB||SB._forms)return;SB._forms=1;
 const formNow=()=>{try{const b=window.ResearchFlow?.board;const id=(b&&b.form)||document.getElementById('sermonStructure')?.value||'';return {id,board:b}}catch(e){return {id:'',board:null}}};
 const edName=()=>{try{const T=window.MyTranslation;return T&&T.fullOn&&T.fullOn()?T.state.full.name:''}catch(e){return ''}};
 const _m=SB.manuscript;SB.manuscript=async function(){let t=await _m.apply(this,arguments);const {id,board}=formNow();const blk=SermonForms.promptBlock(id);
  const nm=edName();if(nm)t=t.replace(/# 본문 \([^)\n]*\)/,`# 본문 (${nm})`);
  if(!blk)return t;
  t=t.replace('  → 원고에 이 문장을 글자 그대로 2~3회 씁니다. 서론 끝에서 선언하고, 결론에서 다시 선언합니다.','  → '+blk.centerRule);
  try{const a=delegationWorkflow.sourcePacket().anchor;a.points.forEach((p,i)=>{const m=blk.form.moves[Math.min(i,blk.form.moves.length-1)];const head=`  ${i+1}. ${p.title}`;const at=t.indexOf(head);if(at>=0){const end=t.indexOf('\n',at);t=t.slice(0,end)+`\n     · 이 대지의 자리: ${m.label} — ${m.guide}`+t.slice(end)}})}catch(e){}
  const s=t.indexOf('# 구성과 분량'),g=t.indexOf('# 좋은 설교의 기준');
  if(s>=0&&g>s){const plan=SermonForms.planText(board&&board.form===id?board:null);t=t.slice(0,s)+'# 분량\n공백 제외 4,500~5,500자.\n\n'+blk.composition+'\n\n'+(plan?plan+'\n\n':'')+t.slice(g)}
  return t};
 const _r=SB.repair;SB.repair=function(){let t=_r.apply(this,arguments);if(!t)return t;const {id}=formNow();const blk=SermonForms.promptBlock(id);if(!blk)return t;
  const at=t.indexOf('# 지킬 것');const add=`# 설교 형식 · ${blk.form.short} (이 흐름을 유지하며 보완)\n${blk.form.logic}\n${blk.form.write.map(x=>'- '+x).join('\n')}\n- 중심 문장: ${blk.centerRule}\n\n`;
  return at>=0?t.slice(0,at)+add+t.slice(at):t+'\n\n'+add};
})();
