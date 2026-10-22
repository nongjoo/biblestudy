'use strict';
/* v76 · 내 번역으로 바꾸기
   앱에 든 한국어 본문은 저작권이 끝난 옛 공개본(개역한글 계열)입니다. 개역개정·새번역 같은 현대 번역은 앱에 담을 수 없어서,
   설교자가 공식 사이트에서 직접 읽고 복사한 말씀을 이 컴퓨터에만 저장해 옛 본문 대신 씁니다.
   - 저장: localStorage 'scripture-desk.my-translation.v1' (이 브라우저에만, 배포 파일에 들어가지 않음)
   - 적용: data/kor/책.json 을 읽을 때 저장한 절을 덮어써서, 본문 읽기·설계·원고·인쇄·제작이 모두 같은 번역을 쓴다. */
window.MyTranslation=(()=>{
 const STORE='scripture-desk.my-translation.v1';
 const EDITIONS=[['GAE','개역개정'],['SAENEW','새번역'],['SAE','표준새번역'],['COGNEW','공동번역 개정판'],['COG','공동번역'],['HAN','개역한글'],['ETC','기타 번역']];
 let st={on:true,edition:'GAE',verses:{},full:null};
 try{const s=JSON.parse(localStorage.getItem(STORE)||'null');if(s&&typeof s==='object'){st.on=s.on!==false;st.edition=typeof s.edition==='string'?s.edition:'GAE';st.verses=s.verses&&typeof s.verses==='object'?s.verses:{};st.full=s.full&&typeof s.full==='object'?s.full:null}}catch(e){}
 const orig={}; // 덮어쓰기 전 옛 공개본 (읽은 책만)
 const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(st));return true}catch(e){try{toast('저장 공간이 부족해 내 번역을 저장하지 못했습니다.')}catch(_){}return false}};
 const edName=id=>(EDITIONS.find(e=>e[0]===id)||[id,id])[1];
 const has=ref=>st.on&&!!st.verses[ref]?.t;
 // 1) 한국어 본문 파일을 읽을 때 내 번역을 덮어쓴다
 const realFetch=window.fetch.bind(window);
 function overlay(bookId,json){for(const [ref,val] of Object.entries(st.verses)){const [bb,cc,vv]=ref.split('.');if(bb!==bookId||!val?.t)continue;json[cc]||={};if(orig[ref]===undefined)orig[ref]=json[cc][vv]??'';if(st.on)json[cc][vv]=val.t}return json}
 window.fetch=function(input,init){const url=typeof input==='string'?input:input?.url||'';const m=url.match(/(?:^|\/)data\/kor\/([A-Z0-9]{3})\.json(?:\?|$)/);
  if(!m)return realFetch(input,init);
  return realFetch(input,init).then(async r=>{if(!r.ok)return r;const json=await r.clone().json();const book=m[1];for(const [ref] of Object.entries(st.verses)){const [bb,cc,vv]=ref.split('.');if(bb===book&&orig[ref]===undefined)orig[ref]=json[cc]?.[vv]??''}
   if(fullOn()){try{const fb=await idbGet(book);if(fb){origBook[book]=JSON.parse(JSON.stringify(json));for(const [cc,vs] of Object.entries(fb)){json[cc]||={};for(const [vv,t] of Object.entries(vs))json[cc][vv]=t}}}catch(e){}}
   if(st.on)overlay(book,json);return new Response(JSON.stringify(json),{status:200,headers:{'Content-Type':'application/json'}})})};
 // 이미 읽어 둔 본문(캐시)에도 바로 반영
 async function patchCache(ref,text){const [bb,cc,vv]=ref.split('.');try{const p=typeof cache!=='undefined'&&cache.get('kor/'+bb);if(p){const obj=await p;obj[cc]||={};if(orig[ref]===undefined)orig[ref]=obj[cc][vv]??'';obj[cc][vv]=text??orig[ref]}}catch(e){}}
 async function setVerse(ref,text){text=String(text||'').replace(/\s+/g,' ').trim();if(!text)return false;st.verses[ref]={t:text,ed:st.edition,at:new Date().toISOString().slice(0,10)};if(!save())return false;if(st.on)await patchCache(ref,text);return true}
 async function clearVerse(ref){if(!st.verses[ref])return;delete st.verses[ref];save();await patchCache(ref,null)}
 function refreshViews(){try{if(typeof render==='function'&&typeof v!=='undefined'){const keep=v;render().then(()=>{try{selectVerse(keep)}catch(e){}})}}catch(e){}
  try{const box=document.getElementById('dwBible');if(box&&box.textContent.trim()){box.textContent=box.textContent.split('\n').map(l=>{const at=l.indexOf('|');if(at<0)return l;const r=l.slice(0,at).trim();return has(r)?`${r} | ${st.verses[r].t}`:(orig[r]!==undefined&&!st.verses[r]?`${r} | ${orig[r]}`:l)}).join('\n')}}catch(e){}
  document.dispatchEvent(new Event('sermon-work-changed'))}
 // 2) 붙여 넣은 여러 절 나누기: "1 태초에 … 2 땅이 …" / 줄마다 "1. …" / "9:1 …"
 function splitVerses(raw,chapter){let s=String(raw||'').replace(/\r/g,'').replace(/[ \t]+/g,' ').trim();if(!s)return [];
  s=s.replace(/(^|\s)(\d{1,3})\s*:\s*(\d{1,3})\s+/g,(m0,p,cc,vv)=>(+cc===+chapter?`${p}${vv} `:m0));
  const re=/(^|[\s"“'‘(])(\d{1,3})(?:절)?[.)]?\s+(?=[^\d\s])/g;const hits=[];let m;while((m=re.exec(s))){hits.push({n:+m[2],at:m.index+m[1].length,start:re.lastIndex})}
  const seq=[];let last=0;for(const h of hits){if(h.n>last&&h.n<=last+3||(!seq.length&&h.n>=1)){seq.push(h);last=h.n}}
  return seq.map((h,i)=>({n:h.n,t:s.slice(h.start,i+1<seq.length?seq[i+1].at:s.length).replace(/\s*\d+\)\s*/g,' ').replace(/\s+/g,' ').trim()})).filter(x=>x.t)}
 // 3) 대화창
 const el=(tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const [k,val] of Object.entries(attrs)){if(k==='class')e.className=val;else if(k==='text')e.textContent=val;else if(k.startsWith('on'))e[k]=val;else if(val!=null)e.setAttribute(k,val)}kids.flat().forEach(k=>k!=null&&e.append(k));return e};
 function bskUrl(bb,cc,vv){return 'https://www.bskorea.or.kr/bible/korbibReadpage.php?'+new URLSearchParams({version:st.edition==='ETC'?'GAE':st.edition,book:bb==='JON'?'jnh':bb.toLowerCase(),chap:String(cc),sec:String(vv)})}
 // ── v77 · 전체 성경을 이 번역으로: 설교자가 정식으로 가진 번역본 파일 하나를 읽어 66권 전체를 바꾼다 ──
 // 앱은 인터넷에서 번역본을 내려받지 않는다(저작권·사이트 이용 조건). 파일은 이 브라우저의 IndexedDB에만 저장한다.
 const IDB='scripture-desk-mytr',fullOn=()=>st.on&&!!st.full?.on;
 const origBook={}; // 전체 번역으로 덮기 전 옛 공개본 (읽은 책만)
 function idb(){return new Promise((res,rej)=>{const r=indexedDB.open(IDB,1);r.onupgradeneeded=()=>r.result.createObjectStore('books');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
 async function idbGet(book){const db=await idb();return new Promise(res=>{const q=db.transaction('books').objectStore('books').get(book);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})}
 async function idbPutAll(map){const db=await idb();return new Promise((res,rej)=>{const tx=db.transaction('books','readwrite'),os=tx.objectStore('books');os.clear();for(const [k,val] of Object.entries(map))os.put(val,k);tx.oncomplete=()=>res(true);tx.onerror=()=>rej(tx.error)})}
 async function idbClear(){const db=await idb();return new Promise(res=>{const tx=db.transaction('books','readwrite');tx.objectStore('books').clear();tx.oncomplete=()=>res(true);tx.onerror=()=>res(false)})}
 const origText=ref=>{const [bb,cc,vv]=ref.split('.');return orig[ref]!==undefined?orig[ref]:origBook[bb]?.[cc]?.[vv]};
 // 책 이름 인식: 앱의 책 이름·약칭·영문 코드 + 자주 쓰는 다른 표기
 const ALIAS={GEN:'Gen Ge Gn',EXO:'Exod Ex Exo',LEV:'Lev Lv',NUM:'Num Nm Nu',DEU:'Deut Dt De',JOS:'Josh Jos',JDG:'Judg Jdg Jg',RUT:'Ruth Ru Rth','1SA':'1Sam 1Sa 1Samuel 삼상','2SA':'2Sam 2Sa 2Samuel','1KI':'1Kgs 1Ki 1Kings','2KI':'2Kgs 2Ki 2Kings','1CH':'1Chr 1Ch','2CH':'2Chr 2Ch',EZR:'Ezra Ezr',NEH:'Neh Ne',EST:'Esth Est',JOB:'Job Jb',PSA:'Ps Psa Psalm Psalms Pss 시편 시',PRO:'Prov Pr Prv',ECC:'Eccl Ec Ecc Qoh',SNG:'Song Sng SoS Cant 아가서',ISA:'Isa Is',JER:'Jer Je',LAM:'Lam La',EZK:'Ezek Eze Ezk',DAN:'Dan Da Dn',HOS:'Hos Ho',JOL:'Joel Jl',AMO:'Amos Am',OBA:'Obad Ob',JON:'Jonah Jon Jnh',MIC:'Mic Mi',NAM:'Nah Na',HAB:'Hab Hb',ZEP:'Zeph Zep Zp',HAG:'Hag Hg',ZEC:'Zech Zec Zc',MAL:'Mal Ml',MAT:'Matt Mt Mat',MRK:'Mark Mk Mrk Mar',LUK:'Luke Lk Luk',JHN:'John Jn Jhn Joh',ACT:'Acts Ac Act',ROM:'Rom Ro Rm','1CO':'1Cor 1Co','2CO':'2Cor 2Co',GAL:'Gal Ga',EPH:'Eph',PHP:'Phil Php Pp',COL:'Col','1TH':'1Thess 1Th','2TH':'2Thess 2Th','1TI':'1Tim 1Ti','2TI':'2Tim 2Ti',TIT:'Titus Tit',PHM:'Phlm Phm Philem',HEB:'Heb',JAS:'Jas Jm James',  '1PE':'1Pet 1Pe 1Pt','2PE':'2Pet 2Pe 2Pt','1JN':'1John 1Jn 1Jo 요한1서 요1','2JN':'2John 2Jn 2Jo 요한2서 요2','3JN':'3John 3Jn 3Jo 요한3서 요3',JUD:'Jude Jud',REV:'Rev Re Rv 계시록'};
 let bookIndex=null;
 function bookOf(name){if(!bookIndex){bookIndex=new Map();(typeof books!=='undefined'?books:[]).forEach((bk,i)=>{for(const n of [bk.id,bk.name,bk.short,String(i+1),...(ALIAS[bk.id]||'').split(' ')].filter(Boolean))bookIndex.set(String(n).toLowerCase().replace(/[\s.]/g,''),bk.id)})}
  return bookIndex.get(String(name||'').toLowerCase().replace(/[\s.]/g,''))||null}
 // 여러 형식의 성경 파일 읽기
 //  · 한 줄 한 절: "창1:1 태초에…", "창세기 1:1 …", "Gen 1:1 …", "창 1장 1절 …"
 //  · 표 형식: "창,1,1,태초에…" / 탭 구분 / "1,1,1,…"(책 번호)
 //  · 머리글 방식: "창세기" → "1장" → "1 태초에…" 또는 "1:1 태초에…"
 //  · JSON: {"GEN":{"1":{"1":"…"}}}
 function parseBible(raw,{dropHeads=true}={}){const map={};let count=0,cur=null,curC=0;const bad=[];
  const put=(bk,cc,vv,t)=>{t=String(t||'');if(dropHeads)t=t.replace(/<[^>]{1,40}>/g,' ');t=t.replace(/\s+/g,' ').trim();if(!bk||!cc||!vv||!t)return false;((map[bk]||={})[cc]||={})[vv]=t;count++;return true};
  const s=String(raw||'').replace(/^﻿/,'');
  if(/^\s*\{/.test(s)){try{const j=JSON.parse(s);const src=j.books&&typeof j.books==='object'?j.books:j;for(const [k,chs] of Object.entries(src)){const bk=bookOf(k);if(!bk||typeof chs!=='object')continue;for(const [cc,vs] of Object.entries(chs))for(const [vv,t] of Object.entries(vs||{}))if(typeof t==='string')put(bk,+cc,+vv,t)}return {map,count,bad}}catch(e){bad.push('JSON 형식을 읽지 못했습니다.')}}
  for(const line0 of s.split(/\r?\n/)){const line=line0.trim();if(!line)continue;let m;
   const cells=line.includes('\t')?line.split('\t'):(/^[^,]{1,12},\s*\d+\s*,\s*\d+\s*,/.test(line)?line.split(','):[]);
   if(cells.length>=4&&/^\d+$/.test(cells[1].trim())&&/^\d+$/.test(cells[2].trim())){const bk=bookOf(cells[0].trim());if(bk&&put(bk,+cells[1],+cells[2],cells.slice(3).join(',').replace(/^"|"$/g,'')))continue}
   if((m=line.match(/^([1-3]?\s?[가-힣A-Za-z]{1,12}(?:[1-3]서)?\.?)\s*(\d{1,3})\s*(?::|장\s*|\.)\s*(\d{1,3})\s*절?\s*[:|]?\s+(.+)$/))){const bk=bookOf(m[1]);if(bk){cur=bk;curC=+m[2];put(bk,+m[2],+m[3],m[4]);continue}}
   if((m=line.match(/^([1-3]?\s?[가-힣A-Za-z]{1,12}(?:[1-3]서)?)\s*(?:(\d{1,3})\s*(?:장|편))?$/))&&bookOf(m[1])){cur=bookOf(m[1]);if(m[2])curC=+m[2];continue}
   if((m=line.match(/^(?:제\s*)?(\d{1,3})\s*(?:장|편)$/))){curC=+m[1];continue}
   if(cur&&(m=line.match(/^(\d{1,3})\s*:\s*(\d{1,3})\s+(.+)$/))){curC=+m[1];put(cur,+m[1],+m[2],m[3]);continue}
   if(cur&&curC&&(m=line.match(/^(\d{1,3})\s*[.)]?\s+(.+)$/))){put(cur,curC,+m[1],m[2]);continue}
   if(bad.length<6)bad.push(line.slice(0,60))}
  return {map,count,bad}}
 async function decode(file){const buf=await file.arrayBuffer();try{return new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(e){try{return new TextDecoder('euc-kr').decode(buf)}catch(_){return new TextDecoder('utf-8').decode(buf)}}}
 function fullPane(status){
  const nameIn=el('input',{type:'text',placeholder:'예: 개역개정',value:st.full?.name||edName(st.edition==='ETC'?'GAE':st.edition)});
  const fileIn=el('input',{type:'file',accept:'.txt,.csv,.tsv,.json,text/plain',hidden:''});
  const drop=el('label',{},el('input',{type:'checkbox',checked:'checked'}),' 본문 사이의 소제목 <…> 빼기');const dropBox=drop.querySelector('input');
  const report=el('div',{class:'mytr-preview'});let parsed=null,fname='';
  const cur=el('p',{class:'mytr-cap'});const paintCur=()=>{cur.textContent=st.full?`지금: 전체 성경 = ${st.full.name} · ${Number(st.full.count||0).toLocaleString()}절 · ${st.full.books}권 · ${st.full.at||''} 불러옴 · ${st.full.on?'사용 중':'꺼 둠'}`:'지금: 전체 성경은 옛 공개본입니다.'};paintCur();
  const sample=['GEN.1.1','PSA.23.1','JHN.3.16','ROM.8.28'];
  fileIn.onchange=async()=>{const f=fileIn.files[0];if(!f)return;fname=f.name;status.textContent='파일을 읽는 중입니다…';try{const text=await decode(f);parsed=parseBible(text,{dropHeads:dropBox.checked});report.replaceChildren();
    const bk=Object.keys(parsed.map),miss=(typeof books!=='undefined'?books:[]).filter(x=>!parsed.map[x.id]).map(x=>x.name);
    report.append(el('p',{class:'mytr-cap',text:`${f.name} · ${parsed.count.toLocaleString()}절 · ${bk.length}권을 읽었습니다.${miss.length?` 빠진 책 ${miss.length}권: ${miss.slice(0,10).join(', ')}${miss.length>10?' …':''}`:' 66권이 모두 있습니다.'}`}));
    for(const r of sample){const [b1,c1,v1]=r.split('.');const t=parsed.map[b1]?.[c1]?.[v1];if(t)report.append(el('div',{class:'mytr-item'},el('b',{text:humanRef(r)}),el('p',{class:'mytr-old',text:t})))}
    if(parsed.bad.length)report.append(el('p',{class:'mytr-cap',text:'읽지 못한 줄 예: '+parsed.bad.join(' / ')}));
    status.textContent=parsed.count<100?'성경 절을 거의 찾지 못했습니다. 아래 “읽을 수 있는 파일 형식”을 확인하세요.':'확인한 뒤 [전체 성경을 이 번역으로 바꾸기]를 누르세요.';applyAll.disabled=parsed.count<100}catch(e){status.textContent='파일을 읽지 못했습니다: '+e.message}};
  const pick=el('button',{type:'button',text:'번역본 파일 고르기',onclick:()=>fileIn.click()});
  const applyAll=el('button',{type:'button',class:'primary',text:'전체 성경을 이 번역으로 바꾸기',disabled:'disabled',onclick:async()=>{if(!parsed)return;const name=nameIn.value.trim()||'내 번역';if(!confirm(`${parsed.count.toLocaleString()}절을 「${name}」(으)로 바꿉니다. 직접 바꾼 절은 그대로 두고, 나머지 모든 본문이 이 번역으로 보입니다. 계속할까요?`))return;
    try{status.textContent='저장하는 중입니다…';await idbPutAll(parsed.map);st.full={on:true,name,count:parsed.count,books:Object.keys(parsed.map).length,at:new Date().toISOString().slice(0,10),file:fname.slice(0,80)};st.on=true;save();status.textContent=`전체 성경을 「${name}」(으)로 바꿨습니다. 화면을 다시 불러옵니다…`;setTimeout(()=>location.reload(),700)}catch(e){status.textContent='저장하지 못했습니다: '+e.message}}});
  const fullBox=el('input',{type:'checkbox'});fullBox.checked=!!st.full?.on;fullBox.disabled=!st.full;fullBox.onchange=()=>{if(!st.full)return;st.full.on=fullBox.checked;save();status.textContent='화면을 다시 불러옵니다…';setTimeout(()=>location.reload(),400)};
  const remove=el('button',{type:'button',text:'전체 번역 지우기',onclick:async()=>{if(!st.full){status.textContent='불러온 전체 번역이 없습니다.';return}if(!confirm(`불러온 「${st.full.name}」 전체 번역을 이 브라우저에서 지울까요? (직접 바꾼 절은 남습니다)`))return;await idbClear();st.full=null;save();status.textContent='지웠습니다. 화면을 다시 불러옵니다…';setTimeout(()=>location.reload(),500)}});
  return el('section',{class:'mytr-pane',hidden:''},
   el('h3',{text:'② 전체 성경을 이 번역으로'}),
   el('p',{class:'mytr-cap',text:'정식으로 가지고 있는 번역본 파일(성경 프로그램에서 내보낸 파일, 출판사에서 받은 이용 허락 데이터 등) 하나를 고르면 66권 전체를 한 번에 바꿉니다. 앱은 인터넷에서 번역본을 내려받지 않습니다.'}),
   el('label',{},'번역 이름 (화면·인용에 표시)',nameIn),drop,
   el('div',{class:'mytr-row'},pick,applyAll,fileIn),report,
   el('details',{},el('summary',{text:'읽을 수 있는 파일 형식'}),el('ul',{class:'mytr-cap'},
    el('li',{text:'한 줄에 한 절: 창1:1 태초에 하나님이… / 창세기 1:1 … / Gen 1:1 … / 창 1장 1절 …'}),
    el('li',{text:'표(CSV·탭): 창,1,1,태초에… 또는 책 번호 1,1,1,…'}),
    el('li',{text:'머리글 방식: “창세기” 줄 → “1장” 줄 → “1 태초에…” 줄'}),
    el('li',{text:'JSON: {"GEN":{"1":{"1":"…"}}} (말씀연구실 본문 파일과 같은 모양)'}),
    el('li',{text:'글자 인코딩은 UTF-8과 EUC-KR(옛 한글 텍스트)을 모두 읽습니다.'}))),
   el('div',{class:'mytr-foot'},el('label',{},fullBox,' 전체 번역 쓰기 (끄면 옛 공개본, 직접 바꾼 절만 적용)'),cur,el('div',{class:'mytr-row'},remove)),
   el('p',{class:'mytr-note',text:'대한성서공회 사이트의 본문을 자동으로 모두 가져오는 기능은 넣지 않았습니다. 사이트 이용 조건과 번역본 저작권을 지키기 위해서입니다. 성경 단어 검색(자료 찾기)은 계속 공개본으로 찾고, 찾은 구절을 열면 이 번역으로 보입니다.'}))}
 let dlg=null;
 function open(mode){const bb=b,cc=c,vv=v;const ref=`${bb}.${cc}.${vv}`;if(dlg)dlg.remove();
  dlg=el('dialog',{class:'mytr-dialog','aria-label':'내 번역으로 바꾸기'});
  const edSel=el('select',{id:'mytrEdition'},...EDITIONS.map(([id,n])=>el('option',{value:id,text:n})));edSel.value=st.edition;
  const link=el('a',{target:'_blank',rel:'noopener noreferrer',class:'mytr-link'});const setLink=()=>{link.href=bskUrl(bb,cc,vv);link.textContent=`① ${edName(st.edition==='ETC'?'GAE':st.edition)}으로 ${humanRef(ref)} 열기 ↗`};
  edSel.onchange=()=>{st.edition=edSel.value;save();setLink()};setLink();
  const status=el('p',{class:'mytr-status',role:'status'});
  // 한 절
  const oldOne=el('p',{class:'mytr-old',text:(origText(ref)!==undefined?origText(ref):currentPrimary?.[vv])||'(옛 공개본에 이 절이 없습니다)'});
  const one=el('textarea',{rows:'4',placeholder:'공식 사이트에서 복사한 이 절의 말씀을 붙여 넣으세요.'});one.value=st.verses[ref]?.t||'';
  const pasteOne=el('button',{type:'button',text:'복사한 말씀 붙여 넣기',onclick:async()=>{try{const t=(await navigator.clipboard.readText()).trim();if(!t){status.textContent='클립보드가 비어 있습니다. 공식 사이트에서 말씀을 복사해 주세요.';return}const parts=splitVerses(t,cc);const mine=parts.find(p=>p.n===+vv);one.value=mine?mine.t:t.replace(/^\s*\d{1,3}[.)]?\s+/,'');status.textContent=mine&&parts.length>1?`여러 절이 복사되어 ${vv}절만 골랐습니다. 여러 절을 한꺼번에 바꾸려면 [여러 절 한꺼번에]를 쓰세요.`:'붙여 넣었습니다. 확인한 뒤 [이 절 바꾸기]를 누르세요.'}catch(e){status.textContent='자동 붙여 넣기가 막혀 있습니다. 칸을 누르고 Ctrl+V로 붙여 넣으세요.'}}});
  const applyOne=el('button',{type:'button',class:'primary',text:'이 절 바꾸기',onclick:async()=>{if(!one.value.trim()){status.textContent='말씀을 먼저 붙여 넣으세요.';return}if(await setVerse(ref,one.value.replace(/^\s*\d{1,3}[.)]?\s+/,''))){status.textContent=`${humanRef(ref)}을(를) ${edName(st.edition)}(으)로 바꿨습니다.`;refreshViews();paintCount()}}});
  const resetOne=el('button',{type:'button',text:'이 절 원래대로',onclick:async()=>{await clearVerse(ref);one.value='';status.textContent=`${humanRef(ref)}을(를) 옛 공개본으로 되돌렸습니다.`;refreshViews();paintCount()}});
  const paneOne=el('section',{class:'mytr-pane'},el('h3',{text:`② ${humanRef(ref)} 한 절 바꾸기`}),el('p',{class:'mytr-cap',text:'지금 앱의 본문 (옛 공개본)'}),oldOne,el('label',{},`새 번역 · ${humanRef(ref)}`,one),el('div',{class:'mytr-row'},pasteOne,applyOne,resetOne));
  // 여러 절
  const many=el('textarea',{rows:'7',placeholder:`공식 사이트에서 ${cc}장의 여러 절을 절 번호와 함께 드래그해 복사한 뒤 붙여 넣으세요.\n예) 1 예수께서 배에 오르사 … 2 사람들이 중풍병자를 …`});
  const preview=el('div',{class:'mytr-preview'});
  const read=()=>{const parts=splitVerses(many.value,cc);preview.replaceChildren();if(!parts.length){preview.append(el('p',{class:'mytr-cap',text:'절 번호를 찾지 못했습니다. 절 번호가 함께 복사됐는지 확인하세요.'}));return}
   preview.append(el('p',{class:'mytr-cap',text:`${parts.length}개 절을 찾았습니다. 확인하고 고칠 곳은 고친 뒤, 바꿀 절만 체크하세요.`}));
   for(const p of parts){const r=`${bb}.${cc}.${p.n}`;const oldT=(origText(r)!==undefined?origText(r):currentPrimary?.[p.n])||'';const cb=el('input',{type:'checkbox'});cb.checked=!!oldT;const ta=el('textarea',{rows:'2'});ta.value=p.t;
    preview.append(el('div',{class:'mytr-item','data-ref':r},el('label',{class:'mytr-check'},cb,` ${cc}:${p.n}`),el('div',{},el('p',{class:'mytr-old',text:oldT?'옛: '+oldT:'(옛 공개본에 없는 절 번호입니다 — 장 번호를 확인하세요)'}),ta)))}};
  many.addEventListener('input',()=>{clearTimeout(many._t);many._t=setTimeout(read,250)});
  const pasteMany=el('button',{type:'button',text:'복사한 말씀 붙여 넣기',onclick:async()=>{try{many.value=(await navigator.clipboard.readText()).trim();read()}catch(e){status.textContent='자동 붙여 넣기가 막혀 있습니다. 칸을 누르고 Ctrl+V로 붙여 넣으세요.'}}});
  const applyMany=el('button',{type:'button',class:'primary',text:'체크한 절 모두 바꾸기',onclick:async()=>{const items=[...preview.querySelectorAll('.mytr-item')].filter(x=>x.querySelector('input').checked);if(!items.length){status.textContent='바꿀 절을 체크하세요.';return}let n=0;for(const it of items){if(await setVerse(it.dataset.ref,it.querySelector('textarea').value))n++}status.textContent=`${n}개 절을 ${edName(st.edition)}(으)로 바꿨습니다.`;refreshViews();paintCount()}});
  const paneMany=el('section',{class:'mytr-pane',hidden:''},el('h3',{text:`② ${typeof bookName==='function'?bookName(bb):bb} ${cc}장 여러 절 한꺼번에`}),many,el('div',{class:'mytr-row'},pasteMany,applyMany),preview);
  const tabOne=el('button',{type:'button',class:'mytr-tab on',text:'이 절만'}),tabMany=el('button',{type:'button',class:'mytr-tab',text:'여러 절 한꺼번에'}),tabFull=el('button',{type:'button',class:'mytr-tab',text:'전체 성경을 이 번역으로'});const paneFull=fullPane(status);
  const show=w=>{paneOne.hidden=w!=='one';paneMany.hidden=w!=='many';paneFull.hidden=w!=='full';tabOne.classList.toggle('on',w==='one');tabMany.classList.toggle('on',w==='many');tabFull.classList.toggle('on',w==='full')};tabOne.onclick=()=>show('one');tabMany.onclick=()=>show('many');tabFull.onclick=()=>show('full');
  // 아래: 사용 여부 · 되돌리기 · 내보내기
  const onBox=el('input',{type:'checkbox'});onBox.checked=st.on;onBox.onchange=()=>{st.on=onBox.checked;save();status.textContent='바꾼 설정을 적용하려고 화면을 다시 불러옵니다…';setTimeout(()=>location.reload(),400)};
  const count=el('span',{class:'mytr-cap'});
  function paintCount(){const all=Object.keys(st.verses).length,here=Object.keys(st.verses).filter(r=>r.startsWith(`${bb}.${cc}.`)).length;count.textContent=`내가 넣은 말씀: 전체 ${all}절 · ${cc}장 ${here}절`}
  const resetChapter=el('button',{type:'button',text:`${cc}장 모두 원래대로`,onclick:async()=>{const rs=Object.keys(st.verses).filter(r=>r.startsWith(`${bb}.${cc}.`));if(!rs.length){status.textContent='이 장에는 바꾼 절이 없습니다.';return}if(!confirm(`${cc}장에서 바꾼 ${rs.length}개 절을 옛 공개본으로 되돌릴까요?`))return;for(const r of rs)await clearVerse(r);status.textContent='되돌렸습니다.';refreshViews();paintCount()}});
  const exportBtn=el('button',{type:'button',text:'내 번역 내려받기',onclick:()=>{const blob=new Blob([JSON.stringify({kind:'scripture-desk-my-translation',v:1,...st},null,1)],{type:'application/json'});const a=el('a',{href:URL.createObjectURL(blob),download:`말씀연구실-내번역-${new Date().toISOString().slice(0,10)}.json`});document.body.append(a);a.click();a.remove()}});
  const file=el('input',{type:'file',accept:'.json,application/json',hidden:''});file.onchange=async()=>{try{const d=JSON.parse(await file.files[0].text());if(d.kind!=='scripture-desk-my-translation'||typeof d.verses!=='object')throw Error();let n=0;for(const [r,val] of Object.entries(d.verses)){if(/^[A-Z0-9]{3}\.\d+\.\d+$/.test(r)&&typeof val?.t==='string'&&val.t.length<4000){st.verses[r]={t:val.t,ed:String(val.ed||st.edition),at:String(val.at||'')};n++}}save();status.textContent=`${n}개 절을 불러왔습니다. 화면을 다시 불러옵니다…`;setTimeout(()=>location.reload(),600)}catch(e){status.textContent='말씀연구실의 내 번역 파일이 아닙니다.'}};
  const importBtn=el('button',{type:'button',text:'내 번역 불러오기',onclick:()=>file.click()});
  dlg.append(
   el('div',{class:'dialog-head'},el('h2',{text:'내 번역으로 바꾸기'}),el('button',{type:'button','aria-label':'닫기',text:'✕',onclick:()=>dlg.close()})),
   el('div',{class:'dialog-body'},
    el('p',{class:'mytr-intro',text:'앱의 한국어 본문은 저작권이 끝난 옛 공개본입니다. 개역개정·새번역 같은 현대 번역을 공식 사이트에서 읽고 복사해 붙여 넣으면, 그 절이 본문 읽기·설계·원고·인쇄·제작 전체에서 새 번역으로 바뀝니다.'}),
    el('div',{class:'mytr-row'},el('label',{},'번역본 ',edSel),link),
    el('div',{class:'mytr-tabs'},tabOne,tabMany,tabFull),paneOne,paneMany,paneFull,status,
    el('div',{class:'mytr-foot'},el('label',{},onBox,' 본문에 내 번역 쓰기 (끄면 옛 공개본으로 봅니다)'),count,el('div',{class:'mytr-row'},resetChapter,exportBtn,importBtn,file)),
    el('p',{class:'mytr-note',text:'붙여 넣은 번역은 이 컴퓨터의 브라우저에만 저장되며 배포 파일에 들어가지 않습니다. 현대 번역의 저작권은 각 출판사(대한성서공회 등)에 있으니 설교 준비와 교회 안 사용 범위에서 쓰고, 외부에 공개할 때는 해당 기관의 이용 안내를 따르세요.'})));
  document.body.append(dlg);paintCount();dlg.showModal();if(mode==='many'||mode==='full')show(mode);if(mode!=='full')setTimeout(()=>(mode==='many'?many:one).focus(),50)}
 // 4) 본문 읽기 화면: 단추 · 바뀐 절 표시
 function decorate(){const box=document.getElementById('verses');if(!box||typeof b==='undefined'||typeof version==='undefined')return;try{const lab=document.getElementById('primaryLabel');if(lab&&version==='kor'){const base=lab.dataset.base||lab.textContent;lab.dataset.base=base;lab.textContent=fullOn()?`${st.full.name} · 내 번역 (옛 공개본 대신)`:base}}catch(e){}
  box.querySelectorAll('.verse').forEach(a=>{const vv=a.dataset.verse,ref=`${b}.${c}.${vv}`;const mine=version==='kor'&&has(ref);a.classList.toggle('mytr',mine);a.querySelector('.mytr-badge')?.remove();a.querySelector('.mytr-orig')?.remove();
   if(mine){const badge=el('button',{type:'button',class:'mytr-badge',title:'옛 공개본 보기 · 고치기',text:edName(st.verses[ref].ed||st.edition)});badge.onclick=e=>{e.stopPropagation();const o=a.querySelector('.mytr-orig');if(o){o.remove();return}a.querySelector('.verse-text')?.append(el('div',{class:'mytr-orig'},el('span',{text:'옛 공개본: '+(origText(ref)||'')}),el('button',{type:'button',class:'mytr-mini',text:'고치기',onclick:ev=>{ev.stopPropagation();try{selectVerse(+vv)}catch(_){}open('one')}})))};a.querySelector('.verse-number')?.after(badge)}})}
 function mount(){const copy=document.getElementById('copyVerse');if(!copy||document.getElementById('myTranslationBtn'))return;
  const btn=el('button',{id:'myTranslationBtn',type:'button',class:'quiet',text:'✎ 내 번역으로 바꾸기',title:'공식 사이트에서 복사한 현대 번역으로 이 절(또는 여러 절)을 바꿉니다',onclick:()=>{if(typeof version!=='undefined'&&version!=='kor'){toast('본문 판본을 “한국어”로 바꾼 뒤 사용하세요.');return}if(!document.querySelector('.verse')){toast('먼저 본문을 선택하세요.');return}open('one')}});
  (document.getElementById('officialTranslations')||copy).after(btn);
  const box=document.getElementById('verses');if(box)new MutationObserver(()=>{clearTimeout(box._mytr);box._mytr=setTimeout(decorate,30)}).observe(box,{childList:true})}
 // 5) 복사·관찰 담기에 실제 번역 이름을 붙인다
 document.addEventListener('click',e=>{const t=e.target.closest('#copyVerse,#addVerseNote');if(!t||typeof b==='undefined'||version!=='kor')return;const ref=`${b}.${c}.${v}`;if(!has(ref)&&!(fullOn()&&currentPrimary?.[v]))return;e.preventDefault();e.stopImmediatePropagation();const name=has(ref)?edName(st.verses[ref].ed||st.edition):st.full.name;const text=has(ref)?st.verses[ref].t:currentPrimary[v];
  if(t.id==='copyVerse'){navigator.clipboard.writeText(`${humanRef(ref)} (${name})\n${text}`).then(()=>toast('선택 구절을 복사했습니다.'),()=>toast('복사가 막혀 있습니다.'))}else{try{appendAt(key(),'observation',`[${humanRef(ref)} · ${name}]\n${text}`)}catch(err){toast(err.message)}}},true);
 document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0));
 const css=document.createElement('style');css.textContent=`
#myTranslationBtn{font-weight:700}
.verse.mytr .primary-content{background:linear-gradient(transparent 62%,rgba(154,107,31,.14) 0)}
#verses .mytr-badge,.mytr-badge{display:inline-block!important;width:auto!important;font-size:11px!important;font-weight:700!important;border:1px solid #c9a96a!important;color:#7a5513!important;background:#fbf4e6!important;border-radius:999px!important;padding:0 7px!important;margin:0 6px 0 2px!important;line-height:1.6!important;vertical-align:2px;cursor:pointer;min-height:0!important;height:auto!important;box-shadow:none!important}
.mytr-orig{margin:6px 0 0;padding:6px 10px;border-left:3px solid #c9a96a;background:#fbf7ee;font-size:13.5px;color:#5b5446;display:flex;gap:10px;align-items:flex-start;justify-content:space-between}
.mytr-mini{font-size:12px;padding:1px 8px;min-height:auto}
dialog.mytr-dialog{width:min(820px,94vw);max-height:90vh}
dialog.mytr-dialog .dialog-body{overflow:auto;max-height:calc(90vh - 70px)}
.mytr-intro{font-size:14.5px;line-height:1.7}
.mytr-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
.mytr-link{font-weight:700}
.mytr-tabs{display:flex;gap:4px;margin:14px 0 0;border-bottom:1px solid #d8dcd3}
.mytr-tab{border:0!important;border-bottom:3px solid transparent!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;font-weight:700;color:#5b6862}
.mytr-tab.on{border-bottom-color:#24584c!important;color:#1d2a26}
.mytr-pane{padding:10px 0}
.mytr-pane h3{font-size:16px;margin:4px 0 8px}
.mytr-pane label{display:block;font-weight:700;font-size:14px;margin-top:8px}
.mytr-pane textarea{width:100%;font-size:15.5px;line-height:1.75}
.mytr-old{font-size:14px;color:#5b5446;background:#f6f3ec;border-radius:8px;padding:8px 10px;margin:4px 0;line-height:1.7}
.mytr-cap{font-size:13px;color:#5b6862;margin:4px 0}
.mytr-preview .mytr-item{display:grid;grid-template-columns:76px 1fr;gap:8px;border-top:1px dashed #d8dcd3;padding:8px 0}
.mytr-check{font-weight:700;font-size:14px;margin:0!important}
.mytr-status{font-weight:700;color:#24584c;min-height:1.4em}
.mytr-foot{border-top:1px solid #d8dcd3;margin-top:10px;padding-top:8px}
.mytr-note{font-size:12.5px;color:#6b6457;line-height:1.6;margin-top:10px}`;document.head.append(css);
 return {open,splitVerses,parseBible,has,fullOn,get state(){return st},get original(){return orig}};
})();
