 'use strict';
(()=>{
 const get=id=>document.getElementById(id),W=delegationWorkflow;
 const points=Array.from({length:4},(_,i)=>['Title','Reference','Opening','Bridge'].map(k=>'dwPoint'+i+k)).flat();
 const groups={P1:['dwPassage','dwEdition','dwPassageConfirmed','dwSingle'],P2:['dwCenter','dwManuscript'],P3:[...points,'dwManuscript'],P4:['dwManuscript'],P5:['dwQuotes','dwEdition','dwOwn','dwUseOwn','dwManuscript','dwQuotesChecked'],P6:['dwIllustration','dwIllustrationUrl','dwManuscript','dwLinkChecked'],P7:['dwApplications','dwManuscript','dwActionsChecked'],P8:['dwManuscript'],P9:['dwCenter','dwQuestion','dwManuscript'],P10:[...points,'dwCenter','dwManuscript','dwUnityChecked'],P11:['dwCenter','dwQuestion',...points,'dwManuscript'],P12:['dwManuscript'],'앵커':['dwImages','dwAudience','dwEmotion']};
 const labels={dwPassage:'설교 본문 범위',dwEdition:'검사 기준 판본',dwPassageConfirmed:'위 범위를 읽고 설교 본문으로 확인했습니다',dwSingle:'한 절을 주 본문으로 명시합니다',dwCenter:'중심 문장',dwQuestion:'중심 질문',dwManuscript:'설교 원고',dwOwn:'내 판본 · 한 줄에 주소 | 절 전체',dwUseOwn:'붙여 넣은 내 판본으로 직접 인용을 검사합니다',dwQuotes:'직접 인용 · 한 줄에 주소 | 인용문',dwLexical:'원어 · 단어 | 출처 | 보조 여부',dwIllustration:'예화',dwIllustrationUrl:'예화 출처 주소',dwLinkChecked:'출처를 직접 열어 내용을 확인했습니다',dwApplications:'실천 제안 · 한 줄에 한 가지, 1~3개',dwActionsChecked:'원고 속 적용이 실제 행동으로 가능한지 확인했습니다',dwQuotesChecked:'원고의 직접 인용이 목록에 빠짐없이 있는지 확인했습니다',dwUnityChecked:'설교 전체의 의미와 논지 연결을 직접 확인했습니다',dwImages:'본문의 시각 소재 · 단어 | 출처 절',dwAudience:'청중 상황',dwEmotion:'정서의 흐름'};
 const dialog=document.createElement('dialog');dialog.id='anchorRepairDialog';dialog.setAttribute('aria-labelledby','arTitle');dialog.innerHTML='<div class="dialog-head"><h2 id="arTitle"></h2><button id="arClose" aria-label="수정 창 닫기">✕</button></div><div class="dialog-body"><p id="arEvidence"></p><p id="arGuide" class="ar-guide"></p><div class="ar-auto"><button id="arAuto" type="button">모은 자료로 자동 입력</button><button id="arAutoUndo" type="button" hidden>자동 입력 전으로 되돌리기</button><p id="arAutoInfo" role="status" style="white-space:pre-wrap"></p></div><div id="arFields"></div><p id="arStatus" role="status" aria-live="polite"></p><div class="ar-footer"><button id="arSave" class="primary">저장하고 다시 검사</button><button id="arManualPass" type="button">무시하고 통과 처리</button><button id="arCancel">닫기</button></div></div>';document.body.append(dialog);
 let revision=0,code='',busy=false,autoBefore=null;
 const close=()=>{if(!busy)dialog.close()};get('arClose').onclick=close;get('arCancel').onclick=close;dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 function open(next,fix,evidence){code=next;revision=W.revision;autoBefore=null;get('arAutoUndo').hidden=true;get('arAutoInfo').textContent='현재 노트·설계·원고에서 수정안을 만듭니다. 자동 입력은 이 창에만 반영되며, 내용을 확인한 뒤 저장하세요.';get('arTitle').textContent=fix[0]+' 수정';get('arEvidence').textContent=evidence;get('arGuide').textContent=fix[3];get('arStatus').textContent='수정 후 저장하면 현재 노트에 반영하고 다시 검사합니다.';get('arFields').replaceChildren();
  for(const id of groups[code]||[]){const original=get(id);if(!original)continue;const label=document.createElement('label'),field=original.cloneNode(true);field.id='ar_'+id;field.removeAttribute('disabled');field.removeAttribute('readonly');field.removeAttribute('style');field.value=original.value;field.checked=original.checked;
   const m=id.match(/^dwPoint(\d)(\w+)$/);const title=labels[id]||(m?`${+m[1]+1}번 대지 · ${{Title:'제목',Reference:'근거 구절',Opening:'첫 문장',Bridge:'전환 문장'}[m[2]]}`:id);
   if(field.type==='checkbox'){label.className='ar-check';label.append(field,document.createTextNode(title));}else{label.append(document.createTextNode(title),field);if(field.tagName==='TEXTAREA')field.rows=id==='dwManuscript'?14:4;}get('arFields').append(label);
  }
  if(code==='P1'){const button=document.createElement('button'),preview=document.createElement('pre');button.id='arRead';button.textContent='수정한 본문 범위 읽기';preview.id='arPreview';button.onclick=async()=>{button.disabled=true;preview.textContent='본문을 불러오는 중…';try{const rows=await window.AnchorPassage.read(get('ar_dwPassage').value,get('ar_dwEdition').value);preview.textContent=rows.map(r=>r.label+' '+r.text).join('\n\n')}catch(e){preview.textContent=e.message}finally{button.disabled=false}};get('arFields').append(button,preview);}
  // A new passage or edition requires fresh confirmation in this editor.
  for(const id of ['dwPassage','dwEdition']){get('ar_'+id)?.addEventListener('input',()=>{if(get('ar_dwPassageConfirmed'))get('ar_dwPassageConfirmed').checked=false;if(get('arPreview'))get('arPreview').textContent='범위가 바뀌었습니다. 다시 읽고 확인해 주세요.'})}
  if(code==='P4')window.NoteLexicalReview?.mount(get('arFields'),get('ar_dwManuscript'));
  syncManualButton();
  dialog.showModal();
 }
 get('arSave').onclick=async()=>{if(busy)return;busy=true;get('arAuto').disabled=true;get('arSave').disabled=true;get('arManualPass').disabled=true;get('arClose').disabled=true;get('arCancel').disabled=true;
  let saved=false;const progress=()=>get('arStatus').textContent='수정되었습니다. '+get('dwProgressText').textContent;let timer;
  try{const patch={},flags={};for(const id of groups[code]||[]){const field=get('ar_'+id);if(!field)continue;const value=field.type==='checkbox'?field.checked:field.value;if(['dwPassageConfirmed','dwSingle','dwQuotesChecked','dwActionsChecked','dwUnityChecked','dwLinkChecked'].includes(id))flags[id]=value;else patch[id]=value;}
   revision=W.applyCorrection(patch,flags,revision);saved=true;progress();timer=setInterval(progress,150);await W.validate();clearInterval(timer);const row=W.report?.rows.find(r=>r.code===code);get('arStatus').textContent=row?'수정되었습니다. '+code+' · '+row.status+' — '+row.evidence:'수정되었습니다. 검사 결과를 확인하지 못했습니다. 다시 검사해 주세요.';return true;
  }catch(e){get('arStatus').textContent=(saved?'수정 내용은 저장되었습니다. 재검사 안내: ':'저장하지 못했습니다. ')+e.message;return false}finally{clearInterval(timer);busy=false;get('arAuto').disabled=false;get('arSave').disabled=false;get('arClose').disabled=false;get('arCancel').disabled=false;syncManualButton();}
 };
 function syncManualButton(){const row=W.report?.rows.find(r=>r.code===code);get('arManualPass').disabled=busy;get('arManualPass').textContent=row?.manualOverride?'통과 처리 취소':'무시하고 통과 처리';}
 get('arManualPass').onclick=async()=>{
  if(busy)return;
  const undo=W.report?.rows.find(r=>r.code===code)?.manualOverride;
  if(undo){W.toggleManualPass(code);get('arStatus').textContent='사용자 통과 처리를 취소했습니다. 원래 검사 결과로 돌아갑니다.';syncManualButton();return;}
  // Save edits in this layer before applying the decision to the current revision.
  if(!await get('arSave').onclick())return;
  const row=W.report?.rows.find(r=>r.code===code);if(!row)return;
  if(row.status!=='통과')W.toggleManualPass(code);
  get('arStatus').textContent=W.report.rows.find(r=>r.code===code)?.manualOverride?'수정 내용이 저장되었습니다. 이 항목을 사용자 판단으로 통과 처리했습니다.':'수정 내용이 저장되었고 이 항목은 검사를 통과했습니다.';
  syncManualButton();
 };
 function editorValues(){return Object.fromEntries((groups[code]||[]).filter(id=>get('ar_'+id)).map(id=>{const e=get('ar_'+id);return [id,e.type==='checkbox'?e.checked:e.value]}));}
 get('arAuto').onclick=async()=>{
  if(busy)return;busy=true;const before=editorValues();['arAuto','arSave','arManualPass','arCancel','arClose','arAutoUndo'].forEach(id=>get(id).disabled=true);get('arAutoInfo').textContent='모은 자료와 현재 원고를 확인하고 있습니다…';
  try{const result=await AnchorAutofill.suggest(code,before);if(W.revision!==revision)throw Error('다른 곳에서 내용이 바뀌었습니다. 수정 창을 다시 열어 주세요.');if(JSON.stringify(editorValues())!==JSON.stringify(before))throw Error('자동 입력 준비 중에 편집 내용이 바뀌었습니다. 다시 눌러 주세요.');autoBefore=before;for(const [id,text]of Object.entries(result.patch)){const e=get('ar_'+id);if(e&&e.type!=='checkbox'){e.value=text;e.dispatchEvent(new Event('input',{bubbles:true}));}}get('arAutoInfo').textContent='자동 입력안을 준비했습니다. 아직 저장하지 않았습니다.\n'+result.summary;get('arAutoUndo').hidden=!Object.keys(result.patch).length;
  }catch(e){get('arAutoInfo').textContent='자동 입력을 완료하지 못했습니다. '+e.message;}finally{busy=false;['arAuto','arSave','arManualPass','arCancel','arClose','arAutoUndo'].forEach(id=>get(id).disabled=false);syncManualButton();}
 };
 get('arAutoUndo').onclick=()=>{if(!autoBefore||busy)return;for(const [id,value]of Object.entries(autoBefore)){const e=get('ar_'+id);if(e.type==='checkbox')e.checked=value;else e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}));}get('arAutoUndo').hidden=true;get('arAutoInfo').textContent='자동 입력 전의 편집 내용으로 되돌렸습니다.';};
 window.AnchorRepair={open};
})();
