/* appt4u admin — full version for computers.
   It runs on the same demo data as the phone app (window.A4U, set up by ../app.js),
   so a booking, claim or invoice made in one shows up in the other. */
(() => {
'use strict';
const A = window.A4U;
const ROOT = document.getElementById('admin');
if (!A || !ROOT) return;
const { t, esc, icon, rm, hm, fDate, fFull, fDay, fMonth, today0, addDays, isoDay, fromIsoDay, initials } = A;
const $ = (s, el = document) => el.querySelector(s);
const L = () => A.lang;
const S = () => A.S;
const KEY = 'appt4u-demo-v3';
const XLSX_URL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const MONEY = '#,##0.00', DATEF = 'yyyy-mm-dd';
const sum = (list, f) => list.reduce((a, x) => a + (Number(f(x)) || 0), 0);
const plain = s => String(s).replace(/<[^>]*>/g, '').trim();
const dayOf = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const stamp = () => isoDay(new Date());

/* ------------------------------------------------------------------ toast & modal */
let toastTimer = null;
function toast(msg, long) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), long ? 7000 : 2600);
}
function modal(html) { const m = $('#modal'); m.innerHTML = `<div class="md-scrim" data-x="closeModal"></div><div class="md" role="dialog" aria-modal="true">${html}</div>`; m.classList.add('open'); }
function closeModal() { const m = $('#modal'); m.classList.remove('open'); m.innerHTML = ''; }

