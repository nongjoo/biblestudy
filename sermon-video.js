'use strict';
// Local shot compiler. Settings, visible events and continuity are data, not model promises.
const sermonVideo=(()=>{
 const look='Natural cinematic realism, restrained contrast, realistic surface texture.';
 const roles=['공간 열기','한 가지 단서','눈에 보이는 변화','여운 남기기'];
 const modes={intro:{label:'설교 도입 영상',ratio:'16:9',roles,summary:'공간 열기 → 단서 발견 → 의미의 전환 → 설교로 이어지는 여운'},shorts:{label:'쇼츠 영상',ratio:'9:16',roles:['시선을 잡는 디테일','장면의 맥락','핵심 변화','기억할 한 장면'],summary:'설교의 핵심 → 첫 번째 대지 → 두 번째 대지 → 세 번째 대지와 응답'}};
 let preferredMode='intro';
 let activeEdit=null;
 $('promptText').addEventListener('input',()=>{if(activeEdit)activeEdit()});
 const motion={
  vine:['The leaves move slightly in a light breeze.','The dew drop stays still as the camera approaches.','One foreground leaf turns sideways in the breeze and uncovers the attached grape cluster.','The revealed cluster stays attached while the leaves move slightly.'],
  care:['The basket tilts slightly toward the person holding its first handle.','The held handle curves gently under the weight.','The second person grasps the free handle and shares the weight until the basket becomes level.','Both people keep holding the level basket.'],
  hope:['The lower leaf bends slightly under the water bead.','The water bead remains suspended at the leaf tip.','The bead falls to the soil; the released leaf lifts slightly and settles.','The lifted leaf rests at its natural angle while the seedling stays the same size.'],
  rest:['The seated traveler keeps holding the strap while the pack stays on the ground.','The hand maintains its grip on the strap.','The traveler releases the strap and rests the open hand on their knee.','The traveler stays seated with relaxed hands while the stream flows.'],
  grace:['Both people stand still on opposite sides of the threshold.','The relaxed hand stays open.','One person extends an open palm partway across the threshold; a gap remains between the hands.','The hand stays extended while both people remain in place.'],
  love:['The first person holds the cup while both remain seated.','The water inside the cup remains almost still.','The first person passes the cup and the second receives it with both hands.','The receiver keeps holding the cup while both people stay seated.'],
  light:['The flame quivers gently above the lamp.','The single flame makes a small flickering movement.','A breeze briefly leans the flame; its light moves across the nearest stone before the flame returns upright.','The flame lights the nearby stones while the farther path stays dark.'],
  peace:['Small ripples approach the moored boat.','The knot fibers flex slightly with the boat’s movement.','One ripple lifts the boat, which settles back beside the post with its rope attached.','The boat continues its slight motion beside the post.'],
  grief:['Both people sit still with their hands apart.','The resting fingers remain relaxed.','One hand slides a little closer to the other and stops with a small gap remaining.','Both people remain seated with their hands closer together as rain continues.'],
  gratitude:['The first person rests a hand beside the loose bread piece.','The loose piece stays still on the cloth.','The first person passes the loose piece and the second receives it.','The receiver keeps holding the piece while both stay seated.'],
  justice:['Both people hold the plank just above the opening.','The plank stays suspended above the opening.','Both people lower the plank until it rests level across the opening and keep steadying its ends.','The plank stays in place with both people beside it.'],
  growth:['The leaves move slightly while the trunk remains near its resting position.','The exposed root stays fixed in the soil.','A mild gust bends the flexible trunk a few degrees; it returns gently as the gust passes.','The trunk rests in its original curve while the leaves move slightly.']
 };
 function resolve(brief,selected='auto'){
  if(typeof sermonContext!=='undefined')return sermonContext.resolve(brief,selected);
  if(selected!=='auto')return Object.hasOwn(sermonVideoScenes,selected)?selected:null;
  const clean=x=>typeof sermonEditorial!=='undefined'?sermonEditorial.printable(String(x||'')).join(' '):String(x||'');
  const focus=clean(brief.focus),points=(brief.points||[]).map(clean).join(' ');
  const ranked=Object.entries(visualThemes).map(([id,t])=>({id,score:t.terms.reduce((n,term)=>n+(focus.includes(term)?6:0)+(points.includes(term)?1:0),0)})).sort((a,b)=>b.score-a.score);
  return ranked[0]?.score?ranked[0].id:null;
 }
 function custom(value){
  const r=sermonMidjourney.customScene(value),errors=[...r.errors];
  if(!r.text.trim())errors.push('직접 장면에는 눈에 보이는 대상과 장소를 영어로 적어 주세요.');
  if(/\b(?:pan(?:ning)?|tilt(?:ing)?|zoom\w*|dolly|truck(?:ing)?|track(?:ing)?|push-in|pull-back|camera|lens|fps|seconds?)\b/i.test(r.text))errors.push('직접 장면에는 대상·장소·빛을 적고, 카메라 이동·길이는 빼 주세요. 쇼트별로 따로 구성합니다.');
  const text=r.text.replace(/[.!?]+$/,'');
  return {errors,exclude:r.exclude||[],scene:{anchor:`Use this visual setup: ${text}.`,people:null,light:'Keep the established illumination steady throughout the clip.',audio:Array(4).fill('Silent footage.'),detail:'one visible surface detail of the main subject',turn:'직접 지정 장면은 대상의 변화 대신 구도의 변화로 연결합니다.',endState:'대상과 장소를 유지한 채 넓은 구도로 마칩니다.',turnCamera:'truck',shots:[
   'Establish the main subject in the foreground and the supplied setting behind it. Keep the arrangement stable.',
   'Concentrate on one visible surface detail of the main subject. Keep only that detail sharply focused against a softly blurred background.',
   'Reveal the spatial relationship between the main subject and its immediate surroundings as the viewpoint shifts gently sideways. Keep the subject arrangement unchanged.',
   'Include the main subject and more of its immediate surroundings in the wider view. Keep their established arrangement unchanged.'
  ]}};
 }
 function compose({theme,customScene='',duration=6,mode='intro',ratio=modes[mode]?.ratio||'16:9',reference='text',audio='ambient',negative='combined',brief}={}){
  const errors=[],warnings=[],isCustom=!!customScene.trim(),c=isCustom?custom(customScene):null,s=c?.scene||sermonVideoScenes[theme];
  if(!Object.hasOwn(modes,mode))errors.push('설교 도입 영상 또는 쇼츠 영상을 선택하세요.');
  if(mode==='shorts'&&ratio!=='9:16')errors.push('쇼츠 영상은 세로 9:16으로 구성합니다.');
  if(!s)errors.push('제작의 중심에 맞는 시각적 주제를 고르거나 영어 장면을 직접 지정해 주세요.');
  if(c)errors.push(...c.errors);
  if(![4,6,8].includes(duration))errors.push('클립 길이는 4·6·8초 중에서 선택하세요.');
  if(!['16:9','9:16'].includes(ratio))errors.push('이 영상 구성의 화면비는 16:9 또는 9:16입니다. 아래에서 선택해 주세요.');
  if(!['text','ingredients','frame'].includes(reference))errors.push('참조 이미지 방식을 다시 선택하세요.');
  if(!['ambient','silent'].includes(audio)||!['combined','separate'].includes(negative))errors.push('소리·입력란 설정을 다시 선택하세요.');
  if(reference==='ingredients'&&duration!==8)errors.push('Flow의 Veo 3.1 Lite/Fast 참조 이미지 구성은 8초를 선택하세요. 다른 모델은 해당 도구의 지원 조건을 확인하세요.');
  if(errors.length)return {ready:false,errors,warnings,shots:[]};
  const silent=audio==='silent'||isCustom||s.audio.every(x=>x==='Silent footage.'),excluded=[...new Set(['text','subtitles','logos','watermarks','title cards',...(silent?['audio']:['speech','singing','music']),...(s.people===false?['people']:[]),...(c?.exclude||[])])];
  if(isCustom&&audio==='ambient')warnings.push('직접 장면의 장소 소리를 추측하지 않도록 무음으로 구성했습니다.');
  if(!isCustom&&silent&&audio==='ambient')warnings.push('이 상징 구도는 장소 소리를 추가하지 않는 무음 영상입니다.');
  if(reference==='ingredients')warnings.push('Flow에서 같은 소재 이미지를 각 쇼트에 다시 첨부하세요. Veo 3.1 Quality는 이 참조 방식 지원 여부를 확인하세요.');
  if(reference==='frame')warnings.push('각 쇼트 구도에 맞는 시작 이미지를 각각 준비하세요. 같은 광각 이미지를 접사 시작 이미지로 재사용하지 마세요.');
  const cameras=[
   {lens:35,movement:'locked',text:'Wide establishing view, approximately a 35mm lens perspective. The camera stays locked at eye level.',motion:'The camera stays locked.'},
   {lens:85,movement:'push-in',text:'Close-up, approximately an 85mm lens perspective, shallow depth of field. The camera makes one slow, short push-in.',motion:'The camera makes one slow, short push-in.'},
   {lens:50,movement:s.turnCamera,text:'Medium view, approximately a 50mm lens perspective. '+(s.turnCamera==='truck'?'The camera makes one slow lateral truck to the right.':'The camera stays locked.'),motion:s.turnCamera==='truck'?'The camera makes one slow lateral truck to the right.':'The camera stays locked.'},
   {lens:24,movement:'locked',text:'Wide view, approximately a 24mm lens perspective, from farther away than the opening viewpoint. The camera stays locked for the entire clip.',motion:'The camera stays locked for the entire clip.'}
  ];
  const shorts=mode==='shorts';
  const events=isCustom?['Keep the subject arrangement stable.','Keep the selected surface detail still.','Keep the subject arrangement unchanged as the viewpoint moves.','Keep the subject arrangement stable.']:motion[theme];
  // Start with a detail of the INITIAL state, then reveal its context. Preserve the event order.
  const actions=shorts?[
   `Open directly on ${s.detail}, already large and sharply readable in the first frame. ${events[0]} Keep the surroundings softly blurred.`,
   s.shots[0],s.shots[2],s.shots[3].replace(/(?:the )?wider (?:view|garden view)/gi,'the final composition')
  ]:s.shots;
  if(shorts){
   cameras[0]={lens:85,movement:'locked',text:'Tight close-up, approximately an 85mm lens perspective, locked camera, shallow depth of field.',motion:'The camera stays locked on the initial focal detail.'};
   cameras[1]={lens:50,movement:'locked',text:'Medium view, approximately a 50mm lens perspective. The camera stays locked; the initial detail and its immediate context are readable together.',motion:'The camera stays locked on the initial arrangement.'};
   cameras[3]={lens:35,movement:'locked',text:'Medium-wide view, approximately a 35mm lens perspective. The camera stays locked with the completed relationship large and readable.',motion:'The camera stays locked on the final state.'};
  }
  const framing=shorts?'Vertical 9:16 composition. Keep the essential action within the central area, with quiet space along the bottom and right edge.':'';
  let shots=actions.map((action,i)=>{
   const event=events[shorts&&i===1?0:i];
   const direction=shorts?[
    'Frame one tactile detail as the immediate visual focus.',
    'Reveal the context of the opening detail while preserving its initial state and screen direction.',
    'Keep the established action easy to read within the portrait frame.',
    'Keep the final state settled and visually complete, with the focal subject still prominent.'
   ][i]:brief?productionDirection.video(brief,i):'';
   const positive=reference==='frame'?`${event} ${cameras[i].motion}\n\n${silent?'Silent footage.':s.audio[i]}`:[reference==='ingredients'?'Use the attached subject and setting references to preserve appearance.':'',s.anchor,s.light,look,action,cameras[i].text,framing,direction,silent?'Silent footage.':s.audio[i]].filter(Boolean).join('\n\n');
   return {id:i+1,role:modes[mode].roles[i],start:i*duration,end:(i+1)*duration,anchor:s.anchor,light:s.light,action,event,camera:cameras[i],focus:i===(shorts?0:1)?s.detail:null,positive,prompt:positive+(negative==='combined'?`\n\nExclude: ${excluded.join(', ')}.`:'')};
  });
  if(shorts&&brief&&!isCustom){
   const messages=[brief.focus,...brief.points||[]];while(messages.length<4)messages.push(brief.application||brief.focus);
   shots=shots.map((shot,i)=>{
    const message=messages[i],local={...brief,focus:message,points:[],question:'',application:''},id=i===0?theme:resolve(local);
    const scene=sermonVideoScenes[id]||s,action=i===0?`Open directly on ${scene.detail}. ${motion[id]?.[0]||events[0]}`:i===3?scene.shots[3]:scene.shots[0];
    const camera=i===0?cameras[0]:i===3?cameras[3]:cameras[1],event=motion[id]?.[i===3?3:0]||events[0];
    const sound=silent||scene.audio.every(x=>x==='Silent footage.')?'Silent footage.':scene.audio[i];
    const negativeTerms=[...new Set(['text','subtitles','logos','watermarks','title cards',...(sound==='Silent footage.'?['audio']:['speech','singing','music']),...(scene.people===false?['people']:[])])];
    const positive=reference==='frame'?`${event} ${camera.motion}\n\n${sound}`:[reference==='ingredients'?'Use the attached references for this vignette.':'',scene.anchor,scene.light,look,action,camera.text,framing,'Keep this vignette visually complete with one readable central relationship.',sound].filter(Boolean).join('\n\n');
    return {...shot,role:i===0?'설교의 핵심':`대지 ${i} · ${i===3?'삶의 응답':'말씀의 발견'}`,message,theme:id,anchor:scene.anchor,light:scene.light,action,event,camera,positive,prompt:positive+(negative==='combined'?`\n\nExclude: ${negativeTerms.join(', ')}.`:''),negative:negativeTerms.join(', ')};
   });
   warnings.push('쇼츠는 설교의 핵심과 세 대지를 네 장면으로 요약합니다. 서로 다른 비유를 하나의 성경 사건처럼 이어 붙이지 말고, 각 장면을 구분해 편집하세요.');
  }
  // Validate output boundaries, rather than claiming to judge a generated film or theology.
  if(shots.some(x=>/\b(?:undefined|null|Production direction|visual metaphor|24 fps|\d+ seconds)\b/.test(x.positive)))errors.push('영상 설명에 제작용 임시 문구가 남았습니다.');
  if(shots.some(x=>x.positive.split(/\s+/).length>230))errors.push('직접 장면이 너무 깁니다. 대상·장소·빛을 중심으로 짧게 줄여 주세요.');
  if(!shorts&&(new Set(shots.map(x=>x.anchor)).size!==1||new Set(shots.map(x=>x.light)).size!==1))errors.push('장면 사이의 대상 또는 조명이 일치하지 않습니다.');
  return {ready:!errors.length,errors,warnings,theme:isCustom?'custom':theme,label:isCustom?'직접 지정한 장면':visualThemes[theme].label,turn:s.turn,endState:shorts&&brief?'설교의 세 번째 대지와 삶의 응답을 떠올리며 마칩니다.':isCustom&&shorts?'지정한 대상의 배치와 최종 상태를 유지합니다.':s.endState,negative:excluded.join(', '),shots,message:String(brief?.focus||''),settings:{mode,duration,total:duration*4,ratio,reference,audio:silent?'silent':'ambient',negative,editingFps:24},audit:[shorts?'설교의 핵심과 세 대지를 각각의 장면으로 요약':'동일 대상·장소·조명 유지','쇼트마다 카메라 동작 1개','접사 초점 대상 1개',shorts?'세로 중앙 구도 · 핵심 문장별 시각 주제 연결':'마지막 쇼트: 더 먼 거리의 넓은 구도','화면 글자·로고·목소리·음악 제외']};
 }
 function plan(p,texts=p.shots.map(s=>s.prompt)){
  if(!p.ready)return '';
  const m=modes[p.settings.mode]||modes.intro;
  return `${m.label} · 제작 계획 (각 쇼트는 따로 생성)\n제작의 중심: ${p.message||'제작의 중심에서 핵심 메시지를 입력하세요.'}\n위 메시지는 편집 참고용이며 영상 화면에 쓰지 않습니다.\n흐름: ${m.summary}\n주제: ${p.label}\n보이는 변화: ${p.turn}\n마지막 상태: ${p.endState}\n설정: ${p.settings.ratio} · 클립 ${p.settings.duration}초 × 4 = ${p.settings.total}초\n참조 방식: ${p.settings.reference}\n${p.settings.mode==='shorts'?'편집: 핵심 메시지와 세 대지를 각 장면으로 전달합니다. 비유가 바뀌는 지점을 컷으로 구별하고, 결말은 적용 문장을 떠올릴 여운으로 닫습니다.':'편집: 넓은 공간에서 시작해 단서에 다가간 뒤, 마지막 넓은 구도로 설교에 이어집니다.'}\n24fps 타임라인 권장. 마지막 정지·페이드는 편집기에서 처리.\n${p.warnings.join('\n')}\n\n`+p.shots.map((s,i)=>`SHOT ${s.id} | ${s.start}–${s.end}s | ${s.role}\n전할 내용(편집 참고·화면에 인쇄하지 않음): ${s.message||p.message}\n${texts[i]}`).join('\n\n')+(p.settings.negative==='separate'?`\n\nNegative 입력란이 있는 도구에서만 별도 입력:\n${p.shots.map(s=>`SHOT ${s.id}: ${s.negative||p.negative}`).join('\n')}`:'');
 }
 function show(){
  if(!$('outlineText').value.trim()){toast('먼저 설교 원고를 작성하세요.');return}
  const b=extractCreativeBrief(),theme=resolve(b,$('visualTheme').value),scene=$('customVisualScene')?.value||'';
  const defaults=mode=>({brief:b,theme,customScene:scene,mode,ratio:modes[mode].ratio,duration:6,reference:'text',audio:'ambient',negative:'combined'});
  const savedModes={};
  let config=defaults(preferredMode),packet,selected=0,drafts={};
  resetPromptExtras();currentPromptType='video';openPrompt('설교 도입 영상 · 쇼츠 영상','','');$('promptDialog').classList.add('video-shot-dialog');
  const panel=document.createElement('div');panel.className='video-director';panel.innerHTML=`<p class="video-overview" id="videoOverview"></p><div class="video-shot-tabs" role="group" aria-label="영상 쇼트 선택"></div><p id="videoShotLabel" class="micro" aria-live="polite"></p><details class="video-settings"><summary>길이 · 화면비 · 참조 이미지 설정</summary><p class="micro">설정을 바꾸면 새 프롬프트로 바뀝니다. 직접 고친 문장은 먼저 복사해 두세요.</p><div class="studio-grid"><label>클립 길이<select id="videoDuration"><option value="4">4초 · 총 16초</option><option value="6" selected>6초 · 총 24초</option><option value="8">8초 · 총 32초</option></select></label><label>화면비<select id="videoRatio"><option value="16:9">가로 16:9</option><option value="9:16">세로 9:16</option><option value="1:1" disabled>1:1 · 지원 화면비로 변경 필요</option></select></label><label>참조 방법<select id="videoReference"><option value="text">글로 생성</option><option value="ingredients">같은 소재 이미지 반복 사용</option><option value="frame">쇼트별 시작 이미지 사용</option></select></label><label>소리<select id="videoAudio"><option value="ambient">장소에 맞는 작은 환경음</option><option value="silent">무음</option></select></label><label>도구의 입력란<select id="videoNegative"><option value="combined">한 칸에 붙여넣기 · Flow 등</option><option value="separate">Negative 입력란이 따로 있음</option></select></label></div><p class="micro">길이와 비율은 영상 도구에서도 직접 선택하세요. 참조 이미지 지원·길이는 모델별로 다릅니다. Flow의 Veo 3.1 Lite/Fast 소재 참조는 8초 기준입니다. 시작 이미지 방식은 이미지에 구도와 빛을 담고, 프롬프트는 움직임에 집중합니다.</p><div class="action-row"><button id="videoNegativeView" hidden>제외 항목만 보기</button><button id="videoPlanView">전체 제작 계획 보기</button></div><p class="micro">4개 클립을 순서대로 편집하세요. 24fps는 편집 타임라인 권장값이며 생성 도구 설정을 보장하지 않습니다. 마지막 정지 화면·페이드는 편집기에서 더하고, 무음이 필요하면 최종 소리를 음소거하세요. <a href="https://support.google.com/flow/answer/16352836?hl=en" target="_blank" rel="noopener noreferrer">Flow 지원 기능 ↗</a></p></details><details class="video-audit"><summary>장면 연결 확인</summary><div id="videoAudit"></div></details>`;
  panel.insertAdjacentHTML('afterbegin',`<div class="video-mode-tabs" role="group" aria-label="영상 용도 선택"><button type="button" data-video-mode="intro"><strong>설교 도입 영상</strong><span>가로 화면 · 여유 있게 주제를 여는 흐름</span></button><button type="button" data-video-mode="shorts"><strong>쇼츠 영상</strong><span>세로 화면 · 핵심 장면부터 전하는 짧은 흐름</span></button></div><p id="videoModeSummary" class="video-mode-summary" aria-live="polite"></p>`);
  extrasBar.append(panel);
  const controls=[['videoDuration','duration'],['videoRatio','ratio'],['videoReference','reference'],['videoAudio','audio'],['videoNegative','negative']];
  function syncControls(){for(const [id,prop]of controls)$(id).value=String(config[prop]);$('videoRatio').disabled=config.mode==='shorts';}
  function display(index){
   selected=index;const ready=packet.ready;let text='';
   if(ready){if(index==='negative')text=packet.settings.mode==='shorts'?packet.shots.map(s=>`SHOT ${s.id}: ${s.negative||packet.negative}`).join('\n'):packet.negative;else if(index==='all')text=packet.shots.map((s,i)=>`SHOT ${s.id} | ${s.start}–${s.end}s\n${drafts[i]??s.prompt}`).join('\n\n---\n\n')+(packet.settings.negative==='separate'?`\n\nNEGATIVE PROMPT (separate input field)\n${packet.shots.map(s=>`SHOT ${s.id}: ${s.negative||packet.negative}`).join('\n')}`:'');else if(index==='plan')text=plan(packet,packet.shots.map((s,i)=>drafts[i]??s.prompt));else text=drafts[index]??packet.shots[index].prompt}
   $('promptText').value=text;$('promptText').readOnly=index==='all';$('copyPrompt').disabled=!ready;$('downloadPrompt').disabled=!ready;
   panel.querySelectorAll('[data-video-shot]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.videoShot)===index)));
   $('videoAllView').setAttribute('aria-pressed',String(index==='all'));
   $('videoShotLabel').textContent=!ready?'설정 보완 후 생성할 수 있습니다.':index==='all'?'네 장면의 프롬프트를 한 번에 확인·복사·내려받을 수 있습니다. 문장은 각 쇼트에서 수정하세요. 영상은 쇼트별로 생성한 뒤 연결합니다.':index==='negative'?'이 내용은 별도의 Negative 입력란에만 넣으세요.':index==='plan'?'전체 계획은 보관·편집용입니다. 생성할 때는 쇼트 하나를 골라 복사하세요.':`쇼트 ${index+1} · ${packet.shots[index].role} · ${packet.shots[index].start}–${packet.shots[index].end}초${drafts[index]!==undefined?' · 직접 수정됨':''}`;
  }
  function render(view=0){
   packet=compose(config);currentVideoShots=packet.shots.map((s,i)=>drafts[i]??s.prompt);
   syncControls();
   $('promptTitle').textContent=`${modes[config.mode].label} 프롬프트`;
   panel.querySelectorAll('[data-video-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.videoMode===config.mode)));
   $('videoModeSummary').textContent=`${modes[config.mode].summary} · ${config.ratio} · ${config.duration*4}초. 이 창 안에서는 용도를 바꿔도 각 용도의 수정 내용을 유지합니다.`;
   $('promptGuidance').textContent=packet.ready?(config.mode==='shorts'?'설교의 핵심과 세 대지를 요약하는 세로 쇼츠입니다. 네 클립을 각각 생성해 순서대로 연결하세요.':'여유 있는 공간에서 시작해 설교로 이어지는 영상입니다. 네 클립을 각각 생성해 순서대로 연결하세요.')+' 화면 글자·로고·목소리·음악은 넣지 않습니다.':packet.errors.join(' ');
   $('videoOverview').textContent=packet.ready?(config.mode==='shorts'?packet.shots.map((s,i)=>`${i+1}. ${s.message||b.points[i]||b.focus}`).join('\n'):`설교를 여는 질문: ${b.question}\n중심 메시지: ${b.focus}\n${packet.label} · ${packet.turn}`):'영상 설정을 확인해 주세요.';
   const tabs=panel.querySelector('.video-shot-tabs');tabs.replaceChildren();const allButton=document.createElement('button');allButton.id='videoAllView';allButton.textContent='전체 프롬프트 보기';allButton.disabled=!packet.ready;allButton.onclick=()=>display('all');tabs.append(allButton);for(let i=0;i<4;i++){const btn=document.createElement('button');btn.textContent=`쇼트 ${i+1}만 보기`;btn.dataset.videoShot=i;btn.disabled=!packet.ready;btn.onclick=()=>display(i);tabs.append(btn)}
   $('videoNegativeView').hidden=config.negative!=='separate';$('videoNegativeView').disabled=!packet.ready;$('videoPlanView').disabled=!packet.ready;
   $('videoAudit').replaceChildren();for(const line of [...(packet.audit||[]),packet.endState||'',...packet.warnings,...packet.errors,'주제에 따른 시각적 비유입니다. 본문 사건의 재현이나 설교의 자동 해석이 아니므로, 제작의 중심과 맞는지 확인하세요.','검수 범위는 생성된 문구와 설정입니다. 실제 영상의 연속성·손 모양·오디오·내용은 생성 후 확인하세요.']){if(!line)continue;const p=document.createElement('p');p.textContent=line;$('videoAudit').append(p)}
   panel.querySelector('.video-settings').open=!packet.ready;display(view);
  }
  for(const [id,prop]of controls)$(id).onchange=()=>{config[prop]=prop==='duration'?Number($(id).value):$(id).value;drafts={};render()};
  panel.querySelectorAll('[data-video-mode]').forEach(el=>el.onclick=()=>{
   const next=el.dataset.videoMode;if(next===config.mode)return;
   savedModes[config.mode]={config:{...config},drafts:{...drafts},selected};
   const restored=savedModes[next];config=restored?.config||defaults(next);drafts=restored?.drafts||{};preferredMode=next;render(restored?.selected??0);
  });
  $('videoNegativeView').onclick=()=>display('negative');$('videoPlanView').onclick=()=>display('plan');
  activeEdit=()=>{if(typeof selected==='number'&&packet.ready){drafts[selected]=$('promptText').value;$('videoShotLabel').textContent=`쇼트 ${selected+1} · 직접 수정됨 · 자동 점검 이후 변경한 문장입니다.`}};
  render();return packet;
 }
 const priorOpen=openPrompt;openPrompt=function(...args){activeEdit=null;$('promptText').readOnly=false;$('promptDialog').classList.remove('video-shot-dialog');return priorOpen(...args)};
 $('promptDialog').addEventListener('close',()=>{activeEdit=null;$('promptText').readOnly=false});
 const previous=makeMediaPrompt;makeMediaPrompt=function(kind){return kind==='video'?show():previous(kind)};
 return {compose,resolve,custom,plan,show,motion,modes};
})();
