'use strict';
const sermonStructures={
 deductive:{name:'연역형 · 핵심 주장 → 근거 → 적용',hint:'주장이 명확할 때 적합합니다. 본문이 그 주장을 실제로 뒷받침하는지 먼저 확인하세요.',steps:['먼저 전할 핵심 주장','본문에서 확인한 근거','근거가 주장을 지지하는 이유','예상되는 반론과 적용의 한계','청중이 선택할 구체적인 실천']},
 inductive:{name:'귀납형 · 관찰 → 발견 → 결론',hint:'청중과 함께 발견하는 흐름입니다. 한 사례를 모든 사람에게 일반화하지 않도록 확인하세요.',steps:['삶에서 출발하는 열린 질문','본문의 세부 관찰을 함께 살피기','관찰에서 반복되는 흐름 발견','이제 도달하는 핵심 메시지','새롭게 보이는 삶의 실천']},
 thesis:{name:'두괄식 · 요지 → 설명 → 재확인',hint:'두괄식은 결론을 먼저 말하는 전달 방식입니다. 연역법과 동일하지 않으며 짧은 메시지에 유용합니다.',steps:['한 문장으로 먼저 말할 요지','요지를 이해하게 하는 본문 설명','일상의 장면으로 풀어 주기','요지와 연결되는 한 가지 적용','첫 문장을 새롭게 되짚으며 마무리']},
 question:{name:'문답형 · 질문 → 탐색 → 응답',hint:'소크라테스식 질문의 장점을 활용합니다. 성도의 정직한 질문을 틀린 답으로 몰아가지 마세요.',steps:['청중이 실제로 품고 있는 질문','익숙한 답으로 충분하지 않은 이유','본문이 질문을 다시 보게 하는 지점','본문에 근거한 잠정적 응답','함께 실천하고 다시 물을 질문']},
 tension:{name:'긴장과 통합형 · 관점 → 반론 → 재구성',hint:'상반된 관점을 공정하게 듣고 본문으로 재검토합니다. 억지 정반합이나 쉬운 타협으로 결론 내리지 않습니다.',steps:['우리가 붙잡고 있는 관점','그 관점에 대한 가장 정직한 반론','본문이 드러내는 더 깊은 긴장','본문을 통해 다시 구성하는 관점','남는 질문과 책임 있는 실천']},
 narrative:{name:'내러티브형 · 장면 → 갈등 → 전환',hint:'본문의 인물·행동·전환을 따라갑니다. 성경에 없는 대사와 감정은 사실처럼 만들어 넣지 않습니다.',steps:['본문의 실제 장면과 배경','인물이 마주한 갈등과 선택','본문에서 일어난 전환','전환이 드러내는 메시지','오늘 청중의 이야기로 돌아오기']},
 problem:{name:'문제와 대안형 · 현실 → 분석 → 응답',hint:'공동체의 구체적인 문제를 다룰 때 적합합니다. 고난의 원인을 개인의 믿음 탓으로 단정하지 않습니다.',steps:['구체적으로 관찰되는 문제','개인·관계·제도 차원의 원인 구분','본문이 제시하는 가치와 방향','가능한 대안과 각각의 한계','이번 주 실행할 행동과 확인 방법']},
 practice:{name:'성찰과 실천형 · 경험 → 해석 → 행동',hint:'경험을 존중하되 본문의 의미와 구별합니다. 개인의 변화와 공동체의 책임을 함께 살펴보세요.',steps:['돌아볼 경험 또는 공동체의 상황','본문으로 경험을 다시 읽기','나의 해석과 본문의 의미 구분','개인과 공동체의 작은 실천','실천 후 다시 성찰할 질문']}
};
const helpModes={
 listen:{label:'경청과 위로',tags:['comfort','grief','lonely'],question:'어떤 마음을 먼저 충분히 들어야 할까요?',action:'당사자가 원하는 도움을 확인하고 함께할 시간을 정하기'},
 hope:{label:'소망과 회복',tags:['comfort','failure','illness'],question:'상황이 아직 바뀌지 않아도 붙잡을 소망은 무엇인가요?',action:'회복을 서두르지 않으며 가능한 한 걸음을 함께 정하기'},
 action:{label:'생활 속 실천',tags:['family','conflict','gratitude'],question:'이번 주 실제로 바꿀 수 있는 작은 행동은 무엇인가요?',action:'누가 언제 무엇을 할지 정하고 다음 만남에서 돌아보기'},
 discern:{label:'진로와 의사결정',tags:['transition','anxiety','doubt'],question:'지키고 싶은 가치와 선택의 대가는 무엇인가요?',action:'선택지를 적고 신뢰할 수 있는 사람과 함께 분별하기'},
 reconcile:{label:'갈등과 관계 회복',tags:['conflict','forgiveness','anger'],question:'서로의 입장과 책임, 필요한 경계는 무엇인가요?',action:'안전한 대화의 조건과 동의한 약속을 정하기'},
 rest:{label:'소진과 쉼',tags:['burnout','illness','anxiety'],question:'계속 떠안고 있는 책임 중 나눌 수 있는 것은 무엇인가요?',action:'이번 주 내려놓을 일과 도움을 요청할 사람 정하기'},
 grief:{label:'상실과 애도',tags:['grief','loss','comfort'],question:'잃은 것을 어떻게 기억하고 애도하고 싶으신가요?',action:'슬픔의 속도를 존중하며 곁에 있을 방법 정하기'},
 growth:{label:'신앙의 질문과 성장',tags:['doubt','transition'],question:'쉽게 답을 내리지 않고 함께 탐구할 질문은 무엇인가요?',action:'본문을 함께 읽고 다음에 다시 나눌 질문을 기록하기'},
 gratitude:{label:'감사와 공동체 섬김',tags:['gratitude'],question:'받은 도움을 기억하고 누구와 나눌 수 있을까요?',action:'감사를 표현할 대상과 공동체를 위한 작은 실천 정하기'}
};
function selectedHelp(){return helpModes[$('careMode').value]||helpModes.listen}
$('careMode').innerHTML=Object.entries(helpModes).map(([id,x])=>`<option value="${id}">${x.label}</option>`).join('');
$('careMode').onchange=()=>showRecommendations();
$('careExample').textContent='공동체 돌봄 예시';
$('situation').placeholder='예: 일과 돌봄에 지친 성도들이 서로의 짐을 나누고 쉼을 회복하도록 말씀을 준비합니다. 본문과 연구 자료를 찾아 주세요.';
$('careExample').onclick=()=>{$('situation').value='일과 가족 돌봄으로 지친 성도들이 서로의 짐을 나누고 쉼을 회복하도록 말씀을 준비합니다. 본문과 원어 연구 자료를 찾고 싶습니다.';$('careMode').value='rest';findCare()};
const oldOpenVisit=openVisit;
openVisit=function(){oldOpenVisit();if(!chosenCard)return;const m=selectedHelp();$('visitText').value=$('visitText').value.replace('1. 먼저 건넬 말','도움의 방향: '+m.label+'\n\n1. 먼저 건넬 말')+`\n\n이번 목적에 맞춰 더 물을 질문\n${m.question}\n\n함께 정할 행동\n${m.action}`};$('openVisit').onclick=openVisit;

