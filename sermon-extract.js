'use strict';
/* v64 · 설교 원고 구조 읽기 (기기 안, AI 없이)
   - applications: 결론부에서 '언제·무엇을' 하라는 실천 문장을 찾는다 → 원고 확정의 적용 칸을 자동으로 채운다.
   - parse: 제목·서론·대지·결론·기도를 나눠 인쇄용 원고와 마크다운을 만든다.
   마크다운 원고(# 제목, ## 1. 대지, > 강조)와 줄글 원고(첫째, …) 모두 읽는다. */
(function(root){
 const str=v=>v==null?'':String(v);
 const norm=t=>str(t).normalize('NFKC').replace(/[\s“”"'‘’.,!?。:;·…()\[\]「」『』-]/g,'');
 const stripMd=t=>str(t).replace(/\r/g,'').replace(/\*\*|__/g,'').replace(/^\s*>\s?/gm,'').replace(/^\s*#{1,6}\s*/gm,'');
 const splitSentences=t=>stripMd(t).split(/(?<=[.!?。！？])\s+|\n+/).map(s=>s.trim()).filter(Boolean);
 const PRAYER_HEAD=/^(?:#{1,6}\s*)?(?:마무리\s*기도|함께\s*드리는\s*기도|결단의\s*기도|기도)\s*$/m;
 const PRAYER_START=/(?:^|\n)\s*(?:#{1,6}\s*)?(?:마무리\s*기도|함께\s*드리는\s*기도|결단의\s*기도|기도)\s*\n|(?:^|\n)\s*(?:함께\s*기도하겠습니다|기도하겠습니다)/;
 const LEAD=/^(?:그리고|또한|또|먼저|그래서|이제|마지막으로|둘째로|셋째로|첫째로|끝으로|무엇보다|특별히)[,\s]+/;
 const ACTION_END=/(?:십시오|하세요|해\s*보세요|합시다|해\s*봅시다|하시기\s*바랍니다|하길\s*바랍니다|보십시오|시작합시다)[.!]?$/;
 const NEGATIVE_END=/(?:마십시오|마세요|맙시다|말아야\s*합니다)[.!]?$/;
 const ACTION_WORD=/(?:이번\s*주|오늘|내일|매일|주말|아침|저녁|한\s*가지|한\s*사람|한\s*명|세\s*가지|정하|기록|적어|적으|전화|찾아가|만나|끝내|끝낸|시작하|체크|확인하|격려|기도하|읽으|읽고|나누|섬기|도우|돕|연락|방문|감사|고백|외우|암송)/;
 const TIME_WORD=/(?:이번\s*주|오늘|매일|주말|아침|저녁|내일|한\s*주)/;

 function prayerIndex(text){const m=PRAYER_START.exec(str(text));return m?m.index:-1}

 // 결론부의 실천 문장 1~3개. 문장은 원고에 있는 글자 그대로 돌려준다(앞의 접속어만 뗀다).
 function applications(text,{max=3}={}){
  const raw=stripMd(text);if(!raw.trim())return [];
  const pAt=prayerIndex(raw);const end=pAt>0?pAt:raw.length;
  const start=Math.floor(end*.45);
  const tail=raw.slice(start,end);
  const list=splitSentences(tail).map((s,i)=>({s:s.replace(LEAD,'').trim(),i}))
   .filter(x=>x.s.length>=16&&x.s.length<=170&&ACTION_END.test(x.s)&&!NEGATIVE_END.test(x.s)&&!/[?？]$/.test(x.s));
  const scored=list.map(x=>({...x,score:(ACTION_WORD.test(x.s)?3:0)+(TIME_WORD.test(x.s)?3:0)+(/\d|한\s*(?:가지|명|사람|통|줄)|세\s*가지/.test(x.s)?2:0)+Math.min(2,x.s.length/60)}))
   .filter(x=>x.score>=3);
  const seen=new Set();const picked=[];
  for(const x of scored.sort((a,b)=>b.score-a.score)){const k=norm(x.s);if(seen.has(k))continue;seen.add(k);picked.push(x);if(picked.length>=max)break}
  return picked.sort((a,b)=>a.i-b.i).map(x=>x.s);
 }

 const ORDINAL=/^(?:(첫|둘|셋|넷|다섯|여섯)\s?째|제\s?([1-6])\s?대지|([1-6])\s*[.)])\s*[,.:)]?\s*/;
 const REF_TAIL=/\s*[(（]\s*([^()（）]*\d+\s*[:장]\s*\d+[^()（）]*)[)）]\s*$/;
 function splitHeading(t){let title=str(t).trim(),ref='';const m=title.match(REF_TAIL);if(m){ref=m[1].trim();title=title.slice(0,m.index).trim()}return {title:title.replace(ORDINAL,'').replace(/[.:：]\s*$/,'').trim(),ref}}

 function coverage(a,b){const ts=str(a).split(/[\s,.!?]+/).filter(w=>w.length>=2);if(!ts.length)return 0;return ts.filter(w=>str(b).includes(w)).length/ts.length}

 // 블록(빈 줄로 나뉜 문단) 단위로 원고를 읽는다.
 // 소제목(#, "첫째,", "1.")과 강조 줄(>)은 빈 줄 없이 붙어 있어도 따로 떼어 읽는다.
 function blocks(text){
  const out=[];let cur=[];const flush=()=>{if(cur.length)out.push(cur);cur=[]};
  for(const raw of str(text).replace(/\r/g,'').split('\n')){const line=raw.replace(/\s+$/,'');
   if(!line.trim()){flush();continue}
   const t=line.trim();
   if(/^#{1,6}\s/.test(t)||(!cur.length||true)&&ORDINAL.test(t)&&t.length<=70&&!/[.!?]$/.test(t.replace(/\s*[(（][^)）]*[)）]\s*$/,''))){flush();out.push([line]);continue}
   const q=/^>/.test(t);if(cur.length&&(/^>/.test(cur[cur.length-1].trim())!==q))flush();
   cur.push(line);
  }
  flush();return out;
 }

 function parse(text,{anchor={},title:knownTitle=''}={}){
  const center=str(anchor.center).trim(),pts=Array.isArray(anchor.points)?anchor.points:[];
  const apps=(anchor.applications||[]).map(norm).filter(Boolean);
  const doc={title:'',passage:'',sections:[]};
  let section={kind:'intro',title:'',ref:'',n:0,blocks:[]};doc.sections.push(section);
  let pointCount=0,titleTaken=false;
  const open=(kind,title='',ref='',n=0)=>{section={kind,title,ref,n,blocks:[]};doc.sections.push(section)};
  const all=blocks(text);
  all.forEach((lines,bi)=>{
   const first=lines[0].trim();const single=lines.length===1;
   const h=first.match(/^(#{1,6})\s+(.+)$/);
   const headText=(h?h[2]:first).replace(/\*\*/g,'').trim();
   // 제목
   if(!titleTaken&&((h&&h[1].length===1)||(bi===0&&single&&headText.length<=60&&!ORDINAL.test(headText)&&!/^본문\s*[:：]/.test(headText)))){doc.title=headText.replace(/^(?:설교\s*)?제목\s*[:：]\s*/,'');titleTaken=true;return}
   if(single&&/^(?:#{1,6}\s*)?(?:설교\s*)?제목\s*[:：]/.test(first)){doc.title=headText.replace(/^(?:설교\s*)?제목\s*[:：]\s*/,'');titleTaken=true;return}
   if(single&&/^(?:#{1,6}\s*)?(?:설교\s*)?본문\s*[:：]/.test(first)){doc.passage=headText.replace(/^(?:설교\s*)?본문\s*[:：]\s*/,'');return}
   if(single&&(h||headText.length<=90)){
    if(/^(?:서론|들어가며|여는\s*말|도입)$/.test(headText)){if(section.kind==='intro'&&!section.blocks.length)section.title='들어가며';else open('intro','들어가며');return}
    if(/^(?:결론|맺으며|맺는\s*말|나가며|마치며)$/.test(headText)){open('conclusion','맺으며');return}
    if(PRAYER_HEAD.test(first)){open('prayer','함께 드리는 기도');return}
    if(/^(?:오늘의\s*)?(?:본문|말씀)$/.test(headText)){open('scripture','오늘의 말씀');return}
    const ordinal=ORDINAL.test(headText);
    const matched=pts.findIndex((p,i)=>i>=pointCount&&p.title&&(norm(headText).includes(norm(p.title))||coverage(p.title,headText)>=.75));
    if((h&&h[1].length>=2&&(ordinal||matched>=0))||(!h&&ordinal&&headText.length<=90)||(!h&&matched>=0&&headText.length<=90&&norm(headText).length<=norm(pts[matched].title).length+12)){
     const sp=splitHeading(headText);const p=pts[matched>=0?matched:pointCount]||{};
     pointCount++;open('point',sp.title||p.title||headText,sp.ref||p.reference||'',pointCount);return;
    }
    if(h){section.blocks.push({type:'h',lines:[headText]});return}
   }
   const quote=lines.every(l=>/^\s*>/.test(l));
   const clean=lines.map(l=>l.replace(/^\s*>\s?/,'').replace(/\*\*/g,'').trim()).filter(Boolean);
   const joined=clean.join(' ');
   let type=quote?'quote':'p';
   if(type==='p'&&center&&norm(joined)===norm(center))type='quote';
   if(type==='p'&&apps.length&&apps.some(a=>a&&norm(joined).includes(a)))type='apply';
   section.blocks.push({type,lines:clean});
  });
  // 줄글 원고: 결론 표시가 없으면 마지막 대지 뒷부분에서 결론의 시작을 찾는다.
  if(!doc.sections.some(s=>s.kind==='conclusion')){
   const lastPoint=[...doc.sections].reverse().find(s=>s.kind==='point');
   if(lastPoint&&lastPoint.blocks.length>8){
    const from=Math.floor(lastPoint.blocks.length*.35);
    const at=lastPoint.blocks.findIndex((b,i)=>i>=from&&/^(?:그러므로|그러니|결론적으로|정리하면|이제\s|마지막으로|오늘\s*우리가\s*붙들)/.test(b.lines[0]));
    if(at>0){const rest=lastPoint.blocks.splice(at);doc.sections.splice(doc.sections.indexOf(lastPoint)+1,0,{kind:'conclusion',title:'맺으며',ref:'',n:0,blocks:rest})}
   }
  }
  // 기도 표시가 없으면 마지막 문단들 중 하나님을 부르는 기도문을 찾는다.
  if(!doc.sections.some(s=>s.kind==='prayer')){
   const last=doc.sections[doc.sections.length-1];
   const at=last.blocks.findIndex((b,i)=>i>=last.blocks.length-4&&/^(?:하나님\s*아버지|사랑(?:의|하는)\s*하나님|은혜로우신\s*하나님|주님[,\s]|거룩하신\s*하나님|자비로우신\s*하나님)/.test(b.lines[0]));
   if(at>=0){const rest=last.blocks.splice(at);doc.sections.push({kind:'prayer',title:'함께 드리는 기도',ref:'',n:0,blocks:rest})}
  }
  if(!doc.title)doc.title=knownTitle||'';
  doc.sections=doc.sections.filter(s=>s.blocks.length||s.kind==='point');
  // 같은 말로 시작하거나 끝나는 짧은 병렬 문장이 세 줄 이상 이어지면 리듬을 살리는 '낭독 줄'로 묶는다.
  for(const s of doc.sections){const out=[];let run=[];
   const flush=()=>{if(run.length>=3)out.push({type:'cadence',lines:run.flatMap(b=>b.lines)});else out.push(...run);run=[]};
   for(const b of s.blocks){
    const line=b.type==='p'&&b.lines.length===1&&b.lines[0].length<=44?b.lines[0]:'';
    if(line&&(!run.length||parallel(run[run.length-1].lines[0],line)))run.push(b);
    else{flush();if(line)run.push(b);else out.push(b)}
   }
   flush();s.blocks=out;}
  return doc;
 }
 function parallel(a,b){
  const bare=t=>t.replace(/[\s.,!?…。'"’”]+$/,''),head=t=>t.split(/\s+/)[0],last=t=>bare(t).split(/\s+/).pop();
  return head(a)===head(b)&&head(a).length>=2||last(a)===last(b)||bare(a).slice(-5)===bare(b).slice(-5);
 }

 const api={applications,parse,splitSentences,prayerIndex,norm};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SermonExtract=api;
})(typeof globalThis!=='undefined'?globalThis:this);
