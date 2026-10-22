/* 말씀연구실 v81 · 이용 키(라이선스) 확인 모듈
   - 오프라인 전자서명(ECDSA P-256) 키를 확인합니다. 인터넷 연결이나 서버가 필요 없습니다.
   - 이 파일에는 확인용 공개키만 들어 있습니다. 키를 만드는 비밀키는 배포 폴더에 없습니다. */
(function () {
  'use strict';
  var PUB = { kty: 'EC', crv: 'P-256', x: 'kPQiJnBogM_zllwENLwhmgb0rAY-xcvs44BbDRrliRc', y: 'Vca2ZdQIJ4JL0j2FizZaOWYLxfxZ0Qa2QCsF7WyWF0Q' };
  // 공용 이용 코드 목록입니다. 코드 자체는 저장하지 않고 암호화한 값(해시)만 넣습니다.
  // 새 코드는 '공용키-설정' 도구가 아래 BEGIN~END 사이에 자동으로 추가합니다.
  var CODES = [
    /*CODES-BEGIN*/
    { h: 'fab3f615d611bc9f3783d1789baf9a8e60e037c66cff3464a3773300dc7ea235', n: '공용', m: 'fixed', e: '2027-03-31', id: '7a5ba98e' }
    /*CODES-END*/
  ];
  var REVOKED = [];            // 사용을 막을 키 ID를 여기에 추가한 새 버전을 배포합니다.
  var KAKAO = 'nongjoo';
  var REC = 'msLicense.v1';
  var DAY = 86400000, WARN_DAYS = 7;

  var SP = Storage.prototype;
  var rawSet = SP.setItem, rawRem = SP.removeItem, rawClr = SP.clear, rawGet = SP.getItem;
  var rawTx = window.IDBDatabase && IDBDatabase.prototype.transaction;
  var blockWrites = false;     // true이면 저장이 막힌 읽기 전용 상태

  function fmt(ms) { var d = new Date(ms); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function b64u(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    var bin = atob(s), out = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out;
  }

  /* ---------- 저장 기록(브라우저 저장소 + 쿠키 이중 보관) ---------- */
  function readRec() {
    var r = null, c = null;
    try { var s = rawGet.call(window.localStorage, REC); if (s) r = JSON.parse(s); } catch (e) {}
    try { var m = document.cookie.match(/(?:^|; )ms_lic=([^;]*)/); if (m) c = JSON.parse(decodeURIComponent(m[1])); } catch (e) {}
    if (!r) return c; if (!c) return r;
    if (r.key === c.key) { r.act = Math.min(r.act || Infinity, c.act || Infinity); r.seen = Math.max(r.seen || 0, c.seen || 0); return r; }
    return (c.act || 0) > (r.act || 0) ? c : r;
  }
  function writeRec(rec) {
    var s = JSON.stringify(rec);
    try { rawSet.call(window.localStorage, REC, s); } catch (e) {}
    try { document.cookie = 'ms_lic=' + encodeURIComponent(s) + '; max-age=315360000; path=/; SameSite=Lax'; } catch (e) {}
  }

  /* ---------- 상태 계산 ---------- */
  function calc(p, rec, now) {
    var exp = null;
    if (p.m === 'fixed') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.e || '')) return { st: 'invalid' };
      exp = new Date(p.e + 'T23:59:59.999').getTime();
    } else if (p.m === 'days') {
      if (!(p.d > 0)) return { st: 'invalid' };
      exp = (rec.act || now) + p.d * DAY;
    } else if (p.m !== 'free') return { st: 'invalid' };
    if (rec.seen && now < rec.seen - 2 * DAY) return { st: 'rollback', p: p, exp: exp };
    if (p.id && REVOKED.indexOf(p.id) >= 0) return { st: 'revoked', p: p, exp: exp };
    if (exp !== null && now > exp) return { st: 'expired', p: p, exp: exp };
    return { st: 'ok', p: p, exp: exp, left: exp === null ? null : Math.ceil((exp - now) / DAY) };
  }

  async function verifyCode(code) {
    try {
      var norm = String(code || '').normalize('NFC').toLowerCase().replace(/\s+/g, '');
      if (!norm) return null;
      var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ms1|' + norm));
      var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      for (var i = 0; i < CODES.length; i++) {
        if (CODES[i].h === hex) { var p = {}; for (var k in CODES[i]) if (k !== 'h') p[k] = CODES[i][k]; return p; }
      }
    } catch (e) {}
    return null;
  }

  async function verify(key) {
    try {
      key = String(key || '').replace(/\s+/g, '');
      if (key.indexOf('MS1-') !== 0) return await verifyCode(key);
      var parts = key.slice(4).split('.'); if (parts.length !== 2) return null;
      var payload = b64u(parts[0]), sig = b64u(parts[1]);
      var pk = await crypto.subtle.importKey('jwk', PUB, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      var ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pk, sig, payload);
      if (!ok) return null;
      return JSON.parse(new TextDecoder().decode(payload));
    } catch (e) { return null; }
  }

  /* ---------- 저장 차단(읽기 전용) ---------- */
  SP.setItem = function (k, v) { if (blockWrites && this === window.localStorage && k !== REC) return; return rawSet.apply(this, arguments); };
  SP.removeItem = function (k) { if (blockWrites && this === window.localStorage && k !== REC) return; return rawRem.apply(this, arguments); };
  SP.clear = function () { if (blockWrites && this === window.localStorage) return; return rawClr.apply(this, arguments); };
  if (rawTx) IDBDatabase.prototype.transaction = function (s, m, o) { return rawTx.call(this, s, blockWrites ? 'readonly' : m, o); };

  /* ---------- 화면 ---------- */
  var host = document.createElement('div'); host.id = 'msLicenseHost';
  var root = host.attachShadow({ mode: 'closed' });
  var CSS = ':host{all:initial}*{box-sizing:border-box}' +
    '.wrap{position:fixed;inset:0;z-index:2147483647;background:rgba(46,34,24,.62);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Pretendard,"Malgun Gothic",system-ui,sans-serif;color:#2e2218;line-height:1.6}' +
    '.card{width:min(540px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fffaf0;border:1px solid #d9c3a0;border-radius:16px;padding:26px 26px 22px;box-shadow:0 18px 60px rgba(0,0,0,.35)}' +
    '.head{display:flex;align-items:center;gap:12px;margin-bottom:14px}.head img{width:40px;height:40px}.head b{font-size:20px}.head small{display:block;font-size:11px;letter-spacing:.12em;color:#8a6d4b}' +
    'h2{font-size:18px;margin:6px 0 8px}p{margin:6px 0;font-size:14.5px}.sub{color:#6b5640;font-size:13px}' +
    'textarea{width:100%;height:92px;margin-top:10px;padding:10px;border:1px solid #c9ad84;border-radius:10px;background:#fff;font:12.5px/1.45 Consolas,monospace;color:#2e2218;resize:vertical}' +
    '.row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}' +
    'button{font:inherit;font-size:14px;padding:9px 16px;border-radius:10px;border:1px solid #b99a6c;background:#fff;color:#2e2218;cursor:pointer}' +
    'button.pri{background:#715139;border-color:#715139;color:#fff;font-weight:600}button:hover{filter:brightness(.96)}' +
    '.msg{min-height:20px;margin-top:10px;font-size:13.5px;font-weight:600}.msg.bad{color:#b3261e}.msg.good{color:#2e7d32}' +
    '.contact{margin-top:14px;padding-top:12px;border-top:1px dashed #d9c3a0;font-size:13px;color:#6b5640}' +
    '.bar{position:fixed;left:0;right:0;top:0;z-index:2147483646;background:#715139;color:#fff;font:13.5px/1.4 Pretendard,"Malgun Gothic",system-ui,sans-serif;padding:7px 14px;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap}' +
    '.bar.warn{background:#9a5b00}.bar button{padding:3px 12px;font-size:12.5px}' +
    '.badge{position:fixed;left:12px;bottom:12px;z-index:2147483645;background:rgba(255,250,240,.94);color:#6b5640;border:1px solid #d9c3a0;border-radius:999px;padding:4px 12px;font:12px/1.4 Pretendard,"Malgun Gothic",system-ui,sans-serif;cursor:pointer;opacity:.78}' +
    '.badge:hover{opacity:1}.badge.warn{background:#fff1d6;border-color:#d79a2b;color:#8a5200;opacity:1}';

  var ui = { mode: 'init', st: null, note: '', panel: false, busy: false };
  var cur = { st: 'none' };   // 마지막으로 확인된 상태

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function leftText(r) { return r.exp === null ? '무제한' : (fmt(r.exp) + '까지 · ' + (r.left <= 0 ? '오늘 마감' : 'D-' + r.left)); }

  function lockText(st, r) {
    if (st === 'expired') return ['이용 기간이 끝났습니다', '만료일은 ' + fmt(r.exp) + ' 입니다. 새 이용 키를 입력하시면 계속 사용하실 수 있습니다. 지금까지 작성하신 자료는 그대로 보관되어 있습니다.'];
    if (st === 'rollback') return ['컴퓨터 날짜를 확인해 주세요', '컴퓨터의 날짜가 이전에 사용한 기록보다 과거로 되어 있습니다. 날짜를 바로잡은 뒤 다시 열어 주세요. 날짜가 맞는데도 계속 이 화면이 나오면 카카오톡으로 문의해 주세요.'];
    if (st === 'revoked') return ['사용할 수 없는 키입니다', '이 이용 키는 더 이상 사용할 수 없습니다. 새 키를 신청해 주세요.'];
    if (st === 'invalid') return ['이용 키를 확인해 주세요', '저장되어 있던 키가 올바르지 않습니다. 새 키를 입력해 주세요.'];
    return ['이용 키를 입력해 주세요', '말씀연구실은 이용 키를 입력한 뒤 사용하실 수 있습니다. 받으신 이용 키를 입력해 주세요.'];
  }

  function render() {
    var h = '<style>' + CSS + '</style>';
    var r = cur;
    if (ui.mode === 'lock' || ui.panel) {
      var t, body;
      if (ui.panel) { t = '이용 키 정보'; body = '현재 상태: ' + (r.st === 'ok' ? '사용 중 (' + leftText(r) + ')' : '확인 필요'); if (r.p && r.p.n) body += '<br>등록 이름: ' + esc(r.p.n); }
      else { var lt = lockText(r.st, r); t = lt[0]; body = lt[1]; }
      h += '<div class="wrap" role="dialog" aria-modal="true" aria-label="이용 키"><div class="card">' +
        '<div class="head"><img src="logo.svg" alt=""><div><b>말씀연구실</b><small>SCRIPTURE DESK</small></div></div>' +
        '<h2>' + esc(t) + '</h2><p>' + body + '</p>' +
        '<textarea id="k" spellcheck="false" placeholder="받으신 이용 키를 입력하세요" aria-label="이용 키"></textarea>' +
        '<div class="msg ' + (ui.bad ? 'bad' : (ui.good ? 'good' : '')) + '" role="status">' + esc(ui.note || '') + '</div>' +
        '<div class="row"><button class="pri" id="go"' + (ui.busy ? ' disabled' : '') + '>확인</button>';
      if (ui.panel) h += '<button id="exp">내 자료 내보내기</button><button id="close">닫기</button>';
      else {
        h += '<button id="exp">내 자료 내보내기</button>';
        if (r.st === 'expired') h += '<button id="ro">읽기 전용으로 둘러보기</button>';
      }
      h += '</div><div class="contact">이용 키 신청·문의 · 카카오톡 ID <b>' + esc(KAKAO) + '</b><br>' +
        '키는 이 컴퓨터에서만 확인하며, 어떤 정보도 밖으로 보내지 않습니다.</div></div></div>';
    } else if (ui.mode === 'readonly') {
      h += '<div class="bar"><span>이용 기간이 끝나 읽기 전용입니다. 작성하신 자료는 볼 수 있고, 새로 저장되는 내용은 보관되지 않습니다.</span><button id="exp">내 자료 내보내기</button><button id="newkey">새 키 입력</button></div>';
    } else if (ui.mode === 'ok') {
      if (r.exp !== null && r.left <= WARN_DAYS) h += '<div class="bar warn"><span>이용 기간이 ' + (r.left <= 0 ? '오늘' : r.left + '일 후') + ' 끝납니다. 새 키는 카카오톡 ID ' + esc(KAKAO) + ' 로 신청해 주세요.</span><button id="newkey">새 키 입력</button></div>';
      h += '<div class="badge' + (r.exp !== null && r.left <= WARN_DAYS ? ' warn' : '') + '" id="badge" role="button" tabindex="0" title="이용 키 정보">이용 키 · ' + esc(leftText(r)) + '</div>';
    }
    root.innerHTML = h;
    wire();
  }

  function $(id) { return root.getElementById ? root.getElementById(id) : root.querySelector('#' + id); }
  function wire() {
    var go = $('go'), k = $('k');
    if (go) go.onclick = function () { submit(k.value); };
    if (k) { k.onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(k.value); } }; setTimeout(function () { try { k.focus(); } catch (e) {} }, 30); }
    var ex = $('exp'); if (ex) ex.onclick = function () { exportAll(); };
    var ro = $('ro'); if (ro) ro.onclick = function () { setMode('readonly'); };
    var cl = $('close'); if (cl) cl.onclick = function () { ui.panel = false; ui.note = ''; render(); };
    var nk = $('newkey'); if (nk) nk.onclick = function () { ui.panel = true; ui.note = ''; render(); };
    var bd = $('badge');
    if (bd) { bd.onclick = function () { ui.panel = true; ui.note = ''; render(); }; bd.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ui.panel = true; render(); } }; }
  }

  function setInert(on) { try { if (document.body) document.body.inert = !!on; } catch (e) {} }
  function setMode(m) {
    ui.mode = m; ui.panel = false;
    blockWrites = (m !== 'ok');
    setInert(m === 'lock');
    render();
  }

  /* ---------- 키 입력 ---------- */
  async function submit(text) {
    if (ui.busy) return;
    ui.busy = true; ui.bad = ui.good = false; ui.note = '확인하는 중입니다…'; render();
    var p = await verify(text), now = Date.now();
    ui.busy = false;
    if (!p) { ui.bad = true; ui.note = '키가 올바르지 않습니다. 받으신 키를 다시 확인해 주세요. (영문은 대소문자를 구분하지 않습니다.)'; render(); return; }
    var old = readRec(), key = String(text).replace(/\s+/g, '');
    var act = (old && old.key === key && old.act) ? old.act : now;
    var rec = { key: key, act: act, seen: Math.max(now, (old && old.seen) || 0), p: p };
    var r = calc(p, rec, now);
    if (r.st === 'expired') { ui.bad = true; ui.note = '이 키는 이미 기간이 끝났습니다 (만료일 ' + fmt(r.exp) + ').'; render(); return; }
    if (r.st !== 'ok') { ui.bad = true; ui.note = '이 키는 사용할 수 없습니다.'; render(); return; }
    writeRec(rec);
    ui.good = true; ui.note = '확인되었습니다 · ' + leftText(r) + ' — 화면을 다시 불러옵니다.'; render();
    setTimeout(function () { location.reload(); }, 900);
  }

  /* ---------- 내 자료 내보내기 ---------- */
  function dumpDb(name) {
    return new Promise(function (resolve) {
      var req; try { req = indexedDB.open(name); } catch (e) { return resolve(null); }
      req.onerror = function () { resolve(null); };
      req.onsuccess = function () {
        var db = req.result, out = {}, names = Array.prototype.slice.call(db.objectStoreNames);
        if (!names.length) { db.close(); return resolve(out); }
        var left = names.length;
        names.forEach(function (n) {
          try {
            var g = db.transaction(n, 'readonly').objectStore(n).getAll();
            g.onsuccess = function () { out[n] = g.result; if (--left === 0) { db.close(); resolve(out); } };
            g.onerror = function () { out[n] = null; if (--left === 0) { db.close(); resolve(out); } };
          } catch (e) { out[n] = null; if (--left === 0) { db.close(); resolve(out); } }
        });
      };
    });
  }
  async function exportAll() {
    ui.bad = ui.good = false; ui.note = '자료를 모으는 중입니다…'; render();
    var out = { app: '말씀연구실', exportedAt: new Date().toISOString(), localStorage: {}, indexedDB: {} };
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k !== REC) out.localStorage[k] = rawGet.call(localStorage, k); } } catch (e) {}
    try {
      if (indexedDB.databases) { var dbs = await indexedDB.databases(); for (var j = 0; j < dbs.length; j++) { if (dbs[j].name) out.indexedDB[dbs[j].name] = await dumpDb(dbs[j].name); } }
    } catch (e) {}
    var json = JSON.stringify(out, function (key, v) {
      if (typeof Blob !== 'undefined' && v instanceof Blob) return { _blob: v.size, type: v.type };
      if (v instanceof ArrayBuffer) return { _binary: v.byteLength };
      return v;
    }, 1);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = '말씀연구실-내자료-' + fmt(Date.now()) + '.json';
    document.documentElement.appendChild(a); a.click(); a.remove();
    ui.good = true; ui.note = '내려받았습니다. 내려받은 파일을 안전한 곳에 보관해 주세요.'; render();
  }

  /* ---------- 시작 ---------- */
  function attach() { if (!host.isConnected) document.documentElement.appendChild(host); }
  attach();
  try { new MutationObserver(function () { if (!host.isConnected) attach(); }).observe(document.documentElement, { childList: true }); } catch (e) {}
  document.addEventListener('DOMContentLoaded', function () { attach(); setInert(ui.mode === 'lock'); });

  async function evaluate() {
    var rec = readRec(), now = Date.now();
    if (!rec || !rec.key) { cur = { st: 'none' }; return setMode('lock'); }
    var p = await verify(rec.key);
    if (!p) { cur = { st: 'invalid' }; return setMode('lock'); }
    rec.p = p;
    var r = calc(p, rec, now); cur = r;
    if (r.st === 'ok' || r.st === 'expired') { rec.seen = Math.max(rec.seen || 0, now); writeRec(rec); }
    if (r.st === 'ok') return setMode('ok');
    setMode(r.st === 'expired' ? 'readonly' : 'lock');
  }

  // 같은 기록으로 먼저 빠르게 판정해 저장 차단 여부를 정하고, 곧바로 서명을 확인합니다.
  (function early() {
    var rec = readRec(), now = Date.now();
    if (rec && rec.key && rec.p) {
      var r = calc(rec.p, rec, now);
      if (r.st === 'ok') { cur = r; blockWrites = false; ui.mode = 'ok'; render(); }
      else { cur = r; blockWrites = true; ui.mode = r.st === 'expired' ? 'readonly' : 'lock'; render(); }
    } else { cur = { st: 'none' }; blockWrites = true; ui.mode = 'lock'; render(); }
    evaluate();
  })();

  setInterval(function () { if (ui.mode === 'ok') evaluate(); }, 30 * 60 * 1000);
})();
