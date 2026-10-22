'use strict';
const sermonPerspectiveUI=(()=>{
 const labels={claim:'이 단락이 새롭게 전할 주장',reason:'선택한 근거가 주장을 지지하는 이유',spoken:'청중에게 실제로 건넬 문장',bridge:'다음 단락으로 이어지는 문장',response:'성찰 질문 또는 마지막 실천'};
 const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node};
 function mount({input,draft,index,getDraft,onSelect,onApply,onUndo,canUndo}){
  const root=el('section','perspective-workbench'),heading=el('h4','','네 관점에서 논증 살펴보기'),hint=el('p','perspective-hint','관점을 눌러 비교한 뒤 원하는 문장만 바꾸거나 덧붙이세요. 단락 전체를 채울 수도 있습니다.');
  const tabs=el('div','perspective-options');tabs.setAttribute('role','group');tabs.setAttribute('aria-label',`${index+1}단락의 논증 관점`);
  const preview=el('section','perspective-preview'),title=el('h5'),why=el('p','perspective-why'),notice=el('p','perspective-notice');
  const selection=el('label','','비교할 부분'),fieldSelect=el('select','perspective-field');fieldSelect.id=`perspective-field-${index}`;selection.htmlFor=fieldSelect.id;for(const [id,name]of Object.entries(labels))fieldSelect.add(new Option(name,id));fieldSelect.value='spoken';selection.append(fieldSelect);
  const text=el('p','perspective-sample');text.id=`perspective-sample-${index}`;text.setAttribute('aria-live','polite');const fieldActions=el('div','action-row'),replace=el('button','','이 문장으로 바꾸기'),append=el('button','','기존 문장에 덧붙이기');replace.dataset.perspectiveAction='replace';append.dataset.perspectiveAction='append';fieldActions.append(replace,append);
  const all=el('details','perspective-all'),summary=el('summary','','이 관점의 다섯 부분 모두 보기'),full=el('div');all.append(summary,full);
  const evidence=el('p','perspective-evidence'),actions=el('div','action-row'),applyAll=el('button','primary','이 관점으로 단락 채우기'),undo=el('button','','최근 제안 반영 취소');applyAll.dataset.perspectiveAction='all';undo.dataset.perspectiveAction='undo';actions.append(applyAll,undo);
  const status=el('p','perspective-status');status.setAttribute('role','status');
  preview.append(title,why,selection,text,fieldActions,all,evidence,notice,actions,status);root.append(heading,hint,tabs,preview);
  let choices=[],active=draft.stages[index].activePerspective||'text';
  function selected(){return choices.find(c=>c.id===active)||choices[0]}
  function show(){const c=selected();if(!c)return;title.textContent=c.title+' · '+c.route;why.textContent=c.why;text.textContent=c.fields[fieldSelect.value];notice.textContent=c.notice;notice.hidden=!c.notice;evidence.textContent='연결할 근거: '+c.evidence.join(' / ');for(const button of tabs.children)button.setAttribute('aria-pressed',String(button.dataset.perspective===active));full.replaceChildren();for(const [field,name]of Object.entries(labels)){const label=el('h6','',name),body=el('p','',c.fields[field]);full.append(label,body)}undo.disabled=!canUndo();}
  function refresh(current){choices=sermonPerspectives.build(input,current,index);tabs.replaceChildren();for(const c of choices){const button=el('button','perspective-option');button.type='button';button.dataset.perspective=c.id;button.append(el('strong','',c.title),el('span','',c.method));button.onclick=()=>{active=c.id;onSelect(c.id);choices=sermonPerspectives.build(input,getDraft(),index);show();status.textContent=c.title+' 예문을 보고 있습니다. 관점 선택만으로 원고는 바뀌지 않습니다.'};tabs.append(button)}show()}
  function act(mode){const c=selected();if(!c)return;const result=onApply(c,mode==='all'?Object.keys(labels):[fieldSelect.value],mode==='append'?'append':'replace');status.textContent=result.message;undo.disabled=!canUndo()}
  replace.onclick=()=>act('replace');append.onclick=()=>act('append');applyAll.onclick=()=>act('all');undo.onclick=()=>{status.textContent=onUndo().message;undo.disabled=!canUndo()};
  fieldSelect.onchange=()=>{choices=sermonPerspectives.build(input,getDraft(),index);show()};refresh(draft);
  return {element:root,refresh,showField:field=>{fieldSelect.value=field;choices=sermonPerspectives.build(input,getDraft(),index);show()}};
 }
 return {mount};
})();
