 'use strict';
(()=>{
 const get=id=>document.getElementById(id),split=text=>String(text||'').split(/\n+|(?<=[.!?。])\s+/).map(s=>s.trim()).filter(Boolean);
 const usable=s=>s.length>12&&!/https?:|CC BY|출처:|사전의 의미 범위|^\[|영어 사전|기본형|선택한 형태/.test(s);
 async function suggest(code,current){
  const packet=delegationWorkflow.sourcePacket(),a=packet.anchor,n=packet.researchNotes||{},patch={},messages=[];
  const value=id=>current[id]??get(id)?.value??'',body=value('dwManuscript'),noteSentences=split(n.interpretation).filter(usable),applications=split(n.application).filter(usable);
  const set=(id,text,source)=>{if(Object.hasOwn(current,id)&&text&&text!==current[id]){patch[id]=text;messages.push(source)}};
  const append=(text,source)=>{if(text&&!body.includes(text))set('dwManuscript',body+(body.trim()?'\n\n':'')+text,source)};
  const range=a.passage||humanRef(key());
  if(code==='P1'){set('dwPassage',a.passage||humanRef(key()),'현재 선택한 성경 본문을 범위에 반영했습니다.');messages.push('범위 읽기로 본문을 확인한 뒤 확인란을 직접 체크하세요. 한 절 본문은 한 절 명시도 확인하세요.');}
  if(code==='P2'){const center=value('dwCenter')||get('sermonFocus')?.value.trim()||noteSentences[0];if(center){set('dwCenter',center,'현재 중심 메시지 또는 해석 노트 문장을 사용했습니다.');append(center,'중심 문장이 원고에 없어 끝에 수정안으로 추가했습니다. 자연스러운 위치와 표현을 검토하세요.')}else messages.push('중심 메시지와 해석 노트가 없어 중심 문장을 만들지 못했습니다.');}
  if(code==='P3'||code==='P10'){
   const headings=[...body.matchAll(/^(?:#{1,3}\s*)?(?:[1-4][.)]\s*|[첫둘셋넷]째[,.:]?\s*)([^\n]+)\n+([^\n]+)/gm)].slice(0,4);
   for(let i=0;i<4;i++){const p=a.points[i],m=headings[i];if(!p&&!m)continue;set('dwPoint'+i+'Title',value('dwPoint'+i+'Title')||p?.title||m?.[1],'원고의 대지 제목을 사용했습니다.');set('dwPoint'+i+'Opening',value('dwPoint'+i+'Opening')||p?.opening||m?.[2],'원고의 대지 첫 문장을 사용했습니다.');set('dwPoint'+i+'Reference',value('dwPoint'+i+'Reference')||p?.reference||range,'근거가 비어 있는 대지는 설교 본문 범위를 임시 제안했습니다. 실제 근거 절로 좁혀 주세요.');}
   if(code==='P10'){const center=value('dwCenter')||get('sermonFocus')?.value.trim();if(center){set('dwCenter',center,'설교의 중심 메시지를 사용했습니다.');if(!body.slice(Math.floor(body.length*.8)).includes(center))append(center,'결론에 중심 문장을 다시 제안했습니다.');}messages.push('대지 순서와 전환 문장의 의미 연결은 직접 검토하세요. 원고에 없는 대지나 전환 문장은 만들지 않았습니다.');}
   if(!headings.length)messages.push('원고에서 번호가 붙은 대지를 찾지 못했습니다. 기존 대지는 보존했습니다.');
  }
  if(code==='P4'){const report=NoteLexicalCheck.compare(n,body),missing=report.items.filter(x=>!x.matches.length&&x.gloss);const text=missing.map(x=>`“${x.word}”에 담긴 의미를 살펴봅시다. ${x.gloss.replace(/[.!?]$/,'')}.`).join('\n\n');append(text,'미확인 원어 중 노트에 뜻풀이가 있는 항목으로 원고 끝에 검토용 문장을 추가했습니다. 사전의 뜻이 해당 본문에 맞는지 확인하고 적절한 대지로 옮겨 주세요.');if(!text)messages.push('추가할 뜻풀이가 없거나 원어 표기가 이미 반영되어 있습니다. 뜻풀이 없는 원어를 임의로 해석하지 않았습니다.');}
  if(code==='P5'){
   const rows=await AnchorPassage.read(range,value('dwEdition')||'kor');let candidates=rows;
   if(value('dwUseOwn'))candidates=String(value('dwOwn')).split('\n').map(line=>{const at=line.indexOf('|');return {label:line.slice(0,at).trim(),text:at<0?'':line.slice(at+1).trim()}}).filter(x=>x.text);
   const exact=candidates.filter(x=>x.text&&body.includes(x.text));const existing=value('dwQuotes').split('\n').filter(x=>x.trim()),seen=new Set(existing.map(x=>x.trim()));for(const row of exact){const line=row.label+' | '+row.text;if(!seen.has(line)){existing.push(line);seen.add(line)}}set('dwQuotes',existing.join('\n'),'원고에 실제로 포함된 본문 전체 절과 정확히 일치하는 인용만 목록에 추가했습니다.');messages.push('부분 인용·다른 구절의 인용과 누락 여부를 확인하고 인용 확인란을 직접 체크하세요. 기존 인용은 삭제하지 않았습니다.');
  }
  if(code==='P6'){const all=[n.observation,n.interpretation,n.application].join('\n');const match=all.match(/(?:예화|사례)\s*[:：]\s*([^\n]+)\n(?:출처\s*[:：]\s*)?(https?:\/\/\S+)/);if(match){set('dwIllustration',value('dwIllustration')||match[1],'노트에 예화로 표시된 문장을 사용했습니다.');set('dwIllustrationUrl',value('dwIllustrationUrl')||match[2],'그 예화와 함께 기록한 출처 주소를 사용했습니다.');append(match[1],'노트의 예화 문장을 원고 끝에 제안했습니다.');}messages.push('출처 링크는 직접 열어 확인하세요. 예화와 명시적으로 연결된 자료가 없으면 주소를 추측해 넣지 않습니다.');}
  if(code==='P7'){const selected=(value('dwApplications').trim()?split(value('dwApplications')):applications).slice(0,3);set('dwApplications',selected.join('\n'),'기존 적용 또는 적용 노트에서 최대 세 가지를 가져왔습니다.');const missing=selected.filter(s=>!body.includes(s));append(missing.join('\n\n'),'노트의 적용 중 원고에 없는 문장을 끝에 제안했습니다.');messages.push('누가·언제·무엇을 할지 구체화하고 적용 확인란을 직접 체크하세요.');}
  if(code==='P8'){const count=body.replace(/\s/g,'').length;if(count<4500){const excerpts=noteSentences.filter(s=>!body.includes(s)).slice(0,8);append(excerpts.join('\n\n'),'해석 노트 중 원고에 없는 문장을 보완 재료로 원고 끝에 추가했습니다. 대지에 맞게 편집하세요.')}messages.push('분량을 맞추기 위해 내용을 반복하거나 새 사실을 만들지는 않습니다. 20분 기준 공백 제외 4,500~5,500자를 참고해 편집하세요.');}
  if(code==='P9'){const seen=new Map(),allowed=[value('dwCenter'),value('dwQuestion')].filter(Boolean);const cleaned=body.split('\n').filter(line=>{const t=line.trim();if(t.length<15)return true;const n=(seen.get(t)||0)+1;seen.set(t,n);return n<=(allowed.includes(t)?3:1)}).join('\n');set('dwManuscript',cleaned,'완전히 같은 반복 줄을 정리했습니다. 의도한 반복이 제거됐는지 확인하세요.');}
  if(code==='P11'){const clean=s=>s.replace(/^(\s*)(?:질문|관찰|근거 자료|중심 문장 출처|핵심 대지\s*\d)\s*[:：]\s*/gm,'$1');for(const [id,text]of Object.entries(current))if(typeof text==='string')set(id,clean(text),'문장 앞의 작업용 라벨을 제거하고 본문은 보존했습니다.');messages.push('잘린 문장과 부자연스러운 표현은 직접 다듬어 주세요.');}
  if(code==='P12'){const cleaned=body.replace(/^(?:첨부(?:된)?|제시해주신)\s*(?:자료|원고|내용)(?:를|을)?\s*(?:바탕으로|기반으로)\s*(?:작성한|만든)\s*(?:설교|원고)(?:입니다)?[.!]?\s*$/gm,'').replace(/^\s*(?:프롬프트|검색 단어|자료 번호|편집 초안)\s*[:：][^\n]*$/gm,'').replace(/\n{3,}/g,'\n\n');set('dwManuscript',cleaned,'독립된 제작 안내 줄을 정리했습니다. 설교 문장 속 표현은 의미를 보존하기 위해 남겼습니다.');messages.push('문장 안의 제작 과정 언급은 설교 문맥에 맞게 직접 수정하세요.');}
  if(code==='앵커'){set('dwAudience',value('dwAudience')||get('sermonAudience')?.value,'연구에서 설정한 청중 정보를 사용했습니다.');set('dwEmotion',value('dwEmotion')||get('sermonTone')?.value,'설교 흐름의 정서 설정을 사용했습니다.');const rows=await AnchorPassage.read(range);const all=[n.observation,n.interpretation].join('\n'),existing=value('dwImages').split('\n').filter(Boolean);for(const match of all.matchAll(/(?:그림 단어|시각 소재|이미지)\s*[:：]\s*([^\n|]+)/g)){const word=match[1].trim(),row=rows.find(r=>r.text.includes(word));if(row&&!existing.some(s=>s.split('|')[0].trim()===word))existing.push(word+' | '+row.label);}set('dwImages',existing.join('\n'),'노트에 시각 소재로 표시되어 있고 실제 본문에도 있는 단어를 연결했습니다.');messages.push('시각 소재가 부족하면 본문에 실제 있는 단어 두 개와 출처를 선택하세요.');}
  if(!Object.keys(patch).length)messages.unshift('근거가 있는 새 입력안을 찾지 못해 기존 내용을 유지했습니다.');
  return {patch,summary:[...new Set(messages)].join('\n')};
 }
 window.AnchorAutofill={suggest};
})();