const studioSettings=document.createElement('div');studioSettings.className='studio-settings';studioSettings.innerHTML=`<h3>설교의 흐름 설계</h3><label for="sermonStructure">논증과 전달 구조</label><select id="sermonStructure">${Object.entries(sermonStructures).map(([id,x])=>`<option value="${id}">${x.name}</option>`).join('')}</select><p id="structureHint" class="micro"></p><div class="studio-grid"><label>청중<input id="sermonAudience" maxlength="150" placeholder="예: 일과 돌봄에 지친 장년 성도"></label><label>설교 시간<select id="sermonMinutes"><option value="10">10분</option><option value="20" selected>20분</option><option value="30">30분</option><option value="40">40분</option></select></label></div><label>청중과 함께 붙잡을 질문<input id="sermonQuestion" maxlength="500" placeholder="예: 우리는 서로의 짐을 어떻게 나눌 수 있을까?"></label><label>구체적인 삶의 장면·사례<textarea id="sermonScene" maxlength="3000" placeholder="직접 관찰한 장면을 적으세요. 실명과 개인을 알아볼 정보는 제외하세요."></textarea></label>`;
$('makeOutline').before(studioSettings);$('structureHint').textContent=sermonStructures.deductive.hint;$('sermonStructure').onchange=()=>{$('structureHint').textContent=sermonStructures[$('sermonStructure').value].hint};$('makeOutline').textContent='선택한 구조로 설교 설계하기';
let studioSnapshot=null;
$('makeOutline').onclick=()=>toast('설교 설계 기능을 불러오지 못했습니다. 화면을 새로고침해 주세요.');

