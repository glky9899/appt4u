/* appt4u platform console — for the appt4u team that runs the platform:
   every business on appt4u, sign-up approvals, subscriptions, user accounts, support and growth.
   Uses the admin console shell (../admin/admin.js → window.A4UC) and app helpers (../app.js → window.A4U). */
(() => {
'use strict';
const A = window.A4U, C = window.A4UC;
if (!A || !C) return;
const { esc, icon, rm, fDate, fFull, fMonth, today0, addDays, isoDay, initials } = A;
const { dt, head, kcard, pill, toast, modal, closeModal, downloadBook, sheetOf, money, MONEY, sum, stamp } = C;
const L = () => A.lang;
const $ = s => document.querySelector(s);

/* ------------------------------------------------------------------ words (EN / 中文 / BM); anything not here comes from the app */
const P = {
  p_tag: ['Platform manager', '平台管理', 'Pengurus platform'],
  p_team: ['appt4u platform team', 'appt4u 平台团队', 'Pasukan platform appt4u'],
  p_you: ['Signed in as platform manager', '以平台管理员身份登录', 'Log masuk sebagai pengurus platform'],
  p_over: ['Overview', '平台概览', 'Gambaran keseluruhan'], p_biz: ['Businesses', '商家', 'Perniagaan'], p_apps: ['Applications', '入驻申请', 'Permohonan'],
  p_bill: ['Subscriptions', '订阅与账单', 'Langganan'], p_users: ['Users & access', '用户与权限', 'Pengguna & akses'], p_sup: ['Support', '客服工单', 'Sokongan'],
  p_rep: ['Growth reports', '增长报表', 'Laporan pertumbuhan'], p_set: ['Platform settings', '平台设置', 'Tetapan platform'], p_log: ['Activity log', '操作记录', 'Log aktiviti'],
  p_sub: ['Every business on appt4u', 'appt4u 上的所有商家', 'Semua perniagaan di appt4u'],
  k_active: ['Active businesses', '使用中的商家', 'Perniagaan aktif'], k_mrr: ['Monthly subscription revenue', '月订阅收入', 'Hasil langganan bulanan'],
  k_book: ['Bookings, last 30 days', '近 30 天预约', 'Tempahan, 30 hari lepas'], k_gmv: ['Sales through appt4u, 30 days', '近 30 天经 appt4u 的销售额', 'Jualan melalui appt4u, 30 hari'],
  k_trials: ['On free trial', '免费试用中', 'Dalam percubaan percuma'], k_pend: ['Applications to review', '待审核申请', 'Permohonan untuk disemak'],
  k_over: ['Overdue subscriptions', '逾期订阅', 'Langganan tertunggak'], k_open: ['Open support tickets', '未解决工单', 'Tiket sokongan terbuka'],
  newThisMonth: ['New this month: {n}', '本月新增 {n}', 'Baharu bulan ini: {n}'],
  att_apps: ['New businesses waiting for approval: {n}', '{n} 家新商家等待审批', 'Perniagaan baharu menunggu kelulusan: {n}'],
  att_over: ['Overdue subscriptions: {n}', '{n} 个订阅逾期', 'Langganan tertunggak: {n}'],
  att_trial: ['Free trials ending within 7 days: {n}', '{n} 个试用将在 7 天内结束', 'Percubaan tamat dalam 7 hari: {n}'],
  att_urgent: ['Urgent support tickets: {n}', '{n} 个紧急工单', 'Tiket sokongan segera: {n}'],
  att_idle: ['Businesses inactive for 14+ days: {n}', '{n} 家商家超过 14 天未使用', 'Perniagaan tidak aktif 14+ hari: {n}'],
  mrrChart: ['Subscription revenue · 12 months', '订阅收入 · 12 个月', 'Hasil langganan · 12 bulan'], bizChart: ['Active businesses · 12 months', '使用中的商家 · 12 个月', 'Perniagaan aktif · 12 bulan'],
  topBiz: ['Busiest businesses', '最活跃的商家', 'Perniagaan paling sibuk'],
  c_business: ['Business', '商家', 'Perniagaan'], c_owner: ['Owner', '负责人', 'Pemilik'], c_plan: ['Plan', '方案', 'Pelan'], c_city: ['City', '城市', 'Bandar'],
  c_cat: ['Category', '类别', 'Kategori'], c_outlets: ['Outlets', '分店', 'Cawangan'], c_staff: ['Staff', '员工', 'Staf'], c_members: ['Customers', '顾客', 'Pelanggan'],
  c_book: ['Bookings 30d', '30 天预约', 'Tempahan 30h'], c_sales: ['Sales 30d', '30 天销售额', 'Jualan 30h'], c_last: ['Last active', '最近使用', 'Aktif terakhir'],
  c_renew: ['Renewal', '续费日', 'Pembaharuan'], c_joined: ['Joined', '加入日期', 'Sertai'],
  c_email: ['Email', '电邮', 'E-mel'], c_phone: ['Phone', '电话', 'Telefon'], c_ssm: ['SSM no.', 'SSM 注册号', 'No. SSM'], c_docs: ['Documents', '文件', 'Dokumen'],
  c_submitted: ['Submitted', '提交日期', 'Dihantar'], c_period: ['Period', '期间', 'Tempoh'], c_role: ['Role', '角色', 'Peranan'], c_login: ['Last login', '最近登录', 'Log masuk terakhir'],
  c_2fa: ['2-step login', '两步验证', 'Log masuk 2 langkah'], c_subject: ['Subject', '主题', 'Subjek'], c_prio: ['Priority', '优先级', 'Keutamaan'], c_assigned: ['Assigned to', '负责人', 'Ditugaskan kepada'],
  c_updated: ['Last update', '最近更新', 'Kemas kini terakhir'], c_when: ['When', '时间', 'Bila'], c_who: ['By', '操作人', 'Oleh'], c_action: ['Action', '操作', 'Tindakan'],
  daysAgoN: ['{n} d ago', '{n} 天前', '{n} hari lalu'], todayW: ['Today', '今天', 'Hari ini'],
  st_active: ['Active', '使用中', 'Aktif'], st_trial: ['Free trial', '免费试用', 'Percubaan percuma'], st_suspended: ['Suspended', '已停用', 'Digantung'],
  st_pending: ['Waiting for review', '待审核', 'Menunggu semakan'], st_rejected: ['Rejected', '已拒绝', 'Ditolak'], st_approved: ['Approved', '已批准', 'Diluluskan'],
  st_paid: ['Paid', '已付', 'Dibayar'], st_due: ['Due', '待付', 'Perlu dibayar'], st_overdue: ['Overdue', '逾期', 'Tertunggak'],
  st_open: ['Open', '待处理', 'Terbuka'], st_progress: ['In progress', '处理中', 'Sedang diproses'], st_resolved: ['Resolved', '已解决', 'Selesai'], st_disabled: ['Disabled', '已停用', 'Dinyahaktifkan'],
  pl_starter: ['Starter', '入门版', 'Permulaan'], pl_growth: ['Growth', '成长版', 'Pertumbuhan'], pl_pro: ['Pro', '专业版', 'Pro'],
  pr_high: ['High', '高', 'Tinggi'], pr_normal: ['Normal', '普通', 'Biasa'], pr_low: ['Low', '低', 'Rendah'],
  tc_billing: ['Billing', '账单', 'Bil'], tc_tech: ['Technical', '技术', 'Teknikal'], tc_account: ['Account', '账户', 'Akaun'],
  ro_owner: ['Owner', '老板', 'Pemilik'], ro_admin: ['Admin', '管理员', 'Admin'], ro_staff: ['Staff', '员工', 'Staf'], ro_free: ['Freelancer', '自由职业', 'Pekerja bebas'], ro_agent: ['Agent', '代理', 'Ejen'],
  ro_super: ['Super admin', '超级管理员', 'Super admin'], ro_support: ['Support', '客服', 'Sokongan'], ro_finance: ['Finance', '财务', 'Kewangan'],
  on: ['On', '开', 'Hidup'], off: ['Off', '关', 'Mati'],
  view: ['View', '查看', 'Lihat'], approveB: ['Approve', '批准', 'Luluskan'], rejectB: ['Reject', '拒绝', 'Tolak'], askInfo: ['Ask for documents', '要求补充文件', 'Minta dokumen'],
  suspend: ['Suspend', '停用', 'Gantung'], reactivate: ['Reactivate', '恢复使用', 'Aktifkan semula'], changePlan: ['Change plan', '更改方案', 'Tukar pelan'],
  extendTrial: ['Extend trial 14 days', '延长试用 14 天', 'Lanjutkan percubaan 14 hari'], startPaid: ['Start paid plan', '转为付费', 'Mula pelan berbayar'],
  openAdmin: ['Open business admin', '打开商家后台', 'Buka admin perniagaan'], message: ['Send message', '发送信息', 'Hantar mesej'],
  remind: ['Send reminder', '发送提醒', 'Hantar peringatan'], markPaidP: ['Mark paid', '标记已付', 'Tanda dibayar'],
  disable: ['Disable', '停用', 'Nyahaktif'], enable: ['Enable', '启用', 'Aktifkan'], resetPw: ['Reset password', '重置密码', 'Set semula kata laluan'],
  reply: ['Reply', '回复', 'Balas'], send: ['Send', '发送', 'Hantar'], assignMe: ['Assign to me', '分配给我', 'Tugaskan kepada saya'],
  profile: ['Business profile', '商家资料', 'Profil perniagaan'], subscription: ['Subscription', '订阅', 'Langganan'], usage: ['Usage', '使用情况', 'Penggunaan'],
  features: ['Features switched on', '已开通功能', 'Ciri yang dihidupkan'], activity: ['Recent activity', '最近动态', 'Aktiviti terkini'],
  f_online: ['Online payments', '在线付款', 'Bayaran dalam talian'], f_wa: ['WhatsApp reminders', 'WhatsApp 提醒', 'Peringatan WhatsApp'], f_multi: ['Multi-branch', '多分店', 'Berbilang cawangan'], f_api: ['API access', 'API 接口', 'Akses API'],
  seats: ['Staff seats', '员工席位', 'Tempat staf'], outletsUsed: ['Outlets', '分店', 'Cawangan'], smsUsed: ['SMS sent this month', '本月短信', 'SMS dihantar bulan ini'],
  price: ['Price / month', '月费', 'Harga / bulan'], nextRenew: ['Next renewal', '下次续费', 'Pembaharuan seterusnya'], trialEnds: ['Trial ends', '试用结束', 'Percubaan tamat'],
  payMethodP: ['Pays by', '付款方式', 'Bayar dengan'], card: ['Card', '刷卡', 'Kad'], fpx: ['Online banking (FPX)', '网银（FPX）', 'Perbankan dalam talian (FPX)'],
  platInv: ['Platform invoices', '平台账单', 'Invois platform'], mrr: ['MRR', '月经常性收入', 'MRR'], arr: ['Yearly run rate', '年化收入', 'Kadar tahunan'],
  paidThisMonth: ['Collected this month', '本月已收', 'Dikutip bulan ini'], overdueAmt: ['Overdue', '逾期金额', 'Tertunggak'],
  plansT: ['Plans', '方案', 'Pelan'], nBiz: ['Businesses: {n}', '{n} 家商家', 'Perniagaan: {n}'],
  planLimits: ['{o} outlets · {s} staff', '{o} 家分店 · {s} 位员工', '{o} cawangan · {s} staf'], unlimited: ['unlimited', '不限', 'tanpa had'],
  docs_ssm: ['SSM certificate', 'SSM 注册证书', 'Sijil SSM'], docs_ic: ['Owner IC', '负责人身份证', 'IC pemilik'], docs_bank: ['Bank statement', '银行账单', 'Penyata bank'],
  missing: ['missing', '缺少', 'tiada'],
  rejectWhy: ['Reason for rejecting', '拒绝原因', 'Sebab penolakan'], rejectPh: ['e.g. SSM certificate does not match the business name', '例如：SSM 证书与商家名称不符', 'cth. Sijil SSM tidak sepadan dengan nama perniagaan'],
  suspendWhy: ['Reason for suspending', '停用原因', 'Sebab penggantungan'], suspendPh: ['e.g. Subscription unpaid for 2 months', '例如：订阅已逾期 2 个月未付', 'cth. Langganan tidak dibayar selama 2 bulan'],
  suspendNote: ['Staff and customers can’t book until you reactivate. Their data is kept.', '恢复前员工与顾客都无法预约，资料会保留。', 'Staf dan pelanggan tidak boleh menempah sehingga anda mengaktifkan semula. Data mereka disimpan.'],
  msgTo: ['Message to {b}', '发送给 {b}', 'Mesej kepada {b}'], msgPh: ['Write your message…', '输入信息…', 'Tulis mesej anda…'],
  done_approved: ['{b} approved and started on a {d}-day free trial', '{b} 已批准，开始 {d} 天免费试用', '{b} diluluskan dan memulakan percubaan percuma {d} hari'],
  done_rejected: ['Application rejected', '已拒绝申请', 'Permohonan ditolak'], done_info: ['Asked {b} for the missing documents', '已要求 {b} 补充文件', 'Meminta dokumen yang tiada daripada {b}'],
  done_susp: ['{b} suspended', '{b} 已停用', '{b} digantung'], done_react: ['{b} reactivated', '{b} 已恢复使用', '{b} diaktifkan semula'],
  done_plan: ['{b} moved to {p}', '{b} 已改为{p}', '{b} dipindahkan ke {p}'], done_trial: ['Trial extended to {d}', '试用延长至 {d}', 'Percubaan dilanjutkan hingga {d}'],
  done_paid: ['Marked as paid', '已标记为已付', 'Ditanda sebagai dibayar'], done_remind: ['Reminder sent to {b}', '已向 {b} 发送提醒', 'Peringatan dihantar kepada {b}'],
  done_msg: ['Message sent to {b}', '已向 {b} 发送信息', 'Mesej dihantar kepada {b}'], done_pw: ['Password reset link sent to {e}', '重置密码链接已发送至 {e}', 'Pautan set semula kata laluan dihantar ke {e}'],
  done_user: ['{n} is now {s}', '{n} 现为{s}', '{n} kini {s}'], done_reply: ['Reply sent', '回复已发送', 'Balasan dihantar'], done_saved: ['Saved', '已保存', 'Disimpan'],
  done_ann: ['Announcement sent to {n} businesses', '公告已发送给 {n} 家商家', 'Pengumuman dihantar kepada {n} perniagaan'],
  demoOnlyLum: ['Only Lumière Skin Studio has full demo data. Opening its admin.', '只有 Lumière Skin Studio 有完整演示数据，将打开它的后台。', 'Hanya Lumière Skin Studio mempunyai data demo penuh. Membuka adminnya.'],
  ann: ['Announcements to businesses', '给商家的公告', 'Pengumuman kepada perniagaan'], annTitle: ['Title', '标题', 'Tajuk'], annBody: ['Message', '内容', 'Mesej'], annSend: ['Send to all businesses', '发送给所有商家', 'Hantar kepada semua perniagaan'],
  rules: ['Platform rules', '平台规则', 'Peraturan platform'], trialDays: ['Free trial length (days)', '免费试用天数', 'Tempoh percubaan percuma (hari)'],
  feePct: ['Fee on online payments (%)', '在线付款手续费（%）', 'Fi bayaran dalam talian (%)'], graceDays: ['Suspend after unpaid (days)', '欠费多少天后停用', 'Gantung selepas tidak dibayar (hari)'],
  pteam: ['Platform team', '平台团队', 'Pasukan platform'], resetP: ['Reset platform demo data', '重置平台演示数据', 'Set semula data demo platform'],
  resetPDone: ['Platform demo data reset', '平台演示数据已重置', 'Data demo platform diset semula'],
  youW: ['You', '你', 'Anda'], sysW: ['System', '系统', 'Sistem'],
  r_monthly: ['Month by month', '按月', 'Bulan demi bulan'], r_bycat: ['By category', '按类别', 'Mengikut kategori'], r_bycity: ['By city', '按城市', 'Mengikut bandar'],
  c_new: ['New', '新增', 'Baharu'], c_churn: ['Left', '流失', 'Berhenti'], c_activeB: ['Active', '使用中', 'Aktif'],
  exportAll: ['Export report to Excel', '导出报表 Excel', 'Eksport laporan ke Excel'],
  phoneApp: ['Open phone app', '打开手机版', 'Buka aplikasi telefon'], bizAdmin: ['Business admin (Lumière)', '商家后台（Lumière）', 'Admin perniagaan (Lumière)'],
  sample: ['Sample data for the demo. Changes stay in this browser.', '演示用示例数据，改动只保存在此浏览器。', 'Data contoh untuk demo. Perubahan kekal dalam pelayar ini.'],
  ticketFrom: ['From {n}, {b}', '来自 {b} 的 {n}', 'Daripada {n}, {b}'],
};
function tp(k, v) {
  const e = P[k];
  if (!e) return A.t(k, v);
  let s = L() === 'zh' ? e[1] : L() === 'ms' ? e[2] : e[0];
  if (v) for (const n in v) s = s.split('{' + n + '}').join(v[n]);
  return s;
}

/* ------------------------------------------------------------------ data (its own store, separate from the salon demo) */
const PKEY = 'appt4u-platform-v1';
const PLAN_DEF = { starter: { price: 99, outlets: 1, staff: 3 }, growth: { price: 249, outlets: 2, staff: 10 }, pro: { price: 499, outlets: 5, staff: 0 } };
const store = { get() { try { return JSON.parse(localStorage.getItem(PKEY)); } catch (e) { return null; } }, set(v) { try { localStorage.setItem(PKEY, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } } };
function seed() {
  const d = n => addDays(today0(), n).toISOString();
  const B = (id, name, cat, city, plan, status, owner, outlets, staff, members, bookings, sales, last, joined, extra) => Object.assign({
    id, name, cat, city, plan, status, owner, email: `owner@${id}.example`, phone: '+60 3-0000 ' + String(1000 + name.length * 37).slice(0, 4), ssm: '2023' + String(100000 + joined * 13).slice(0, 6) + ' (sample)',
    outlets, staff, members, bookings, sales, lastActive: d(-last), joined: d(-joined), renew: d(30 - (joined % 30)), pay: joined % 2 ? 'card' : 'fpx', sms: Math.round(bookings * 1.6),
    features: { online: plan !== 'starter', wa: plan !== 'starter', multi: plan === 'pro' || outlets > 1, api: plan === 'pro' },
  }, extra || {});
  const biz = [
    B('lumiere', 'Lumière Skin Studio', 'facial', 'Kuala Lumpur', 'growth', 'active', 'Michelle Tan', 2, 4, 358, 612, 50750, 0, 420, { demo: true }),
    B('glow', 'Studio Glow Hair Lounge', 'hair', 'Kuala Lumpur', 'starter', 'active', 'Marcus Lee', 1, 2, 214, 388, 21400, 0, 300),
    B('coreflow', 'Core & Flow Pilates', 'pilates', 'Kuala Lumpur', 'pro', 'active', 'Sarah Lim', 3, 9, 296, 1140, 48600, 0, 510),
    B('polished', 'Polished Nail & Lash Bar', 'nails', 'Kuala Lumpur', 'starter', 'trial', 'Nina Wong', 1, 2, 64, 96, 6200, 1, 5, { trialEnds: d(9) }),
    B('serene', 'Serene Beauty House', 'facial', 'Penang', 'growth', 'active', 'Tan Siew Lan', 2, 7, 402, 540, 38900, 0, 260),
    B('browbar', 'The Brow Bar', 'nails', 'Petaling Jaya', 'starter', 'active', 'Aisyah Rahman', 1, 3, 180, 260, 14200, 2, 190),
    B('urban', 'Urban Barber Co.', 'hair', 'Johor Bahru', 'starter', 'active', 'Daniel Ng', 1, 3, 310, 720, 18400, 0, 150),
    B('bloom', 'Bloom Aesthetic Clinic', 'facial', 'Kota Damansara', 'pro', 'active', 'Dr. Priya Menon', 3, 14, 820, 960, 126500, 0, 610),
    B('align', 'Align Pilates Studio', 'pilates', 'Subang Jaya', 'growth', 'trial', 'Hana Yusof', 1, 4, 72, 140, 9800, 0, 11, { trialEnds: d(3) }),
    B('luxhair', 'Lux Hair Atelier', 'hair', 'Ipoh', 'growth', 'suspended', 'Kenny Chua', 1, 5, 150, 0, 0, 38, 330, { reason: 'Subscription unpaid for 2 months' }),
    B('glowup', 'Glow Up Spa', 'body', 'Melaka', 'starter', 'active', 'Farah Aziz', 1, 2, 96, 18, 1900, 21, 240),
    B('kualalash', 'Kuala Lash Studio', 'nails', 'Kuala Lumpur', 'starter', 'active', 'Mei Chen', 1, 2, 128, 230, 11800, 0, 95),
  ];
  const apps = [
    { id: 'ap1', name: 'Petal & Pearl Bridal Makeup', cat: 'body', city: 'Shah Alam', owner: 'Nurul Huda', email: 'hello@petalpearl.example', phone: '+60 3-0000 2201', ssm: '202401000111 (sample)', plan: 'growth', docs: { ssm: true, ic: true, bank: true }, at: d(-1), status: 'pending' },
    { id: 'ap2', name: 'Zen Reformer Studio', cat: 'pilates', city: 'Cheras', owner: 'Jason Teh', email: 'team@zenreformer.example', phone: '+60 3-0000 2202', ssm: '202401000222 (sample)', plan: 'starter', docs: { ssm: true, ic: true, bank: false }, at: d(-2), status: 'pending' },
    { id: 'ap3', name: 'Nail Haus', cat: 'nails', city: 'Kuching', owner: 'Clara Ling', email: 'nailhaus@kuching.example', phone: '+60 82-000 203', ssm: '202401000333 (sample)', plan: 'starter', docs: { ssm: false, ic: true, bank: true }, at: d(-4), status: 'pending' },
    { id: 'ap4', name: 'Radiance Facial Bar', cat: 'facial', city: 'Seremban', owner: 'Lim Wei Jie', email: 'radiance@seremban.example', phone: '+60 6-000 2204', ssm: '202401000444 (sample)', plan: 'growth', docs: { ssm: true, ic: true, bank: true }, at: d(-9), status: 'rejected', reason: 'Same owner already has an account' },
  ];
  /* platform invoices: the last three months for every paying business */
  const inv = [], m0 = today0(); m0.setDate(1);
  let n = 1;
  biz.filter(b => b.status !== 'trial').forEach(b => [-2, -1, 0].forEach(k => {
    const start = new Date(m0); start.setMonth(start.getMonth() + k);
    const due = addDays(start, 14);
    let status = 'paid';
    if (b.id === 'luxhair' && k >= -1) status = 'unpaid';
    if (b.id === 'browbar' && k === 0) status = 'unpaid';
    if (k === 0 && ['glow', 'serene', 'kualalash', 'glowup'].includes(b.id)) status = 'unpaid';
    const dueAt = b.id === 'browbar' && k === 0 ? addDays(today0(), -5) : due;
    inv.push({ id: 'pi' + n, no: `APP-${String(start.getFullYear()).slice(2)}${String(start.getMonth() + 1).padStart(2, '0')}-${String(n++).padStart(3, '0')}`, biz: b.id, plan: b.plan, period: start.toISOString(), amount: PLAN_DEF[b.plan].price, due: dueAt.toISOString(), status, paidAt: status === 'paid' ? addDays(start, 3 + (n % 5)).toISOString() : null, method: b.pay });
  }));
  const users = [];
  const U = (name, biz, role, last, twofa, extra) => users.push(Object.assign({ id: 'u' + (users.length + 1), name, email: `${name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@${biz}.example`, biz, role, last: d(-last), twofa, status: 'active' }, extra || {}));
  biz.forEach((b, i) => U(b.owner, b.id, 'owner', i % 4, i % 3 !== 1));
  U('Sara', 'lumiere', 'admin', 0, true); U('Joanne', 'lumiere', 'free', 0, false); U('Wei Ling', 'lumiere', 'staff', 1, false); U('Aida', 'lumiere', 'free', 0, false); U('Kelvin', 'lumiere', 'agent', 3, false);
  U('Hana', 'coreflow', 'staff', 0, true); U('Rina', 'bloom', 'admin', 0, true); U('Jun', 'bloom', 'staff', 2, false); U('Amir', 'urban', 'free', 5, false); U('Kenny Chua', 'luxhair', 'staff', 40, false, { status: 'disabled' });
  const T = (id, biz, subject, cat, prio, status, assigned, ago, msgs) => ({ id, biz, subject, cat, prio, status, assigned, at: d(-ago), updated: d(-Math.max(0, ago - 1)), msgs });
  const own = id => biz.find(b => b.id === id).owner;
  const tickets = [
    T('T-1042', 'lumiere', 'Calendar sync not updating on iPhone', 'tech', 'high', 'open', '', 0, [{ by: own('lumiere'), at: d(0), text: 'Two of our therapists say new bookings are not showing in their iPhone calendar since this morning.' }]),
    T('T-1041', 'browbar', 'Card declined when paying subscription', 'billing', 'high', 'open', '', 1, [{ by: own('browbar'), at: d(-1), text: 'I tried to pay this month’s subscription but my card was declined twice. Can I pay by online banking?' }]),
    T('T-1040', 'coreflow', 'Add a fourth outlet', 'account', 'normal', 'progress', 'Aina', 2, [{ by: own('coreflow'), at: d(-2), text: 'We are opening in Bangsar South next month. How do we add another outlet?' }, { by: 'Aina', at: d(-1), text: 'Congratulations! Pro covers 5 outlets, so we can add it now. Please send the address and opening hours.', staff: true }]),
    T('T-1039', 'serene', 'Invoice template in Chinese', 'tech', 'normal', 'progress', 'Aina', 3, [{ by: own('serene'), at: d(-3), text: 'Can our invoices show Chinese item names?' }]),
    T('T-1038', 'glowup', 'How do I import members from Excel?', 'account', 'low', 'resolved', 'Aina', 6, [{ by: own('glowup'), at: d(-6), text: 'We have 300 clients in a spreadsheet.' }, { by: 'Aina', at: d(-5), text: 'Sent you the member import template and a short guide.', staff: true }]),
    T('T-1037', 'urban', 'WhatsApp reminders not sent', 'tech', 'high', 'resolved', 'Ravi', 8, [{ by: own('urban'), at: d(-8), text: 'Customers say they didn’t get reminders yesterday.' }, { by: 'Ravi', at: d(-7), text: 'Fixed: the WhatsApp sender was paused. Reminders are going out again.', staff: true }]),
  ];
  return {
    v: 1, plans: JSON.parse(JSON.stringify(PLAN_DEF)), rules: { trialDays: 14, feePct: 1.5, graceDays: 30 },
    biz, apps, inv, users, tickets,
    team: [{ name: 'You', role: 'super', email: 'platform@appt4u.example' }, { name: 'Aina', role: 'support', email: 'aina@appt4u.example' }, { name: 'Ravi', role: 'finance', email: 'ravi@appt4u.example' }],
    ann: [{ at: d(-1), title: 'Bahasa Melayu is here', body: 'Your customers and staff can now switch the app to Bahasa Melayu.' }],
    log: [
      { at: d(-1), who: 'You', text: 'Sent announcement: Bahasa Melayu is here' },
      { at: d(-2), who: 'Ravi', text: 'Sent payment reminder to Lux Hair Atelier' },
      { at: d(-7), who: 'Ravi', text: 'Resolved T-1037 for Urban Barber Co.' },
      { at: d(-9), who: 'Aina', text: 'Rejected application: Radiance Facial Bar' },
    ],
  };
}
let D = store.get();
if (!D || D.v !== 1) { D = seed(); store.set(D); }
const save = () => store.set(D);
const log = (text, biz) => { D.log.unshift({ at: new Date().toISOString(), who: 'You', text, biz }); save(); };
const bizOf = id => D.biz.find(b => b.id === id);
const daysAgo = iso => Math.max(0, Math.floor((today0() - new Date(new Date(iso).setHours(0, 0, 0, 0))) / 864e5));
const ago = iso => { const n = daysAgo(iso); return n === 0 ? tp('todayW') : tp('daysAgoN', { n }); };
const invSt = x => x.status === 'paid' ? 'paid' : new Date(x.due) < today0() ? 'overdue' : 'due';
const ST_PILL = { active: 'sage', trial: 'gold', suspended: 'rose', pending: 'amber', rejected: 'grey', approved: 'sage', paid: 'sage', due: 'amber', overdue: 'rose', open: 'amber', progress: 'gold', resolved: 'sage', disabled: 'grey' };
const stPill = s => pill(ST_PILL[s] || 'grey', tp('st_' + s));
const planName = p => tp('pl_' + p);
const catName = c => A.t('cat_' + c);
const mrrOf = list => sum(list.filter(b => b.status === 'active'), b => D.plans[b.plan].price);
/* Lumière's numbers come from the salon demo itself, so they move when you use the salon app */
function liveLumiere() {
  const b = bizOf('lumiere'); if (!b) return;
  try { const cur = A.agg(A.range('month', 'cur')); b.members = Math.round(cur.active); b.sales = cur.cash; b.staff = Object.keys(A.STAFF).length; } catch (e) { /* keep sample */ }
}

/* ------------------------------------------------------------------ small charts */
function bars(values, labels, fmt, soft) {
  const max = Math.max(...values, 1);
  return `<div class="p-bars">${values.map((v, i) => `<div class="p-bar ${soft ? 'soft' : ''}"><b>${fmt(v)}</b><i style="height:${Math.max(4, Math.round(v / max * 130))}px"></i><span>${labels[i]}</span></div>`).join('')}</div>`;
}
function series() {
  const mrrNow = mrrOf(D.biz), activeNow = D.biz.filter(b => b.status === 'active').length, out = [];
  for (let i = 11; i >= 0; i--) {
    const d = today0(); d.setDate(1); d.setMonth(d.getMonth() - i);
    const f = 0.5 + 0.5 * (11 - i) / 11, wob = ((i * 37) % 7 - 3) / 100;
    const mrr = i === 0 ? mrrNow : Math.round(mrrNow * (f + wob) / 10) * 10;
    const active = i === 0 ? activeNow : Math.max(3, Math.round(activeNow * (f + wob)));
    const newB = i === 0 ? D.biz.filter(b => daysAgo(b.joined) <= new Date().getDate()).length : Math.max(0, Math.round(1 + ((i * 13) % 3)));
    out.push({ d, mrr, active, newB, churn: (i * 7) % 5 === 0 ? 1 : 0, bookings: Math.round(sum(D.biz, b => b.bookings) * (f + wob)), gmv: Math.round(sum(D.biz, b => b.sales) * (f + wob)) });
  }
  return out;
}

/* ------------------------------------------------------------------ overview */
function pOverview() {
  liveLumiere();
  const active = D.biz.filter(b => b.status === 'active'), trials = D.biz.filter(b => b.status === 'trial');
  const pend = D.apps.filter(a => a.status === 'pending'), over = D.inv.filter(x => invSt(x) === 'overdue');
  const open = D.tickets.filter(t => t.status !== 'resolved'), urgent = open.filter(t => t.prio === 'high');
  const ending = trials.filter(b => b.trialEnds && (new Date(b.trialEnds) - today0()) / 864e5 <= 7), idle = D.biz.filter(b => b.status === 'active' && daysAgo(b.lastActive) >= 14);
  const newM = D.biz.filter(b => daysAgo(b.joined) <= new Date().getDate()).length;
  const S = series(), lab = S.map(m => A.fMon(m.d));
  const att = [];
  if (pend.length) att.push(['#/applications', tp('att_apps', { n: pend.length })]);
  if (over.length) att.push(['#/billing', tp('att_over', { n: over.length })]);
  if (ending.length) att.push(['#/businesses', tp('att_trial', { n: ending.length })]);
  if (urgent.length) att.push(['#/support', tp('att_urgent', { n: urgent.length })]);
  if (idle.length) att.push(['#/businesses', tp('att_idle', { n: idle.length })]);
  const top = D.biz.filter(b => b.status !== 'suspended').slice().sort((a, b) => b.bookings - a.bookings).slice(0, 6);
  return head(tp('p_over'), `${tp('p_sub')} · ${A.fDay(new Date())}`, `<a class="btn btn-primary btn-sm" href="#/applications">${icon('doc', 16)} ${tp('p_apps')}</a>`)
  + `<div class="ad-kpis">${kcard(tp('k_active'), active.length, `<span class="small muted">${tp('newThisMonth', { n: newM })}</span>`)}${kcard(tp('k_mrr'), rm(mrrOf(D.biz)), `<span class="small muted">${tp('arr')}: ${rm(mrrOf(D.biz) * 12)}</span>`)}${kcard(tp('k_book'), sum(D.biz, b => b.bookings).toLocaleString('en-MY'))}${kcard(tp('k_gmv'), rm(sum(D.biz, b => b.sales)))}</div>
  <div class="ad-kpis">${kcard(tp('k_trials'), trials.length)}${kcard(tp('k_pend'), pend.length, '', pend.length ? 'warn' : '')}${kcard(tp('k_over'), over.length, over.length ? `<span class="small muted">${rm(sum(over, x => x.amount))}</span>` : '', over.length ? 'warn' : '')}${kcard(tp('k_open'), open.length, urgent.length ? pill('rose', tp('att_urgent', { n: urgent.length })) : '')}</div>
  <div class="ad-grid2">
    <section class="ad-card"><h2>${tp('mrrChart')}</h2>${bars(S.map(m => m.mrr), lab, v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v))}</section>
    <section class="ad-card"><h2>${A.t('needs')}</h2><div class="ad-att">${att.length ? att.map(([h, txt]) => `<a href="${h}"><span>${esc(txt)}</span>${icon('chevR', 16)}</a>`).join('') : `<p class="muted">${A.t('nothingHere')}</p>`}</div></section>
  </div>
  <div class="ad-grid2">
    <section class="ad-card"><div class="ad-card-h"><h2>${tp('topBiz')}</h2><a class="link" href="#/businesses">${A.t('ad_viewAll')}</a></div>
      <table class="dt"><thead><tr><th class="nosort">${tp('c_business')}</th><th class="nosort">${tp('c_plan')}</th><th class="nosort num">${tp('c_book')}</th><th class="nosort num">${tp('c_sales')}</th></tr></thead>
      <tbody>${top.map(b => `<tr><td><a class="strong" href="#/businesses/${b.id}">${esc(b.name)}</a><span class="sub">${esc(b.city)}</span></td><td>${planName(b.plan)}</td><td class="num">${b.bookings}</td><td class="num">${rm(b.sales)}</td></tr>`).join('')}</tbody></table></section>
    <section class="ad-card"><h2>${tp('bizChart')}</h2>${bars(S.map(m => m.active), lab, v => String(v), true)}</section>
  </div>`;
}

/* ------------------------------------------------------------------ businesses */
function pBusinesses() {
  liveLumiere();
  const cols = [
    { label: tp('c_business'), x: b => b.name, html: b => `<a class="strong" href="#/businesses/${b.id}">${esc(b.name)}</a><span class="sub">${catName(b.cat)} · ${esc(b.city)}</span>`, text: b => b.name + ' ' + b.city + ' ' + b.owner, w: 28 },
    { label: tp('c_cat'), x: b => catName(b.cat), hidden: true }, { label: tp('c_city'), x: b => b.city, hidden: true },
    { label: tp('c_owner'), x: b => b.owner, html: b => `<span class="nowrap">${esc(b.owner)}</span>`, w: 18 },
    { label: tp('c_email'), x: b => b.email, hidden: true }, { label: tp('c_phone'), x: b => b.phone, hidden: true },
    { label: `${tp('c_plan')} · ${A.t('ad_status')}`, sv: b => b.status + b.plan, html: b => `<span class="p-docs">${pill(b.plan === 'pro' ? 'ink' : b.plan === 'growth' ? 'gold' : 'grey', planName(b.plan))}${stPill(b.status)}</span>` },
    { label: tp('c_plan'), x: b => planName(b.plan), hidden: true },
    { label: A.t('ad_status'), x: b => tp('st_' + b.status), hidden: true },
    { label: `${tp('c_outlets')} · ${tp('c_staff')}`, num: true, sv: b => b.outlets * 100 + b.staff, html: b => `${b.outlets} · ${b.staff}` },
    { label: tp('c_outlets'), num: true, x: b => b.outlets, hidden: true }, { label: tp('c_staff'), num: true, x: b => b.staff, hidden: true },
    { label: tp('c_members'), num: true, x: b => b.members, html: b => b.members.toLocaleString('en-MY') },
    { label: tp('c_book'), num: true, x: b => b.bookings, foot: list => sum(list, b => b.bookings).toLocaleString('en-MY') },
    Object.assign(money('sales', tp('c_sales'), b => b.sales), { html: b => rm(b.sales), foot: list => rm(sum(list, b => b.sales)) }),
    { label: tp('c_last'), x: b => C.dayOf(b.lastActive), sv: b => -daysAgo(b.lastActive), html: b => `<span class="${daysAgo(b.lastActive) >= 14 ? 't-bad' : ''}">${ago(b.lastActive)}</span>` },
    { label: tp('c_renew'), x: b => C.dayOf(b.status === 'trial' ? b.trialEnds : b.renew), html: b => b.status === 'suspended' ? '—' : `<span class="nowrap">${fDate(b.status === 'trial' ? b.trialEnds : b.renew)}</span>` },
    { label: tp('c_joined'), x: b => C.dayOf(b.joined), hidden: true },
  ];
  return head(tp('p_biz'), tp('p_sub'))
    + dt('p_biz', { cols, rows: D.biz, footer: true, sort: 5, dir: -1, file: `appt4u-businesses-${stamp()}.xlsx`, sheet: tp('p_biz'),
      filters: [
        { k: 'st', label: A.t('ad_status'), opts: ['active', 'trial', 'suspended'].map(s => [s, tp('st_' + s)]), test: (b, v) => b.status === v },
        { k: 'pl', label: tp('c_plan'), opts: ['starter', 'growth', 'pro'].map(p => [p, planName(p)]), test: (b, v) => b.plan === v },
        { k: 'ca', label: tp('c_cat'), opts: ['facial', 'hair', 'nails', 'body', 'pilates'].map(c => [c, catName(c)]), test: (b, v) => b.cat === v },
        { k: 'ci', label: tp('c_city'), opts: [...new Set(D.biz.map(b => b.city))].sort().map(c => [c, c]), test: (b, v) => b.city === v },
      ] });
}
function pBusiness(id) {
  liveLumiere();
  const b = bizOf(id); if (!b) return null;
  const plan = D.plans[b.plan], invs = D.inv.filter(x => x.biz === id).sort((a, c) => new Date(c.period) - new Date(a.period));
  const users = D.users.filter(u => u.biz === id), tks = D.tickets.filter(t => t.biz === id), acts = D.log.filter(l => l.biz === id || l.text.includes(b.name)).slice(0, 8);
  const btns = [
    b.status === 'trial' ? `<button class="btn btn-primary btn-sm" data-x="pStartPaid" data-id="${id}">${tp('startPaid')}</button><button class="btn btn-outline btn-sm" data-x="pExtend" data-id="${id}">${tp('extendTrial')}</button>` : '',
    b.status === 'suspended' ? `<button class="btn btn-primary btn-sm" data-x="pReact" data-id="${id}">${tp('reactivate')}</button>` : `<button class="btn btn-outline btn-sm" data-x="pPlanSheet" data-id="${id}">${tp('changePlan')}</button>`,
    `<button class="btn btn-outline btn-sm" data-x="pMsg" data-id="${id}">${icon('share', 15)} ${tp('message')}</button>`,
    `<button class="btn btn-outline btn-sm" data-x="pOpenAdmin" data-id="${id}">${icon('grid', 15)} ${tp('openAdmin')}</button>`,
    b.status !== 'suspended' ? `<button class="btn btn-ghost btn-sm" data-x="pSuspendAsk" data-id="${id}">${tp('suspend')}</button>` : '',
  ].join('');
  const kv = rows => `<div class="p-kv">${rows.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}</div>`;
  return `<div class="ad-head"><div><p class="ad-crumb"><a href="#/businesses">${tp('p_biz')}</a> / ${esc(b.name)}</p><h1 class="ad-title">${esc(b.name)} ${stPill(b.status)}</h1><p class="muted">${catName(b.cat)} · ${esc(b.city)} · ${tp('c_joined')} ${fFull(b.joined)}</p></div><div class="ad-head-act">${btns}</div></div>
  ${b.status === 'suspended' && b.reason ? `<p class="note rose">${icon('x', 16)}<span>${tp('suspendWhy')}: ${esc(b.reason)}</span></p>` : ''}
  <div class="ad-kpis">${kcard(tp('c_members'), b.members.toLocaleString('en-MY'))}${kcard(tp('c_book'), b.bookings)}${kcard(tp('c_sales'), rm(b.sales))}${kcard(tp('c_last'), ago(b.lastActive), '', daysAgo(b.lastActive) >= 14 ? 'warn' : '')}</div>
  <div class="ad-grid2 even">
    <section class="ad-card"><h2>${tp('profile')}</h2>${kv([[tp('c_owner'), esc(b.owner)], [tp('c_email'), esc(b.email)], [tp('c_phone'), esc(b.phone)], [tp('c_ssm'), esc(b.ssm)], [tp('c_cat'), catName(b.cat)], [tp('c_city'), esc(b.city)], [tp('c_outlets'), b.outlets]])}</section>
    <section class="ad-card"><h2>${tp('subscription')}</h2>${kv([[tp('c_plan'), `${planName(b.plan)} · ${rm(plan.price)} / ${A.t('p_month').toLowerCase()}`], [A.t('ad_status'), stPill(b.status)], [b.status === 'trial' ? tp('trialEnds') : tp('nextRenew'), b.status === 'suspended' ? '—' : fFull(b.status === 'trial' ? b.trialEnds : b.renew)], [tp('payMethodP'), b.pay === 'card' ? tp('card') : tp('fpx')]])}
      <h3 class="label">${tp('usage')}</h3>
      <div class="p-split"><div class="p-stat"><span>${tp('seats')}</span><b>${b.staff} / ${plan.staff || '∞'}</b></div><div class="p-stat"><span>${tp('outletsUsed')}</span><b>${b.outlets} / ${plan.outlets}</b></div><div class="p-stat"><span>${tp('smsUsed')}</span><b>${b.sms}</b></div></div></section>
  </div>
  <div class="ad-grid2 even">
    <section class="ad-card"><h2>${tp('features')}</h2>${['online', 'wa', 'multi', 'api'].map(f => `<label class="p-feat"><span>${tp('f_' + f)}</span><input type="checkbox" class="switch" data-pfeat="${f}" data-id="${id}" ${b.features[f] ? 'checked' : ''}></label>`).join('')}</section>
    <section class="ad-card"><h2>${tp('platInv')}</h2>${invs.length ? `<table class="tbl"><tbody>${invs.map(x => `<tr><td><b>${x.no}</b><span class="sub">${fMonth(x.period)}</span></td><td class="num">${rm(x.amount, 2)}</td><td class="num">${stPill(invSt(x))}</td></tr>`).join('')}</tbody></table>` : `<p class="muted">${A.t('nothingHere')}</p>`}</section>
  </div>
  <div class="ad-grid2 even">
    <section class="ad-card"><h2>${tp('p_users')}</h2><table class="tbl"><tbody>${users.map(u => `<tr><td><b>${esc(u.name)}</b><span class="sub">${esc(u.email)}</span></td><td>${tp('ro_' + u.role)}</td><td class="num">${stPill(u.status)}</td></tr>`).join('')}</tbody></table></section>
    <section class="ad-card"><h2>${tp('p_sup')} · ${tp('activity')}</h2>
      ${tks.map(t => `<a class="row" href="#/support" style="padding:6px 0"><span><b>${t.id}</b> · ${esc(t.subject)}</span>${stPill(t.status)}</a>`).join('')}
      ${acts.map(l => `<p class="small"><span class="muted">${fDate(l.at)} · ${esc(l.who)}</span> — ${esc(l.text)}</p>`).join('') || (tks.length ? '' : `<p class="muted">${A.t('nothingHere')}</p>`)}</section>
  </div>`;
}

/* ------------------------------------------------------------------ applications */
function pApps() {
  const docs = a => ['ssm', 'ic', 'bank'].map(k => pill(a.docs[k] ? 'sage' : 'rose', `${a.docs[k] ? '✓' : '✗'} ${tp('docs_' + k)}`)).join(' ');
  const cols = [
    { label: tp('c_business'), x: a => a.name, html: a => `<b>${esc(a.name)}</b><span class="sub">${catName(a.cat)} · ${esc(a.city)} · ${planName(a.plan)}</span><span class="sub">${tp('c_ssm')} ${esc(a.ssm)}</span>`, text: a => a.name + ' ' + a.city + ' ' + a.owner + ' ' + a.ssm, w: 28 },
    { label: tp('c_owner'), x: a => a.owner, html: a => `${esc(a.owner)}<span class="sub">${esc(a.email)} · ${esc(a.phone)}</span>`, w: 20 },
    { label: tp('c_email'), x: a => a.email, hidden: true }, { label: tp('c_phone'), x: a => a.phone, hidden: true },
    { label: tp('c_ssm'), x: a => a.ssm, hidden: true },
    { label: tp('c_plan'), x: a => planName(a.plan), hidden: true },
    { label: tp('c_docs'), x: a => ['ssm', 'ic', 'bank'].filter(k => !a.docs[k]).map(k => tp('docs_' + k) + ' ' + tp('missing')).join(', '), html: a => `<span class="p-docs">${docs(a)}</span>`, w: 30 },
    { label: tp('c_submitted'), x: a => C.dayOf(a.at), html: a => ago(a.at) },
    { label: A.t('ad_status'), x: a => tp('st_' + a.status) + (a.reason ? ' · ' + a.reason : ''), html: a => stPill(a.status) + (a.reason ? `<span class="sub">${esc(a.reason)}</span>` : '') },
    { label: A.t('ad_actions'), html: a => a.status === 'pending' ? `<span class="acts wrap"><button class="btn btn-sm btn-primary" data-x="pApprove" data-id="${a.id}">${tp('approveB')}</button>${Object.values(a.docs).some(v => !v) ? `<button class="btn btn-sm btn-outline" data-x="pAskInfo" data-id="${a.id}">${tp('askInfo')}</button>` : ''}<button class="icon-btn" data-x="pRejectAsk" data-id="${a.id}" title="${tp('rejectB')}" aria-label="${tp('rejectB')}">${icon('x', 18)}</button></span>` : '' },
  ];
  return head(tp('p_apps'), `${tp('trialDays')}: ${D.rules.trialDays}`)
    + dt('p_apps', { cols, rows: D.apps, sort: 3, dir: -1, file: `appt4u-applications-${stamp()}.xlsx`, sheet: tp('p_apps'),
      filters: [{ k: 'st', label: A.t('ad_status'), opts: ['pending', 'approved', 'rejected'].map(s => [s, tp('st_' + s)]), test: (a, v) => a.status === v }] });
}

/* ------------------------------------------------------------------ subscriptions & billing */
function pBilling() {
  const now = new Date(), thisM = x => x.paidAt && new Date(x.paidAt).getMonth() === now.getMonth() && new Date(x.paidAt).getFullYear() === now.getFullYear();
  const over = D.inv.filter(x => invSt(x) === 'overdue');
  const cols = [
    { label: A.t('invNo'), x: x => x.no, html: x => `<b class="nowrap">${x.no}</b>` },
    { label: tp('c_business'), x: x => (bizOf(x.biz) || {}).name || x.biz, html: x => `<a class="strong" href="#/businesses/${x.biz}">${esc((bizOf(x.biz) || {}).name || x.biz)}</a>`, w: 26 },
    { label: tp('c_plan'), x: x => planName(x.plan) },
    { label: tp('c_period'), x: x => fMonth(x.period), sv: x => new Date(x.period).getTime() },
    money('amt', A.t('amountRM'), x => x.amount),
    { label: A.t('dueL'), x: x => C.dayOf(x.due), html: x => `<span class="nowrap">${fDate(x.due)}</span>` },
    { label: A.t('ad_status'), x: x => tp('st_' + invSt(x)), html: x => stPill(invSt(x)) },
    { label: A.t('ad_paidDate'), x: x => x.paidAt ? C.dayOf(x.paidAt) : '', html: x => x.paidAt ? fDate(x.paidAt) : '—' },
    { label: tp('payMethodP'), x: x => x.method === 'card' ? tp('card') : tp('fpx'), hidden: true },
    { label: A.t('ad_actions'), html: x => x.status === 'paid' ? '' : `<span class="acts"><button class="btn btn-sm btn-primary" data-x="pInvPaid" data-id="${x.id}">${tp('markPaidP')}</button><button class="btn btn-sm btn-outline" data-x="pRemind" data-id="${x.id}">${tp('remind')}</button></span>` },
  ];
  const planCount = p => D.biz.filter(b => b.plan === p && b.status === 'active').length;
  return head(tp('p_bill'), `${tp('mrr')} ${rm(mrrOf(D.biz))} · ${tp('arr')} ${rm(mrrOf(D.biz) * 12)}`)
  + `<div class="ad-kpis">${kcard(tp('k_mrr'), rm(mrrOf(D.biz)))}${kcard(tp('paidThisMonth'), rm(sum(D.inv.filter(thisM), x => x.amount), 2))}${kcard(tp('overdueAmt'), rm(sum(over, x => x.amount), 2), `<span class="small muted">${over.length} × ${A.t('invoiceWord')}</span>`, over.length ? 'warn' : '')}${kcard(tp('k_trials'), D.biz.filter(b => b.status === 'trial').length)}</div>
  <section class="ad-card"><h2>${tp('plansT')}</h2><div class="p-plans">${['starter', 'growth', 'pro'].map(p => `<div class="p-plan"><h3>${planName(p)}</h3><b style="font-size:22px">${rm(D.plans[p].price)}<span class="small muted"> / ${A.t('p_month').toLowerCase()}</span></b><span class="small muted">${tp('planLimits', { o: D.plans[p].outlets, s: D.plans[p].staff || tp('unlimited') })}</span><span>${tp('nBiz', { n: planCount(p) })} · ${rm(planCount(p) * D.plans[p].price)}</span></div>`).join('')}</div></section>`
  + dt('p_inv', { cols, rows: D.inv, footer: true, sort: 3, dir: -1, file: `appt4u-subscription-invoices-${stamp()}.xlsx`, sheet: tp('platInv'),
    filters: [
      { k: 'st', label: A.t('ad_status'), opts: ['paid', 'due', 'overdue'].map(s => [s, tp('st_' + s)]), test: (x, v) => invSt(x) === v },
      { k: 'pl', label: tp('c_plan'), opts: ['starter', 'growth', 'pro'].map(p => [p, planName(p)]), test: (x, v) => x.plan === v },
    ] });
}

/* ------------------------------------------------------------------ users & access */
function pUsers() {
  const cols = [
    { label: A.t('ad_name'), x: u => u.name, html: u => `<span class="who"><span class="avatar">${initials(u.name)}</span><span><b>${esc(u.name)}</b><span class="sub">${esc(u.email)}</span></span></span>`, text: u => u.name + ' ' + u.email },
    { label: tp('c_email'), x: u => u.email, hidden: true },
    { label: tp('c_business'), x: u => (bizOf(u.biz) || {}).name || '', html: u => `<a href="#/businesses/${u.biz}">${esc((bizOf(u.biz) || {}).name || '')}</a>` },
    { label: tp('c_role'), x: u => tp('ro_' + u.role) },
    { label: tp('c_login'), x: u => C.dayOf(u.last), sv: u => -daysAgo(u.last), html: u => ago(u.last) },
    { label: tp('c_2fa'), x: u => u.twofa ? tp('on') : tp('off'), html: u => u.twofa ? pill('sage', tp('on')) : pill('grey', tp('off')) },
    { label: A.t('ad_status'), x: u => tp('st_' + u.status), html: u => stPill(u.status) },
    { label: A.t('ad_actions'), html: u => `<span class="acts"><button class="btn btn-sm btn-outline" data-x="pUserToggle" data-id="${u.id}">${u.status === 'active' ? tp('disable') : tp('enable')}</button><button class="btn btn-sm btn-ghost" data-x="pResetPw" data-id="${u.id}">${tp('resetPw')}</button></span>` },
  ];
  return head(tp('p_users'), tp('p_sub'))
    + dt('p_users', { cols, rows: D.users, file: `appt4u-users-${stamp()}.xlsx`, sheet: tp('p_users'),
      filters: [
        { k: 'ro', label: tp('c_role'), opts: ['owner', 'admin', 'staff', 'free', 'agent'].map(r => [r, tp('ro_' + r)]), test: (u, v) => u.role === v },
        { k: 'bz', label: tp('c_business'), opts: D.biz.map(b => [b.id, b.name]), test: (u, v) => u.biz === v },
        { k: 'st', label: A.t('ad_status'), opts: ['active', 'disabled'].map(s => [s, tp('st_' + s)]), test: (u, v) => u.status === v },
      ] })
    + `<section class="ad-card"><h2>${tp('pteam')}</h2><table class="tbl"><tbody>${D.team.map(m => `<tr><td><b>${m.name === 'You' ? tp('youW') : esc(m.name)}</b><span class="sub">${esc(m.email)}</span></td><td class="num">${tp('ro_' + m.role)}</td></tr>`).join('')}</tbody></table></section>`;
}

/* ------------------------------------------------------------------ support */
function pSupport() {
  const cols = [
    { label: 'ID', x: t => t.id, html: t => `<b class="nowrap">${t.id}</b>` },
    { label: tp('c_business'), x: t => (bizOf(t.biz) || {}).name || '', html: t => `<a href="#/businesses/${t.biz}">${esc((bizOf(t.biz) || {}).name || '')}</a>` },
    { label: tp('c_subject'), x: t => t.subject, html: t => `<a class="strong" href="#/support" data-x="pTicket" data-id="${t.id}">${esc(t.subject)}</a><span class="sub">${tp('tc_' + t.cat)}</span>`, w: 36, cls: 'wide' },
    { label: tp('c_cat'), x: t => tp('tc_' + t.cat), hidden: true },
    { label: tp('c_prio'), x: t => tp('pr_' + t.prio), html: t => pill(t.prio === 'high' ? 'rose' : t.prio === 'normal' ? 'grey' : 'grey', tp('pr_' + t.prio)), sv: t => ({ high: 0, normal: 1, low: 2 })[t.prio] },
    { label: A.t('ad_status'), x: t => tp('st_' + t.status), html: t => stPill(t.status), sv: t => ({ open: 0, progress: 1, resolved: 2 })[t.status] },
    { label: tp('c_assigned'), x: t => t.assigned || '', html: t => t.assigned ? esc(t.assigned === 'You' ? tp('youW') : t.assigned) : '<span class="muted">—</span>' },
    { label: tp('c_updated'), x: t => C.dayOf(t.updated), sv: t => new Date(t.updated).getTime(), html: t => ago(t.updated) },
    { label: A.t('ad_actions'), html: t => `<span class="acts"><button class="btn btn-sm btn-outline" data-x="pTicket" data-id="${t.id}">${tp('reply')}</button></span>` },
  ];
  return head(tp('p_sup'), tp('p_sub'))
    + dt('p_tk', { cols, rows: D.tickets, sort: 4, dir: 1, file: `appt4u-support-tickets-${stamp()}.xlsx`, sheet: tp('p_sup'),
      filters: [
        { k: 'st', label: A.t('ad_status'), opts: ['open', 'progress', 'resolved'].map(s => [s, tp('st_' + s)]), test: (t, v) => t.status === v },
        { k: 'pr', label: tp('c_prio'), opts: ['high', 'normal', 'low'].map(s => [s, tp('pr_' + s)]), test: (t, v) => t.prio === v },
        { k: 'ca', label: tp('c_cat'), opts: ['billing', 'tech', 'account'].map(s => [s, tp('tc_' + s)]), test: (t, v) => t.cat === v },
      ] });
}
function ticketModal(id) {
  const t = D.tickets.find(x => x.id === id); if (!t) return;
  const b = bizOf(t.biz) || {};
  modal(`<h2>${t.id} · ${esc(t.subject)}</h2><p class="small muted">${tp('ticketFrom', { n: esc(b.owner || ''), b: esc(b.name || '') })} · ${tp('tc_' + t.cat)} · ${tp('pr_' + t.prio)}</p>
    <div class="thread">${t.msgs.map(m => `<div class="${m.staff ? 'msg-p' : 'msg-b'}"><small>${esc(m.by === 'You' ? tp('youW') : m.by)} · ${fDate(m.at)}</small>${esc(m.text)}</div>`).join('')}</div>
    <textarea class="field" id="pReply" placeholder="${tp('msgPh')}"></textarea>
    <div class="ed-grid"><label><span class="label">${A.t('ad_status')}</span><select class="field" id="pTkStatus">${['open', 'progress', 'resolved'].map(s => `<option value="${s}" ${t.status === s ? 'selected' : ''}>${tp('st_' + s)}</option>`).join('')}</select></label>
      <label><span class="label">${tp('c_assigned')}</span><select class="field" id="pTkAssign"><option value="">—</option>${D.team.map(m => `<option value="${m.name}" ${t.assigned === m.name ? 'selected' : ''}>${m.name === 'You' ? tp('youW') : esc(m.name)}</option>`).join('')}</select></label></div>
    <div class="row-start gap8"><button class="btn btn-primary" data-x="pTicketSave" data-id="${t.id}">${tp('send')}</button><button class="btn btn-ghost" data-x="closeModal">${A.t('notNow')}</button></div>`);
}

/* ------------------------------------------------------------------ growth reports */
function reportRows() {
  const S = series();
  const cats = ['facial', 'hair', 'nails', 'body', 'pilates'].map(c => { const l = D.biz.filter(b => b.cat === c); return { name: catName(c), n: l.length, active: l.filter(b => b.status === 'active').length, mrr: mrrOf(l), bookings: sum(l, b => b.bookings), sales: sum(l, b => b.sales) }; }).filter(r => r.n);
  const cities = [...new Set(D.biz.map(b => b.city))].map(c => { const l = D.biz.filter(b => b.city === c); return { name: c, n: l.length, active: l.filter(b => b.status === 'active').length, mrr: mrrOf(l), bookings: sum(l, b => b.bookings), sales: sum(l, b => b.sales) }; }).sort((a, b) => b.n - a.n);
  return { S, cats, cities };
}
function pReports() {
  const R = reportRows();
  const grp = rows => `<table class="tbl"><thead><tr><th></th><th class="num">${tp('p_biz')}</th><th class="num">${tp('c_activeB')}</th><th class="num">${tp('mrr')}</th><th class="num">${tp('c_book')}</th><th class="num">${tp('c_sales')}</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r.name)}</b></td><td class="num">${r.n}</td><td class="num">${r.active}</td><td class="num">${rm(r.mrr)}</td><td class="num">${r.bookings}</td><td class="num">${rm(r.sales)}</td></tr>`).join('')}</tbody></table>`;
  return head(tp('p_rep'), `${tp('p_sub')} · ${A.t('sample')}`, `<button class="btn btn-primary btn-sm" data-x="pReportXls">${icon('download', 16)} ${tp('exportAll')}</button>`)
  + `<section class="ad-card"><h2>${tp('r_monthly')}</h2><table class="tbl"><thead><tr><th>${A.t('ad_month')}</th><th class="num">${tp('c_activeB')}</th><th class="num">${tp('c_new')}</th><th class="num">${tp('c_churn')}</th><th class="num">${tp('mrr')}</th><th class="num">${A.t('kBookings')}</th><th class="num">${tp('c_sales')}</th></tr></thead>
    <tbody>${R.S.slice().reverse().map(m => `<tr><td>${fMonth(m.d)}</td><td class="num">${m.active}</td><td class="num">${m.newB}</td><td class="num">${m.churn}</td><td class="num">${rm(m.mrr)}</td><td class="num">${m.bookings.toLocaleString('en-MY')}</td><td class="num">${rm(m.gmv)}</td></tr>`).join('')}</tbody></table></section>
  <div class="ad-grid2 even"><section class="ad-card"><h2>${tp('r_bycat')}</h2>${grp(R.cats)}</section><section class="ad-card"><h2>${tp('r_bycity')}</h2>${grp(R.cities)}</section></div>`;
}
function reportXls() {
  const R = reportRows();
  const g = [{ xh: tp('c_cat'), x: r => r.name, w: 18 }, { xh: tp('p_biz'), x: r => r.n, sum: true }, { xh: tp('c_activeB'), x: r => r.active, sum: true }, { xh: tp('mrr'), x: r => r.mrr, z: MONEY, sum: true }, { xh: tp('c_book'), x: r => r.bookings, sum: true }, { xh: tp('c_sales'), x: r => r.sales, z: MONEY, sum: true }];
  downloadBook(`appt4u-platform-growth-${stamp()}.xlsx`, [
    [tp('r_monthly'), X => sheetOf(X, [{ xh: A.t('ad_month'), x: m => fMonth(m.d), w: 14 }, { xh: tp('c_activeB'), x: m => m.active }, { xh: tp('c_new'), x: m => m.newB, sum: true }, { xh: tp('c_churn'), x: m => m.churn, sum: true }, { xh: tp('mrr'), x: m => m.mrr, z: MONEY }, { xh: A.t('kBookings'), x: m => m.bookings, sum: true }, { xh: tp('c_sales'), x: m => m.gmv, z: MONEY, sum: true }], R.S, true)],
    [tp('r_bycat'), X => sheetOf(X, g, R.cats, true)],
    [tp('r_bycity'), X => sheetOf(X, [Object.assign({}, g[0], { xh: tp('c_city') })].concat(g.slice(1)), R.cities, true)],
  ]);
}

/* ------------------------------------------------------------------ settings & activity log */
function pSettings() {
  return head(tp('p_set'), tp('sample'))
  + `<div class="set-grid">
    <section class="ad-card"><h2>${tp('plansT')}</h2><div class="stack-sm">${['starter', 'growth', 'pro'].map(p => `<div class="row"><b>${planName(p)}</b><span class="row-start gap8"><span class="small muted">RM</span><input class="field" style="width:110px;text-align:right" inputmode="numeric" data-pplan="${p}" value="${D.plans[p].price}"><span class="small muted">/ ${A.t('p_month').toLowerCase()}</span></span></div>`).join('')}</div></section>
    <section class="ad-card"><h2>${tp('rules')}</h2><div class="stack-sm">${[['trialDays', 'trialDays'], ['feePct', 'feePct'], ['graceDays', 'graceDays']].map(([k, l]) => `<div class="row"><span>${tp(l)}</span><input class="field" style="width:110px;text-align:right" inputmode="decimal" data-prule="${k}" value="${D.rules[k]}"></div>`).join('')}</div></section>
    <section class="ad-card"><h2>${tp('ann')}</h2>
      <input class="field" id="pAnnTitle" placeholder="${tp('annTitle')}"><textarea class="field" id="pAnnBody" placeholder="${tp('annBody')}"></textarea>
      <button class="btn btn-primary" data-x="pAnnSend">${icon('share', 16)} ${tp('annSend')}</button>
      ${D.ann.map(a => `<div class="p-feat"><span><b>${esc(a.title)}</b><span class="sub">${esc(a.body)}</span></span><span class="small muted nowrap">${fDate(a.at)}</span></div>`).join('')}</section>
    <section class="ad-card"><h2>${A.t('ad_demo')}</h2><p class="muted">${tp('sample')}</p><div class="row-start gap8"><a class="btn btn-outline" href="../admin/">${icon('grid', 16)} ${tp('bizAdmin')}</a><button class="btn btn-ghost" data-x="pResetAsk">${tp('resetP')}</button></div></section>
  </div>`;
}
function pLog() {
  const cols = [
    { label: tp('c_when'), x: l => new Date(l.at), sv: l => new Date(l.at).getTime(), html: l => `<span class="nowrap">${fDate(l.at)} ${A.hm(l.at)}</span>` },
    { label: tp('c_who'), x: l => l.who === 'You' ? tp('youW') : l.who },
    { label: tp('c_action'), x: l => l.text, w: 60, cls: 'wide' },
  ];
  return head(tp('p_log'), tp('p_sub')) + dt('p_log', { cols, rows: D.log, sort: 0, dir: -1, file: `appt4u-platform-activity-${stamp()}.xlsx`, sheet: tp('p_log') });
}

/* ------------------------------------------------------------------ actions */
const findApp = id => D.apps.find(a => a.id === id);
const actions = {
  pApprove: el => {
    const a = findApp(el.dataset.id); if (!a) return;
    a.status = 'approved';
    const id = a.name.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 12) + Date.now().toString(36).slice(-3);
    D.biz.push({ id, name: a.name, cat: a.cat, city: a.city, plan: a.plan, status: 'trial', owner: a.owner, email: a.email, phone: a.phone, ssm: a.ssm, outlets: 1, staff: 1, members: 0, bookings: 0, sales: 0, sms: 0,
      lastActive: new Date().toISOString(), joined: new Date().toISOString(), renew: addDays(today0(), 30).toISOString(), trialEnds: addDays(today0(), Number(D.rules.trialDays) || 14).toISOString(), pay: 'fpx',
      features: { online: a.plan !== 'starter', wa: a.plan !== 'starter', multi: a.plan === 'pro', api: a.plan === 'pro' } });
    D.users.push({ id: 'u' + Date.now().toString(36), name: a.owner, email: a.email, biz: id, role: 'owner', last: new Date().toISOString(), twofa: false, status: 'active' });
    log(`Approved application: ${a.name} (${planName(a.plan)}, free trial)`, id); C.render(); toast(tp('done_approved', { b: a.name, d: D.rules.trialDays }));
  },
  pAskInfo: el => { const a = findApp(el.dataset.id); if (!a) return; log(`Asked ${a.name} for missing documents`); C.render(); toast(tp('done_info', { b: a.name })); },
  pRejectAsk: el => { const a = findApp(el.dataset.id); if (!a) return; modal(`<h2>${tp('rejectB')} · ${esc(a.name)}</h2><label class="ed-col"><span class="label">${tp('rejectWhy')}</span><textarea class="field" id="pWhy" placeholder="${tp('rejectPh')}"></textarea></label><div class="row-start gap8"><button class="btn btn-primary" data-x="pReject" data-id="${a.id}">${tp('rejectB')}</button><button class="btn btn-ghost" data-x="closeModal">${A.t('notNow')}</button></div>`); },
  pReject: el => { const a = findApp(el.dataset.id); if (!a) return; a.status = 'rejected'; a.reason = (($('#pWhy') || {}).value || '').trim(); log(`Rejected application: ${a.name}${a.reason ? ' — ' + a.reason : ''}`); closeModal(); C.render(); toast(tp('done_rejected')); },
  pSuspendAsk: el => { const b = bizOf(el.dataset.id); if (!b) return; modal(`<h2>${tp('suspend')} · ${esc(b.name)}</h2><p class="note rose">${icon('x', 16)}<span>${tp('suspendNote')}</span></p><label class="ed-col"><span class="label">${tp('suspendWhy')}</span><textarea class="field" id="pWhy" placeholder="${tp('suspendPh')}"></textarea></label><div class="row-start gap8"><button class="btn btn-primary" data-x="pSuspend" data-id="${b.id}">${tp('suspend')}</button><button class="btn btn-ghost" data-x="closeModal">${A.t('notNow')}</button></div>`); },
  pSuspend: el => { const b = bizOf(el.dataset.id); if (!b) return; b.status = 'suspended'; b.reason = (($('#pWhy') || {}).value || '').trim(); log(`Suspended ${b.name}${b.reason ? ' — ' + b.reason : ''}`, b.id); closeModal(); C.render(); toast(tp('done_susp', { b: b.name })); },
  pReact: el => { const b = bizOf(el.dataset.id); if (!b) return; b.status = 'active'; delete b.reason; log(`Reactivated ${b.name}`, b.id); C.render(); toast(tp('done_react', { b: b.name })); },
  pStartPaid: el => { const b = bizOf(el.dataset.id); if (!b) return; b.status = 'active'; b.renew = addDays(today0(), 30).toISOString(); delete b.trialEnds; log(`Started paid ${planName(b.plan)} plan for ${b.name}`, b.id); C.render(); toast(tp('done_react', { b: b.name })); },
  pExtend: el => { const b = bizOf(el.dataset.id); if (!b) return; b.trialEnds = addDays(new Date(b.trialEnds || today0()), 14).toISOString(); log(`Extended trial for ${b.name} to ${isoDay(b.trialEnds)}`, b.id); C.render(); toast(tp('done_trial', { d: fFull(b.trialEnds) })); },
  pPlanSheet: el => { const b = bizOf(el.dataset.id); if (!b) return; modal(`<h2>${tp('changePlan')} · ${esc(b.name)}</h2><div class="stack-xs">${['starter', 'growth', 'pro'].map(p => `<button class="opt ${b.plan === p ? 'on' : ''}" data-x="pPlan" data-id="${b.id}" data-p="${p}"><span class="radio"></span><span class="grow"><b>${planName(p)}</b> · ${rm(D.plans[p].price)}<br><span class="small muted">${tp('planLimits', { o: D.plans[p].outlets, s: D.plans[p].staff || tp('unlimited') })}</span></span></button>`).join('')}</div><button class="btn btn-ghost" data-x="closeModal">${A.t('notNow')}</button>`); },
  pPlan: el => { const b = bizOf(el.dataset.id); if (!b) return; b.plan = el.dataset.p; log(`Moved ${b.name} to ${planName(b.plan)}`, b.id); closeModal(); C.render(); toast(tp('done_plan', { b: b.name, p: planName(b.plan) })); },
  pMsg: el => { const b = bizOf(el.dataset.id); if (!b) return; modal(`<h2>${tp('msgTo', { b: esc(b.name) })}</h2><textarea class="field" id="pMsgBody" placeholder="${tp('msgPh')}"></textarea><div class="row-start gap8"><button class="btn btn-primary" data-x="pMsgSend" data-id="${b.id}">${tp('send')}</button><button class="btn btn-ghost" data-x="closeModal">${A.t('notNow')}</button></div>`); },
  pMsgSend: el => { const b = bizOf(el.dataset.id), txt = (($('#pMsgBody') || {}).value || '').trim(); if (!b || !txt) return; log(`Message to ${b.name}: ${txt.slice(0, 80)}`, b.id); closeModal(); C.render(); toast(tp('done_msg', { b: b.name })); },
  pOpenAdmin: el => { if (el.dataset.id !== 'lumiere') toast(tp('demoOnlyLum'), true); setTimeout(() => { location.href = '../admin/'; }, el.dataset.id === 'lumiere' ? 0 : 1500); },
  pInvPaid: el => { const x = D.inv.find(v => v.id === el.dataset.id); if (!x) return; x.status = 'paid'; x.paidAt = new Date().toISOString(); const b = bizOf(x.biz); log(`Marked ${x.no} paid (${b ? b.name : x.biz})`, x.biz); C.render(); toast(tp('done_paid')); },
  pRemind: el => { const x = D.inv.find(v => v.id === el.dataset.id); if (!x) return; const b = bizOf(x.biz); log(`Sent payment reminder for ${x.no} to ${b ? b.name : x.biz}`, x.biz); C.render(); toast(tp('done_remind', { b: b ? b.name : '' })); },
  pUserToggle: el => { const u = D.users.find(v => v.id === el.dataset.id); if (!u) return; u.status = u.status === 'active' ? 'disabled' : 'active'; log(`${u.status === 'active' ? 'Enabled' : 'Disabled'} user ${u.name} (${u.email})`, u.biz); C.render(); toast(tp('done_user', { n: u.name, s: tp('st_' + u.status) })); },
  pResetPw: el => { const u = D.users.find(v => v.id === el.dataset.id); if (!u) return; log(`Sent password reset to ${u.email}`, u.biz); C.render(); toast(tp('done_pw', { e: u.email })); },
  pTicket: el => ticketModal(el.dataset.id),
  pTicketSave: el => {
    const t = D.tickets.find(x => x.id === el.dataset.id); if (!t) return;
    const txt = (($('#pReply') || {}).value || '').trim(), st = ($('#pTkStatus') || {}).value || t.status, as = ($('#pTkAssign') || {}).value;
    if (txt) t.msgs.push({ by: 'You', at: new Date().toISOString(), text: txt, staff: true });
    t.status = txt && st === 'open' ? 'progress' : st; t.assigned = as || (txt ? 'You' : t.assigned); t.updated = new Date().toISOString();
    log(`${txt ? 'Replied to' : 'Updated'} ${t.id} (${(bizOf(t.biz) || {}).name || ''}) · ${tp('st_' + t.status)}`, t.biz); closeModal(); C.render(); toast(tp('done_reply'));
  },
  pReportXls: () => reportXls(),
  pAnnSend: () => {
    const title = (($('#pAnnTitle') || {}).value || '').trim(), body = (($('#pAnnBody') || {}).value || '').trim(); if (!title || !body) return;
    D.ann.unshift({ at: new Date().toISOString(), title, body }); const n = D.biz.filter(b => b.status !== 'suspended').length;
    log(`Sent announcement: ${title}`); C.render(); toast(tp('done_ann', { n }));
  },
  pResetAsk: () => modal(`<h2>${tp('resetP')}</h2><p class="muted">${tp('sample')}</p><div class="row-start gap8"><button class="btn btn-primary" data-x="pResetDo">${tp('resetP')}</button><button class="btn btn-ghost" data-x="closeModal">${A.t('notNow')}</button></div>`),
  pResetDo: () => { D = seed(); save(); Object.keys(C.TB).filter(k => k.startsWith('p_')).forEach(k => delete C.TB[k]); closeModal(); C.render(); toast(tp('resetPDone')); },
};
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.pfeat) { const b = bizOf(el.dataset.id); if (!b) return; b.features[el.dataset.pfeat] = el.checked; log(`${el.checked ? 'Switched on' : 'Switched off'} ${P['f_' + el.dataset.pfeat][0]} for ${b.name}`, b.id); toast(tp('done_saved')); return; }
  if (el.dataset.pplan) { const v = Math.round(Number(el.value)); if (v > 0) { D.plans[el.dataset.pplan].price = v; log(`Set ${P['pl_' + el.dataset.pplan][0]} price to RM${v}/month`); C.render(); toast(tp('done_saved')); } return; }
  if (el.dataset.prule) { const v = Number(el.value); if (v >= 0) { D.rules[el.dataset.prule] = v; log(`Set ${P[el.dataset.prule][0]} to ${v}`); C.render(); toast(tp('done_saved')); } }
});
window.addEventListener('storage', e => { if (e.key === PKEY) { D = store.get() || seed(); C.render(); } });

/* ------------------------------------------------------------------ plug into the console shell */
C.use({
  nav: [['/', 'home', () => tp('p_over')], ['/businesses', 'apps', () => tp('p_biz')], ['/applications', 'doc', () => tp('p_apps')], ['/billing', 'cash', () => tp('p_bill')],
    ['/users', 'users', () => tp('p_users')], ['/support', 'bell', () => tp('p_sup')], ['/reports', 'chart', () => tp('p_rep')], ['/settings', 'settings', () => tp('p_set')], ['/log', 'clock', () => tp('p_log')]],
  pages: [[/^\/$/, pOverview], [/^\/businesses$/, pBusinesses], [/^\/businesses\/(\w+)$/, pBusiness], [/^\/applications$/, pApps], [/^\/billing$/, pBilling],
    [/^\/users$/, pUsers], [/^\/support$/, pSupport], [/^\/reports$/, pReports], [/^\/settings$/, pSettings], [/^\/log$/, pLog]],
  actions,
  side: {
    title: 'appt4u Platform',
    tag: () => tp('p_tag'),
    card: () => `<div class="ad-biz">${tp('p_team')}<br><span>${tp('p_you')}</span></div>`,
    badges: () => ({ '/applications': D.apps.filter(a => a.status === 'pending').length, '/billing': D.inv.filter(x => invSt(x) === 'overdue').length, '/support': D.tickets.filter(t => t.status === 'open').length }),
    foot: () => `<a class="btn btn-sm btn-outline" href="../admin/">${icon('grid', 16)} ${tp('bizAdmin')}</a><a class="btn btn-sm btn-outline" href="../">${icon('phone', 16)} ${tp('phoneApp')}</a><p class="small muted">${tp('sample')}</p>`,
  },
});
C.render();
})();
