 'use strict';
(()=>{
 const get=id=>document.getElementById(id),W=delegationWorkflow;
 const fixes={
 P1:['본문 범위','design','dwPassage','설교 본문을 책·장·절로 적고 본문 범위 확인하기로 읽으세요. 확인란을 체크하세요. 한 절 설교라면 한 절 명시도 체크하세요.'],
 P2:['중심 문장','design','dwCenter','설계의 중심 문장과 원고가 같은 메시지인지 확인하세요. 원고에 중심 문장 원문을 넣고 기본 예시 문구는 실제 설교 문장으로 바꾸세요.'],
 P3:['대지와 근거','design','dwPoints','각 대지의 근거가 주 본문 안에 있는지 확인하세요. 설계한 첫 문장이 원고에 그대로 들어가야 합니다. 대지 3~4개 또는 논증 전환점으로 정리하세요.'],
 P4:['노트 원어 반영','manuscript','dwManuscript','현재 연구 노트에 모은 원어와 원고를 비교하세요. 미확인 항목은 한글 발음이나 풀이로 반영됐는지 확인하고, 빠진 연구 내용은 설교 문맥에 맞게 보완하세요. 원어 표기가 같아도 의미와 적용의 정확성은 직접 검토하세요.'],
 P5:['직접 인용','design','dwQuotes','내 판본 오류가 있으면 아래 내 판본에서 표시된 줄을 고치세요. 형식: 요한복음 15:1 | 해당 절의 말씀 전체. 사용하지 않으려면 내 판본 검사 선택을 해제하세요. 입력한 글은 지워지지 않습니다. 원고에 직접 인용한 성경 말씀을 모두 목록에 적으세요. 앱 기준 판본과 띄어쓰기·문장부호까지 대조하세요. 확인 필요라면 누락 인용을 확인한 뒤 원고의 인용 확인란을 체크하세요.'],
 P6:['예화 출처','design','dwIllustrationUrl','출처 링크는 선택입니다. 기사·책에서 가져온 사실이면 링크를 적고 직접 열어 확인하세요. 내 경험이나 일반적인 사례면 링크 없이 둡니다. 설계에 적은 예화가 원고에 없으면 원고에 넣거나 설계에서 지우세요.'],
 P7:['실행 가능한 적용','design','dwApplications','누가·언제·무엇을 할지 구체적인 행동 1~3개로 고치고 원고에도 넣으세요. 기도문 안의 청중 지시문을 고치세요. 행동 가능성을 직접 확인한 뒤 원고의 적용 확인란을 체크하세요.'],
 P8:['원고 분량','manuscript','dwManuscript','현재 기준은 20분용 공백 제외 4,500~5,500자입니다. 길면 반복을 줄이고, 짧으면 근거·설명·적용을 보완하세요. 다른 설교 시간이라면 이 항목을 참고 사항으로 판단하세요.'],
 P9:['반복 표현','manuscript','dwManuscript','중심 문장과 질문은 각각 3회까지 허용합니다. 그 밖의 긴 반복 문장은 삭제하거나 다른 근거 설명으로 바꾸세요. 동일 성경 구절을 반복한 경우에도 의도와 분량을 직접 판단하세요.'],
 P10:['논지 연결','design','dwPoints','대지 첫 문장에 중심 핵심어가 들어가고 순서가 이어지는지 확인하세요. 전환 문장을 다음 대지 전에 배치하고 결론 마지막 부분에 중심 문장을 넣으세요. 논증의 의미 연결은 직접 확인해야 합니다.'],
 P11:['편집 흔적','manuscript','dwManuscript','질문:, 관찰:, 근거 자료: 같은 설계 라벨이나 잘린 문장을 찾으세요. 설교로 말할 자연스러운 문장으로 고치고 앵커의 오염된 표현도 정리하세요.'],
 P12:['제작 과정 언급','manuscript','dwManuscript','첨부, 제시해주신, 설계도, 프롬프트, 검색 단어, 편집 초안 같은 작업용 문구를 제거하거나 설교 문장으로 고치세요.'],
 P13:['본문 중심','manuscript','dwManuscript','각 대지에서 근거 절을 직접 읽고 본문의 인물·사물·동작 낱말을 설명에 살려 쓰세요. 아래 [최종 원고 지시문 만들기]에 이 보완이 자동으로 들어갑니다.'],
 P14:['하나님이 주어','manuscript','dwManuscript','우리의 할 일보다 먼저 하나님이 본문에서 하신 일·지금 하시는 일을 분명히 말하고, 권면은 그 은혜의 응답으로 놓으세요.'],
 P15:['삶의 장면','manuscript','dwManuscript','대지마다 청중의 실제 하루 장면(직장·가정·식탁·출퇴근길 등)을 하나씩, 서로 다르게 넣으세요. 지어낸 일화나 통계는 쓰지 않습니다.'],
 P16:['흐름과 전환','manuscript','dwManuscript','각 대지의 끝에 다음 대지로 넘어가는 한두 문장을 두어 설교가 앞으로 움직이게 하세요.'],
 P17:['정직한 약속','manuscript','dwManuscript','본문이 약속하지 않은 단정(반드시 성공, 모든 문제가 사라짐 등)을 본문이 말하는 만큼으로 고치세요.'],
 P18:['사랑과 위로','manuscript','dwManuscript','꾸짖기보다 품고 초대하는 말로, 결론은 하나님의 사랑·은혜·소망으로 마음을 붙드세요.'],
 P19:['설교자의 고백','manuscript','dwManuscript','설교자도 이 말씀 앞에 선 사람이라는 고백을 한두 문장 넣으세요. 사건을 지어내지 않고 말씀 앞의 마음으로만 씁니다.'],
 '앵커':['시각 소재·청중·정서','design','dwImages','본문에 실제 있는 그림 단어 2개 이상과 각 출처 절, 청중 상황, 감정 흐름을 적으세요. 말씀에 없는 이미지를 본문 인용으로 만들지 마세요.']};
 function go(step,id){W.show(step);const field=get(id);for(let e=field;e;e=e.parentElement)if(e.tagName==='DETAILS')e.open=true;field.scrollIntoView({block:'center',behavior:'smooth'});field.focus()}
 function decorate(host){for(const p of host.querySelectorAll(':scope > .dw-check')){if(p.dataset.repair)continue;p.dataset.repair='1';const code=p.querySelector('strong')?.textContent.split(' · ')[0],fix=fixes[code];if(!fix||(p.classList.contains('pass')&&!W.report?.rows.some(r=>r.code===code&&r.manualOverride)))continue;const box=document.createElement('span');box.className='dw-fix';box.textContent=fix[3]+' ';const b=document.createElement('button');b.textContent=fix[0]+' 수정 위치 열기';b.onclick=()=>window.AnchorRepair.open(code,fix,p.firstChild.textContent+' '+(p.childNodes[1]?.textContent||''));box.append(b);if(['P5','P7','P10'].includes(code)){const ids={P5:'dwQuotesChecked',P7:'dwActionsChecked',P10:'dwUnityChecked'},check=document.createElement('button');check.textContent='직접 확인란으로 이동';check.onclick=()=>window.AnchorRepair.open(code,fix,p.firstChild.textContent);box.append(check)}p.append(box)}}
 for(const id of ['dwChecks','dwProductionReviewRows']){const host=get(id);new MutationObserver(()=>decorate(host)).observe(host,{childList:true})}
 const host=document.createElement('section');host.className='dw-repair';host.innerHTML=`<h3>검사 결과로 최종 원고 만들기</h3><p>보완이 필요한 항목(빠진 원어·적용·반복·분량 등)을 짚고, 연구 노트에 모은 원어·해석·적용 자료를 함께 담은 <b>최종 원고 지시문</b>을 만듭니다. 통과한 문장은 그대로 두고, 인쇄용 원고 형식으로 돌려받습니다.</p><button id="dwMakeRepair" class="primary">최종 원고 지시문 만들기</button><textarea id="dwRepairOut" rows="7" readonly aria-label="원고 수정 지시문"></textarea><button id="dwCopyRepair">최종 원고 지시문 복사</button><details><summary>수정한 원고 붙여 넣기</summary><textarea id="dwRevisedManuscript" rows="10" aria-label="수정된 원고"></textarea><button id="dwApplyRepair">수정 원고 적용 · 기존 원고는 초안에 보관</button></details><p id="dwRepairStatus" role="status"></p>`;get('dwChecks').after(host);
 get('dwMakeRepair').onclick=async()=>{get('dwRepairOut').value='';try{await W.validate()}catch(e){get('dwRepairStatus').textContent=e.message;return;}const report=W.report;if(!report){get('dwRepairStatus').textContent='현재 원고를 먼저 검사하세요.';return}
  const text=window.SermonBriefs.repair(report),manual=window.SermonBriefs.manualList(report);
  const mine=manual.length?' 직접 확인할 항목: '+manual.map(r=>(fixes[r.code]?.[0]||r.code)).join(', ')+' (외부 AI가 판단할 수 없어 지시문에서 뺐습니다).':'';
  if(!text){get('dwRepairStatus').textContent='AI에게 맡길 수정 사항이 없습니다.'+mine;return}
  get('dwRepairOut').value=text;get('dwRepairStatus').textContent='보완할 항목과 노트 자료를 담았습니다. 복사해 ChatGPT·Claude·Gemini에 붙여 넣고, 돌려받은 최종 원고 전문을 아래 칸에 붙여 넣으세요.'+mine};
 get('dwCopyRepair').onclick=async()=>{if(!get('dwRepairOut').value)return;try{await navigator.clipboard.writeText(get('dwRepairOut').value);get('dwRepairStatus').textContent='최종 원고 지시문을 복사했습니다.'}catch{get('dwRepairOut').focus();get('dwRepairOut').select();get('dwRepairStatus').textContent='선택된 내용을 Ctrl+C로 복사하세요.'}};
 get('dwApplyRepair').onclick=async()=>{try{const value=get('dwRevisedManuscript').value.trim();if(!value)throw Error('수정한 원고 본문을 먼저 넣어 주세요.');researchPipeline.sendToManuscript(value);get('dwRevisedManuscript').value='';get('dwRepairStatus').textContent='이전 원고를 초안에 보관했습니다. 수정 원고를 검사하고 있습니다…';get('dwRepairStatus').textContent='최종 원고를 적용했습니다. 제작용 요약과 함께 확인해 주세요.';await window.FinalManuscriptFlow?.prepare()}catch(e){get('dwRepairStatus').textContent=e.message}};
})();