// Prompt production uses the current edited sermon, never a stale initial outline.
const mediaTools=document.createElement('section');mediaTools.className='media-tools';mediaTools.innerHTML=`<h3>설교를 시각·음악 자료로</h3><p class="micro">위에서 수정한 설교의 핵심을 제작용 장면과 스타일로 바꿉니다. 복사한 뒤 원하는 제작 도구에 붙여 넣으세요.</p><div class="studio-grid"><label>화면 비율<select id="mediaRatio"><option>16:9</option><option>9:16</option><option>1:1</option></select></label><label>음악 플랫폼<select id="musicPlatform"><option value="flow">Google Flow Music / Lyria</option><option value="suno">Suno</option><option value="general">일반 음악 제작 도구</option></select></label><label>음악 방향<select id="musicMood"><option value="reflect">성찰 · 잔잔한 어쿠스틱</option><option value="hope">소망 · 따뜻한 시네마틱</option><option value="joy">감사 · 밝은 어쿠스틱 팝</option></select></label><label>보컬<select id="musicVocal"><option value="instrumental">가사 없는 연주곡</option><option value="vocal">한국어 보컬곡</option></select></label></div><div class="prompt-buttons"><button data-prompt="image">한 컷 이미지 슬라이드</button><button data-prompt="info">설교 인포그래픽</button><button data-prompt="music">음악 프롬프트</button><button data-prompt="video">뮤직비디오 프롬프트</button><button data-prompt="ppt">PPT 제작 프롬프트</button></div><p class="micro">설교에서 실명·상담 내용을 지운 뒤 외부 도구에 붙여 넣으세요. 프롬프트 생성 자체는 기기 안에서 이루어집니다.</p>`;$('outlineText').after(mediaTools);
document.body.insertAdjacentHTML('beforeend',`<dialog id="promptDialog"><div class="dialog-head"><h2 id="promptTitle">제작 프롬프트</h2><button data-close aria-label="닫기">✕</button></div><div class="dialog-body"><p id="promptGuidance" class="micro"></p><textarea id="promptText" class="large-editor" aria-label="편집 가능한 제작 프롬프트"></textarea><div class="action-row"><button id="copyPrompt" class="primary">프롬프트 복사</button><button id="downloadPrompt">글로 내려받기</button></div><p id="promptStatus" role="status"></p><details><summary>플랫폼 공식 작성 안내</summary><a href="https://deepmind.google/models/lyria/prompt-guide/" target="_blank" rel="noopener">Google Flow Music / Lyria</a> · <a href="https://deepmind.google/models/veo/prompt-guide/" target="_blank" rel="noopener">Flow / Veo 영상</a></details></div></dialog>`);
function openPrompt(title,text,guidance='프롬프트는 편집할 수 있습니다. 실제 생성 결과와 지원 길이·해상도는 사용 플랫폼과 모델에 따라 달라집니다.'){$('promptTitle').textContent=title;$('promptText').value=text;$('promptGuidance').textContent=guidance;$('promptStatus').textContent='';$('promptDialog').showModal()}
document.querySelector('#promptDialog [data-close]').onclick=()=>$('promptDialog').close();
$('copyPrompt').onclick=async()=>{try{await navigator.clipboard.writeText($('promptText').value);$('promptStatus').textContent='복사했습니다. 제작 도구에 붙여 넣으세요.'}catch{$('promptText').focus();$('promptText').select();$('promptStatus').textContent='자동 복사가 제한되어 전체를 선택했습니다. Ctrl+C 또는 복사를 사용하세요.'}};
$('downloadPrompt').onclick=()=>download('설교-제작-프롬프트.txt',$('promptText').value,'text/plain;charset=utf-8');
