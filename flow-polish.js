'use strict';
/* 말씀연구실 v48 · 흐름 다듬기
   설계 화면의 선택 입력을 접고, 빈 입력에서 나오던 기술적 오류 문구를 사용자 문장으로 바꾸고, 단계 이동 단추를 또렷하게 한다. */
(function(){
 const get=id=>document.getElementById(id);
 function wrap(nodes,summary,cls){nodes=nodes.filter(Boolean);if(!nodes.length)return null;const d=document.createElement('details');d.className='dw-optional'+(cls?' '+cls:'');const s=document.createElement('summary');s.textContent=summary;d.append(s);nodes[0].before(d);nodes.forEach(n=>d.append(n));return d}
 function guard(id,test,message,statusId){const b=get(id);if(!b)return;b.addEventListener('click',e=>{const m=test();if(m){e.stopImmediatePropagation();e.preventDefault();const st=get(statusId);if(st)st.textContent=m;if(typeof toast==='function')toast(m)}},true)}
 function run(){
  // 02 설계: 대지마다 '원고 연결 문장'은 선택 사항으로 접기
  for(let i=0;i<4;i++){const o=get(`dwPoint${i}Opening`)?.closest('label'),b=get(`dwPoint${i}Bridge`)?.closest('label');const d=wrap([o,b],'원고 연결 문장 (선택)');if(d&&(get(`dwPoint${i}Opening`).value||get(`dwPoint${i}Bridge`).value))d.open=true}
  // 그림 단어는 원고 검사용 선택 항목
  const img=get('dwImages')?.closest('label');if(img){const card=img.closest('.dw-card');const h=card?.querySelector('h2');if(h)h.textContent='감정 흐름과 적용';wrap([img],'본문 그림 단어 (선택 · 원고 검사용)');const em=get('dwEmotion')?.closest('label'),ap=get('dwApplications')?.closest('label');if(card&&em&&ap){card.querySelector('details.dw-optional')?.before(em,ap)}}
  // 원어·직접 인용은 고급 항목으로 접기
  const lex=get('dwLexical');const lc=lex?.closest('.dw-card');if(lc){const h=lc.querySelector('h2');const rest=[...lc.children].filter(n=>n!==h);const d=wrap(rest,'원어·직접 인용 대조 열기 (선택 · 원고 검사의 P4·P5에 사용)');if(d&&(get('dwLexical').value||get('dwQuotes').value))d.open=true}
  // 03 원고: 다음 단계 단추를 주 단추로, 이전 버전 가져오기는 접기
  document.querySelectorAll('#dw-manuscript [data-step="production"]').forEach(b=>{b.classList.add('primary');b.textContent='다음 · 제작 작업대로'});
  const legacy=get('dwImportLegacy');if(legacy)wrap([legacy],'이전 버전(v34 이하) 편집창의 원고 가져오기');
  // 빈 입력에서의 오류 문구 정리
  guard('dwApplyAnchor',()=>get('dwAnchorImport')?.value.trim()?'':'외부 AI가 돌려준 설계 결과(JSON)를 위 칸에 먼저 붙여 넣으세요.','dwDesignStatus');
  guard('dwApplyAnchor',()=>{const v=get('dwAnchorImport')?.value.trim()||'';if(!v)return'';try{JSON.parse(v.replace(/^```(?:json)?|```$/g,''));return''}catch{return'붙여 넣은 내용이 설계 결과(JSON) 형식이 아닙니다. AI 답변 중 { 로 시작해 } 로 끝나는 부분만 넣어 주세요.'}},'dwDesignStatus');
  guard('dwOpenSource',()=>{const v=get('dwIllustrationUrl')?.value.trim()||'';if(!v)return'예화 출처 링크를 먼저 적어 주세요.';try{new URL(v);return''}catch{return'링크 형식이 아닙니다. https:// 로 시작하는 주소를 넣어 주세요.'}},'dwDesignStatus');
  guard('dwCopyRepair',()=>get('dwRepairOut')?.value?'':'먼저 [수정 지시문 만들기]를 누르세요.','dwRepairStatus');
 }
 document.addEventListener('DOMContentLoaded',run);
})();
