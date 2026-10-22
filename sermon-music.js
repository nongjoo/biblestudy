'use strict';
// Local musical descriptors, not a claim of semantic understanding or rendered audio validation.
const sermonMusic=(()=>{
 const gestures={
  vine:['a recurring melody with interlocking phrases','a sparse opening and a gradual warm swell','a gentle ending'],
  care:['gentle call-and-response and blended harmonies','sparse phrases gradually joining in harmony','a warm sustained ending'],
  hope:['rising melodic phrases and open chord voicings','a soft opening and a restrained late lift','a calm resolved ending'],
  rest:['long held notes and spacious phrasing','soft even dynamics and slow harmonic changes','a gently fading ending'],
  grace:['suspended chords easing into consonant harmonies','a quiet opening and gradual harmonic release','a tender resolved ending'],
  love:['a flowing melody and close warm harmonies','gentle phrasing and small dynamic swells','a soft sustained ending'],
  light:['a clear repeating motif with stepwise development','sparse textures gradually opening into wider voicings','a clear quiet cadence'],
  peace:['a steady pulse and sustained tonic support','soft even dynamics and spacious melodic pauses','a long quiet ending'],
  grief:['descending melodic phrases and suspended chords','soft even dynamics and spacious pauses','a lingering open ending'],
  gratitude:['a lilting melody and open chord voicings','a light rhythmic pulse and a modest late lift','a warm buoyant ending'],
  justice:['a steady rhythmic motif and grounded bass movement','measured accents and a restrained dynamic rise','a firm quiet cadence'],
  growth:['a recurring motif developed in small variations','gradually layered textures and a measured late swell','a settled sustained ending'],
  neutral:['a simple repeating melody','soft even dynamics and spacious phrasing','a gentle ending']
 };
 const voices={male:'male lead vocal with a warm baritone tone',female:'female lead vocal with a clear mezzo-soprano tone',duet:'male and female duet with alternating leads and close harmonies',small:'four-part mixed vocal ensemble with balanced SATB harmonies',choir:'40-voice mixed SATB choir with blended vowels and clear diction',studio:'layered mixed studio vocals with precise timing and natural harmonies',crowd:'hundreds of congregational voices in unison with a mixed lead pair'};
 const rooms={studio:'warm close-mic sound with natural room ambience',hall:'natural concert-hall depth with a controlled reverb tail',live:'spacious worship-room acoustics with clear direct sound'};
 const conciseGenres={hymn:'hymn-inspired chamber music',pop:'acoustic pop',rock:'soft rock',worshipArena:'contemporary worship'};
 const clean=s=>String(s||'').trim().replace(/\s+/g,' ');
 function resolve(brief,selected='auto'){
  if(typeof sermonContext!=='undefined')return sermonContext.resolve(brief,selected);
  if(selected!=='auto')return Object.hasOwn(gestures,selected)?selected:null;
  const printable=s=>sermonEditorial.printable(s).join(' '),focus=printable(brief?.focus),points=(brief?.points||[]).map(printable).join(' ');
  const scores=Object.entries(visualThemes).map(([id,t])=>({id,score:t.terms.reduce((n,term)=>n+(focus.includes(term)?6:0)+(points.includes(term)?1:0),0)})).sort((a,b)=>b.score-a.score);
  return scores[0]?.score?scores[0].id:'neutral';
 }
 function compose({genre='acoustic',vocal='instrumental',space='studio',theme='neutral',brief}={}){
  const errors=[],g=musicGenres[genre],shape=gestures[theme],room=rooms[space],instrumental=vocal==='instrumental',match=vocal.match(/^(ko|en)-(male|female|duet|small|choir|studio|crowd)$/);
  if(!g)errors.push('음악 방향을 다시 선택해 주세요.');
  if(!shape)errors.push('설교의 시각적 주제를 다시 선택해 주세요.');
  if(!room)errors.push('음악 녹음 공간을 다시 선택해 주세요.');
  if(!instrumental&&!match)errors.push('보컬을 다시 선택해 주세요.');
  const key=g?.key?.replace('E-flat','Eb');
  if(g&&(!Number.isFinite(g.bpm)||g.bpm<40||g.bpm>220||!Number.isInteger(g.bpm)))errors.push('템포 설정을 확인해 주세요.');
  if(g&&!/^[A-G](?:#|b)? (?:major|minor)$/.test(key||''))errors.push('조성 설정을 확인해 주세요.');
  if(g&&!/^(?:4\/4|3\/4|6\/8)$/.test(g.meter))errors.push('박자 설정을 확인해 주세요.');
  if(errors.length)return {ready:false,prompt:'',errors};
  const genreText=conciseGenres[genre]||g.genre;
  const lead=instrumental?'Instrumental '+genreText:genreText+', '+(match[1]==='ko'?'Korean':'English')+'-language '+voices[match[2]];
  // The instrumental timbre of the daegeum is retained without an ambiguous human breath descriptor.
  const instruments=g.sound.replace('breathy daegeum','daegeum flute');
  const parts=[lead,`${g.bpm} BPM`,g.meter,key,instruments,...(brief?productionDirection.music(brief):shape),room,'clear low end and balanced dynamics'].map(clean);
  const unique=[...new Map(parts.map(x=>[x.toLowerCase(),x])).values()];
  const prompt=unique.join(', ')+'.';
  if(/[\r\n\[\]{}]|[가-힣]/.test(prompt)||/[.!?]/.test(prompt.slice(0,-1)))errors.push('음악 문구를 한 문장으로 정리하지 못했습니다.');
  if(/\b(?:no|avoid|without|original|breath\w*|clipping|sibilance|overcompression)\b/i.test(prompt))errors.push('음악 문구에 불필요한 제외 지시가 남아 있습니다.');
  if(instrumental&&/\b(?:vocal\w*|voice\w*|sing\w*|choir|chorus|speech|spoken|humming|narration)\b/i.test(prompt))errors.push('연주곡 문구에 보컬 표현이 섞여 있습니다.');
  if(prompt.length>750)errors.push('음악 문구가 깁니다. 음악 방향을 다시 확인해 주세요.');
  return {ready:!errors.length,prompt:errors.length?'':prompt,errors,mode:instrumental?'instrumental':'vocal',theme,genre,space,tempo:g.bpm,key,meter:g.meter};
 }
 function current(){const brief=extractCreativeBrief();return compose({brief,genre:$('musicMood').value,vocal:$('musicVocal').value,space:$('musicSpace').value,theme:resolve(brief,$('visualTheme').value)})}
 function show(){
  if(!$('outlineText').value.trim()){toast('먼저 설교 원고를 작성하세요.');return}
  const result=current(),suno=$('musicPlatform').value==='suno';resetPromptExtras();currentPromptType='music';
  const hint=result.ready?(suno?(result.mode==='instrumental'?'Suno의 Styles에 붙여 넣고 Instrumental을 켜세요.':'Suno의 Styles에 붙여 넣으세요. 원하는 가사는 Lyrics에 따로 넣으세요.'):'음악 생성 도구의 스타일 입력란에 붙여 넣으세요.') :result.errors.join(' ');
  openPrompt('설교 배경 음악 프롬프트',result.prompt,hint);
  $('promptDialog').classList.add('music-one-sentence');$('copyPrompt').disabled=!result.ready;$('downloadPrompt').disabled=!result.ready;
  return result;
 }
 const priorOpen=openPrompt;openPrompt=function(...args){$('promptDialog').classList.remove('music-one-sentence');return priorOpen(...args)};
 const previous=makeMediaPrompt;makeMediaPrompt=function(kind){return kind==='music'?show():previous(kind)};
 return {compose,resolve,current,show,gestures};
})();
