'use strict';
// Local visual plans and a single parameter serializer. No image generation or AI API call.
const sermonMidjourney=(()=>{
 const checkedOn='2026-10-03';
 const scenes={
  vine:{subject:'an ancient gnarled grapevine trunk with a single slender living branch growing seamlessly from it, one small cluster of ripe deep amethyst grapes nestled beneath translucent green leaves',light:'early dawn backlight from the upper left, illuminating the leaf veins',palette:'olive green leaves, umber bark, deep amethyst fruit, warm ivory background',detail:'grape skins and weathered bark',people:false},
  care:{subject:'two adults walking side by side, each gripping one handle of the same heavy woven basket on a quiet earthen path',light:'soft overcast daylight',palette:'umber basket, cream linen clothing, muted terracotta earth',detail:'woven fibers and the shared grip',people:true},
  hope:{subject:'one small green seedling rising from rain-darkened soil, two fresh leaves holding clear droplets',light:'low morning backlight from the left, illuminating the leaf edges',palette:'fresh green leaves, dark brown earth, slate blue background, pale gold highlights',detail:'water droplets and moist soil',people:false},
  rest:{subject:'one weary traveler seated beneath a broad tree beside a still stream, a weathered pack resting on the grass at their feet',light:'soft daylight filtered through the tree canopy',palette:'sage green foliage, pale blue water, warm sand clothing',detail:'relaxed hands and the pack resting on grass',people:true},
  grace:{subject:'two adults facing one another across an open doorway, each extending an open hand, a small space remaining between them',light:'one warm interior light spilling across the threshold into dusk',palette:'deep blue exterior, amber doorway, soft linen clothing',detail:'open hands and the worn threshold',people:true},
  love:{subject:'two adults seated together on a plain wooden bench beneath a tree, one offering a small ceramic cup of water to the other',light:'soft late-afternoon light from the left',palette:'warm brown wood, ivory cup, soft green leaves, muted rose clothing',detail:'the offered cup and the receiving hand',people:true},
  light:{subject:'one small undecorated clay oil lamp beside three visible stones of a winding path, the farther path receding into darkness',light:'one steady lamp flame casting a small amber pool of light across the nearest stones',palette:'copper clay, amber flame, midnight blue surroundings',detail:'the lamp rim and the nearest stone',people:false},
  peace:{subject:'one small wooden boat secured by a mooring rope inside a sheltered cove, shallow ripples nearby and dark clouds on the distant horizon',light:'diffuse overcast light',palette:'warm brown hull, sea-glass green water, storm-blue clouds',detail:'the mooring line and small ripples',people:false},
  grief:{subject:'two adults quietly seated beside a rain-speckled window, their hands resting close together on a plain table',light:'soft window daylight entering from the right',palette:'blue-grey window, warm ivory clothing, subdued honey-brown wood',detail:'resting hands and rain on the glass',people:true},
  gratitude:{subject:'four hands sharing pieces of one broken loaf above a plain linen-covered table, a small bowl of deep-red apples beside the bread',light:'warm window light from the left',palette:'wheat-gold bread, ivory linen, terracotta bowl, deep-red apples',detail:'bread crust and the passing hands',people:true},
  justice:{subject:'two adults repairing a wooden footbridge, aligning one sturdy plank across a visible gap above a narrow stream',light:'soft overcast daylight',palette:'warm timber, charcoal work clothes, river-blue water',detail:'the aligned plank and supporting hands',people:true},
  growth:{subject:'one young tree rooted on a windswept hillside, a gently curved trunk and intact flexible branches, exposed roots holding the surrounding soil',light:'low afternoon sidelight from the right',palette:'forest-green leaves, brown roots, slate-grey sky, ochre earth',detail:'roots gripping the soil and flexible branches',people:false}
 };
 const styles={
  photo:'fine art landscape photography, natural surface detail, subtle film grain',
  painting:'fine art oil painting, thin layered earth pigments, subtle linen canvas texture',
  watercolor:'watercolor on cold-pressed paper, translucent washes, controlled pigment blooms',
  cinematic:'cinematic still photography, natural materials, selective depth of field',
  minimal:'minimal editorial illustration, simplified contours, matte color shapes',
  gouache:'hand-painted gouache illustration, layered matte pigment, visible paper grain',
  paper:'layered paper-cut illustration, flowing cut silhouettes, tactile paper edges',
  botanical:'botanical watercolor technique, fine brush lines, translucent pigment on ivory paper',
  ink:'ink-and-wash painting on rice paper, expressive brush marks, restrained mineral color',
  stained:'stained-glass illustration, translucent jewel-colored panes, clear lead-line contours',
  woodcut:'two-color woodcut print, carved ink lines, bold silhouettes, warm paper grain',
  pastel:'soft pastel drawing, velvety pigment, softened edges on textured paper',
  vector:'flat vector editorial illustration, clean geometric contours, solid color fills',
  abstract:'abstract painting, interlocking organic forms, broad color fields',
  collage:'paper collage illustration, cut silhouettes arranged into one continuous scene',
  line:'minimal ink line illustration, weighted contours, open paper space',
  flat:'flat editorial illustration, simplified organic shapes, textured color fills'
 };
 const motifs={
  flowers:{subject:'one curved stem of ivory blossoms and olive-green leaves framing a single opening at the center',light:'soft painted highlights on the upper-left petal edges',palette:'ivory petals, olive-green leaves, pale ochre background',detail:'petal edges and slender stems',people:false},
  church:{subject:'one small church with an open doorway and a narrow curving path leading to the threshold',light:'a warm amber glow inside the open doorway',palette:'ivory walls, muted slate-blue roof, olive-green grass, amber doorway',detail:'the open doorway and curving path',people:false},
  bible:{subject:'one open book with completely blank ivory pages and a single burgundy ribbon resting across the center fold',light:'soft painted light from the upper left',palette:'ivory paper, burgundy ribbon, warm umber cover',detail:'the page fold and ribbon',people:false},
  abstract:{subject:'two interlocking curved forms meeting around one small circular opening',light:'soft painted highlights along the upper-left contours',palette:'deep blue forms, warm ivory opening, restrained ochre accent',detail:'the meeting edges and central opening',people:false}
 };
 const typography=['text','logos','watermarks','signatures'];
 const human=/\b(?:people|person|adults?|children|child|humans?|men|women|man|woman|hands?|jesus|christ|shepherd|travelers?|crowd|mother|father)\b/i;
 const humanSubject=s=>s.replace(/\bhand[- ](?:painted|drawn|crafted|carved)\b/gi,'');
 const versions=new Set(['8.2','8.1','7','default']);
 const lightWords=/\b(?:light|lighting|backlit|backlight|sunlight|sunrise|sunset|dawn|dusk|noon|night|moonlight|candlelight|overcast)\b/i;
 const clean=s=>String(s||'').replace(/\s+/g,' ').replace(/^[\s,;.]+|[\s,;.]+$/g,'');
 function customScene(value){
  let text=clean(value);const errors=[],audit=[],exclude=[];
  if(/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text))errors.push('직접 지정할 장면은 영어로 적어 주세요.');
  if(/(?:--|[—–]{1,2})\s*[a-z]/i.test(text)||/::/.test(text))errors.push('장면에는 묘사만 적어 주세요. 버전·비율·스타일 강도는 아래 선택값으로 붙입니다.');
  if(/\b(?:with|add|include|display|show)\s+(?:a\s+|the\s+)?(?:logo|text|lettering|caption|watermark)|\b(?:says?|reads?|written)\s+["“]/i.test(text))errors.push('이 이미지는 글자와 로고를 제외합니다. 글자·로고를 넣는 요청을 장면에서 빼 주세요.');
  text=text.replace(/\bno imitation of a named artist\b/gi,()=>{audit.push('불필요한 작가 모방 제외 문구를 제거했습니다.');return ''});
  // Move only an explicit, bounded exclusion list. Do not guess the meaning of other negations.
  text=text.replace(/\b(?:no|without(?: any| a| an)?)\s+((?:people|persons|hands|text|lettering|letters|words|typography|captions|logos?|watermarks?|signatures?|photographs?|mockups?)(?:\s*(?:,|and)\s*(?:people|persons|hands|text|lettering|letters|words|typography|captions|logos?|watermarks?|signatures?|photographs?|mockups?))*)\b/gi,(all,list)=>{exclude.push(...list.split(/\s*(?:,|\band\b)\s*/i));audit.push('명시한 제외 대상을 --no로 분리했습니다.');return ''});
  text=clean(text.replace(/,\s*,/g,',').replace(/(?:,\s*)?\b(?:and|but)\s*$/i,''));
  if(/\b(?:no|without|avoid|do not|don't)\b/i.test(text))errors.push('남은 부정형 지시를 보이는 모습으로 바꿔 주세요. 예: “without breaking” 대신 “intact branches”.');
  if(/\b(?:dawn|sunrise|morning|midday|noon)\b/i.test(text)&&/\b(?:night|moonlit|moonlight|midnight|sunset|dusk)\b/i.test(text))errors.push('한 장면에 서로 다른 시간대가 들어 있습니다. 의도한 시간대를 하나로 정해 주세요.');
  if(/\b(?:backlit|backlight)\b/i.test(text)&&/\b(?:front-lit|frontlit|frontal light)\b/i.test(text))errors.push('역광과 정면광이 함께 지정되어 있습니다. 주광의 방향을 하나로 정해 주세요.');
  if(/\b(?:monochrome|black.and.white)\b/i.test(text)&&/\b(?:multicolou?red|rainbow|vivid colou?rs)\b/i.test(text))errors.push('흑백과 다채로운 색상이 함께 지정되어 있습니다. 표현 방향을 하나로 정해 주세요.');
  if(exclude.some(x=>/^(?:people|persons)$/.test(x))&&human.test(humanSubject(text)))errors.push('인물이 필요한 장면에 인물 제외가 함께 지정되어 있습니다. 장면이나 제외 조건을 고쳐 주세요.');
  if(!/[a-z]{3}/i.test(text))errors.push('피사체와 그 모습을 영어로 적어 주세요.');
  if(text.split(/\s+/).length>150)errors.push('핵심 피사체와 행동이 드러나도록 장면을 150단어 이내로 줄여 주세요.');
  return {text,exclude:[...new Set(exclude.map(s=>({lettering:'text',letters:'text',words:'text',typography:'text',captions:'text',logo:'logos',watermark:'watermarks',signature:'signatures',persons:'people',photograph:'photographs',mockup:'mockups'}[s.toLowerCase()]||s.toLowerCase())))],errors,audit};
 }
 function compile({kind='image',themeId,custom='',art='painting',ratio='16:9',version='8.2',stylize=200,motif='theme',theme,bulletinPlan,imagePlan,brief}={}){
  const errors=[],audit=[],warnings=[];let plan;
  if(!['image','bulletin'].includes(kind))errors.push('이미지 종류를 확인해 주세요.');
  if(!versions.has(version))errors.push('지원하는 Midjourney 버전을 선택해 주세요.');
  const ar=String(ratio).match(/^([1-9]\d*):([1-9]\d*)$/);if(!ar||+ar[1]/+ar[2]>14||+ar[2]/+ar[1]>14)errors.push('이미지 비율은 양의 정수이며 가로·세로의 차이가 14배 이내여야 합니다.');
  if(!Number.isInteger(+stylize)||+stylize<0||+stylize>1000)errors.push('스타일 강도는 0–1000 사이의 정수여야 합니다.');
  if(!styles[art])errors.push('이미지 표현을 다시 선택해 주세요.');
  if(kind==='bulletin'&&['photo','cinematic'].includes(art))errors.push('주보 이미지는 사진 대신 그림·일러스트 표현을 선택해 주세요.');
  if(kind==='bulletin'&&bulletinPlan){
   plan={...bulletinPlan,exclude:[...(bulletinPlan.exclude||[])]};
   if(typeof plan.subject!=='string'||!plan.subject.trim())errors.push('주보에 그릴 대상을 지정해 주세요.');
  }else if(kind==='bulletin'&&motif!=='theme'){
   if(!motifs[motif])errors.push('주보의 상징 소재를 다시 선택해 주세요.');
   else {plan={...motifs[motif]};audit.push('주보에서 직접 선택한 상징 소재를 사용합니다. 설교의 장면을 그대로 재현하는 그림은 아닙니다.')}
  }else if(kind==='image'&&imagePlan){
   plan={...imagePlan,exclude:[...(imagePlan.exclude||[])]};
   const edited=customScene(plan.subject);errors.push(...edited.errors);audit.push(...edited.audit);plan.subject=edited.text;plan.exclude.push(...edited.exclude);
  }else if(custom.trim()){
   const edited=customScene(custom);errors.push(...edited.errors);audit.push(...edited.audit);
   plan={subject:edited.text,light:'',palette:'',detail:'',people:null,exclude:edited.exclude,custom:true};
   if(!lightWords.test(edited.text))warnings.push('직접 지정한 장면의 광원은 모델이 해석합니다. 원하는 빛이 있다면 영어 장면에 함께 적으세요.');
   audit.push('직접 쓴 장면에 기본 팔레트나 별도 광원을 덧붙이지 않았습니다.');
  }else if(scenes[themeId])plan=brief&&typeof productionContent!=='undefined'?productionContent.visual(brief,themeId):{...scenes[themeId]};
  else errors.push('시각적 주제를 선택하거나 영어 장면을 직접 지정해 주세요.');

  if(!plan)plan={subject:'',exclude:[]};
  if(kind==='bulletin'&&plan.custom&&/\b(?:photograph|photography|photorealistic|photorealism|3d render)\b/i.test(plan.subject))errors.push('주보용 장면에서 실사·사진 요청을 빼고 그림이나 일러스트로 표현해 주세요.');
  if(plan.custom)for(const word of plan.exclude||[]){const stem=word.replace(/s$/,'');if(new RegExp('\\b'+stem+'s?\\b','i').test(stem==='hand'?humanSubject(plan.subject):plan.subject))errors.push('장면에 포함한 '+word+'을 제외 대상으로도 적었습니다. 둘 중 하나를 정해 주세요.');}
  // Monochrome styles use one coherent ink plan, not the original multicolor object palette.
  let palette=plan.palette,light=plan.light;
  if(['line','woodcut','ink'].includes(art)&&!plan.custom){palette=art==='woodcut'?'deep indigo and muted ochre inks on warm ivory paper':art==='line'?'deep indigo ink on warm ivory paper':'black ink and a light ochre wash on ivory rice paper';audit.push('선택한 선화·판화·수묵 표현에 맞춰 다색 팔레트를 정리했습니다.')}
  let subject=plan.subject;
  if(['line','woodcut','ink'].includes(art)&&!plan.custom)subject=subject.replace(/\b(?:deep amethyst|deep plum|olive-green|green|deep-red|ivory|burgundy)\s+/g,'');
  if(kind==='bulletin'&&['line','woodcut','ink'].includes(art)&&!plan.custom)subject=subject.replace(/\b(?:brown|ochre|umber|amber)\s+/g,'');
  // Painted media depict leaf shape and edge light; they need not depict transparent plant tissue.
  if(kind==='bulletin'&&!plan.custom&&['gouache','paper','pastel','flat','vector','minimal','woodcut','line','abstract','ink'].includes(art)){
   subject=subject.replace(/\btranslucent\s+/g,'');
   light=light.replace(/illuminating the leaf veins/g,'forming warm painted edges on the leaves');
  }
  if(['vector','minimal','abstract','flat','line','woodcut'].includes(art)&&!plan.custom)light='';
  const exclude=[...new Set([...typography,...(plan.people===false?kind==='bulletin'?['people','hands']:['people']:[]),...(plan.exclude||[]),...(kind==='bulletin'?['photographs','mockups','photorealism','3d']:[])])];
  const framing=kind==='bulletin'?(plan.composition||'one flat illustration, quiet upper-third space, main motif inside generous crop margins'):ar&&+ar[1]>+ar[2]?'single landscape composition, one clear focal point':ar&&+ar[1]<+ar[2]?'single portrait composition, one clear focal point':'single square composition, one clear focal point';
  const medium=plan.custom&&art==='woodcut'?styles[art].replace('two-color ',''):styles[art];
  const parts=[subject,medium,light,palette&&'palette: '+palette,framing,kind==='image'?(plan.composition||(brief&&!plan.custom?productionDirection.image(brief):'')):'',plan.detail&&!['abstract','minimal','vector','line','woodcut','flat'].includes(art)?'focus on '+plan.detail:''].map(clean).filter(Boolean);
  const body=parts.join(', ');
  if(/\b(?:no|without|avoid|don't|do not)\b/i.test(body))errors.push('장면 또는 표현에 분리되지 않은 제외 지시가 있습니다.');
  const suffix=` --ar ${ratio} --s ${+stylize}${version==='default'?'':` --v ${version}`} --no ${exclude.join(', ')}`;
  const prompt=body+suffix;
  if(/\bpeople\b/.test(exclude.join(' '))&&human.test(humanSubject(subject)))errors.push('피사체와 인물 제외 조건이 충돌합니다.');
  if(prompt.length>1800)errors.push('핵심 장면을 더 짧게 정리해 주세요.');
  audit.push('피사체 → 표현 → 빛 → 색 → 구도 순서로 정리했습니다.','버전·비율·스타일 강도·제외 목록을 끝에 한 번씩 붙였습니다.');
  return {ready:!errors.length,prompt:errors.length?'':prompt,errors:[...new Set(errors)],warnings,audit:[...new Set(audit)],plan:{...plan,subject,palette,light,style:styles[art],exclude},checkedOn};
 }
 // Other image briefs reuse the same concise medium descriptions.
 for(const [id,prompt]of Object.entries(styles)){if(artTreatments[id])artTreatments[id].prompt=prompt;if(bulletinStyles[id])bulletinStyles[id].text=prompt;}
 const setting=document.createElement('label');setting.textContent='미드저니 스타일 강도';const strength=document.createElement('select');strength.id='mjStylize';for(const [value,label]of [['100','묘사 중심 · 100'],['200','균형 · 200'],['300','회화적 변주 · 300']])strength.add(new Option(label,value));strength.value='200';setting.append(strength);$('mjVersion').closest('.studio-grid').append(setting);
 const status=document.createElement('p');status.id='midjourneyStatus';status.className='micro';status.setAttribute('role','status');status.textContent='핵심 이미지와 주보는 피사체·색·빛을 정리해 미드저니용 문장으로 만듭니다.';mediaTools.querySelector('.prompt-buttons').after(status);
 function show(kind,brief,theme){
  if(kind==='bulletin'&&typeof sermonBulletin!=='undefined')return sermonBulletin.show();
  if(kind==='image'&&typeof sermonImageScenes!=='undefined')return sermonImageScenes.show(brief,theme);
  const themeId=Object.entries(visualThemes).find(([,t])=>t===theme)?.[0],result=compile({kind,themeId,theme,brief,custom:$('customVisualScene').value,art:kind==='bulletin'?$('bulletinStyle').value:$('artTreatment').value,ratio:kind==='bulletin'?$('bulletinRatio').value:$('mediaRatio').value,version:$('mjVersion').value,stylize:+$('mjStylize').value,motif:kind==='bulletin'?$('bulletinMotif').value:'theme'});
  resetPromptExtras();currentPromptType=kind;openPrompt(kind==='bulletin'?'주보 이미지 · 미드저니 일러스트 프롬프트':'설교 핵심 이미지 · 미드저니 프롬프트',result.prompt,result.ready?'아래 영문 프롬프트만 복사하세요. 한 장의 그림이며 글자·로고를 제외합니다. 생성 후 실제 피사체와 한글·로고의 유무를 확인하세요.':'아래 점검 내용을 확인하고 창을 닫은 뒤 장면이나 설정을 고쳐 다시 생성하세요.');
  $('copyPrompt').disabled=!result.ready;$('downloadPrompt').disabled=!result.ready;
  const details=document.createElement('details');details.className='midjourney-audit';details.open=!result.ready;const summary=document.createElement('summary');summary.textContent=result.ready?'이미지 문구·설정 확인':'장면 또는 설정 보완';details.append(summary);
  const lines=[...result.errors,...result.audit,...result.warnings,`문구·설정 점검 기준: ${checkedOn}. 실제 미드저니 생성 결과를 검사한 것은 아닙니다.`];for(const line of lines){const p=document.createElement('p');p.textContent=line;details.append(p)}extrasBar.append(details);
  extrasBar.prepend(productionContent.sourcePanel(brief,result.plan.detail?'그림의 초점: '+result.plan.detail:''));
  const editor=document.createElement('details');editor.innerHTML='<summary>설교를 표현할 장면 직접 다듬기</summary><p>자동으로 고른 시각적 비유를 확인하세요. 아래 장면을 영어로 고치면 그 장면을 중심으로 다시 만듭니다.</p><label>화면에 그릴 대상·행동·관계<textarea id="imageSceneEdit" rows="4"></textarea></label><button id="imageSceneApply" class="primary">이 장면으로 이미지 프롬프트 만들기</button>';extrasBar.append(editor);$('imageSceneEdit').value=result.plan.subject||'';$('imageSceneApply').onclick=()=>{$('customVisualScene').value=$('imageSceneEdit').value;show(kind,brief,theme)};
  status.textContent=result.ready?'이미지 문구와 설정을 정리했습니다. 실제 생성 결과에서 피사체·색·빛을 확인하세요.':result.errors.join(' ');
  return result;
 }
 const previous=makeMediaPrompt;makeMediaPrompt=function(kind){if(!['image','bulletin'].includes(kind))return previous(kind);if(!$('outlineText').value.trim()){toast('먼저 설교 원고를 작성하세요.');return}const brief=extractCreativeBrief();if(!brief.focus){toast('제작의 중심 메시지를 적어 주세요.');return}const theme=chooseVisualTheme(brief);if(!theme){toast('설교에 맞는 시각적 주제 또는 영어 장면을 지정해 주세요.');return}return show(kind,brief,theme)};
 document.addEventListener('study-reset',()=>{strength.value='200';status.textContent='새 설교의 장면과 설정으로 이미지 프롬프트를 만듭니다.'});
 return {compile,customScene,scenes,styles,show};
})();
