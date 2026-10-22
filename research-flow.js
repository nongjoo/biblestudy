'use strict';
/* v65 · 흐름 보드 — 연구(자료·초안)를 설교의 뼈대로 세우고, 그 뼈대를 그대로 02 설계로 넘긴다.
   본문 범위 · 마음의 흐름 · 움직임(대지) 3~4개(제목·근거 절·여는 문장·근거 자료) · 적용 · 원어
   → [이 흐름으로 설계 만들기]가 설계의 본문·중심 문장·청중·질문·감정·대지·적용·원어를 한 번에 채운다. */
window.ResearchFlow=(()=>{
 const get=id=>document.getElementById(id),W=()=>delegationWorkflow,X=()=>window.SermonExtract;
 const BUCKET='sermonFlow',MOVES=4;
 const blank=()=>({auto:{},form:'',opening:'',closing:'',passage:'',emotion:'',confirmed:false,moves:Array.from({length:MOVES},()=>({title:'',ref:'',key:'',source:'',body:'',label:''})),apps:'',lexical:{}});
 let board=blank(),boardKey=null,saveTimer=0,previewTimer=0;
 const page=get('rw-flow');if(!page)return {};
 const host=document.createElement('section');host.id='rfBoard';host.className='rf';
 host.innerHTML=`<header class="rf-head"><p class="rf-eyebrow">설교의 뼈대 · 흐름 보드</p><h2>이 흐름이 그대로 설교 설계가 됩니다</h2>
  <p>위에서 고른 <b id="rfStructureName">전달 구조</b>의 순서대로 움직임 3~4개를 세웁니다. 각 움직임은 02 설계의 <b>대지</b>가 되고, 근거 절과 여는 문장은 원고의 뼈대가 됩니다. 연구 노트의 초안·중요 자료·담은 말씀·적용 노트로 미리 채워 두었습니다. 보고 고쳐 주세요.</p></header>
  <div class="rf-grid2"><label>설교 본문 범위<input id="rfPassage" placeholder="예: 마태복음 9:1-8"></label><div class="rf-inline"><button id="rfUseReading" type="button">지금 읽는 말씀으로</button></div></div>
  <div id="rfBible" class="rf-bible" hidden></div>
  <label class="rf-check"><input id="rfConfirmed" type="checkbox"> 이 범위를 설교 본문으로 읽고 확인했습니다</label>
  <label>마음의 흐름 <span class="rf-sub">청중의 마음이 어디에서 어디로 움직이나요? (음악·영상의 분위기에도 쓰입니다)</span><input id="rfEmotion" placeholder="예: 무력감에서 발견으로, 발견에서 실제 행동으로"></label>
  <section id="rfForm" class="rf-form"><div class="rf-form-head"><div><p class="rf-eyebrow">논증과 전달 구조</p><h3 id="rfFormName"></h3><p id="rfFormLogic" class="rf-sub"></p></div><button id="rfCompose" type="button" class="primary">이 구조로 설교 초안 다시 짜기</button></div><p id="rfFormNote" class="rf-sub"></p></section>
  <article class="rf-move rf-frame" id="rfOpenCard"><div class="rf-move-head"><span class="rf-no">서</span><span class="rf-step" id="rfOpenStep"></span></div><p class="rf-guide" id="rfOpenGuide"></p><label class="rf-wide">들어가며 · 이 자리에서 전할 내용<textarea id="rfOpening" rows="4"></textarea></label></article>
  <div id="rfMoves" class="rf-moves"></div>
  <article class="rf-move rf-frame" id="rfCloseCard"><div class="rf-move-head"><span class="rf-no">결</span><span class="rf-step" id="rfCloseStep"></span></div><p class="rf-guide" id="rfCloseGuide"></p><label class="rf-wide">맺으며 · 이 자리에서 전할 내용<textarea id="rfClosing" rows="4"></textarea></label></article>
  <label>이번 주의 적용 · 한 줄에 하나 (1~3개)<textarea id="rfApps" rows="3" placeholder="예: 이번 주에 도움이 필요한 한 사람을 정해 직접 전화하십시오."></textarea></label>
  <div id="rfLexical" class="rf-lex"></div>
  <div class="rf-actions"><button id="rfFill" type="button">연구 노트로 빈 칸 다시 채우기</button><button id="rfToDesign" class="primary" type="button">이 흐름으로 설계 만들기 →</button></div>
  <p id="rfStatus" class="rf-status" role="status"></p>`;
 const anchorBtn=get('rwFlowContinue');(anchorBtn||page.lastElementChild).before(host);if(anchorBtn)anchorBtn.hidden=true;
 const moves=get('rfMoves');
 for(let i=0;i<MOVES;i++){const card=document.createElement('article');card.className='rf-move';card.innerHTML=`<div class="rf-move-head"><span class="rf-no">${i+1}</span><span class="rf-step" id="rfStep${i}"></span>${i===3?'<span class="rf-opt" id="rfOpt3">선택</span>':''}</div><p class="rf-guide" id="rfG${i}"></p>
  <label>움직임 · 대지 제목<input id="rfT${i}"></label><label>근거 절<input id="rfR${i}" placeholder="예: 마태복음 9:2"></label>
  <label class="rf-wide">원고에서 이 대지를 여는 문장 (핵심 문장)<textarea id="rfK${i}" rows="2"></textarea></label>
  <label class="rf-wide">이 자리에서 전할 내용 (초안에서 옮겨 온 문장 · 원고 지시문에 그대로 들어갑니다)<textarea id="rfB${i}" rows="4"></textarea></label>
  <label class="rf-wide">근거 자료 (중요 자료에서 고르기)<select id="rfS${i}"><option value="">— 선택 안 함 —</option></select></label>`;moves.append(card)}
 const say=t=>{get('rfStatus').textContent=t;if(typeof toast==='function')toast(t)};
 const lines=t=>String(t||'').split('\n').map(x=>x.trim()).filter(Boolean);
 const importantList=()=>(typeof extras!=='undefined'&&extras.sermonImportant?.[noteTarget()])||[];
 const draftList=()=>(typeof extras!=='undefined'&&extras.sermonDrafts?.[noteTarget()])||[];
 function structure(){const id=get('sermonStructure')?.value||'deductive';return (typeof sermonStructures!=='undefined'&&sermonStructures[id])||null}
 function structureId(){return get('sermonStructure')?.value||'deductive'}
 function paintStructure(){const s=structure(),id=structureId(),F=window.SermonForms?.forms?.[id];get('rfStructureName').textContent=s?s.name:'전달 구조';
  if(F){get('rfFormName').textContent=s?s.name:F.short;get('rfFormLogic').textContent=F.logic;get('rfOpenStep').textContent='구조상 자리: '+F.open.label;get('rfOpenGuide').textContent=F.open.guide;get('rfCloseStep').textContent='구조상 자리: '+F.close.label;get('rfCloseGuide').textContent=F.close.guide;
   const lateAt=F.moves.findIndex(m=>m.role==='late');get('rfFormNote').textContent=(F.center==='early'?'중심 문장은 서론에서 먼저 선언합니다.':F.center==='first'?'중심 문장이 설교의 첫 문장입니다.':lateAt>=0?`중심 문장은 ${lateAt+1}번째 움직임에서 처음 선언합니다. 그 전에는 말하지 않습니다.`:'중심 문장은 본문의 가치를 다루는 움직임에서 선언합니다.')+(board.form&&board.form!==id?' · 지금 보드는 다른 구조로 짜여 있습니다. [이 구조로 설교 초안 다시 짜기]를 누르세요.':'');
   for(let i=0;i<MOVES;i++){const m=F.moves[i];const card=get('rfT'+i).closest('.rf-move');card.hidden=!m&&!board.moves[i].title;get('rfStep'+i).textContent=m?'구조상 자리: '+m.label:'구조상 자리: 추가 대지';get('rfG'+i).textContent=m?m.guide:'형식에 없는 대지입니다. 필요 없으면 비워 두세요.';get('rfT'+i).placeholder=m?'예: '+m.label+'에 해당하는 대지 제목':'대지 제목';if(i===3&&get('rfOpt3'))get('rfOpt3').hidden=!(m?.opt)}}
  else for(let i=0;i<MOVES;i++){const step=s?.steps?.[Math.min(i,s.steps.length-1)]||'';get('rfStep'+i).textContent=step?'구조상 자리: '+step:'';get('rfT'+i).placeholder=step?'예: '+step+'에 해당하는 대지':'대지 제목'}}
 function paintSources(){const list=importantList();for(let i=0;i<MOVES;i++){const sel=get('rfS'+i),cur=board.moves[i].source;sel.replaceChildren(new Option('— 선택 안 함 —',''));list.forEach(x=>sel.append(new Option(x.text.replace(/\s+/g,' ').slice(0,70)+(x.text.length>70?'…':''),x.id)));sel.value=list.some(x=>x.id===cur)?cur:''}}
 function lexItems(){if(typeof NoteLexicalCheck==='undefined')return [];const n=Object.fromEntries(['observation','interpretation','application'].map(id=>[id,get(id)?.value||'']));const seen=new Set();return NoteLexicalCheck.extract(n).map(it=>{const line=it.source.split('\n').find(l=>/\([GH]\d+\)/.test(l))||'';const lemma=(line.match(/^\s*(\S+)\s*\([GH]\d+\)/)||[])[1]||it.word;return {lemma,reference:it.reference,gloss:(it.source.match(/한국어 기본 뜻:\s*([^\n]+)/)||[])[1]||it.gloss||''}}).filter(x=>{if(seen.has(x.lemma))return false;seen.add(x.lemma);return true})}
 const refNums=r=>{const m=String(r||'').match(/(\d+)\s*[:장]\s*(\d+)(?:\s*[-~–]\s*(?:(\d+)\s*[:장]\s*)?(\d+))?/);return m?{c:+m[1],v1:+m[2],c2:m[3]?+m[3]:+m[1],v2:m[4]?+m[4]:+m[2]}:null};
 function inPassage(ref,passage){const r=refNums(ref),p=refNums(passage);if(!r||!p)return false;const at=r.c*1000+r.v1;return at>=p.c*1000+p.v1&&at<=p.c2*1000+p.v2}
 function paintLexical(){const box=get('rfLexical'),items=lexItems();box.replaceChildren();if(!items.length){box.innerHTML='<p class="rf-sub">연구 노트에 담은 원어가 없습니다. 본문 읽기에서 원어를 눌러 노트에 담으면 여기서 설계로 넘길 수 있습니다.</p>';return}
  const h=document.createElement('p');h.className='rf-sub';h.textContent='설계로 넘길 원어 (노트에서 찾음 · 본문 범위 안의 원어는 기본 선택)';box.append(h);
  for(const it of items){const lab=document.createElement('label');lab.className='rf-chip';const cb=document.createElement('input');cb.type='checkbox';cb.dataset.lemma=it.lemma;cb.dataset.ref=it.reference;const def=board.lexical[it.lemma];cb.checked=def===undefined?inPassage(it.reference,board.passage):def;cb.onchange=()=>{board.lexical[it.lemma]=cb.checked;queueSave()};const span=document.createElement('span');span.innerHTML=`<i lang="${/[֐-׿]/.test(it.lemma)?'he':'grc'}">${it.lemma.replace(/[<>&]/g,'')}</i> ${(it.gloss||'').replace(/[<>&]/g,'').slice(0,24)} <small>${(it.reference||'').replace(/[<>&]/g,'')}</small>`;lab.append(cb,span);box.append(lab)}}
 function toForm(){get('rfPassage').value=board.passage;get('rfEmotion').value=board.emotion;get('rfConfirmed').checked=!!board.confirmed;get('rfApps').value=board.apps;get('rfOpening').value=board.opening||'';get('rfClosing').value=board.closing||'';board.moves.forEach((m,i)=>{get('rfT'+i).value=m.title;get('rfR'+i).value=m.ref;get('rfK'+i).value=m.key;get('rfB'+i).value=m.body||''});paintStructure();paintSources();paintLexical();preview()}
 function fromForm(){board.passage=get('rfPassage').value.trim();board.emotion=get('rfEmotion').value.trim();board.confirmed=get('rfConfirmed').checked;board.apps=get('rfApps').value;board.opening=get('rfOpening').value;board.closing=get('rfClosing').value;board.moves=board.moves.map((m,i)=>({...m,title:get('rfT'+i).value.trim(),ref:get('rfR'+i).value.trim(),key:get('rfK'+i).value.trim(),body:get('rfB'+i).value,source:get('rfS'+i).value}))}
 function persist(){if(typeof extras==='undefined')return;extras[BUCKET]||={};extras[BUCKET][noteTarget()]=JSON.parse(JSON.stringify(board));storeExtras()}
 function queueSave(){clearTimeout(saveTimer);saveTimer=setTimeout(persist,400)}
 function load(force){const k=typeof noteTarget==='function'?noteTarget():'';if(!force&&k===boardKey)return;boardKey=k;const saved=typeof extras!=='undefined'&&extras[BUCKET]?.[k];board=saved?{...blank(),...saved,moves:Array.from({length:MOVES},(_,i)=>({...blank().moves[0],...(saved.moves?.[i]||{})})),lexical:saved.lexical||{},auto:saved.auto||{}}:blank();
  // 비어 있으면 이미 있는 설계·읽는 말씀에서 출발한다.
  const a=W().anchor;
  // v80 · 새 노트를 만들 때 이전 설교의 설계 본문(예: 시편 27)이 남아 보드에 저장되던 문제:
  //       직접 적은 범위가 아니면, 이 노트의 성경과 맞는 설계 본문을 따르고, 다른 성경을 가리키는 자동 내용은 비운다.
  {const noteRef=readingNoteRef(),nb=bkOf(noteRef),ap=a.passage||'',apOk=ap&&(!nb||bkOf(ap)===nb);
   if(board.auto.passage!=='user'){
    if(board.passage&&nb&&bkOf(board.passage)!==nb){const old=board.passage;board.passage=apOk?ap:'';board.auto.passage=apOk?'design':'';board.confirmed=false;
     board.moves=board.moves.map(m=>m.auto==='user'&&bkOf(m.ref)===nb?m:{...blank().moves[0]});board.form='';board.opening='';board.closing='';if(board.auto.apps!=='user')board.apps='';board.emotion='';board.lexical={};
     setTimeout(()=>{try{get('rfStatus').textContent=`이 노트(${noteRef})와 다른 본문(${old})이 보드에 남아 있어 비웠습니다. ${board.passage?board.passage+'로 맞췄습니다.':'설교 본문 범위를 적어 주세요.'}`}catch(e){}},0)}
    else if(apOk&&board.passage!==ap&&(!board.passage||board.auto.passage==='design'||!board.auto.passage)){board.passage=ap;board.auto.passage='design';board.confirmed=false}}}
  if(!board.passage){board.passage=a.passage&&(!bkOf(readingNoteRef())||bkOf(a.passage)===bkOf(readingNoteRef()))?a.passage:'';if(board.passage)board.auto.passage='design'}if(!board.emotion)board.emotion=a.emotion||'';if(!board.apps)board.apps=a.applications.join('\n');if(board.moves.every(m=>!m.title)&&!currentDraft())a.points.slice(0,MOVES).forEach((p,i)=>board.moves[i]={...board.moves[i],title:p.title,ref:p.reference,key:p.opening,auto:'design'});toForm();
  // v66 · 비어 있으면 연구 노트 전체로 미리 채워 둔다(사용자가 보고 고친다).
  fill('',{silent:true})}
 async function preview(){clearTimeout(previewTimer);previewTimer=setTimeout(async()=>{const box=get('rfBible'),p=get('rfPassage').value.trim();if(!p||!window.AnchorPassage){box.hidden=true;return}try{const rows=await AnchorPassage.read(p,get('dwEdition')?.value||'kor');box.hidden=false;box.innerHTML='';const h=document.createElement('strong');h.textContent=`${p} · ${rows.length}절`;box.append(h);const t=document.createElement('p');t.textContent=rows.map(r=>`${r.label.split(':').pop()} ${r.text}`).join('  ').slice(0,1400);box.append(t)}catch(e){box.hidden=false;box.textContent='본문 범위를 읽지 못했습니다: '+e.message}},350)}

 // v67 · 본문 범위에 모두 맞추기: 근거 절이 본문 밖이면 새 본문에서 가장 잘 맞는 절로 바꾸고,
 // 이전 본문의 말씀에서 가져온 움직임은 새 본문의 말씀으로 다시 세운다. 직접 쓴 제목·문장은 그대로 둔다.
 let alignTimer=0,aligning=false;
 function queueAlign(){clearTimeout(alignTimer);alignTimer=setTimeout(align,500)}
 const stems=t=>[...new Set(String(t||'').split(/[^가-힣A-Za-z0-9]+/).filter(w=>w.length>=2).map(w=>w.slice(0,2)).filter(w=>!/^(우리|그리|하나|이것|그것|무엇|오늘|사람|있습|합니|입니|것은|에서|으로|하는|이는)$/.test(w)))];
 async function align(){if(aligning||!board.passage||!window.AnchorPassage)return;aligning=true;try{
  let rows;try{rows=await AnchorPassage.read(board.passage,get('dwEdition')?.value||'kor')}catch(e){return}
  if(!rows.length)return;fromForm();const n=Math.max(3,board.moves.filter(m=>m.title).length),seg=i=>rows.slice(Math.floor(i*rows.length/n),Math.max(Math.floor((i+1)*rows.length/n),Math.floor(i*rows.length/n)+1));
  const changed=[];const used=new Set();
  board.moves.forEach((m,i)=>{if(m.ref&&inPassage(m.ref,board.passage)&&rows.some(r=>r.label===m.ref||inPassage(r.label,m.ref)))used.add(m.ref)});
  board.moves.forEach((m,i)=>{
   if(!m.title&&!m.ref)return;
   const ok=m.ref&&rows.some(r=>r.label===m.ref)||(m.ref&&inPassage(m.ref,board.passage)&&refNums(m.ref)&&rows.some(r=>inPassage(r.label,m.ref)));
   if(ok)return;
   const part=seg(i);
   const bookOf=r=>((String(r||'').match(/^(\D+?)\s*\d/)||[])[1]||'').trim(),foreign=m.ref&&bookOf(m.ref)&&bookOf(m.ref)!==bookOf(board.passage);
   if(!m.title||['notes','important','passage','design'].includes(m.auto)||((m.auto===undefined||m.auto==='form'||m.auto==='draft')&&foreign)){const v=part.find(r=>!used.has(r.label))||part[0];board.moves[i]={...m,title:firstClause(v.text),ref:v.label,key:v.text.slice(0,110),auto:'passage'};used.add(v.label);changed.push(i+1);return}
   const ws=stems(m.title+' '+m.key);let best=null,score=-1;rows.forEach((r,j)=>{const sc=ws.filter(w=>r.text.includes(w)).length-(used.has(r.label)?0.6:0)+(1-Math.abs(j/Math.max(1,rows.length-1)-i/Math.max(1,n-1)))*0.4;if(sc>score){score=sc;best=r}});
   if(best){board.moves[i]={...m,ref:best.label};used.add(best.label);changed.push(i+1)}});
  // 움직임이 3개가 안 되면 본문을 3등분해 말씀으로 출발점을 세운다
  let have=board.moves.filter(m=>m.title).length;for(let i=0;have<3&&i<MOVES;i++){if(board.moves[i].title)continue;const v=seg(have)[0];if(!v)break;board.moves[i]={...board.moves[i],title:firstClause(v.text),ref:v.label,key:v.text.slice(0,110),auto:'passage'};have++;changed.push(i+1)}
  if(changed.length){toForm();queueSave();get('rfStatus').textContent=`본문 ${board.passage}에 맞춰 움직임 ${[...new Set(changed)].join('·')}번의 근거 절${changed.some(i=>board.moves[i-1].auto==='passage')?'과 말씀':''}을 새로 맞췄습니다. 대지 제목을 본문에 맞게 다듬어 주세요.`}
  paintLexical();
 }finally{aligning=false}}
 function readingRef(){try{return humanRef(key())}catch(e){return ''}}
 function readingNoteRef(){try{return humanRef(noteTarget())}catch(e){return ''}}
 function bkOf(s){return ((String(s||'').match(/^(\D+?)\s*\d/)||[])[1]||'').trim()}
 // 초안이 다루는 성경(가장 많이 나오는 책 이름)
 function draftBook(text){try{const names=(typeof books!=='undefined'?books:[]).map(b=>b.name).sort((x,y)=>y.length-x.length);let best='',n=0;for(const nm of names){const c=(String(text||'').match(new RegExp(nm+'\\s*\\d+\\s*(?:장|편|:)','g'))||[]).length;if(c>n){n=c;best=nm}}return best}catch(e){return ''}}
 const draftFits=d=>{const db=draftBook(d),pb=bkOf(board.passage)||bkOf(readingNoteRef());return !db||!pb||db===pb};
 // ── 연구 노트 전체로 흐름 보드 채우기 (비어 있는 칸만) ──
 // 우선순위: 설교 초안 → 중요 자료 → 노트에 담은 성경 본문 → 해석·적용 노트 → 돌봄 유형(질문·마음의 흐름)
 const EMO={listen:'아픔에서 위로로, 위로에서 다시 일어섬으로',hope:'낙심에서 소망으로, 소망에서 오늘의 한 걸음으로',action:'머뭇거림에서 결단으로, 결단에서 실천으로',discern:'혼란에서 분별로, 분별에서 담대한 선택으로',reconcile:'상처에서 이해로, 이해에서 화해로',rest:'소진에서 쉼으로, 쉼에서 새 힘으로',grief:'상실의 슬픔에서 위로로, 위로에서 소망으로',growth:'의문에서 신뢰로, 신뢰에서 성숙으로',gratitude:'당연함에서 발견으로, 발견에서 감사로'};
 function scriptureNotes(){const text=['observation','interpretation','application'].map(id=>get(id)?.value||'').join('\n\n');const out=[];for(const b of text.split(/\n\s*\n/)){const m=b.match(/^\s*\[(?:성경 본문|본문)\s*·\s*([^\]]+)\]\s*\n([\s\S]+)/);if(m){const ref=m[1].trim(),body=m[2].split('\n').find(l=>l.trim()&&!/^\[|^본문:|^출처/.test(l.trim()))||'';if(refNums(ref)&&body)out.push({ref,text:body.trim()})}}const seen=new Set();const uniq=out.filter(x=>{if(seen.has(x.ref))return false;seen.add(x.ref);return true});const grp=x=>((x.ref.match(/^(\D+?)\s*\d/)||[])[1]||'').trim()+' '+refNums(x.ref).c;const counts={};uniq.forEach(x=>counts[grp(x)]=(counts[grp(x)]||0)+1);const main=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];const inside=board.passage&&board.auto.passage!=='reading'?uniq.filter(x=>inPassage(x.ref,board.passage)):null;return (inside||uniq.filter(x=>grp(x)===main)).sort((a,b)=>{const x=refNums(a.ref),y=refNums(b.ref);return (x.c*1000+x.v1)-(y.c*1000+y.v1)})}
 const firstClause=t=>{const s=String(t||'').replace(/^[\s"“'‘]+/,'').split(/(?<=[.!?。])\s|[!?]|(?<=다|라|니|며|고|여|매|되|면),?\s/)[0].trim();return (s.length>34?s.slice(0,34).replace(/\s+\S*$/,'')+'…':s).replace(/[,.]$/,'')};
 const sentencesOf=t=>X()?X().splitSentences(t):String(t||'').split(/(?<=[.!?])\s+|\n+/).map(x=>x.trim()).filter(Boolean);
 function derivePassage(refs){const parsed=refs.map(r=>({book:(r.match(/^(\D+?)\s*\d/)||[])[1]?.trim()||'',n:refNums(r)})).filter(x=>x.book&&x.n);if(!parsed.length)return '';const g=parsed.filter(x=>x.book===parsed[0].book&&x.n.c===parsed[0].n.c);const lo=Math.min(...g.map(x=>x.n.v1)),hi=Math.max(...g.map(x=>x.n.v2));return `${g[0].book} ${g[0].n.c}:${lo}${hi>lo?'-'+hi:''}`}
 function currentDraft(){return String(get('rpDraftText')?.value||draftList().slice(-1)[0]?.text||'').trim()}
 // v79 · 고른 구조로 초안을 다시 짠다
 async function composeNow({silent=false,draft=''}={}){fromForm();const id=structureId();draft=draft||currentDraft();
  if(draft&&!draftFits(draft)){const db=draftBook(draft);if(!silent)say(`최근 설교 초안은 ${db}를 다루고 있어 지금 본문(${board.passage||readingNoteRef()})과 맞지 않습니다. 이 본문의 초안을 연구 노트에서 새로 만들거나, 연구 노트의 자료로 짭니다.`);draft=''}
  const notesText=['observation','interpretation','application'].map(f=>get(f)?.value||'').join('\n\n');const src=draft||notesText;
  if(!src.trim()){if(!silent)say('짤 재료가 없습니다. 연구 노트에서 설교 초안을 먼저 만들거나 자료를 담아 주세요.');return}
  let verses=[];try{if(board.passage&&window.AnchorPassage)verses=await AnchorPassage.read(board.passage,get('dwEdition')?.value||'kor')}catch(e){}
  const apps=lines(board.apps).length?lines(board.apps):(X()?X().applications(draft||''):[]);
  const plan=SermonForms.compose(id,{draft:src,center:get('sermonFocus')?.value.trim()||W().anchor.center||'',question:get('sermonQuestion')?.value.trim()||'',apps,verses,passage:board.passage,book:(board.passage.match(/^(\D+?)\s*\d/)||[])[1]||''});
  board.form=id;board.opening=plan.open.body.join('\n');board.closing=plan.close.body.join('\n');delete board.auto.openUser;delete board.auto.closeUser;
  board.moves=Array.from({length:MOVES},(_,i)=>{const m=plan.moves[i];const old=board.moves[i]||{};return m?{...old,title:m.title,ref:m.ref||old.ref||'',key:m.key,body:m.body.join('\n'),label:m.label,auto:'form'}:{...old,title:'',ref:'',key:'',body:'',label:'',auto:'form'}});
  {const bkOf=s=>((String(s||'').match(/^(\D+?)\s*\d/)||[])[1]||'').trim();const refs=board.moves.map(m=>m.ref).filter(Boolean);if(refs.length&&!['user','design'].includes(board.auto.passage)&&(!board.passage||refs.some(r=>!inPassage(r,board.passage)||bkOf(r)!==bkOf(board.passage)))){const dp=derivePassage(refs);if(dp&&dp!==board.passage){board.passage=dp;board.auto.passage='research';board.confirmed=false}}}
  if(!lines(board.apps).length&&plan.close.role.startsWith('apply')&&plan.close.key){board.apps=plan.close.body.filter(x=>/(십시오|하세요|해 보세요|합시다|이번 주)/.test(x)).slice(0,3).join('\n');board.auto.apps='draft'}
  const f=get('sermonFocus');if(f&&!f.value.trim()&&plan.center){f.value=plan.center;f.dispatchEvent(new Event('input',{bubbles:true}))}
  const q=get('sermonQuestion');if(q&&!q.value.trim()&&plan.open.role==='question'&&plan.open.key){q.value=plan.open.key;q.dispatchEvent(new Event('input',{bubbles:true}))}
  toForm();queueSave();queueAlign();
  const msg=`${plan.name}으로 다시 짰습니다: 들어가며 → 움직임 ${plan.moves.length}개 → 맺으며. 초안의 대지 ${plan.stats.points}개와 문장 ${plan.stats.sentences}개를 자리의 역할에 맞게 옮겼습니다.${draft?'':' (설교 초안이 없어 연구 노트로 짰습니다)'} 보고 다듬어 주세요.`;
  if(silent)get('rfStatus').textContent=msg;else say(msg)}
 function fill(text,{silent=false}={}){fromForm();const filled=[];
  const draft=String(text||currentDraft()).trim();
  const scr=scriptureNotes(),imp=importantList(),interp=sentencesOf(get('interpretation')?.value||'').filter(x=>x.length>=10&&x.length<=90&&!/^\[|https?:|출처|CC BY|사전/.test(x));
  const empty=board.moves.every(m=>!m.title);
  // v79 · 초안이 있으면 고른 논증·전달 구조의 자리에 맞춰 다시 배치한다(직접 고친 칸이 있으면 건드리지 않음)
  if(draft&&draftFits(draft)&&window.SermonForms&&board.form!==structureId()&&!board.moves.some(m=>m.auto==='user')&&!board.auto.openUser&&!board.auto.closeUser){composeNow({silent:true,draft});return silent?1:1}
  // 1) 초안의 소제목
  if(draft&&X()&&empty&&draftFits(draft)){const doc=X().parse(draft,{});const pts=doc.sections.filter(s=>s.kind==='point').slice(0,MOVES);
   if(pts.length>=2){pts.forEach((s,i)=>{const quote=s.blocks.find(b=>b.type==='quote');const first=sentencesOf(s.blocks.filter(b=>b.type!=='h').map(b=>b.lines.join(' ')).join('\n')).find(x=>x.length>=14&&x.length<=110);board.moves[i]={...board.moves[i],title:s.title,ref:s.ref||'',key:(quote?quote.lines.join(' '):first)||'',auto:'draft'}});filled.push(`움직임 ${pts.length}개(설교 초안의 소제목)`)}}
  // 2) 노트에 담은 성경 본문 + 해석 노트 (초안이 없을 때)
  if(board.moves.every(m=>!m.title)&&scr.length){scr.slice(0,MOVES).forEach((v,i)=>{board.moves[i]={...board.moves[i],title:interp[i]&&interp[i].length<=50?interp[i].replace(/[.。]$/,''):firstClause(v.text),ref:v.ref,key:interp[i]||v.text.slice(0,110),auto:interp[i]&&interp[i].length<=50?'interp':'notes'}});filled.push(`움직임 ${Math.min(scr.length,MOVES)}개(노트에 담은 말씀${interp.length?'·해석 노트':''})`)}
  // 3) 중요 자료만 있을 때
  if(board.moves.every(m=>!m.title)&&imp.length){imp.slice(0,MOVES).forEach((x,i)=>{const s=sentencesOf(x.text).find(t=>t.length>=8)||x.text;const rm=x.text.match(/·\s*([^\]\n]+\d+:\d+[^\]\n]*)\]/);board.moves[i]={...board.moves[i],title:firstClause(s),ref:rm?rm[1].trim():'',key:s.slice(0,110),auto:'important'}});filled.push(`움직임 ${Math.min(imp.length,MOVES)}개(중요 자료)`)}
  // 움직임이 3개가 안 되면 남은 해석 노트·중요 자료 문장으로 채운다(근거 절은 설계에서 본문으로 찾는다)
  {const have=board.moves.filter(m=>m.title).length;if(have&&have<3){const usedT=new Set(board.moves.map(m=>m.title));const extra=[...interp.filter(x=>x.length<=60),...imp.map(x=>sentencesOf(x.text)[0]||'')].map(x=>x.replace(/[.。]$/,'')).filter(x=>x&&x.length>=8&&!usedT.has(x));let k=have;for(const t of extra){if(k>=3)break;board.moves[k]={...board.moves[k],title:t.length>40?firstClause(t):t,ref:'',key:t,auto:'interp'};k++}if(k>have)filled.push(`움직임 ${k-have}개 더(해석 노트)`)}}
  // 근거 절이 빈 움직임은 노트의 말씀 주소로 채운다
  board.moves.forEach((m,i)=>{if(m.title&&!m.ref&&scr[i])m.ref=scr[i].ref});
  // 본문 범위: 설계 → 근거 절들 → 노트의 말씀 → 읽는 말씀
  const refs=board.moves.map(m=>m.ref).filter(Boolean);
  if(!board.passage||board.auto.passage==='reading'){const dp=W().anchor.passage,weak=!dp||dp===readingRef();const strong=derivePassage(refs)||derivePassage(scr.map(x=>x.ref))||(weak?'':dp);const p=strong||(!board.passage?readingRef():'');if(p&&p!==board.passage){board.passage=p;board.auto.passage=strong?'research':'reading';board.confirmed=false;filled.push('본문 범위')}}
  else if(board.auto.passage==='research'&&refs.length&&refs.some(r=>!inPassage(r,board.passage))){const p=derivePassage(refs);if(p&&p!==board.passage&&refs.every(r=>inPassage(r,p))){board.passage=p;board.confirmed=false;filled.push(`본문 범위를 근거 절에 맞춰 ${p}`)}}
  // 적용: 초안 → 적용 노트 → 돌봄 유형의 실천
  if(board.auto.apps==='care'&&((draft&&X()&&X().applications(draft).length)||lines(get('application')?.value).some(x=>x.length>=8))){board.apps='';delete board.auto.apps}
  if(!board.apps.trim()&&draft&&X()){const apps=X().applications(draft);if(apps.length){board.apps=apps.join('\n');board.auto.apps='draft';filled.push(`적용 ${apps.length}개(초안)`)}}
  if(!board.apps.trim()){const ap=lines(get('application')?.value).filter(x=>x.length>=8&&!/^\[|^출처|https?:|CC BY/.test(x)).slice(0,3);if(ap.length){board.apps=ap.join('\n');board.auto.apps='notes';filled.push(`적용 ${ap.length}개(적용 노트)`)}}
  const help=typeof selectedHelp==='function'?selectedHelp():null,mode=get('careMode')?.value;
  if(!board.apps.trim()&&help?.action&&!silent){board.apps='이번 주에 '+help.action.replace(/기$/,'')+'십시오.';board.auto.apps='care';filled.push('적용 1개(돌봄 유형)')}
  // 마음의 흐름 · 청중의 질문 · 중심 메시지
  if(!board.emotion){board.emotion=W().anchor.emotion||EMO[mode]||EMO.hope;if(board.emotion)filled.push('마음의 흐름')}
  const q=get('sermonQuestion');if(q&&!q.value.trim()&&help?.question&&!silent){q.value=help.question;q.dispatchEvent(new Event('input',{bubbles:true}));filled.push('청중의 질문')}
  const f=get('sermonFocus');if(f&&!f.value.trim()&&draft&&X()){const doc=X().parse(draft,{});const cq=doc.sections.flatMap(s=>s.blocks.filter(b=>b.type==='quote').map(b=>b.lines.join(' '))).find(x=>x.length>=8&&x.length<=80);if(cq){f.value=cq.replace(/[.。]$/,'');f.dispatchEvent(new Event('input',{bubbles:true}));filled.push('중심 메시지(초안의 강조 문장)')}}
  // 중요 자료를 움직임의 근거 자료로 순서대로 연결
  board.moves.forEach((m,i)=>{if(!m.source&&m.title&&imp[i])m.source=imp[i].id});
  toForm();queueSave();queueAlign();
  if(silent){if(filled.length)get('rfStatus').textContent='연구 노트의 내용으로 흐름 보드를 미리 채웠습니다: '+filled.join(' · ')+'. 보고 고쳐 주세요.';return filled.length}
  const missing=board.moves.filter(m=>m.title).length<3;
  say((filled.length?'채웠습니다: '+filled.join(' · ')+'. ':'새로 채울 빈 칸이 없습니다. ')+(missing?'움직임이 3개가 안 되면 연구 노트에서 말씀을 더 담거나 설교 초안을 만들어 보세요. ':'')+'적어 둔 내용은 그대로 두었습니다.');return filled.length;
 }
 // ── 설계로 보내기 ──
 // v66 · 설계가 비어 있으면 연구의 흐름 보드로 '빈 칸만' 조용히 채운다(검증·확인 창 없음).
 async function seedDesign(){load(false);if(board.moves.every(m=>!m.title)&&!board.passage)fill('',{silent:true});fromForm();
  const a=W().anchor,center=get('sermonFocus')?.value.trim()||'',used=board.moves.filter(m=>m.title),apps=lines(board.apps).slice(0,3);
  const lex=[...get('rfLexical').querySelectorAll('input:checked')].map(cb=>`${cb.dataset.lemma} | ${cb.dataset.ref}${inPassage(cb.dataset.ref,board.passage)?'':' | 보조'}`);
  const want={dwPassage:board.passage,dwCenter:center,dwAudience:get('sermonAudience')?.value.trim()||'',dwQuestion:get('sermonQuestion')?.value.trim()||'',dwEmotion:board.emotion,dwApplications:apps.join('\n'),dwLexical:lex.join('\n')};
  if(!a.points.length)used.slice(0,4).forEach((m,i)=>{want[`dwPoint${i}Title`]=m.title;want[`dwPoint${i}Reference`]=m.ref;want[`dwPoint${i}Opening`]=m.key});
  const patch={};for(const [id,v] of Object.entries(want))if(v&&!(get(id)?.value||'').trim())patch[id]=v;
  if(!Object.keys(patch).length)return 0;
  const flags=Object.fromEntries(['dwPassageConfirmed','dwSingle','dwQuotesChecked','dwActionsChecked','dwUnityChecked','dwLinkChecked'].map(id=>[id,get(id).checked]));if(board.confirmed&&patch.dwPassage)flags.dwPassageConfirmed=true;
  try{W().applyCorrection(patch,flags)}catch(e){return 0}
  if(board.passage&&!get('dwBible').textContent.trim()){try{const rows=await AnchorPassage.read(board.passage,get('dwEdition')?.value||'kor');get('dwBible').textContent=rows.map(r=>`${r.ref} | ${r.text}`).join('\n')}catch(e){}}
  return Object.keys(patch).length;
 }
 async function toDesign(){fromForm();persist();
  const center=get('sermonFocus')?.value.trim()||W().anchor.center,used=board.moves.filter(m=>m.title);
  if(!board.passage){say('설교 본문 범위를 적어 주세요. 예: 마태복음 9:1-8');get('rfPassage').focus();return}
  let verseCount=0;try{verseCount=(await AnchorPassage.read(board.passage,get('dwEdition')?.value||'kor')).length}catch(e){say('본문 범위를 확인해 주세요: '+e.message);get('rfPassage').focus();return}
  if(!center){say('위의 "설교의 중심 메시지"를 한 문장으로 적어 주세요.');get('sermonFocus')?.focus();return}
  if(used.length<3){say('움직임(대지)을 3개 이상 적어 주세요. 근거 절도 함께 적으면 원고 검사가 정확해집니다.');get('rfT'+used.length)?.focus();return}
  const a=W().anchor,apps=lines(board.apps).slice(0,3),lex=[...get('rfLexical').querySelectorAll('input:checked')].map(cb=>`${cb.dataset.lemma} | ${cb.dataset.ref}${inPassage(cb.dataset.ref,board.passage)?'':' | 보조'}`);
  const want={dwPassage:board.passage,dwCenter:center,dwAudience:get('sermonAudience')?.value.trim()||'',dwQuestion:get('sermonQuestion')?.value.trim()||'',dwEmotion:board.emotion,dwApplications:apps.join('\n'),dwLexical:lex.join('\n')};
  for(let i=0;i<4;i++){const m=used[i];want[`dwPoint${i}Title`]=m?.title||'';want[`dwPoint${i}Reference`]=m?.ref||'';want[`dwPoint${i}Opening`]=m?.key||''}
  const current=id=>get(id)?.value||'';const conflicts=Object.entries(want).filter(([id,v])=>v&&current(id).trim()&&current(id).trim()!==v.trim());
  let replace=true;if(conflicts.length)replace=confirm(`02 설계에 이미 적힌 내용 ${conflicts.length}칸이 흐름 보드와 다릅니다.\n[확인] 흐름 보드 내용으로 바꾸기\n[취소] 비어 있는 칸만 채우기`);
  const patch={};for(const [id,v] of Object.entries(want)){if(!v&&!/^dwPoint\d/.test(id))continue;if(replace||!current(id).trim())if(current(id)!==v)patch[id]=v}
  const flags=Object.fromEntries(['dwPassageConfirmed','dwSingle','dwQuotesChecked','dwActionsChecked','dwUnityChecked','dwLinkChecked'].map(id=>[id,get(id).checked]));if(board.confirmed){flags.dwPassageConfirmed=true;if(verseCount===1)flags.dwSingle=true}
  try{if(Object.keys(patch).length||board.confirmed)W().applyCorrection(patch,flags)}catch(e){say(e.message);return}
  try{const rows=await AnchorPassage.read(board.passage,get('dwEdition')?.value||'kor');get('dwBible').textContent=rows.map(r=>`${r.ref} | ${r.text}`).join('\n')}catch(e){}
  const ids=board.moves.map(m=>m.source).filter(Boolean);if(ids.length&&window.researchPipeline?.select)researchPipeline.select(ids);
  W().show('design');const msg=`흐름 보드의 본문·중심 메시지·대지 ${used.length}개·적용 ${apps.length}개${lex.length?'·원어 '+lex.length+'개':''}를 설계에 넣었습니다.${board.confirmed?'':' 본문 범위 확인란도 체크해 주세요.'}`;get('dwDesignStatus').textContent=msg;toast(msg);
 }
 host.addEventListener('input',e=>{e.stopPropagation();if(e.target.id==='rfPassage'){board.auto.passage='user';board.confirmed=false;get('rfConfirmed').checked=false;queueAlign()}{const m=e.target.id.match(/^rf[TKB](\d)$/);if(m&&board.moves[+m[1]])board.moves[+m[1]].auto='user'}if(e.target.id==='rfOpening')board.auto.openUser=1;if(e.target.id==='rfClosing')board.auto.closeUser=1;if(e.target.id==='rfApps')delete board.auto.apps;fromForm();queueSave();if(e.target.id==='rfPassage'){preview();paintLexical()}});
 host.addEventListener('change',e=>{if(e.target.tagName==='SELECT'){fromForm();queueSave()}});
 get('rfUseReading').onclick=()=>{const r=readingRef();if(!r){say('본문 읽기에서 말씀을 먼저 여세요.');return}const cur=get('rfPassage').value.trim();get('rfPassage').value=cur&&cur.startsWith(r.replace(/:\d+$/,''))?cur:r;board.auto.passage='user';fromForm();queueSave();preview();paintLexical();queueAlign();say('지금 읽는 말씀을 본문 범위에 넣었습니다. 여러 절이면 "마태복음 9:1-8"처럼 범위로 고쳐 주세요.')};
 get('rfFill').onclick=()=>fill();get('rfToDesign').onclick=toDesign;
 get('rfCompose').onclick=()=>{fromForm();const touched=board.moves.some(m=>m.auto==='user')||board.auto.openUser||board.auto.closeUser;if(touched&&!confirm('직접 고친 칸이 있습니다. 고른 구조로 처음부터 다시 짜면 그 내용이 바뀝니다. 계속할까요?'))return;composeNow({})};
 get('sermonStructure')?.addEventListener('change',()=>{fromForm();paintStructure();const touched=board.moves.some(m=>m.auto==='user')||board.auto.openUser||board.auto.closeUser;if(!touched&&(currentDraft()||board.moves.some(m=>m.title)))composeNow({silent:true});else if(touched)say('구조를 바꿨습니다. 직접 고친 칸이 있어 자동으로 다시 짜지 않았습니다. [이 구조로 설교 초안 다시 짜기]를 누르면 새 구조로 배치합니다.')});
 ['change','input'].forEach(t=>get('sermonStructure')?.addEventListener(t,paintStructure));document.addEventListener('click',e=>{if(e.target.closest('#rw-flow .sermon-tools'))setTimeout(paintStructure,0)});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-research-view="flow"],#rw-tab-flow');if(b)setTimeout(()=>{load(false);fill('',{silent:true});paintSources();paintLexical()},0)},true);
 document.addEventListener('study-reset',()=>{boardKey=null;board=blank();toForm()});
 // 어떤 경로로 흐름 정리를 열어도(탭·단추·이어서 하기) 지금 노트의 흐름 보드를 불러온다.
 const ws=window.researchWorkspaceApp;if(ws){const show=ws.show;ws.show=function(tab,...rest){const r=show.call(this,tab,...rest);if(tab==='flow'){load(false);fill('',{silent:true});paintSources();paintLexical()}return r}}
 const sync=()=>{if(!page.hidden){load(false);paintSources()}};document.addEventListener('research-changed',sync);document.addEventListener('sermon-work-changed',sync);
 host.addEventListener('pointerdown',()=>load(false),true);
 load(true);
 function fromDraft(text){window.researchWorkspaceApp?.show('flow');load(false);fill(text);host.scrollIntoView({block:'start',behavior:'smooth'})}
 return {fill,toDesign,seedDesign,fromDraft,align,compose:composeNow,load:()=>load(true),get board(){fromForm();return JSON.parse(JSON.stringify(board))},get structure(){return structureId()}};
})();
