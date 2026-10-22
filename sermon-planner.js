'use strict';
// Browser-only source selection and argument planning. No inference API or model.
const sermonPlanner=(()=>{
 let packet=null,cards=[],previousDraft=null;
 const labels={observation:'관찰',interpretation:'해석·원어',application:'적용'};
 sermonStructures.grace={name:'은혜와 응답형 · 필요 → 은혜 → 변화',hint:'브라이언 채플의 인간의 필요와 본문의 목적에 관한 논의를 참고했습니다. 고난을 개인의 죄로 단정하지 않습니다.',steps:['공유하는 구체적인 필요','익숙한 해법의 한계','본문에서 발견하는 하나님의 공급','은혜가 바꾸는 관점과 동기','개인과 공동체의 응답']};
 sermonStructures.discovery={name:'발견의 흐름형 · 긴장 → 전환 → 새로운 삶',hint:'유진 로우리의 설교 플롯에 대한 토머스 롱의 해설을 참고했습니다. 모든 본문을 같은 이야기로 만들지는 않습니다.',steps:['청중의 균형을 흔드는 질문','긴장이 풀리지 않는 이유','본문에서 발견하는 전환의 단서','달라진 관점으로 다시 보는 삶','이번 주를 향한 초대']};
 for(const id of ['grace','discovery'])$('sermonStructure').add(new Option(sermonStructures[id].name,id));

 $('sermonFocus').placeholder='본문이 말하는 중심 주장이나 함께 풀고 싶은 질문을 적으세요.';
 const info=document.createElement('details');info.className='sermon-methods';info.innerHTML=`<summary>설교 설계의 기준과 참고 자료</summary><p>한 가지 중심 주장을 세우고, 각 단락이 그 주장에 기여하게 합니다. 청중의 질문과 본문의 근거를 연결하고, 설명에서 전환·응답·실천으로 나아갑니다. 아래 설교학 논의를 참고한 자체 설계 지침이며, 특정 설교자의 원고나 문체를 복제하지 않습니다.</p><ul><li><a href="https://www.nelson.edu/thoughthub/bible-and-theology/the-big-idea-lessons-from-haddon-robinson/" target="_blank" rel="noopener">하돈 로빈슨의 중심 사상 · Nelson University</a> — 형식이 달라도 하나의 본문 중심 메시지로 모읍니다.</li><li><a href="https://www.preaching.com/articles/the-fallen-condition-focus-and-the-purpose-of-the-sermon/" target="_blank" rel="noopener">브라이언 채플 · 설교의 목적과 인간의 필요</a> — 본문이 다루는 필요를 발견하고 삶의 응답까지 연결합니다.</li><li><a href="https://www.workingpreacher.org/theology-and-interpretation/out-of-the-loop-the-changing-practice-of-preachingpart-one-the-homiletical-plot" target="_blank" rel="noopener">토머스 롱의 로우리 설교 플롯 해설 · Luther Seminary</a> — 긴장, 발견, 전환이 청중의 이해를 움직이게 합니다.</li></ul><p>원어 뜻은 선택한 자료의 범위에서 사용하며, 어원이나 사전 뜻 하나로 설교 전체를 단정하지 않습니다. 본문 해석은 문맥과 주석을 함께 확인하세요.</p></details>`;
 $('makeOutline').before(info);

 document.body.insertAdjacentHTML('beforeend',`<dialog id="sermonSourceDialog"><div class="dialog-head"><h2>자료에서 하나의 설교로</h2><button id="closeSermonSources" aria-label="닫기">✕</button></div><div class="dialog-body"><p>API·계정·모델 다운로드 없이 사용합니다. 연구 자료를 선택하고 논증 작업대에서 설교의 중심 주장과 흐름을 구성하세요. 입력 내용은 외부 AI로 전송하지 않습니다.</p><p id="sermonSourceRef" class="tag"></p><div class="action-row"><button id="selectAllSources">전체 선택</button><button id="selectCurrentSources">지금 열린 노트의 자료 선택</button><button id="clearSermonSources">선택 해제</button><button id="deselectDuplicates">중복 자료 선택 해제</button><button id="removeSelectedSources">선택 자료를 이번 설교에서 빼기</button><button id="restoreRemovedSources" hidden>뺀 자료 되돌리기</button></div><div id="sermonSourceList"></div><p id="sermonSourceCount" role="status"></p><div id="sermonPlanActions" class="action-row"><button id="manualSermonEdit">기존 원고·빈 원고 열기</button></div></div></dialog>`);
 const undo=document.createElement('button');undo.id='restoreSermonDraft';undo.textContent='직전 초안 되돌리기';undo.hidden=true;$('outlineDownload').after(undo);
 function captureDraft(){return {text:$('outlineText').value,target:outlineTarget,snapshot:studioSnapshot,focus:$('creativeFocus')?.value||'',points:$('creativePoints')?.value||''}}
 undo.onclick=()=>{if(!previousDraft)return;const now=captureDraft(),d=previousDraft;$('outlineText').value=d.text;outlineTarget=d.target;studioSnapshot=d.snapshot;if($('creativeFocus'))$('creativeFocus').value=d.focus;if($('creativePoints'))$('creativePoints').value=d.points;previousDraft=now;toast('직전 초안으로 되돌렸습니다.')};
 function splitNote(text){const clean=text.split(/\[설교 틀\]|\[설교 설계\]/)[0].trim();const parts=[];for(const p of clean.split(/\n\s*\n/)){for(let i=0;i<p.length;i+=1200){if(p.slice(i,i+1200).trim()&&!/^\[선택 인용 출처\]/.test(p)&&!/^\s*(?:OSHB|SR \/|CC BY|https?:)/.test(p))parts.push(p.slice(i,i+1200).trim())}}return parts}
 function binDraftCardText(t){return String(t||'').split('\n').filter(ln=>!/^\[(설교 뼈대 제안|중심 메시지 제안)[^\]]*\]$/.test(ln.trim())).join('\n').trim()}
 function appendImportantCards(){
   try{
     const imp=(typeof extras!=='undefined'&&extras.sermonImportant)||{};
     for(const k of Object.keys(imp)){
       for(const d of (Array.isArray(imp[k])?imp[k]:[])){
         if(!d||typeof d.text!=='string'||!d.text.trim())continue;
         cards.push({id:'I'+(cards.length+1),noteReference:k,reference:k,field:(d.field==='application'||d.field==='observation')?d.field:'interpretation',text:d.text.slice(0,1500)});
       }
     }
   }catch(e){}
 }
 function appendBinDraftCards(){
   try{
     const bin=(typeof extras!=='undefined'&&extras.sermonDrafts)||{};
     for(const k of Object.keys(bin)){
       for(const d of (Array.isArray(bin[k])?bin[k]:[])){
         if(!d||d.target==='outline')continue;
         const t=binDraftCardText(d.text);
         if(!t)continue;
         const f=d.target==='application'?'application':'interpretation';
         cards.push({id:'B'+(cards.length+1),noteReference:k,reference:k,field:f,text:t.slice(0,1200)});
       }
     }
   }catch(e){}
 }
 function collect(){removed=[];$('restoreRemovedSources').hidden=true;cards=[];const entries=Object.entries(notes).sort(([a],[b])=>a===packet.reference?-1:b===packet.reference?1:a.localeCompare(b));for(const [reference,n]of entries){for(const field of fields){for(const text of splitNote(n[field]||'')){cards.push({id:'N'+(cards.length+1),noteReference:reference,reference:proseSourceReference(text,reference),field,text})}}if(n.flow&&typeof n.flow==='object'){for(const pair of [['청중',n.flow.audience],['핵심 질문',n.flow.question],['삶의 장면',n.flow.scene]]){const tt=String(pair[1]||'').trim();if(!tt)continue;for(const part of splitNote('[흐름 설계 · '+pair[0]+']\n'+tt)){const label=/^\[흐름 설계/.test(part)?part:'[흐름 설계 · '+pair[0]+']\n'+part;cards.push({id:'N'+(cards.length+1),noteReference:reference,reference:reference,field:'observation',text:label})}}}}appendBinDraftCards();appendImportantCards();renderCards()}
 function renderCards(checkedIds=null){const container=$('sermonSourceList');container.replaceChildren();for(const card of cards){const row=document.createElement('label');row.className='sermon-source-card';const box=document.createElement('input');box.type='checkbox';box.value=card.id;box.checked=checkedIds?checkedIds.has(card.id):((card.noteReference||card.reference)===packet.reference||String(card.id).indexOf('B')===0||String(card.id).indexOf('I')===0);box.onchange=count;const detail=document.createElement('span');const title=document.createElement('strong');title.textContent=(()=>{try{return (typeof noteDisplayName==='function'?noteDisplayName(card.noteReference||card.reference):humanRef(card.reference))}catch(e){try{return humanRef(card.reference)}catch(e2){return card.reference}}})()+' · '+labels[card.field]+(String(card.id).indexOf('I')===0?' · 중요':'');const body=document.createElement('span');body.textContent=card.text;detail.append(title,body);row.append(box,detail);container.append(row)}count()}
 function selected(){const ids=new Set([...document.querySelectorAll('#sermonSourceList input:checked')].map(el=>el.value));return cards.filter(x=>ids.has(x.id))}

 function count(){const s=selected();$('sermonSourceCount').textContent=s.length+' / '+cards.length+'개 연구 자료 선택 · 열린 노트: '+(()=>{try{return (typeof noteDisplayName==='function'?noteDisplayName(packet.reference):humanRef(packet.reference))}catch(e){try{return humanRef(packet.reference)}catch(e2){return packet.reference}}})()+' · 주 본문 문맥은 함께 표시됩니다.'}
 let removed=[];
 $('removeSelectedSources').onclick=()=>{const chosen=selected();if(!chosen.length){toast('뺄 자료를 먼저 선택하세요.');return}removed.push(...chosen);cards=cards.filter(x=>!chosen.includes(x));renderCards(new Set());$('restoreRemovedSources').hidden=false;toast('이번 설교의 자료 목록에서 뺐습니다. 저장한 연구 노트는 유지됩니다.')};
 $('restoreRemovedSources').onclick=()=>{const checked=new Set(selected().map(s=>s.id));cards.push(...removed);removed=[];renderCards(checked);$('restoreRemovedSources').hidden=true;toast('뺀 자료를 목록으로 되돌렸습니다. 사용할 자료를 선택하세요.')};
 $('closeSermonSources').onclick=()=>$('sermonSourceDialog').close();
 $('selectAllSources').onclick=()=>{document.querySelectorAll('#sermonSourceList input').forEach(el=>el.checked=true);count()};
 $('selectCurrentSources').onclick=()=>{document.querySelectorAll('#sermonSourceList input').forEach(el=>{const card=cards.find(c=>c.id===el.value);if((card.noteReference||card.reference)===packet.reference)el.checked=true});count();toast('지금 열린 노트의 자료를 추가 선택했습니다. 다른 선택은 유지됩니다.')};
 $('clearSermonSources').onclick=()=>{document.querySelectorAll('#sermonSourceList input').forEach(el=>el.checked=false);count()};
  function normSourceText(t){try{return String(t||'').normalize('NFKC').toLowerCase().replace(/[\s\p{P}]/gu,'')}catch(e){return String(t||'').replace(/\s/g,'')}}
  $('deselectDuplicates').onclick=()=>{
    const seen=new Map();let off=0,any=false;
    document.querySelectorAll('#sermonSourceList input').forEach(el=>{
      const card=cards.find(c=>c.id===el.value);if(!card||!el.checked)return;
      any=true;
      const k=normSourceText(card.text);
      if(!k)return;
      if(seen.has(k)){el.checked=false;off++}else seen.set(k,card.id);
    });
    count();
    toast(!any?'선택된 자료가 없습니다. 먼저 자료를 선택하세요.':off?off+'개 중복 자료의 선택을 해제했습니다. 같은 내용은 첫 번째만 남겼습니다.':'중복된 내용의 자료가 없습니다.');
  };
 $('makeOutline').onclick=()=>{saveNote();const focus=$('sermonFocus').value.trim();packet={reference:noteTarget(),referenceLabel:humanRef(noteTarget()),version,focus,audience:$('sermonAudience').value.trim()||'공동체의 성도들',question:$('sermonQuestion').value.trim(),scene:$('sermonScene').value.trim(),minutes:+$('sermonMinutes').value,structure:$('sermonStructure').value,tone:$('sermonTone')?.value||'exposition'};$('sermonSourceRef').textContent=packet.referenceLabel+' · '+sermonStructures[packet.structure].name;collect();$('sermonSourceDialog').showModal()};
 $('manualSermonEdit').onclick=()=>{const created=!$('outlineText').value.trim();if(!$('outlineText').value.trim()){outlineTarget=packet.reference;studioSnapshot={...packet,structure:sermonStructures[packet.structure].name};$('outlineText').value='[설교 틀]\n본문: '+packet.referenceLabel+'\n중심 문장: '+packet.focus+'\n청중: '+packet.audience+'\n핵심 질문: '+packet.question+'\n\n여기에 설교 원고를 작성하세요.'}$('sermonSourceDialog').close();$('outlineDialog').showModal();if(created)document.dispatchEvent(new Event('sermon-draft-applied'))};
 async function context(p){try{const [book,ch,verse]=p.reference.split('.'),all=await data(p.version+'/'+book),chapter=all[ch]||{};return {id:'P0',reference:p.reference,field:'본문과 인접 문맥',text:Object.entries(chapter).filter(([n])=>Math.abs(+n-(+verse))<=2).map(([n,t])=>humanRef(book+'.'+ch+'.'+n)+' '+t).join('\n')}}catch(e){toast('본문 자료를 불러오지 못했습니다. 연결을 확인하고 다시 시도해 주세요.');throw e}}
 const baseCreativeBrief=extractCreativeBrief;
 extractCreativeBrief=function(){const result=baseCreativeBrief(),text=$('outlineText').value;const points=[...text.matchAll(/^핵심 대지 \d+: (.+)$/gm)].map(m=>m[1]);if(!$('creativePoints').value.trim()&&points.length===3)result.points=points;const applications=[...text.matchAll(/^삶으로 연결: (.+)$/gm)].map(m=>m[1]);if(applications.length)result.application=applications.at(-1);return result};

 document.addEventListener('study-reset',()=>{packet=null;cards=[];removed=[];$('restoreRemovedSources').hidden=true;previousDraft=null;undo.hidden=true});
 return {getInputs:async()=>{const p={...packet,tone:$('sermonTone')?.value||packet.tone};const sources=[await context(p),...selected().map(s=>({...s}))];p.sourceSignature=JSON.stringify([p.version,p.focus,p.question,p.audience,p.scene,p.minutes,sources.map(s=>[s.id,s.reference,s.field,s.text])]);return {packet:p,sources}},applyGuided:(text,p)=>{previousDraft=$('outlineText').value.trim()?captureDraft():null;undo.hidden=!previousDraft;outlineTarget=p.reference;studioSnapshot={...p,structure:sermonStructures[p.structure].name};$('outlineText').value=text;if($('creativeFocus'))$('creativeFocus').value='';if($('creativePoints'))$('creativePoints').value='';$('sermonSourceDialog').close();$('outlineDialog').showModal();document.dispatchEvent(new Event('sermon-draft-applied'))}};
})();