/* ------------------------------------------------------------------ Excel (SheetJS, loaded only when needed) */
let xlsxP = null;
function loadX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return xlsxP || (xlsxP = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = XLSX_URL; s.async = true;
    s.onload = () => window.XLSX ? res(window.XLSX) : rej(new Error('no XLSX'));
    s.onerror = () => { xlsxP = null; rej(new Error('load failed')); };
    document.head.appendChild(s);
  }));
}
/* Excel stores dates as day numbers; using the local calendar day avoids time-zone shifts */
const serial = d => (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1899, 11, 30)) / 864e5;
function sheetOf(X, cols, rows, withTotal) {
  const head = cols.map(c => c.xh || plain(c.label));
  const raw = rows.map(r => cols.map(c => { const v = c.x(r); return v == null ? '' : v; }));
  if (withTotal && raw.length) raw.push(cols.map((c, i) => i === 0 ? t('total') : c.sum ? sum(raw, row => row[i]) : ''));
  const isDate = raw.map(row => row.map(v => v instanceof Date));
  const aoa = [head].concat(raw.map(row => row.map(v => v instanceof Date ? serial(v) : v)));
  const ws = X.utils.aoa_to_sheet(aoa);
  cols.forEach((c, ci) => {
    for (let ri = 0; ri < raw.length; ri++) {
      const cell = ws[X.utils.encode_cell({ r: ri + 1, c: ci })]; if (!cell || cell.t !== 'n') continue;
      if (isDate[ri][ci]) cell.z = DATEF; else if (c.z) cell.z = c.z;
    }
  });
  ws['!cols'] = cols.map((c, i) => ({ wch: Math.min(50, Math.max(c.w || 8, head[i].length + 2, ...raw.slice(0, 300).map(row => (row[i] instanceof Date ? 10 : String(row[i]).length) + 2))) }));
  if (rows.length) ws['!autofilter'] = { ref: X.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: cols.length - 1 } }) };
  return ws;
}
function sheetAOA(X, aoa, widths, moneyCols) {
  const ws = X.utils.aoa_to_sheet(aoa);
  if (widths) ws['!cols'] = widths.map(w => ({ wch: w }));
  if (moneyCols) aoa.forEach((row, r) => moneyCols.forEach(c => { const cell = ws[X.utils.encode_cell({ r, c })]; if (cell && cell.t === 'n') cell.z = MONEY; }));
  return ws;
}
const sheetName = (n, used) => { let s = String(n).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Sheet'; let k = 2; while (used.has(s)) s = s.slice(0, 28) + ' ' + k++; used.add(s); return s; };
async function downloadBook(file, sheets) {
  toast(t('ad_xlsLoading'));
  let X;
  try { X = await loadX(); } catch (e) { toast(t('ad_xlsFail'), true); return; }
  try {
    const wb = X.utils.book_new(), used = new Set();
    sheets.forEach(([name, make]) => X.utils.book_append_sheet(wb, make(X), sheetName(name, used)));
    X.writeFile(wb, file, { compression: true });
    toast(t('ad_downloaded', { f: file }));
  } catch (e) { toast(t('ad_xlsFail'), true); }
}

/* ------------------------------------------------------------------ data tables: search, filters, sorting, totals, Excel export */
const TB = {}, DT = {};
function dt(id, o) {
  const st = TB[id] || (TB[id] = { q: '', sort: o.sort == null ? null : o.sort, dir: o.dir || 1, f: {} });
  const filters = o.filters || [], shown = o.cols.filter(c => !c.hidden);
  let list = o.rows.filter(r => filters.every(f => !st.f[f.k] || f.test(r, st.f[f.k])));
  if (st.q) {
    const q = st.q.toLowerCase();
    list = list.filter(r => o.cols.some(c => { const v = c.text ? c.text(r) : c.x ? c.x(r) : ''; return String(v instanceof Date ? fDate(v) : v).toLowerCase().includes(q); }));
  }
  if (st.sort != null && shown[st.sort]) {
    const c = shown[st.sort], v = r => c.sv ? c.sv(r) : c.x ? c.x(r) : '';
    list = list.slice().sort((a, b) => { const x = v(a), y = v(b); return (x > y ? 1 : x < y ? -1 : 0) * st.dir; });
  }
  DT[id] = { cols: o.cols.filter(c => c.x), list, file: o.file, sheet: o.sheet, extra: o.extra, total: !!o.footer };
  const head = shown.map((c, i) => `<th class="${c.num ? 'num' : ''} ${c.x || c.sv ? '' : 'nosort'} ${c.cls || ''}" ${c.x || c.sv ? `data-x="sort" data-dt="${id}" data-i="${i}"` : ''}>${c.label}${st.sort === i ? (st.dir > 0 ? ' ↑' : ' ↓') : ''}</th>`).join('');
  const body = list.length
    ? list.map(r => `<tr>${shown.map(c => `<td class="${c.num ? 'num' : ''} ${c.cls || ''}">${c.html ? c.html(r) : esc(c.x(r) instanceof Date ? fDate(c.x(r)) : c.x(r))}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${shown.length}" class="muted" style="text-align:center;padding:28px">${o.empty || t('nothingHere')}</td></tr>`;
  const foot = o.footer && list.length ? `<tfoot><tr>${shown.map((c, i) => `<td class="${c.num ? 'num' : ''}">${i === 0 ? t('total') : c.foot ? c.foot(list) : ''}</td>`).join('')}</tr></tfoot>` : '';
  return `<section class="ad-card dt-wrap"><div class="dt-bar">
    <label class="dt-search">${icon('search', 16)}<input data-dq data-dt="${id}" value="${esc(st.q)}" placeholder="${t('ad_search')}" aria-label="${t('ad_search')}"></label>
    ${filters.map(f => `<select class="dt-filter" data-dt="${id}" data-fk="${f.k}" aria-label="${esc(f.label)}"><option value="">${f.label}</option>${f.opts.map(([v, l]) => `<option value="${esc(v)}" ${st.f[f.k] === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`).join('')}
    <span class="grow"></span><span class="small muted">${t('ad_rows', { n: list.length })}</span>${o.tools || ''}
    <button class="btn btn-sm btn-outline" data-x="export" data-dt="${id}">${icon('download', 16)} ${t('ad_excel')}</button></div>
    <div class="dt-scroll"><table class="dt"><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table></div></section>`;
}
function exportDT(id) {
  const d = DT[id]; if (!d) return;
  const sheets = [[d.sheet, X => sheetOf(X, d.cols, d.list, d.total)]];
  if (d.extra) sheets.push(...d.extra(d.list));
  downloadBook(d.file, sheets);
}
const money = (k, label, f) => ({ label, num: true, z: MONEY, sum: true, x: f, html: r => rm(f(r), 2), foot: list => rm(sum(list, f), 2), k });

/* ------------------------------------------------------------------ shared bits */
const head = (title, sub, actions) => `<div class="ad-head"><div><h1 class="ad-title">${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}</div><div class="ad-head-act">${actions || ''}</div></div>`;
const kcard = (label, value, extra, tone) => `<div class="ad-kpi ${tone || ''}"><span class="ad-kpi-l">${label}</span><span class="ad-kpi-v">${value}</span>${extra || ''}</div>`;
const pill = (cls, txt) => `<span class="pill ${cls}">${txt}</span>`;
const logoImg = cls => `<img class="${cls}" src="../icons/logo.png" alt="appt4u" width="960" height="263">`;
const ST_APPT = { todo: ['grey', 'st_booked'], arr: ['gold', 'arrivedSt'], in: ['gold', 'inProg'], done: ['sage', 'doneSt'], cx: ['grey', 'st_cancelled'] };
const thName = k => (A.THER[k] || { name: A.staffName(k) }).name;
const invNo = () => { const s = S(); s.invSeq = s.invSeq || 41; return 'INV-' + String(s.invSeq++).padStart(4, '0'); };

/* ------------------------------------------------------------------ dashboard */
function pDash() {
  const s = S(), items = A.todayList(), now = new Date();
  const arrived = items.filter(i => ['arr', 'in', 'done'].includes(i.status)).length;
  const unpaid = s.invoices.filter(x => x.status === 'issued'), overdue = s.invoices.filter(x => A.invStatus(x) === 'overdue');
  const pend = s.claims.filter(c => c.status === 'pending');
  const cur = A.agg(A.range('month', 'cur')), base = A.agg(A.range('month', 'prev'));
  const att = [];
  if (pend.length) att.push(['#/claims', t('att6', { n: pend.length })]);
  if (overdue.length) att.push(['#/invoices', t('att7', { n: overdue.length })]);
  att.push(['#/members', t('att1')], ['#/reports', t('att2')], ['#/commission', t('att4')]);
  const a8 = items.find(i => i.id === 'a8'); if (a8 && a8.status === 'todo') att.push(['#/timing', t('att5', { n: 'Farah', t: '16:00', m: 17 })]);
  return head(t('ad_dash'), `Lumière Skin Studio · ${fDay(now)}`, `<a class="btn btn-outline btn-sm" href="#/appointments">${icon('calendar', 16)} ${t('ad_appts')}</a><a class="btn btn-primary btn-sm" href="#/invoices/new">${icon('plus', 16)} ${t('newInvoice')}</a>`)
  + `<div class="ad-kpis">
      ${kcard(t('kBookings'), 29 + items.length, A.dPct(29 + items.length, 25 + items.length))}
      ${kcard(t('kArrived'), 15 + arrived)}
      ${kcard(t('ad_kpiUnpaid'), rm(sum(unpaid, x => A.invTotals(x).total), 2), overdue.length ? pill('rose', t('att7', { n: overdue.length })) : '', overdue.length ? 'warn' : '')}
      ${kcard(t('ad_salesMonth'), rm(cur.earned), A.dPct(cur.earned, base.earned))}
    </div>
    <div class="ad-grid2">
      <section class="ad-card"><div class="ad-card-h"><h2>${t('appts')}</h2><a class="link" href="#/appointments">${t('ad_viewAll')}</a></div>
        <table class="dt"><thead><tr><th class="nosort">${t('ad_time')}</th><th class="nosort">${t('ad_client')}</th><th class="nosort">${t('ad_treatment')}</th><th class="nosort">${t('lg_treat')}</th><th class="nosort">${t('ad_status')}</th></tr></thead>
        <tbody>${items.map(i => `<tr><td class="nowrap"><b>${i.time}</b></td><td>${esc(i.client)}</td><td>${esc(i.label)}</td><td>${thName(i.th)}</td><td>${pill(ST_APPT[i.status][0], t(ST_APPT[i.status][1]))}</td></tr>`).join('')}</tbody></table></section>
      <section class="ad-card"><h2>${t('needs')}</h2><div class="ad-att">${att.map(([h, txt]) => `<a href="${h}"><span>${esc(txt)}</span>${icon('chevR', 16)}</a>`).join('')}</div></section>
    </div>
    <section class="ad-card"><div class="ad-card-h"><h2>${t('trend')}</h2><a class="link" href="#/reports">${t('aReports')}</a></div><div class="ad-chart">${A.trendSVG()}</div>
      <div class="legend"><span><i style="background:#E2C98C"></i>${t('cashL')}</span><span><i style="background:#93701F"></i>${t('earnedL')}</span></div></section>`;
}

/* ------------------------------------------------------------------ appointments (today, all staff) */
function pAppts() {
  const items = A.todayList();
  const late = i => i.log.arr ? A.minsDiff(i.log.arr, i.start) : null;
  const lateS = i => i.log.start ? A.startLateOf(i.log, i.start) : null;
  const times = i => [i.log.arr, i.log.start, i.log.end].map(v => v ? hm(v) : '–').join(' → ');
  const flags = i => {
    if (i.log.cx) return `<span class="small muted">${t('cxBy')} ${t('W_' + i.log.cx.by)}${i.log.cx.noshow ? ' · ' + t('noShowL') : i.log.cx.last ? ' · ' + t('cxLastShort') : ''}</span>`;
    const a = late(i), b = lateS(i), out = [];
    if (a > 5) out.push(pill('rose', t('lateBy', { n: a })));
    if (b > 5) out.push(pill('amber', t('startLate', { n: b })));
    return out.join(' ') || '<span class="muted">—</span>';
  };
  const cols = [
    { label: t('ad_time'), x: i => i.time, sv: i => i.start.getTime(), html: i => `<b>${i.time}</b>` },
    { label: t('ad_client'), x: i => i.client, html: i => `<b class="nowrap">${esc(i.client)}</b>`, w: 18 },
    { label: t('ad_treatment'), x: i => i.label, w: 26, cls: 'wide' },
    { label: t('lg_treat'), x: i => thName(i.th), html: i => `<span class="nowrap">${thName(i.th)}</span>${i.room ? `<span class="sub">${A.roomName(i.room)}</span>` : ''}` },
    { label: t('ad_room'), x: i => A.roomName(i.room) || '', hidden: true },
    { label: t('ad_status'), x: i => t(ST_APPT[i.status][1]), html: i => pill(ST_APPT[i.status][0], t(ST_APPT[i.status][1])) },
    { label: `${t('ad_arrived')} → ${t('ad_started')} → ${t('ad_ended')}`, html: i => `<span class="nowrap">${times(i)}</span>`, sv: i => i.log.arr || '' },
    { label: t('ad_arrived'), x: i => i.log.arr ? hm(i.log.arr) : '', hidden: true },
    { label: t('ad_started'), x: i => i.log.start ? hm(i.log.start) : '', hidden: true },
    { label: t('ad_ended'), x: i => i.log.end ? hm(i.log.end) : '', hidden: true },
    { label: t('ad_lateC'), num: true, x: i => { const v = late(i); return v > 0 ? v : ''; }, hidden: true },
    { label: t('ad_lateS'), num: true, x: i => { const v = lateS(i); return v > 0 ? v : ''; }, hidden: true },
    { label: t('cxBy'), x: i => i.log.cx ? t('W_' + i.log.cx.by) + (i.log.cx.noshow ? ' · ' + t('noShowL') : i.log.cx.last ? ' · ' + t('cxLastShort') : '') : '', hidden: true },
    { label: t('needs'), html: flags },
    { label: t('ad_actions'), html: i => i.status === 'todo' ? `<span class="acts"><button class="btn btn-sm btn-outline" data-x="checkin" data-id="${i.id}">${t('checkIn')}</button><button class="icon-btn" data-x="cxSheet" data-id="${i.id}" title="${t('cancel')}" aria-label="${t('cancel')}">${icon('x', 18)}</button></span>` : '' },
  ];
  const staffOpts = ['joanne', 'weiling', 'aida'].map(k => [k, thName(k)]);
  const stOpts = Object.keys(ST_APPT).map(k => [k, t(ST_APPT[k][1])]);
  return head(t('ad_appts'), `${t('appts')} · ${fDay(new Date())}`)
    + dt('appts', { cols, rows: items, file: `appt4u-appointments-${stamp()}.xlsx`, sheet: t('ad_appts'),
      filters: [{ k: 'th', label: t('lg_treat'), opts: staffOpts, test: (i, v) => i.th === v }, { k: 'st', label: t('ad_status'), opts: stOpts, test: (i, v) => i.status === v }] })
    + `<p class="small muted">${t('diaryNote')}</p>`;
}

/* ------------------------------------------------------------------ members */
function pMembers() {
  const bal = m => m.id === 'meiling' ? A.meilingBalance() : (m.bal || 0);
  const cols = [
    { label: t('ad_name'), x: m => m.name, html: m => `<a class="who" href="#/members/${m.id}"><span class="avatar">${initials(m.name)}</span><b>${esc(m.name)}</b></a>`, w: 18 },
    { label: t('contactT'), text: m => { const c = A.mContact(m.id); return A.CONTACT_KEYS.map(k => c[k]).join(' '); }, html: m => {
      const c = A.mContact(m.id), ln = A.contactLinks(c), soc = [c.wechat && `WeChat ${esc(c.wechat)}`, c.fb && `<a href="${esc(ln.fb)}" target="_blank" rel="noopener">FB</a>`, c.ig && `<a href="${esc(ln.ig)}" target="_blank" rel="noopener">IG ${esc(c.ig)}</a>`].filter(Boolean).join(' · ');
      return `${c.phone ? `<a class="nowrap" href="${ln.phone}">${esc(c.phone)}</a>` : '<span class="muted">—</span>'}${c.email ? `<span class="sub"><a href="${ln.email}">${esc(c.email)}</a></span>` : ''}${soc ? `<span class="sub">${soc}</span>` : ''}`; } },
    { label: t('f_phone'), x: m => A.mContact(m.id).phone || '', hidden: true, w: 16 },
    { label: t('f_email'), x: m => A.mContact(m.id).email || '', hidden: true, w: 24 },
    { label: t('f_wechat'), x: m => A.mContact(m.id).wechat || '', hidden: true },
    { label: 'Facebook', x: m => A.mContact(m.id).fb || '', hidden: true, w: 24 },
    { label: 'Instagram', x: m => A.mContact(m.id).ig || '', hidden: true, w: 16 },
    { label: t('ad_tier'), x: m => m.tier === 'gold' ? t('goldMember') : 'Silver', html: m => m.tier === 'gold' ? pill('gold', t('goldMember')) : pill('grey', 'Silver') },
    { label: t('ad_segment'), x: m => t('seg_' + m.seg) },
    { label: t('ad_lastDays'), num: true, x: m => m.last },
    { label: t('visits12'), num: true, x: m => m.visits },
    money('ltv', t('ltv'), m => m.ltv),
    money('bal', t('balanceLeft'), bal),
    { label: t('pkgsBought'), num: true, x: m => m.pk },
    { label: t('rebuy'), x: m => m.rebuy ? t('weeks', { n: m.rebuy }) : '', html: m => m.rebuy ? t('weeks', { n: m.rebuy }) : '—' },
    { label: t('introducer'), x: m => m.intro || '' },
    { label: t('consent'), x: m => m.consent ? t('signed') : t('consentMissing'), html: m => m.consent ? pill('sage', t('signed')) : pill('rose', t('consentMissing')) },
    { label: t('ad_actions'), html: m => `<span class="acts"><button class="btn btn-sm btn-outline" data-x="memEdit" data-id="${m.id}">${t('editInv')}</button><button class="btn btn-sm btn-outline" data-x="invFor" data-id="${m.id}">${icon('doc', 15)} ${t('ad_newFor')}</button></span>` },
  ];
  const segs = ['vip', 'loyal', 'new', 'atrisk', 'away', 'lost'].map(k => [k, t('seg_' + k)]);
  return head(t('aMembers'), 'Lumière Skin Studio')
    + dt('members', { cols, rows: A.MEMBERS, footer: true, file: `appt4u-members-${stamp()}.xlsx`, sheet: t('aMembers'), sort: 6, dir: -1,
      filters: [{ k: 'seg', label: t('ad_segment'), opts: segs, test: (m, v) => m.seg === v }, { k: 'tier', label: t('ad_tier'), opts: [['gold', t('goldMember')], ['silver', 'Silver']], test: (m, v) => m.tier === v }] })
    + `<p class="note gold">${icon('users', 16)}<span>${t('contactPrivacy')}</span></p><p class="small muted">${t('ownOnly', { b: 'Lumière' })}</p>`;
}

const OWNER = { name: 'Michelle', role: 'owner' };
function pMember(id) {
  const m = A.member(id); if (!m) return null;
  const c = A.mContact(id), ln = A.contactLinks(c), bal = id === 'meiling' ? A.meilingBalance() : (m.bal || 0);
  const row = (label, val, href) => `<div class="statrow"><span>${label}</span><b>${val ? (href ? `<a href="${esc(href)}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${esc(val)}</a>` : esc(val)) : '—'}</b></div>`;
  return `<div class="ad-head"><div><p class="ad-crumb"><a href="#/members">${t('aMembers')}</a> / ${esc(m.name)}</p><h1 class="ad-title">${esc(m.name)}</h1><p class="muted">${m.tier === 'gold' ? t('goldMember') : 'Silver'} · ${t('seg_' + m.seg)}${m.intro ? ' · ' + t('introBy', { n: m.intro }) : ''}</p></div>
    <div class="ad-head-act"><button class="btn btn-outline btn-sm" data-x="memEdit" data-id="${id}">${t('editMember')}</button><button class="btn btn-primary btn-sm" data-x="invFor" data-id="${id}">${icon('doc', 16)} ${t('ad_newFor')}</button></div></div>
  <div class="ad-kpis">${kcard(t('ltv'), rm(m.ltv))}${kcard(t('balanceLeft'), rm(bal))}${kcard(t('visits12'), m.visits)}${kcard(t('lastVisitL'), t('daysAgo', { n: m.last }))}</div>
  <div class="inv-layout"><section class="ad-card">${A.recordsSection(id, 'x', true)}</section>
    <aside class="inv-side"><section class="ad-card"><h2>${t('contactT')}</h2><div>${row(t('f_phone'), c.phone, ln.phone)}${row(t('f_email'), c.email, ln.email)}${row(t('f_wechat'), c.wechat)}${row('Facebook', c.fb, ln.fb)}${row('Instagram', c.ig, ln.ig)}</div>
      ${ln.wa ? `<a class="btn btn-soft btn-block" href="${ln.wa}" target="_blank" rel="noopener">${icon('phone', 16)} WhatsApp</a>` : ''}<p class="small muted">${t('contactPrivacy')}</p></section>
      <section class="ad-card"><h2>${t('consent')}</h2><p>${m.consent ? pill('sage', t('consentOk')) : pill('rose', t('consentMissing'))}</p></section></aside></div>`;
}

/* ------------------------------------------------------------------ invoices: list, Excel listing, import template, import */
const INV_ST = x => A.invStatus(x);
const invCust = x => A.invCust(x);
const invContact = x => x.mid ? '' : (x.contact || '');
function invItemsText(x) { return x.items.map(l => `${A.invLineName(l)} × ${l.qty}`).join('; '); }
function pInvoices() {
  const s = S(), all = s.invoices;
  const now = new Date(), thisMonth = x => x.paidAt && new Date(x.paidAt).getMonth() === now.getMonth() && new Date(x.paidAt).getFullYear() === now.getFullYear();
  const unpaid = all.filter(x => x.status === 'issued'), overdue = all.filter(x => INV_ST(x) === 'overdue');
  const T = x => A.invTotals(x);
  const months = [...new Set(all.map(x => isoDay(x.date).slice(0, 7)))].sort().reverse();
  const cols = [
    { label: t('invNo'), x: x => x.no, html: x => `<a class="strong nowrap" href="#/invoices/${x.id}">${x.no}</a>`, w: 12 },
    { label: t('invDate'), x: x => dayOf(x.date), html: x => `<span class="nowrap">${fDate(x.date)}</span>`, sv: x => new Date(x.date).getTime() },
    { label: t('billTo'), x: x => invCust(x), html: x => `<b>${esc(invCust(x))}</b>${invContact(x) ? `<span class="sub">${esc(invContact(x))}</span>` : ''}`, text: x => invCust(x) + ' ' + invContact(x), w: 26 },
    { label: t('ad_contact'), x: x => invContact(x), html: () => '', hidden: true },
    { label: t('dueL'), x: x => dayOf(x.due), html: x => `<span class="nowrap">${fDate(x.due)}</span>`, sv: x => new Date(x.due).getTime() },
    { label: t('ad_status'), x: x => t('inv_' + INV_ST(x)), html: x => pill(A.INV_PILL[INV_ST(x)], t('inv_' + INV_ST(x))) },
    money('sub', t('subtotal'), x => T(x).sub),
    money('disc', t('discL'), x => T(x).disc),
    money('sst', 'SST 8%', x => T(x).sst),
    money('total', t('total'), x => T(x).total),
    { label: t('ad_paidDate'), x: x => x.status === 'paid' && x.paidAt ? dayOf(x.paidAt) : '', html: x => x.status === 'paid' && x.paidAt ? fDate(x.paidAt) : '—' },
    { label: t('ad_method'), x: x => x.status === 'paid' && x.method ? t('m_' + x.method) : '' },
    { label: t('items'), x: x => invItemsText(x), html: x => `<span class="small muted">${x.items.length}</span>`, w: 40 },
    { label: t('invNotes'), x: x => x.notes || '', html: () => '', hidden: true },
    { label: t('ad_actions'), html: x => `<span class="acts"><a class="btn btn-sm btn-outline" href="#/invoices/${x.id}">${t('viewInv')}</a></span>` },
  ];
  /* hidden columns go to Excel only */
  const table = dt('invoices', {
    cols, rows: all, footer: true, sort: 1, dir: -1, file: `appt4u-invoices-${stamp()}.xlsx`, sheet: t('invoices'),
    filters: [
      { k: 'st', label: t('ad_status'), opts: [['draft', t('inv_draft')], ['issued', t('inv_issued')], ['overdue', t('inv_overdue')], ['paid', t('inv_paid')]], test: (x, v) => v === 'issued' ? x.status === 'issued' : INV_ST(x) === v },
      { k: 'mo', label: t('ad_month'), opts: months.map(m => [m, fMonth(new Date(m + '-15'))]), test: (x, v) => isoDay(x.date).slice(0, 7) === v },
    ],
    tools: `<button class="btn btn-sm btn-outline" data-x="invTemplate">${icon('doc', 16)} ${t('ad_template')}</button>
      <label class="btn btn-sm btn-outline upl">${icon('share', 16)} ${t('ad_import')}<input type="file" id="impFile" accept=".xlsx,.xls,.csv"></label>`,
    extra: list => [[t('ad_itemsSheet'), X => sheetOf(X, [
      { xh: t('invNo'), x: r => r.no }, { xh: t('invDate'), x: r => r.date }, { xh: t('billTo'), x: r => r.cust, w: 24 }, { xh: t('ad_status'), x: r => r.st },
      { xh: t('items'), x: r => r.name, w: 34 }, { xh: t('qty'), x: r => r.qty }, { xh: t('unitPrice') + ' (RM)', x: r => r.price, z: MONEY }, { xh: 'RM', x: r => r.amount, z: MONEY, sum: true },
    ], list.flatMap(x => x.items.map(l => ({ no: x.no, date: dayOf(x.date), cust: invCust(x), st: t('inv_' + INV_ST(x)), name: A.invLineName(l), qty: Number(l.qty) || 0, price: Number(l.price) || 0, amount: (Number(l.qty) || 0) * (Number(l.price) || 0) }))), true)]],
  });
  return head(t('invoices'), 'Lumière Skin Studio Sdn Bhd', `<a class="btn btn-primary btn-sm" href="#/invoices/new">${icon('plus', 16)} ${t('newInvoice')}</a>`)
  + `<div class="ad-kpis">
      ${kcard(t('outstanding'), rm(sum(unpaid, x => T(x).total), 2), `<span class="small muted">${unpaid.length} × ${t('invoiceWord')}</span>`)}
      ${kcard(t('inv_overdue'), rm(sum(overdue, x => T(x).total), 2), `<span class="small muted">${overdue.length} × ${t('invoiceWord')}</span>`, overdue.length ? 'warn' : '')}
      ${kcard(t('paidMonth'), rm(sum(all.filter(x => x.status === 'paid' && thisMonth(x)), x => T(x).total), 2))}
      ${kcard(t('ad_drafts'), all.filter(x => x.status === 'draft').length)}
    </div>${table}`;
}
const TPL_HEAD = ['Ref', 'Invoice date', 'Due date', 'Member ID', 'Customer name', 'Phone or email', 'Item code', 'Description', 'Qty', 'Unit price (RM)', 'Discount (RM)', 'SST (Y/N)', 'Notes'];
function downloadTemplate() {
  const d0 = today0(), d14 = addDays(d0, 14);
  const ex = [
    ['A1', serial(d0), serial(d14), 'grace', '', '', 'p-hydra6', '', 1, '', '', 'N', 'Package renewal'],
    ['A2', serial(d0), serial(d14), '', 'Mont Kiara Bridal Co.', 'events@mkbridal.example', '', 'Bridal party make-up trial', 1, 250, 50, 'Y', ''],
    ['A2', serial(d0), serial(d14), '', 'Mont Kiara Bridal Co.', 'events@mkbridal.example', 'hydra', '', 5, '', '', '', ''],
  ];
  const lum = A.PRODUCTS.filter(p => p.biz === 'lumiere'), svcs = A.SERVICES.filter(s => s.biz === 'lumiere');
  downloadBook('appt4u-invoice-import-template.xlsx', [
    ['Invoices', X => { const ws = X.utils.aoa_to_sheet([TPL_HEAD].concat(ex)); ex.forEach((_, r) => [1, 2].forEach(c => { const cell = ws[X.utils.encode_cell({ r: r + 1, c })]; if (cell) cell.z = DATEF; })); ws['!cols'] = [6, 13, 13, 12, 26, 26, 12, 30, 6, 15, 13, 10, 24].map(w => ({ wch: w })); return ws; }],
    [t('ad_tplHelp'), X => sheetAOA(X, [[t('ad_tplHelp')], [], ...['ad_h1', 'ad_h2', 'ad_h3', 'ad_h4', 'ad_h5', 'ad_h6'].map((k, i) => [`${i + 1}. ${t(k)}`]), [], ['Columns: ' + TPL_HEAD.join(' | ')]], [110])],
    [t('ad_codes'), X => sheetAOA(X, [[t('ad_code'), t('ad_name'), t('ad_type'), t('ad_priceRM')]].concat(lum.map(p => [p.id, p.name[L()], t('tabPackages'), p.price]), svcs.map(s => [s.id, s.name[L()], t('services'), s.price])), [12, 40, 14, 12])],
    ['Members', X => sheetAOA(X, [['Member ID', t('ad_name')]].concat(A.MEMBERS.map(m => [m.id, m.name])), [14, 26])],
  ]);
}
function cellDate(v, fallback) {
  if (v instanceof Date && !isNaN(v)) return new Date(v.getTime() + 12 * 3600e3);
  if (typeof v === 'number' && v > 20000) return new Date(Date.UTC(1899, 11, 30) + v * 864e5 + 12 * 3600e3);
  const m = String(v || '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], 12);
  return fallback;
}
async function importInvoices(file) {
  let X;
  try { X = await loadX(); } catch (e) { toast(t('ad_xlsFail'), true); return; }
  let rows;
  try {
    const wb = X.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const ws = wb.Sheets['Invoices'] || wb.Sheets[wb.SheetNames[0]];
    rows = X.utils.sheet_to_json(ws, { defval: '', raw: true });
  } catch (e) { toast(t('ad_importErr'), true); return; }
  const g = (r, name) => { const k = Object.keys(r).find(k => k.trim().toLowerCase() === name.toLowerCase()); return k ? r[k] : ''; };
  const groups = new Map(), skipped = [];
  rows.forEach((r, i) => {
    const filled = Object.values(r).some(v => String(v).trim() !== ''); if (!filled) return;
    const ref = String(g(r, 'Ref')).trim() || '#' + i;
    if (!groups.has(ref)) groups.set(ref, []);
    groups.get(ref).push({ r, line: i + 2 });
  });
  const s = S(), made = [];
  groups.forEach(list => {
    const r0 = list[0].r, mid = String(g(r0, 'Member ID')).trim(), m = mid && A.member(mid) ? mid : null;
    const name = String(g(r0, 'Customer name')).trim();
    if (!m && !name) { skipped.push(t('ad_rowNoCust', { r: list[0].line })); return; }
    const items = [];
    list.forEach(({ r, line }) => {
      const code = String(g(r, 'Item code')).trim(), desc = String(g(r, 'Description')).trim();
      const p = code && A.product(code), sv = code && !p && A.svc(code.replace(/^s:/, ''));
      const ref = p ? 'p:' + p.id : sv ? 's:' + sv.id : null;
      const priceIn = g(r, 'Unit price (RM)'), price = priceIn === '' ? (p ? p.price : sv ? sv.price : NaN) : Number(String(priceIn).replace(/[^\d.-]/g, ''));
      if ((!ref && !desc) || !(price >= 0)) { skipped.push(t('ad_rowNoItem', { r: line })); return; }
      items.push({ ref, label: ref ? undefined : desc, qty: Math.max(1, Math.round(Number(g(r, 'Qty')) || 1)), price });
    });
    if (!items.length) return;
    const date = cellDate(g(r0, 'Invoice date'), new Date()), due = cellDate(g(r0, 'Due date'), addDays(date, 14));
    const rec = { id: 'i' + Date.now().toString(36) + made.length, no: invNo(), date: date.toISOString(), due: due.toISOString(), mid: m, name: m ? '' : name, contact: m ? '' : String(g(r0, 'Phone or email')).trim(),
      items, discount: Math.max(0, Number(String(g(r0, 'Discount (RM)')).replace(/[^\d.]/g, '')) || 0), sst: /^y/i.test(String(g(r0, 'SST (Y/N)')).trim()), notes: String(g(r0, 'Notes')).trim(), status: 'draft' };
    s.invoices.push(rec); made.push(rec);
  });
  if (made.length) { A.save(); TB.invoices = Object.assign(TB.invoices || {}, { f: { st: 'draft' }, q: '' }); render(); }
  if (!made.length && !skipped.length) { modal(`<h2>${t('ad_import')}</h2><p class="muted">${t('ad_importNone')}</p><button class="btn btn-primary" data-x="closeModal">${t('done')}</button>`); return; }
  modal(`<h2>${t('ad_import')}</h2>${made.length ? `<p class="note sage">${icon('checkCircle', 16)}<span>${t('ad_importDone', { n: made.length })}</span></p>` : ''}
    ${skipped.length ? `<p class="strong">${t('ad_importSkip', { n: skipped.length })}</p><ul>${skipped.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    <button class="btn btn-primary" data-x="closeModal">${t('done')}</button>`);
}

/* ------------------------------------------------------------------ one invoice: document, actions, edit */
function invDoc(x) {
  const T = A.invTotals(x), st = INV_ST(x);
  return `<div class="card invdoc big stack">
    <div class="row" style="align-items:flex-start"><div>${logoImg('inv-logo')}<p class="inv-biz">${A.BIZ_INFO.name}</p><p class="small muted">${A.BIZ_INFO.addr}<br>${A.BIZ_INFO.reg} · ${A.BIZ_INFO.phone}</p></div>
      <div style="text-align:right"><p class="inv-title">${t('invoiceWord')}</p>${pill(A.INV_PILL[st], t('inv_' + st))}</div></div>
    <div class="inv-meta"><span>${t('invNo')}<b>${esc(x.no || '—')}</b></span><span>${t('invDate')}<b>${fFull(x.date)}</b></span><span>${t('dueL')}<b>${fFull(x.due)}</b></span><span>${t('billTo')}<b>${esc(invCust(x) || '—')}</b>${invContact(x) ? `<span class="muted">${esc(invContact(x))}</span>` : ''}</span></div>
    <table class="tbl"><thead><tr><th>${t('items')}</th><th class="num">${t('qty')}</th><th class="num">${t('unitPrice')}</th><th class="num">RM</th></tr></thead><tbody>
      ${x.items.length ? x.items.map(l => `<tr><td>${esc(A.invLineName(l))}</td><td class="num">${Number(l.qty) || 0}</td><td class="num">${(Number(l.price) || 0).toFixed(2)}</td><td class="num">${((Number(l.qty) || 0) * (Number(l.price) || 0)).toFixed(2)}</td></tr>`).join('') : `<tr><td colspan="4" class="muted">${t('needItems')}</td></tr>`}</tbody></table>
    <div class="tot"><div class="statrow"><span>${t('subtotal')}</span><b>${rm(T.sub, 2)}</b></div>${T.disc ? `<div class="statrow"><span>${t('discL')}</span><b>−${rm(T.disc, 2)}</b></div>` : ''}${x.sst ? `<div class="statrow"><span>SST 8%</span><b>${rm(T.sst, 2)}</b></div>` : ''}
      <div class="statrow total"><span>${t('total')}</span><b>${rm(T.total, 2)}</b></div><div class="statrow"><span>${t('amountDue')}</span><b>${rm(x.status === 'paid' ? 0 : T.total, 2)}</b></div></div>
    ${x.status === 'paid' && x.paidAt ? `<p class="note sage">${icon('checkCircle', 16)}<span>${t('paidOn', { d: fFull(x.paidAt), m: t('m_' + x.method) })}</span></p>` : ''}
    ${x.notes ? `<p class="small muted">${esc(x.notes)}</p>` : ''}</div>`;
}
function pInvoice(id) {
  const x = S().invoices.find(v => v.id === id); if (!x) return null;
  const st = INV_ST(x), T = A.invTotals(x);
  const acts = [
    x.status === 'draft' ? `<button class="btn btn-primary btn-block" data-x="invIssue" data-id="${x.id}">${t('issueInv')}</button><a class="btn btn-outline btn-block" href="#/invoices/${x.id}/edit">${icon('settings', 16)} ${t('editInv')}</a>` : '',
    x.status === 'issued' ? `<button class="btn btn-primary btn-block" data-x="invPaySheet" data-id="${x.id}">${icon('cash', 18)} ${t('markPaidInv')}</button>` : '',
    `<button class="btn btn-outline btn-block" data-x="print">${icon('download', 16)} ${t('printPdf')}</button>`,
    `<button class="btn btn-outline btn-block" data-x="invExcel" data-id="${x.id}">${icon('doc', 16)} ${t('ad_excel')}</button>`,
    `<button class="btn btn-outline btn-block" data-x="invDup" data-id="${x.id}">${icon('plus', 16)} ${t('ad_dup')}</button>`,
    x.status === 'draft' ? `<button class="btn btn-ghost btn-block" data-x="invDelete" data-id="${x.id}">${t('ad_delete')}</button>` : '',
  ].join('');
  return `<div class="ad-head"><div><p class="ad-crumb"><a href="#/invoices">${t('invoices')}</a> / ${esc(x.no)}</p><h1 class="ad-title">${esc(x.no)} · ${esc(invCust(x))}</h1></div></div>
  <div class="inv-layout">${invDoc(x)}
    <aside class="inv-side"><div class="ad-card"><div class="row"><span class="muted">${t('ad_status')}</span>${pill(A.INV_PILL[st], t('inv_' + st))}</div>
      <div class="row"><span class="muted">${t('amountDue')}</span><b style="font-size:22px">${rm(x.status === 'paid' ? 0 : T.total, 2)}</b></div>${acts}</div></aside></div>`;
}
let ED = null;
function newDraft(mid) { return { id: null, mid: mid === undefined ? 'meiling' : mid, name: '', contact: '', items: [], discount: '', sst: false, date: isoDay(today0()), due: isoDay(addDays(today0(), 14)), notes: '' }; }
function edToInv() {
  const old = ED.id ? S().invoices.find(v => v.id === ED.id) : null;
  return { no: old ? old.no : 'INV-' + String(S().invSeq || 41).padStart(4, '0'), date: fromIsoDay(ED.date).toISOString(), due: fromIsoDay(ED.due).toISOString(), mid: ED.mid, name: ED.name, contact: ED.contact,
    items: ED.items, discount: Number(String(ED.discount).replace(/[^\d.]/g, '')) || 0, sst: ED.sst, notes: ED.notes, status: old ? old.status : 'draft', paidAt: old && old.paidAt, method: old && old.method };
}
function pInvEdit(id) {
  if (id) { if (!ED || ED.id !== id) { const x = S().invoices.find(v => v.id === id); if (!x) return null; ED = JSON.parse(JSON.stringify(x)); ED.date = isoDay(x.date); ED.due = isoDay(x.due); ED.discount = x.discount ? String(x.discount) : ''; ED.name = ED.name || ''; ED.contact = ED.contact || ''; ED.notes = ED.notes || ''; } }
  else if (!ED || ED.id) ED = newDraft();
  const lumP = A.PRODUCTS.filter(p => p.biz === 'lumiere'), lumS = A.SERVICES.filter(s => s.biz === 'lumiere');
  const lines = ED.items.map((l, i) => `<tr><td>${l.ref ? `<b>${esc(A.invLineName(l))}</b>` : `<input class="field" data-li="${i}" data-lf="label" value="${esc(l.label || '')}" placeholder="${t('itemDescPh')}">`}</td>
      <td class="q"><input class="field" type="number" min="1" data-li="${i}" data-lf="qty" value="${esc(l.qty)}" aria-label="${t('qty')}"></td>
      <td class="p"><input class="field" inputmode="decimal" data-li="${i}" data-lf="price" value="${esc(l.price)}" aria-label="${t('unitPrice')}"></td>
      <td class="amt" id="la${i}">${rm((Number(l.qty) || 0) * (Number(l.price) || 0), 2)}</td>
      <td><button class="icon-btn" data-x="edRemove" data-i="${i}" aria-label="${t('cancel')}">${icon('x', 18)}</button></td></tr>`).join('');
  const form = `<section class="ad-card">
    <div class="ed-col"><span class="label">${t('billTo')}</span><select class="field" id="edCust">${A.MEMBERS.map(m => `<option value="${m.id}" ${ED.mid === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}<option value="" ${!ED.mid ? 'selected' : ''}>${t('otherCust')}</option></select></div>
    ${!ED.mid ? `<div class="ed-grid"><label><span class="label">${t('custName')}</span><input class="field" data-ed="name" value="${esc(ED.name)}"></label><label><span class="label">${t('custContact')}</span><input class="field" data-ed="contact" value="${esc(ED.contact)}"></label></div>` : ''}
    <div class="ed-grid"><label><span class="label">${t('invDate')}</span><input class="field" type="date" data-ed="date" value="${esc(ED.date)}"></label><label><span class="label">${t('dueL')}</span><input class="field" type="date" data-ed="due" value="${esc(ED.due)}"></label></div>
    <div class="ed-col"><span class="label">${t('items')}</span>
      ${ED.items.length ? `<table class="ed-lines"><thead><tr><th>${t('items')}</th><th>${t('qty')}</th><th>${t('unitPrice')} (RM)</th><th style="text-align:right">RM</th><th></th></tr></thead><tbody>${lines}</tbody></table>` : ''}
      <select class="field" id="edAdd"><option value="">${t('addItem')}</option><optgroup label="${t('tabPackages')}">${lumP.map(x => `<option value="p:${x.id}">${x.name[L()]} · ${rm(x.price)}</option>`).join('')}</optgroup><optgroup label="${t('services')}">${lumS.map(s => `<option value="s:${s.id}">${s.name[L()]} · ${rm(s.price)}</option>`).join('')}</optgroup><option value="custom">${t('otherItem')}</option></select></div>
    <div class="ed-grid"><label><span class="label">${t('discount')}</span><input class="field" inputmode="decimal" data-ed="discount" value="${esc(ED.discount)}" placeholder="0.00"></label>
      <label class="row toggle-row" style="align-self:end;padding-bottom:10px"><span>${t('sst')}</span><input type="checkbox" class="switch" id="edSst" ${ED.sst ? 'checked' : ''}></label></div>
    <label class="ed-col"><span class="label">${t('invNotes')}</span><textarea class="field" data-ed="notes" placeholder="${t('invNotesPh')}">${esc(ED.notes)}</textarea></label>
    <div class="row-start gap8"><a class="btn btn-ghost" href="#/invoices${ED.id ? '/' + ED.id : ''}">${t('cancel')}</a><span class="grow"></span><button class="btn btn-outline" data-x="edSave" data-s="draft">${t('saveDraft')}</button><button class="btn btn-primary" data-x="edSave" data-s="issued">${t('issueInv')}</button></div></section>`;
  return `<div class="ad-head"><div><p class="ad-crumb"><a href="#/invoices">${t('invoices')}</a> / ${ED.id ? esc(edToInv().no) : t('newInvoice')}</p><h1 class="ad-title">${ED.id ? `${t('editInv')} ${esc(edToInv().no)}` : t('newInvoice')}</h1></div></div>
  <div class="inv-layout edit">${form}<div class="ed-col"><span class="label">${t('ad_preview')}</span><div id="edPreview">${invDoc(edToInv())}</div></div></div>`;
}
function refreshPreview() {
  const p = $('#edPreview'); if (p && ED) p.innerHTML = invDoc(edToInv());
  if (ED) ED.items.forEach((l, i) => { const c = $('#la' + i); if (c) c.textContent = rm((Number(l.qty) || 0) * (Number(l.price) || 0), 2); });
}
function saveDraft(status) {
  if (!ED.mid && !ED.name.trim()) { toast(t('needCust')); return; }
  if (!ED.items.length) { toast(t('needItems')); return; }
  const s = S(), old = ED.id ? s.invoices.find(v => v.id === ED.id) : null;
  const rec = { id: ED.id || 'i' + Date.now().toString(36), no: old ? old.no : invNo(), date: fromIsoDay(ED.date).toISOString(), due: fromIsoDay(ED.due).toISOString(),
    mid: ED.mid || null, name: ED.mid ? '' : ED.name.trim(), contact: ED.mid ? '' : ED.contact.trim(),
    items: ED.items.map(l => ({ ref: l.ref || null, label: l.ref ? undefined : (l.label || '').trim(), qty: Math.max(1, Math.round(Number(l.qty) || 1)), price: Math.max(0, Number(l.price) || 0) })),
    discount: Math.max(0, Number(String(ED.discount).replace(/[^\d.]/g, '')) || 0), sst: !!ED.sst, notes: (ED.notes || '').trim(),
    status: old && old.status === 'paid' ? 'paid' : status, paidAt: old ? old.paidAt : undefined, method: old ? old.method : undefined };
  if (old) Object.assign(old, rec); else s.invoices.push(rec);
  A.save(); ED = null; location.hash = '#/invoices/' + rec.id; toast(status === 'issued' ? t('invIssued', { n: rec.no }) : t('invDraftSaved'));
}

/* ------------------------------------------------------------------ staff claims */
function pClaims() {
  const s = S(), list = s.claims.slice();
  const kind = c => c.type === 'ot' ? t('ct_ot') : t('newExp');
  const cat = c => c.type === 'ot' ? t('od_' + c.day) : t('ec_' + c.cat);
  const det = c => c.type === 'ot' ? `${c.from}–${c.to}${c.desc ? ' · ' + c.desc : ''}` : (c.desc || '');
  const cols = [
    { label: t('invDate'), x: c => dayOf(c.date), sv: c => new Date(c.date).getTime(), html: c => `<span class="nowrap">${fDate(c.date)}</span>` },
    { label: t('ad_person'), x: c => A.staffName(c.who), html: c => `<span class="who"><span class="avatar">${initials(A.staffName(c.who))}</span><span><b>${A.staffName(c.who)}</b><span class="sub">${t('kind_' + A.staffKind(c.who))}</span></span></span>` },
    { label: t('ad_type'), x: kind, html: c => `<b>${kind(c)}</b><span class="sub">${cat(c)}${c.type === 'ot' ? ' · ' + t('hoursN', { n: c.hours }) : ''}</span>`, text: c => kind(c) + ' ' + cat(c) },
    { label: t('expCat'), x: cat, hidden: true },
    { label: t('ad_details'), x: det, w: 36, cls: 'wide' },
    { label: t('ad_hours'), num: true, x: c => c.type === 'ot' ? c.hours : '', hidden: true },
    money('amt', t('amountRM'), c => c.amount),
    { label: t('receiptL'), x: c => c.type === 'ot' ? '' : c.receipt ? t('receiptOk') : t('noReceipt'), html: c => c.type === 'ot' ? '—' : c.receipt ? pill('sage', t('receiptOk')) : pill('rose', t('noReceipt')) },
    { label: t('ad_status'), x: c => t('cl_' + c.status), html: c => pill(A.CL_PILL[c.status], t('cl_' + c.status)) },
    { label: t('ad_actions'), html: c => `<span class="acts">${c.status === 'pending' ? `<button class="btn btn-sm btn-primary" data-x="clSet" data-id="${c.id}" data-s="approved">${t('approve')}</button><button class="icon-btn" data-x="clSet" data-id="${c.id}" data-s="rejected" title="${t('reject')}" aria-label="${t('reject')}">${icon('x', 18)}</button>` : c.status === 'approved' ? `<button class="btn btn-sm btn-outline" data-x="clSet" data-id="${c.id}" data-s="paid">${t('markPaid')}</button>` : ''}</span>` },
  ];
  const by = st => sum(list.filter(c => c.status === st), c => c.amount);
  return head(t('claimsT'), t('typeNote'))
  + `<div class="ad-kpis">${kcard(t('toApprove'), rm(by('pending'), 2), `<span class="small muted">${list.filter(c => c.status === 'pending').length} × ${t('tClaims')}</span>`)}${kcard(t('toPay'), rm(by('approved'), 2))}${kcard(t('cl_paid'), rm(by('paid'), 2))}${kcard(t('cl_rejected'), rm(by('rejected'), 2))}</div>`
  + dt('claims', { cols, rows: list, footer: true, sort: 0, dir: -1, file: `appt4u-staff-claims-${stamp()}.xlsx`, sheet: t('claimsT'),
    filters: [
      { k: 'st', label: t('ad_status'), opts: ['pending', 'approved', 'paid', 'rejected'].map(k => [k, t('cl_' + k)]), test: (c, v) => c.status === v },
      { k: 'ty', label: t('ad_type'), opts: [['exp', t('newExp')], ['ot', t('ct_ot')]], test: (c, v) => c.type === v },
      { k: 'who', label: t('ad_person'), opts: Object.keys(A.STAFF).map(k => [k, A.staffName(k)]), test: (c, v) => c.who === v },
    ] });
}

/* ------------------------------------------------------------------ team */
function pTeam() {
  const s = S(), keys = Object.keys(A.STAFF);
  const pend = k => s.claims.filter(c => c.who === k && c.status === 'pending').length;
  const cols = [
    { label: t('ad_name'), x: k => A.staffName(k), html: k => `<span class="who"><span class="avatar">${initials(A.staffName(k))}</span><b>${A.staffName(k)}</b></span>` },
    { label: 'ID', x: k => A.STAFF[k].id },
    { label: t('roleL'), x: k => t('role_' + A.staffRole(k)), html: k => `<select class="field" data-team="role" data-k="${k}">${['therapist', 'consult'].map(v => `<option value="${v}" ${A.staffRole(k) === v ? 'selected' : ''}>${t('role_' + v)}</option>`).join('')}</select>` },
    { label: t('empType'), x: k => t('kind_' + A.staffKind(k)), html: k => `<select class="field" data-team="kind" data-k="${k}">${['staff', 'free'].map(v => `<option value="${v}" ${A.staffKind(k) === v ? 'selected' : ''}>${t('kind_' + v)}</option>`).join('')}</select>` },
    { label: t('salaryL'), num: true, z: MONEY, x: k => A.canOT(k) ? A.staffSalary(k) : '', html: k => A.canOT(k) ? `<input class="field" style="width:110px;text-align:right" inputmode="numeric" data-team="salary" data-k="${k}" value="${A.staffSalary(k)}">` : `<span class="muted">${t('ad_salaryNA')}</span>` },
    { label: t('ad_hourly'), num: true, z: MONEY, x: k => A.canOT(k) ? A.hourlyRate(k) : '', html: k => A.canOT(k) ? rm(A.hourlyRate(k), 2) : '—' },
    { label: t('canClaim'), x: k => A.canOT(k) ? t('claimsStaff') : t('claimsFree') },
    { label: t('toApprove'), num: true, x: pend, html: k => pend(k) ? pill('amber', pend(k)) : '0' },
  ];
  return head(t('team'), t('teamSub')) + dt('team', { cols, rows: keys, file: `appt4u-team-${stamp()}.xlsx`, sheet: t('team') })
    + `<p class="note gold">${icon('receipt', 16)}<span>${t('typeNote')}</span></p>`;
}

/* ------------------------------------------------------------------ commission statements */
function pComm() {
  const s = S(), lm = new Date(); lm.setDate(1); lm.setMonth(lm.getMonth() - 1);
  const stOf = r => s.approvals[r.id] || 'pending';
  const lab = { pending: ['amber', 'cl_pending'], approved: ['gold', 'approved'], paid: ['sage', 'paidSt'] };
  const cols = [
    { label: t('ad_name'), x: r => r.name, html: r => `<span class="who"><span class="avatar">${initials(r.name)}</span><b>${r.name}</b></span>` },
    { label: t('ad_details'), x: r => r.sub() },
    money('amt', t('amountRM'), r => r.amt),
    { label: t('ad_status'), x: r => t(lab[stOf(r)][1]), html: r => pill(lab[stOf(r)][0], t(lab[stOf(r)][1])) },
    { label: t('ad_actions'), html: r => `<span class="acts">${stOf(r) === 'pending' ? `<button class="btn btn-sm btn-primary" data-x="approve" data-id="${r.id}">${t('approve')}</button>` : stOf(r) === 'approved' ? `<button class="btn btn-sm btn-outline" data-x="approve" data-id="${r.id}">${t('markPaid')}</button>` : ''}</span>` },
  ];
  return head(t('commission'), t('stmtFor', { m: fMonth(lm) })) + dt('comm', { cols, rows: A.STATEMENTS, footer: true, file: `appt4u-commission-${isoDay(lm).slice(0, 7)}.xlsx`, sheet: t('commission') });
}

/* ------------------------------------------------------------------ reports */
function reportData() {
  const RP = A.RP, cur = A.agg(A.range(RP.period, 'cur')), base = A.agg(A.range(RP.period, RP.cmp));
  const scale = cur.earned / A.RANK.reduce((a, r) => a + r.rev, 0);
  const rank = A.RANK.map(r => ({ id: r.id, name: A.svc(r.id).name[L()], sessions: Math.round(r.sessions * scale), rev: Math.round(r.rev * scale / 10) * 10, profit: r.profit, growth: RP.cmp === 'ly' ? r.growth + 9 : r.growth })).sort((a, b) => b.rev - a.rev);
  const BR = A.biz('lumiere').branches, share = { cash: 0.62, earned: 0.57, close: 0.64 };
  const part = (k, i) => i === 0 ? Math.round(cur[k] * share[k]) : cur[k] - Math.round(cur[k] * share[k]);
  const branches = BR.map((n, i) => ({ n, cash: part('cash', i), earned: part('earned', i), close: part('close', i) }));
  const kpis = [['r_cash', cur.cash, base.cash, 'rm'], ['r_earned', cur.earned, base.earned, 'rm'], ['r_unused', cur.close, base.close, 'rm'], ['r_new', cur.newC, base.newC, 'n'],
    ['r_active', Math.round(cur.active), Math.round(base.active), 'n'], ['r_avg', cur.avgSpend, base.avgSpend, 'rm'], ['r_ret', cur.returning, base.returning, 'pct'], ['r_ren', cur.renewal, base.renewal, 'pct']];
  return { RP, cur, base, rank, branches, kpis };
}
const kfmt = (v, f) => f === 'rm' ? rm(v) : f === 'pct' ? v.toFixed(0) + '%' : Math.round(v);
function pReports() {
  const D = reportData(), { RP, cur, base } = D;
  const ctrl = `<div class="seg" style="width:300px">${['month', 'quarter', 'year'].map(p => `<button class="${RP.period === p ? 'on' : ''}" data-x="rp" data-k="period" data-v="${p}">${t('p_' + p)}</button>`).join('')}</div>
    <div class="seg" style="width:300px">${['prev', 'ly'].map(c => `<button class="${RP.cmp === c ? 'on' : ''}" data-x="rp" data-k="cmp" data-v="${c}">${t('c_' + c)}</button>`).join('')}</div>
    <button class="btn btn-primary btn-sm" data-x="reportXls">${icon('download', 16)} ${t('ad_exportReport')}</button>`;
  return head(t('aReports'), `${A.periodLabel(cur)} · ${t('c_' + RP.cmp)} (${A.periodLabel(base)}) · ${t('sample')}`, ctrl)
  + `<div class="ad-kpis">${D.kpis.map(([k, a, b, f]) => kcard(t(k), kfmt(a, f), f === 'pct' ? A.dPts(a, b) : A.dPct(a, b, k === 'r_unused' ? null : undefined))).join('')}</div>
  <section class="ad-card"><h2>${t('trend')}</h2><div class="ad-chart">${A.trendSVG()}</div><div class="legend"><span><i style="background:#E2C98C"></i>${t('cashL')}</span><span><i style="background:#93701F"></i>${t('earnedL')}</span></div></section>
  <div class="ad-grid2 even">
    <section class="ad-card"><h2>${t('unusedT')}</h2><p class="small muted">${t('unusedSub')}</p><table class="tbl"><tbody>
      <tr><td>${t('rf_open')}</td><td class="num">${rm(cur.open)}</td></tr><tr><td>${t('rf_sold')}</td><td class="num">${rm(cur.sold)}</td></tr><tr><td>${t('rf_used')}</td><td class="num">−${rm(cur.used)}</td></tr>
      <tr><td>${t('rf_exp')}</td><td class="num">−${rm(cur.expired)}</td></tr><tr><td>${t('rf_adj')}</td><td class="num">${cur.adj < 0 ? '−' : ''}${rm(Math.abs(cur.adj))}</td></tr><tr class="total"><td>${t('rf_close')}</td><td class="num">${rm(cur.close)}</td></tr></tbody></table></section>
    <section class="ad-card"><h2>${t('r_branch')}</h2><table class="tbl"><thead><tr><th></th><th class="num">${t('th_cash')}</th><th class="num">${t('th_earned')}</th><th class="num">${t('th_unused')}</th></tr></thead><tbody>
      ${D.branches.map((b, i) => `<tr><td><b>${b.n}</b>${i === 0 ? ` <span class="small muted">· ${t('mainTag')}</span>` : ''}</td><td class="num">${rm(b.cash)}</td><td class="num">${rm(b.earned)}</td><td class="num">${rm(b.close)}</td></tr>`).join('')}</tbody></table></section>
  </div>
  <div class="ad-grid2 even">
    <section class="ad-card"><h2>${t('ranking')}</h2><table class="tbl"><thead><tr><th></th><th class="num">${t('mt_sessions')}</th><th class="num">${t('mt_rev')}</th><th class="num">${t('mt_profit')}</th><th class="num">${t('mt_growth')}</th></tr></thead><tbody>
      ${D.rank.map((r, i) => `<tr><td>${esc(r.name)} ${i === 0 ? pill('sage', t('highest')) : i === D.rank.length - 1 ? pill('rose', t('lowest')) : ''}</td><td class="num">${r.sessions}</td><td class="num">${rm(r.rev)}</td><td class="num">${rm(r.profit)}/h</td><td class="num ${r.growth < 0 ? 't-bad' : ''}">${r.growth > 0 ? '+' : ''}${r.growth}%</td></tr>`).join('')}</tbody></table></section>
    <section class="ad-card"><h2>${t('quad')}</h2><div class="ad-chart">${A.quadSVG()}</div><p class="small muted">${t('quadNote')}</p></section>
  </div>
  <section class="ad-card"><h2>${t('topCust')}</h2><table class="tbl"><thead><tr><th></th><th class="num">${t('c_spend')}</th><th class="num">${t('c_visits')}</th><th class="num">${t('c_avg')}</th></tr></thead><tbody>
    ${A.MEMBERS.slice().sort((a, b) => b.ltv - a.ltv).slice(0, 8).map(m => `<tr><td><b>${esc(m.name)}</b></td><td class="num">${rm(m.ltv)}</td><td class="num">${m.visits}</td><td class="num">${rm(m.ltv / Math.max(1, m.visits))}</td></tr>`).join('')}</tbody></table>
    <p class="note gold">${icon('users', 16)}<span>${t('conc', { p: '41%' })}</span></p></section>`;
}
function reportXls() {
  const D = reportData(), { cur, base } = D;
  const pct = (a, b) => b ? Math.round((a - b) / b * 1000) / 10 : '';
  downloadBook(`appt4u-report-${D.RP.period}-${stamp()}.xlsx`, [
    [t('ad_summary'), X => sheetOf(X, [{ xh: t('ad_metric'), x: r => t(r[0]), w: 32 }, { xh: A.periodLabel(cur), x: r => r[3] === 'pct' ? Math.round(r[1] * 10) / 10 : r[3] === 'rm' ? Math.round(r[1] * 100) / 100 : Math.round(r[1]) }, { xh: `${t('ad_compare')}: ${A.periodLabel(base)}`, x: r => r[3] === 'pct' ? Math.round(r[2] * 10) / 10 : r[3] === 'rm' ? Math.round(r[2] * 100) / 100 : Math.round(r[2]) }, { xh: t('ad_change') + ' %', x: r => pct(r[1], r[2]), z: '0.0' }], D.kpis)],
    [t('ad_trendSheet'), X => sheetOf(X, [{ xh: t('ad_month'), x: m => fMonth(m.d), w: 12 }, { xh: t('cashL'), x: m => m.cash, z: MONEY, sum: true }, { xh: t('earnedL'), x: m => m.earned, z: MONEY, sum: true }, { xh: t('rf_sold'), x: m => m.sold, z: MONEY, sum: true }, { xh: t('rf_used'), x: m => m.used, z: MONEY, sum: true }, { xh: t('rf_exp'), x: m => m.expired, z: MONEY, sum: true }, { xh: t('rf_close'), x: m => m.close, z: MONEY }, { xh: t('r_active'), x: m => m.active }, { xh: t('r_new'), x: m => m.newC, sum: true }], A.SERIES.slice(-13), true)],
    [t('unusedT'), X => sheetAOA(X, [[t('unusedT'), A.periodLabel(cur)], [t('rf_open'), cur.open], [t('rf_sold'), cur.sold], [t('rf_used'), -cur.used], [t('rf_exp'), -cur.expired], [t('rf_adj'), cur.adj], [t('rf_close'), cur.close]], [34, 16])],
    [t('r_branch'), X => sheetOf(X, [{ xh: t('branches'), x: b => b.n, w: 16 }, { xh: t('th_cash'), x: b => b.cash, z: MONEY, sum: true }, { xh: t('th_earned'), x: b => b.earned, z: MONEY, sum: true }, { xh: t('th_unused'), x: b => b.close, z: MONEY, sum: true }], D.branches, true)],
    [t('ranking'), X => sheetOf(X, [{ xh: t('ad_treatment'), x: r => r.name, w: 30 }, { xh: t('mt_sessions'), x: r => r.sessions, sum: true }, { xh: t('mt_rev'), x: r => r.rev, z: MONEY, sum: true }, { xh: t('mt_profit'), x: r => r.profit, z: MONEY }, { xh: t('mt_growth') + ' %', x: r => r.growth }], D.rank, true)],
    [t('topCust'), X => sheetOf(X, [{ xh: t('ad_name'), x: m => m.name, w: 20 }, { xh: t('c_spend'), x: m => m.ltv, z: MONEY }, { xh: t('c_visits'), x: m => m.visits }, { xh: t('c_avg'), x: m => Math.round(m.ltv / Math.max(1, m.visits) * 100) / 100, z: MONEY }], A.MEMBERS.slice().sort((a, b) => b.ltv - a.ltv))],
  ]);
}

/* ------------------------------------------------------------------ time & cancellations */
function timingRows() {
  const D = A.timingData();
  const treat = D.treat.map(r => Object.assign({ s: A.svc(r.sid) }, r)).filter(r => r.s).map(r => Object.assign(r, { name: r.s.name[L()], plan: r.s.mins, actual: Math.round(r.avg), diff: Math.round(r.avg) - r.s.mins })).sort((a, b) => b.diff - a.diff);
  const late = Object.values(D.late).filter(r => r.late > 0).map(r => Object.assign({ name: A.member(r.cid).name, avg: Math.round(r.sum / r.late) }, r)).sort((a, b) => b.late / b.visits - a.late / a.visits);
  const last = Object.values(D.last).map(r => Object.assign({ name: A.member(r.cid).name }, r)).sort((a, b) => b.last - a.last);
  const staff = Object.keys(D.staff).map(k => Object.assign({ k, name: A.staffName(k), kind: t('kind_' + A.staffKind(k)), id: A.STAFF[k].id }, D.staff[k]));
  const cx = ['client', 'staff', 'owner'].map(k => ({ who: t('W_' + k), total: D.cx[k][0], last: D.cx[k][1] }));
  return { D, treat, late, last, staff, cx };
}
function pTiming() {
  const R = timingRows(), D = R.D, worst = R.treat[0];
  const tb = (heads, rows) => `<table class="tbl"><thead><tr>${heads.map((h, i) => `<th class="${i ? 'num' : ''}">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  return head(t('tmTitle'), `${t('tmSub')} · ${t('tm90')}`, `<button class="btn btn-primary btn-sm" data-x="timingXls">${icon('download', 16)} ${t('ad_exportReport')}</button>`)
  + (D.events.length ? `<section class="ad-card"><h2>${t('tmToday')}</h2><div>${D.events.map(e => `<div class="ev"><span class="ev-t">${hm(e.at)}</span><span>${e.txt}</span></div>`).join('')}</div></section>` : '')
  + `<p class="note gold">${icon('clock', 16)}<span>${t('tmLost', { h: (D.lost / 60).toFixed(1), n: Math.floor(D.lost / 70) })}</span></p>
  <div class="ad-grid2 even">
    <section class="ad-card"><h2>${t('tmTreat')}</h2>${tb(['', t('th_plan'), t('th_actual'), t('th_diff')], R.treat.map(r => `<tr><td>${esc(r.name)}</td><td class="num">${r.plan}</td><td class="num">${r.actual}</td><td class="num ${r.diff > 5 ? 't-bad' : ''}">${r.diff > 0 ? '+' : ''}${r.diff}</td></tr>`))}
      ${worst && worst.diff > 5 ? `<p class="note rose">${icon('sparkle', 16)}<span>${t('tmInsight', { s: worst.s.short ? worst.s.short[L()] : worst.name, n: worst.diff, m: Math.ceil(worst.avg / 5) * 5 })}</span></p>` : ''}</section>
    <section class="ad-card"><h2>${t('tmStaff')}</h2>${tb(['', t('th_lateStart'), t('th_overrun'), t('th_cx')], R.staff.map(r => `<tr><td><b>${r.name}</b> <span class="small muted">${r.kind} · ${r.id}</span></td><td class="num">${r.late}</td><td class="num">+${r.over} min</td><td class="num">${r.cx}</td></tr>`))}</section>
  </div>
  <div class="ad-grid2 even">
    <section class="ad-card"><h2>${t('tmLateCust')}</h2>${tb(['', t('th_lateVisits'), t('th_avgLate')], R.late.map(r => `<tr><td><b>${esc(r.name)}</b></td><td class="num">${r.late} / ${r.visits}</td><td class="num t-bad">${r.avg} min</td></tr>`))}<p class="small muted">${t('tmLateTip')}</p></section>
    <section class="ad-card"><h2>${t('tmCancel')}</h2>${tb(['', t('th_total'), t('th_lastMin')], R.cx.map(r => `<tr><td>${r.who}</td><td class="num">${r.total}</td><td class="num">${r.last}</td></tr>`))}
      <h3 class="label" style="padding-top:4px">${t('tmCxCust')}</h3>${tb(['', t('th_lastMin'), t('th_noShow')], R.last.map(r => `<tr><td><b>${esc(r.name)}</b></td><td class="num">${r.last}</td><td class="num">${r.noshow}</td></tr>`))}</section>
  </div>`;
}
function timingXls() {
  const R = timingRows();
  downloadBook(`appt4u-time-cancellations-${stamp()}.xlsx`, [
    [`${t('ad_treatment')} · ${t('ad_time')}`, X => sheetOf(X, [{ xh: t('ad_treatment'), x: r => r.name, w: 32 }, { xh: t('th_plan') + ' (min)', x: r => r.plan }, { xh: t('th_actual') + ' (min)', x: r => r.actual }, { xh: t('th_diff') + ' (min)', x: r => r.diff }, { xh: 'n', x: r => r.n }], R.treat)],
    [t('tmLateCust'), X => sheetOf(X, [{ xh: t('ad_client'), x: r => r.name, w: 20 }, { xh: t('ad_lateC').replace(/ \(.*\)/, ''), x: r => r.late }, { xh: t('c_visits'), x: r => r.visits }, { xh: t('th_avgLate') + ' (min)', x: r => r.avg }], R.late)],
    [t('tmCancel'), X => sheetOf(X, [{ xh: t('cxBy'), x: r => r.who, w: 18 }, { xh: t('th_total'), x: r => r.total, sum: true }, { xh: t('th_lastMin'), x: r => r.last, sum: true }], R.cx, true)],
    [t('th_lastMin'), X => sheetOf(X, [{ xh: t('ad_client'), x: r => r.name, w: 20 }, { xh: t('th_lastMin'), x: r => r.last }, { xh: t('th_noShow'), x: r => r.noshow }], R.last)],
    [t('tmStaff'), X => sheetOf(X, [{ xh: t('ad_name'), x: r => r.name }, { xh: 'ID', x: r => r.id }, { xh: t('empType'), x: r => r.kind }, { xh: t('th_lateStart'), x: r => r.late }, { xh: t('th_overrun') + ' (min)', x: r => r.over }, { xh: t('th_cx'), x: r => r.cx }], R.staff)],
    [t('tmToday'), X => sheetOf(X, [{ xh: t('ad_time'), x: e => hm(e.at) }, { xh: t('ad_details'), x: e => plain(e.txt), w: 70 }], R.D.events)],
  ]);
}

/* ------------------------------------------------------------------ settings */
function pSettings() {
  const s = S(), BR = A.biz('lumiere').branches;
  return head(t('settings'), 'Lumière Skin Studio')
  + `<div class="set-grid">
    <section class="ad-card"><h2>${t('branches')}</h2><p class="muted">${BR.map((n, i) => i === 0 ? `${n} (${t('mainTag')})` : n).join(' · ')}</p>
      <p class="label">${t('br_rule')}</p><div class="stack-xs">${['all', 'origin'].map(k => `<button class="opt ${s.branchRule === k ? 'on' : ''}" data-x="branchRule" data-k="${k}"><span class="radio"></span><span>${t('br_' + k)}</span></button>`).join('')}</div>
      ${s.branchRule === 'all' ? `<p class="small muted">${t('br_allNote')}</p>` : ''}</section>
    <section class="ad-card"><h2>${t('ad_rules')}</h2><div>${[['set_window', 'v_7d'], ['set_cut', 'v_12h'], ['set_grace', 'v_15m'], ['set_buffer', 'v_buf'], ['set_expiry', 'v_6m'], ['set_rem', 'v_rem']].map(([a, b]) => `<div class="statrow"><span>${t(a)}</span><b>${t(b)}</b></div>`).join('')}</div><p class="small muted">${t('editFull')}</p></section>
    <section class="ad-card"><h2>${t('language')}</h2><div class="stack-xs">${A.LANGS.map(([k, n]) => `<button class="opt ${k === L() ? 'on' : ''}" data-x="lang" data-l="${k}"><span class="radio"></span><span>${n}</span></button>`).join('')}</div></section>
    <section class="ad-card"><h2>${t('ad_demo')}</h2><p class="muted">${t('ad_sample')}</p><div class="row-start gap8"><a class="btn btn-outline" href="../#/a/today">${icon('phone', 18)} ${t('ad_phone')}</a><button class="btn btn-ghost" data-x="resetAsk">${t('resetDemo')}</button></div></section>
  </div>`;
}

/* ------------------------------------------------------------------ shell & router */
let NAV = [['/', 'home', 'ad_dash'], ['/appointments', 'calendar', 'ad_appts'], ['/members', 'users', 'aMembers'], ['/invoices', 'doc', 'invoices'], ['/claims', 'receipt', 'claimsT'],
  ['/team', 'user', 'team'], ['/commission', 'coins', 'commission'], ['/reports', 'chart', 'aReports'], ['/timing', 'clock', 'tmTitle'], ['/settings', 'settings', 'settings']];
let PAGES = [[/^\/$/, pDash], [/^\/appointments$/, pAppts], [/^\/members$/, pMembers], [/^\/members\/(\w+)$/, pMember], [/^\/invoices$/, pInvoices], [/^\/invoices\/new$/, () => pInvEdit(null)],
  [/^\/invoices\/(\w+)\/edit$/, pInvEdit], [/^\/invoices\/(\w+)$/, pInvoice], [/^\/claims$/, pClaims], [/^\/team$/, pTeam], [/^\/commission$/, pComm],
  [/^\/reports$/, pReports], [/^\/timing$/, pTiming], [/^\/settings$/, pSettings]];
const route = () => (location.hash.replace(/^#/, '') || '/').split('?')[0];
let lastPath = null;
const navLabel = k => typeof k === 'function' ? k() : t(k);
const SIDE = {
  title: 'appt4u Admin',
  tag: () => t('ad_full'),
  card: () => `<div class="ad-biz">Lumière Skin Studio<br><span>Bangsar · Subang Jaya</span></div>`,
  badges: () => { const s = S(); return { '/claims': s.claims.filter(c => c.status === 'pending').length, '/invoices': s.invoices.filter(x => A.invStatus(x) === 'overdue').length }; },
  foot: () => `<a class="btn btn-sm btn-outline" href="../#/a/today">${icon('phone', 16)} ${t('ad_phone')}</a><p class="small muted">${t('ad_sample')}</p>`,
};
function sideHtml(path) {
  const badge = SIDE.badges();
  const active = path === '/' ? '/' : (NAV.find(n => n[0] !== '/' && (path === n[0] || path.startsWith(n[0] + '/'))) || [''])[0];
  return `<aside class="ad-side"><a class="ad-logo" href="#/"><img src="../icons/logo.png" alt="appt4u" width="139" height="38" style="height:38px;width:auto;align-self:flex-start;object-fit:contain"><span class="ad-tag">${SIDE.tag()}</span></a>
    ${SIDE.card()}
    <nav class="ad-nav">${NAV.map(([h, ic, k]) => `<a class="${active === h ? 'on' : ''}" href="#${h}">${icon(ic, 19)}<span>${navLabel(k)}</span>${badge[h] ? `<span class="badge">${badge[h]}</span>` : ''}</a>`).join('')}</nav>
    <div class="ad-side-foot"><div class="langseg">${A.LANGS.map(([k, , sh]) => `<button class="${k === L() ? 'on' : ''}" data-x="lang" data-l="${k}">${sh}</button>`).join('')}</div>
      ${SIDE.foot()}</div></aside>`;
}
function render() {
  const path = route();
  let html = null;
  for (const [re, fn] of PAGES) { const m = path.match(re); if (m) { html = fn(...m.slice(1)); break; } }
  if (html == null) { location.hash = '#/'; return; }
  const ae = document.activeElement, focusSel = ae && ae.dataset && ae.dataset.dq != null ? `[data-dq][data-dt="${ae.dataset.dt}"]` : null, caret = focusSel ? ae.selectionStart : 0;
  const y = window.scrollY, same = lastPath === path;
  ROOT.innerHTML = `<div class="ad">${sideHtml(path)}<main class="ad-main" id="adMain">${html}</main></div>`;
  document.title = `${navLabel(((NAV.find(n => n[0] === path) || NAV.find(n => n[0] !== '/' && path.startsWith(n[0]))) || NAV[0])[2])} · ${SIDE.title}`;
  if (focusSel) { const el = $(focusSel); if (el) { el.focus(); try { el.setSelectionRange(caret, caret); } catch (e) { /* ignore */ } } }
  window.scrollTo(0, same ? y : 0);
  lastPath = path;
}

/* ------------------------------------------------------------------ actions */
const X_ = {
  closeModal,
  lang: el => { A.setLang(el.dataset.l); render(); },
  sort: el => { const st = TB[el.dataset.dt], i = Number(el.dataset.i); if (!st) return; if (st.sort === i) st.dir = -st.dir; else { st.sort = i; st.dir = 1; } render(); },
  export: el => exportDT(el.dataset.dt),
  print: () => window.print(),
  checkin: el => { A.recLog(el.dataset.id, { arr: new Date().toISOString() }); A.save(); render(); toast(t('arrivedSt')); },
  cxSheet: el => {
    const a = A.findAppt(el.dataset.id); if (!a) return;
    const past = a.start < new Date();
    const opts = (past ? [['noshow', 'cx_noshow']] : []).concat([['client', 'cx_client'], ['staff', 'cx_staffA'], ['owner', 'cx_owner']]);
    const hrs = (a.start - Date.now()) / 36e5;
    modal(`<h2>${t('cxTitle')}</h2><p class="muted">${esc(a.name)} · ${esc(a.client)} · ${hm(a.start)}</p>${hrs >= 0 && hrs < 12 ? `<p class="note rose">${icon('clock', 16)}<span>${t('cxLast')}</span></p>` : ''}
      <div class="stack-xs">${opts.map(([k, l]) => `<button class="opt" data-x="cxDo" data-id="${a.id}" data-by="${k}"><span class="grow">${t(l)}</span>${icon('chevR', 16)}</button>`).join('')}</div>
      <button class="btn btn-ghost" data-x="closeModal">${t('keep')}</button>`);
  },
  cxDo: el => { if (A.cancelAppt(el.dataset.id, el.dataset.by)) { closeModal(); render(); toast(t('cxToast')); } },
  invFor: el => { ED = newDraft(el.dataset.id); location.hash = '#/invoices/new'; },
  vAdd: el => modal(A.recordFormHtml(null, 'x', { mid: el.dataset.mid })),
  vEdit: el => { const v = S().visits.find(x => x.id === el.dataset.id); if (v) modal(A.recordFormHtml(v, 'x')); },
  vComment: el => { const v = S().visits.find(x => x.id === el.dataset.id); if (v) modal(A.commentFormHtml(v, 'x')); },
  vSave: el => { const k = A.saveRecordFromForm(el.dataset.id, el.dataset.mid, el.dataset.th, OWNER); if (k === 'tr_need') { toast(t(k)); return; } closeModal(); render(); toast(t(k)); },
  vCommentSave: el => { const k = A.saveCommentFromForm(el.dataset.id, OWNER); if (!k) return; closeModal(); render(); toast(t(k)); },
  memEdit: el => {
    const id = el.dataset.id, c = A.mContact(id);
    const f = (k, label, ph, type) => `<label class="ed-col"><span class="label">${label}</span><input class="field" id="me-${k}" value="${esc(c[k] || '')}" placeholder="${ph || ''}" ${type ? `type="${type}"` : ''} autocomplete="off"></label>`;
    modal(`<h2>${t('editMember')}</h2>${f('name', t('f_name'))}<div class="ed-grid">${f('phone', t('f_phone'), '+60 12-000 0000', 'tel')}${f('email', t('f_email'), 'name@example.com', 'email')}</div>
      ${f('wechat', t('f_wechat'))}<div class="ed-grid">${f('fb', 'Facebook', 'facebook.com/…')}${f('ig', 'Instagram', '@…')}</div>
      <p class="note gold">${icon('users', 16)}<span>${t('contactPrivacy')}</span></p>
      <div class="row-start gap8"><button class="btn btn-primary" data-x="memSave" data-id="${id}">${t('save')}</button><button class="btn btn-ghost" data-x="closeModal">${t('notNow')}</button></div>`);
  },
  memSave: el => {
    const v = k => ((document.getElementById('me-' + k) || {}).value || ''), c = { name: v('name') };
    A.CONTACT_KEYS.forEach(k => { c[k] = v(k); });
    if (!c.name.trim()) { toast(t('needName')); return; }
    if (A.setMemberContact(el.dataset.id, c)) { closeModal(); render(); toast(t('memberSaved')); }
  },
  invTemplate: () => downloadTemplate(),
  invIssue: el => { const x = S().invoices.find(v => v.id === el.dataset.id); if (!x) return; x.status = 'issued'; A.save(); render(); toast(t('invIssued', { n: x.no })); },
  invPaySheet: el => modal(`<h2>${t('payHow')}</h2><div class="stack-xs">${['cash', 'card', 'duitnow', 'ewallet'].map(k => `<button class="opt" data-x="invPay" data-id="${el.dataset.id}" data-m="${k}">${icon('cash', 20)}<span>${t('m_' + k)}</span></button>`).join('')}</div><button class="btn btn-ghost" data-x="closeModal">${t('notNow')}</button>`),
  invPay: el => { const x = S().invoices.find(v => v.id === el.dataset.id); if (!x) return; x.status = 'paid'; x.paidAt = new Date().toISOString(); x.method = el.dataset.m; A.save(); closeModal(); render(); toast(t('inv_paid')); },
  invDup: el => { const x = S().invoices.find(v => v.id === el.dataset.id); if (!x) return; ED = Object.assign(newDraft(x.mid), { name: x.name || '', contact: x.contact || '', items: JSON.parse(JSON.stringify(x.items)), discount: x.discount ? String(x.discount) : '', sst: !!x.sst, notes: x.notes || '' }); location.hash = '#/invoices/new'; },
  invDelete: el => { const s = S(), i = s.invoices.findIndex(v => v.id === el.dataset.id); if (i < 0 || s.invoices[i].status !== 'draft') return; s.invoices.splice(i, 1); A.save(); location.hash = '#/invoices'; toast(t('ad_deleted')); },
  invExcel: el => {
    const x = S().invoices.find(v => v.id === el.dataset.id); if (!x) return;
    const T = A.invTotals(x);
    downloadBook(`${x.no}.xlsx`, [[x.no, X => sheetAOA(X, [
      [A.BIZ_INFO.name], [A.BIZ_INFO.addr], [], [t('invoiceWord'), x.no], [t('invDate'), fFull(x.date)], [t('dueL'), fFull(x.due)], [t('billTo'), invCust(x)], [t('ad_contact'), invContact(x)], [t('ad_status'), t('inv_' + INV_ST(x))], [],
      [t('items'), t('qty'), t('unitPrice') + ' (RM)', 'RM'], ...x.items.map(l => [A.invLineName(l), Number(l.qty) || 0, Number(l.price) || 0, (Number(l.qty) || 0) * (Number(l.price) || 0)]), [],
      ['', '', t('subtotal'), T.sub], ['', '', t('discL'), T.disc ? -T.disc : 0], ['', '', 'SST 8%', T.sst], ['', '', t('total'), T.total], ['', '', t('amountDue'), x.status === 'paid' ? 0 : T.total], [], [x.notes || ''],
    ], [36, 12, 18, 14], [2, 3])]]);
  },
  edRemove: el => { ED.items.splice(Number(el.dataset.i), 1); render(); },
  edSave: el => saveDraft(el.dataset.s === 'issued' ? 'issued' : 'draft'),
  clSet: el => { const c = S().claims.find(x => x.id === el.dataset.id); if (!c) return; c.status = el.dataset.s; A.save(); render(); toast(t('cl_' + c.status)); },
  approve: el => { const s = S(), id = el.dataset.id; s.approvals[id] = s.approvals[id] ? 'paid' : 'approved'; A.save(); render(); },
  rp: el => { A.RP[el.dataset.k] = el.dataset.v; render(); },
  reportXls: () => reportXls(),
  timingXls: () => timingXls(),
  branchRule: el => { S().branchRule = el.dataset.k === 'origin' ? 'origin' : 'all'; A.save(); render(); },
  resetAsk: () => modal(`<h2>${t('resetQ')}</h2><p class="muted">${t('resetInfo')}</p><div class="row-start gap8"><button class="btn btn-primary" data-x="resetDo">${t('resetDemo')}</button><button class="btn btn-ghost" data-x="closeModal">${t('notNow')}</button></div>`),
  resetDo: () => { A.reset(); ED = null; Object.keys(TB).forEach(k => delete TB[k]); closeModal(); render(); toast(t('ad_resetDone')); },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-x]'); if (!el) return;
  const fn = X_[el.dataset.x]; if (!fn) return;
  e.preventDefault(); fn(el, e);
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.dq != null) { const st = TB[el.dataset.dt]; if (st) { st.q = el.value; render(); } return; }
  if (ED && el.dataset.ed) { ED[el.dataset.ed] = el.value; refreshPreview(); return; }
  if (ED && el.dataset.li != null) { const l = ED.items[Number(el.dataset.li)]; if (l) { l[el.dataset.lf] = el.value; refreshPreview(); } }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.classList.contains('dt-filter')) { const st = TB[el.dataset.dt]; if (st) { st.f[el.dataset.fk] = el.value; render(); } return; }
  if (el.id === 'edCust' && ED) { ED.mid = el.value || null; render(); return; }
  if (el.id === 'edSst' && ED) { ED.sst = el.checked; refreshPreview(); return; }
  if (el.id === 'edAdd' && ED && el.value) {
    const v = el.value, ref = v === 'custom' ? null : v, it = ref ? (ref.startsWith('p:') ? A.product(ref.slice(2)) : A.svc(ref.slice(2))) : null;
    ED.items.push({ ref, label: '', qty: 1, price: it ? it.price : 0 }); render(); return;
  }
  if (el.id === 'impFile') { const f = el.files && el.files[0]; el.value = ''; if (f) importInvoices(f); return; }
  if (el.dataset.team) {
    const k = el.dataset.k, s = S(); s.team[k] = Object.assign(s.team[k] || {}, {});
    if (el.dataset.team === 'kind') s.team[k].kind = el.value === 'staff' ? 'staff' : 'free';
    else if (el.dataset.team === 'role') s.team[k].role = el.value === 'consult' ? 'consult' : 'therapist';
    else if (el.dataset.team === 'salary') { const v = Math.round(Number(el.value)); if (v > 0) s.team[k].salary = v; }
    A.save(); render();
    if (el.dataset.team === 'kind') toast(t('typeChanged', { n: A.staffName(k), k: t('kind_' + A.staffKind(k)) }));
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
window.addEventListener('hashchange', render);
/* the phone app in another tab changed the demo data or the language */
window.addEventListener('storage', e => {
  if (e.key === KEY) { A.reload(); render(); }
  else if (e.key === 'appt4u-lang') { try { A.setLang(JSON.parse(e.newValue)); } catch (err) { /* ignore */ } render(); }
});
/* the same shell runs the platform console (platform/index.html), which plugs in its own pages */
const CONSOLE = document.documentElement.dataset.console === 'platform' ? 'platform' : 'business';
window.A4UC = {
  dt, head, kcard, pill, toast, modal, closeModal, downloadBook, sheetOf, sheetAOA, money, MONEY, DATEF, serial, sum, stamp, plain, dayOf, TB, render,
  use(cfg) { NAV = cfg.nav; PAGES = cfg.pages; Object.assign(X_, cfg.actions || {}); Object.assign(SIDE, cfg.side || {}); },
};
if (CONSOLE === 'business') render();
})();
