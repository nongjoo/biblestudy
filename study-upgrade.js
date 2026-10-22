'use strict';
// Modern translations stay on their publisher's site; no corpus is copied.
(()=>{
 const editions={GAE:'개역개정',SAENEW:'새번역',COG:'공동번역',COGNEW:'공동번역 개정판'};
 const btn=document.createElement('button');btn.id='officialTranslations';btn.className='quiet';btn.textContent='현대 한국어 번역 비교 ↗';$('copyVerse').before(btn);
 document.body.insertAdjacentHTML('beforeend','<dialog id="officialBibleDialog"><div class="dialog-head"><h2>대한성서공회 공식 번역 읽기</h2><button id="closeOfficialBible" aria-label="닫기">✕</button></div><div class="dialog-body"><p id="officialBibleRef" class="tag"></p><div id="officialBibleLinks" class="official-links"></div><p>선택한 번역을 대한성서공회 공식 사이트의 새 창에서 읽습니다. 인터넷 연결이 필요합니다. 개역개정·새번역·공동번역을 이 앱 화면에 제공하려면 성서공회의 사용 허락이 필요합니다. 클릭 횟수가 아니라 서비스의 이용 허락 범위가 기준입니다. 현재는 공식 페이지에서 읽도록 연결합니다.</p><a href="https://www.bskorea.or.kr/bbs/content.php?co_id=subpage2_3_4_3" target="_blank" rel="noopener noreferrer">대한성서공회 이용 안내</a></div></dialog>');
 btn.onclick=()=>{if(!books.length||!document.querySelector('.verse')){toast('먼저 본문을 선택하세요.');return}$('officialBibleRef').textContent=ref();$('officialBibleLinks').replaceChildren(...Object.entries(editions).map(([id,name])=>{const a=document.createElement('a');a.textContent=name+' · '+ref()+' ↗';a.href='https://www.bskorea.or.kr/bible/korbibReadpage.php?'+new URLSearchParams({version:id,book:b==='JON'?'jnh':b.toLowerCase(),chap:String(c),sec:String(v)});a.target='_blank';a.rel='noopener noreferrer';return a}));$('officialBibleDialog').showModal()};$('closeOfficialBible').onclick=()=>$('officialBibleDialog').close();
 // A click selects the verse as before, then offers modern editions. Drag-to-select remains intact.
 // v35: 읽기 클릭 방해 방지 - 버튼으로만 열기
 // $('verses').addEventListener('click',e=>{if(version!=='kor'||!e.target.closest('.primary-content')||window.getSelection()?.toString().trim())return;btn.click()});
})();
const sermonLexicalNotes=sources=>sources.flatMap(s=>{
 if(s.id==='P0'||!/[\u0370-\u03ff\u1f00-\u1fff\u0590-\u05ff]|원어 사전|한국어 기본 뜻/.test(s.text))return[];
 const lemma=(s.text.match(/기본형:\s*([^\n]+)/)||s.text.match(/([^\n]+)\s*\([GH]\d+\)/)||[])[1]?.trim();
 const meaning=(s.text.match(/한국어 기본 뜻:\s*([^\n]+)/)||s.text.match(/영어 사전 뜻:\s*([^\n]+)/)||[])[1]?.trim();
 return lemma&&meaning?[{lemma,meaning:clipSentence(meaning,240),id:s.id,reference:s.reference}]:[];
});
Object.assign(helpModes,{
 celebrate:{label:'기쁨과 감사 나눔',tags:['joy','gratitude','creation'],question:'함께 기뻐하고 감사할 은혜는 무엇인가요?',action:'감사할 장면을 서로 나누고 기쁨을 이웃과 나누기'},
 vocation:{label:'소명과 재능 발견',tags:['calling','service','growth'],question:'받은 재능이 누구의 삶을 도울 수 있나요?',action:'일상과 공동체에서 실천할 작은 섬김 하나 정하기'},
 belonging:{label:'환대와 협력',tags:['hospitality','unity','friendship'],question:'처음 온 사람과 다른 의견을 가진 사람을 어떻게 맞이할까요?',action:'각자의 목소리를 듣고 함께 맡을 역할 정하기'}
});
for(const id of ['celebrate','vocation','belonging'])$('careMode').add(new Option(helpModes[id].label,id));
