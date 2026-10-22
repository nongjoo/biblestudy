 'use strict';
/* v64 · 원고 확정 → 10개 제작 영역 반영
   - 확정 화면을 열면 제목·본문·중심 문장·대지·적용을 원고와 설계에서 자동으로 채운다.
     설계에 적용이 없거나 원고에 없는 적용이면, 최종 원고의 실천 문장을 찾아 채운다(빈 칸으로 막히지 않게).
   - 확정하면 요약을 설계에도 맞춰 넣고 → 다시 검사 → 최종 원고 저장 → 04 제작으로 이동한다. */
(()=>{
 const get=id=>document.getElementById(id),W=delegationWorkflow,X=()=>window.SermonExtract;
 get('dwRevisedManuscript').closest('details').querySelector('summary').textContent='돌려받은 최종 설교 원고 붙여 넣기';
 get('dwRevisedManuscript').closest('details').open=true;
 get('dwRevisedManuscript').setAttribute('aria-label','돌려받은 최종 설교 원고 붙여 넣기');get('dwRevisedManuscript').placeholder='최종 원고 지시문으로 받은 설교 원고 전문을 여기에 붙여 넣으세요. 이전 원고는 초안 모음에 자동 보관됩니다.';
 get('dwApplyRepair').textContent='최종 원고 적용 · 확정 준비';get('dwApplyRepair').classList.add('primary');
 get('dw-manuscript').querySelector('.dw-heading > p:last-child').textContent='원고 작성 지시문 → 원고 붙여 넣기 → 검사 → 최종 원고 지시문(노트 자료 포함) → 최종 원고 붙여 넣기 → 확정 → 인쇄 · 제작';
 const section=document.createElement('section');section.id='finalManuscriptFlow';section.className='dw-card fm';
 section.innerHTML=`<p class="fm-eyebrow">원고 확정</p><h2>최종 원고 확정 · 인쇄 · 제작으로</h2>
 <ol class="fm-steps" aria-label="확정 순서"><li><b>1</b> 원고 검사</li><li><b>2</b> 요약 자동 채움 · 확인</li><li><b>3</b> 확정 · 10개 영역 반영</li></ol>
 <p>현재 원고를 다시 검사하고, 제목·대지·적용을 원고에서 찾아 채웁니다. 검사 결과는 보완 안내이며, 확정을 막지 않습니다.</p>
 <div class="fm-actions"><button id="fmPrepare" class="primary">원고 확정하기</button><button id="fmPrintNow" class="ghost" type="button">인쇄용 원고 미리보기</button></div>
 <div id="fmEditor" hidden>
  <p id="fmReview" class="fm-review" role="status"></p>
  <details><summary>제작에 사용할 최종 원고 전문 확인</summary><pre id="fmFull"></pre></details>
  <p id="fmAuto" class="fm-auto" role="status"></p>
  <div class="fm-grid">
   <label>설교 제목<input id="fmTitle"></label>
   <label>설교 본문 범위<input id="fmPassage"></label>
   <label class="fm-wide">중심 메시지<textarea id="fmCenter" rows="2"></textarea></label>
   <label class="fm-wide">대지 · 한 줄에 하나 (대지 제목 | 근거 절)<textarea id="fmPoints" rows="4"></textarea></label>
   <label class="fm-wide">원고에서 전하는 적용 · 한 줄에 한 가지<textarea id="fmApps" rows="4" placeholder="예: 이번 주에 도움이 필요한 한 사람을 정해 직접 전화하십시오."></textarea></label>
  </div>
  <div class="fm-actions"><button id="fmFindApps" type="button" class="ghost">원고에서 적용 다시 찾기</button></div>
  <label class="fm-confirm"><input type="checkbox" id="fmConfirm"> 최종 원고와 제작용 요약을 검토했습니다</label>
  <p class="fm-note">확정하면 위 요약이 설계에도 맞춰 들어가고, PPT·공과·가사·교재·인포그래픽 문안이 이 원고로 다시 채워집니다. 장면 카드와 화풍 설정은 그대로 둡니다.</p>
  <div class="fm-actions"><button id="fmCommit" class="primary">이 최종 원고 확정 · 10개 영역에 반영</button></div>
 </div>
 <p id="fmStatus" class="fm-status" role="status"></p>`;
 get('dwRepairStatus').closest('section').after(section);
 const banner=document.createElement('section');banner.id='fmProduction';banner.className='dw-card';banner.innerHTML='<h2>제작 기준 원고</h2><p id="fmProductionStatus" role="status"></p><button id="fmPrint" class="primary">인쇄용 원고 보기 · 내려받기</button><button id="fmBack" class="ghost">원고 확정 화면 열기</button><button id="fmPrevious" class="ghost">확정 전 제작 입력 내려받기</button>';
 get('dw-production').querySelector('.dw-heading').after(banner);
 let signature='',preparing=false,committing=false;
 const lines=s=>String(s||'').split('\n').map(x=>x.trim()).filter(Boolean);
 const say=(text,focus)=>{get('fmStatus').textContent=text;if(typeof toast==='function')toast(text);if(focus){focus.focus();focus.scrollIntoView({block:'center',behavior:'smooth'})}};
 const norm=t=>X()?X().norm(t):String(t||'').replace(/\s/g,'');
 function inBody(app,body){const b=norm(body),k=norm(app);if(!k)return false;if(b.includes(k))return true;const ws=String(app).split(/\s+/).filter(w=>w.length>=2);return ws.length>0&&ws.filter(w=>body.includes(w)).length/ws.length>=.6}
 function status(){const packet=W.finalPacket;get('fmProductionStatus').textContent=packet?(W.finalCurrent()?`확정된 최종 원고 ${packet.manuscript.length.toLocaleString()}자 · ${packet.title||'제목 없음'} · 적용 ${packet.anchor.applications.length}개 · 열 영역의 문안이 이 원고에서 채워졌습니다.`:'확정 뒤 원고나 설계가 바뀌었습니다. 지금은 현재 원고·설계 기준으로 만들고, 다시 확정하면 문안을 새로 채웁니다.'):'원고를 확정하지 않아도 제작할 수 있습니다. 확정하면 원고의 문장이 PPT·공과·가사·교재에 들어갑니다.';}
 // 적용: ①원고에 실제로 있는 설계 적용 → ②최종 원고의 실천 문장 → ③설계 적용 그대로
 function pickApplications(body,a){const designed=a.applications.filter(x=>inBody(x,body));if(designed.length)return {list:designed,from:'design'};const found=X()?X().applications(body):[];if(found.length)return {list:found,from:'manuscript'};return {list:a.applications,from:a.applications.length?'design-missing':'none'}}
 async function prepare(){if(preparing||committing)return;preparing=true;W.show('manuscript');say('현재 원고를 검사하고 최종 확인을 준비합니다…');get('fmPrepare').disabled=true;get('fmCommit').disabled=true;
  try{await W.validate();const body=get('dwManuscript').value,a=W.anchor;signature=W.finalSignature();
   const fin=W.finalPacket,reuse=!!fin&&fin.manuscript===body;
   const doc=X()?X().parse(body,{anchor:a}):{title:'',passage:'',sections:[]};
   const generic=/^(?:완성된\s*)?(?:설교\s*)?(?:원고|전문|초안)(?:\s*전문)?$/;
   const title=(reuse&&fin.title)||(doc.title&&!generic.test(doc.title)?doc.title:'')||a.question||a.center||'';
   const docPoints=doc.sections.filter(s=>s.kind==='point');
   // 최종 원고 소제목에 근거 절이 적혀 있으면, 비어 있거나 본문 전체 범위로 임시 기록된 근거 절보다 우선한다.
   const points=(reuse&&fin.anchor.points.length?fin.anchor.points:a.points.length?a.points.map((p,i)=>{const ref=docPoints[i]?.ref;return ref&&(!p.reference||p.reference===a.passage)?{...p,reference:ref}:p}):docPoints.map(s=>({title:s.title,reference:s.ref})));
   const apps=reuse&&fin.anchor.applications.length?{list:fin.anchor.applications,from:'final'}:pickApplications(body,a);
   get('fmTitle').value=title.replace(/^제목\s*[:：]\s*/,'');get('fmPassage').value=(reuse&&fin.anchor.passage)||a.passage||doc.passage;get('fmCenter').value=(reuse&&fin.anchor.center)||a.center;
   get('fmPoints').value=points.map(p=>p.title+(p.reference?' | '+p.reference:'')).join('\n');get('fmApps').value=apps.list.join('\n');get('fmFull').textContent=body;
   const auto=[];if(apps.from==='manuscript')auto.push(`적용 ${apps.list.length}개를 최종 원고의 실천 문장에서 찾아 채웠습니다.`);if(apps.from==='design-missing')auto.push('설계의 적용이 최종 원고에서 확인되지 않습니다. 원고에 맞게 고치거나 [원고에서 적용 다시 찾기]를 누르세요.');if(apps.from==='none')auto.push('원고에서 실천 문장을 찾지 못했습니다. 이번 주에 할 행동을 한 줄 이상 적어 주세요.');if(!a.points.length&&docPoints.length)auto.push(`대지 ${docPoints.length}개를 원고의 소제목에서 채웠습니다.`);
   get('fmAuto').textContent=auto.join(' ');get('fmAuto').hidden=!auto.length;
   const pending=W.report.rows.filter(r=>(r.originalStatus||r.status)!=='통과');get('fmReview').textContent=pending.length?'검토할 안내 '+pending.length+'개: '+pending.map(r=>r.code+' '+(r.originalStatus||r.status)).join(' · ')+' — 확정은 가능합니다. 위 [최종 원고 지시문 만들기]로 보완할 수 있습니다.':'검사 항목을 모두 통과했습니다. 요약을 확인하고 확정하세요.';get('fmReview').classList.toggle('ok',!pending.length);
   get('fmConfirm').checked=false;get('fmEditor').hidden=false;say(apps.list.length?'요약을 확인한 뒤 확인란을 체크하고 [확정] 버튼을 눌러 주세요.':'적용 칸을 채운 뒤 확정해 주세요.');section.scrollIntoView({block:'start',behavior:'smooth'});
  }catch(e){say(e.message)}finally{preparing=false;get('fmPrepare').disabled=false;get('fmCommit').disabled=false;}
 }
 // 설교 본문이 설계 화면에서 아직 읽히지 않았다면 불러 둔다(PPT·교재의 말씀 본문에 쓰인다).
 async function ensureBible(passage){const box=get('dwBible');if(box.textContent.trim()||!passage||get('dwUseOwn').checked||!window.AnchorPassage)return;try{const rows=await AnchorPassage.read(passage,get('dwEdition').value||'kor');box.textContent=rows.map(r=>`${r.ref} | ${r.text}`).join('\n')}catch(e){}}
 async function commit(){if(committing||preparing)return;
  if(get('fmEditor').hidden){await prepare();return}
  if(!get('fmConfirm').checked){say('최종 원고와 요약을 확인한 뒤 확인란을 체크하세요.',get('fmConfirm'));return}
  let apps=lines(get('fmApps').value);
  if(!apps.length&&X()){apps=X().applications(get('dwManuscript').value);if(apps.length)get('fmApps').value=apps.join('\n')}
  if(!apps.length){say('원고에서 전하는 적용을 한 줄 이상 적어 주세요. 제작물의 "이번 주의 한 걸음"에 들어갑니다.',get('fmApps'));return}
  const center=get('fmCenter').value.trim();if(!center){say('중심 메시지를 적어 주세요.',get('fmCenter'));return}
  const pts=lines(get('fmPoints').value).slice(0,4).map(line=>{const [title,reference='']=line.split('|').map(x=>x.trim());return {title,reference}});
  if(pts.length<3){say('대지를 3개 이상 적어 주세요. 한 줄에 하나씩 "대지 제목 | 근거 절" 형식입니다.',get('fmPoints'));return}
  committing=true;get('fmCommit').disabled=true;get('fmPrepare').disabled=true;say('설계에 요약을 맞추고 최종 원고를 다시 검사합니다…');
  try{
   const design=W.anchor,patch={};
   if(apps.join('\n')!==design.applications.join('\n'))patch.dwApplications=apps.join('\n');
   pts.forEach((p,i)=>{const old=design.points[i]||{};if(p.title&&p.title!==old.title)patch[`dwPoint${i}Title`]=p.title;if(p.reference&&p.reference!==old.reference)patch[`dwPoint${i}Reference`]=p.reference});
   for(let i=pts.length;i<design.points.length&&i<4;i++){for(const k of ['Title','Reference','Opening','Bridge'])if(get(`dwPoint${i}${k}`).value)patch[`dwPoint${i}${k}`]=''}
   if(!design.center)patch.dwCenter=center;
   const passage=get('fmPassage').value.trim();if(passage&&!design.passage)patch.dwPassage=passage;
   if(Object.keys(patch).length){const flags=Object.fromEntries(['dwPassageConfirmed','dwSingle','dwQuotesChecked','dwActionsChecked','dwUnityChecked','dwLinkChecked'].map(id=>[id,get(id).checked]));W.applyCorrection(patch,flags)}
   await ensureBible(passage||design.passage);
   await W.validate();
   const now=W.anchor;
   const summary={title:get('fmTitle').value.trim(),passage:passage||now.passage,center,applications:apps,points:pts.map((p,i)=>{const prev=now.points.find(x=>x.title===p.title)||now.points[i]||{};return{title:p.title,reference:p.reference||prev.reference||'',opening:prev.title===p.title?prev.opening||'':'',bridge:prev.title===p.title?prev.bridge||'':''}})};
   signature=W.finalSignature();W.finalizeManuscript(summary,signature);
   get('fmConfirm').checked=false;get('fmEditor').hidden=true;
   say(`최종 원고를 확정했습니다 · 적용 ${apps.length}개 · 10개 제작 영역에 반영했습니다.`);
   W.show('production');status();window.scrollTo({top:0,behavior:'smooth'});
  }catch(e){say(e.message||'확정하지 못했습니다. 다시 시도해 주세요.')}
  finally{committing=false;get('fmCommit').disabled=false;get('fmPrepare').disabled=false}
 }
 get('fmPrepare').onclick=prepare;get('fmBack').onclick=prepare;get('fmCommit').onclick=commit;
 get('fmFindApps').onclick=()=>{const found=X()?X().applications(get('dwManuscript').value):[];if(!found.length){say('원고의 결론부에서 "…하십시오" 형태의 실천 문장을 찾지 못했습니다. 직접 적어 주세요.',get('fmApps'));return}get('fmApps').value=found.join('\n');get('fmConfirm').checked=false;say(`원고에서 적용 ${found.length}개를 찾아 채웠습니다.`)};
 const print=()=>{if(window.SermonPrint)SermonPrint.open();else say('인쇄 모듈을 불러오지 못했습니다. 새로고침해 주세요.')};
 get('fmPrint').onclick=print;get('fmPrintNow').onclick=print;
 get('fmPrevious').onclick=()=>download('이전-제작입력-백업.json',JSON.stringify(ProductionStudio.backupPrevious(),null,2),'application/json');
 section.addEventListener('input',e=>{if(e.target.id!=='fmConfirm')get('fmConfirm').checked=false;e.stopPropagation()});
 document.addEventListener('sermon-stage-changed',status);document.addEventListener('sermon-work-changed',status);window.FinalManuscriptFlow={prepare,commit};status();
})();
