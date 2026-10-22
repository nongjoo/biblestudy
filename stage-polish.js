'use strict';
/* v65 · 단계 정리
   - 연구: 겹치는 단추를 숨기고, 노트 관리 단추는 한곳에 접어 둔다. '이어서 하기'로 다음 할 일을 안내한다.
   - 설계: 흐름 보드에서 다시 가져오기 · 설계 준비 상태(원고로 가기 전 확인) · 외부 AI 설계는 선택 사항으로 접는다.
   - 원고: 옛 편집창 가져오기 단추를 숨긴다. */
(()=>{
 const get=id=>document.getElementById(id),W=delegationWorkflow,R=()=>window.researchWorkspaceApp,F=()=>window.ResearchFlow;
 const hide=(...ids)=>ids.forEach(id=>{const e=get(id);if(e){e.hidden=true;e.dataset.v65Hidden='1'}});
 // ── 연구 · 흐름 정리: 흐름 보드가 대신하는 단추
 hide('openDraftBinMain','openFlowStudio','makeOutline','useSelection');
 get('rw-flow')?.querySelectorAll('.field-expand').forEach(b=>b.hidden=true);
 // ── 연구 · 준비 개요: 카드의 중복 단추를 숨기고 '이어서 하기'
 get('rw-overview')?.querySelectorAll('.rw-summary [data-research-view]').forEach(b=>b.hidden=true);
 const heroSecond=get('rw-overview')?.querySelector('.rw-hero .rw-actions [data-research-view="notes"]');
 function nextStep(){const ws=R();const imp=(typeof extras!=='undefined'&&extras.sermonImportant?.[noteTarget()])||[],dr=(typeof extras!=='undefined'&&extras.sermonDrafts?.[noteTarget()])||[];const notesText=['observation','interpretation','application'].map(id=>get(id)?.value||'').join('').trim();const b=F()?.board;const a=W.anchor;
  if(a.center&&a.points.length>=3&&get('dwManuscript').value.trim())return {label:'원고 이어 쓰기',go:()=>W.show('manuscript')};
  if(a.center&&a.points.length>=3)return {label:'설계 이어 하기',go:()=>W.show('design')};
  if(b&&b.moves.filter(m=>m.title).length>=3)return {label:'흐름 보드에서 설계 만들기',go:()=>ws.show('flow')};
  if(dr.length||imp.length)return {label:'흐름 정리로',go:()=>ws.show('flow')};
  if(notesText)return {label:'모은 자료 고르기 · 연구 노트',go:()=>{ws.show('notes');window.researchPipeline?.open('collect')}};
  return {label:'주제와 말씀 찾기',go:()=>ws.show('search')}}
 if(heroSecond){heroSecond.removeAttribute('data-research-view');heroSecond.id='rwResume';heroSecond.classList.add('primary');const paint=()=>{heroSecond.textContent='이어서 하기 · '+nextStep().label+' →'};heroSecond.onclick=e=>{e.stopPropagation();nextStep().go()};paint();document.addEventListener('sermon-work-changed',paint);document.addEventListener('click',e=>{if(e.target.closest('#rw-tab-overview'))setTimeout(paint,0)},true);heroSecond.previousElementSibling?.classList.remove('primary')}
 // '설계로 이어가기'는 흐름 보드를 거쳐 간다.
 const rwContinue=get('rwContinue');if(rwContinue){rwContinue.textContent='흐름 정리 · 설계로 →';rwContinue.onclick=()=>{const b=F()?.board;if(b&&b.passage&&b.moves.filter(m=>m.title).length>=3)F().toDesign();else{R().show('flow');toast('흐름 보드에서 본문 범위와 움직임(대지)을 세운 뒤 설계로 넘어갑니다.')}}}
 // ── 연구 노트: 노트 관리 단추를 한곳에 접어 둔다
 const admin=['openNoteForPassage','exportNote','allNotes','deleteCurrentNote','backup','restore'].map(get).filter(Boolean);
 if(admin.length){const d=document.createElement('details');d.className='rw-secondary rw-admin';d.innerHTML='<summary>노트 관리 · 내려받기 · 백업</summary><div class="rw-admin-row"></div>';const row=d.querySelector('div');admin.forEach(b=>row.append(b));const notesPage=get('rw-notes');(notesPage.querySelector('.rw-next')||notesPage.lastElementChild).before(d)}
 // ── 설계: 흐름 보드에서 다시 가져오기 · 겹치는 단추 숨기기
 hide('dwUseSelectedPassage','dwUseFocus');
 const passageLabel=get('dwPassage')?.closest('label');
 if(passageLabel){const b=document.createElement('button');b.id='dwFromFlow';b.type='button';b.textContent='연구의 흐름 보드에서 다시 가져오기';b.onclick=()=>F()?F().toDesign():R()?.toDesign();passageLabel.before(b)}
 // 외부 AI 설계는 선택 사항으로 접는다(흐름 보드가 기본 경로).
 const aiCard=get('dwDesignPrompt')?.closest('.dw-card');
 // v66 · 설계는 흐름 보드가 채우므로, 원고 단계의 '외부 AI로 보내기'와 겹치던 설계용 외부 AI 지시문은 숨긴다.
 if(aiCard){aiCard.hidden=true;aiCard.dataset.v65Hidden='1'}
 // 설계 준비 상태
 const ready=document.createElement('section');ready.id='dwReady';ready.className='dw-card dw-ready';ready.innerHTML='<h2>원고로 가기 전 확인</h2><ul id="dwReadyList"></ul><button id="dwReadyGo" class="primary" type="button">다음 · 원고 쓰기 →</button>';
 get('dw-design')?.querySelector('.dw-heading')?.after(ready);
 const checks=()=>{const a=W.anchor;const pts=a.points.filter(p=>p.title);return [
  ['본문 범위',!!a.passage,'dwPassage'],['본문 범위 확인 체크',get('dwPassageConfirmed').checked,'dwPassageConfirmed'],['중심 문장',!!a.center,'dwCenter'],['청중의 상황',!!a.audience,'dwAudience'],
  [`대지 3~4개 (지금 ${pts.length}개)`,pts.length>=3&&pts.length<=4,'dwPoint0Title'],['모든 대지의 근거 절',pts.length>=3&&pts.every(p=>p.reference),pts.findIndex(p=>!p.reference)>=0?'dwPoint'+pts.findIndex(p=>!p.reference)+'Reference':'dwPoint0Reference'],
  ['적용 1~3개',a.applications.length>=1&&a.applications.length<=3,'dwApplications'],['마음의 흐름 (제작의 분위기)',!!a.emotion,'dwEmotion']]};
 function paintReady(){const list=get('dwReadyList');if(!list)return;const c=checks();list.replaceChildren(...c.map(([label,ok,id])=>{const li=document.createElement('li');li.className=ok?'ok':'todo';const s=document.createElement('span');s.textContent=(ok?'✓ ':'○ ')+label;li.append(s);if(!ok){const b=document.createElement('button');b.type='button';b.textContent=/근거 절/.test(label)?'본문에서 찾기':/대지/.test(label)&&!W.anchor.points.length?'연구에서 가져오기':'채우기';b.onclick=async()=>{if(/근거 절/.test(label)&&W.anchor.passage){await suggestRefs();return}if(!W.anchor.points.length&&/대지|적용|중심|청중|흐름|본문 범위$/.test(label)&&F()){const n=await F().seedDesign();if(n){get('dwDesignStatus').textContent=`연구의 흐름 보드에서 ${n}칸을 채웠습니다. 보고 고쳐 주세요.`;paintReady();return}}const f=get(id);for(let e=f;e;e=e.parentElement)if(e.tagName==='DETAILS')e.open=true;f.scrollIntoView({block:'center',behavior:'smooth'});f.focus()};li.append(b)}return li}));const missing=c.filter(x=>!x[1]).length;get('dwReadyGo').textContent=missing?`다음 · 원고 쓰기 → (확인 ${missing}개 남음)`:'다음 · 원고 쓰기 →'}
 get('dwReadyGo').onclick=()=>W.show('manuscript');
 document.addEventListener('input',e=>{if(e.target.closest?.('#dw-design'))paintReady()});document.addEventListener('change',e=>{if(e.target.closest?.('#dw-design'))paintReady()});
 document.addEventListener('sermon-stage-changed',e=>{if(e.detail==='design')paintReady()});document.addEventListener('sermon-work-changed',paintReady);paintReady();
 // ── 원고: 옛 편집창 가져오기 숨김
 hide('dwImportLegacy');
 // 연구 노트 → 설계로 가는 옛 단추들은 흐름 보드를 거치게 한다.
 const ws=R();if(ws){const old=ws.toDesign;ws.toDesign=function(){const b=F()?.board;if(b&&b.passage&&b.moves.filter(m=>m.title).length>=3)return F().toDesign();return old.apply(this,arguments)}}
 // v66 · 근거 절 찾기: 대지 제목·여는 문장의 낱말이 가장 많이 겹치는 본문 절을 제안한다.
 async function suggestRefs(){const a=W.anchor;if(!a.passage){get('dwPassage').focus();return}
  let rows=[];try{rows=await AnchorPassage.read(a.passage,get('dwEdition')?.value||'kor')}catch(e){toast('본문 범위를 확인해 주세요: '+e.message);get('dwPassage').focus();return}
  const stems=t=>[...new Set(String(t||'').split(/[^가-힣A-Za-z0-9]+/).filter(w=>w.length>=2).map(w=>w.slice(0,2)).filter(w=>!/^(우리|그리|하나|이것|그것|무엇|오늘|사람|있습|합니|입니|것은|에서|으로)$/.test(w)))];
  const patch={},used=new Set(a.points.map(p=>p.reference).filter(Boolean));let n=0;
  a.points.forEach((p,i)=>{if(p.reference||!p.title)return;const ws=stems(p.title+' '+p.opening);let best=null,score=-1;rows.forEach((r,j)=>{const sc=ws.filter(w=>r.text.includes(w)).length-(used.has(r.label)?0.5:0)+(rows.length>1?(1-Math.abs(j/(rows.length-1)-i/Math.max(1,a.points.length-1)))*0.3:0);if(sc>score){score=sc;best=r}});if(best){patch[`dwPoint${i}Reference`]=best.label;used.add(best.label);n++}});
  if(!n){toast('근거 절을 비워 둔 대지가 없습니다.');return}
  const flags=Object.fromEntries(['dwPassageConfirmed','dwSingle','dwQuotesChecked','dwActionsChecked','dwUnityChecked','dwLinkChecked'].map(id=>[id,get(id).checked]));
  try{W.applyCorrection(patch,flags)}catch(e){toast(e.message);return}
  const msg=`본문에서 근거 절 ${n}개를 찾아 넣었습니다. 대지와 맞는지 확인해 주세요.`;get('dwDesignStatus').textContent=msg;toast(msg);paintReady()}
 // v66 · 설계에 처음 들어올 때 비어 있으면 연구의 흐름 보드로 빈 칸을 채운다.
 document.addEventListener('sermon-stage-changed',async e=>{if(e.detail!=='design'||!F())return;const a=W.anchor;if(a.passage&&a.center&&a.points.length)return;const n=await F().seedDesign();if(n){const msg=`연구의 흐름 보드에서 ${n}칸을 설계의 빈 칸에 채웠습니다. 보고 고쳐 주세요.`;get('dwDesignStatus').textContent=msg;toast(msg);paintReady()}});
 // v67 · 설계에서 본문 범위를 바꾸면, 새 본문 밖에 있는 대지의 근거 절을 새 본문에서 다시 찾는다.
 let passTimer=0;
 get('dwPassage')?.addEventListener('input',()=>{clearTimeout(passTimer);passTimer=setTimeout(async()=>{const a=W.anchor;if(!a.passage||!window.AnchorPassage)return;let rows;try{rows=await AnchorPassage.read(a.passage,get('dwEdition')?.value||'kor')}catch(e){return}if(!rows.length)return;
  const inside=ref=>{const m=String(ref||'').match(/(\d+)\s*[:장]\s*(\d+)/);if(!m)return false;const book=(String(ref).match(/^(\D+?)\s*\d/)||[])[1]?.trim();return rows.some(r=>r.label===ref||(r.label.startsWith(book||'#')&&r.label.endsWith(` ${m[1]}:${m[2]}`)))};
  const patch={};a.points.forEach((p,i)=>{if(p.reference&&!inside(p.reference))patch[`dwPoint${i}Reference`]=''});
  if(!Object.keys(patch).length)return;
  const flags=Object.fromEntries(['dwPassageConfirmed','dwSingle','dwQuotesChecked','dwActionsChecked','dwUnityChecked','dwLinkChecked'].map(id=>[id,get(id).checked]));
  try{W.applyCorrection(patch,flags)}catch(e){return}
  await suggestRefs();const msg=`본문 범위가 바뀌어 대지 ${Object.keys(patch).length}개의 근거 절을 새 본문 ${a.passage}에서 다시 찾았습니다. 대지와 맞는지 확인해 주세요.`;get('dwDesignStatus').textContent=msg;toast(msg)},900)});
})();
