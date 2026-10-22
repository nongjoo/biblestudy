const datasets = new Map();
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f\u0591-\u05c7]/g,'').replace(/ς/g,'σ').replace(/[/¶˚]/g,'').toLocaleLowerCase();
let latest=0;
self.onmessage=async({data})=>{
 const {id,version,query,scope,book,ot,exact}=data;latest=id;
 try{
  if(!datasets.has(version)) datasets.set(version,fetch(`data/${version}-search.json`).then(r=>{if(!r.ok)throw Error('자료를 불러오지 못했습니다.');return r.json()}).then(rows=>rows.map(r=>[...r,normalize(r[3])])).catch(e=>{datasets.delete(version);throw e}));
  const rows=await datasets.get(version);if(latest!==id)return;
  const q=normalize(query.trim()),terms=exact?[q]:q.split(/\s+/).filter(Boolean);const results=[],counts={};
  for(const r of rows){if(scope==='book'&&r[0]!==book||scope==='ot'&&!ot.includes(r[0])||scope==='nt'&&ot.includes(r[0]))continue;
   if(terms.every(t=>r[4].includes(t))){results.push(r.slice(0,4));counts[r[0]]=(counts[r[0]]||0)+1;}}
  self.postMessage({id,version,results,counts});
 }catch(e){self.postMessage({id,error:'검색 자료를 불러오지 못했습니다. 연결을 확인한 후 다시 검색해 주세요.'})}
};
