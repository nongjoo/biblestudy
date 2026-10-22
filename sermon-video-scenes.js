'use strict';
// Designed visual analogies, not reconstructions of biblical events or automatic exegesis.
const sermonVideoScenes={
 vine:{
  anchor:'One old grapevine has furrowed umber bark and one slender green branch bearing broad leaves and a single dark-purple grape cluster. Low stone walls border the vineyard.',people:false,
  light:'Low morning light stays steady from frame left, with soft leaf shadows.',
  audio:['A faint breeze rustles distant foliage.','A quiet bird call sounds far away.','The foreground leaf makes a soft rustle.','A faint breeze rustles distant foliage.'],
  detail:'the single dew drop on the branch junction',turn:'잎이 옆으로 움직이며 붙어 있는 가지의 열매를 드러냅니다.',
  shots:[
   'The trunk occupies the left foreground and the attached branch extends right. One leaf partly screens the grape cluster. The leaves move slightly in a light breeze.',
   'A single dew drop rests on the knotted junction between branch and trunk. The drop remains still while the distant leaves and vineyard become a soft blur.',
   'One foreground leaf turns gently sideways in the breeze, uncovering the grape cluster on the attached branch. The cluster remains attached and keeps its dark-purple color.',
   'The trunk, attached branch and uncovered grape cluster fit inside the wider view. The stone rows extend into the background while the leaves move slightly.'
  ],turnCamera:'locked',endState:'열매가 드러난 상태와 하나의 가지를 유지합니다.'
 },
 care:{
  anchor:'Two adults, one in an ochre coat and one in a charcoal coat, stand beside a woven brown basket with two loop handles on an earthen path.',people:true,
  light:'Soft overcast daylight remains even, with gentle shadows below the basket.',audio:['A faint breeze moves through nearby grass.','The woven handle makes a quiet creak.','The basket fibers creak briefly as the load shifts.','A faint breeze moves through nearby grass.'],
  detail:'the basket handle held by the adult in ochre',turn:'한 사람이 다른 손잡이를 잡아 무게를 나눕니다.',
  shots:[
   'The adult in ochre holds one basket handle. The basket tilts slightly toward that side, with its base close to the ground. The adult in charcoal stands beside the free handle.',
   'The camera concentrates on the woven handle held by the adult in ochre. The handle curves under the weight, and the hand maintains its grip.',
   'The adult in charcoal grasps the free handle and takes part of the weight. The basket levels gradually while the adult in ochre keeps holding the other handle.',
   'Both adults remain beside one another, each holding a handle of the level basket. The wider view includes the path and grass around their feet.'
  ],turnCamera:'locked',endState:'두 사람이 수평이 된 바구니를 함께 듭니다.'
 },
 hope:{
  anchor:'One short green seedling with two leaves stands in dark damp soil beside three small grey pebbles.',people:false,
  light:'Soft morning backlight remains steady from frame left, edging the leaves.',audio:['A few distant birds call across the garden.','A distant bird call sounds over quiet air.','A single drop lands softly on damp soil.','A few distant birds call across the garden.'],
  detail:'the water bead on the lower leaf tip',turn:'물방울이 떨어지고 눌렸던 잎이 조금 올라옵니다.',
  shots:[
   'The seedling stands between the pebbles in the foreground. The lower leaf bends slightly under the water bead while the damp garden recedes behind it.',
   'The camera concentrates on the water bead at the lower leaf tip. Its rounded surface catches a small highlight while the soil remains out of focus.',
   'The water bead falls from the leaf onto the soil. Freed of the bead, the leaf lifts slightly and settles at its natural angle.',
   'The seedling remains the same size with the same two leaves. The raised lower leaf rests above the damp soil, and all three pebbles appear in the wider garden view.'
  ],turnCamera:'locked',endState:'같은 크기의 새싹과 올라온 잎을 유지합니다.'
 },
 rest:{
  anchor:'One adult traveler in a sand-colored coat sits beneath a broad green tree beside a stream. A weathered brown pack rests on the grass at their feet.',people:true,
  light:'Filtered daylight remains steady through the tree canopy from frame left.',audio:['A nearby stream flows softly.','The stream continues at a quiet distance.','The leather strap makes a soft settling sound beside the stream.','The nearby stream flows softly.'],
  detail:'the hand gripping the pack strap',turn:'쥐고 있던 끈을 놓고 손을 편안히 둡니다.',
  shots:[
   'The seated traveler leans slightly toward the pack and holds its strap. The pack stays on the grass while the stream flows behind the tree.',
   'The camera concentrates on the traveler’s hand gripping the brown strap. The knuckles and strap fill the focal area while the pack and grass blur behind them.',
   'The traveler slowly releases the strap and rests the open hand on their knee. The pack stays in its original place on the grass.',
   'The traveler stays seated with relaxed hands. The wider view includes the tree canopy, resting pack and flowing stream around them.'
  ],turnCamera:'locked',endState:'짐은 바닥에, 편 손은 무릎에 그대로 둡니다.'
 },
 grace:{
  anchor:'Two adults in plain linen clothing face each other across a worn stone threshold. One wears slate blue outside; the other wears warm ivory inside an open wooden doorway.',people:true,
  light:'A steady amber interior light falls across the threshold into blue dusk.',audio:['A light outdoor breeze brushes the doorway.','Soft cloth moves against a sleeve.','A linen sleeve rustles gently.','A faint breeze brushes the open doorway.'],
  detail:'the relaxed hand beside the ivory sleeve',turn:'열린 손을 내밀되 응답과 접촉을 강요하지 않습니다.',
  shots:[
   'The two adults stand on opposite sides of the threshold with their hands at their sides. A small space remains between them beneath the open doorway.',
   'The camera concentrates on the relaxed hand beside the ivory sleeve. The hand remains open while the stone threshold becomes softly blurred behind it.',
   'The adult in ivory slowly extends one open palm across part of the threshold. The adult in blue stays still, with a small space remaining between their hands.',
   'The adult in ivory keeps the hand extended. Both adults remain on opposite sides of the threshold, with the open doorway and the space between them clearly visible.'
  ],turnCamera:'locked',endState:'내민 손과 두 사람 사이의 작은 간격을 유지합니다.'
 },
 love:{
  anchor:'Two adults, one in muted rose and one in olive linen, sit on a plain wooden bench beneath a green tree. A small ivory ceramic cup contains clear water.',people:true,
  light:'Late-afternoon light remains soft and steady from frame left.',audio:['A faint breeze stirs the canopy.','A few leaves rustle softly overhead.','Cloth brushes softly as the cup passes between hands.','A faint breeze stirs the canopy.'],
  detail:'the rim of the ivory cup',turn:'한 잔의 물이 건네지고 받아들여집니다.',
  shots:[
   'The adult in rose holds the ivory cup near the center of the bench. The adult in olive sits beside them, facing toward the cup.',
   'The camera concentrates on the cup rim and the still water just inside it. The bench and clothing fall into soft blur behind the rim.',
   'The adult in rose gently passes the cup to the adult in olive, who receives it with both hands. The water shifts slightly inside the cup.',
   'The adult in olive holds the received cup. Both adults remain seated together while the wider view includes the bench, tree and ground around them.'
  ],turnCamera:'locked',endState:'물을 받은 사람이 잔을 들고 두 사람은 함께 앉아 있습니다.'
 },
 light:{
  anchor:'One undecorated copper-brown clay oil lamp stands beside three rough grey stepping stones on a dark path. Its small amber flame lights the nearby stone edges.',people:false,
  light:'The lamp remains the sole nearby light source against a midnight-blue background.',audio:['A faint night breeze brushes low grass.','The lamp wick makes a barely audible crackle.','A faint breeze passes over the lamp.','A quiet night breeze brushes low grass.'],
  detail:'the single flame above the lamp wick',turn:'작은 불꽃의 움직임으로 가까운 돌의 경계가 보입니다.',
  shots:[
   'The lamp rests in the foreground beside the nearest stone. The three stone edges form a short visible route inside its small pool of amber light.',
   'The camera concentrates on the single flame above the wick. The flame quivers slightly while the clay rim and distant path fall into soft blur.',
   'A faint breeze leans the flame briefly to one side. Its light moves across the rough edge of the nearest stone before the flame returns upright.',
   'The wider view includes the lamp and all three nearby stones. The small pool of amber light remains local while the farther path stays dark.'
  ],turnCamera:'locked',endState:'빛은 가까운 돌에만 머물고 먼 길은 어둡게 남습니다.'
 },
 peace:{
  anchor:'One small brown wooden boat is tied by a single rope to a weathered shore post inside a sheltered cove. Slate-blue clouds remain above distant sea-green water.',people:false,
  light:'Diffuse overcast light remains steady over the cove and boat.',audio:['Small ripples lap against the hull.','The mooring rope makes a quiet fiber creak.','A ripple taps softly against the wooden hull.','Small ripples lap against the hull.'],
  detail:'the knot securing the mooring rope',turn:'물결을 받으면서도 배가 매인 자리로 돌아옵니다.',
  shots:[
   'The boat rests near the shore post with its rope visible. Small ripples approach the hull while distant clouds remain above the cove.',
   'The camera concentrates on the knot securing the mooring rope. Its fibers flex gently as the boat moves slightly beyond the focal area.',
   'One small ripple lifts the boat and lets it settle back beside the post. The rope stays attached as the hull completes this gentle motion.',
   'The wider view includes the boat, post and sheltered shoreline. The boat continues its slight motion while the distant clouds remain in place.'
  ],turnCamera:'truck',endState:'매인 줄과 구름을 그대로 유지하고 배는 잔물결에 움직입니다.'
 },
 grief:{
  anchor:'Two adults in plain blue-grey and ivory clothing sit beside a rain-speckled window at a honey-brown wooden table. Their hands rest apart on the tabletop.',people:true,
  light:'Soft window light remains steady from frame right under an overcast sky.',audio:['Light rain taps the window at a distance.','Rain taps softly beyond the tabletop.','A sleeve brushes the wooden table under the sound of rain.','Light rain continues against the window.'],
  detail:'the resting hand beside the blue-grey sleeve',turn:'곁의 손이 조금 가까워지며 함께 머뭅니다.',
  shots:[
   'Both adults sit quietly facing the table and window. Their hands rest with a small gap between them while raindrops remain on the glass.',
   'The camera concentrates on the resting hand beside the blue-grey sleeve. Its fingers remain relaxed while the window becomes softly blurred.',
   'The adult in ivory slides one hand a little closer to the other hand and stops with a small gap remaining. The adult in blue-grey stays still.',
   'Both adults remain seated with their hands closer together. The wider view keeps the table and rain-speckled window around them under the unchanged soft light.'
  ],turnCamera:'locked',endState:'손 사이의 간격과 비 오는 창을 유지합니다.'
 },
 gratitude:{
  anchor:'Two adults in cream and terracotta sleeves sit at an ivory-linen-covered table with one partly broken loaf, one loose piece of bread and a small bowl of red apples.',people:true,
  light:'Warm window light remains steady from frame left across the table.',audio:['Quiet cloth movement is audible near the table.','Bread crust makes a faint dry rustle.','The loose bread piece makes a soft crust rustle as it is passed.','Soft cloth movement continues beside the table.'],
  detail:'the crust of the loose bread piece',turn:'이미 떼어 둔 빵 한 조각을 나눕니다.',
  shots:[
   'The loaf and loose piece sit between the two adults. The adult in cream rests one hand beside the loose piece while the apple bowl stays behind the bread.',
   'The camera concentrates on the crust of the loose piece. Its torn edge stays sharp while the linen and bowl become a soft background.',
   'The adult in cream passes the loose piece to the adult in terracotta, who receives it. The partly broken loaf and apple bowl remain on the table.',
   'The adult in terracotta holds the received piece. The wider view shows both adults at the table, the remaining loaf and the unchanged apple bowl.'
  ],turnCamera:'locked',endState:'받은 빵과 남은 빵을 구별하고 다른 소품을 늘리지 않습니다.'
 },
 justice:{
  anchor:'Two adults in charcoal work clothes stand beside a low wooden footbridge over a narrow stream. One pale timber plank matches a single opening between older bridge boards.',people:true,
  light:'Soft overcast daylight remains steady across the bridge and stream.',audio:['Water flows quietly below the bridge.','The narrow stream remains audible below.','Wood makes a soft contact sound above the stream.','The stream continues below the bridge.'],
  detail:'the pale plank edge above the bridge gap',turn:'같이 들고 있던 널판을 빈 곳에 내려놓습니다.',
  shots:[
   'The adults hold opposite ends of the pale plank just above the bridge gap. The stream passes below the empty space between the older boards.',
   'The camera concentrates on the edge of the pale plank above the gap. The older boards are visible as a soft background on either side.',
   'Both adults lower the pale plank together until it rests level across the gap. Their hands continue to steady its ends.',
   'The pale plank remains level across the gap with both adults beside it. The wider view shows the repaired section and the stream beneath the bridge.'
  ],turnCamera:'locked',endState:'같은 두 사람과 놓인 널판을 유지합니다.'
 },
 growth:{
  anchor:'One young tree with a gently curved brown trunk grows from ochre hillside soil. Exposed roots grip the slope beneath flexible branches and forest-green leaves.',people:false,
  light:'Soft afternoon sidelight remains steady from frame right beneath a grey sky.',audio:['A steady breeze rustles the leaves.','A low breeze moves across the soil.','One soft gust rustles the canopy.','The breeze settles to a quiet leaf rustle.'],
  detail:'the exposed root where it grips the soil',turn:'짧은 바람에 휘었다가 본래 위치로 돌아옵니다.',
  shots:[
   'The young tree stands on the sloping ground with its roots partly visible. Its leaves move slightly while the trunk remains near its resting position.',
   'The camera concentrates on the exposed root where it grips the soil. Small grains of earth lie still against the root while the canopy blurs behind it.',
   'A mild gust bends the flexible trunk a few degrees. The tree gently returns toward its resting position as the gust passes, with its roots staying in the soil.',
   'The wider view shows the tree within the hillside. The trunk rests upright in its original curve while the leaves continue a slight motion beneath the grey sky.'
  ],turnCamera:'truck',endState:'뿌리와 날씨를 유지하며 나무의 움직임만 잦아듭니다.'
 }
};
