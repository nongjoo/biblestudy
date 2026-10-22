'use strict';
/* v68 · 설교 노트 번호 체계와 지난 설교 보관함
   - 노트 번호 = 연도-순번(예: 2026-013). 설교 일자와 함께 보입니다: "노트 2026-013 · 10월 11일 주일"
     연도별로 1번부터 다시 셉니다. 한 해에 몇 편을 준비했는지, 몇 번째 설교인지 번호만 보고 알 수 있습니다.
   - 같은 구절로 새 설교를 시작하면 이전 노트를 '지난 설교 보관함'으로 옮기고 새 번호로 시작합니다(이어 쓰기도 선택 가능).
   - 기존 노트(0001, 0002…)에는 만든 해와 기존 순서대로 번호를 한 번 매겨 둡니다. */
window.NoteSystem=(()=>{
 const $=id=>document.getElementById(id);
 const pad=n=>String(n).padStart(3,'0');
 const iso=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)};
 function nextSunday(){const d=new Date();d.setDate(d.getDate()+((7-d.getDay())%7));return iso(d)}
 const archive=()=>{extras.noteArchive||=[];return extras.noteArchive};
 const yearOf=n=>String(n?.sermonDate||n?.created||n?.updated||iso(new Date())).slice(0,4);
 function usedSeqs(y){const out=[];for(const n of Object.values(notes))if(n?.code?.startsWith(y+'-'))out.push(+n.code.slice(5));for(const e of archive())if(e.note?.code?.startsWith(y+'-'))out.push(+e.note.code.slice(5));return out}
 const nextCode=y=>`${y}-${pad(Math.max(0,...usedSeqs(y))+1)}`;
 function ensureCodes(){let changed=false;const list=Object.entries(notes).filter(([,n])=>n&&!n.code).sort((a,b)=>(a[1].num||0)-(b[1].num||0));for(const [,n] of list){if(!n.created)n.created=n.updated||new Date().toISOString();n.code=nextCode(yearOf(n));changed=true}if(changed)persist();return changed}
 function fmtDate(d){const m=String(d||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return '';const dt=new Date(+m[1],+m[2]-1,+m[3]);return `${+m[2]}월 ${+m[3]}일${dt.getDay()===0?' 주일':''}`}
 const fieldsOf=n=>(typeof fields!=='undefined'?fields:['observation','interpretation','application']).some(f=>String(n?.[f]||'').trim());
 const hasContent=k=>{const n=notes[k];return !!n&&(fieldsOf(n)||!!n.workspace||!!extras.sermonFocus?.[k]||!!(extras.sermonDrafts?.[k]||[]).length||!!(extras.sermonImportant?.[k]||[]).length)};
 // 표시: "노트 2026-013 · 10월 11일 주일"
 noteNumLabel=function(k){const n=typeof notes!=='undefined'?notes[k]:null;if(!n)return '노트';if(!n.code)ensureCodes();return '노트 '+(n.code||'')+(n.sermonDate?' · '+fmtDate(n.sermonDate):'')};
 // ── 지난 설교 보관함 ──
 const BUCKETS=['sermonFocus','sermonDrafts','sermonImportant','sermonFlow'];
 function archiveNote(k,reason='새 설교 시작'){if(!notes[k])return null;ensureCodes();const e={id:'A'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),ref:k,archivedAt:new Date().toISOString(),reason,note:JSON.parse(JSON.stringify(notes[k])),extras:{}};for(const b of BUCKETS)if(extras[b]?.[k]!==undefined){e.extras[b]=JSON.parse(JSON.stringify(extras[b][k]));delete extras[b][k]}archive().unshift(e);delete notes[k];if(!persist()||!storeExtras()){notes[k]=e.note;for(const [b,v] of Object.entries(e.extras)){extras[b]||={};extras[b][k]=v}archive().shift();persist();storeExtras();throw Error('저장 공간이 부족해 이전 노트를 보관하지 못했습니다. 전체 백업 후 다시 시도하세요.')}return e}
 function restore(id){const list=archive(),i=list.findIndex(x=>x.id===id);if(i<0)return;
  // 지금 화면의 노트를 먼저 저장해 두고(보관함으로 옮길 내용), 그다음에 자리를 바꾼다.
  try{if(typeof saveNote==='function')saveNote()}catch(err){}
  const e=list[i],k=e.ref;if(hasContent(k))archiveNote(k,'보관함에서 다른 노트를 다시 열면서 보관');list.splice(list.findIndex(x=>x.id===id),1);
  const put=()=>{notes[k]=JSON.parse(JSON.stringify(e.note));for(const b of BUCKETS){if(e.extras?.[b]!==undefined){extras[b]||={};extras[b][k]=JSON.parse(JSON.stringify(e.extras[b]))}else if(extras[b])delete extras[b][k]}persist();storeExtras()};
  put();
  try{if(typeof openResearchNote==='function')openResearchNote(k)}catch(err){}
  // 노트를 여는 과정의 자동 저장이 화면의 이전 내용으로 덮어쓰지 않도록 한 번 더 넣고 화면을 다시 채운다.
  put();
  try{if(typeof loadNote==='function')loadNote();const [bb,cc,vv]=k.split('.');if(typeof navigate==='function')navigate(bb,+cc,+vv);window.researchWorkspaceApp?.loaded(k,notes[k],true);window.ResearchFlow?.load()}catch(err){}
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());toast(`${noteNumLabel(k)} 노트를 다시 열었습니다.`)}
 function removeArchived(id){const list=archive(),i=list.findIndex(x=>x.id===id);if(i<0)return;if(!confirm('보관한 이 노트를 영구히 삭제할까요? 되돌릴 수 없습니다. 필요하면 먼저 [내려받기]를 누르세요.'))return;list.splice(i,1);storeExtras();paintArchive()}
 function downloadArchived(id){const e=archive().find(x=>x.id===id);if(!e)return;download(`말씀연구실-보관노트-${e.note.code||e.ref}.json`,JSON.stringify(e,null,2),'application/json')}
 function paintArchive(){const dlg=$('notesDialog');if(!dlg)return;let box=$('noteArchiveBox');if(!box){box=document.createElement('section');box.id='noteArchiveBox';box.className='note-archive';($('notesList')?.parentElement||dlg).append(box)}const list=archive();box.replaceChildren();const h=document.createElement('h3');h.textContent=`지난 설교 보관함 · ${list.length}개`;const p=document.createElement('p');p.className='micro';p.textContent='같은 구절로 새 설교를 시작할 때 이전 노트가 여기에 보관됩니다. [다시 열기]를 누르면 현재 노트와 자리를 바꿉니다.';box.append(h,p);
  for(const e of list){const row=document.createElement('div');row.className='archive-row';const t=document.createElement('div');let r='';try{r=humanRef(e.ref)}catch(x){r=e.ref}const n=e.note||{};t.innerHTML='';const s=document.createElement('strong');s.textContent=`노트 ${n.code||''}${n.sermonDate?' · '+fmtDate(n.sermonDate):''} · ${r}`;const m=document.createElement('small');m.textContent=((n.workspace?.research?.situation||n.title||e.extras?.sermonFocus||'').slice(0,80))+` · 보관 ${String(e.archivedAt).slice(0,10)}`;t.append(s,m);const acts=document.createElement('div');for(const [label,fn] of [['다시 열기',()=>restore(e.id)],['내려받기',()=>downloadArchived(e.id)],['영구 삭제',()=>removeArchived(e.id)]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;acts.append(b)}row.append(t,acts);box.append(row)}if(!list.length){const m=document.createElement('p');m.className='micro';m.textContent='보관한 노트가 없습니다.';box.append(m)}}
 if(typeof listNotes==='function'){const old=listNotes;listNotes=function(){ensureCodes();const r=old.apply(this,arguments);paintArchive();return r};const b=$('allNotes');if(b)b.onclick=listNotes}
 // ── 새 설교 시작 창: 설교 일자 · 이전 노트 처리 ──
 const fs=$('newSermonFocus')?.closest('fieldset');
 if(fs){const lab=document.createElement('label');lab.innerHTML='설교 일자<input id="newSermonDate" type="date">';$('newSermonFocus').closest('label').before(lab);
  const ex=document.createElement('div');ex.id='newSermonExisting';ex.className='ns-existing';ex.hidden=true;ex.innerHTML='<p id="newSermonExistingText"></p><div class="ns-options" role="radiogroup" aria-label="이전 노트 처리"><label class="ns-option"><input type="radio" name="nsMode" value="new" checked><span><b>새 노트로 시작</b><small>이전 노트는 지난 설교 보관함에 그대로 보관합니다</small></span></label><label class="ns-option"><input type="radio" name="nsMode" value="continue"><span><b>이전 노트에 이어서 쓰기</b><small>이전 노트의 자료·설계·원고를 그대로 엽니다</small></span></label></div>';$('newSermonFocus').closest('label').before(ex);
  $('newSermonFocus').placeholder='이번 설교의 중심 문장 (선택 · 나중에 흐름 정리에서 정해도 됩니다)'}
 const chosenKey=()=>{const b=$('newPassageBook')?.value,c=$('newPassageChapter')?.value,v=$('newPassageVerse')?.value;return b&&c&&v?`${b}.${c}.${v}`:(typeof key==='function'?key():'')};
 const mode=()=>document.querySelector('input[name="nsMode"]:checked')?.value||'new';
 function previewLabel(k){k=k||chosenKey();const d=$('newSermonDate')?.value||nextSunday(),n=notes[k],cont=n&&hasContent(k)&&mode()==='continue';return '노트 '+(cont&&n.code?n.code:nextCode(d.slice(0,4)))+' · '+fmtDate(d)}
 function paintDialog(){const k=chosenKey(),n=notes[k],has=!!n&&hasContent(k);const ex=$('newSermonExisting');if(ex){ex.hidden=!has;if(has){if(!n.code)ensureCodes();let r='';try{r=humanRef(k)}catch(e){}$('newSermonExistingText').textContent=`${r}에는 이전 설교 노트(노트 ${n.code}${n.sermonDate?' · '+fmtDate(n.sermonDate):''}${n.workspace?.research?.situation?' · '+n.workspace.research.situation.slice(0,40):''})가 있습니다.`}}const p=$('newSermonNotePreview');if(p)p.textContent=previewLabel(k);const st=$('newSermonNoteStatus');if(st)st.textContent=has?(mode()==='new'?'시작하면 이전 노트를 보관하고 새 번호의 빈 노트로 시작합니다. 중심 문장·연구 자료·설계도 새로 시작합니다.':'이전 노트를 열어 이어서 씁니다.'):'선택한 구절로 새 설교 노트를 만듭니다.'}
 if($('newSermonDialog')){new MutationObserver(()=>setTimeout(paintDialog,0)).observe($('newSermonPassagePreview'),{childList:true,characterData:true,subtree:true});$('newSermonDialog').addEventListener('change',e=>{if(e.target.name==='nsMode'||e.target.id==='newSermonDate')paintDialog()});
  $('newSermon')?.addEventListener('click',()=>{if($('newSermonDate'))$('newSermonDate').value=nextSunday();const r=document.querySelector('input[name="nsMode"][value="new"]');if(r)r.checked=true;setTimeout(paintDialog,50)})}
 function beforeNew(k){if(k&&notes[k]&&hasContent(k)&&mode()==='new'){try{archiveNote(k)}catch(e){toast(e.message)}}}
 function afterNew(k){if(!k)return;const d=$('newSermonDate')?.value||nextSunday();const n=notes[k];if(n&&hasContent(k)){n.sermonDate=n.sermonDate||d;ensureCodes()}else{notes[k]={...(n||{}),observation:n?.observation||'',interpretation:n?.interpretation||'',application:n?.application||'',num:(n&&n.num)||nextNoteNumber(),created:new Date().toISOString(),updated:new Date().toISOString(),code:n?.code||nextCode(d.slice(0,4)),sermonDate:d}}persist();try{window.researchWorkspaceApp?.refresh()}catch(e){}}
 // 앱을 열 때 기존 노트에 번호를 매겨 둔다
 try{ensureCodes()}catch(e){}
 return {ensureCodes,nextCode,previewLabel,beforeNew,afterNew,archiveNote,restore,fmtDate,get archive(){return archive()}};
})();
