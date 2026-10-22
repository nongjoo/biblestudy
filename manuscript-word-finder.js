 'use strict';
(()=>{
 const get=id=>document.getElementById(id),norm=s=>s.normalize('NFD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]/gu,'').toLowerCase();
 function occurrences(body,word){const rows=[];if(!word)return rows;let start=0;while((start=body.indexOf(word,start))!==-1){rows.push({word,start,end:start+word.length});start+=word.length}return rows}
 function scan(body,lexical='',query=''){
  const hits=DelegationCore.findOriginalWords(body).map(x=>({...x,kind:'원어 표기'})),seen=new Set(hits.map(x=>x.start+':'+x.end));
  const add=(x,kind)=>{const key=x.start+':'+x.end;if(!seen.has(key)){seen.add(key);hits.push({...x,kind})}};
  for(const line of lexical.split('\n')){const word=line.split('|')[0].trim();if(word)for(const x of occurrences(body,word))add(x,'출처 목록의 단어')}
  for(const m of body.matchAll(/히브리어|헬라어|그리스어|아람어|스트롱|원어(?:로|는|의|에서|를|가|\s)/g))add({word:m[0].trim(),start:m.index,end:m.index+m[0].trim().length},'원어 설명 후보');
  for(const x of occurrences(body,query.trim()))add(x,'직접 찾은 표현');
  return hits.sort((a,b)=>a.start-b.start||a.end-b.end);
 }
 function mount(host,editor,lexical){
  const section=document.createElement('section');section.id='mwFinder';section.className='mw-finder';section.innerHTML='<h3>원고에서 찾은 원어와 설명</h3><p class="micro">붉게 표시된 표현 옆의 “원고 위치로 이동”을 누르면 해당 부분이 선택됩니다. 한글로 적은 발음은 아래에서 직접 찾을 수 있습니다. 설명 후보는 원어 사용 여부를 직접 확인하세요.</p><label>추가로 찾을 단어·발음<input id="mwQuery" type="search" placeholder="예: 아가페, 로고스, agape"></label><p id="mwSummary" role="status"></p><div id="mwResults"></div><button id="mwMore" type="button" hidden>더 보기</button><p id="mwStatus" role="status"></p>';host.prepend(section);
  let rows=[],shown=0,timer;const list=section.querySelector('#mwResults'),summary=section.querySelector('#mwSummary'),status=section.querySelector('#mwStatus'),more=section.querySelector('#mwMore'),query=section.querySelector('#mwQuery');
  function draw(){const body=editor.value;for(const row of rows.slice(shown,shown+40)){
   const card=document.createElement('article'),heading=document.createElement('p');heading.className='mw-heading';const strong=document.createElement('strong');strong.textContent=row.word;const line=body.slice(0,row.start).split('\n').length;heading.append(strong,document.createTextNode(` · ${row.kind} · ${line}번째 줄`));
   const excerpt=document.createElement('p');excerpt.className='mw-excerpt';const start=Math.max(0,row.start-100),end=Math.min(body.length,row.end+140),mark=document.createElement('mark');mark.textContent=row.word;excerpt.append(document.createTextNode((start?'…':'')+body.slice(start,row.start)),mark,document.createTextNode(body.slice(row.end,end)+(end<body.length?'…':'')));
   const jump=document.createElement('button');jump.type='button';jump.textContent='원고 위치로 이동';jump.onclick=()=>{if(editor.value!==body){refresh();status.textContent='원고가 바뀌어 목록을 새로 찾았습니다. 다시 위치를 선택하세요.';return}editor.focus();editor.setSelectionRange(row.start,row.end);const mirror=document.createElement('textarea');mirror.className=editor.className;const style=getComputedStyle(editor);mirror.style.cssText='position:fixed;left:-10000px;height:0;overflow:hidden;visibility:hidden;box-sizing:border-box';for(const name of ['font','lineHeight','padding','border','letterSpacing','wordBreak','whiteSpace'])mirror.style[name]=style[name];mirror.style.width=editor.getBoundingClientRect().width+'px';mirror.value=body.slice(0,row.start);document.body.append(mirror);editor.scrollTop=Math.max(0,mirror.scrollHeight-editor.clientHeight/2);mirror.remove();editor.scrollIntoView({block:'center',behavior:'smooth'});status.textContent=`“${row.word}” 위치를 선택했습니다. 아래 원고에서 고친 뒤 저장하세요.`};
   card.append(heading,excerpt,jump);
   if(row.kind!=='원어 설명 후보'){const registered=lexical.value.split('\n').some(line=>norm(line.split('|')[0].trim())===norm(row.word));const add=document.createElement('button');add.type='button';add.textContent=registered?'출처 목록 확인':'출처 입력 줄 추가';add.onclick=()=>{const exists=lexical.value.split('\n').some(line=>norm(line.split('|')[0].trim())===norm(row.word));if(!exists){lexical.value+=(lexical.value.trim()?'\n':'')+row.word+' | ';lexical.dispatchEvent(new Event('input',{bubbles:true}));}lexical.focus();const at=lexical.value.lastIndexOf(row.word);lexical.setSelectionRange(at>=0?at:0,at>=0?at+row.word.length:0);lexical.scrollIntoView({block:'center',behavior:'smooth'});status.textContent='출처 줄의 | 뒤에 실제 근거 구절을 적으세요. 본문 밖의 구절이면 | 보조도 적으세요. 출처는 자동으로 추정하지 않습니다.'};card.append(add)}list.append(card);
  }shown=Math.min(rows.length,shown+40);more.hidden=shown>=rows.length;}
  function refresh(){clearTimeout(timer);rows=scan(editor.value,lexical.value,query.value);shown=0;list.replaceChildren();const raw=DelegationCore.findOriginalWords(editor.value).length;summary.textContent=rows.length?`원어 표기 ${raw}곳 · 설명 후보·직접 검색 포함 ${rows.length}곳`:'자동으로 찾은 원어 표기가 없습니다. 한글 발음으로 썼다면 위 검색칸에 입력해 보세요. 원어를 새로 넣을 필요는 없습니다.';draw()}
  const update=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(section.isConnected)refresh()},200)};editor.addEventListener('input',update);lexical.addEventListener('input',update);query.addEventListener('input',update);more.onclick=draw;refresh();
 }
 window.ManuscriptWordFinder={scan,mount};
})();
