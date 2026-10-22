'use strict';
const translations={
 kor:{label:'한국어 · eBible 공개본',name:'한국어 eBible 공개본',language:'ko',source:'https://ebible.org/details.php?id=kor'},
 web:{label:'영어 · WEB Classic',name:'World English Bible Classic',language:'en',source:'https://ebible.org/details.php?id=eng-web'},
 asv:{label:'영어 · ASV 1901',name:'American Standard Version (1901)',language:'en',source:'https://ebible.org/details.php?id=eng-asv'},
 bsb:{label:'영어 · BSB',name:'Berean Standard Bible',language:'en',source:'https://ebible.org/details.php?id=engbsb'}
};
const translationInfo=id=>translations[id]||{label:id,name:id,language:'en',source:''};
for(const id of ['version','compare','searchVersion']){const select=document.getElementById(id);for(const code of ['asv','bsb']){const option=document.createElement('option');option.value=code;option.textContent=translations[code].label;select.appendChild(option)}}
