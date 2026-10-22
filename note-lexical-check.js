 'use strict';
(function(root){
 const normalize=s=>String(s).normalize('NFD').replace(/\p{M}/gu,'').replaceAll('/','').toLowerCase();
 const tokens=s=>[...String(s).matchAll(/[\u0370-\u03ff\u1f00-\u1fff][\u0370-\u03ff\u1f00-\u1fff\u0300-\u036f]*|[\u0590-\u05ff]+(?:\/[\u0590-\u05ff]+)*|\b[GH]\d{1,5}\b/g)].map(m=>m[0]);
 function extract(notes){const items=[];for(const [field,text]of Object.entries(notes||{})){let reference='',current=null;for(const line of String(text||'').split('\n')){
  if(/^\s*\[/.test(line)){current=null;const m=line.match(/·\s*([^\]]+\d+:\d+[^\]]*)\]/);if(m)reference=m[1].trim();}
  const words=tokens(line);if(words.length){let item=items.find(x=>x.reference===reference&&x.aliases.some(a=>words.some(w=>normalize(a)===normalize(w))));if(!item){item={word:words[0],aliases:[],reference,field,source:line,gloss:''};items.push(item)}item.aliases=[...new Set([...item.aliases,...words])];if(!item.source.includes(line))item.source+='\n'+line;current=item;
   const translit=line.match(/\([GH]\d+\)\s*·\s*([A-Za-z][A-Za-z’' -]+)/);if(translit)current.aliases.push(translit[1].trim());
  }else if(current&&/한국어 기본 뜻:|문맥 풀이:|영어 사전 뜻:/.test(line)){current.gloss=line.replace(/^.*?(?:한국어 기본 뜻:|문맥 풀이:|영어 사전 뜻:)\s*/,'').trim();current.source+='\n'+line;}
 }}return items;}
 function matches(body,aliases){const found=[];for(const m of String(body).matchAll(/[\p{L}\p{M}\p{N}’'/-]+/gu)){if(aliases.some(a=>normalize(a)===normalize(m[0])))found.push({start:m.index,end:m.index+m[0].length,text:m[0]})}return found;}
 function compare(notes,body){const items=extract(notes).map(item=>({...item,matches:matches(body,item.aliases)}));const missing=items.filter(x=>!x.matches.length);return{items,total:items.length,found:items.length-missing.length,missing:missing.length};}
 const api={extract,compare};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NoteLexicalCheck=api;
})(typeof globalThis!=='undefined'?globalThis:this);
