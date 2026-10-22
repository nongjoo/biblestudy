'use strict';
/* v64 · 인쇄용 설교 원고
   확정한 최종 원고(없으면 현재 원고)를 A4 인쇄용 문서로 조판한다.
   1면: 표지 · 이 설교의 한 문장 · 설교 한눈에 보기(질문·흐름·대지 지도·이번 주의 한 걸음·원어)
   이어서: 오늘의 말씀 → 원고 전문(들어가며 · 대지 · 맺으며 · 기도)
   내보내기: 인쇄 · PDF 저장(브라우저 인쇄), 서체를 담은 HTML, 마크다운. 모두 기기 안에서 만든다. */
(()=>{
 const get=id=>document.getElementById(id);
 const W=()=>delegationWorkflow;
 const STORE='scripture-desk.print.v1';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ORIG=/([Ͱ-Ͽἀ-῿][̀-ͯͰ-Ͽἀ-῿]*|[֐-׿][֐-׿\/]*)/g;
 const inline=s=>esc(s).replace(ORIG,m=>`<span class="orig" lang="${/[֐-׿]/.test(m)?'he':'grc'}">${m}</span>`);
 function nextSunday(){const d=new Date();d.setDate(d.getDate()+((7-d.getDay())%7));return d.toISOString().slice(0,10)}
 function fmtDate(v){const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${+m[1]}년 ${+m[2]}월 ${+m[3]}일`:''}
 function settings(){let s={};try{s=JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(e){}return {preacher:'',church:'',service:'주일 설교',date:nextSunday(),size:'read',font:'sans',glance:true,scripture:true,...s}}
 function keep(s){try{localStorage.setItem(STORE,JSON.stringify(s))}catch(e){}}

 async function verses(passage){
  const parse=t=>t.split('\n').map(l=>{const at=l.indexOf('|');if(at<0)return null;const ref=l.slice(0,at).trim(),m=ref.match(/\.(\d+)\.(\d+)$/);return m?{c:+m[1],v:+m[2],text:l.slice(at+1).trim()}:null}).filter(Boolean);
  const box=get('dwBible')?.textContent||'';let rows=parse(box);
  if(!rows.length&&passage&&window.AnchorPassage){try{rows=(await AnchorPassage.read(passage,get('dwEdition')?.value||'kor')).map(r=>{const [,c,v]=r.ref.split('.');return {c:+c,v:+v,text:r.text}})}catch(e){rows=[]}}
  return rows.map(r=>({...r,text:r.text.replace(/\s+([!?,.])/g,'$1').replace(/`/g,'‘')}));
 }

 async function collect(){
  const w=W(),fin=w.finalCurrent()&&w.finalPacket;
  const manuscript=fin?fin.manuscript:(get('dwManuscript')?.value||'');
  if(!manuscript.trim())throw Error('인쇄할 원고가 없습니다. 03 원고에 설교 원고를 먼저 넣어 주세요.');
  const anchor=fin?fin.anchor:w.anchor;
  const doc=SermonExtract.parse(manuscript,{anchor,title:fin?.title||''});
  const title=(fin&&fin.title)||doc.title||anchor.question||anchor.center||'설교 원고';
  const passage=anchor.passage||doc.passage||'';
  let lex=[];try{lex=SermonBriefs.lexicalItems({...w.sourcePacket(),manuscript}).filter(x=>x.found)}catch(e){}
  const seen=new Set();lex=lex.filter(x=>{const k=x.lemma;if(seen.has(k))return false;seen.add(k);return true});
  const points=doc.sections.filter(s=>s.kind==='point');
  const keyOf=sec=>{const q=sec.blocks.find(b=>b.type==='quote');if(q)return q.lines.join(' ');const s=SermonExtract.splitSentences(sec.blocks.filter(b=>b.type==='p').map(b=>b.lines.join(' ')).join('\n')).find(x=>x.length>=14&&x.length<=90&&!/[?？]$/.test(x));return s||''};
  const map=(anchor.points.length?anchor.points:points.map(p=>({title:p.title,reference:p.ref}))).map((p,i)=>({title:p.title,ref:p.reference||points[i]?.ref||'',key:points[i]?keyOf(points[i]):''}));
  const apps=anchor.applications.length?anchor.applications:SermonExtract.applications(manuscript);
  const count=manuscript.replace(/\s/g,'').length;
  return {fin:!!fin,confirmedAt:fin?.confirmedAt||'',title,passage,anchor,doc,lex,map,apps,count,minutes:Math.max(1,Math.round(count/250)),verses:await verses(passage)};
 }

 function blockHTML(b){
  if(b.type==='h')return `<h3 class="sub">${inline(b.lines[0])}</h3>`;
  if(b.type==='quote')return `<blockquote class="key"><p>${b.lines.map(inline).join('<br>')}</p></blockquote>`;
  if(b.type==='cadence')return `<div class="cadence">${b.lines.map(l=>`<p>${inline(l)}</p>`).join('')}</div>`;
  if(b.type==='apply')return `<p class="apply"><span class="tag">적용</span>${b.lines.map(inline).join('<br>')}</p>`;
  return `<p>${b.lines.map(inline).join('<br>')}</p>`;
 }
 function sectionHTML(s){
  const body=s.blocks.map(blockHTML).join('\n');
  if(s.kind==='point')return `<section class="point"><header class="point-head"><span class="no">${String(s.n).padStart(2,'0')}</span><div><h2>${inline(s.title)}</h2>${s.ref?`<p class="ref">${esc(s.ref)}</p>`:''}</div></header>${body}</section>`;
  if(s.kind==='prayer')return `<section class="prayer"><h2 class="sec">${esc(s.title||'함께 드리는 기도')}</h2>${body}</section>`;
  if(s.kind==='scripture')return `<section class="sec-block"><h2 class="sec">${esc(s.title)}</h2>${body}</section>`;
  const label=s.title||(s.kind==='intro'?'들어가며':s.kind==='conclusion'?'맺으며':'');
  return `<section class="sec-block ${s.kind}">${label?`<h2 class="sec">${esc(label)}</h2>`:''}${body}</section>`;
 }

 const CSS=`
 :root{--ink:#17201d;--ink2:#3b4642;--muted:#6f7772;--brand:#1f3d36;--gold:#a8823f;--gold-soft:#f4ecdc;--line:#e3ddd0;--paper:#fffdf8;--tint:#f3f6f3;--fs:10.8pt}
 .size-pulpit{--fs:13.4pt}
 *{box-sizing:border-box}
 html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
 body{margin:0;background:#e8e4da;color:var(--ink);font-family:"Pretendard Variable",Pretendard,"Malgun Gothic","Apple SD Gothic Neo",sans-serif;font-size:var(--fs);line-height:1.8;word-break:keep-all;overflow-wrap:anywhere;letter-spacing:-.005em}
 .serif-body .body p,.serif-body .body .cadence p,.serif-body .scripture p{font-family:"Noto Serif KR","Nanum Myeongjo","나눔명조","Batang","바탕",serif;letter-spacing:0}
 .sheet{width:210mm;min-height:297mm;margin:12mm auto;background:var(--paper);padding:20mm 19mm 22mm;box-shadow:0 2px 6px rgba(0,0,0,.08),0 24px 60px -24px rgba(0,0,0,.28)}
 .eyebrow{display:flex;justify-content:space-between;gap:12px;font-size:8.6pt;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);font-weight:700;border-bottom:1.4pt solid var(--brand);padding-bottom:3.2mm}
 .eyebrow span:last-child{letter-spacing:.02em;text-transform:none;color:var(--ink2);font-weight:600}
 .cover{padding-top:1mm}
 .cover h1{font-size:27pt;line-height:1.22;letter-spacing:-.03em;margin:7mm 0 2.5mm;font-weight:800;color:var(--brand)}
 .cover .passage{display:inline-flex;align-items:center;gap:2.4mm;font-weight:700;font-size:11.5pt;color:var(--ink2)}
 .cover .passage:before{content:"";width:9mm;height:1.2pt;background:var(--gold)}
 .center{margin:5mm 0 0;padding:4.6mm 6mm;background:var(--brand);color:#fff;border-radius:3.5mm;position:relative}
 .center .label{display:block;font-size:8pt;letter-spacing:.16em;color:#e2c58d;font-weight:700;margin-bottom:1.6mm}
 .center p{margin:0;font-size:14pt;line-height:1.5;font-weight:700;letter-spacing:-.015em}
 .meta{display:flex;flex-wrap:wrap;gap:1.5mm 5mm;margin-top:3mm;font-size:8.6pt;color:var(--muted)}
 .glance{margin-top:5mm;border:1pt solid var(--line);border-radius:3.5mm;padding:5mm 6mm;background:#fff}
 .kicker{margin:0 0 3mm;font-size:9pt;letter-spacing:.16em;color:var(--gold);font-weight:800}
 .label{font-size:8pt;letter-spacing:.08em;color:var(--muted);font-weight:700}
 .glance-row{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-bottom:3.4mm}
 .glance-row p{margin:.8mm 0 0;font-size:9.6pt;line-height:1.55;font-weight:600;color:var(--ink)}
 ol.map{list-style:none;margin:0 0 3.4mm;padding:0;display:grid;gap:0}
 ol.map li{display:grid;grid-template-columns:10mm 1fr;gap:3mm;align-items:start;padding:2mm 0;border-top:.6pt solid var(--line);break-inside:avoid}
 ol.map .no{font-weight:800;font-size:13pt;color:var(--gold);line-height:1.2}
 ol.map b{display:block;font-size:10pt;line-height:1.45;color:var(--brand)}
 ol.map em{font-style:normal;font-size:8.4pt;color:var(--muted);font-weight:600;margin-left:1.5mm}
 ol.map p{margin:.5mm 0 0;font-size:8.8pt;line-height:1.5;color:var(--ink2)}
 .acts{background:var(--gold-soft);border-radius:2.5mm;padding:3.4mm 4.6mm;margin-bottom:3.4mm;break-inside:avoid}
 .acts ul{list-style:none;margin:1.5mm 0 0;padding:0}
 .acts li{position:relative;padding-left:7mm;font-size:9.2pt;line-height:1.55;margin:1mm 0;font-weight:600}
 .acts li:before{content:"";position:absolute;left:0;top:1.2mm;width:3.6mm;height:3.6mm;border:1.1pt solid var(--gold);border-radius:.8mm;background:#fff}
 .words{display:flex;flex-wrap:wrap;gap:2mm;align-items:center}
 .words .label{width:100%}
 .chip{display:inline-flex;gap:1.4mm;align-items:baseline;border:.8pt solid var(--line);border-radius:10mm;padding:.9mm 3mm;font-size:8.4pt;background:var(--tint)}
 .chip .orig{font-size:10.5pt}
 .chip small{color:var(--muted);font-size:7.6pt}
 .orig{font-family:"Gentium Plus","SBL Greek","Times New Roman","Noto Serif",serif;font-style:italic;color:var(--brand);font-weight:600;letter-spacing:0}
 .orig[lang=he]{font-style:normal;font-family:"SBL Hebrew","Ezra SIL","Times New Roman",serif}
 .scripture{margin-top:7mm;padding:6mm 7mm;border-left:2.2pt solid var(--gold);background:var(--tint);border-radius:0 3mm 3mm 0;break-inside:avoid}
 .scripture h2{margin:0 0 2.5mm;font-size:10pt;letter-spacing:.06em;color:var(--brand)}
 .scripture p{margin:0;font-size:calc(var(--fs) * .95);line-height:1.85;color:var(--ink2)}
 .scripture sup{font-size:7pt;color:var(--gold);font-weight:800;margin:0 .8mm 0 1.2mm;vertical-align:.45em;font-family:"Pretendard Variable",Pretendard,"Malgun Gothic",sans-serif}
 .body{margin-top:8mm}
 .body p{margin:0 0 2.3mm;orphans:2;widows:2;text-align:justify;text-justify:inter-character}
 h2.sec{display:flex;align-items:center;gap:3mm;margin:9mm 0 4mm;font-size:9.5pt;letter-spacing:.2em;color:var(--gold);font-weight:800;break-after:avoid}
 h2.sec:after{content:"";flex:1;height:.6pt;background:var(--line)}
 .sec-block:first-child h2.sec{margin-top:0}
 .point{margin-top:8mm}
 .point-head{display:grid;grid-template-columns:auto 1fr;gap:4mm;align-items:center;padding:4mm 0 4mm;margin-bottom:4.5mm;border-top:1.4pt solid var(--brand);border-bottom:.6pt solid var(--line);break-after:avoid;break-inside:avoid}
 .point-head .no{font-size:26pt;font-weight:800;color:var(--gold);line-height:1;letter-spacing:-.04em}
 .point-head h2{margin:0;font-size:15pt;line-height:1.38;color:var(--brand);letter-spacing:-.02em}
 .point-head .ref{margin:1mm 0 0 !important;font-size:8.8pt;font-weight:700;color:var(--muted);text-align:left !important}
 h3.sub{font-size:11pt;color:var(--brand);margin:6mm 0 2.5mm;break-after:avoid}
 blockquote.key{margin:5mm 0;padding:3.6mm 0 3.6mm 6mm;border-left:2.4pt solid var(--gold);break-inside:avoid}
 blockquote.key p{margin:0 !important;font-size:calc(var(--fs) * 1.16);line-height:1.6;font-weight:700;color:var(--brand);text-align:left !important}
 .cadence{margin:3mm 0 3.6mm;padding-left:6mm;border-left:.8pt solid var(--gold)}
 .cadence p{margin:0 0 .6mm !important;text-align:left !important;color:var(--ink)}
 p.apply{background:var(--gold-soft);border-radius:2mm;padding:2.8mm 4mm;text-align:left !important;font-weight:600;break-inside:avoid}
 p.apply .tag{display:inline-block;font-size:7.6pt;font-weight:800;color:#fff;background:var(--gold);border-radius:1mm;padding:.2mm 1.6mm;margin-right:2mm;vertical-align:.12em;letter-spacing:.06em}
 .prayer{margin-top:8mm;padding:6mm 7mm;border:1pt solid var(--line);border-radius:3.5mm;background:#fff;break-inside:avoid}
 .prayer h2.sec{margin-top:0}
 .prayer p{font-style:normal;color:var(--ink2)}
 .colophon{margin-top:12mm;padding-top:3mm;border-top:.6pt solid var(--line);display:flex;justify-content:space-between;gap:4mm;font-size:7.8pt;color:var(--muted)}
 .page-break{break-before:page}
 @media screen{.page-break{height:0;margin:10mm -19mm;border-top:1px dashed #d8d2c4}}
 @page{size:A4;margin:14mm 17mm 17mm}
 @page{@bottom-center{content:counter(page) " / " counter(pages);font-family:"Pretendard Variable",Pretendard,"Malgun Gothic",sans-serif;font-size:8pt;color:#8a918d}}
 @media print{body{background:none}.sheet{width:auto;min-height:0;margin:0;padding:0;box-shadow:none;background:none}.no-print{display:none}}
 @media screen and (max-width:820px){.sheet{width:auto;margin:0;padding:9mm 6mm;box-shadow:none}.glance-row{grid-template-columns:1fr}.cover h1{font-size:24pt}}
 `;

 function html(d,o,{fontFace=''}={}){
  const a=d.anchor;
  const head=[o.service||'주일 설교',[fmtDate(o.date),o.church,o.preacher].filter(Boolean).join(' · ')];
  const glance=o.glance?`<section class="glance" aria-label="설교 한눈에 보기"><h2 class="kicker">설교 한눈에 보기</h2>
   ${(a.question||a.emotion)?`<div class="glance-row">${a.question?`<div><span class="label">여는 질문</span><p>${inline(a.question)}</p></div>`:''}${a.emotion?`<div><span class="label">마음의 흐름</span><p>${inline(a.emotion)}</p></div>`:''}</div>`:''}
   ${d.map.length?`<span class="label">말씀의 길 · 대지</span><ol class="map">${d.map.map((p,i)=>`<li><span class="no">${String(i+1).padStart(2,'0')}</span><div><b>${inline(p.title)}${p.ref?`<em>${esc(p.ref)}</em>`:''}</b>${p.key?`<p>${inline(p.key)}</p>`:''}</div></li>`).join('')}</ol>`:''}
   ${d.apps.length?`<div class="acts"><span class="label">이번 주의 한 걸음</span><ul>${d.apps.map(x=>`<li>${inline(x)}</li>`).join('')}</ul></div>`:''}
   ${d.lex.length?`<div class="words"><span class="label">원어로 읽기</span>${d.lex.map(x=>`<span class="chip"><span class="orig" lang="${x.lang==='히브리어'?'he':'grc'}">${esc(x.lemma)}</span>${x.translit?`<span>${esc(x.translit)}</span>`:''}${x.gloss?`<span>· ${esc(x.gloss)}</span>`:''}${x.reference?`<small>${esc(x.reference)}</small>`:''}</span>`).join('')}</div>`:''}
  </section>`:'';
  const scripture=o.scripture&&d.verses.length?(()=>{const multi=new Set(d.verses.map(v=>v.c)).size>1;return `<section class="scripture"><h2>오늘의 말씀 · ${esc(d.passage)}</h2><p>${d.verses.map(v=>`<sup>${multi?v.c+':':''}${v.v}</sup>${esc(v.text)}`).join(' ')}</p></section>`})():'';
  const sections=d.doc.sections.map(sectionHTML).join('\n');
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.title)} · ${esc(d.passage)}</title><style>${fontFace}${CSS}</style></head>
<body class="${o.size==='pulpit'?'size-pulpit':''} ${o.font==='serif'?'serif-body':''}"><article class="sheet">
<header class="cover"><div class="eyebrow"><span>${esc(head[0])}</span><span>${esc(head[1])}</span></div>
<h1>${inline(d.title)}</h1>${d.passage?`<div class="passage">${esc(d.passage)}</div>`:''}
${a.center?`<div class="center"><span class="label">이 설교의 한 문장</span><p>${inline(a.center)}</p></div>`:''}
<div class="meta"><span>원고 공백 제외 ${d.count.toLocaleString()}자</span><span>낭독 약 ${d.minutes}분</span>${a.audience?`<span>청중 · ${esc(a.audience)}</span>`:''}</div></header>
${glance}
${scripture}
<main class="body">${sections}</main>
<footer class="colophon"><span>${esc(d.title)} · ${esc(d.passage)}</span><span>${d.fin?'확정 원고':'작성 중 원고'}${d.confirmedAt?' · '+esc(d.confirmedAt.slice(0,10)):''} · 말씀연구실</span></footer>
</article></body></html>`;
 }

 function markdown(d,o){
  const a=d.anchor,out=[];
  out.push(`# ${d.title}`,'',`**${o.service||'주일 설교'}** · ${[fmtDate(o.date),o.church,o.preacher].filter(Boolean).join(' · ')}`,'',`본문: ${d.passage}`,'');
  if(a.center)out.push(`> **이 설교의 한 문장** — ${a.center}`,'');
  out.push('## 설교 한눈에 보기','');
  if(a.question)out.push(`- **여는 질문** · ${a.question}`);if(a.emotion)out.push(`- **마음의 흐름** · ${a.emotion}`);
  if(d.map.length){out.push('- **말씀의 길**');d.map.forEach((p,i)=>out.push(`  ${i+1}. **${p.title}**${p.ref?` (${p.ref})`:''}${p.key?` — ${p.key}`:''}`))}
  if(d.apps.length){out.push('- **이번 주의 한 걸음**');d.apps.forEach(x=>out.push(`  - [ ] ${x}`))}
  if(d.lex.length){out.push('- **원어로 읽기**');d.lex.forEach(x=>out.push(`  - ${x.lemma}${x.translit?` (${x.translit})`:''}${x.gloss?` · ${x.gloss}`:''}${x.reference?` · ${x.reference}`:''}`))}
  out.push('');
  if(d.verses.length){out.push(`## 오늘의 말씀 · ${d.passage}`,'',d.verses.map(v=>`<sup>${v.v}</sup>${v.text}`).join(' '),'')}
  out.push('---','');
  for(const s of d.doc.sections){
   if(s.kind==='point')out.push(`## ${s.n}. ${s.title}${s.ref?` (${s.ref})`:''}`,'');
   else out.push(`## ${s.title||(s.kind==='intro'?'들어가며':s.kind==='conclusion'?'맺으며':s.kind==='prayer'?'함께 드리는 기도':'')}`,'');
   for(const b of s.blocks){
    if(b.type==='h')out.push(`### ${b.lines[0]}`,'');
    else if(b.type==='quote')out.push(b.lines.map(l=>`> **${l}**`).join('\n'),'');
    else if(b.type==='cadence')out.push(b.lines.join('  \n'),'');
    else if(b.type==='apply')out.push(`> ✅ **적용** · ${b.lines.join(' ')}`,'');
    else out.push(b.lines.join('  \n'),'');
   }
  }
  out.push('---',`*${d.fin?'확정 원고':'작성 중 원고'} · 공백 제외 ${d.count.toLocaleString()}자 · 낭독 약 ${d.minutes}분 · 말씀연구실*`);
  return out.join('\n');
 }

 let fontCache='';
 async function embeddedFont(){if(fontCache)return fontCache;try{const buf=await (await fetch('fonts/PretendardVariable.woff2')).arrayBuffer();let bin='';const bytes=new Uint8Array(buf);for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));fontCache=`@font-face{font-family:"Pretendard Variable";font-weight:45 920;font-style:normal;src:url(data:font/woff2;base64,${btoa(bin)}) format("woff2")}`}catch(e){fontCache=''}return fontCache}
 const fileName=(d,ext)=>`${d.title} - ${d.passage||'설교'}`.replace(/[\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim().slice(0,80)+'.'+ext;

 // ── 미리보기 대화상자 ──
 let dialog,data=null;
 function ui(){
  if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.id='spDialog';dialog.className='sp-dialog';dialog.setAttribute('aria-labelledby','spTitle');
  dialog.innerHTML=`<div class="sp-bar"><div class="sp-head"><p class="sp-eyebrow">인쇄용 설교 원고</p><h2 id="spTitle">원고 미리보기</h2><p id="spSource" class="sp-source"></p></div>
  <div class="sp-fields"><label>예배<input id="spService" placeholder="주일 설교"></label><label>설교 일자<input id="spDate" type="date"></label><label>교회<input id="spChurch" placeholder="선택"></label><label>설교자<input id="spPreacher" placeholder="선택"></label>
  <label>글자 크기<select id="spSize"><option value="read">읽기용 · 10.8pt</option><option value="pulpit">강단용 · 13.4pt</option></select></label><label>본문 서체<select id="spFont"><option value="sans">고딕 · Pretendard</option><option value="serif">명조 · 바탕 계열</option></select></label>
  <label class="sp-check"><input id="spGlance" type="checkbox"> 한눈에 보기</label><label class="sp-check"><input id="spScripture" type="checkbox"> 오늘의 말씀</label></div>
  <div class="sp-actions"><button id="spPrint" class="primary" type="button">인쇄 · PDF로 저장</button><button id="spHtml" type="button">HTML 내려받기</button><button id="spMd" type="button">마크다운 내려받기</button><button id="spClose" type="button">닫기</button></div><p id="spStatus" class="sp-status" role="status"></p></div>
  <iframe id="spFrame" title="인쇄용 원고 미리보기"></iframe>`;
  document.body.append(dialog);
  const o=settings();get('spService').value=o.service;get('spDate').value=o.date;get('spChurch').value=o.church;get('spPreacher').value=o.preacher;get('spSize').value=o.size;get('spFont').value=o.font;get('spGlance').checked=o.glance;get('spScripture').checked=o.scripture;
  const read=()=>({service:get('spService').value.trim(),date:get('spDate').value,church:get('spChurch').value.trim(),preacher:get('spPreacher').value.trim(),size:get('spSize').value,font:get('spFont').value,glance:get('spGlance').checked,scripture:get('spScripture').checked});
  let timer;dialog.addEventListener('input',e=>{e.stopPropagation();clearTimeout(timer);timer=setTimeout(()=>{keep(read());render()},180)});
  dialog.addEventListener('change',e=>e.stopPropagation());
  get('spClose').onclick=()=>dialog.close();
  get('spPrint').onclick=()=>{const f=get('spFrame');try{f.contentWindow.focus();f.contentWindow.print();say('인쇄 창에서 [대상: PDF로 저장]을 고르면 PDF 파일로 저장됩니다.')}catch(e){say('인쇄 창을 열지 못했습니다. HTML을 내려받아 브라우저에서 인쇄해 주세요.')}};
  get('spHtml').onclick=async()=>{if(!data)return;say('서체를 담은 HTML을 만드는 중입니다…');const page=html(data,read(),{fontFace:await embeddedFont()});download(fileName(data,'html'),page,'text/html;charset=utf-8');say('HTML을 내려받았습니다. 어느 PC에서 열어도 같은 서체로 보이고, 브라우저에서 바로 인쇄할 수 있습니다.')};
  get('spMd').onclick=()=>{if(!data)return;download(fileName(data,'md'),markdown(data,read()),'text/markdown;charset=utf-8');say('마크다운 원고를 내려받았습니다.')};
  dialog.read=read;return dialog;
 }
 const say=t=>{const e=get('spStatus');if(e)e.textContent=t};
 function render(){if(!data)return;const page=html(data,dialog.read()).replace('<head>',`<head><base href="${location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,'')}"><style>@font-face{font-family:"Pretendard Variable";font-weight:45 920;src:url("fonts/PretendardVariable.woff2") format("woff2")}</style>`);get('spFrame').srcdoc=page}
 async function open(){
  ui();
  try{const sd=typeof notes!=='undefined'&&typeof noteTarget==='function'?notes[noteTarget()]?.sermonDate:'';if(sd)get('spDate').value=sd}catch(e){}
  try{data=await collect()}catch(e){if(typeof toast==='function')toast(e.message);return}
  get('spSource').textContent=`${data.fin?'확정된 최종 원고':'아직 확정하지 않은 현재 원고'} · ${data.title} · ${data.passage} · 대지 ${data.map.length}개 · 적용 ${data.apps.length}개${data.lex.length?` · 원어 ${data.lex.length}개`:''}`;
  say('');render();if(!dialog.open)dialog.showModal();
 }
 window.SermonPrint={open,collect,html,markdown};
})();
