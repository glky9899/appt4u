/* appt4u — interactive demo with sample data. Nothing here talks to a server. */
(() => {
'use strict';
/* 'app' renders the phone app; 'admin' (admin/index.html) only shares data and helpers through window.A4U */
const MODE = document.documentElement.dataset.mode === 'admin' ? 'admin' : 'app';

/* ------------------------------------------------------------------ storage */
const KEY = 'appt4u-demo-v3';
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable: demo still works for this visit */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
};
const LANGS = [['en', 'English', 'EN'], ['ms', 'Bahasa Melayu', 'BM'], ['zh', '中文', '中文']];
const navLang = (navigator.language || '').toLowerCase();
let lang = LS.get('appt4u-lang', null);
if (!LANGS.some(l => l[0] === lang)) lang = navLang.startsWith('zh') ? 'zh' : navLang.startsWith('ms') ? 'ms' : 'en';
const htmlLang = l => l === 'zh' ? 'zh-Hans' : l;

/* ------------------------------------------------------------------ strings */
const STR = {
  back: ['Back', '返回'], done: ['Done', '完成'], save: ['Save', '保存'], saved: ['Saved', '已保存'], notNow: ['Not now', '暂不'],
  any: ['Any', '任意'], mins: ['{n} mins', '{n} 分钟'], today: ['Today', '今天'],
  welcomeT: ['Book beauty & wellness near you', '预约附近的美容与健康服务'],
  welcomeSub: ['Facials, hair, nails and pilates — book in seconds, track your packages and get reminders.', '面部护理、美发、美甲与普拉提——几秒完成预约，查看疗程，按时提醒。'],
  signInPhone: ['Sign in with phone number', '用电话号码登录'], exploreDemo: ['Explore the demo', '浏览演示'],
  demoNote: ['Demo with sample data', '示例数据演示'],
  phoneTitle: ['Your phone number', '你的电话号码'], phoneSub: ['We’ll send you a 6-digit code by SMS.', '我们会以短信发送 6 位验证码。'],
  sendCode: ['Send code', '发送验证码'], phoneInvalid: ['Enter a valid phone number', '请输入有效的电话号码'],
  otpTitle: ['Enter the code', '输入验证码'], otpSub: ['Sent to {p}. Demo: any 6 digits will work.', '已发送至 {p}。演示：任意 6 位数字即可。'],
  verify: ['Verify', '验证'], otpInvalid: ['Enter the 6-digit code', '请输入 6 位验证码'],
  agree: ['By continuing you agree to the PDPA notice and booking terms of the businesses you book with.', '继续即表示你同意所预约商家的 PDPA 声明与预约条款。'],
  chooseRole: ['View the demo as', '以哪种身份浏览演示'],
  r_member: ['Member', '会员'], r_memberSub: ['Find salons, book, wallet', '找沙龙、预约、钱包'],
  r_admin: ['Owner / admin', '老板 / 管理员'], r_adminSub: ['Today, diary, counter, reports', '今日、日程、柜台、报表'],
  r_therapist: ['Staff / freelancer', '员工 / 自由职业'], r_therapistSub: ['Schedule, treatment times, sales and earnings', '日程、护理计时、销售与收入'],
  r_agent: ['Agent / introducer', '代理 / 介绍人'], r_agentSub: ['Referrals and commission', '推荐与佣金'],
  tabHome: ['Home', '首页'], tabBookings: ['Bookings', '预约'], tabWallet: ['Wallet', '钱包'], tabProfile: ['Profile', '我的'],
  loc: ['Location', '位置'], locVal: ['Kuala Lumpur, Malaysia', '马来西亚 吉隆坡'], searchPh: ['Search salon, studio or treatment', '搜索沙龙、工作室或护理项目'],
  services: ['Services', '服务'], nearby: ['Nearby salons & studios', '附近的沙龙与工作室'], viewMap: ['View on map', '地图查看'],
  km: ['{n} km', '{n} 公里'], reviews: ['({n})', '（{n}）'], noResults: ['No matches nearby', '附近没有符合的结果'],
  cat_all: ['All', '全部'], cat_facial: ['Facial', '面部护理'], cat_hair: ['Hair', '美发'], cat_nails: ['Nails & lash', '美甲美睫'], cat_body: ['Body & spa', '身体与水疗'], cat_pilates: ['Pilates', '普拉提'],
  promoEyebrow: ['Weekday special!', '平日特惠！'], promoTitle: ['Get 20% off', '享 8 折优惠'], promoSub: ['Facials booked 10am–1pm, Mon–Fri', '周一至周五 10:00–13:00 面部护理'], bookNowBtn: ['Book now', '立即预约'],
  noNotifs: ['No new notifications', '暂无新通知'], upNext: ['Upcoming', '即将到来'], showQR: ['Show QR', '出示 QR'],
  yourWallet: ['Your wallet at {b}', '你在 {b} 的钱包'], walletLine: ['{s} sessions · {v} stored value', '{s} 次疗程 · 储值 {v}'],
  aftercareCard: ['Care tips after your last facial', '上次护理后的护理贴士'],
  favAdded: ['Saved to favourites', '已加入收藏'], favRemoved: ['Removed from favourites', '已取消收藏'],
  continueN: ['Continue ({n})', '继续（{n}）'], selectSvc: ['Select services', '请选择服务'],
  inPackage: ['In your package · {n} left', '已含在疗程中 · 剩 {n} 次'],
  installTitle: ['Install appt4u', '安装 appt4u'], installIOS: ['Tap Share, then “Add to Home Screen”.', '点「分享」，再点「添加到主屏幕」。'],
  installAndroid: ['Add it to your home screen for one-tap booking.', '添加到主屏幕，一键预约。'], installBtn: ['Install', '安装'],
  bookTitle: ['Choose a time', '选择时间'], staff: ['Staff', '服务人员'], pickDate: ['Date', '日期'], pickTime: ['Time', '时间'], full: ['full', '满'],
  payWith: ['Pay with', '付款方式'], payPackage: ['Package · {n} left', '疗程 · 剩 {n} 次'], payStored: ['Stored value · {b}', '储值 · {b}'],
  payStore: ['Pay at the counter', '到店付款'], roomAuto: ['Room and device are assigned for you', '护理室与仪器将自动安排'],
  policy: ['Free cancellation up to {h} hours before.', '预约前 {h} 小时可免费取消。'], chooseTime: ['Choose a time', '请选择时间'],
  bookNowAt: ['Book now · {p}', '立即预约 · {p}'], totalLine: ['{p} · {m} mins', '{p} · {m} 分钟'],
  booked: ['You’re booked', '预约成功'], heldPkg: ['1 session held from your package', '已从疗程预留 1 次'],
  heldStored: ['{a} held from stored value', '已从储值预留 {a}'], payAtStore: ['Pay at the counter on the day', '当天在柜台付款'],
  addCal: ['Add to your calendar?', '加入日历？'], calWhy: ['Get it in your phone’s calendar with a reminder 2 hours before.', '加入手机日历，提前 2 小时提醒。'],
  appleCal: ['Apple Calendar', 'Apple 日历'], googleCal: ['Google Calendar', 'Google 日历'], otherCal: ['Outlook or other (.ics)', 'Outlook 或其他（.ics）'],
  alwaysDo: ['Always do this', '以后都这样做'], addTo: ['Add to {c}', '加入{c}'], addToCalendar: ['Add to calendar', '加入日历'],
  addedCal: ['Sent to your calendar', '已发送至日历'],
  upcoming: ['Upcoming', '即将到来'], past: ['Past', '过往'], noBooking: ['No upcoming bookings', '暂无即将到来的预约'], noPast: ['No past bookings yet', '暂无过往预约'],
  findSalon: ['Find a salon', '寻找沙龙'], cancel: ['Cancel', '取消'], cancelQ: ['Cancel this booking?', '取消这个预约？'],
  cancelFreeInfo: ['You’re more than {h} hours before, so nothing is charged.', '距离预约超过 {h} 小时，不会扣除任何费用。'],
  cancelLateInfo: ['Less than {h} hours to go: this is a late cancel and the session is used.', '距离预约不足 {h} 小时：视为逾时取消，将扣除次数。'],
  keep: ['Keep booking', '保留预约'], yesCancel: ['Yes, cancel', '确认取消'],
  cancelledToast: ['Cancelled. Nothing was charged.', '已取消，未扣除任何费用。'],
  lateToast: ['Cancelled late. The session was used as per policy.', '已逾时取消，按规定扣除次数。'],
  st_booked: ['Booked', '已预约'], st_completed: ['Completed', '已完成'], st_cancelled: ['Cancelled', '已取消'], st_late: ['Late cancel', '逾时取消'],
  walletTitle: ['Wallet', '钱包'], tabPackages: ['Packages', '疗程'], tabStored: ['Stored value', '储值'], tabVouchers: ['Vouchers', '礼券'],
  remaining: ['{n} sessions left', '剩余 {n} 次'], legend: ['Used {u} · Booked {h} · Available {a}', '已用 {u} · 已预约 {h} · 可用 {a}'],
  validUntil: ['Valid until {d}', '有效期至 {d}'], statement: ['Statement', '账单'], available: ['Available balance', '可用余额'],
  heldNote: ['{a} held for upcoming bookings', '{a} 已为即将到来的预约预留'],
  offersT: ['Offers to claim', '可领取的优惠'], myVouchers: ['My vouchers', '我的礼券'], voucherUse: ['Show your member QR at the counter to use it.', '在柜台出示会员 QR 码即可使用。'],
  offer1: ['Top up RM1,000, get RM150 free', '储值 RM1,000 送 RM150'], offer1Sub: ['In store, until {d}', '到店充值，至 {d}'],
  offer2: ['Birthday month: 15% off a facial', '生日月：面部护理 85 折'], offer2Sub: ['Valid all this month', '本月内有效'],
  claim: ['Claim', '领取'], claimed: ['Claimed', '已领取'], claimedToast: ['Saved to your wallet as a voucher', '已作为礼券存入钱包'],
  k_purchase: ['Bought in store', '门店购买'], k_use: ['Used', '已使用'], k_topup: ['Top-up in store', '门店充值'], k_bonus: ['Top-up bonus', '充值赠送'],
  k_late: ['Late cancel', '逾时取消'], balShort: ['bal {b}', '余 {b}'],
  pdfToast: ['PDF statements come in the full version', '完整版提供 PDF 账单'],
  goldMember: ['Gold member', '金卡会员'], myQR: ['My member QR', '我的会员 QR 码'],
  qrHint: ['Show at the counter to pay, redeem or check in.', '在柜台出示，用于付款、核销或签到。'], qrDemo: ['Demo code — not scannable', '演示用，无法扫描'],
  skinProfile: ['Skin profile & consent', '皮肤档案与同意书'], myBookings: ['My bookings', '我的预约'], favourites: ['Favourites', '收藏'],
  calendarSet: ['Calendar', '日历'], calAsk: ['Ask every time', '每次询问'],
  notifications: ['Notifications', '通知'], n_rem: ['Booking reminders', '预约提醒'], n_offers: ['Offers', '优惠'], n_after: ['Aftercare tips', '护理贴士'],
  n_note: ['Booking confirmations and changes are always sent.', '预约确认与变更通知一定会发送。'],
  language: ['Language', '语言'], refer: ['Refer a friend', '推荐好友'], switchRole: ['Switch demo view', '切换演示身份'],
  resetDemo: ['Reset demo data', '重置演示数据'], resetQ: ['Reset all demo data?', '重置所有演示数据？'],
  resetInfo: ['Bookings, sales and settings you changed here go back to the sample data.', '你在这里的预约、销售与设置将恢复为示例数据。'],
  signOut: ['Sign out', '退出登录'],
  skinTitle: ['Skin profile', '皮肤档案'], skinType: ['Skin type', '肤质'], concerns: ['Main concerns', '主要困扰'], allergies: ['Allergies & cautions', '过敏与禁忌'],
  consent: ['Treatment consent', '护理同意书'], signed: ['Signed', '已签署'], signedOn: ['Signed {d} · version 2', '{d} 签署 · 版本 2'],
  photos: ['Before/after photos', '前后对比照'], ph_archive: ['Keep on file only', '仅存档'], ph_marketing: ['May be used in marketing', '可用于宣传'], ph_no: ['Don’t take photos', '不拍照'],
  reviewNote: ['Reviewed yearly. Your therapist reads this before every treatment.', '每年复核，美容师在每次护理前查看。'],
  ty_dry: ['Dry', '干性'], ty_oily: ['Oily', '油性'], ty_combo: ['Combination', '混合性'], ty_sensitive: ['Sensitive', '敏感'], ty_normal: ['Normal', '中性'],
  co_dull: ['Dullness', '暗沉'], co_pores: ['Pores', '毛孔'], co_acne: ['Breakouts', '痘痘'], co_pig: ['Pigmentation', '色斑'], co_lines: ['Fine lines', '细纹'],
  aftercareTitle: ['Aftercare', '护理后关怀'], within24: ['For the next 24 hours', '24 小时内'],
  tip1: ['Avoid sauna and hot showers', '避免桑拿与高温'], tip2: ['Pause exfoliants and retinoids', '暂停去角质与 A 酸'], tip3: ['Moisturise and wear sunscreen', '加强保湿与防晒'],
  nextSuggested: ['Suggested next visit', '下一次建议'], interval: ['Every 14 days · session {n} of {t}', '间隔 14 天 · 第 {n} / {t} 次'],
  bookOneTap: ['Book {t} with {p}', '一键预约 {t} · {p}'], recommended: ['Recommended for home', '推荐居家产品'],
  serum: ['Repair Serum 30ml', '修护精华 30ml'], inStore: ['Buy in store', '到店购买'],
  aToday: ['Today', '今日'], aDiary: ['Diary', '日程'], aMembers: ['Members', '会员'], aReports: ['Reports', '报表'], aMore: ['More', '更多'],
  mainBranch: ['Main branch', '总店'], recordSale: ['Record sale', '记录销售'],
  kBookings: ['Bookings', '预约'], kArrived: ['Arrived', '已到店'], kSales: ['Sales today', '今日销售'], kRoom: ['Room use', '房间使用率'],
  vsLastWeek: ['Changes are vs the same day last week.', '变化与上周同日比较。'], needs: ['Needs attention', '需要处理'],
  att1: ['2 clients haven’t signed consent', '2 位顾客未签同意书'], att2: ['3 packages expire within 14 days', '3 个疗程 14 天内到期'],
  att3: ['3 open slots this afternoon', '下午仍有 3 个空档'], att4: ['Kelvin’s commission statement to approve', 'Kelvin 的佣金账单待批'],
  appts: ['Today’s appointments', '今日预约'], checkIn: ['Check in', '签到'], arrivedSt: ['Arrived', '已到店'], doneSt: ['Done', '已完成'],
  diaryNote: ['A time is only offered when the therapist, room and device are all free.', '只有美容师、房间与仪器同时空闲，才会开放该时段。'],
  room1: ['Room 1', '护理室 1'], room2: ['Room 2', '护理室 2'], hydraDevice: ['Hydra device', '水光仪'], clean: ['Clean', '清洁'], lunch: ['Lunch', '午休'],
  lg_treat: ['Therapist', '美容师'], lg_room: ['Room / device', '房间 / 仪器'], lg_mine: ['Mei Ling (member demo)', 'Mei Ling（会员演示）'], lg_clean: ['Cleaning / break', '清洁 / 休息'],
  search: ['Search by name', '搜索姓名'],
  seg_all: ['All', '全部'], seg_vip: ['VIP', 'VIP'], seg_loyal: ['Loyal', '忠实'], seg_new: ['New', '新客'], seg_atrisk: ['At risk', '流失风险'], seg_away: ['Away with balance', '有余额未到访'], seg_lost: ['Lost', '已流失'],
  act_vip: ['Thank them personally and offer priority booking.', '亲自致谢，提供优先预约。'], act_loyal: ['Offer a bigger package.', '推荐更大的配套。'],
  act_new: ['Push for the second visit.', '促成第二次到访。'], act_atrisk: ['Call them or send a win-back offer.', '致电或发送回流优惠。'],
  act_away: ['Remind them they still have sessions left.', '提醒他们还有剩余次数。'], act_lost: ['Send a low-cost reactivation offer.', '发送低成本唤回优惠。'],
  lastVisit: ['Last visit {n}d ago', '上次到访 {n} 天前'], balLeft: ['Balance {b}', '余额 {b}'], noMembers: ['No members found', '没有符合的会员'],
  ltv: ['Lifetime spend', '累计消费'], visits12: ['Visits, last 12 months', '12 个月到访'], balanceLeft: ['Balance left', '剩余余额'],
  pkgsBought: ['Packages bought', '购买配套'], rebuy: ['Buys again every', '复购周期'], weeks: ['~{n} weeks', '约 {n} 周'],
  lastVisitL: ['Last visit', '上次到访'], daysAgo: ['{n} days ago', '{n} 天前'], introBy: ['Introduced by {n}', '由 {n} 介绍'],
  notes: ['Therapist notes', '美容师备注'], note1: ['Sensitive skin; allergic to salicylic acid. Prefers afternoons.', '敏感肌，对水杨酸过敏；偏好下午时段。'],
  noteGen: ['Prefers quiet sessions. Likes the hydrating range.', '喜欢安静的护理时段，偏爱补水系列。'],
  consentOk: ['Consent signed', '已签同意书'], consentMissing: ['Consent not signed', '未签同意书'],
  customer: ['Customer', '顾客'], item: ['Item', '项目'], payMethod: ['Payment method', '付款方式'],
  m_cash: ['Cash', '现金'], m_card: ['Card', '刷卡'], m_duitnow: ['DuitNow QR', 'DuitNow QR'], m_ewallet: ['E-wallet', '电子钱包'],
  receiptNo: ['Till receipt no.', '收银单号'], soldBy: ['Sold by', '销售人'], frontDesk: ['Sara · Front desk', 'Sara · 前台'],
  introducer: ['Introducer', '介绍人'], none: ['None', '无'], total: ['Total', '合计'], needReceipt: ['Enter the till receipt number', '请填写收银单号'],
  saleDone: ['Sale recorded', '销售已记录'], addedTo: ['Added to {n}’s wallet', '已存入 {n} 的钱包'], pushSent: ['Push receipt sent to the member', '已向会员发送推送收据'],
  commLines: ['Commission lines created', '已生成佣金记录'], newSale: ['New sale', '新销售'], seeMember: ['See it in the member app', '到会员端查看'],
  productOnly: ['Product sale — nothing added to the wallet', '产品销售，不存入钱包'], plusBonus: ['{a} + {b} bonus', '{a} + 赠送 {b}'],
  rTitle: ['Reports', '报表'], p_month: ['Month', '月'], p_quarter: ['Quarter', '季'], p_year: ['12 months', '12 个月'],
  c_prev: ['vs previous', '较上期'], c_ly: ['vs last year', '较去年同期'],
  r_cash: ['Cash collected', '收款金额'], r_earned: ['Revenue earned', '已实现营收'], r_unused: ['Unused package value', '未用疗程价值'],
  r_active: ['Active customers / month', '月活跃顾客'], r_avg: ['Spend per customer / month', '每位顾客月消费'], r_ret: ['Returning customers', '回头客比例'],
  r_ren: ['Package renewal', '疗程续购率'], r_new: ['New customers', '新顾客'],
  trend: ['Cash vs revenue earned · 13 months', '收款与已实现营收 · 13 个月'], cashL: ['Cash collected', '收款'], earnedL: ['Revenue earned', '已实现营收'],
  why: ['Why revenue changed', '营收变化原因'], whySub: ['Revenue = customers × visits each × spend per visit', '营收 = 顾客数 × 人均到访 × 每次消费'],
  w_cust: ['Customers', '顾客数'], w_visits: ['Visits each', '人均到访'], w_spend: ['Spend / visit', '每次消费'],
  unusedT: ['Unused package value', '未用疗程价值'], unusedSub: ['Sessions customers paid for but haven’t used yet', '顾客已付款但尚未使用的次数'],
  rf_open: ['Opening balance', '期初余额'], rf_sold: ['+ Packages sold', '+ 售出配套'], rf_used: ['− Used (earned)', '− 已使用（已实现）'],
  rf_exp: ['− Expired unused', '− 过期未用'], rf_adj: ['± Refunds & adjustments', '± 退款与调整'], rf_close: ['Closing balance', '期末余额'],
  byExpiry: ['Unused value by expiry', '按到期时间的未用价值'], e30: ['≤ 30 days', '30 天内'], e90: ['31–90 days', '31–90 天'], e180: ['91–180 days', '91–180 天'], eLater: ['> 180 days', '180 天以上'],
  custN: ['{n} customers', '{n} 位顾客'],
  ranking: ['Treatments ranked', '项目排名'], mt_rev: ['Revenue', '营收'], mt_sessions: ['Sessions', '次数'], mt_profit: ['Profit / hour', '每小时利润'], mt_growth: ['Growth', '增长'],
  highest: ['Highest', '最高'], lowest: ['Lowest', '最低'],
  quad: ['Popularity vs profit', '受欢迎度与利润'], q_star: ['Stars', '明星'], q_work: ['Workhorses', '主力'], q_gem: ['Hidden gems', '潜力'], q_weak: ['Weak', '弱项'],
  quadNote: ['Stars: promote. Workhorses: raise price or cut cost. Hidden gems: market more. Weak: redesign or drop.', '明星：重点推广；主力：调价或降本；潜力：加强推广；弱项：调整或下架。'],
  axSessions: ['Sessions / month →', '每月次数 →'], axProfit: ['Profit / hour ↑', '每小时利润 ↑'],
  topCust: ['Top customers · last 12 months', '消费最高的顾客 · 12 个月'], conc: ['Top 10% of customers bring {p} of revenue.', '前 10% 顾客贡献 {p} 营收。'],
  c_spend: ['Spend', '消费'], c_visits: ['Visits', '到访'], c_avg: ['Avg / visit', '每次平均'], sample: ['Sample data', '示例数据'],
  commission: ['Commission statements', '佣金账单'], promotions: ['Promotions', '促销'], settings: ['Business settings', '商家设置'],
  approve: ['Approve', '批准'], approved: ['Approved', '已批准'], markPaid: ['Mark paid', '标记已付'], paidSt: ['Paid', '已付'],
  stmtFor: ['Statements for {m}', '{m}账单'], sessionsN: ['{n} sessions', '{n} 次'], salesComm: ['Sales commission 5%', '销售提成 5%'], introComm: ['Introducer 10%', '介绍人佣金 10%'],
  promoStats: ['Shown {a} · claimed {b} · used {c}', '展示 {a} · 领取 {b} · 使用 {c}'], promoConv: ['{a} new customers · {b} bought a package', '{a} 位新客 · {b} 购买配套'],
  pr1: ['Top-up bonus RM150', '充值赠送 RM150'], pr2: ['Birthday 15% off', '生日 85 折'], pr3: ['Weekday 20% off facials', '平日面部护理 8 折'], pr4: ['First facial RM98', '首次面部护理 RM98'],
  set_window: ['Booking window', '开放预约'], set_cut: ['Free cancellation until', '免费取消时限'], set_grace: ['No-show after', '未到判定'],
  set_buffer: ['Cleaning buffer', '清洁缓冲'], set_expiry: ['Package validity', '疗程有效期'], set_rem: ['Reminders', '提醒'], set_brand: ['Brand colours', '品牌颜色'],
  v_7d: ['7 days ahead', '提前 7 天'], v_12h: ['12 hours before', '提前 12 小时'], v_15m: ['15 minutes late', '迟到 15 分钟'], v_buf: ['15 minutes', '15 分钟'],
  v_6m: ['6 months', '6 个月'], v_rem: ['24 h and 2 h before', '提前 24 小时及 2 小时'], editFull: ['Editing settings comes in the full version.', '完整版可修改设置。'],
  hi: ['Hi, {n}', '你好，{n}'], tToday: ['Today', '今日'], tEarnings: ['Earnings', '收入'], earnedMonth: ['Earned this month', '本月收入'],
  startS: ['Check in', '签到'], completeS: ['Complete', '完成'], inProg: ['In progress', '进行中'], commAdded: ['Commission +{a} added', '佣金 +{a} 已计入'],
  lines: ['This month', '本月明细'], payoutHist: ['Payouts', '发放记录'], paidRef: ['Paid {d} · ref {r}', '{d} 已付 · 参考号 {r}'],
  calFeed: ['Private calendar feed', '私人日历链接'], calFeedSub: ['Subscribe once in Google or Apple Calendar and your bookings stay in sync.', '在 Google 或 Apple 日历订阅一次，预约自动同步。'],
  copy: ['Copy', '复制'], copied: ['Copied', '已复制'],
  gHome: ['Home', '首页'], gShare: ['Share', '分享'], gPayouts: ['Payouts', '发放'], myRef: ['My referrals', '我的推荐'],
  thisMonth: ['This month', '本月'], pendingApp: ['Pending approval', '待审批'], lastPaid: ['{m} paid: {a}', '{m}已付：{a}'],
  joined: ['Joined {d}', '{d}加入'], purchased: ['Purchased', '已消费'], trial: ['Trial', '体验中'],
  agentRule: ['You earn 10% of your friends’ purchases for 6 months.', '好友 6 个月内的消费，你可获得 10% 佣金。'],
  yourLink: ['Your personal link', '你的专属链接'], shareWA: ['Share on WhatsApp', '分享到 WhatsApp'], msgPreview: ['Message preview', '信息预览'],
  waMsg: ['Hi! Try {b} — book online in seconds and get your first facial for RM98: {l}', '你好！推荐你试试 {b}，在线预约，首次面部护理只需 RM98：{l}'],
  sideTitle: ['Interactive demo', '互动演示'],
  sideText: ['A mobile web app for studios and salons. On your phone, open www.appt4u.com and add it to your Home Screen — it opens full screen like a native app.', '为工作室与沙龙打造的手机网页 App。在手机打开 www.appt4u.com 并添加到主屏幕，即可像原生 App 一样全屏使用。'],
  sideRoles: ['View as', '切换身份'], sideData: ['Sample businesses and data only. Your changes stay in this browser.', '仅示例商家与数据，改动只保存在此浏览器。'],
  tSchedule: ['Schedule', '日程'], newBooking: ['New booking', '新预约'], gotIt: ['Got it', '知道了'], inCal: ['In calendar', '已在日历'],
  syncT: ['Keep your calendar in sync', '让日历保持同步'], syncSub: ['Put your appointments in your own phone calendar so you never miss one.', '把预约放进自己的手机日历，不再错过。'],
  addWeek: ['Add next 7 days', '加入未来 7 天'], subscribe: ['Auto-sync', '自动同步'],
  subInfo: ['Subscribe once and new, moved or cancelled appointments update in your calendar by themselves. Works with Google, Apple and Outlook.', '订阅一次，新增、改期或取消的预约都会自动更新到你的日历。支持 Google、Apple 与 Outlook。'],
  subDemo: ['The live feed switches on in the full version. In this demo, use “Add next 7 days”.', '实时订阅在完整版开放；演示版请使用「加入未来 7 天」。'],
  noAppts: ['No appointments this day', '当天没有预约'], apptsN: ['{n} appointments', '{n} 个预约'],
  remSet: ['Reminders', '提醒'], rem2h: ['Push 2 hours before each appointment', '每个预约前 2 小时推送'], runSheet: ['Daily run-sheet at 8:00 am', '每天早上 8 点发送当日清单'], newPush: ['Instant alert for new, moved or cancelled bookings', '新增、改期或取消时即时提醒'],
  calPrivacy: ['Your calendar shows only the client’s first name and the service. Health notes stay inside appt4u.', '日历只显示顾客名字与项目，健康备注只保留在 appt4u 内。'],
  weekAdded: ['{n} appointments sent to your calendar', '已将 {n} 个预约发送至日历'],
  calWhyT: ['You get a reminder 30 minutes before, with the client’s first name and room.', '提前 30 分钟提醒，并显示顾客名字与房间。'],
  firmPressure: ['Prefers firm pressure', '喜欢较重的力度'], pregnantNote: ['Pregnant — avoid certain essential oils', '孕期——避免部分精油'],
  walletAll: ['All stores', '全部商家'], walletsN: ['Your balances at {n} stores', '你在 {n} 家商家的余额'],
  storeRule: ['Each store’s packages and stored value can only be used at that store.', '每家商家的疗程与储值只能在该商家使用。'],
  sessionsL: ['Sessions left', '剩余次数'], expInDays: ['Expires in {n} days', '{n} 天后到期'], leftN: ['{n} left', '剩 {n} 次'],
  expiringN: ['{n} expiring soon', '{n} 项即将到期'], switchStore: ['Switch store', '切换商家'], branchesN: ['{n} branches', '{n} 家分店'],
  brAllMember: ['Use at both branches: {l}', '两家分店通用：{l}'], brOriginMember: ['Use only at {l}, where you bought it', '仅限在购买分店 {l} 使用'],
  storeOnly: ['Only {b} can see these balances.', '只有 {b} 能看到这些余额。'],
  noPkgStore: ['No packages at this store', '在这家商家没有疗程'], noStoredStore: ['No stored value here. You can top up at the counter.', '这里没有储值，可到柜台充值。'],
  noOffers: ['No offers from this store right now', '这家商家暂时没有优惠'],
  qrAll: ['One QR for every store. Each store sees only its own balance with you.', '一个 QR 码通用所有商家，每家只能看到你在该店的余额。'],
  n_exp: ['Package expiry reminders', '疗程到期提醒'],
  ownOnly: ['Only {b} balances are shown. What this member holds at other businesses stays private.', '只显示在 {b} 的余额，顾客在其他商家的余额不会显示。'],
  boughtAt: ['Bought at {b}', '{b} 购买'], branches: ['Branches', '分店'], mainTag: ['main', '总店'],
  br_rule: ['Packages and stored value can be used at', '疗程与储值可使用于'], br_all: ['All branches', '所有分店'], br_origin: ['Only the branch where bought', '仅限购买分店'],
  br_allNote: ['Cash stays with the branch that sold the package. Revenue goes to the branch that did the treatment, and branches settle the difference each month.', '收款归售出疗程的分店；营收归提供护理的分店，分店之间每月结算差额。'],
  r_branch: ['By branch', '按分店'], th_cash: ['Cash', '收款'], th_earned: ['Earned', '营收'], th_unused: ['Unused', '未用'],
  r_cross: ['Used at another branch', '跨分店使用'], crossLine: ['Bought at {a}, used at {b}', '{a} 购买，{b} 使用'],
  settle: ['{a} pays {b} {v} for this period', '本期 {a} 需付 {b} {v}'],
  crossOff: ['Packages can only be used at the branch where they were bought, so there is nothing to settle.', '疗程只限购买分店使用，无需跨店结算。'],
  arrivedBtn: ['Client arrived', '顾客到店'], startBtn: ['Start', '开始'], endBtn: ['End', '结束'],
  lg_arr: ['Arrived {t}', '{t} 到店'], lg_start: ['Started {t}', '{t} 开始'], lg_end: ['Ended {t} · {m} min (planned {p})', '{t} 结束 · {m} 分钟（预计 {p}）'],
  lateBy: ['{n} min late', '迟到 {n} 分钟'], onTime: ['on time', '准时'], startLate: ['{n} min late start', '延迟 {n} 分钟开始'],
  editTimes: ['Edit times', '修改时间'], recordTimes: ['Record times', '补记时间'], f_start: ['Treatment started', '开始护理'], f_end: ['Treatment ended', '结束护理'],
  endBeforeStart: ['End time must be after the start', '结束时间必须晚于开始时间'], notRecorded: ['Times not recorded', '未记录时间'],
  cxTitle: ['Who is cancelling?', '谁要取消？'], cx_client: ['Customer cancelled', '顾客取消'], cx_noshow: ['Customer didn’t show up', '顾客没有到店'],
  cx_staff: ['I can’t make it', '我无法服务'], cx_staffA: ['Therapist can’t make it', '美容师无法服务'], cx_owner: ['Owner / admin cancelled', '老板 / 管理员取消'],
  cxLast: ['Less than 12 hours before the start: this counts as a last-minute cancellation.', '距离开始不足 12 小时，算作临时取消。'],
  cxLastShort: ['last minute', '临时取消'], cxBy: ['Cancelled by', '取消方：'], noShowL: ['no-show', '未到店'],
  W_client: ['Customer', '顾客'], W_staff: ['Staff', '员工'], W_owner: ['Owner / admin', '老板 / 管理员'],
  cxToast: ['Appointment cancelled and logged', '预约已取消并记录'], cxBySalon: ['Cancelled by {b}. No session was used.', '{b} 已取消，未扣除次数。'],
  tmTitle: ['Time & cancellations', '时间与取消'], tmSub: ['From the start, end and cancel taps your staff record', '来自员工记录的开始、结束与取消'],
  tmLost: ['Late starts cost {h} hours in the last 90 days, about {n} more treatments.', '最近 90 天因延迟开始损失 {h} 小时，约等于 {n} 次护理。'],
  tmTreat: ['Treatment time: planned vs actual', '护理时间：预计与实际'], th_plan: ['Planned', '预计'], th_actual: ['Actual', '实际'], th_diff: ['Diff', '差'],
  tmInsight: ['{s} runs {n} min over on average. Book it as {m} min so the next client isn’t kept waiting.', '{s} 平均超时 {n} 分钟，建议改为 {m} 分钟，避免下一位顾客等待。'],
  tmLateCust: ['Customers often late', '经常迟到的顾客'], th_lateVisits: ['Late / visits', '迟到 / 到访'], th_avgLate: ['Avg late', '平均迟到'],
  tmLateTip: ['Send their reminder an hour earlier, or book them just before a gap.', '提前 1 小时提醒他们，或安排在空档之前。'],
  tmCancel: ['Cancellations by who', '取消来源'], th_total: ['Total', '总数'], th_lastMin: ['Last minute', '临时'],
  tmCxCust: ['Customers who cancel last minute', '经常临时取消的顾客'], th_noShow: ['No-show', '未到'],
  tmStaff: ['Staff & freelancers', '员工与自由职业者'], th_lateStart: ['Late starts', '迟开始'], th_overrun: ['Avg over', '平均超时'], th_cx: ['Cancels', '取消'],
  tmToday: ['Recorded today', '今日记录'], ev_arr: ['arrived', '到店'], ev_start: ['started by {s}', '{s} 开始'], ev_end: ['finished in {m} min (planned {p})', '{m} 分钟完成（预计 {p}）'],
  tm90: ['Last 90 days', '最近 90 天'],
  staffId: ['ID {id}', '编号 {id}'], kind_free: ['Freelancer', '自由职业'], kind_staff: ['Staff', '员工'], kind_consult: ['Beauty consultant', '美容顾问'],
  staffAccess: ['Staff, freelancers and beauty consultants each sign in with their own ID and see their own schedule, sales and commission.', '员工、自由职业者与美容顾问各自用自己的编号登录，查看自己的日程、销售与佣金。'],
  mySales: ['My sales', '我的销售'], earnSplit: ['Treatments {a} · Sales commission {b}', '护理 {a} · 销售佣金 {b}'],
  att5: ['{n} ({t}) is usually {m} min late', '{n}（{t}）通常迟到 {m} 分钟'],
  tClaims: ['Claims', '申请'],
  newExp: ['Expense claim', '费用报销'],
  newOT: ['OT claim', '加班费申请'],
  myClaims: ['My claims', '我的申请'],
  noClaims: ['No claims yet', '暂无申请'],
  clPendingSum: ['Waiting for approval', '待审批'],
  clToPay: ['Paid with your next payout', '随下次发放支付'],
  cl_pending: ['Pending', '待审批'],
  cl_approved: ['Approved', '已批准'],
  cl_rejected: ['Rejected', '已拒绝'],
  cl_paid: ['Paid', '已付'],
  ct_ot: ['Overtime', '加班'],
  otOnlyStaff: ['OT claims are for staff. {n} is set up as a freelancer; the owner can change this in Team.', '加班费只限员工申请。{n} 目前设为自由职业，老板可在「团队」中更改。'],
  openTeam: ['Open Team as owner', '以老板身份打开团队'],
  expCat: ['Category', '类别'],
  ec_supplies: ['Supplies', '耗材'],
  ec_transport: ['Transport', '交通'],
  ec_training: ['Training', '培训'],
  ec_meals: ['Meals', '餐费'],
  ec_other: ['Other', '其他'],
  amountRM: ['Amount (RM)', '金额（RM）'],
  descL: ['What was it for?', '用途说明'],
  descPh: ['e.g. Cotton pads for Room 2', '例如：护理室 2 的化妆棉'],
  receiptL: ['Receipt photo', '收据照片'],
  addReceipt: ['Take or choose a photo', '拍照或选择照片'],
  receiptOk: ['Receipt attached', '已附收据'],
  noReceipt: ['No receipt', '无收据'],
  submitClaim: ['Submit claim', '提交申请'],
  claimSent: ['Sent to the owner for approval', '已提交，等待老板审批'],
  needAmount: ['Enter an amount', '请输入金额'],
  needDesc: ['Say what it was for', '请填写用途'],
  otDay: ['Day type', '日子类型'],
  od_normal: ['Normal day · 1.5×', '平日 · 1.5 倍'],
  od_rest: ['Rest day · 2×', '休息日 · 2 倍'],
  od_ph: ['Public holiday · 3×', '公共假期 · 3 倍'],
  otFrom: ['From', '从'],
  otTo: ['To', '至'],
  otReason: ['Reason', '原因'],
  otReasonPh: ['e.g. Last facial ran late', '例如：最后一位顾客护理超时'],
  otRate: ['Hourly rate RM{r} = monthly salary {s} ÷ 26 days ÷ 8 hours', '时薪 RM{r} = 月薪 {s} ÷ 26 天 ÷ 8 小时'],
  otSuggest: ['Your last treatment ended at {t}, after your shift ended at {s}.', '你最后一个护理在 {t} 结束，晚于下班时间 {s}。'],
  hoursN: ['{n} h', '{n} 小时'],
  team: ['Team', '团队'],
  teamSub: ['Staff, freelancers and beauty consultants', '员工、自由职业者与美容顾问'],
  empType: ['Employment type', '雇佣类型'],
  roleL: ['Role', '职位'],
  role_therapist: ['Therapist', '美容师'],
  role_consult: ['Beauty consultant', '美容顾问'],
  salaryL: ['Monthly salary (RM)', '月薪（RM）'],
  canClaim: ['Can claim', '可申请'],
  claimsStaff: ['Expenses and OT', '费用报销与加班费'],
  claimsFree: ['Expenses only', '仅费用报销'],
  typeNote: ['Staff can claim expenses and overtime. Freelancers can claim expenses only.', '员工可申请费用报销与加班费；自由职业者只能申请费用报销。'],
  typeChanged: ['{n} is now: {k}', '{n} 已改为：{k}'],
  claimsT: ['Staff claims', '员工报销与加班'],
  toApprove: ['To approve', '待审批'],
  toPay: ['Approved, to pay', '已批准，待付款'],
  doneClaims: ['Paid & rejected', '已付与已拒绝'],
  reject: ['Reject', '拒绝'],
  nothingHere: ['Nothing here', '暂无'],
  att6: ['{n} staff claims to approve', '{n} 项员工申请待审批'],
  att7: ['{n} overdue invoices', '{n} 张发票逾期'],
  invoices: ['Invoices', '发票'],
  newInvoice: ['New invoice', '新建发票'],
  invoiceWord: ['Invoice', '发票'],
  invDate: ['Date', '日期'],
  invNo: ['Invoice no.', '发票号码'],
  billTo: ['Bill to', '收票人'],
  otherCust: ['Someone else (company or walk-in)', '其他客户（公司或散客）'],
  custName: ['Name or company', '姓名或公司'],
  custContact: ['Phone or email', '电话或电邮'],
  items: ['Items', '项目'],
  addItem: ['+ Add item', '+ 添加项目'],
  otherItem: ['Custom item', '自定义项目'],
  itemDescPh: ['Describe the item', '项目说明'],
  qty: ['Qty', '数量'],
  unitPrice: ['Price', '单价'],
  discount: ['Discount (RM)', '折扣（RM）'],
  sst: ['Add SST 8%', '加收 8% SST'],
  subtotal: ['Subtotal', '小计'],
  discL: ['Discount', '折扣'],
  dueL: ['Due date', '到期日'],
  invNotes: ['Notes', '备注'],
  invNotesPh: ['e.g. Thank you! Packages are valid for 6 months.', '例如：谢谢惠顾！疗程有效期 6 个月。'],
  saveDraft: ['Save draft', '保存草稿'],
  issueInv: ['Issue invoice', '开具发票'],
  inv_draft: ['Draft', '草稿'],
  inv_issued: ['Unpaid', '未付'],
  inv_paid: ['Paid', '已付'],
  inv_overdue: ['Overdue', '逾期'],
  invAll: ['All', '全部'],
  amountDue: ['Amount due', '应付金额'],
  markPaidInv: ['Mark as paid', '标记已付'],
  payHow: ['How was it paid?', '付款方式？'],
  sendWA: ['WhatsApp', 'WhatsApp'],
  printPdf: ['Print / PDF', '打印 / PDF'],
  waDemo: ['In the full version this opens WhatsApp with a link to the invoice.', '完整版会打开 WhatsApp 并附上发票链接。'],
  invIssued: ['Invoice {n} issued', '发票 {n} 已开具'],
  invDraftSaved: ['Draft saved', '草稿已保存'],
  needItems: ['Add at least one item', '请至少添加一个项目'],
  needCust: ['Enter who to bill', '请填写收票人'],
  invFromSale: ['Create invoice', '开具发票'],
  viewInv: ['View invoice', '查看发票'],
  outstanding: ['Unpaid', '未收'],
  paidMonth: ['Paid this month', '本月已收'],
  paidOn: ['Paid {d} · {m}', '{d} 已付 · {m}'],
  editInv: ['Edit', '编辑'],
  noInvoices: ['No invoices here', '这里没有发票'],
  ad_full: ['Admin · full version', '管理后台 · 完整版'],
  ad_fullLink: ['Full admin for computers', '电脑版完整管理后台'],
  ad_phone: ['Open phone app', '打开手机版'],
  ad_dash: ['Dashboard', '概览'],
  ad_appts: ['Appointments', '预约'],
  ad_search: ['Search', '搜索'],
  ad_rows: ['{n} rows', '{n} 行'],
  ad_excel: ['Export to Excel', '导出 Excel'],
  ad_template: ['Import template', '导入模板'],
  ad_import: ['Import from Excel', '从 Excel 导入'],
  ad_importDone: ['{n} invoices imported as drafts', '已导入 {n} 张发票（草稿）'],
  ad_importSkip: ['Rows skipped ({n}):', '跳过 {n} 行：'],
  ad_importNone: ['No invoices found. Use the import template and keep the first row as headers.', '没有找到发票。请使用导入模板，并保留第一行标题。'],
  ad_importErr: ['Could not read this file. Save it as .xlsx and try again.', '无法读取此文件，请另存为 .xlsx 后重试。'],
  ad_rowNoCust: ['row {r}: no customer', '第 {r} 行：没有客户'],
  ad_rowNoItem: ['row {r}: no item or price', '第 {r} 行：没有项目或价格'],
  ad_xlsLoading: ['Preparing your Excel file…', '正在生成 Excel 文件…'],
  ad_xlsFail: ['Could not create the Excel file. Check your connection and try again.', '无法生成 Excel 文件，请检查网络后重试。'],
  ad_downloaded: ['Downloaded {f}', '已下载 {f}'],
  ad_sample: ['Demo with sample data. Changes are shared with the phone app in this browser.', '示例数据演示。改动会与本浏览器中的手机版同步。'],
  ad_actions: ['Actions', '操作'],
  ad_status: ['Status', '状态'],
  ad_type: ['Type', '类型'],
  ad_person: ['Person', '人员'],
  ad_tier: ['Tier', '等级'],
  ad_segment: ['Segment', '分群'],
  ad_lastDays: ['Last visit (days ago)', '上次到访（天前）'],
  ad_contact: ['Contact', '联系方式'],
  ad_method: ['Payment method', '付款方式'],
  ad_paidDate: ['Paid on', '付款日期'],
  ad_details: ['Details', '详情'],
  ad_hours: ['Hours', '小时'],
  ad_room: ['Room', '房间'],
  ad_client: ['Client', '顾客'],
  ad_treatment: ['Treatment', '项目'],
  ad_time: ['Time', '时间'],
  ad_arrived: ['Arrived', '到店'],
  ad_started: ['Started', '开始'],
  ad_ended: ['Ended', '结束'],
  ad_lateC: ['Client late (min)', '顾客迟到（分钟）'],
  ad_lateS: ['Late start (min)', '延迟开始（分钟）'],
  ad_exportReport: ['Export report to Excel', '导出报表 Excel'],
  ad_kpiUnpaid: ['Unpaid invoices', '未收发票'],
  ad_drafts: ['Drafts', '草稿'],
  ad_hourly: ['OT hourly rate', '加班时薪'],
  ad_salaryNA: ['Not on salary', '无月薪'],
  ad_dup: ['Duplicate', '复制'],
  ad_delete: ['Delete draft', '删除草稿'],
  ad_deleted: ['Draft deleted', '草稿已删除'],
  ad_tplHelp: ['How to fill', '填写说明'],
  ad_codes: ['Item codes', '项目代码'],
  ad_code: ['Code', '代码'],
  ad_name: ['Name', '名称'],
  ad_priceRM: ['Price (RM)', '价格（RM）'],
  ad_h1: ['One row per item. Rows with the same Ref become one invoice.', '每行一个项目；Ref 相同的行会合并为一张发票。'],
  ad_h2: ['For a member, put their Member ID (see the Members sheet). Otherwise fill in Customer name.', '会员请填写会员编号（见 Members 工作表），否则请填写客户名称。'],
  ad_h3: ['Item code is optional (see Item codes). With a code, a blank price uses the price list.', '项目代码可不填（见 Item codes）；有代码而价格留空时，将使用价目表价格。'],
  ad_h4: ['Dates as YYYY-MM-DD. Discount (RM) and SST (Y/N) are read from the first row of each invoice.', '日期格式为 YYYY-MM-DD；折扣（RM）与 SST（Y/N）读取每张发票的第一行。'],
  ad_h5: ['Imported invoices are saved as drafts so you can check them before issuing.', '导入的发票会存为草稿，方便你开具前检查。'],
  ad_h6: ['Keep the first row (headers) exactly as it is.', '请保持第一行（标题）不变。'],
  ad_preview: ['Preview', '预览'],
  ad_newFor: ['New invoice', '开发票'],
  ad_today: ['Today', '今天'],
  ad_viewAll: ['View all', '查看全部'],
  ad_salesMonth: ['Revenue earned this month', '本月已实现营收'],
  ad_cancelAppt: ['Cancel appointment', '取消预约'],
  ad_rules: ['Booking rules', '预约规则'],
  ad_demo: ['Demo data', '演示数据'],
  ad_resetDone: ['Demo data reset', '演示数据已重置'],
  ad_narrow: ['This admin is made for a computer screen. On a phone, use the phone app.', '此管理后台为电脑屏幕设计；手机上请使用手机版。'],
  ad_itemsSheet: ['Items', '明细'],
  ad_summary: ['Summary', '摘要'],
  ad_trendSheet: ['Monthly trend', '月度趋势'],
  ad_month: ['Month', '月份'],
  ad_metric: ['Measure', '指标'],
  ad_value: ['Value', '数值'],
  ad_compare: ['Compared with', '对比'],
  ad_change: ['Change', '变化'],
  r_platform: ['Platform manager (appt4u)', '平台管理员（appt4u）'],
  r_platformSub: ['All businesses, plans, approvals and support', '所有商家、方案、审批与客服'],
  contactT: ['Contact details', '联系方式'],
  f_name: ['Full name', '姓名'],
  f_phone: ['Phone', '电话'],
  f_email: ['Email', '电邮'],
  f_wechat: ['WeChat ID', '微信号'],
  contactPrivacy: ['Only the owner and people with admin access can see contact details. Other staff and freelancers can’t.', '只有老板与拥有管理员权限的人能看到联系方式，其他员工与自由职业者看不到。'],
  editMember: ['Edit member', '编辑会员'],
  memberSaved: ['Member details saved', '会员资料已保存'],
  needName: ['Enter a name', '请输入姓名'],
  noContactStaff: ['Client phone numbers, emails and social accounts are only visible to the owner and people with admin access.', '顾客的电话、电邮与社交账号只有老板与拥有管理员权限的人可见。'],
  tr_title: ['Treatment records', '护理记录'],
  tr_open: ['Treatment history', '护理记录'],
  tr_last: ['Last visit', '上次到访'],
  tr_notes: ['Treatment done', '护理内容'],
  tr_skin: ['Skin & condition', '肤况与身体状况'],
  tr_products: ['Products used', '使用产品'],
  tr_advice: ['Advice for next visit', '下次护理建议'],
  tr_add: ['Add record', '新增记录'],
  tr_comment: ['Comment', '留言'],
  tr_commentPh: ['Add a comment for the team…', '给团队留言…'],
  tr_history: ['Edit history ({n})', '修改记录（{n}）'],
  tr_created: ['created the record', '建立了记录'],
  tr_edited: ['edited {f}', '修改了「{f}」'],
  tr_commented: ['commented', '留言'],
  tr_saved: ['Record saved', '记录已保存'],
  tr_cmSaved: ['Comment added', '留言已添加'],
  tr_noChange: ['Nothing changed', '没有更改'],
  tr_none: ['No treatment records yet', '暂无护理记录'],
  tr_need: ['Write what was done', '请填写护理内容'],
  tr_who: ['Owner, admins, staff and freelancers can all read and add to these records. Every edit and comment is logged with who made it.', '老板、管理员、员工与自由职业者都能查看并补充这些记录，每次修改与留言都会记录操作人。'],
  tr_visits: ['{n} visits recorded', '已记录 {n} 次到访'],
  tr_before: ['Before', '修改前'],
  tr_after: ['After', '修改后'],
  tr_health: ['Health notes', '健康备注'],
  tr_by: ['Therapist', '美容师'],
  roleOwner: ['Owner', '老板'],
  tr_new: ['New', '新'],
  adminAccess: ['Admin access', '管理员权限'],
  adminAccessSub: ['Can see and edit client contact details (phone, email, WeChat, Facebook, Instagram).', '可查看并编辑顾客联系方式（电话、电邮、微信、Facebook、Instagram）。'],
  adminOn: ['{n} now has admin access', '{n} 已获得管理员权限'],
  adminOff: ['{n} no longer has admin access', '{n} 的管理员权限已取消'],
  adminGranted: ['Given by {b} · {d}', '{b} 于 {d} 授予'],
  adminRemoved: ['Removed by {b} · {d}', '{b} 于 {d} 取消'],
  adminYou: ['You have admin access, so you can see and edit client contact details.', '你有管理员权限，可以查看并编辑顾客联系方式。'],
  adminNote: ['Turn on Admin access only for people you trust with client contact details, such as the front desk. Everyone else sees treatment records but not contacts.', '只为可信任的人（例如前台）开启管理员权限。其他人能看到护理记录，但看不到联系方式。'],
  yesW: ['Yes', '是'],
  noW: ['No', '否'],
  f_bday: ['Birthday', '生日'],
  bdays: ['Birthdays', '会员生日'],
  bdaySub: ['Send a wish or a birthday offer before the day.', '在生日前发送祝福或生日优惠。'],
  bdayToday: ['{n}’s birthday is today', '今天是 {n} 的生日'],
  bdayTomorrow: ['{n}’s birthday is tomorrow', '明天是 {n} 的生日'],
  bdayIn: ['{n}’s birthday is in {d} days', '{n} 的生日还有 {d} 天'],
  bdayWeek: ['Birthdays in the next 7 days: {n}', '未来 7 天内生日：{n} 位'],
  bd_thisWeek: ['Next 7 days', '未来 7 天'],
  bd_month: ['Next 30 days', '未来 30 天'],
  bd_later: ['Later this year', '之后'],
  bdMissing: ['No birthday saved yet', '尚未填写生日'],
  turns: ['turns {n}', '{n} 岁'],
  inDays: ['in {n} days', '{n} 天后'],
  tomorrowW: ['Tomorrow', '明天'],
  sendWish: ['Send wish', '发送祝福'],
  bdayOffer: ['Birthday offer', '生日优惠'],
  wished: ['Wished {d}', '已于 {d} 祝福'],
  offerSent: ['Offer sent {d}', '已于 {d} 送出优惠'],
  of_pct15: ['15% off any treatment', '任何护理 85 折'],
  of_rm50: ['RM50 off a treatment', '护理立减 RM50'],
  of_addon: ['Free add-on: LED or scalp massage', '免费加购：LED 或头皮按摩'],
  of_custom: ['Write my own offer', '自定义优惠'],
  offerPh: ['e.g. Free brow shaping with any facial', '例如：任何面部护理送修眉'],
  needOffer: ['Write the offer first', '请先填写优惠内容'],
  bdayMsg: ['Happy birthday, {n}! 🎂 From all of us at {b}: {o}, valid until {d}. See you soon!', '{n}，生日快乐！🎂 {b} 全体同仁送上：{o}，有效期至 {d}。期待见到你！'],
  bdayWishMsg: ['Happy birthday, {n}! 🎂 Wishing you a wonderful year ahead. From all of us at {b}.', '{n}，生日快乐！🎂 祝你新的一岁美丽顺心。{b} 全体同仁敬上。'],
  sendInApp: ['Send in the app', '发到会员 App'],
  offerDone: ['Birthday offer sent to {n}', '已向 {n} 送出生日优惠'],
  wishDone: ['Birthday wish sent to {n}', '已向 {n} 发送生日祝福'],
  noBdays: ['No birthdays coming up', '近期没有会员生日'],
  bdayRem: ['Birthday reminders', '生日提醒'],
  bdayRemDay: ['On the birthday', '生日当天'],
  bdayRemBefore: ['3 days before', '提前 3 天'],
  notifAllow: ['Allow notifications on this device', '允许此设备接收通知'],
  notifOn: ['Notifications are on for this device', '此设备已开启通知'],
  notifBlocked: ['Notifications are blocked. Turn them on in your browser or phone settings.', '通知已被阻止，请在浏览器或手机设置中开启。'],
  notifNA: ['This browser can’t show notifications. On iPhone, add appt4u to your Home Screen first.', '此浏览器无法显示通知。iPhone 请先将 appt4u 添加到主屏幕。'],
  notifTest: ['Send a test reminder', '发送测试提醒'],
  notifNote: ['Reminders go to the owner and people with admin access, when they open appt4u on that day.', '提醒会在当天打开 appt4u 时发送给老板与拥有管理员权限的人。'],
  pushTitle: ['Birthday reminder', '生日提醒'],
  bdayPushTail: [' Send a wish or a birthday offer.', ' 记得发送祝福或生日优惠。'],
  bdayVoucher: ['Birthday gift: {o}', '生日礼：{o}'],
  remOnDone: ['Saved', '已保存'],
  bd_when: ['When', '时间'],
  bd_age: ['Turning', '岁数'],
  bd_todo: ['To do', '待处理'],
  bd_sentYear: ['Offers sent this year', '今年已送优惠'],
  calAppleIos: ['Opens the event. Tap “Add to Calendar”.', '打开活动后点「添加到日历」。'],
  calAppleMac: ['Downloads a calendar file. Open it to add the event to Calendar.', '会下载日历文件，打开即可加入「日历」。'],
  calGoogleSub: ['Opens Google Calendar. Tap Save.', '打开 Google 日历，点「保存」。'],
  calFileSub: ['Downloads a calendar file. Open it in Outlook or your calendar app.', '会下载日历文件，用 Outlook 或日历 App 打开即可。'],
  otherCalApp: ['Other calendar app (.ics file)', '其他日历 App（.ics 文件）'],
  calDoneGoogle: ['Google Calendar opened. Tap Save to add it.', '已打开 Google 日历，点「保存」即可加入。'],
  calDoneFile: ['Calendar file downloaded. Open it to add the event.', '日历文件已下载，打开即可加入。'],
  calDoneIos: ['Tap “Add to Calendar” to finish.', '点「添加到日历」即可完成。'],
  calSafari: ['To add to Apple Calendar, open this page in Safari, or use Google Calendar.', '要加入 Apple 日历，请用 Safari 打开此页面，或改用 Google 日历。'],
  notFound: ['Page not found', '找不到页面'], goHome: ['Go home', '返回首页'], demoOnly: ['Available in the full version', '完整版提供此功能'],
};
/* Bahasa Melayu. Any key missing here falls back to English. */
const STR_MS = {
  back: 'Kembali', done: 'Selesai', save: 'Simpan', saved: 'Disimpan', notNow: 'Bukan sekarang',
  any: 'Sesiapa', mins: '{n} min', today: 'Hari ini',
  welcomeT: 'Tempah rawatan kecantikan & kesihatan berdekatan anda',
  welcomeSub: 'Rawatan muka, rambut, kuku dan pilates — tempah dalam beberapa saat, semak pakej anda dan terima peringatan.',
  signInPhone: 'Log masuk dengan nombor telefon', exploreDemo: 'Cuba demo',
  demoNote: 'Demo dengan data contoh',
  phoneTitle: 'Nombor telefon anda', phoneSub: 'Kami akan menghantar kod 6 digit melalui SMS.',
  sendCode: 'Hantar kod', phoneInvalid: 'Masukkan nombor telefon yang sah',
  otpTitle: 'Masukkan kod', otpSub: 'Dihantar ke {p}. Demo: mana-mana 6 digit boleh digunakan.',
  verify: 'Sahkan', otpInvalid: 'Masukkan kod 6 digit',
  agree: 'Dengan meneruskan, anda bersetuju dengan notis PDPA dan terma tempahan perniagaan yang anda tempah.',
  chooseRole: 'Lihat demo sebagai',
  r_member: 'Ahli', r_memberSub: 'Cari salun, tempah, dompet',
  r_admin: 'Pemilik / admin', r_adminSub: 'Hari ini, diari, kaunter, laporan',
  r_therapist: 'Staf / pekerja bebas', r_therapistSub: 'Jadual, masa rawatan, jualan dan pendapatan',
  r_agent: 'Ejen / perujuk', r_agentSub: 'Rujukan dan komisen',
  tabHome: 'Utama', tabBookings: 'Tempahan', tabWallet: 'Dompet', tabProfile: 'Profil',
  loc: 'Lokasi', locVal: 'Kuala Lumpur, Malaysia', searchPh: 'Cari salun, studio atau rawatan',
  services: 'Perkhidmatan', nearby: 'Salun & studio berdekatan', viewMap: 'Lihat peta',
  noResults: 'Tiada padanan berdekatan',
  cat_all: 'Semua', cat_facial: 'Muka', cat_hair: 'Rambut', cat_nails: 'Kuku', cat_body: 'Badan & spa', cat_pilates: 'Pilates',
  promoEyebrow: 'Tawaran hari bekerja!', promoTitle: 'Diskaun 20%', promoSub: 'Rawatan muka 10:00–13:00, Isn–Jum', bookNowBtn: 'Tempah sekarang',
  noNotifs: 'Tiada pemberitahuan baharu', upNext: 'Akan datang', showQR: 'Tunjuk QR',
  yourWallet: 'Dompet anda di {b}', walletLine: '{s} sesi · {v} nilai tersimpan',
  aftercareCard: 'Tip penjagaan selepas rawatan muka terakhir',
  favAdded: 'Disimpan ke kegemaran', favRemoved: 'Dibuang daripada kegemaran',
  continueN: 'Teruskan ({n})', selectSvc: 'Pilih perkhidmatan',
  inPackage: 'Dalam pakej anda · baki {n}',
  installTitle: 'Pasang appt4u', installIOS: 'Ketik Kongsi, kemudian “Tambah ke Skrin Utama”.',
  installAndroid: 'Tambah ke skrin utama untuk tempahan satu ketikan.', installBtn: 'Pasang',
  bookTitle: 'Pilih masa', staff: 'Kakitangan', pickDate: 'Tarikh', pickTime: 'Masa', full: 'penuh',
  payWith: 'Bayar dengan', payPackage: 'Pakej · baki {n}', payStored: 'Nilai tersimpan · {b}',
  payStore: 'Bayar di kaunter', roomAuto: 'Bilik dan peranti diaturkan untuk anda',
  policy: 'Pembatalan percuma sehingga {h} jam sebelum.', chooseTime: 'Pilih masa',
  bookNowAt: 'Tempah sekarang · {p}', totalLine: '{p} · {m} min',
  booked: 'Tempahan anda berjaya', heldPkg: '1 sesi ditahan daripada pakej anda',
  heldStored: '{a} ditahan daripada nilai tersimpan', payAtStore: 'Bayar di kaunter pada hari tersebut',
  addCal: 'Tambah ke kalendar anda?', calWhy: 'Simpan dalam kalendar telefon dengan peringatan 2 jam sebelum.',
  appleCal: 'Kalendar Apple', googleCal: 'Kalendar Google', otherCal: 'Outlook atau lain-lain (.ics)',
  alwaysDo: 'Sentiasa buat begini', addTo: 'Tambah ke {c}', addToCalendar: 'Tambah ke kalendar',
  addedCal: 'Dihantar ke kalendar anda',
  upcoming: 'Akan datang', past: 'Lepas', noBooking: 'Tiada tempahan akan datang', noPast: 'Belum ada tempahan lepas',
  findSalon: 'Cari salun', cancel: 'Batal', cancelQ: 'Batalkan tempahan ini?',
  cancelFreeInfo: 'Masih lebih {h} jam sebelum temu janji, jadi tiada caj dikenakan.',
  cancelLateInfo: 'Kurang {h} jam lagi: ini pembatalan lewat dan sesi akan ditolak.',
  keep: 'Kekalkan tempahan', yesCancel: 'Ya, batalkan',
  cancelledToast: 'Dibatalkan. Tiada caj dikenakan.',
  lateToast: 'Dibatalkan lewat. Sesi ditolak mengikut polisi.',
  st_booked: 'Ditempah', st_completed: 'Selesai', st_cancelled: 'Dibatalkan', st_late: 'Batal lewat',
  walletTitle: 'Dompet', tabPackages: 'Pakej', tabStored: 'Nilai tersimpan', tabVouchers: 'Baucar',
  remaining: 'Baki {n} sesi', legend: 'Digunakan {u} · Ditempah {h} · Tersedia {a}',
  validUntil: 'Sah hingga {d}', statement: 'Penyata', available: 'Baki tersedia',
  heldNote: '{a} ditahan untuk tempahan akan datang',
  offersT: 'Tawaran untuk dituntut', myVouchers: 'Baucar saya', voucherUse: 'Tunjukkan QR ahli anda di kaunter untuk menggunakannya.',
  offer1: 'Tambah nilai RM1,000, dapat RM150 percuma', offer1Sub: 'Di kedai, sehingga {d}',
  offer2: 'Bulan hari jadi: diskaun 15% rawatan muka', offer2Sub: 'Sah sepanjang bulan ini',
  claim: 'Tuntut', claimed: 'Dituntut', claimedToast: 'Disimpan ke dompet anda sebagai baucar',
  k_purchase: 'Dibeli di kedai', k_use: 'Digunakan', k_topup: 'Tambah nilai di kedai', k_bonus: 'Bonus tambah nilai',
  k_late: 'Batal lewat', balShort: 'baki {b}',
  pdfToast: 'Penyata PDF tersedia dalam versi penuh',
  goldMember: 'Ahli Emas', myQR: 'QR ahli saya',
  qrHint: 'Tunjukkan di kaunter untuk bayar, tebus atau daftar masuk.', qrDemo: 'Kod demo — tidak boleh diimbas',
  skinProfile: 'Profil kulit & persetujuan', myBookings: 'Tempahan saya', favourites: 'Kegemaran',
  calendarSet: 'Kalendar', calAsk: 'Tanya setiap kali',
  notifications: 'Pemberitahuan', n_rem: 'Peringatan tempahan', n_offers: 'Tawaran', n_after: 'Tip penjagaan selepas rawatan',
  n_note: 'Pengesahan dan perubahan tempahan sentiasa dihantar.',
  language: 'Bahasa', refer: 'Rujuk rakan', switchRole: 'Tukar paparan demo',
  resetDemo: 'Set semula data demo', resetQ: 'Set semula semua data demo?',
  resetInfo: 'Tempahan, jualan dan tetapan yang anda ubah di sini akan kembali kepada data contoh.',
  signOut: 'Log keluar',
  skinTitle: 'Profil kulit', skinType: 'Jenis kulit', concerns: 'Masalah utama', allergies: 'Alahan & amaran',
  consent: 'Persetujuan rawatan', signed: 'Ditandatangani', signedOn: 'Ditandatangani {d} · versi 2',
  photos: 'Foto sebelum/selepas', ph_archive: 'Simpan dalam fail sahaja', ph_marketing: 'Boleh digunakan untuk pemasaran', ph_no: 'Jangan ambil foto',
  reviewNote: 'Disemak setiap tahun. Terapis anda membacanya sebelum setiap rawatan.',
  ty_dry: 'Kering', ty_oily: 'Berminyak', ty_combo: 'Kombinasi', ty_sensitive: 'Sensitif', ty_normal: 'Normal',
  co_dull: 'Kusam', co_pores: 'Liang pori', co_acne: 'Jerawat', co_pig: 'Pigmentasi', co_lines: 'Garis halus',
  aftercareTitle: 'Penjagaan selepas rawatan', within24: 'Untuk 24 jam akan datang',
  tip1: 'Elakkan sauna dan mandi air panas', tip2: 'Hentikan seketika pengelupas dan retinoid', tip3: 'Lembapkan kulit dan pakai pelindung matahari',
  nextSuggested: 'Lawatan seterusnya yang disyorkan', interval: 'Setiap 14 hari · sesi {n} daripada {t}',
  bookOneTap: 'Tempah {t} dengan {p}', recommended: 'Disyorkan untuk di rumah',
  serum: 'Serum Pemulih 30ml', inStore: 'Beli di kedai',
  aToday: 'Hari ini', aDiary: 'Diari', aMembers: 'Ahli', aReports: 'Laporan', aMore: 'Lagi',
  mainBranch: 'Cawangan utama', recordSale: 'Rekod jualan',
  kBookings: 'Tempahan', kArrived: 'Telah tiba', kSales: 'Jualan hari ini', kRoom: 'Guna bilik',
  vsLastWeek: 'Perubahan berbanding hari yang sama minggu lepas.', needs: 'Perlu perhatian',
  att1: '2 pelanggan belum menandatangani persetujuan', att2: '3 pakej tamat dalam 14 hari',
  att3: '3 slot kosong petang ini', att4: 'Penyata komisen Kelvin menunggu kelulusan',
  appts: 'Temu janji hari ini', checkIn: 'Daftar masuk', arrivedSt: 'Telah tiba', doneSt: 'Selesai',
  diaryNote: 'Masa hanya ditawarkan apabila terapis, bilik dan peranti semuanya kosong.',
  room1: 'Bilik 1', room2: 'Bilik 2', hydraDevice: 'Peranti Hydra', clean: 'Cuci', lunch: 'Rehat',
  lg_treat: 'Terapis', lg_room: 'Bilik / peranti', lg_mine: 'Mei Ling (demo ahli)', lg_clean: 'Cuci / rehat',
  search: 'Cari nama',
  seg_all: 'Semua', seg_vip: 'VIP', seg_loyal: 'Setia', seg_new: 'Baharu', seg_atrisk: 'Berisiko', seg_away: 'Ada baki, tidak datang', seg_lost: 'Tidak aktif',
  act_vip: 'Ucapkan terima kasih sendiri dan tawarkan tempahan keutamaan.', act_loyal: 'Tawarkan pakej yang lebih besar.',
  act_new: 'Galakkan lawatan kedua.', act_atrisk: 'Hubungi mereka atau hantar tawaran untuk kembali.',
  act_away: 'Ingatkan mereka masih ada baki sesi.', act_lost: 'Hantar tawaran kos rendah untuk menarik mereka kembali.',
  lastVisit: 'Lawatan terakhir {n} hari lalu', balLeft: 'Baki {b}', noMembers: 'Tiada ahli ditemui',
  ltv: 'Jumlah perbelanjaan', visits12: 'Lawatan, 12 bulan lepas', balanceLeft: 'Baki',
  pkgsBought: 'Pakej dibeli', rebuy: 'Beli semula setiap', weeks: '~{n} minggu',
  lastVisitL: 'Lawatan terakhir', daysAgo: '{n} hari lalu', introBy: 'Diperkenalkan oleh {n}',
  notes: 'Nota terapis', note1: 'Kulit sensitif; alah kepada asid salisilik. Lebih suka waktu petang.',
  noteGen: 'Suka sesi yang tenang. Gemar rangkaian pelembap.',
  consentOk: 'Persetujuan ditandatangani', consentMissing: 'Persetujuan belum ditandatangani',
  customer: 'Pelanggan', item: 'Item', payMethod: 'Kaedah bayaran',
  m_cash: 'Tunai', m_card: 'Kad', m_duitnow: 'DuitNow QR', m_ewallet: 'E-dompet',
  receiptNo: 'No. resit kaunter', soldBy: 'Dijual oleh', frontDesk: 'Sara · Kaunter depan',
  introducer: 'Perujuk', none: 'Tiada', total: 'Jumlah', needReceipt: 'Masukkan nombor resit kaunter',
  saleDone: 'Jualan direkodkan', addedTo: 'Ditambah ke dompet {n}', pushSent: 'Resit dihantar kepada ahli melalui pemberitahuan',
  commLines: 'Rekod komisen dicipta', newSale: 'Jualan baharu', seeMember: 'Lihat dalam aplikasi ahli',
  productOnly: 'Jualan produk — tiada apa-apa ditambah ke dompet', plusBonus: '{a} + bonus {b}',
  rTitle: 'Laporan', p_month: 'Bulan', p_quarter: 'Suku tahun', p_year: '12 bulan',
  c_prev: 'vs tempoh lepas', c_ly: 'vs tahun lepas',
  r_cash: 'Tunai diterima', r_earned: 'Hasil diperoleh', r_unused: 'Nilai pakej belum digunakan',
  r_active: 'Pelanggan aktif / bulan', r_avg: 'Belanja setiap pelanggan / bulan', r_ret: 'Pelanggan kembali',
  r_ren: 'Pembaharuan pakej', r_new: 'Pelanggan baharu',
  trend: 'Tunai vs hasil diperoleh · 13 bulan', cashL: 'Tunai diterima', earnedL: 'Hasil diperoleh',
  why: 'Mengapa hasil berubah', whySub: 'Hasil = pelanggan × lawatan setiap orang × belanja setiap lawatan',
  w_cust: 'Pelanggan', w_visits: 'Lawatan/orang', w_spend: 'Belanja / lawatan',
  unusedT: 'Nilai pakej belum digunakan', unusedSub: 'Sesi yang telah dibayar pelanggan tetapi belum digunakan',
  rf_open: 'Baki awal', rf_sold: '+ Pakej dijual', rf_used: '− Digunakan (diperoleh)',
  rf_exp: '− Tamat tempoh tanpa digunakan', rf_adj: '± Bayaran balik & pelarasan', rf_close: 'Baki akhir',
  byExpiry: 'Nilai belum digunakan mengikut tarikh tamat', e30: '≤ 30 hari', e90: '31–90 hari', e180: '91–180 hari', eLater: '> 180 hari',
  custN: '{n} pelanggan',
  ranking: 'Kedudukan rawatan', mt_rev: 'Hasil', mt_sessions: 'Sesi', mt_profit: 'Untung / jam', mt_growth: 'Pertumbuhan',
  highest: 'Tertinggi', lowest: 'Terendah',
  quad: 'Populariti vs keuntungan', q_star: 'Bintang', q_work: 'Tulang belakang', q_gem: 'Permata tersembunyi', q_weak: 'Lemah',
  quadNote: 'Bintang: promosikan. Tulang belakang: naikkan harga atau kurangkan kos. Permata tersembunyi: lebihkan pemasaran. Lemah: ubah suai atau hentikan.',
  axSessions: 'Sesi / bulan →', axProfit: 'Untung / jam ↑',
  topCust: 'Pelanggan teratas · 12 bulan lepas', conc: '10% pelanggan teratas menyumbang {p} hasil.',
  c_spend: 'Belanja', c_visits: 'Lawatan', c_avg: 'Purata / lawatan', sample: 'Data contoh',
  commission: 'Penyata komisen', promotions: 'Promosi', settings: 'Tetapan perniagaan',
  approve: 'Luluskan', approved: 'Diluluskan', markPaid: 'Tanda dibayar', paidSt: 'Dibayar',
  stmtFor: 'Penyata untuk {m}', sessionsN: '{n} sesi', salesComm: 'Komisen jualan 5%', introComm: 'Perujuk 10%',
  promoStats: 'Dipaparkan {a} · dituntut {b} · digunakan {c}', promoConv: '{a} pelanggan baharu · {b} membeli pakej',
  pr1: 'Bonus tambah nilai RM150', pr2: 'Hari jadi diskaun 15%', pr3: 'Rawatan muka hari bekerja diskaun 20%', pr4: 'Rawatan muka pertama RM98',
  set_window: 'Tempoh tempahan', set_cut: 'Batal percuma sehingga', set_grace: 'Dikira tidak hadir selepas',
  set_buffer: 'Masa pembersihan', set_expiry: 'Tempoh sah pakej', set_rem: 'Peringatan', set_brand: 'Warna jenama',
  v_7d: '7 hari lebih awal', v_12h: '12 jam sebelum', v_15m: 'Lewat 15 minit', v_buf: '15 minit',
  v_6m: '6 bulan', v_rem: '24 jam dan 2 jam sebelum', editFull: 'Ubah tetapan tersedia dalam versi penuh.',
  hi: 'Hai, {n}', tToday: 'Hari ini', tEarnings: 'Pendapatan', earnedMonth: 'Pendapatan bulan ini',
  startS: 'Daftar masuk', completeS: 'Selesai', inProg: 'Sedang berjalan', commAdded: 'Komisen +{a} ditambah',
  lines: 'Bulan ini', payoutHist: 'Bayaran', paidRef: 'Dibayar {d} · ruj. {r}',
  calFeed: 'Suapan kalendar peribadi', calFeedSub: 'Langgan sekali dalam Kalendar Google atau Apple dan tempahan anda sentiasa diselaraskan.',
  copy: 'Salin', copied: 'Disalin',
  gHome: 'Utama', gShare: 'Kongsi', gPayouts: 'Bayaran', myRef: 'Rujukan saya',
  thisMonth: 'Bulan ini', pendingApp: 'Menunggu kelulusan', lastPaid: '{m} dibayar: {a}',
  joined: 'Sertai {d}', purchased: 'Telah membeli', trial: 'Percubaan',
  agentRule: 'Anda dapat 10% daripada pembelian rakan anda selama 6 bulan.',
  yourLink: 'Pautan peribadi anda', shareWA: 'Kongsi di WhatsApp', msgPreview: 'Pratonton mesej',
  waMsg: 'Hai! Cuba {b} — tempah dalam talian dalam beberapa saat dan dapatkan rawatan muka pertama dengan harga RM98: {l}',
  sideTitle: 'Demo interaktif',
  sideText: 'Aplikasi web mudah alih untuk studio dan salun. Di telefon anda, buka www.appt4u.com dan tambah ke Skrin Utama — ia dibuka skrin penuh seperti aplikasi biasa.',
  sideRoles: 'Lihat sebagai', sideData: 'Perniagaan dan data contoh sahaja. Perubahan anda kekal dalam pelayar ini.',
  tSchedule: 'Jadual', newBooking: 'Tempahan baharu', gotIt: 'Faham', inCal: 'Dalam kalendar',
  syncT: 'Selaraskan kalendar anda', syncSub: 'Masukkan temu janji ke dalam kalendar telefon anda supaya tidak terlepas.',
  addWeek: 'Tambah 7 hari akan datang', subscribe: 'Segerak automatik',
  subInfo: 'Langgan sekali dan temu janji yang baharu, dialihkan atau dibatalkan dikemas kini dalam kalendar anda secara automatik. Berfungsi dengan Google, Apple dan Outlook.',
  subDemo: 'Suapan langsung diaktifkan dalam versi penuh. Dalam demo ini, gunakan “Tambah 7 hari akan datang”.',
  noAppts: 'Tiada temu janji pada hari ini', apptsN: '{n} temu janji',
  remSet: 'Peringatan', rem2h: 'Pemberitahuan 2 jam sebelum setiap temu janji', runSheet: 'Senarai tugas harian pada 8:00 pagi', newPush: 'Makluman segera untuk tempahan baharu, dialihkan atau dibatalkan',
  calPrivacy: 'Kalendar anda hanya menunjukkan nama pertama pelanggan dan perkhidmatan. Nota kesihatan kekal dalam appt4u.',
  weekAdded: '{n} temu janji dihantar ke kalendar anda',
  calWhyT: 'Anda menerima peringatan 30 minit sebelum, dengan nama pertama pelanggan dan bilik.',
  firmPressure: 'Suka tekanan kuat', pregnantNote: 'Hamil — elakkan minyak pati tertentu',
  walletAll: 'Semua kedai', walletsN: 'Baki anda di {n} kedai',
  storeRule: 'Pakej dan nilai tersimpan setiap kedai hanya boleh digunakan di kedai itu.',
  sessionsL: 'Baki sesi', expInDays: 'Tamat dalam {n} hari', leftN: 'baki {n}',
  expiringN: '{n} hampir tamat', switchStore: 'Tukar kedai', branchesN: '{n} cawangan',
  brAllMember: 'Boleh guna di kedua-dua cawangan: {l}', brOriginMember: 'Hanya boleh guna di {l}, tempat anda membelinya',
  storeOnly: 'Hanya {b} boleh melihat baki ini.',
  noPkgStore: 'Tiada pakej di kedai ini', noStoredStore: 'Tiada nilai tersimpan di sini. Anda boleh tambah nilai di kaunter.',
  noOffers: 'Tiada tawaran daripada kedai ini buat masa ini',
  qrAll: 'Satu QR untuk semua kedai. Setiap kedai hanya melihat baki anda di kedai itu.',
  n_exp: 'Peringatan pakej hampir tamat',
  ownOnly: 'Hanya baki di {b} dipaparkan. Baki ahli ini di perniagaan lain kekal peribadi.',
  boughtAt: 'Dibeli di {b}', branches: 'Cawangan', mainTag: 'utama',
  br_rule: 'Pakej dan nilai tersimpan boleh digunakan di', br_all: 'Semua cawangan', br_origin: 'Cawangan pembelian sahaja',
  br_allNote: 'Tunai kekal di cawangan yang menjual pakej. Hasil diberikan kepada cawangan yang menjalankan rawatan, dan cawangan menyelesaikan bezanya setiap bulan.',
  r_branch: 'Mengikut cawangan', th_cash: 'Tunai', th_earned: 'Hasil', th_unused: 'Belum guna',
  r_cross: 'Digunakan di cawangan lain', crossLine: 'Dibeli di {a}, diguna di {b}',
  settle: '{a} bayar {b} {v} bagi tempoh ini',
  crossOff: 'Pakej hanya boleh digunakan di cawangan pembelian, jadi tiada apa untuk diselesaikan.',
  arrivedBtn: 'Pelanggan tiba', startBtn: 'Mula', endBtn: 'Tamat',
  lg_arr: 'Tiba {t}', lg_start: 'Mula {t}', lg_end: 'Tamat {t} · {m} min (rancangan {p})',
  lateBy: 'lewat {n} min', onTime: 'tepat masa', startLate: 'mula lewat {n} min',
  editTimes: 'Ubah masa', recordTimes: 'Rekod masa', f_start: 'Rawatan bermula', f_end: 'Rawatan tamat',
  endBeforeStart: 'Masa tamat mesti selepas masa mula', notRecorded: 'Masa belum direkod',
  cxTitle: 'Siapa yang membatalkan?', cx_client: 'Pelanggan membatalkan', cx_noshow: 'Pelanggan tidak datang',
  cx_staff: 'Saya tidak dapat hadir', cx_staffA: 'Terapis tidak dapat hadir', cx_owner: 'Pemilik / admin membatalkan',
  cxLast: 'Kurang 12 jam sebelum bermula: ini dikira pembatalan saat akhir.',
  cxLastShort: 'saat akhir', cxBy: 'Dibatalkan oleh', noShowL: 'tidak hadir',
  W_client: 'Pelanggan', W_staff: 'Staf', W_owner: 'Pemilik / admin',
  cxToast: 'Temu janji dibatalkan dan direkodkan', cxBySalon: 'Dibatalkan oleh {b}. Tiada sesi digunakan.',
  tmTitle: 'Masa & pembatalan', tmSub: 'Daripada masa mula, tamat dan pembatalan yang direkod oleh staf',
  tmLost: 'Mula lewat menelan {h} jam dalam 90 hari lepas, kira-kira {n} rawatan lagi.',
  tmTreat: 'Masa rawatan: rancangan vs sebenar', th_plan: 'Rancangan', th_actual: 'Sebenar', th_diff: 'Beza',
  tmInsight: '{s} purata lebih {n} min. Tempah sebagai {m} min supaya pelanggan seterusnya tidak menunggu.',
  tmLateCust: 'Pelanggan yang kerap lewat', th_lateVisits: 'Lewat / lawatan', th_avgLate: 'Purata lewat',
  tmLateTip: 'Hantar peringatan mereka sejam lebih awal, atau tempah sebelum slot kosong.',
  tmCancel: 'Pembatalan mengikut pihak', th_total: 'Jumlah', th_lastMin: 'Saat akhir',
  tmCxCust: 'Pelanggan yang batal saat akhir', th_noShow: 'Tidak hadir',
  tmStaff: 'Staf & pekerja bebas', th_lateStart: 'Mula lewat', th_overrun: 'Purata lebih', th_cx: 'Batal',
  tmToday: 'Direkod hari ini', ev_arr: 'tiba', ev_start: 'dimulakan oleh {s}', ev_end: 'selesai dalam {m} min (rancangan {p})',
  tm90: '90 hari lepas',
  staffId: 'ID {id}', kind_free: 'Pekerja bebas', kind_staff: 'Staf', kind_consult: 'Perunding kecantikan',
  staffAccess: 'Staf, pekerja bebas dan perunding kecantikan log masuk dengan ID sendiri dan melihat jadual, jualan dan komisen masing-masing.',
  mySales: 'Jualan saya', earnSplit: 'Rawatan {a} · Komisen jualan {b}',
  att5: '{n} ({t}) biasanya lewat {m} min',
  tClaims: 'Tuntutan',
  newExp: 'Tuntutan perbelanjaan',
  newOT: 'Tuntutan OT',
  myClaims: 'Tuntutan saya',
  noClaims: 'Belum ada tuntutan',
  clPendingSum: 'Menunggu kelulusan',
  clToPay: 'Dibayar bersama bayaran seterusnya',
  cl_pending: 'Menunggu',
  cl_approved: 'Diluluskan',
  cl_rejected: 'Ditolak',
  cl_paid: 'Dibayar',
  ct_ot: 'Kerja lebih masa',
  otOnlyStaff: 'Tuntutan OT hanya untuk staf. {n} ditetapkan sebagai pekerja bebas; pemilik boleh menukarnya di Pasukan.',
  openTeam: 'Buka Pasukan sebagai pemilik',
  expCat: 'Kategori',
  ec_supplies: 'Bekalan',
  ec_transport: 'Pengangkutan',
  ec_training: 'Latihan',
  ec_meals: 'Makan',
  ec_other: 'Lain-lain',
  amountRM: 'Jumlah (RM)',
  descL: 'Untuk apa?',
  descPh: 'cth. Kapas untuk Bilik 2',
  receiptL: 'Foto resit',
  addReceipt: 'Ambil atau pilih foto',
  receiptOk: 'Resit dilampirkan',
  noReceipt: 'Tiada resit',
  submitClaim: 'Hantar tuntutan',
  claimSent: 'Dihantar kepada pemilik untuk kelulusan',
  needAmount: 'Masukkan jumlah',
  needDesc: 'Nyatakan untuk apa',
  otDay: 'Jenis hari',
  od_normal: 'Hari biasa · 1.5×',
  od_rest: 'Hari rehat · 2×',
  od_ph: 'Cuti umum · 3×',
  otFrom: 'Dari',
  otTo: 'Hingga',
  otReason: 'Sebab',
  otReasonPh: 'cth. Rawatan muka terakhir lewat tamat',
  otRate: 'Kadar sejam RM{r} = gaji bulanan {s} ÷ 26 hari ÷ 8 jam',
  otSuggest: 'Rawatan terakhir anda tamat pada {t}, selepas syif tamat pada {s}.',
  hoursN: '{n} jam',
  team: 'Pasukan',
  teamSub: 'Staf, pekerja bebas dan perunding kecantikan',
  empType: 'Jenis pekerjaan',
  roleL: 'Peranan',
  role_therapist: 'Terapis',
  role_consult: 'Perunding kecantikan',
  salaryL: 'Gaji bulanan (RM)',
  canClaim: 'Boleh menuntut',
  claimsStaff: 'Perbelanjaan dan OT',
  claimsFree: 'Perbelanjaan sahaja',
  typeNote: 'Staf boleh menuntut perbelanjaan dan kerja lebih masa. Pekerja bebas hanya boleh menuntut perbelanjaan.',
  typeChanged: '{n} kini: {k}',
  claimsT: 'Tuntutan staf',
  toApprove: 'Untuk diluluskan',
  toPay: 'Diluluskan, untuk dibayar',
  doneClaims: 'Dibayar & ditolak',
  reject: 'Tolak',
  nothingHere: 'Tiada apa-apa',
  att6: '{n} tuntutan staf untuk diluluskan',
  att7: '{n} invois lewat tempoh',
  invoices: 'Invois',
  newInvoice: 'Invois baharu',
  invoiceWord: 'Invois',
  invDate: 'Tarikh',
  invNo: 'No. invois',
  billTo: 'Bil kepada',
  otherCust: 'Orang lain (syarikat atau pelanggan biasa)',
  custName: 'Nama atau syarikat',
  custContact: 'Telefon atau e-mel',
  items: 'Item',
  addItem: '+ Tambah item',
  otherItem: 'Item lain',
  itemDescPh: 'Huraikan item',
  qty: 'Kuantiti',
  unitPrice: 'Harga',
  discount: 'Diskaun (RM)',
  sst: 'Tambah SST 8%',
  subtotal: 'Jumlah kecil',
  discL: 'Diskaun',
  dueL: 'Tarikh akhir',
  invNotes: 'Nota',
  invNotesPh: 'cth. Terima kasih! Pakej sah selama 6 bulan.',
  saveDraft: 'Simpan draf',
  issueInv: 'Keluarkan invois',
  inv_draft: 'Draf',
  inv_issued: 'Belum dibayar',
  inv_paid: 'Dibayar',
  inv_overdue: 'Lewat tempoh',
  invAll: 'Semua',
  amountDue: 'Jumlah perlu dibayar',
  markPaidInv: 'Tanda dibayar',
  payHow: 'Bagaimana dibayar?',
  sendWA: 'WhatsApp',
  printPdf: 'Cetak / PDF',
  waDemo: 'Dalam versi penuh, ini membuka WhatsApp dengan pautan invois.',
  invIssued: 'Invois {n} dikeluarkan',
  invDraftSaved: 'Draf disimpan',
  needItems: 'Tambah sekurang-kurangnya satu item',
  needCust: 'Masukkan nama pelanggan',
  invFromSale: 'Buat invois',
  viewInv: 'Lihat invois',
  outstanding: 'Belum dibayar',
  paidMonth: 'Dibayar bulan ini',
  paidOn: 'Dibayar {d} · {m}',
  editInv: 'Ubah',
  noInvoices: 'Tiada invois di sini',
  ad_full: 'Admin · versi penuh',
  ad_fullLink: 'Admin penuh untuk komputer',
  ad_phone: 'Buka aplikasi telefon',
  ad_dash: 'Papan pemuka',
  ad_appts: 'Temu janji',
  ad_search: 'Cari',
  ad_rows: '{n} baris',
  ad_excel: 'Eksport ke Excel',
  ad_template: 'Templat import',
  ad_import: 'Import dari Excel',
  ad_importDone: '{n} invois diimport sebagai draf',
  ad_importSkip: 'Baris dilangkau ({n}):',
  ad_importNone: 'Tiada invois ditemui. Gunakan templat import dan kekalkan baris pertama sebagai tajuk.',
  ad_importErr: 'Fail ini tidak dapat dibaca. Simpan sebagai .xlsx dan cuba lagi.',
  ad_rowNoCust: 'baris {r}: tiada pelanggan',
  ad_rowNoItem: 'baris {r}: tiada item atau harga',
  ad_xlsLoading: 'Menyediakan fail Excel…',
  ad_xlsFail: 'Fail Excel tidak dapat dibuat. Semak sambungan anda dan cuba lagi.',
  ad_downloaded: 'Dimuat turun {f}',
  ad_sample: 'Demo dengan data contoh. Perubahan dikongsi dengan aplikasi telefon dalam pelayar ini.',
  ad_actions: 'Tindakan',
  ad_status: 'Status',
  ad_type: 'Jenis',
  ad_person: 'Individu',
  ad_tier: 'Tahap',
  ad_segment: 'Segmen',
  ad_lastDays: 'Lawatan terakhir (hari lalu)',
  ad_contact: 'Hubungan',
  ad_method: 'Kaedah bayaran',
  ad_paidDate: 'Dibayar pada',
  ad_details: 'Butiran',
  ad_hours: 'Jam',
  ad_room: 'Bilik',
  ad_client: 'Pelanggan',
  ad_treatment: 'Rawatan',
  ad_time: 'Masa',
  ad_arrived: 'Tiba',
  ad_started: 'Mula',
  ad_ended: 'Tamat',
  ad_lateC: 'Pelanggan lewat (min)',
  ad_lateS: 'Mula lewat (min)',
  ad_exportReport: 'Eksport laporan ke Excel',
  ad_kpiUnpaid: 'Invois belum dibayar',
  ad_drafts: 'Draf',
  ad_hourly: 'Kadar OT sejam',
  ad_salaryNA: 'Tiada gaji',
  ad_dup: 'Salin',
  ad_delete: 'Padam draf',
  ad_deleted: 'Draf dipadam',
  ad_tplHelp: 'Cara mengisi',
  ad_codes: 'Kod item',
  ad_code: 'Kod',
  ad_name: 'Nama',
  ad_priceRM: 'Harga (RM)',
  ad_h1: 'Satu baris bagi setiap item. Baris dengan Ref yang sama menjadi satu invois.',
  ad_h2: 'Untuk ahli, isi ID Ahli (lihat helaian Members). Jika tidak, isi nama pelanggan.',
  ad_h3: 'Kod item adalah pilihan (lihat Item codes). Dengan kod, harga kosong akan guna senarai harga.',
  ad_h4: 'Tarikh dalam format YYYY-MM-DD. Diskaun (RM) dan SST (Y/N) dibaca daripada baris pertama setiap invois.',
  ad_h5: 'Invois yang diimport disimpan sebagai draf supaya anda boleh menyemaknya sebelum dikeluarkan.',
  ad_h6: 'Kekalkan baris pertama (tajuk) seperti asal.',
  ad_preview: 'Pratonton',
  ad_newFor: 'Invois baharu',
  ad_today: 'Hari ini',
  ad_viewAll: 'Lihat semua',
  ad_salesMonth: 'Hasil diperoleh bulan ini',
  ad_cancelAppt: 'Batal temu janji',
  ad_rules: 'Peraturan tempahan',
  ad_demo: 'Data demo',
  ad_resetDone: 'Data demo diset semula',
  ad_narrow: 'Admin ini dibuat untuk skrin komputer. Di telefon, gunakan aplikasi telefon.',
  ad_itemsSheet: 'Item',
  ad_summary: 'Ringkasan',
  ad_trendSheet: 'Trend bulanan',
  ad_month: 'Bulan',
  ad_metric: 'Ukuran',
  ad_value: 'Nilai',
  ad_compare: 'Berbanding',
  ad_change: 'Perubahan',
  r_platform: 'Pengurus platform (appt4u)',
  r_platformSub: 'Semua perniagaan, pelan, kelulusan dan sokongan',
  contactT: 'Butiran hubungan',
  f_name: 'Nama penuh',
  f_phone: 'Telefon',
  f_email: 'E-mel',
  f_wechat: 'ID WeChat',
  contactPrivacy: 'Hanya pemilik dan orang yang mempunyai akses admin boleh melihat butiran hubungan. Staf dan pekerja bebas lain tidak boleh.',
  editMember: 'Ubah ahli',
  memberSaved: 'Butiran ahli disimpan',
  needName: 'Masukkan nama',
  noContactStaff: 'Nombor telefon, e-mel dan akaun media sosial pelanggan hanya boleh dilihat oleh pemilik dan orang yang mempunyai akses admin.',
  tr_title: 'Rekod rawatan',
  tr_open: 'Sejarah rawatan',
  tr_last: 'Lawatan terakhir',
  tr_notes: 'Rawatan dibuat',
  tr_skin: 'Kulit & keadaan',
  tr_products: 'Produk digunakan',
  tr_advice: 'Nasihat untuk lawatan seterusnya',
  tr_add: 'Tambah rekod',
  tr_comment: 'Komen',
  tr_commentPh: 'Tambah komen untuk pasukan…',
  tr_history: 'Sejarah pengubahan ({n})',
  tr_created: 'mencipta rekod',
  tr_edited: 'mengubah {f}',
  tr_commented: 'mengulas',
  tr_saved: 'Rekod disimpan',
  tr_cmSaved: 'Komen ditambah',
  tr_noChange: 'Tiada perubahan',
  tr_none: 'Belum ada rekod rawatan',
  tr_need: 'Tulis rawatan yang dibuat',
  tr_who: 'Pemilik, admin, staf dan pekerja bebas semua boleh membaca dan menambah rekod ini. Setiap pengubahan dan komen direkodkan bersama nama pembuatnya.',
  tr_visits: '{n} lawatan direkodkan',
  tr_before: 'Sebelum',
  tr_after: 'Selepas',
  tr_health: 'Nota kesihatan',
  tr_by: 'Terapis',
  roleOwner: 'Pemilik',
  tr_new: 'Baharu',
  adminAccess: 'Akses admin',
  adminAccessSub: 'Boleh melihat dan mengubah butiran hubungan pelanggan (telefon, e-mel, WeChat, Facebook, Instagram).',
  adminOn: '{n} kini mempunyai akses admin',
  adminOff: 'Akses admin {n} telah ditarik balik',
  adminGranted: 'Diberi oleh {b} · {d}',
  adminRemoved: 'Ditarik balik oleh {b} · {d}',
  adminYou: 'Anda mempunyai akses admin, jadi anda boleh melihat dan mengubah butiran hubungan pelanggan.',
  adminNote: 'Hidupkan Akses admin hanya untuk orang yang anda percayai dengan butiran hubungan pelanggan, seperti kaunter depan. Orang lain boleh melihat rekod rawatan tetapi bukan butiran hubungan.',
  yesW: 'Ya',
  noW: 'Tidak',
  f_bday: 'Hari jadi',
  bdays: 'Hari jadi ahli',
  bdaySub: 'Hantar ucapan atau tawaran hari jadi sebelum harinya.',
  bdayToday: 'Hari ini hari jadi {n}',
  bdayTomorrow: 'Esok hari jadi {n}',
  bdayIn: 'Hari jadi {n} dalam {d} hari',
  bdayWeek: 'Hari jadi dalam 7 hari: {n}',
  bd_thisWeek: '7 hari akan datang',
  bd_month: '30 hari akan datang',
  bd_later: 'Kemudian',
  bdMissing: 'Hari jadi belum disimpan',
  turns: 'genap {n} tahun',
  inDays: 'dalam {n} hari',
  tomorrowW: 'Esok',
  sendWish: 'Hantar ucapan',
  bdayOffer: 'Tawaran hari jadi',
  wished: 'Diucapkan {d}',
  offerSent: 'Tawaran dihantar {d}',
  of_pct15: 'Diskaun 15% untuk sebarang rawatan',
  of_rm50: 'Potongan RM50 untuk rawatan',
  of_addon: 'Tambahan percuma: LED atau urutan kulit kepala',
  of_custom: 'Tulis tawaran sendiri',
  offerPh: 'cth. Bentuk kening percuma dengan sebarang rawatan muka',
  needOffer: 'Tulis tawaran dahulu',
  bdayMsg: 'Selamat hari jadi, {n}! 🎂 Daripada kami semua di {b}: {o}, sah hingga {d}. Jumpa lagi!',
  bdayWishMsg: 'Selamat hari jadi, {n}! 🎂 Semoga tahun ini indah untuk anda. Daripada kami semua di {b}.',
  sendInApp: 'Hantar dalam aplikasi',
  offerDone: 'Tawaran hari jadi dihantar kepada {n}',
  wishDone: 'Ucapan hari jadi dihantar kepada {n}',
  noBdays: 'Tiada hari jadi akan datang',
  bdayRem: 'Peringatan hari jadi',
  bdayRemDay: 'Pada hari jadi',
  bdayRemBefore: '3 hari sebelum',
  notifAllow: 'Benarkan pemberitahuan pada peranti ini',
  notifOn: 'Pemberitahuan dihidupkan untuk peranti ini',
  notifBlocked: 'Pemberitahuan disekat. Hidupkan dalam tetapan pelayar atau telefon.',
  notifNA: 'Pelayar ini tidak boleh memaparkan pemberitahuan. Di iPhone, tambah appt4u ke Skrin Utama dahulu.',
  notifTest: 'Hantar peringatan ujian',
  notifNote: 'Peringatan dihantar kepada pemilik dan orang yang mempunyai akses admin apabila mereka membuka appt4u pada hari itu.',
  pushTitle: 'Peringatan hari jadi',
  bdayPushTail: ' Hantar ucapan atau tawaran hari jadi.',
  bdayVoucher: 'Hadiah hari jadi: {o}',
  remOnDone: 'Disimpan',
  bd_when: 'Bila',
  bd_age: 'Umur',
  bd_todo: 'Belum',
  bd_sentYear: 'Tawaran dihantar tahun ini',
  calAppleIos: 'Buka acara. Ketik “Tambah ke Kalendar”.',
  calAppleMac: 'Memuat turun fail kalendar. Buka fail itu untuk menambah acara ke Kalendar.',
  calGoogleSub: 'Buka Kalendar Google. Ketik Simpan.',
  calFileSub: 'Memuat turun fail kalendar. Buka dalam Outlook atau aplikasi kalendar anda.',
  otherCalApp: 'Aplikasi kalendar lain (fail .ics)',
  calDoneGoogle: 'Kalendar Google dibuka. Ketik Simpan untuk menambahnya.',
  calDoneFile: 'Fail kalendar dimuat turun. Buka untuk menambah acara.',
  calDoneIos: 'Ketik “Tambah ke Kalendar” untuk selesai.',
  calSafari: 'Untuk menambah ke Kalendar Apple, buka halaman ini dalam Safari, atau gunakan Kalendar Google.',
  notFound: 'Halaman tidak ditemui', goHome: 'Ke halaman utama', demoOnly: 'Tersedia dalam versi penuh',
};
function t(k, v) {
  const e = STR[k];
  let s = e ? (lang === 'zh' ? e[1] : lang === 'ms' && STR_MS[k] != null ? STR_MS[k] : e[0]) : k;
  if (v) for (const n in v) s = s.split('{' + n + '}').join(v[n]);
  return s;
}
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, el = document) => el.querySelector(s);
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/* ------------------------------------------------------------------ dates & money */
const DAY = 864e5;
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const at = (d, hhmm) => { const [h, m] = hhmm.split(':').map(Number); const x = new Date(d); x.setHours(h, m, 0, 0); return x; };
const pad = n => String(n).padStart(2, '0');
const hm = d => { d = new Date(d); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const sameDay = (a, b) => { a = new Date(a); b = new Date(b); return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
const EN_D = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EN_M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ZH_D = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const MS_D = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
const MS_M = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
const MON = () => lang === 'ms' ? MS_M : EN_M;
const WD = () => lang === 'ms' ? MS_D : EN_D;
const fDay = d => { d = new Date(d); return lang === 'zh' ? `${d.getMonth() + 1}月${d.getDate()}日 ${ZH_D[d.getDay()]}` : `${WD()[d.getDay()]} ${d.getDate()} ${MON()[d.getMonth()]}`; };
const fDate = d => { d = new Date(d); return lang === 'zh' ? `${d.getMonth() + 1}月${d.getDate()}日` : `${d.getDate()} ${MON()[d.getMonth()]}`; };
const fFull = d => { d = new Date(d); return lang === 'zh' ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日` : `${d.getDate()} ${MON()[d.getMonth()]} ${d.getFullYear()}`; };
const fMonth = d => { d = new Date(d); return lang === 'zh' ? `${d.getFullYear()}年${d.getMonth() + 1}月` : `${MON()[d.getMonth()]} ${d.getFullYear()}`; };
const fMon = d => { d = new Date(d); return lang === 'zh' ? `${d.getMonth() + 1}月` : MON()[d.getMonth()]; };
const dayShort = d => (lang === 'zh' ? ZH_D : WD())[new Date(d).getDay()];
const rm = (n, dp = 0) => 'RM' + Number(n).toLocaleString('en-MY', { minimumFractionDigits: dp, maximumFractionDigits: dp });

/* ------------------------------------------------------------------ icons, photos & art */
const IC = {
  home: '<path d="M3.5 10.5 12 3.8l8.5 6.7V20a1 1 0 0 1-1 1h-4.8v-6h-5.4v6H4.5a1 1 0 0 1-1-1z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  wallet: '<path d="M4 7.5V18a2 2 0 0 0 2 2h14V9.5H6a2 2 0 0 1-2-2zm0 0A2 2 0 0 1 6 5.5h11v4"/><circle cx="16" cy="14.8" r="1.1"/>',
  user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1.4-3.8 4.2-5.5 7.5-5.5s6.1 1.7 7.5 5.5"/>',
  users: '<circle cx="9" cy="9" r="3.5"/><path d="M2.5 20c1-3.4 3.4-5 6.5-5s5.5 1.6 6.5 5"/><circle cx="17" cy="8" r="2.8"/><path d="M16.5 13.5c2.6 0 4.3 1.4 5 4"/>',
  chart: '<path d="M4 20V11M10 20V5M16 20v-6M2.5 20.5h19"/>',
  grid: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M9 9.5V20M14.5 9.5V20"/>',
  more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  coins: '<ellipse cx="9" cy="7" rx="5.5" ry="2.5"/><path d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7"/><path d="M9.5 15.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4c0-1.4-2.5-2.5-5.5-2.5"/><path d="M9.5 15.5v3c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-3"/>',
  share: '<path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7M12 3.5v12M7.5 8 12 3.5 16.5 8"/>',
  chevL: '<path d="M15 5.5 8.5 12l6.5 6.5"/>', chevR: '<path d="M9 5.5 15.5 12 9 18.5"/>', chevD: '<path d="M6 9.5 12 15.5l6-6"/>',
  check: '<path d="M5 12.5 10 17.5 19 7"/>', checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.3 11 15.3 16.5 9.3"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  bell: '<path d="M6 9a6 6 0 1 1 12 0c0 6.5 2.5 8 2.5 8h-17S6 15.5 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.5 5.7 3.5 9s-1 6.3-3.5 9c-2.5-2.7-3.5-5.7-3.5-9S9.5 5.7 12 3z"/>',
  sparkle: '<path d="M12 3.5 13.8 10.2 20.5 12 13.8 13.8 12 20.5 10.2 13.8 3.5 12 10.2 10.2z"/>',
  leaf: '<path d="M5 19C6 10 11 5 20 4c-.5 9-6 14.5-15 15z"/><path d="M5 19c4-5 8-8.5 12-11.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  logout: '<path d="M14 4.5h4.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H14M10 8l-4 4 4 4M6 12h10"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9zm0 0c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z"/>',
  heart: '<path d="M12 20s-7.5-4.3-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.7-7.5 10-7.5 10z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
  refresh: '<path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L19.5 9M19.5 4v5h-5M19.5 12a7.5 7.5 0 0 1-13 5.1L4.5 15M4.5 20v-5h5"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  cash: '<rect x="3" y="6.5" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v5M17.5 9.5v5"/>',
  pin: '<path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  map: '<path d="M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  scissors: '<circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M8.3 15.7 19 4M15.7 15.7 5 4"/>',
  polish: '<rect x="9" y="3" width="6" height="7" rx="1"/><rect x="6.5" y="10" width="11" height="11" rx="3"/>',
  face: '<circle cx="12" cy="12" r="8.5"/><path d="M9 10.5h.01M15 10.5h.01M9.5 15c1.4 1 3.6 1 5 0"/>',
  activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  receipt: '<path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"/><path d="M9 8h6M9 11.5h6M9 15h4"/>',
  doc: '<path d="M6.5 3.5H14l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5z"/><path d="M14 3.5V8h4M9 12h6M9 15.5h6"/>',
  camera: '<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  apps: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
};
const icon = (n, s = 22) => `<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
const star = () => '<svg class="ic star" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z"/></svg>';
const photo = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
const IMG = {
  facial: '1570172619644-dfd03ed5d881', mask: '1616394584738-fc6e612e71b9', salon: '1560066984-138dadb4c035', stylist: '1562322140-8baeececf3df',
  pclass: '1588286840104-8957b019727f', pmat: '1518611012118-696072aa579a', pink: '1521590832167-7bcbfaa6381f', nails: '1607779097040-26e80aa78e66', spa: '1512290923902-8a9f81dc236c',
};
const SERUM = '<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="20" y="24" width="16" height="22" rx="5" fill="#F4E9CC" stroke="#111827" stroke-width="1.4"/><rect x="23" y="19" width="10" height="5" rx="1.5" fill="#111827"/><path d="M24.5 19v-6a3.5 3.5 0 0 1 7 0v6z" fill="#111827"/><rect x="23" y="31" width="10" height="8" rx="1.5" fill="#fff"/></svg>';

function fakeQR(seed, size = 176) {
  const n = 25, c = size / n; let r = '';
  let h = hash(seed);
  const finder = (x, y) => `<rect x="${x * c}" y="${y * c}" width="${7 * c}" height="${7 * c}" fill="#111827"/><rect x="${(x + 1) * c}" y="${(y + 1) * c}" width="${5 * c}" height="${5 * c}" fill="#fff"/><rect x="${(x + 2) * c}" y="${(y + 2) * c}" width="${3 * c}" height="${3 * c}" fill="#111827"/>`;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) continue;
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    if ((h >>> 16) % 100 < 46) r += `<rect x="${(x * c).toFixed(2)}" y="${(y * c).toFixed(2)}" width="${c.toFixed(2)}" height="${c.toFixed(2)}"/>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="QR"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#111827">${r}</g>${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
}

/* ------------------------------------------------------------------ catalogue (sample businesses) */
const THER = {
  joanne: { name: 'Joanne', title: { en: 'Senior therapist', zh: '资深美容师' } },
  weiling: { name: 'Wei Ling', title: { en: 'Therapist', zh: '美容师' } },
  aida: { name: 'Aida', title: { en: 'Nail & lash artist', zh: '美甲美睫师' } },
  marcus: { name: 'Marcus', title: { en: 'Senior stylist', zh: '资深发型师' } }, ying: { name: 'Ying', title: { en: 'Colourist', zh: '染发师' } },
  sarah: { name: 'Sarah', title: { en: 'Instructor', zh: '导师' } }, hana: { name: 'Hana', title: { en: 'Instructor', zh: '导师' } },
  nina: { name: 'Nina', title: { en: 'Nail artist', zh: '美甲师' } }, mei: { name: 'Mei', title: { en: 'Lash artist', zh: '美睫师' } },
};
const HOME_CATS = [['all', 'apps'], ['facial', 'face'], ['hair', 'scissors'], ['nails', 'polish'], ['body', 'leaf'], ['pilates', 'activity']];
const BIZS = [
  { id: 'lumiere', cats: ['facial', 'nails', 'body'], name: { en: 'Lumière Skin Studio', zh: 'Lumière 护肤工作室' }, area: { en: 'Bangsar, Kuala Lumpur', zh: '吉隆坡 Bangsar' }, dist: 1.2, rating: 4.8, reviews: 412,
    hours: { en: '10AM–8PM, daily', zh: '每天 10:00–20:00' }, branches: ['Bangsar', 'Subang Jaya'], img: IMG.facial, thumb: IMG.spa, staff: ['joanne', 'weiling', 'aida'],
    desc: { en: 'Skin-first facials, lash and nail care, and calming body treatments. Members use packages and stored value right in the app.', zh: '以肌肤为本的面部护理、美睫美甲与舒缓身体护理。会员可直接在 App 内使用疗程与储值。' },
    tabs: [['facial', 'Facial', '面部护理'], ['lash', 'Lash & nails', '美睫美甲'], ['body', 'Body & scalp', '身体与头皮']] },
  { id: 'glow', cats: ['hair'], name: { en: 'Studio Glow Hair Lounge', zh: 'Studio Glow 美发沙龙' }, area: { en: 'Mont Kiara, Kuala Lumpur', zh: '吉隆坡 Mont Kiara' }, dist: 2.4, rating: 4.7, reviews: 312,
    hours: { en: '9AM–9PM, Mon–Sun', zh: '周一至周日 9:00–21:00' }, img: IMG.salon, thumb: IMG.stylist, staff: ['marcus', 'ying'],
    desc: { en: 'Precision cuts, colour and scalp care by senior stylists, with free consultation on your first visit.', zh: '资深发型师提供精剪、染发与头皮护理，首次到访免费咨询。' },
    tabs: [['cut', 'Hair cut', '剪发'], ['colour', 'Colour', '染发'], ['treat', 'Treatments', '护理']] },
  { id: 'coreflow', cats: ['pilates'], name: { en: 'Core & Flow Pilates', zh: 'Core & Flow 普拉提' }, area: { en: 'Damansara Heights, KL', zh: '吉隆坡 Damansara Heights' }, dist: 3.1, rating: 4.9, reviews: 208,
    hours: { en: '7AM–10PM, Mon–Sat', zh: '周一至周六 7:00–22:00' }, img: IMG.pclass, thumb: IMG.pmat, staff: ['sarah', 'hana'],
    desc: { en: 'Small reformer classes of up to 8 people, plus private and duet sessions.', zh: '每班最多 8 人的核心床小班课，另有私教与双人课。' },
    tabs: [['class', 'Group classes', '团体课'], ['private', 'Private', '私教']] },
  { id: 'polished', cats: ['nails'], name: { en: 'Polished Nail & Lash Bar', zh: 'Polished 美甲美睫' }, area: { en: 'Bukit Bintang, Kuala Lumpur', zh: '吉隆坡 Bukit Bintang' }, dist: 4.0, rating: 4.6, reviews: 189,
    hours: { en: '10AM–10PM, Mon–Sun', zh: '周一至周日 10:00–22:00' }, img: IMG.pink, thumb: IMG.nails, staff: ['nina', 'mei'],
    desc: { en: 'Gel nails, pedicures and lash sets in a calm pink studio.', zh: '在温柔的粉色空间里，提供凝胶美甲、美足与睫毛嫁接。' },
    tabs: [['nails', 'Nails', '美甲'], ['lash', 'Lashes', '美睫']] },
];
const biz = id => BIZS.find(b => b.id === id);
const S_ = (id, b, cat, mins, price, by, en, zh, extra) => Object.assign({ id, biz: b, cat, mins, price, by, name: { en, zh } }, extra || {});
const SERVICES = [
  S_('hydra', 'lumiere', 'facial', 60, 320, ['joanne', 'weiling'], 'Hydrating Glow Facial', '水光焕肤护理', { device: true, short: { en: 'Hydra', zh: '水光' } }),
  S_('deep', 'lumiere', 'facial', 75, 220, ['joanne', 'weiling'], 'Deep Cleansing Facial', '深层清洁护理', { short: { en: 'Deep cleanse', zh: '深层清洁' } }),
  S_('calm', 'lumiere', 'facial', 60, 260, ['joanne'], 'Sensitive Skin Calming', '敏感肌舒缓护理', { short: { en: 'Calming', zh: '舒缓' } }),
  S_('lash', 'lumiere', 'lash', 90, 180, ['aida', 'weiling'], 'Lash Extension (Classic)', '睫毛嫁接（自然款）', { short: { en: 'Lashes', zh: '睫毛' } }),
  S_('gel', 'lumiere', 'lash', 60, 98, ['aida'], 'Gel Manicure', '凝胶美甲', { short: { en: 'Gel nails', zh: '美甲' } }),
  S_('body', 'lumiere', 'body', 90, 240, ['joanne', 'aida'], 'Aromatherapy Body Massage', '芳香精油身体按摩', { short: { en: 'Body', zh: '身体' } }),
  S_('scalp', 'lumiere', 'body', 45, 150, ['aida'], 'Scalp Detox Treatment', '头皮净化护理', { short: { en: 'Scalp', zh: '头皮' } }),
  S_('cutw', 'glow', 'cut', 45, 85, ['marcus', 'ying'], 'Women’s haircut', '女士剪发'),
  S_('cutm', 'glow', 'cut', 30, 45, ['marcus'], 'Men’s haircut', '男士剪发'),
  S_('wash', 'glow', 'cut', 20, 25, ['marcus', 'ying'], 'Hair wash & blow-dry', '洗发吹干'),
  S_('root', 'glow', 'colour', 90, 180, ['ying'], 'Root touch-up', '补染发根'),
  S_('bala', 'glow', 'colour', 180, 480, ['ying'], 'Balayage', '手刷挑染'),
  S_('kera', 'glow', 'treat', 120, 350, ['marcus', 'ying'], 'Keratin treatment', '角蛋白护理'),
  S_('spa', 'glow', 'treat', 45, 120, ['marcus', 'ying'], 'Scalp spa', '头皮水疗'),
  S_('reformer', 'coreflow', 'class', 50, 65, ['sarah', 'hana'], 'Reformer Flow (group)', '核心床团体课'),
  S_('mat', 'coreflow', 'class', 50, 45, ['sarah', 'hana'], 'Mat Pilates (group)', '垫上普拉提团体课'),
  S_('priv', 'coreflow', 'private', 55, 180, ['sarah', 'hana'], 'Private reformer 1:1', '核心床私教 1:1'),
  S_('duet', 'coreflow', 'private', 55, 260, ['sarah'], 'Duet session (2 people)', '双人课'),
  S_('gelm', 'polished', 'nails', 60, 98, ['nina'], 'Gel manicure', '凝胶美甲'),
  S_('gelp', 'polished', 'nails', 60, 120, ['nina'], 'Gel pedicure', '凝胶美足'),
  S_('lset', 'polished', 'lash', 90, 180, ['mei'], 'Classic lash set', '自然款睫毛嫁接'),
  S_('llift', 'polished', 'lash', 60, 150, ['mei'], 'Lash lift & tint', '睫毛翘睫与染色'),
];
const svc = id => SERVICES.find(s => s.id === id);
const PRODUCTS = [
  { id: 'p-hydra6', type: 'package', serviceId: 'hydra', sessions: 6, price: 1800, months: 6, name: { en: 'Hydrating Glow · 6 sessions', zh: '水光焕肤 · 6 次疗程' } },
  { id: 'p-deep5', type: 'package', serviceId: 'deep', sessions: 5, price: 900, months: 6, name: { en: 'Deep Cleansing · 5 sessions', zh: '深层清洁 · 5 次疗程' } },
  { id: 'p-lash4', type: 'package', serviceId: 'lash', sessions: 4, price: 600, months: 4, name: { en: 'Lash Extension · 4 sessions', zh: '睫毛嫁接 · 4 次疗程' } },
  { id: 'topup1000', type: 'topup', price: 1000, bonus: 150, name: { en: 'Stored value RM1,000 (+RM150)', zh: '储值 RM1,000（送 RM150）' } },
  { id: 'serum', type: 'product', price: 168, name: { en: 'Repair Serum 30ml', zh: '修护精华 30ml' } },
  { id: 'p-wash10', biz: 'glow', type: 'package', serviceId: 'wash', sessions: 10, price: 200, months: 6, name: { en: 'Wash & blow-dry · 10 sessions', zh: '洗发吹干 · 10 次' } },
  { id: 'p-ref10', biz: 'coreflow', type: 'package', serviceId: 'reformer', sessions: 10, price: 550, months: 6, name: { en: 'Reformer Flow · 10 classes', zh: '核心床团体课 · 10 堂' } },
];
const product = id => PRODUCTS.find(p => p.id === id);
const MS_DATA = {
  ther: { joanne: 'Terapis kanan', weiling: 'Terapis', aida: 'Artis kuku & bulu mata', marcus: 'Penggaya kanan', ying: 'Pakar warna rambut', sarah: 'Jurulatih', hana: 'Jurulatih', nina: 'Artis kuku', mei: 'Artis bulu mata' },
  biz: {
    lumiere: { area: 'Bangsar, Kuala Lumpur', hours: '10 pagi–8 malam, setiap hari', tabs: ['Muka', 'Bulu mata & kuku', 'Badan & kulit kepala'],
      desc: 'Rawatan muka yang mengutamakan kesihatan kulit, penjagaan bulu mata dan kuku, serta rawatan badan yang menenangkan. Ahli boleh menggunakan pakej dan nilai tersimpan terus dalam aplikasi.' },
    glow: { area: 'Mont Kiara, Kuala Lumpur', hours: '9 pagi–9 malam, Isnin–Ahad', tabs: ['Potong rambut', 'Warna', 'Rawatan'],
      desc: 'Potongan rambut yang kemas, pewarnaan dan penjagaan kulit kepala oleh penggaya kanan, dengan konsultasi percuma pada lawatan pertama.' },
    coreflow: { area: 'Damansara Heights, KL', hours: '7 pagi–10 malam, Isnin–Sabtu', tabs: ['Kelas berkumpulan', 'Persendirian'],
      desc: 'Kelas reformer kecil sehingga 8 orang, serta sesi persendirian dan sesi berdua.' },
    polished: { area: 'Bukit Bintang, Kuala Lumpur', hours: '10 pagi–10 malam, Isnin–Ahad', tabs: ['Kuku', 'Bulu mata'],
      desc: 'Kuku gel, pedikur dan set bulu mata dalam studio merah jambu yang tenang.' },
  },
  svc: {
    hydra: ['Rawatan Muka Hydrating Glow', 'Hydra'], deep: ['Rawatan Muka Pembersihan Mendalam', 'Pembersihan'], calm: ['Rawatan Penenang Kulit Sensitif', 'Penenang'],
    lash: ['Sambungan Bulu Mata (Klasik)', 'Bulu mata'], gel: ['Manikur Gel', 'Kuku gel'], body: ['Urutan Badan Aromaterapi', 'Badan'], scalp: ['Rawatan Detoks Kulit Kepala', 'Kulit kepala'],
    cutw: ['Potong rambut wanita'], cutm: ['Potong rambut lelaki'], wash: ['Cuci & blow-dry rambut'], root: ['Warna akar rambut'], bala: ['Balayage'],
    kera: ['Rawatan keratin'], spa: ['Spa kulit kepala'], reformer: ['Reformer Flow (berkumpulan)'], mat: ['Pilates Mat (berkumpulan)'],
    priv: ['Reformer persendirian 1:1'], duet: ['Sesi berdua (2 orang)'], gelm: ['Manikur gel'], gelp: ['Pedikur gel'], lset: ['Set bulu mata klasik'], llift: ['Lash lift & warna'],
  },
  prod: { 'p-hydra6': 'Hydrating Glow · 6 sesi', 'p-deep5': 'Pembersihan Mendalam · 5 sesi', 'p-lash4': 'Sambungan Bulu Mata · 4 sesi', topup1000: 'Nilai tersimpan RM1,000 (+RM150)', serum: 'Serum Pemulih 30ml', 'p-wash10': 'Cuci & blow-dry · 10 sesi', 'p-ref10': 'Reformer Flow · 10 kelas' },
};
Object.keys(THER).forEach(k => { THER[k].title.ms = MS_DATA.ther[k] || THER[k].title.en; });
BIZS.forEach(b => {
  const m = MS_DATA.biz[b.id] || {};
  b.name.ms = b.name.en; b.area.ms = m.area || b.area.en; b.hours.ms = m.hours || b.hours.en; b.desc.ms = m.desc || b.desc.en;
  b.tabs.forEach((tb, i) => { tb[3] = (m.tabs && m.tabs[i]) || tb[1]; });
});
SERVICES.forEach(s => { const m = MS_DATA.svc[s.id] || []; s.name.ms = m[0] || s.name.en; if (s.short) s.short.ms = m[1] || s.short.en; });
PRODUCTS.forEach(p => { p.name.ms = MS_DATA.prod[p.id] || p.name.en; p.biz = p.biz || 'lumiere'; });
const MEMBERS = [
  { id: 'meiling', name: 'Mei Ling Tan', tier: 'gold', seg: 'vip', last: 11, ltv: 6240, visits: 18, pk: 3, rebuy: 8, intro: 'Kelvin', consent: true },
  { id: 'grace', name: 'Grace Lim', tier: 'gold', seg: 'vip', last: 4, ltv: 5880, visits: 22, bal: 1200, pk: 4, rebuy: 7, consent: true },
  { id: 'jessica', name: 'Jessica Wong', tier: 'gold', seg: 'loyal', last: 9, ltv: 5410, visits: 19, bal: 640, pk: 3, rebuy: 9, consent: true },
  { id: 'priya', name: 'Priya Nair', tier: 'silver', seg: 'loyal', last: 15, ltv: 4960, visits: 16, bal: 900, pk: 3, rebuy: 10, consent: true },
  { id: 'lina', name: 'Lina Ong', tier: 'gold', seg: 'loyal', last: 3, ltv: 3980, visits: 15, bal: 450, pk: 2, rebuy: 9, consent: true },
  { id: 'rachel', name: 'Rachel Chew', tier: 'silver', seg: 'atrisk', last: 52, ltv: 4720, visits: 14, bal: 300, pk: 3, rebuy: 11, consent: true },
  { id: 'kavitha', name: 'Kavitha Raj', tier: 'silver', seg: 'atrisk', last: 48, ltv: 3120, visits: 11, bal: 0, pk: 2, rebuy: 12, consent: true },
  { id: 'siti', name: 'Siti Rahmah', tier: 'silver', seg: 'away', last: 74, ltv: 2180, visits: 7, bal: 1500, pk: 1, rebuy: 0, consent: false },
  { id: 'farah', name: 'Farah Idris', tier: 'silver', seg: 'away', last: 66, ltv: 1960, visits: 6, bal: 880, pk: 1, rebuy: 0, consent: true },
  { id: 'nur', name: 'Nur Aisyah', tier: 'silver', seg: 'new', last: 6, ltv: 620, visits: 2, bal: 1200, pk: 1, rebuy: 0, consent: false, intro: 'Kelvin' },
  { id: 'joyce', name: 'Joyce Lee', tier: 'silver', seg: 'new', last: 2, ltv: 220, visits: 1, bal: 0, pk: 0, rebuy: 0, consent: true },
  { id: 'emily', name: 'Emily Tan', tier: 'silver', seg: 'lost', last: 210, ltv: 880, visits: 0, bal: 0, pk: 1, rebuy: 0, consent: true },
];
const member = id => MEMBERS.find(m => m.id === id);
MEMBERS.forEach(m => { m.name0 = m.name; });
/* sample contact details. Only the owner/admin screens show them; the staff and freelancer screens never do */
const MEMBER_CONTACT = {
  meiling: { phone: '+60 12-000 0101', email: 'meiling.tan@example.com', wechat: 'meiling_tan', fb: '', ig: '@meiling.glow' },
  grace: { phone: '+60 12-000 0102', email: 'grace.lim@example.com', wechat: 'gracelim88', fb: 'facebook.com/grace.lim', ig: '' },
  jessica: { phone: '+60 16-000 0103', email: 'jessica.wong@example.com', wechat: 'jesswong', fb: '', ig: '@jess.w' },
  priya: { phone: '+60 17-000 0104', email: 'priya.nair@example.com', wechat: '', fb: 'facebook.com/priya.nair', ig: '@priyanair' },
  lina: { phone: '+60 12-000 0105', email: 'lina.ong@example.com', wechat: 'lina_ong', fb: '', ig: '' },
  rachel: { phone: '+60 11-0000 0106', email: 'rachel.chew@example.com', wechat: 'rachelchew', fb: '', ig: '@rachel.chew' },
  kavitha: { phone: '+60 19-000 0107', email: '', wechat: '', fb: 'facebook.com/kavitha.raj', ig: '' },
  siti: { phone: '+60 13-000 0108', email: 'siti.rahmah@example.com', wechat: '', fb: '', ig: '@sitirahmah' },
  farah: { phone: '+60 12-000 0109', email: 'farah.idris@example.com', wechat: '', fb: 'facebook.com/farah.idris', ig: '@farah.i' },
  nur: { phone: '+60 14-000 0110', email: 'nur.aisyah@example.com', wechat: '', fb: '', ig: '@nuraisyah' },
  joyce: { phone: '+60 16-000 0111', email: 'joyce.lee@example.com', wechat: 'joycelee_', fb: '', ig: '' },
  emily: { phone: '+60 12-000 0112', email: '', wechat: 'emilytan', fb: '', ig: '' },
};
/* sample birthdays, placed around today so the demo always has some coming up */
const BDAY_SEED = { priya: [0, 1990], grace: [2, 1988], meiling: [5, 1992], siti: [12, 1995], joyce: [23, 1999], lina: [-30, 1991], jessica: [60, 1987], rachel: [95, 1993], nur: [140, 2000], farah: [-120, 1989], kavitha: [200, 1985] };
Object.keys(BDAY_SEED).forEach(id => { const [dd, y] = BDAY_SEED[id], x = addDays(today0(), dd); MEMBER_CONTACT[id].bday = `${y}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; });
const CONTACT_KEYS = ['phone', 'email', 'wechat', 'fb', 'ig', 'bday'];
function mContact(id) { const m = member(id); return Object.assign({ name: m ? m.name0 : '' }, MEMBER_CONTACT[id] || {}, (S && S.mEdit && S.mEdit[id]) || {}); }
function applyMemberEdits() { MEMBERS.forEach(m => { const e = S && S.mEdit && S.mEdit[m.id]; m.name = e && e.name ? e.name : m.name0; }); }
function setMemberContact(id, c) {
  if (!member(id)) return false;
  const clean = {}; ['name'].concat(CONTACT_KEYS).forEach(k => { clean[k] = String(c[k] == null ? '' : c[k]).trim().slice(0, 120); });
  if (!clean.name) return false;
  if (clean.bday && !/^\d{4}-\d{2}-\d{2}$/.test(clean.bday)) clean.bday = '';
  S.mEdit = S.mEdit || {}; S.mEdit[id] = clean; applyMemberEdits(); save(); return true;
}
const contactLinks = c => {
  const digits = (c.phone || '').replace(/\D/g, '');
  return {
    phone: digits ? 'tel:+' + digits : '', wa: digits ? 'https://wa.me/' + digits : '', email: c.email ? 'mailto:' + c.email : '',
    fb: c.fb ? 'https://' + c.fb.replace(/^https?:\/\//, '') : '', ig: c.ig ? 'https://instagram.com/' + c.ig.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '') : '',
  };
};
const initials = n => n.split(' ').map(x => x[0]).slice(0, 2).join('');
const masked = n => { const p = n.split(' '); return p[0] + (p[1] ? ' ' + p[1][0] + '.' : ''); };

/* one sample day at Lumière used by the admin diary, today list and therapist view */
const DAYPLAN = [
  { id: 'a1', t: '10:00', s: 'deep', c: 'nur', th: 'joanne', room: 'r1' },
  { id: 'a2', t: '10:30', s: 'lash', c: 'siti', th: 'weiling', room: 'r2' },
  { id: 'a3', t: '11:30', s: 'hydra', c: 'lina', th: 'joanne', room: 'r1', dev: true },
  { id: 'a4', t: '12:00', s: 'gel', c: 'joyce', th: 'aida' },
  { id: 'a5', t: '13:30', s: 'hydra', c: 'grace', th: 'weiling', room: 'r2', dev: true },
  { id: 'a6', t: '14:00', s: 'calm', c: 'priya', th: 'joanne', room: 'r1' },
  { id: 'a7', t: '15:30', s: 'body', c: 'jessica', th: 'aida', room: 'r1' },
  { id: 'a8', t: '16:00', s: 'deep', c: 'farah', th: 'weiling', room: 'r2' },
  { id: 'a9', t: '17:30', s: 'gel', c: 'kavitha', th: 'aida' },
  { id: 'a10', t: '17:30', s: 'deep', c: 'rachel', th: 'joanne', room: 'r2' },
];
const BREAKS = [{ th: 'joanne', t: '12:45', m: 60 }, { th: 'weiling', t: '12:15', m: 60 }, { th: 'aida', t: '13:00', m: 60 }];
/* everyone who works at Lumière signs in with their own ID: employees, freelancers and beauty consultants */
const STAFF = {
  joanne: { id: 'LUM-012', kind: 'free', role: 'therapist' }, weiling: { id: 'LUM-004', kind: 'staff', role: 'therapist', salary: 2800 },
  aida: { id: 'LUM-019', kind: 'free', role: 'therapist' }, sara: { name: 'Sara', id: 'LUM-007', kind: 'staff', role: 'consult', salary: 2400, admin: true },
};
/* the owner's edits (S.team) win over the defaults above */
const teamOf = k => Object.assign({}, STAFF[k], (S && S.team && S.team[k]) || {});
const staffKind = k => teamOf(k).kind;
const staffRole = k => teamOf(k).role;
const staffSalary = k => Number(teamOf(k).salary) || 2600;
const hourlyRate = k => Math.round(staffSalary(k) / 26 / 8 * 100) / 100;
const canOT = k => staffKind(k) === 'staff';
/* admin access: the owner switches it on per person; it lets them see and edit client contact details */
const staffAdmin = k => !!teamOf(k).admin;
function setStaffAdmin(k, on, by) {
  if (!STAFF[k]) return false;
  S.team[k] = Object.assign(S.team[k] || {}, { admin: !!on, adminBy: { name: by.name, at: new Date().toISOString(), on: !!on } });
  save(); return true;
}
const adminByText = k => { const b = teamOf(k).adminBy; return b ? t(b.on ? 'adminGranted' : 'adminRemoved', { b: esc(b.name), d: fDate(b.at) }) : ''; };
const OT_MULT = { normal: 1.5, rest: 2, ph: 3 };
const SHIFT_END = '18:00';
const staffName = k => (THER[k] || STAFF[k] || { name: k }).name;
/* sample arrival / start offsets and treatment length (minutes) for today's appointments that are already over */
const SAMPLE_T = { a1: [6, 9, 71], a2: [14, 15, 92], a3: [-3, 2, 68], a4: [0, 1, 58], a5: [-5, 0, 66], a6: [2, 4, 61], a7: [1, 12, 88], a8: [19, 20, 70], a9: [8, 10, 55] };
const minsDiff = (a, b) => Math.round((new Date(a) - new Date(b)) / 60000);
function logOf(id, start, mins) {
  /* the sample day repeats its appointment ids, so a record only counts for the day it was made */
  const L = S.tLog[id]; if (L && (!L.sched || sameDay(L.sched, start))) return L;
  const s = SAMPLE_T[id]; if (!s || start.getTime() + mins * 60000 > Date.now()) return {};
  const m = n => new Date(start.getTime() + n * 60000).toISOString();
  return { arr: m(s[0]), start: m(s[1]), end: m(s[1] + s[2]), sample: true };
}
const stOf = L => L.cx ? 'cx' : L.end ? 'done' : L.start ? 'in' : L.arr ? 'arr' : 'todo';
/* minutes the treatment started after the later of booked time and arrival */
const startLateOf = (L, sched) => L.start ? Math.round((new Date(L.start) - Math.max(new Date(sched).getTime(), L.arr ? new Date(L.arr).getTime() : 0)) / 60000) : 0;

/* ------------------------------------------------------------------ state */
function otAmount(k, from, to, day) {
  const mm = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const hours = Math.max(0, Math.round((mm(to) - mm(from)) / 60 * 100) / 100), rate = hourlyRate(k), mult = OT_MULT[day] || 1.5;
  return { hours, rate, mult, amount: Math.round(hours * rate * mult * 100) / 100 };
}
function seedClaims() {
  const d = n => addDays(today0(), n).toISOString();
  return [
    { id: 'c1', who: 'joanne', type: 'exp', cat: 'transport', amount: 18.5, date: d(-6), desc: 'Grab to Subang Jaya branch for a cover shift', receipt: 'grab.jpg', status: 'paid' },
    { id: 'c2', who: 'joanne', type: 'exp', cat: 'supplies', amount: 42, date: d(-2), desc: 'Cotton pads and gauze for Room 1', receipt: 'receipt.jpg', status: 'pending' },
    Object.assign({ id: 'c3', who: 'weiling', type: 'ot', date: d(-1), from: '18:00', to: '20:30', day: 'normal', desc: 'Covered a late lash appointment', status: 'pending' }, otAmount('weiling', '18:00', '20:30', 'normal')),
    { id: 'c4', who: 'weiling', type: 'exp', cat: 'training', amount: 120, date: d(-12), desc: 'Brow lamination workshop', receipt: 'workshop.jpg', status: 'approved' },
    Object.assign({ id: 'c5', who: 'sara', type: 'ot', date: d(-5), from: '18:00', to: '19:30', day: 'rest', desc: 'Weekend package promotion booth', status: 'approved' }, otAmount('sara', '18:00', '19:30', 'rest')),
    { id: 'c6', who: 'aida', type: 'exp', cat: 'meals', amount: 25, date: d(-3), desc: 'Lunch during nail art training', receipt: null, status: 'pending' },
  ];
}
/* treatment records: one per visit. Everyone on the team can read, add, edit and comment; every change is logged */
const VF = ['notes', 'skin', 'products', 'advice'];
function seedVisits() {
  const d = (n, h) => { const x = addDays(today0(), n); x.setHours(h || 15, 20, 0, 0); return x.toISOString(); };
  const J = { name: 'Joanne', role: 'free' }, W = { name: 'Wei Ling', role: 'staff' }, O = { name: 'Michelle', role: 'owner' };
  const V = (id, mid, ago, sid, th, f, extra) => Object.assign({ id, mid, date: d(-ago), sid, th, notes: f[0], skin: f[1], products: f[2], advice: f[3], comments: [], log: [{ at: d(-ago), who: th === 'weiling' ? W : J, act: 'created' }] }, extra || {});
  const v1 = V('v1', 'meiling', 11, 'hydra', 'joanne', ['Hydrating Glow, 3-step serum infusion. Extraction on T-zone only.', 'Cheeks dehydrated. Small redness on left cheek after extraction, settled in 10 minutes.', 'Hyaluronic booster 15%, Repair Serum', 'Avoid salicylic acid (allergy). Use lighter extraction pressure next time.']);
  v1.log.push({ at: d(-11, 16), who: J, act: 'edited', changes: [{ f: 'advice', from: 'Avoid salicylic acid (allergy).', to: 'Avoid salicylic acid (allergy). Use lighter extraction pressure next time.' }] });
  v1.comments.push({ at: d(-10, 11), who: O, text: 'She asked about the Repair Serum for home use. Sold 1 bottle.' });
  v1.log.push({ at: d(-10, 11), who: O, act: 'comment', text: 'She asked about the Repair Serum for home use. Sold 1 bottle.' });
  return [
    v1,
    V('v2', 'meiling', 25, 'hydra', 'joanne', ['Hydrating Glow, standard programme.', 'Combination skin, mild congestion on the nose.', 'Hyaluronic booster 10%', 'Increase the booster to 15% next visit.']),
    V('v3', 'meiling', 39, 'deep', 'weiling', ['Deep cleansing facial, first visit.', 'Sensitive skin; reacted to salicylic acid in the patch test.', 'Calming mask', 'Recommend the Hydrating Glow package.']),
    V('v4', 'nur', 20, 'deep', 'joanne', ['Deep cleansing with steam and extraction.', 'Oily T-zone, a few closed comedones on the chin.', 'Clay mask, toner', 'Book again in 3–4 weeks.']),
    V('v5', 'lina', 14, 'hydra', 'joanne', ['Hydrating Glow.', 'Good hydration, slight pigmentation on cheeks.', 'Vitamin C serum', 'Add brightening ampoule next time.']),
    V('v6', 'priya', 13, 'calm', 'joanne', ['Sensitive skin calming treatment.', 'Redness around the nose has reduced since last month.', 'Centella mask', 'Prefers firm pressure for the massage.']),
    V('v7', 'grace', 4, 'hydra', 'weiling', ['Hydrating Glow with LED.', 'Skin in good condition.', 'Hyaluronic booster 10%, LED 10 min', 'Continue the package; next visit in 2 weeks.']),
    V('v8', 'rachel', 52, 'deep', 'joanne', ['Deep cleansing, gentle programme.', 'Pregnant (2nd trimester). No essential oils, no strong peels.', 'Fragrance-free cleanser', 'Keep to gentle treatments until after delivery.']),
  ];
}
function seedInvoices() {
  const d = n => addDays(today0(), n).toISOString();
  return [
    { id: 'i1', no: 'INV-0038', date: d(-40), due: d(-10), mid: 'priya', items: [{ ref: 'p:p-deep5', qty: 1, price: 900 }], discount: 0, sst: false, notes: '', status: 'issued' },
    { id: 'i2', no: 'INV-0039', date: d(-12), due: d(2), mid: null, name: 'Bangsar Wellness Sdn Bhd', contact: 'hr@bangsarwellness.example', items: [{ ref: null, label: 'Staff wellness day: express facial', qty: 8, price: 120 }, { ref: 's:gel', qty: 4, price: 98 }], discount: 92, sst: true, notes: '', status: 'issued' },
    { id: 'i3', no: 'INV-0040', date: d(-3), due: d(-3), mid: 'grace', items: [{ ref: 'p:p-hydra6', qty: 1, price: 1800 }], discount: 0, sst: false, notes: '', status: 'paid', paidAt: d(-3), method: 'card' },
  ];
}
function seed() {
  const t0 = today0();
  const bought = addDays(t0, -39);
  const exp = new Date(bought); exp.setMonth(exp.getMonth() + 6);
  return {
    v: 4, signedIn: false, role: null, phone: '12 345 6789', calAlways: null, favs: ['lumiere'], branchRule: 'all',
    notif: { rem: true, exp: true, offers: true, after: true },
    skin: { type: ['combo', 'sensitive'], concerns: ['dull', 'pores'], allergy: 'Salicylic acid', photo: 'archive', consent: addDays(t0, -39).toISOString() },
    packages: [
      { id: 'pk1', biz: 'lumiere', branch: 'Bangsar', productId: 'p-hydra6', serviceId: 'hydra', total: 6, used: 2, price: 1800, purchased: bought.toISOString(), expires: exp.toISOString() },
      { id: 'pk2', biz: 'coreflow', productId: 'p-ref10', serviceId: 'reformer', total: 10, used: 7, price: 550, purchased: addDays(t0, -170).toISOString(), expires: addDays(t0, 12).toISOString() },
      { id: 'pk3', biz: 'glow', productId: 'p-wash10', serviceId: 'wash', total: 10, used: 3, price: 200, purchased: addDays(t0, -50).toISOString(), expires: addDays(t0, 132).toISOString() },
    ],
    stored: { lumiere: 1150, glow: 245 },
    ledger: [
      { id: 'l1', wallet: 'stored:lumiere', date: addDays(t0, -60).toISOString(), kind: 'topup', amount: 1000, bal: 1000 },
      { id: 'l2', wallet: 'stored:lumiere', date: addDays(t0, -60).toISOString(), kind: 'bonus', amount: 150, bal: 1150 },
      { id: 'g1', wallet: 'stored:glow', date: addDays(t0, -62).toISOString(), kind: 'topup', amount: 300, bal: 300 },
      { id: 'g2', wallet: 'stored:glow', date: addDays(t0, -62).toISOString(), kind: 'bonus', amount: 30, bal: 330 },
      { id: 'g3', wallet: 'stored:glow', date: addDays(t0, -18).toISOString(), kind: 'use', amount: -85, bal: 245, serviceId: 'cutw' },
      { id: 'w0', wallet: 'pk3', date: addDays(t0, -50).toISOString(), kind: 'purchase', amount: 10, bal: 10 },
      ...[-46, -32, -18].map((d, i) => ({ id: 'w' + (i + 1), wallet: 'pk3', date: addDays(t0, d).toISOString(), kind: 'use', amount: -1, bal: 9 - i, serviceId: 'wash' })),
      { id: 'r0', wallet: 'pk2', date: addDays(t0, -170).toISOString(), kind: 'purchase', amount: 10, bal: 10 },
      ...[-150, -128, -100, -71, -45, -20, -6].map((d, i) => ({ id: 'r' + (i + 1), wallet: 'pk2', date: addDays(t0, d).toISOString(), kind: 'use', amount: -1, bal: 9 - i, serviceId: 'reformer' })),
      { id: 'l3', wallet: 'pk1', date: bought.toISOString(), kind: 'purchase', amount: 6, bal: 6 },
      { id: 'l4', wallet: 'pk1', date: addDays(t0, -25).toISOString(), kind: 'use', amount: -1, bal: 5, serviceId: 'hydra' },
      { id: 'l5', wallet: 'pk1', date: addDays(t0, -11).toISOString(), kind: 'use', amount: -1, bal: 4, serviceId: 'hydra' },
    ],
    bookings: [
      { id: 'b1', biz: 'lumiere', serviceId: 'hydra', extra: [], therapistId: 'joanne', room: 'r2', start: at(addDays(t0, 3), '14:30').toISOString(), status: 'booked', pay: 'package', pkg: 'pk1', staffNew: true },
      { id: 'b2', biz: 'glow', serviceId: 'cutw', extra: ['wash'], therapistId: 'marcus', room: null, start: at(addDays(t0, -18), '11:00').toISOString(), status: 'completed', pay: 'store', pkg: null },
      { id: 'b0', biz: 'lumiere', serviceId: 'hydra', extra: [], therapistId: 'joanne', room: 'r2', start: at(addDays(t0, -11), '14:30').toISOString(), status: 'completed', pay: 'package', pkg: 'pk1' },
      { id: 'bz', biz: 'lumiere', serviceId: 'hydra', extra: [], therapistId: 'joanne', room: 'r2', start: at(addDays(t0, -25), '15:00').toISOString(), status: 'completed', pay: 'package', pkg: 'pk1' },
    ],
    vouchers: [], claimed: {}, sales: [], approvals: {}, tLog: {}, tExtra: 0, tCount: 0, installDismissed: false,
  };
}
let S = null;
function loadState() {
  S = LS.get(KEY, null);
  if (!S || S.v !== 4) S = seed();
  S.tLog = S.tLog || {};
  S.team = S.team || {};
  if (!S.claims) S.claims = seedClaims();
  if (!S.invoices) { S.invoices = seedInvoices(); S.invSeq = 41; }
  S.tNotif = S.tNotif || { rem: true, run: true, change: true };
  S.tAck = S.tAck || {}; S.tAdded = S.tAdded || {}; if (S.tCal === undefined) S.tCal = null;
  if (!S.mig4) { const b1 = S.bookings.find(b => b.id === 'b1'); if (b1) b1.staffNew = true; S.mig4 = true; }
  S.mEdit = S.mEdit || {};
  if (!S.visits) S.visits = seedVisits();
  S.bday = S.bday || {}; S.bdayRem = S.bdayRem || { day: true, before: true }; S.bdayNotified = S.bdayNotified || {};
  applyMemberEdits();
}
loadState();
const save = () => LS.set(KEY, S);

const isBooked = b => b.status === 'booked';
const bSvcs = b => [b.serviceId].concat(b.extra || []).map(svc).filter(Boolean);
const bName = b => bSvcs(b).map(s => s.name[lang]).join(' + ');
const bMins = b => bSvcs(b).reduce((a, s) => a + s.mins, 0);
const bPrice = b => bSvcs(b).reduce((a, s) => a + s.price, 0);
const bBiz = b => biz(b.biz || svc(b.serviceId).biz);
const heldFor = pk => S.bookings.filter(b => isBooked(b) && b.pay === 'package' && b.pkg === pk.id).length;
const avail = pk => pk.total - pk.used - heldFor(pk);
const heldRM = id => S.bookings.filter(b => isBooked(b) && b.pay === 'stored' && bBiz(b).id === id).reduce((a, b) => a + bPrice(b), 0);
const storedOf = id => (S.stored && S.stored[id]) || 0;
const storedAvail = id => storedOf(id) - heldRM(id);
const pkgLeft = pk => avail(pk) + heldFor(pk);
const daysTo = d => Math.ceil((new Date(d) - today0()) / DAY);
const activePk = id => S.packages.filter(p => p.biz === id && pkgLeft(p) > 0 && new Date(p.expires) > new Date());
const expiring = pk => daysTo(pk.expires) <= 30;
const hasExp = id => activePk(id).some(expiring) ? 1 : 0;
/* stores where the member holds something; any store with a package about to expire comes first */
const walletStores = () => BIZS.filter(b => activePk(b.id).length || storedOf(b.id) > 0 || S.vouchers.some(v => v.biz === b.id)).sort((a, b) => hasExp(b.id) - hasExp(a.id));
const pkgFor = sid => S.packages.filter(p => p.serviceId === sid && avail(p) > 0 && new Date(p.expires) > new Date()).sort((a, b) => new Date(a.expires) - new Date(b.expires))[0];
const pkgName = pk => { const p = product(pk.productId); return p ? p.name[lang] : ''; };
const nextBooking = () => S.bookings.filter(b => isBooked(b) && new Date(b.start) > new Date()).sort((a, b) => new Date(a.start) - new Date(b.start))[0];
const roomName = r => r ? t(r === 'r1' ? 'room1' : 'room2') : '';
const calName = c => { const k = effCal(c); return t(k === 'apple' ? 'appleCal' : k === 'google' ? 'googleCal' : 'otherCal'); };
/* the admin demo is Lumière, so it only ever sees Mei Ling's Lumière balance */
const meilingBalance = () => activePk('lumiere').reduce((a, p) => a + pkgLeft(p) * (p.price / p.total), 0) + storedOf('lumiere');
const firstName = n => { const p = n.split(' '); return p.length > 2 ? p.slice(0, -1).join(' ') : p[0]; };

function ledgerAdd(wallet, kind, amount, extra) {
  const prev = S.ledger.filter(l => l.wallet === wallet).sort((a, b) => new Date(a.date) - new Date(b.date)).pop();
  S.ledger.push(Object.assign({ id: 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), wallet, date: new Date().toISOString(), kind, amount, bal: (prev ? prev.bal : 0) + amount }, extra || {}));
}

/* ------------------------------------------------------------------ chrome */
const TABS = {
  m: [['home', '/m/home', 'tabHome'], ['calendar', '/m/bookings', 'tabBookings'], ['wallet', '/m/wallet', 'tabWallet'], ['user', '/m/me', 'tabProfile']],
  a: [['home', '/a/today', 'aToday'], ['grid', '/a/diary', 'aDiary'], ['users', '/a/members', 'aMembers'], ['chart', '/a/reports', 'aReports'], ['more', '/a/more', 'aMore']],
  t: [['calendar', '/t/today', 'tSchedule'], ['coins', '/t/earnings', 'tEarnings'], ['receipt', '/t/claims', 'tClaims'], ['user', '/t/me', 'tabProfile']],
  g: [['home', '/g/home', 'gHome'], ['share', '/g/share', 'gShare'], ['coins', '/g/payouts', 'gPayouts']],
};
const HOME = { member: '/m/home', admin: '/a/today', therapist: '/t/today', agent: '/g/home' };
const ROLES = ['member', 'admin', 'therapist', 'agent'];

function page({ tabs, active, body, back, title, cls, right }) {
  const top = back
    ? `<header class="topbar"><a class="icon-btn" href="#${back}" aria-label="${t('back')}">${icon('chevL')}</a><div class="tb-title">${title || ''}</div>${right || '<span class="icon-btn" aria-hidden="true"></span>'}</header>`
    : '<div class="safe-top"></div>';
  const bar = tabs ? `<nav class="tabbar">${TABS[tabs].map(([ic, href, k]) => `<a class="tab ${active === href ? 'active' : ''}" href="#${href}" ${active === href ? 'aria-current="page"' : ''}>${icon(ic)}<span>${t(k)}</span></a>`).join('')}</nav>` : '';
  return `${top}<main class="main ${cls || ''}" id="main">${body}</main>${bar}`;
}
const redirect = p => { setTimeout(() => go(p), 0); return '<main class="main" id="main"></main>'; };
const mark = (l, dark) => `<span class="mark ${dark ? 'dark' : ''}">${l || 'L'}</span>`;
const langName = () => (LANGS.find(l => l[0] === lang) || LANGS[0])[1];
const langBtn = () => `<div class="langseg" role="group" aria-label="${t('language')}">${LANGS.map(([k, , s]) => `<button class="${k === lang ? 'on' : ''}" data-act="setLang" data-l="${k}" lang="${htmlLang(k)}" aria-pressed="${k === lang}">${s}</button>`).join('')}</div>`;
const logo = cls => `<img class="${cls}" src="icons/logo.png" alt="appt4u" width="960" height="263">`;
const appIcon = () => '<img class="app-icon" src="icons/icon-192.png" alt="" width="40" height="40">';
const kpi = (l, v, d) => `<div class="kpi"><span class="kpi-l">${l}</span><span class="kpi-v">${v}</span>${d || ''}</div>`;
const delta = (txt, dir) => `<span class="delta ${dir}">${dir === 'up' ? '▲' : dir === 'down' ? '▼' : '•'} ${txt}</span>`;
const statrow = (l, v) => `<div class="statrow"><span>${l}</span><b>${v}</b></div>`;
const menuLink = (href, ic, label, val) => `<a class="menu-item" href="#${href}">${icon(ic, 20)}<span class="grow">${label}</span>${val ? `<span class="val">${val}</span>` : ''}${icon('chevR', 16)}</a>`;
const menuBtn = (act, ic, label, val) => `<button class="menu-item" data-act="${act}">${icon(ic, 20)}<span class="grow">${label}</span>${val ? `<span class="val">${val}</span>` : ''}${icon('chevR', 16)}</button>`;
const pic = (id, w, cls) => `<img class="${cls}" src="${photo(id, w)}" alt="" loading="lazy" decoding="async">`;

/* ------------------------------------------------------------------ welcome & sign-in */
function vWelcome() {
  return `<div class="welcome">
  <div class="welcome-photo"><img src="${photo(IMG.salon, 900)}" alt="" decoding="async">
    <div class="welcome-top"><span class="brand-chip">${logo('logo-chip')}</span>${langBtn()}</div></div>
  <div class="welcome-body">
    <h1 class="display">${t('welcomeT')}</h1>
    <p class="lead">${t('welcomeSub')}</p>
    <a class="btn btn-primary btn-block" href="#/login">${icon('phone', 18)} ${t('signInPhone')}</a>
    <button class="btn btn-outline btn-block" data-act="roles">${t('exploreDemo')}</button>
    <p class="small muted center">${t('demoNote')}</p>
  </div></div>`;
}
function vLogin() {
  return page({ back: '/welcome', body: `<div class="stack-lg pad-top">
    <div class="stack-sm"><h1 class="h1">${t('phoneTitle')}</h1><p class="muted">${t('phoneSub')}</p></div>
    <label class="field-wrap"><span class="prefix">+60</span><input class="field" id="phone" inputmode="tel" autocomplete="tel" value="${esc(S.phone)}" aria-label="${t('phoneTitle')}"></label>
    <button class="btn btn-primary btn-block" data-act="sendCode">${t('sendCode')}</button>
    <p class="small muted">${t('agree')}</p></div>` });
}
function vOtp() {
  return page({ back: '/login', body: `<div class="stack-lg pad-top">
    <div class="stack-sm"><h1 class="h1">${t('otpTitle')}</h1><p class="muted">${t('otpSub', { p: '+60 ' + esc(S.phone) })}</p></div>
    <input class="field otp" id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="······" aria-label="${t('otpTitle')}">
    <button class="btn btn-primary btn-block" data-act="verify">${t('verify')}</button></div>` });
}
function rolesSheet() {
  openSheet(`<h2 class="h2">${t('chooseRole')}</h2><div class="stack-xs">${ROLES.map(r => `<button class="opt" data-act="role" data-role="${r}">${icon({ member: 'user', admin: 'chart', therapist: 'sparkle', agent: 'share' }[r], 20)}<span class="grow"><b>${t('r_' + r)}</b><br><span class="small muted">${t('r_' + r + 'Sub')}</span></span>${icon('chevR', 16)}</button>`).join('')}
    <a class="opt" href="platform/">${icon('apps', 20)}<span class="grow"><b>${t('r_platform')}</b><br><span class="small muted">${t('r_platformSub')}</span></span>${icon('chevR', 16)}</a></div>`);
}

/* ------------------------------------------------------------------ member: home */
let hCat = 'all', hQuery = '';
function installBanner() {
  if (isStandalone() || S.installDismissed || window.matchMedia('(min-width: 900px)').matches) return '';
  let msg = '', btn = '';
  if (isIOS) msg = t('installIOS');
  else if (deferredPrompt) { msg = t('installAndroid'); btn = `<button class="btn btn-sm btn-primary" data-act="install">${t('installBtn')}</button>`; }
  else return '';
  return `<div class="card banner"><div class="row-start">${appIcon()}<div><p class="strong">${t('installTitle')}</p><p class="small muted">${msg}</p></div></div><div class="row-start gap8">${btn}<button class="icon-btn" data-act="dismissInstall" aria-label="${t('notNow')}">${icon('x', 18)}</button></div></div>`;
}
function upcomingCard(b) {
  const d = new Date(b.start), B = bBiz(b);
  return `<div class="card upc"><span class="datebox"><span>${lang === 'zh' ? (d.getMonth() + 1) + '月' : MON()[d.getMonth()]}</span><b>${d.getDate()}</b></span>
  <a class="grow" href="#/m/bookings"><span class="eyebrow">${t('upNext')}</span><span class="strong block">${bName(b)}</span><span class="small muted">${B.name[lang]} · ${dayShort(d)} ${hm(d)}</span></a>
  <button class="icon-btn qr-btn" data-act="qr" aria-label="${t('showQR')}">${icon('qr', 20)}</button></div>`;
}
function bizRows() {
  const q = hQuery.trim().toLowerCase();
  const hit = o => Object.values(o).some(v => v.toLowerCase().includes(q));
  const list = BIZS.filter(b => (hCat === 'all' || b.cats.includes(hCat)) && (!q || hit(b.name) || hit(b.area) || SERVICES.some(s => s.biz === b.id && hit(s.name))));
  if (!list.length) return `<p class="muted center" style="padding:12px 0">${t('noResults')}</p>`;
  return list.map(b => `<a class="card biz" href="#/m/biz/${b.id}">${pic(b.thumb, 240, 'biz-img')}<div class="biz-body">
    <div class="row" style="align-items:flex-start"><span class="biz-name">${b.name[lang]}</span><span class="small muted nowrap">${t('km', { n: b.dist })}</span></div>
    <span class="small muted row-start gap4">${icon('pin', 15)} ${b.area[lang]}</span>
    <span class="rating">${star()} <b>${b.rating}</b> <span class="muted">${t('reviews', { n: b.reviews })}</span></span></div></a>`).join('');
}
function walletStrip() {
  const stores = walletStores(); if (!stores.length) return '';
  if (stores.length === 1) {
    const b = stores[0], s = activePk(b.id).reduce((a, p) => a + avail(p), 0);
    return `<a class="card row" href="#/m/wallet/${b.id}"><span class="row-start">${pic(b.thumb, 120, 'biz-img sm')}<span><span class="small muted block">${t('yourWallet', { b: b.name[lang] })}</span><span class="strong">${t('walletLine', { s, v: rm(storedAvail(b.id)) })}</span></span></span>${icon('chevR', 18)}</a>`;
  }
  const all = stores.flatMap(b => activePk(b.id)), n = all.reduce((a, p) => a + pkgLeft(p), 0), exp = all.filter(expiring).length;
  return `<a class="card row" href="#/m/wallet"><span class="row-start"><span class="thumbs">${stores.slice(0, 3).map(b => pic(b.thumb, 80, '')).join('')}</span><span><span class="small muted block">${t('walletsN', { n: stores.length })}</span><span class="strong block">${t('remaining', { n })}</span>${exp ? `<span class="small exp-txt">${t('expiringN', { n: exp })}</span>` : ''}</span></span>${icon('chevR', 18)}</a>`;
}
function vHome() {
  const nb = nextBooking();
  const body = `
  <div class="loc-row">
    <button class="loc" data-act="toast" data-msg="demoOnly"><span class="loc-l">${icon('pin', 15)} ${t('loc')}</span><span class="loc-v">${t('locVal')} ${icon('chevD', 16)}</span></button>
    <button class="icon-btn" data-act="toast" data-msg="noNotifs" aria-label="${t('notifications')}">${icon('bell')}<span class="dot-red"></span></button>
  </div>
  <label class="searchbar">${icon('search', 19)}<input id="q" type="search" value="${esc(hQuery)}" placeholder="${t('searchPh')}" aria-label="${t('searchPh')}" autocomplete="off"></label>
  ${installBanner()}
  ${nb ? upcomingCard(nb) : ''}
  <a class="promo" href="#/m/biz/lumiere/facial">${pic(IMG.mask, 640, 'promo-img')}<div class="promo-body"><p class="promo-eb">${t('promoEyebrow')}</p><p class="promo-t">${t('promoTitle')}</p><p class="promo-s">${t('promoSub')}</p><span class="promo-btn">${t('bookNowBtn')}</span></div></a>
  <h2 class="sec-t" style="margin-bottom:-6px">${t('services')}</h2>
  <div class="hscroll">${HOME_CATS.map(([c, ic]) => `<button class="chip ${hCat === c ? 'on' : ''}" data-act="hcat" data-c="${c}">${icon(ic, 17)} ${t('cat_' + c)}</button>`).join('')}</div>
  <div class="sec-head"><h2 class="sec-t">${t('nearby')}</h2><button class="link-btn" data-act="toast" data-msg="demoOnly">${icon('map', 16)} ${t('viewMap')}</button></div>
  <div class="stack" id="bizlist">${bizRows()}</div>
  ${walletStrip()}
  <a class="card tint-sage row" href="#/m/aftercare"><span class="row-start">${icon('leaf')}<span class="strong">${t('aftercareCard')}</span></span>${icon('chevR', 18)}</a>`;
  return page({ tabs: 'm', active: '/m/home', body });
}

/* ------------------------------------------------------------------ member: business & booking */
let sel = null, draft = null;
function vBiz(id, tab) {
  const B = biz(id); if (!B) return vNotFound();
  tab = B.tabs.some(x => x[0] === tab) ? tab : B.tabs[0][0];
  if (!sel || sel.biz !== id) sel = { biz: id, ids: [] };
  const fav = S.favs.includes(id);
  const n = sel.ids.length;
  const rows = SERVICES.filter(s => s.biz === id && s.cat === tab).map(s => {
    const on = sel.ids.includes(s.id), pk = pkgFor(s.id);
    return `<button class="srow ${on ? 'on' : ''}" data-act="pick" data-id="${s.id}" aria-pressed="${on}"><span class="grow"><span class="srow-n">${s.name[lang]}</span><span class="small muted">${rm(s.price)} · ${t('mins', { n: s.mins })}</span>${pk ? `<br><span class="pill gold" style="margin-top:6px">${t('inPackage', { n: avail(pk) })}</span>` : ''}</span><span class="check">${on ? icon('check', 15) : ''}</span></button>`;
  }).join('');
  const body = `${pic(B.img, 800, 'hero-img')}
  <div class="stack-sm"><h1 class="h1">${B.name[lang]}</h1>
    <div class="meta"><span>${icon('pin', 17)} ${B.area[lang]}</span><span>${icon('clock', 17)} ${B.hours[lang]}</span><span class="rating" style="color:var(--ink)">${star()} <b>${B.rating}</b> <span class="muted">${t('reviews', { n: B.reviews })}</span></span></div></div>
  <p class="muted">${B.desc[lang]}</p>
  <nav class="tabs-u">${B.tabs.map(([k, en, zh, ms]) => `<a class="${k === tab ? 'on' : ''}" href="#/m/biz/${id}/${k}">${lang === 'zh' ? zh : lang === 'ms' ? ms : en}</a>`).join('')}</nav>
  <div class="stack-xs">${rows}</div>
  <div class="sticky-cta"><button class="btn btn-primary btn-block" data-act="continue" ${n ? '' : 'disabled'}>${n ? t('continueN', { n }) : t('selectSvc')}</button></div>`;
  return page({ back: '/m/home', right: `<button class="icon-btn ${fav ? 'fav-on' : ''}" data-act="fav" data-id="${id}" aria-label="${t('favourites')}" aria-pressed="${fav}">${icon('heart')}</button>`, body });
}

const SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];
function staffFor(ss, B) {
  const inter = ss.reduce((acc, s) => acc.filter(x => s.by.includes(x)), ss.length ? ss[0].by.slice() : []);
  return inter.length ? inter : B.staff;
}
function slotState(by, key, dayISO, tm, ther) {
  const d = at(new Date(dayISO), tm);
  if (d.getTime() < Date.now() + 30 * 60000) return 'past';
  if (S.bookings.some(b => isBooked(b) && Math.abs(new Date(b.start) - d) < 90 * 60000)) return 'mine';
  const list = ther === 'any' ? by : [ther];
  const k = new Date(dayISO).toDateString();
  return list.some(th => hash(k + tm + th + key) % 4 !== 0) ? 'open' : 'full';
}
function payOptions(ss, B, total) {
  const out = [];
  const pk = ss.length === 1 ? pkgFor(ss[0].id) : null;
  if (pk) out.push(['package', t('payPackage', { n: avail(pk) })]);
  if (storedAvail(B.id) > 0 && storedAvail(B.id) >= total) out.push(['stored', t('payStored', { b: rm(storedAvail(B.id)) })]);
  out.push(['store', t('payStore')]);
  return out;
}
function vTime() {
  if (!draft) return redirect('/m/home');
  const B = biz(draft.biz), ss = draft.ids.map(svc), by = staffFor(ss, B), key = draft.ids.join('+');
  const total = ss.reduce((a, s) => a + s.price, 0), mins = ss.reduce((a, s) => a + s.mins, 0);
  if (draft.therapist !== 'any' && !by.includes(draft.therapist)) draft.therapist = 'any';
  const pays = payOptions(ss, B, total);
  if (!pays.some(p => p[0] === draft.pay)) draft.pay = pays[0][0];
  if (draft.time && slotState(by, key, draft.day, draft.time, draft.therapist) !== 'open') draft.time = null;
  const days = [...Array(10)].map((_, i) => addDays(today0(), i));
  const body = `
  <div class="card sumcard">${pic(B.thumb, 160, 'biz-img sm')}<div class="grow"><p class="strong">${B.name[lang]}</p><p class="small muted">${ss.map(s => s.name[lang]).join(' + ')}</p><p class="small" style="color:var(--primary);font-weight:700">${t('totalLine', { p: rm(total), m: mins })}</p></div></div>
  <section class="stack-sm"><h2 class="label">${t('staff')}</h2><div class="chips">${['any'].concat(by).map(x => `<button class="chip ${draft.therapist === x ? 'on' : ''}" data-act="ther" data-id="${x}">${x === 'any' ? t('any') : THER[x].name}</button>`).join('')}</div></section>
  <section class="stack-sm"><h2 class="label">${t('pickDate')}</h2><div class="hscroll">${days.map((d, i) => `<button class="date ${sameDay(d, draft.day) ? 'on' : ''}" data-act="day" data-d="${d.toISOString()}"><span>${i === 0 ? t('today') : dayShort(d)}</span><b>${d.getDate()}</b></button>`).join('')}</div></section>
  <section class="stack-sm"><h2 class="label">${t('pickTime')}</h2><div class="slots">${SLOTS.map(tm => {
    const st = slotState(by, key, draft.day, tm, draft.therapist);
    return `<button class="slot ${st} ${draft.time === tm ? 'on' : ''}" ${st === 'open' ? `data-act="slot" data-t="${tm}"` : 'disabled'}>${tm}${st === 'full' ? ` <span class="small">${t('full')}</span>` : ''}</button>`;
  }).join('')}</div></section>
  <section class="stack-sm"><h2 class="label">${t('payWith')}</h2><div class="stack-xs">${pays.map(([k, l]) => `<button class="opt ${draft.pay === k ? 'on' : ''}" data-act="pay" data-k="${k}"><span class="radio"></span><span>${l}</span></button>`).join('')}</div></section>
  ${B.id === 'lumiere' && ss.some(s => s.cat === 'facial') ? `<p class="note sage">${icon('check', 16)} ${t('roomAuto')}</p>` : ''}
  <p class="small muted">${t('policy', { h: 12 })}</p>
  <div class="sticky-cta"><button class="btn btn-primary btn-block" data-act="confirmBooking" ${draft.time ? '' : 'disabled'}>${draft.time ? t('bookNowAt', { p: rm(total) }) : t('chooseTime')}</button></div>`;
  return page({ back: '/m/biz/' + B.id, title: t('bookTitle'), body });
}
function vDone(id) {
  const b = S.bookings.find(x => x.id === id); if (!b) return vNotFound();
  const d = new Date(b.start), B = bBiz(b);
  const held = b.pay === 'package' ? t('heldPkg') : b.pay === 'stored' ? t('heldStored', { a: rm(bPrice(b)) }) : t('payAtStore');
  const calBtn = S.calAlways
    ? `<button class="btn btn-outline btn-block" data-act="calDo" data-ev="b:${b.id}" data-c="${effCal(S.calAlways)}">${icon('calendar', 18)} ${t('addTo', { c: calName(S.calAlways) })}</button>`
    : `<button class="btn btn-outline btn-block" data-act="calSheet" data-ev="b:${b.id}">${icon('calendar', 18)} ${t('addToCalendar')}</button>`;
  return page({ cls: 'center-main', body: `<div class="done stack-lg center">
    <div class="done-icon">${icon('checkCircle', 68)}</div>
    <div class="stack-sm"><h1 class="h1">${t('booked')}</h1><p class="muted lines">${bName(b)}<br>${B.name[lang]}<br>${fDay(d)} · ${hm(d)} · ${THER[b.therapistId].name}${b.room ? ' · ' + roomName(b.room) : ''}</p></div>
    <span class="pill sage" style="align-self:center">${held}</span>
    <div class="stack w100">${calBtn}<a class="btn btn-primary btn-block" href="#/m/home">${t('done')}</a></div></div>` });
}
/* Apple Calendar only exists on iPhone, iPad and Mac. Android and Windows get Google Calendar and a calendar file instead */
const calPlat = () => isIOS ? 'ios' : /android/i.test(navigator.userAgent) ? 'android' : /Macintosh|Mac OS X/.test(navigator.userAgent) ? 'mac' : 'other';
const iosInApp = () => isIOS && /CriOS|FxiOS|EdgiOS|FBAN|FBAV|Instagram|Line\/|MicroMessenger|WhatsApp/i.test(navigator.userAgent);
function calOpts() {
  const p = calPlat(), g = ['google', t('googleCal'), t('calGoogleSub'), 'globe'];
  if (p === 'ios') return [['apple', t('appleCal'), t('calAppleIos'), 'calendar'], g, ['ics', t('otherCal'), t('calFileSub'), 'download']];
  if (p === 'mac') return [['apple', t('appleCal'), t('calAppleMac'), 'calendar'], g, ['ics', t('otherCal'), t('calFileSub'), 'download']];
  return [g, ['ics', p === 'android' ? t('otherCalApp') : t('otherCal'), t('calFileSub'), 'download']];
}
/* a saved choice that this device can't do (e.g. Apple on Android) falls back to Google Calendar */
const effCal = k => !k ? null : calOpts().some(o => o[0] === k) ? k : 'google';
function calSheet(key) {
  const staff = key.startsWith('t:');
  openSheet(`<h2 class="h2">${t('addCal')}</h2><p class="small muted">${t(staff ? 'calWhyT' : 'calWhy')}</p>
  <div class="stack-xs">${calOpts().map(([k, l, sub, ic]) => `<button class="opt" data-act="calPick" data-ev="${key}" data-c="${k}">${icon(ic, 20)}<span class="grow"><b>${l}</b><br><span class="small muted">${sub}</span></span></button>`).join('')}</div>
  ${iosInApp() ? `<p class="note rose"><span>${t('calSafari')}</span></p>` : ''}
  <label class="row toggle-row"><span>${t('alwaysDo')}</span><input type="checkbox" class="switch" id="calAlways"></label>
  ${staff ? `<p class="small muted">${t('calPrivacy')}</p>` : ''}
  <button class="btn btn-ghost btn-block" data-act="closeSheet">${t('notNow')}</button>`);
}

/* ------------------------------------------------------------------ member: bookings, wallet, profile */
function bkCard(b, up) {
  const d = new Date(b.start), B = bBiz(b);
  const pill = { booked: 'gold', completed: 'sage', cancelled: 'grey', late: 'rose' }[b.status];
  return `<div class="card stack-sm"><div class="row-start" style="align-items:flex-start">${pic(B.thumb, 120, 'biz-img sm')}<div class="grow">
    <div class="row" style="align-items:flex-start"><span class="strong">${bName(b)}</span><span class="pill ${pill}">${t('st_' + b.status)}</span></div>
    <span class="small muted block">${B.name[lang]}</span><span class="small muted">${fDay(d)} · ${hm(d)} · ${THER[b.therapistId].name}</span>${b.cancelBy && b.cancelBy !== 'client' ? `<span class="small block t-bad">${t('cxBySalon', { b: B.name[lang] })}</span>` : ''}</div></div>
  ${up ? `<div class="row-start gap8"><button class="btn btn-soft btn-sm" data-act="${S.calAlways ? 'calDo' : 'calSheet'}" data-ev="b:${b.id}" data-c="${S.calAlways || ''}">${icon('calendar', 16)} ${t('calendarSet')}</button><button class="btn btn-sm btn-outline" data-act="qr">${icon('qr', 16)} QR</button><button class="btn btn-sm btn-ghost" data-act="cancelBk" data-id="${b.id}">${t('cancel')}</button></div>` : ''}</div>`;
}
function vBookings(tab) {
  tab = tab === 'past' ? 'past' : 'up';
  const now = new Date();
  const up = S.bookings.filter(b => isBooked(b) && new Date(b.start) > now).sort((a, b) => new Date(a.start) - new Date(b.start));
  const past = S.bookings.filter(b => !(isBooked(b) && new Date(b.start) > now)).sort((a, b) => new Date(b.start) - new Date(a.start));
  const list = tab === 'up' ? up : past;
  const empty = tab === 'up' ? `<div class="card center stack"><p class="muted">${t('noBooking')}</p><a class="btn btn-primary btn-sm" href="#/m/home">${t('findSalon')}</a></div>` : `<p class="muted center">${t('noPast')}</p>`;
  const body = `<h1 class="h1">${t('tabBookings')}</h1>
  <div class="seg"><a class="${tab === 'up' ? 'on' : ''}" href="#/m/bookings/up">${t('upcoming')} (${up.length})</a><a class="${tab === 'past' ? 'on' : ''}" href="#/m/bookings/past">${t('past')}</a></div>
  ${list.length ? list.map(b => bkCard(b, tab === 'up')).join('') : empty}`;
  return page({ tabs: 'm', active: '/m/bookings', body });
}
function ledgerRows(wallet, unit) {
  const rows = S.ledger.map((l, i) => Object.assign({ i }, l)).filter(l => l.wallet === wallet).sort((a, b) => (new Date(b.date) - new Date(a.date)) || (b.i - a.i));
  return rows.map(l => {
    const sign = l.amount > 0 ? '+' : '−';
    const amt = unit === 'rm' ? sign + rm(Math.abs(l.amount)) : sign + Math.abs(l.amount);
    const bal = unit === 'rm' ? rm(l.bal) : l.bal;
    const title = (l.kind === 'use' && l.serviceId) ? svc(l.serviceId).name[lang] : t('k_' + l.kind);
    return `<div class="li"><div><p class="strong">${title}</p><p class="small muted">${fDate(l.date)}${l.kind === 'use' ? ' · ' + t('k_use') : ''}</p></div><div class="r"><p class="${l.amount > 0 ? 'plus' : 'minus'}">${amt}</p><p class="small muted">${t('balShort', { b: bal })}</p></div></div>`;
  }).join('');
}
function offerCard(id, title, sub, ic) {
  return `<div class="card tint-rose offer"><div class="row-start">${icon(ic)}<div><p class="offer-t">${title}</p><p class="small muted">${sub}</p></div></div>${S.claimed[id] ? `<span class="pill sage">${t('claimed')}</span>` : `<button class="btn btn-sm btn-primary" data-act="claim" data-id="${id}">${t('claim')}</button>`}</div>`;
}
function pkgCard(pk) {
  const h = heldFor(pk), a = avail(pk), u = pk.used, dl = daysTo(pk.expires);
  const dots = [...Array(pk.total)].map((_, i) => `<span class="dot ${i < u ? 'used' : i < u + h ? 'held' : ''}"></span>`).join('');
  return `<div class="card gold stack-sm"><div class="row" style="align-items:flex-start"><p class="eyebrow">${pkgName(pk)}</p>${a + h > 0 && dl <= 30 ? `<span class="pill rose">${t('expInDays', { n: dl })}</span>` : ''}</div><h2 class="h-serif">${t('remaining', { n: a + h })}</h2><div class="dots" aria-hidden="true">${dots}</div><p class="small muted">${t('legend', { u, h, a })}<br>${t('validUntil', { d: fFull(pk.expires) })}</p></div>
  <div class="row"><h2 class="h2">${t('statement')}</h2><button class="btn btn-sm btn-ghost" data-act="toast" data-msg="pdfToast">PDF</button></div>
  <div class="card flat">${ledgerRows(pk.id, 'n')}</div>`;
}
function storeCard(b) {
  const pks = activePk(b.id), sess = pks.reduce((a, p) => a + pkgLeft(p), 0), v = S.vouchers.filter(x => x.biz === b.id).length;
  const warn = pks.filter(expiring).map(p => `<p class="note rose">${icon('clock', 16)}<span>${pkgName(p)} · ${t('leftN', { n: pkgLeft(p) })} · ${t('expInDays', { n: daysTo(p.expires) })}</span></p>`).join('');
  return `<a class="card stack-sm" href="#/m/wallet/${b.id}"><div class="row"><span class="row-start">${pic(b.thumb, 120, 'biz-img sm')}<span><span class="strong block">${b.name[lang]}</span><span class="small muted">${b.area[lang]}${b.branches ? ' · ' + t('branchesN', { n: b.branches.length }) : ''}</span></span></span>${icon('chevR', 18)}</div>
  <div class="store-stats"><span>${t('sessionsL')}<b>${sess}</b></span><span>${t('tabStored')}<b>${rm(storedAvail(b.id))}</b></span><span>${t('tabVouchers')}<b>${v}</b></span></div>${warn}</a>`;
}
function vWalletAll() {
  const stores = walletStores();
  const body = `<div class="stack-xs"><h1 class="h1">${t('walletTitle')}</h1><p class="muted">${t('walletsN', { n: stores.length })}</p></div>
  <p class="note gold">${icon('wallet', 16)}<span>${t('storeRule')}</span></p>
  ${stores.map(storeCard).join('')}`;
  return page({ tabs: 'm', active: '/m/wallet', body });
}
function vWalletStore(id, tab) {
  const B = biz(id); if (!B) return vNotFound();
  tab = ['pk', 'stored', 'vouchers'].includes(tab) ? tab : 'pk';
  const base = '#/m/wallet/' + id, empty = k => `<div class="card center"><p class="muted">${t(k)}</p></div>`;
  let content = '';
  if (tab === 'pk') {
    const pks = S.packages.filter(p => p.biz === id).sort((a, b) => (pkgLeft(b) > 0) - (pkgLeft(a) > 0));
    content = pks.length ? pks.map(pkgCard).join('') : empty('noPkgStore');
  } else if (tab === 'stored') {
    const w = 'stored:' + id, h = heldRM(id);
    content = storedOf(id) > 0 || S.ledger.some(l => l.wallet === w)
      ? `<div class="card gold stack-sm"><p class="eyebrow">${t('available')}</p><h2 class="h-serif">${rm(storedAvail(id))}</h2>${h ? `<p class="small muted">${t('heldNote', { a: rm(h) })}</p>` : ''}</div>
      <div class="row"><h2 class="h2">${t('statement')}</h2><button class="btn btn-sm btn-ghost" data-act="toast" data-msg="pdfToast">PDF</button></div>
      <div class="card flat">${ledgerRows(w, 'rm')}</div>`
      : empty('noStoredStore');
  } else {
    const offers = id === 'lumiere' ? offerCard('o1', t('offer1'), t('offer1Sub', { d: fDate(addDays(today0(), 21)) }), 'gift') + offerCard('o2', t('offer2'), t('offer2Sub'), 'sparkle') : '';
    const mine = S.vouchers.filter(v => v.biz === id);
    content = `${offers ? `<h2 class="h2">${t('offersT')}</h2>${offers}` : ''}
    ${mine.length ? `<h2 class="h2">${t('myVouchers')}</h2>${mine.map(v => `<div class="card gold stack-xs"><p class="offer-t">${v.text ? esc(v.text) : t(v.key)}</p><p class="small muted">${v.until ? t('validUntil', { d: fFull(v.until) }) + ' · ' : ''}${t('voucherUse')}</p></div>`).join('')}` : ''}
    ${!offers && !mine.length ? empty('noOffers') : ''}`;
  }
  const others = walletStores().some(b => b.id !== id);
  const brNote = B.branches ? `<p class="note gold">${icon('pin', 16)}<span>${S.branchRule === 'origin' ? t('brOriginMember', { l: B.branches[0] }) : t('brAllMember', { l: B.branches.join(' · ') })}</span></p>` : '';
  const body = `<div class="row"><span class="row-start">${pic(B.thumb, 120, 'biz-img sm')}<span><span class="strong block">${B.name[lang]}</span><span class="small muted">${B.area[lang]}</span></span></span>
    ${others ? `<button class="btn btn-sm btn-outline nowrap" data-act="storePick" data-id="${id}">${t('switchStore')}</button>` : ''}</div>
  ${brNote}
  <div class="seg"><a class="${tab === 'pk' ? 'on' : ''}" href="${base}/pk">${t('tabPackages')}</a><a class="${tab === 'stored' ? 'on' : ''}" href="${base}/stored">${t('tabStored')}</a><a class="${tab === 'vouchers' ? 'on' : ''}" href="${base}/vouchers">${t('tabVouchers')}</a></div>
  ${content}
  <p class="small muted center">${t('storeOnly', { b: B.name[lang] })}</p>`;
  return page({ tabs: 'm', active: '/m/wallet', back: '/m/wallet', title: t('walletTitle'), body });
}
/* /m/wallet = all stores; /m/wallet/<store>/<tab> = one store; old /m/wallet/<tab> links open Lumière */
function vWallet(a, b) {
  if (['pk', 'stored', 'vouchers'].includes(a)) return vWalletStore('lumiere', a);
  if (a) return vWalletStore(a, b);
  return vWalletAll();
}
function vMe() {
  const favNames = S.favs.map(id => biz(id)).filter(Boolean).map(b => b.name[lang].split(' ')[0]).join(', ');
  const body = `<h1 class="h1">${t('tabProfile')}</h1>
  <div class="card row-start"><span class="avatar lg">ML</span><div><p class="strong">Mei Ling Tan</p><p class="small muted">${t('goldMember')} · +60 ${esc(S.phone)}</p></div></div>
  <button class="card row" data-act="qr"><span class="row-start">${icon('qr')}<span><span class="strong">${t('myQR')}</span><br><span class="small muted">${t('qrHint')}</span></span></span>${icon('chevR', 18)}</button>
  <div class="card menu">
    ${menuLink('/m/skin', 'leaf', t('skinProfile'))}
    ${menuLink('/m/bookings', 'calendar', t('myBookings'))}
    ${menuLink('/m/home', 'heart', t('favourites'), favNames)}
    ${menuBtn('calSettings', 'clock', t('calendarSet'), S.calAlways ? calName(S.calAlways) : t('calAsk'))}
    ${menuBtn('notifSettings', 'bell', t('notifications'))}
    ${menuBtn('lang', 'globe', t('language'), langName())}
    ${menuBtn('refer', 'gift', t('refer'))}
  </div>
  <div class="card menu">${menuBtn('roles', 'users', t('switchRole'))}${menuBtn('reset', 'refresh', t('resetDemo'))}${menuBtn('signout', 'logout', t('signOut'))}</div>`;
  return page({ tabs: 'm', active: '/m/me', body });
}
function vSkin() {
  const chip = (g, v, label) => `<button class="chip ${S.skin[g].includes(v) ? 'on' : ''}" data-act="skinChip" data-g="${g}" data-v="${v}">${label}</button>`;
  const ph = k => `<button class="opt ${S.skin.photo === k ? 'on' : ''}" data-act="photo" data-k="${k}"><span class="radio"></span><span>${t('ph_' + k)}</span></button>`;
  return page({ back: '/m/me', title: t('skinTitle'), body: `
  <section class="stack-sm"><h2 class="label">${t('skinType')}</h2><div class="chips">${['dry', 'oily', 'combo', 'sensitive', 'normal'].map(v => chip('type', v, t('ty_' + v))).join('')}</div></section>
  <section class="stack-sm"><h2 class="label">${t('concerns')}</h2><div class="chips">${['dull', 'pores', 'acne', 'pig', 'lines'].map(v => chip('concerns', v, t('co_' + v))).join('')}</div></section>
  <section class="stack-sm"><h2 class="label">${t('allergies')}</h2><input class="field" id="allergy" value="${esc(S.skin.allergy)}"></section>
  <div class="card stack-sm"><div class="row"><span class="strong">${t('consent')}</span><span class="pill sage">${t('signed')}</span></div><p class="small muted">${t('signedOn', { d: fFull(S.skin.consent) })}</p></div>
  <section class="stack-sm"><h2 class="label">${t('photos')}</h2><div class="stack-xs">${ph('archive')}${ph('marketing')}${ph('no')}</div></section>
  <p class="small muted">${t('reviewNote')}</p>
  <button class="btn btn-primary btn-block" data-act="saveSkin">${t('save')}</button>` });
}
function vAftercare() {
  const pk = S.packages.find(p => p.serviceId === 'hydra'), n = pk ? pk.used + heldFor(pk) + 1 : 3;
  const next = at(addDays(today0(), 17), '14:30');
  return page({ back: '/m/home', title: t('aftercareTitle'), body: `
  ${pic(IMG.mask, 800, 'hero-img')}
  <div class="stack-xs"><p class="muted">${fDate(addDays(today0(), -11))} · ${svc('hydra').name[lang]} · Lumière</p><h1 class="h1">${t('aftercareTitle')}</h1></div>
  <div class="card tint-sage stack-sm"><p class="strong">${t('within24')}</p><p>· ${t('tip1')}<br>· ${t('tip2')}<br>· ${t('tip3')}</p></div>
  <div class="card gold stack-sm"><p class="eyebrow">${t('nextSuggested')}</p><h2 class="h-serif">${fDay(next)}</h2><p class="small muted">${t('interval', { n: Math.min(n, 6), t: 6 })}</p>
    <button class="btn btn-primary btn-block" data-act="quickBook" data-d="${next.toISOString()}">${t('bookOneTap', { t: '14:30', p: 'Joanne' })}</button></div>
  <div class="card row-start"><span class="thumb">${SERUM}</span><div><p class="small" style="color:var(--rose)">${t('recommended')}</p><p class="strong">${t('serum')}</p><p class="small muted">RM168 · ${t('inStore')}</p></div></div>` });
}

/* ------------------------------------------------------------------ admin (Lumière) */
const isLumiere = b => bBiz(b).id === 'lumiere';
function todayList() {
  const now = new Date();
  const items = DAYPLAN.map(a => {
    const s = svc(a.s), start = at(today0(), a.t);
    return { id: a.id, time: a.t, start, mins: s.mins, label: s.name[lang], name: s.name[lang], client: member(a.c).name, cid: a.c, sid: a.s, th: a.th, room: a.room, mine: false };
  });
  S.bookings.filter(b => isLumiere(b) && sameDay(b.start, now) && (isBooked(b) || (S.tLog[b.id] && S.tLog[b.id].cx))).forEach(b => {
    const start = new Date(b.start);
    items.push({ id: b.id, time: hm(start), start, mins: bMins(b), label: bName(b), name: bName(b), client: 'Mei Ling Tan', cid: 'meiling', sid: b.serviceId, th: b.therapistId, room: b.room, mine: true });
  });
  items.forEach(i => { i.log = logOf(i.id, i.start, i.mins); i.status = stOf(i.log); });
  return items.sort((a, b) => a.start - b.start);
}
function adminRow(i) {
  const L = i.log, st = i.status, late = L.arr ? minsDiff(L.arr, i.start) : 0, sl = startLateOf(L, i.start);
  const pill = st === 'cx' ? `<span class="pill grey">${t('st_cancelled')}</span>` : st === 'done' ? `<span class="pill sage">${t('doneSt')}</span>` : st === 'in' ? `<span class="pill gold">${t('inProg')}</span>` : st === 'arr' ? `<span class="pill gold">${t('arrivedSt')}</span>` : '';
  const btns = st === 'todo' ? `<button class="btn btn-sm btn-outline" data-act="checkin" data-id="${i.id}">${t('checkIn')}</button><button class="icon-btn" data-act="tCxSheet" data-who="a" data-id="${i.id}" aria-label="${t('cancel')}">${icon('x', 18)}</button>` : '';
  const flags = [];
  if (st === 'cx') flags.push(`<span class="small muted">${t('cxBy')} ${t('W_' + L.cx.by)}${L.cx.noshow ? ' · ' + t('noShowL') : L.cx.last ? ' · ' + t('cxLastShort') : ''}</span>`);
  else {
    if (late > 5) flags.push(`<span class="pill rose">${t('lateBy', { n: late })}</span>`);
    if (sl > 5) flags.push(`<span class="pill amber">${THER[i.th].name}: ${t('startLate', { n: sl })}</span>`);
  }
  return `<div class="card appt ${i.mine ? 'gold' : ''} ${st === 'cx' ? 'is-cx' : ''}"><span class="appt-time">${i.time}</span><div class="grow"><p class="strong">${esc(i.client)}</p><p class="small muted">${i.label} · ${THER[i.th].name}${i.room ? ' · ' + roomName(i.room) : ''}</p>${flags.length ? `<div class="flags">${flags.join('')}</div>` : ''}</div><div class="appt-r">${pill}${btns}</div></div>`;
}
function vAToday() {
  const items = todayList();
  const salesToday = 6820 + S.sales.filter(x => sameDay(x.at, new Date())).reduce((a, x) => a + x.price, 0);
  const arrived = items.filter(i => ['arr', 'in', 'done'].includes(i.status)).length;
  const att = [['att1', '/a/members/away'], ['att2', '/a/reports'], ['att3', '/a/diary'], ['att4', '/a/commission']];
  const body = `
  <div class="row page-top"><div><p class="muted">Lumière · ${t('mainBranch')}</p><h1 class="h1">${fDay(new Date())}</h1></div><a class="btn btn-primary btn-sm" href="#/a/counter">${icon('plus', 16)} ${t('recordSale')}</a></div>
  <div class="kpis">
    ${kpi(t('kBookings'), 29 + items.length, delta('+4', 'up'))}
    ${kpi(t('kArrived'), 15 + arrived, '')}
    ${kpi(t('kSales'), rm(salesToday), delta('12%', 'up'))}
    ${kpi(t('kRoom'), '78%', delta('5 pts', 'up'))}
  </div>
  <p class="small muted">${t('vsLastWeek')} ${t('sample')}.</p>
  <section class="card stack-xs"><h2 class="h2">${t('needs')}</h2>${bdayAttItems('#/a/birthdays').map(([h, txt]) => `<a class="att" href="${h}"><span>${esc(txt)}</span>${icon('chevR', 16)}</a>`).join('')}${att.map(([k, href]) => `<a class="att" href="#${href}"><span>${t(k)}</span>${icon('chevR', 16)}</a>`).join('')}${(items.find(i => i.id === 'a8') || {}).status === 'todo' ? `<a class="att" href="#/a/timing"><span>${t('att5', { n: 'Farah', t: '16:00', m: 17 })}</span>${icon('chevR', 16)}</a>` : ''}${(() => { const n = S.claims.filter(c => c.status === 'pending').length; return n ? `<a class="att" href="#/a/claims"><span>${t('att6', { n })}</span>${icon('chevR', 16)}</a>` : ''; })()}${(() => { const n = S.invoices.filter(x => invStatus(x) === 'overdue').length; return n ? `<a class="att" href="#/a/invoices/issued"><span>${t('att7', { n })}</span>${icon('chevR', 16)}</a>` : ''; })()}</section>
  <h2 class="h2">${t('appts')}</h2>
  ${items.map(adminRow).join('')}`;
  return page({ tabs: 'a', active: '/a/today', body });
}
function vADiary(dayStr) {
  const day = dayStr ? new Date(dayStr + 'T00:00:00') : today0();
  const PX = 80 / 60, START = 600, END = 1140, W = (END - START) * PX;
  const minOf = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const blk = (start, mins, text, cls) => `<div class="g-b ${cls}" style="left:${(start - START) * PX + 2}px;width:${mins * PX - 4}px" title="${esc(text)}">${esc(text)}</div>`;
  const rows = { joanne: [], weiling: [], aida: [], r1: [], r2: [], dev: [] };
  DAYPLAN.forEach(a => {
    const s = svc(a.s), st = minOf(a.t), who = masked(member(a.c).name);
    rows[a.th].push(blk(st, s.mins, `${s.short[lang]} · ${who}`, ''));
    if (a.room) { rows[a.room].push(blk(st, s.mins, THER[a.th].name, 'room')); rows[a.room].push(blk(st + s.mins, 15, t('clean'), 'clean')); }
    if (a.dev) { rows.dev.push(blk(st, s.mins, who, 'room')); rows.dev.push(blk(st + s.mins, 15, t('clean'), 'clean')); }
  });
  BREAKS.forEach(b => rows[b.th].push(blk(minOf(b.t), b.m, t('lunch'), 'clean')));
  S.bookings.filter(b => isBooked(b) && isLumiere(b) && sameDay(b.start, day)).forEach(b => {
    const d = new Date(b.start), st = d.getHours() * 60 + d.getMinutes(), mins = bMins(b), s = svc(b.serviceId);
    if (st < START || st > END || !rows[b.therapistId]) return;
    rows[b.therapistId].push(blk(st, mins, `${s.short ? s.short[lang] : s.name[lang]} · Mei L.`, 'mine'));
    if (b.room) rows[b.room].push(blk(st, mins, THER[b.therapistId].name, 'mine'));
    if (bSvcs(b).some(x => x.device)) rows.dev.push(blk(st, mins, 'Mei L.', 'mine'));
  });
  const hours = []; for (let m = START; m < END; m += 60) hours.push(`<span class="g-hour" style="left:${(m - START) * PX}px">${m / 60}:00</span>`);
  const row = (label, key, sep) => `<div class="g-row ${sep ? 'sep' : ''}"><div class="g-label">${label}</div><div class="g-track" style="width:${W}px">${rows[key].join('')}</div></div>`;
  const days = [...Array(7)].map((_, i) => addDays(today0(), i));
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const body = `<h1 class="h1">${t('aDiary')}</h1>
  <div class="hscroll">${days.map((d, i) => `<a class="date ${sameDay(d, day) ? 'on' : ''}" href="#/a/diary/${iso(d)}"><span>${i === 0 ? t('today') : dayShort(d)}</span><b>${d.getDate()}</b></a>`).join('')}</div>
  <div class="gantt"><div class="g-scroll">
    <div class="g-row g-head"><div class="g-label">${fDate(day)}</div><div class="g-track" style="width:${W}px">${hours.join('')}</div></div>
    ${row('Joanne', 'joanne')}${row('Wei Ling', 'weiling')}${row('Aida', 'aida', true)}${row(t('room1'), 'r1')}${row(t('room2'), 'r2')}${row(t('hydraDevice'), 'dev')}
  </div></div>
  <div class="legend"><span><i style="background:var(--primary-50)"></i>${t('lg_treat')}</span><span><i style="background:var(--sage-tint)"></i>${t('lg_room')}</span><span><i style="background:var(--amber-tint);box-shadow:inset 0 0 0 1px #F5B301"></i>${t('lg_mine')}</span><span><i style="background:var(--sand)"></i>${t('lg_clean')}</span></div>
  <p class="note sage">${icon('check', 16)} ${t('diaryNote')}</p>`;
  return page({ tabs: 'a', active: '/a/diary', body });
}
let mQuery = '', mSeg = 'all';
function memberRows() {
  const q = mQuery.trim().toLowerCase();
  const list = MEMBERS.filter(m => (mSeg === 'all' || m.seg === mSeg) && (!q || m.name.toLowerCase().includes(q)));
  if (!list.length) return `<p class="muted center" style="padding:16px 0">${t('noMembers')}</p>`;
  return list.map(m => {
    const bal = m.id === 'meiling' ? meilingBalance() : m.bal;
    return `<a class="mrow" href="#/a/member/${m.id}"><span class="avatar sm">${initials(m.name)}</span><span class="grow"><span class="strong">${esc(m.name)}</span><br><span class="small muted">${t('lastVisit', { n: m.last })} · ${t('balLeft', { b: rm(bal) })}</span></span>${m.tier === 'gold' ? '<span class="pill amber">Gold</span>' : ''}${icon('chevR', 16)}</a>`;
  }).join('');
}
function vAMembers(seg) {
  mSeg = ['all', 'vip', 'loyal', 'new', 'atrisk', 'away', 'lost'].includes(seg) ? seg : 'all';
  const body = `<h1 class="h1">${t('aMembers')}</h1>
  <label class="searchbar">${icon('search', 19)}<input id="mq" type="search" value="${esc(mQuery)}" placeholder="${t('search')}" aria-label="${t('search')}" autocomplete="off"></label>
  <div class="hscroll">${['all', 'vip', 'loyal', 'new', 'atrisk', 'away', 'lost'].map(s => `<a class="chip ${mSeg === s ? 'on' : ''}" href="#/a/members/${s}">${t('seg_' + s)}</a>`).join('')}</div>
  ${mSeg !== 'all' ? `<p class="note gold">${icon('sparkle', 16)} ${t('act_' + mSeg)}</p>` : ''}
  <div class="card flat" style="padding:4px 16px" id="mlist">${memberRows()}</div>`;
  return page({ tabs: 'a', active: '/a/members', body });
}
function vAMember(id) {
  const m = member(id); if (!m) return vNotFound();
  const isMe = id === 'meiling';
  const bal = isMe ? meilingBalance() : m.bal;
  const pk = isMe ? activePk('lumiere') : [];
  const body = `
  <div class="row-start"><span class="avatar lg">${initials(m.name)}</span><div><p class="h-serif">${esc(m.name)}</p><p class="small muted">${m.tier === 'gold' ? t('goldMember') : 'Silver'} · ${t('seg_' + m.seg)}</p></div></div>
  <div class="chips">${m.intro ? `<span class="pill sage">${t('introBy', { n: m.intro })}</span>` : ''}<span class="pill ${m.consent ? 'sage' : 'rose'}">${t(m.consent ? 'consentOk' : 'consentMissing')}</span></div>
  <p class="note gold">${icon('sparkle', 16)} ${t('act_' + m.seg)}</p>
  <div class="card flat" style="padding:4px 16px">
    ${statrow(t('ltv'), rm(m.ltv))}
    ${statrow(t('balanceLeft'), rm(bal))}
    ${pk.map(p => statrow(`${pkgName(p)}${p.branch ? `<br><span class="small muted">${t('boughtAt', { b: p.branch })}</span>` : ''}`, pkgLeft(p) + ' / ' + p.total)).join('')}
    ${statrow(t('visits12'), m.visits)}
    ${statrow(t('pkgsBought'), m.pk)}
    ${m.rebuy ? statrow(t('rebuy'), t('weeks', { n: m.rebuy })) : ''}
    ${statrow(t('lastVisitL'), t('daysAgo', { n: m.last }))}
  </div>
  <p class="small muted">${t('ownOnly', { b: 'Lumière' })}</p>
  ${contactCard(id)}
  ${recordsSection(id, 'act', false)}
  ${visitsOf(id).length > 1 ? `<a class="btn btn-outline btn-block" href="#/a/member/${id}/records">${t('tr_open')} · ${t('tr_visits', { n: visitsOf(id).length })}</a>` : ''}
  <div class="card tint-rose stack-xs"><p class="strong" style="color:var(--rose)">${t('notes')}</p><p>${isMe ? t('note1') : t('noteGen')}</p><p class="small muted">Joanne · ${fDate(addDays(today0(), -m.last))}</p></div>
  <div class="row-start gap8"><a class="btn btn-primary grow" href="#/a/counter/${m.id}">${t('recordSale')}</a><button class="btn btn-outline" data-act="toast" data-msg="demoOnly">${t('tabBookings')}</button></div>`;
  return page({ back: '/a/members', title: t('aMembers'), body });
}
const visitsOf = mid => S.visits.filter(v => v.mid === mid).sort((a, b) => new Date(b.date) - new Date(a.date));
const whoLabel = w => w ? `${esc(w.name)} · ${w.role === 'owner' ? t('roleOwner') : w.role === 'admin' ? 'Admin' : t('kind_' + (w.role === 'staff' ? 'staff' : 'free'))}` : '';
/* who is using the phone app right now: staff/freelancer view = Joanne, owner/admin view = the owner */
const actorNow = () => S.role === 'therapist' ? { name: 'Joanne', role: staffKind('joanne') } : { name: 'Michelle', role: 'owner' };
function addVisit(rec, who) {
  const v = { id: 'v' + Date.now().toString(36), mid: rec.mid, date: rec.date || new Date().toISOString(), sid: rec.sid, th: rec.th, comments: [], log: [{ at: new Date().toISOString(), who, act: 'created' }] };
  VF.forEach(f => { v[f] = String(rec[f] || '').trim(); });
  S.visits.push(v); save(); return v;
}
function editVisit(id, patch, who) {
  const v = S.visits.find(x => x.id === id); if (!v) return false;
  const changes = VF.filter(f => patch[f] != null && String(patch[f]).trim() !== (v[f] || '')).map(f => ({ f, from: v[f] || '', to: String(patch[f]).trim() }));
  if (!changes.length) return false;
  changes.forEach(c => { v[c.f] = c.to; });
  v.log.push({ at: new Date().toISOString(), who, act: 'edited', changes }); save(); return true;
}
function commentVisit(id, text, who) {
  const v = S.visits.find(x => x.id === id), txt = String(text || '').trim(); if (!v || !txt) return false;
  const at = new Date().toISOString();
  v.comments.push({ at, who, text: txt }); v.log.push({ at, who, act: 'comment', text: txt }); save(); return true;
}
const fieldName = f => t('tr_' + f);
/* a = 'act' in the phone app, 'x' in the desktop admin */
function visitCard(v, a, latest) {
  const s = svc(v.sid), th = THER[v.th] ? THER[v.th].name : v.th;
  const row = f => v[f] ? `<div class="vrow"><span>${fieldName(f)}</span><p>${esc(v[f])}</p></div>` : '';
  const hist = v.log.slice().reverse().map(l => `<li><span class="muted">${fDate(l.at)} ${hm(l.at)} · ${whoLabel(l.who)}</span> — ${l.act === 'created' ? t('tr_created') : l.act === 'comment' ? `${t('tr_commented')}: “${esc(l.text)}”` : l.changes.map(c => `${t('tr_edited', { f: fieldName(c.f) })}<br><span class="vdiff"><s>${esc(c.from) || '—'}</s> → ${esc(c.to) || '—'}</span>`).join('<br>')}</li>`).join('');
  return `<div class="card stack-sm vcard ${latest ? 'gold' : ''}">
    <div class="row" style="align-items:flex-start"><span><b>${fFull(v.date)}</b><span class="small muted block">${s ? esc(s.name[lang]) : ''} · ${t('tr_by')}: ${esc(th)}</span></span>${latest ? `<span class="pill gold">${t('tr_last')}</span>` : ''}</div>
    ${VF.map(row).join('')}
    ${v.comments.length ? `<div class="stack-xs">${v.comments.map(c => `<div class="vcm"><small>${whoLabel(c.who)} · ${fDate(c.at)} ${hm(c.at)}</small>${esc(c.text)}</div>`).join('')}</div>` : ''}
    <div class="row-start gap8 wrap"><button class="btn btn-sm btn-outline" data-${a}="vEdit" data-id="${v.id}">${t('editInv')}</button><button class="btn btn-sm btn-soft" data-${a}="vComment" data-id="${v.id}">${t('tr_comment')}</button></div>
    <details class="vhist"><summary>${t('tr_history', { n: v.log.length })}</summary><ul>${hist}</ul></details></div>`;
}
function recordFormHtml(v, a, pre) {
  pre = pre || {};
  const val = f => esc(v ? v[f] : pre[f] || '');
  const lum = SERVICES.filter(s => s.biz === 'lumiere');
  return `<h2 class="h2">${v ? t('editInv') + ' · ' + fFull(v.date) : t('tr_add')}</h2>
    ${v ? '' : `<div class="two"><label class="stack-xs"><span class="label">${t('ad_treatment')}</span><select class="field" id="vr-sid">${lum.map(s => `<option value="${s.id}" ${pre.sid === s.id ? 'selected' : ''}>${s.name[lang]}</option>`).join('')}</select></label>
      <label class="stack-xs"><span class="label">${t('pickDate')}</span><input class="field" type="date" id="vr-date" value="${isoDay(pre.date || new Date())}" max="${isoDay(new Date())}"></label></div>
      <label class="stack-xs"><span class="label">${t('tr_by')}</span><select class="field" id="vr-th">${['joanne', 'weiling', 'aida'].map(k => `<option value="${k}" ${(pre.th || 'joanne') === k ? 'selected' : ''}>${THER[k].name}</option>`).join('')}</select></label>`}
    ${VF.map(f => `<label class="stack-xs"><span class="label">${fieldName(f)}</span><textarea class="field" id="vr-${f}" rows="2">${val(f)}</textarea></label>`).join('')}
    <button class="btn btn-primary btn-block" data-${a}="vSave" data-id="${v ? v.id : ''}" data-mid="${esc(pre.mid || (v && v.mid) || '')}" data-th="${esc(pre.th || '')}">${t('save')}</button>`;
}
const commentFormHtml = (v, a) => `<h2 class="h2">${t('tr_comment')} · ${fFull(v.date)}</h2><textarea class="field" id="vc-text" rows="3" placeholder="${t('tr_commentPh')}"></textarea><button class="btn btn-primary btn-block" data-${a}="vCommentSave" data-id="${v.id}">${t('save')}</button>`;
/* read the open form; returns a message key */
function saveRecordFromForm(id, mid, th, who) {
  const g = k => ((document.getElementById(k) || {}).value || '');
  const patch = {}; VF.forEach(f => { patch[f] = g('vr-' + f); });
  if (id) return editVisit(id, patch, who) ? 'tr_saved' : 'tr_noChange';
  if (!patch.notes.trim()) return 'tr_need';
  const day = g('vr-date'), when = day ? fromIsoDay(day) : new Date();
  addVisit(Object.assign({ mid, sid: g('vr-sid'), th: g('vr-th') || th || 'joanne', date: when.toISOString() }, patch), who);
  return 'tr_saved';
}
const saveCommentFromForm = (id, who) => commentVisit(id, ((document.getElementById('vc-text') || {}).value || ''), who) ? 'tr_cmSaved' : '';
function recordsSection(mid, a, full) {
  const vs = visitsOf(mid);
  return `<div class="row"><h2 class="h2">${t('tr_title')}</h2><button class="btn btn-sm btn-primary" data-${a}="vAdd" data-mid="${mid}">${icon('plus', 16)} ${t('tr_add')}</button></div>
    ${vs.length ? (full ? vs : vs.slice(0, 1)).map((v, i) => visitCard(v, a, i === 0)).join('') : `<p class="muted">${t('tr_none')}</p>`}
    <p class="small muted">${t('tr_who')}</p>`;
}
const bdayOf = id => (mContact(id).bday || '');
const staffNameOrMember = id => (member(id) || { name: '' }).name;
function nextBday(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); if (!m) return null;
  const t0 = today0(); let n = new Date(t0.getFullYear(), +m[2] - 1, +m[3]);
  if (n < t0) n = new Date(t0.getFullYear() + 1, +m[2] - 1, +m[3]);
  return n;
}
const daysToBday = iso => { const n = nextBday(iso); return n ? Math.round((n - today0()) / DAY) : null; };
const ageTurning = iso => { const n = nextBday(iso), y = Number((iso || '').slice(0, 4)); return n && y > 1900 ? n.getFullYear() - y : null; };
const bdayKey = mid => { const n = nextBday(bdayOf(mid)); return n ? mid + '@' + n.getFullYear() : ''; };
const bdayStatus = mid => (S.bday && S.bday[bdayKey(mid)]) || {};
function bdayList(maxDays) {
  return MEMBERS.map(m => { const iso = bdayOf(m.id), d = daysToBday(iso); return { m, iso, d, next: nextBday(iso), age: ageTurning(iso), st: bdayStatus(m.id) }; })
    .filter(x => x.iso && (maxDays == null || x.d <= maxDays)).sort((a, b) => a.d - b.d);
}
const bdayPending = days => bdayList(days).filter(x => !x.st.wished && !x.st.offer);
const bdayWhen = d => d === 0 ? t('today') : d === 1 ? t('tomorrowW') : t('inDays', { n: d });
const bdayLine = x => x.d === 0 ? t('bdayToday', { n: x.m.name }) : x.d === 1 ? t('bdayTomorrow', { n: x.m.name }) : t('bdayIn', { n: x.m.name, d: x.d });
/* alert lines for "Needs attention" on the phone and desktop dashboards */
function bdayAttItems(href) {
  const list = bdayPending(7), out = list.filter(x => x.d <= 1).map(x => [href, '🎂 ' + bdayLine(x)]);
  const rest = list.filter(x => x.d > 1).length;
  if (rest) out.push([href, '🎂 ' + t('bdayWeek', { n: rest })]);
  return out;
}
/* device notifications (local): shown when the owner or an admin opens appt4u */
const notifState = () => !('Notification' in window) ? 'na' : Notification.permission;
async function askNotify() {
  if (!('Notification' in window)) return 'na';
  if (Notification.permission !== 'default') return Notification.permission;
  try { return await Notification.requestPermission(); } catch (e) { return 'denied'; }
}
function notifyLocal(title, body, url, tag) {
  if (notifState() !== 'granted') return false;
  const opts = { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: tag || 'appt4u', data: { url } };
  const plain = () => { try { const n = new Notification(title, opts); n.onclick = () => { window.focus(); location.href = url; n.close(); }; } catch (e) { /* this browser only allows service-worker notifications */ } };
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(r => r.showNotification(title, opts)).catch(plain);
  else plain();
  return true;
}
function bdayAutoNotify(url) {
  if (notifState() !== 'granted') return;
  let sent = 0;
  bdayPending(3).forEach(x => {
    const kind = x.d === 0 ? 'day' : 'before';
    if (!S.bdayRem[kind]) return;
    const key = `${x.m.id}@${x.next.getFullYear()}-${kind}`;
    if (S.bdayNotified[key]) return;
    S.bdayNotified[key] = new Date().toISOString(); sent++;
    notifyLocal(t('pushTitle'), bdayLine(x) + '.' + t('bdayPushTail'), url, 'bday-' + key);
  });
  if (sent) save();
}
function bdayRemCard(a) {
  const st = notifState();
  return `<div class="card stack-xs"><p class="strong">${icon('bell', 16)} ${t('bdayRem')}</p>
    <label class="row toggle-row"><span>${t('bdayRemDay')}</span><input type="checkbox" class="switch" data-bdrem="day" ${S.bdayRem.day ? 'checked' : ''}></label>
    <label class="row toggle-row"><span>${t('bdayRemBefore')}</span><input type="checkbox" class="switch" data-bdrem="before" ${S.bdayRem.before ? 'checked' : ''}></label>
    ${st === 'granted' ? `<p class="note sage">${icon('check', 16)}<span>${t('notifOn')}</span></p><button class="btn btn-sm btn-outline" data-${a}="bdTest">${t('notifTest')}</button>`
      : st === 'denied' ? `<p class="note rose"><span>${t('notifBlocked')}</span></p>`
      : st === 'na' ? `<p class="small muted">${t('notifNA')}</p>`
      : `<button class="btn btn-sm btn-primary" data-${a}="bdAllow">${icon('bell', 16)} ${t('notifAllow')}</button>`}
    <p class="small muted">${t('notifNote')}</p></div>`;
}
const setBdRem = (k, on) => { S.bdayRem[k] = !!on; save(); };
let bdDraft = { mid: null, opt: 'pct15', custom: '' };
const BIZ_SHORT = 'Lumière Skin Studio';
function bdOfferText() { return bdDraft.opt === 'custom' ? (bdDraft.custom || '').trim() : t('of_' + bdDraft.opt); }
function bdUntil(mid) { const n = nextBday(bdayOf(mid)); return n ? new Date(n.getFullYear(), n.getMonth() + 1, 0) : addDays(today0(), 30); }
function bdMessage(mid) { const m = member(mid); return t('bdayMsg', { n: firstName(m ? m.name : ''), b: BIZ_SHORT, o: bdOfferText() || '…', d: fFull(bdUntil(mid)) }); }
function bdWaLink(mid, text) { const ln = contactLinks(mContact(mid)); return ln.wa ? ln.wa + '?text=' + encodeURIComponent(text) : ''; }
function bdOfferHtml(mid, a) {
  const m = member(mid); if (!m) return '';
  if (bdDraft.mid !== mid) bdDraft = { mid, opt: 'pct15', custom: '' };
  const n = nextBday(bdayOf(mid)), age = ageTurning(bdayOf(mid));
  return `<h2 class="h2">${t('bdayOffer')} · ${esc(m.name)}</h2><p class="small muted">${n ? fFull(n) + ' · ' + bdayWhen(daysToBday(bdayOf(mid))) : ''}${age ? ' · ' + t('turns', { n: age }) : ''}</p>
    <div class="stack-xs">${['pct15', 'rm50', 'addon', 'custom'].map(k => `<button class="opt ${bdDraft.opt === k ? 'on' : ''}" data-${a}="bdOpt" data-k="${k}" data-id="${mid}"><span class="radio"></span><span>${t('of_' + k)}</span></button>`).join('')}</div>
    ${bdDraft.opt === 'custom' ? `<textarea class="field" id="bd-custom" rows="2" placeholder="${t('offerPh')}">${esc(bdDraft.custom)}</textarea>` : ''}
    <p class="label">${t('msgPreview')}</p><div class="msg" id="bd-preview">${esc(bdMessage(mid))}</div>
    <div class="row-start gap8"><button class="btn btn-primary grow" data-${a}="bdSend" data-id="${mid}" data-via="app">${t('sendInApp')}</button>${bdWaLink(mid, 'x') ? `<button class="btn btn-outline grow" data-${a}="bdSend" data-id="${mid}" data-via="wa">${icon('phone', 16)} WhatsApp</button>` : ''}</div>`;
}
const bdSetOpt = k => { bdDraft.opt = ['pct15', 'rm50', 'addon', 'custom'].includes(k) ? k : 'pct15'; };
function bdCustom(v) { bdDraft.custom = v; const p = document.getElementById('bd-preview'); if (p && bdDraft.mid) p.textContent = bdMessage(bdDraft.mid); }
/* returns { err } or { ok, wa } — wa is a WhatsApp link with the message filled in */
function bdSendDo(mid, via, who) {
  const offer = bdOfferText(); if (!offer) return { err: 'needOffer' };
  const key = bdayKey(mid); if (!key) return { err: 'needOffer' };
  const until = bdUntil(mid), msg = bdMessage(mid);
  S.bday[key] = Object.assign(S.bday[key] || {}, { offer: { at: new Date().toISOString(), by: who.name, text: offer, until: until.toISOString(), via } });
  if (mid === 'meiling') S.vouchers.push({ id: 'bd' + Date.now().toString(36), biz: 'lumiere', text: t('bdayVoucher', { o: offer }), until: until.toISOString() });
  save(); return { ok: true, wa: via === 'wa' ? bdWaLink(mid, msg) : '' };
}
function bdWishDo(mid, who) {
  const key = bdayKey(mid), m = member(mid); if (!key || !m) return '';
  S.bday[key] = Object.assign(S.bday[key] || {}, { wished: { at: new Date().toISOString(), by: who.name } }); save();
  return bdWaLink(mid, t('bdayWishMsg', { n: firstName(m.name), b: BIZ_SHORT }));
}
function bdayRow(x, a, memberHref) {
  const m = x.m, st = x.st;
  return `<div class="card stack-sm ${x.d === 0 ? 'gold' : ''}"><div class="row" style="align-items:flex-start"><a class="row-start" href="${memberHref}${m.id}"><span class="avatar">${x.d <= 7 ? '🎂' : initials(m.name)}</span><span><b>${esc(m.name)}</b><span class="small muted block">${fDate(x.next)} · ${bdayWhen(x.d)}${x.age ? ' · ' + t('turns', { n: x.age }) : ''}</span></span></a>${m.tier === 'gold' ? `<span class="pill gold">${t('goldMember')}</span>` : ''}</div>
    ${st.wished || st.offer ? `<div class="flags">${st.wished ? `<span class="pill sage">${t('wished', { d: fDate(st.wished.at) })} · ${esc(st.wished.by)}</span>` : ''}${st.offer ? `<span class="pill sage">${t('offerSent', { d: fDate(st.offer.at) })} · ${esc(st.offer.by)}</span>` : ''}</div>${st.offer ? `<p class="small muted">${esc(st.offer.text)}</p>` : ''}` : ''}
    <div class="row-start gap8 wrap"><button class="btn btn-sm btn-outline" data-${a}="bdWish" data-id="${m.id}">${t('sendWish')}</button><button class="btn btn-sm btn-primary" data-${a}="bdOffer" data-id="${m.id}">${icon('gift', 16)} ${t('bdayOffer')}</button></div></div>`;
}
function vABirthdays() {
  const all = bdayList(null), wk = all.filter(x => x.d <= 7), mo = all.filter(x => x.d > 7 && x.d <= 30), later = all.filter(x => x.d > 30);
  const missing = MEMBERS.filter(m => !bdayOf(m.id));
  const sec = (title, list) => list.length ? `<h2 class="h2">${title}</h2>${list.map(x => bdayRow(x, 'act', '#/a/member/')).join('')}` : '';
  return page({ back: '/a/more', title: t('bdays'), body: `<p class="muted">${t('bdaySub')}</p>${bdayRemCard('act')}
    ${all.length ? sec(t('bd_thisWeek'), wk) + sec(t('bd_month'), mo) + sec(t('bd_later'), later) : `<p class="muted center">${t('noBdays')}</p>`}
    ${missing.length ? `<p class="small muted">${t('bdMissing')}: ${missing.map(m => `<a href="#/a/member/${m.id}/edit" style="color:var(--primary)">${esc(m.name)}</a>`).join(', ')}</p>` : ''}
    <p class="small muted">${t('contactPrivacy')}</p>` });
}
function contactCard(id, editHref) {
  const c = mContact(id), ln = contactLinks(c);
  const row = (label, val, href) => val
    ? (href ? `<a class="statrow" href="${esc(href)}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}><span>${label}</span><b style="color:var(--primary-d)">${esc(val)}</b></a>` : `<div class="statrow"><span>${label}</span><b>${esc(val)}</b></div>`)
    : `<div class="statrow"><span>${label}</span><b class="muted">—</b></div>`;
  return `<div class="card stack-sm"><div class="row"><p class="strong">${t('contactT')}</p><a class="btn btn-sm btn-outline" href="${editHref || '#/a/member/' + id + '/edit'}">${t('editInv')}</a></div>
    <div>${row(t('f_phone'), c.phone, ln.phone)}${row(t('f_email'), c.email, ln.email)}${row(t('f_wechat'), c.wechat)}${row('Facebook', c.fb, ln.fb)}${row('Instagram', c.ig, ln.ig)}${row(t('f_bday'), c.bday ? `${fFull(c.bday)}${daysToBday(c.bday) <= 30 ? ' · ' + bdayWhen(daysToBday(c.bday)) : ''}` : '')}</div>
    ${ln.wa ? `<a class="btn btn-soft btn-block" href="${ln.wa}" target="_blank" rel="noopener">${icon('phone', 16)} WhatsApp</a>` : ''}
    <p class="small muted">${t('contactPrivacy')}</p></div>`;
}
function vAMemberRecords(id) {
  const m = member(id); if (!m) return vNotFound();
  return page({ back: '/a/member/' + id, title: t('tr_title'), body: `<div class="row-start"><span class="avatar lg">${initials(m.name)}</span><div><p class="h-serif">${esc(m.name)}</p><p class="small muted">${t('tr_visits', { n: visitsOf(id).length })}</p></div></div>${recordsSection(id, 'act', true)}` });
}
/* staff / freelancer view of a client: treatment history only — short name, no contact details */
function vTClient(cid) {
  const m = member(cid); if (!m) return vNotFound();
  const adm = staffAdmin(ME);
  const health = cid === 'meiling' ? t('note1') : cid === 'rachel' ? t('pregnantNote') : cid === 'priya' ? t('firmPressure') : '';
  return page({ back: '/t/today', title: t('tr_title'), body: `<div class="row-start"><span class="avatar lg">${initials(m.name)}</span><div><p class="h-serif">${esc(adm ? m.name : masked(m.name))}</p><p class="small muted">${t('tr_visits', { n: visitsOf(cid).length })}${adm ? ' · ' + t('adminAccess') : ''}</p></div></div>
    ${health ? `<div class="card tint-rose stack-xs"><p class="strong" style="color:var(--rose)">${t('tr_health')}</p><p>${esc(health)}</p></div>` : ''}
    ${adm ? contactCard(cid, '#/t/client/' + cid + '/edit') : ''}
    ${recordsSection(cid, 'act', true)}
    ${adm ? '' : `<p class="note gold">${icon('users', 16)}<span>${t('noContactStaff')}</span></p>`}` });
}
function vAMemberEdit(id, back) {
  const m = member(id); if (!m) return vNotFound();
  back = back || '/a/member/' + id;
  const c = mContact(id);
  const f = (k, label, ph, type) => `<label class="stack-xs"><span class="label">${label}</span><input class="field" id="me-${k}" value="${esc(c[k] || '')}" placeholder="${ph || ''}" ${type ? `type="${type}"` : ''} autocomplete="off"></label>`;
  return page({ back, title: t('editMember'), body: `<div class="stack">
    ${f('name', t('f_name'))}${f('phone', t('f_phone'), '+60 12-000 0000', 'tel')}${f('email', t('f_email'), 'name@example.com', 'email')}
    ${f('wechat', t('f_wechat'))}${f('fb', 'Facebook', 'facebook.com/…')}${f('ig', 'Instagram', '@…')}${f('bday', t('f_bday'), '', 'date')}
    <p class="note gold">${icon('users', 16)}<span>${t('contactPrivacy')}</span></p>
    <button class="btn btn-primary btn-block" data-act="saveMember" data-id="${id}" data-back="${back}">${t('save')}</button></div>` });
}
let cdraft = { member: 'meiling', item: 'p-hydra6', method: 'card', receipt: '', by: 'sara' };
function vACounter(mid) {
  if (mid && member(mid) && cdraft.member !== mid) cdraft = { member: mid, item: 'p-hydra6', method: 'card', receipt: '', by: 'sara' };
  const m = member(cdraft.member), p = product(cdraft.item);
  const body = `<h1 class="h1">${t('recordSale')}</h1>
  <section class="stack-sm"><h2 class="label">${t('customer')}</h2><select class="field" id="csel">${MEMBERS.map(x => `<option value="${x.id}" ${x.id === cdraft.member ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></section>
  <section class="stack-sm"><h2 class="label">${t('item')}</h2><div class="stack-xs">${PRODUCTS.filter(x => x.biz === 'lumiere').map(x => `<button class="opt ${x.id === cdraft.item ? 'on' : ''}" data-act="citem" data-id="${x.id}"><span class="radio"></span><span class="grow">${x.name[lang]}</span><b>${rm(x.price)}</b></button>`).join('')}</div></section>
  <section class="stack-sm"><h2 class="label">${t('payMethod')}</h2><div class="chips">${['cash', 'card', 'duitnow', 'ewallet'].map(k => `<button class="chip ${cdraft.method === k ? 'on' : ''}" data-act="cmethod" data-k="${k}">${t('m_' + k)}</button>`).join('')}</div></section>
  <section class="stack-sm"><h2 class="label">${t('receiptNo')}</h2><input class="field" id="receipt" value="${esc(cdraft.receipt)}" placeholder="e.g. T-20481" autocomplete="off"></section>
  <section class="stack-sm"><h2 class="label">${t('soldBy')}</h2><div class="chips">${['sara', 'joanne', 'weiling', 'aida'].map(k => `<button class="chip ${cdraft.by === k ? 'on' : ''}" data-act="cby" data-k="${k}">${staffName(k)}</button>`).join('')}</div></section>
  <div class="card flat" style="padding:4px 16px">${statrow(t('introducer'), m.intro || t('none'))}${statrow(t('total'), rm(p.price))}</div>
  <button class="btn btn-primary btn-block" data-act="recordSale">${t('recordSale')} · ${rm(p.price)}</button>`;
  return page({ back: '/a/today', title: t('recordSale'), body });
}
function vASaleDone() {
  const x = S.lastSale; if (!x) return vNotFound();
  const m = member(x.member), p = product(x.item);
  const what = p.type === 'package' ? p.name[lang] : p.type === 'topup' ? t('plusBonus', { a: rm(p.price), b: rm(p.bonus) }) : '';
  const lines = [`${staffName(x.by || 'sara')} · ${t('salesComm')} · ${rm(p.price * 0.05, 2)}`];
  if (m.intro) lines.push(`${m.intro} · ${t('introComm')} · ${rm(p.price * 0.1, 2)}`);
  return page({ cls: 'center-main', body: `<div class="done stack-lg center">
    <div class="done-icon">${icon('checkCircle', 68)}</div>
    <div class="stack-sm"><h1 class="h1">${t('saleDone')}</h1><p class="muted">${esc(m.name)} · ${rm(p.price)} · ${t('m_' + x.method)} · ${esc(x.receipt)}</p></div>
    <div class="card w100 stack-sm" style="text-align:left">
      <p class="strong">${p.type === 'product' ? t('productOnly') : t('addedTo', { n: esc(firstName(m.name)) })}</p>${what ? `<p class="muted">${what}</p>` : ''}
      <p class="small muted">✓ ${t('pushSent')}</p>
      <p class="strong" style="padding-top:6px">${t('commLines')}</p><p class="small muted">${lines.join('<br>')}</p>
    </div>
    <div class="stack w100">${x.inv ? `<a class="btn btn-outline btn-block" href="#/a/invoice/${x.inv}">${icon('doc', 18)} ${t('viewInv')}</a>` : `<button class="btn btn-outline btn-block" data-act="invFromSale">${icon('doc', 18)} ${t('invFromSale')}</button>`}${x.member === 'meiling' ? `<button class="btn btn-outline btn-block" data-act="role" data-role="member" data-to="/m/wallet/lumiere">${t('seeMember')}</button>` : ''}<a class="btn btn-primary btn-block" href="#/a/counter">${t('newSale')}</a></div></div>` });
}

/* ---- reports data (sample) ---- */
const SERIES = (() => {
  const end = new Date(); end.setDate(1); end.setHours(0, 0, 0, 0); end.setMonth(end.getMonth() - 1);
  const SEA = [1.10, 0.90, 0.99, 1.03, 0.98, 0.95, 0.97, 1.00, 1.02, 1.05, 1.07, 1.16];
  const out = [];
  for (let i = 24; i >= 0; i--) {
    const d = new Date(end); d.setMonth(d.getMonth() - i);
    const k = 24 - i, nz = s => (hash(s + k) % 1000) / 1000 - 0.5;
    out.push({ d, k, cash: Math.round(34000 * Math.pow(1.016, k) * SEA[d.getMonth()] * (1 + nz('c') * 0.06) / 10) * 10, nz });
  }
  let unused = 31000;
  out.forEach((m, j) => {
    const w = out.slice(Math.max(0, j - 2), j + 1);
    m.earned = Math.round(w.reduce((a, x) => a + x.cash, 0) / w.length * 0.93 / 10) * 10;
    m.sold = Math.round(m.cash * 0.4 / 10) * 10;
    m.used = Math.round(m.earned * 0.4 / 10) * 10;
    m.expired = Math.round((900 + m.nz('e') * 600) / 10) * 10;
    m.adj = -Math.round((250 + m.nz('a') * 200) / 10) * 10;
    m.open = unused; unused = unused + m.sold - m.used - m.expired + m.adj; m.close = unused;
    m.active = Math.round(m.earned / (112 + j * 0.8 + m.nz('s') * 4));
    m.visitsPer = 1.45 + j * 0.008 + m.nz('v') * 0.04;
    m.returning = 58 + j * 0.55 + m.nz('r') * 3;
    m.renewal = 42 + j * 0.65 + m.nz('n') * 3;
    m.newC = Math.round(32 + j * 0.6 + m.nz('w') * 8);
  });
  return out;
})();
const RANK = [
  { id: 'hydra', sessions: 61, rev: 18300, profit: 118, growth: 12 },
  { id: 'deep', sessions: 71, rev: 14200, profit: 74, growth: 4 },
  { id: 'lash', sessions: 41, rev: 6970, profit: 52, growth: -6 },
  { id: 'calm', sessions: 28, rev: 6720, profit: 96, growth: 21 },
  { id: 'gel', sessions: 51, rev: 4590, profit: 38, growth: -2 },
  { id: 'body', sessions: 9, rev: 2070, profit: 61, growth: -18 },
  { id: 'scalp', sessions: 4, rev: 560, profit: 44, growth: -9 },
];
let RP = { period: 'month', cmp: 'prev', metric: 'rev' };
function range(period, which) {
  const L = SERIES.length - 1, len = period === 'month' ? 1 : period === 'quarter' ? 3 : 12;
  const end = which === 'cur' ? L : which === 'prev' ? L - len : L - 12;
  const a = []; for (let i = Math.max(0, end - len + 1); i <= end; i++) a.push(i); return a;
}
function agg(ix) {
  const ms = ix.map(i => SERIES[i]), n = ms.length;
  const sum = k => ms.reduce((a, m) => a + m[k], 0), avg = k => sum(k) / n;
  const active = avg('active'), earned = sum('earned'), visits = avg('visitsPer');
  return { n, first: ms[0].d, last: ms[n - 1].d, cash: sum('cash'), earned, sold: sum('sold'), used: sum('used'), expired: sum('expired'), adj: sum('adj'), open: ms[0].open, close: ms[n - 1].close, active, visits, spendVisit: earned / n / active / visits, avgSpend: earned / n / active, returning: avg('returning'), renewal: avg('renewal'), newC: sum('newC') };
}
function periodLabel(a) {
  if (a.n === 1) return fMonth(a.last);
  return lang === 'zh' ? `${fMonth(a.first)} – ${fMon(a.last)}` : `${MON()[a.first.getMonth()]} ${a.first.getFullYear()} – ${fMonth(a.last)}`;
}
function dPct(cur, base, goodUp) {
  const p = (cur - base) / base * 100, dir = Math.abs(p) < 0.5 ? 'flat' : (p > 0) === (goodUp !== false) ? 'up' : 'down';
  return `<span class="delta ${goodUp === null ? 'flat' : dir}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p).toFixed(1)}%</span>`;
}
function dPts(cur, base) {
  const p = cur - base;
  return `<span class="delta ${Math.abs(p) < 0.5 ? 'flat' : p > 0 ? 'up' : 'down'}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p).toFixed(1)} pts</span>`;
}
function trendSVG() {
  const ms = SERIES.slice(-13), W = 340, H = 186, x0 = 30, x1 = 336, y0 = 10, y1 = 160;
  const max = Math.ceil(Math.max(...ms.map(m => Math.max(m.cash, m.earned))) / 20000) * 20000;
  const gw = (x1 - x0) / ms.length, bw = Math.min(8, gw / 2 - 2), y = v => y1 - v / max * (y1 - y0);
  let g = '';
  [0, max / 2, max].forEach(v => { g += `<line x1="${x0}" x2="${x1}" y1="${y(v)}" y2="${y(v)}" stroke="#EEF0F4"/><text x="${x0 - 5}" y="${y(v) + 3}" text-anchor="end" font-size="9" fill="#6B7280">${v ? v / 1000 + 'k' : '0'}</text>`; });
  ms.forEach((m, i) => {
    const cx = x0 + gw * i + gw / 2;
    g += `<rect x="${(cx - bw - 1).toFixed(1)}" y="${y(m.cash).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y1 - y(m.cash)).toFixed(1)}" rx="2" fill="#E2C98C"><title>${fMonth(m.d)} · ${t('cashL')} ${rm(m.cash)}</title></rect>`;
    g += `<rect x="${(cx + 1).toFixed(1)}" y="${y(m.earned).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y1 - y(m.earned)).toFixed(1)}" rx="2" fill="#93701F"><title>${fMonth(m.d)} · ${t('earnedL')} ${rm(m.earned)}</title></rect>`;
    if (i % 2 === 0) g += `<text x="${cx.toFixed(1)}" y="${y1 + 14}" text-anchor="middle" font-size="9" fill="#6B7280">${fMon(m.d)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('trend')}">${g}</svg>`;
}
function quadSVG() {
  const W = 340, H = 250, x0 = 26, x1 = 334, y0 = 12, y1 = 222, XM = 80, YM = 140;
  const X = v => x0 + Math.min(v, XM) / XM * (x1 - x0), Y = v => y1 - v / YM * (y1 - y0);
  const tx = X(40), ty = Y(70);
  let g = `<rect x="${tx}" y="${y0}" width="${x1 - tx}" height="${ty - y0}" fill="#FBF6EA"/>`;
  g += `<line x1="${tx}" x2="${tx}" y1="${y0}" y2="${y1}" stroke="#E2E5EB" stroke-dasharray="4 4"/><line x1="${x0}" x2="${x1}" y1="${ty}" y2="${ty}" stroke="#E2E5EB" stroke-dasharray="4 4"/>`;
  g += `<line x1="${x0}" x2="${x1}" y1="${y1}" y2="${y1}" stroke="#E8D6A8"/><line x1="${x0}" x2="${x0}" y1="${y0}" y2="${y1}" stroke="#E8D6A8"/>`;
  const lab = (x, y, s, anchor) => `<text x="${x}" y="${y}" font-size="10" fill="#93701F" font-weight="700" text-anchor="${anchor}">${s}</text>`;
  g += lab(x1 - 4, y0 + 13, t('q_star'), 'end') + lab(x0 + 6, y0 + 13, t('q_gem'), 'start') + lab(x1 - 4, y1 - 6, t('q_work'), 'end') + lab(x0 + 6, y1 - 6, t('q_weak'), 'start');
  RANK.forEach(r => {
    const s = svc(r.id), px = X(r.sessions), py = Y(r.profit), right = px > 240;
    g += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="#111827"/><text x="${(right ? px - 8 : px + 8).toFixed(1)}" y="${(py + 4).toFixed(1)}" font-size="10.5" fill="#111827" text-anchor="${right ? 'end' : 'start'}">${s.short[lang]}</text>`;
  });
  g += `<text x="${x1}" y="${H - 6}" font-size="9.5" fill="#6B7280" text-anchor="end">${t('axSessions')}</text><text x="${x0 + 2}" y="${y0 - 2}" font-size="9.5" fill="#6B7280">${t('axProfit')}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('quad')}">${g}</svg>`;
}
function branchSection(cur) {
  const BR = biz('lumiere').branches, share = { cash: 0.62, earned: 0.57, close: 0.64 };
  const part = (k, i) => i === 0 ? Math.round(cur[k] * share[k]) : cur[k] - Math.round(cur[k] * share[k]);
  const rows = BR.map((n, i) => `<tr><td><b>${n}</b>${i === 0 ? ` <span class="small muted">· ${t('mainTag')}</span>` : ''}</td><td class="num">${rm(part('cash', i))}</td><td class="num">${rm(part('earned', i))}</td><td class="num">${rm(part('close', i))}</td></tr>`).join('');
  let cross;
  if (S.branchRule === 'origin') cross = `<p class="note gold">${icon('check', 16)}<span>${t('crossOff')}</span></p>`;
  else {
    const ab = Math.round(cur.earned * 0.09 / 10) * 10, ba = Math.round(cur.earned * 0.035 / 10) * 10;
    cross = `<h3 class="label" style="padding-top:6px">${t('r_cross')}</h3>
    <table class="tbl"><tbody>
      <tr><td>${t('crossLine', { a: BR[0], b: BR[1] })}</td><td class="num small muted">${t('sessionsN', { n: Math.round(ab / 290) })}</td><td class="num">${rm(ab)}</td></tr>
      <tr><td>${t('crossLine', { a: BR[1], b: BR[0] })}</td><td class="num small muted">${t('sessionsN', { n: Math.round(ba / 260) })}</td><td class="num">${rm(ba)}</td></tr>
    </tbody></table>
    <p class="note gold">${icon('coins', 16)}<span>${t('settle', { a: BR[0], b: BR[1], v: rm(ab - ba) })}</span></p>`;
  }
  return `<section class="card stack-sm"><h2 class="h2">${t('r_branch')}</h2>
    <table class="tbl"><thead><tr><th></th><th class="num">${t('th_cash')}</th><th class="num">${t('th_earned')}</th><th class="num">${t('th_unused')}</th></tr></thead><tbody>${rows}</tbody></table>
    ${cross}</section>`;
}
function vAReports() {
  const cur = agg(range(RP.period, 'cur')), base = agg(range(RP.period, RP.cmp));
  const scale = cur.earned / RANK.reduce((a, r) => a + r.rev, 0);
  const ctrl = `<div class="ctrl"><div class="seg">${['month', 'quarter', 'year'].map(p => `<button class="${RP.period === p ? 'on' : ''}" data-act="rp" data-k="period" data-v="${p}">${t('p_' + p)}</button>`).join('')}</div>
    <div class="seg">${['prev', 'ly'].map(c => `<button class="${RP.cmp === c ? 'on' : ''}" data-act="rp" data-k="cmp" data-v="${c}">${t('c_' + c)}</button>`).join('')}</div></div>`;
  const rows = RANK.map(r => Object.assign({}, r, { sessions: Math.round(r.sessions * scale), rev: Math.round(r.rev * scale / 10) * 10, growth: RP.cmp === 'ly' ? r.growth + 9 : r.growth }));
  const val = r => RP.metric === 'rev' ? r.rev : RP.metric === 'sessions' ? r.sessions : RP.metric === 'profit' ? r.profit : r.growth;
  rows.sort((a, b) => val(b) - val(a));
  const maxV = Math.max(...rows.map(r => Math.abs(val(r))));
  const fmtV = r => RP.metric === 'rev' ? rm(r.rev) : RP.metric === 'sessions' ? r.sessions : RP.metric === 'profit' ? rm(r.profit) + '/h' : (r.growth > 0 ? '+' : '') + r.growth + '%';
  const bucketsP = [0.125, 0.234, 0.384, 0.257], bucketsN = [14, 27, 41, 33], bucketsC = ['#B42318', '#F5B301', '#93701F', '#027A48'];
  const top = MEMBERS.slice().sort((a, b) => b.ltv - a.ltv).slice(0, 5);
  const body = `<div class="row"><h1 class="h1">${t('rTitle')}</h1><span class="pill grey">${t('sample')}</span></div>
  ${ctrl}
  <a class="card row" href="#/a/timing"><span class="row-start"><span style="color:var(--primary)">${icon('clock')}</span><span><span class="strong block">${t('tmTitle')}</span><span class="small muted">${t('tmSub')}</span></span></span>${icon('chevR', 18)}</a>
  <p class="small muted">${periodLabel(cur)} · ${t('c_' + RP.cmp)} (${periodLabel(base)})</p>
  <div class="kpis">
    ${kpi(t('r_cash'), rm(cur.cash), dPct(cur.cash, base.cash))}
    ${kpi(t('r_earned'), rm(cur.earned), dPct(cur.earned, base.earned))}
    ${kpi(t('r_unused'), rm(cur.close), dPct(cur.close, base.close, null))}
    ${kpi(t('r_new'), cur.newC, dPct(cur.newC, base.newC))}
    ${kpi(t('r_active'), Math.round(cur.active), dPct(cur.active, base.active))}
    ${kpi(t('r_avg'), rm(cur.avgSpend), dPct(cur.avgSpend, base.avgSpend))}
    ${kpi(t('r_ret'), cur.returning.toFixed(0) + '%', dPts(cur.returning, base.returning))}
    ${kpi(t('r_ren'), cur.renewal.toFixed(0) + '%', dPts(cur.renewal, base.renewal))}
  </div>
  <section class="card stack-sm"><h2 class="h2">${t('trend')}</h2><div class="chart">${trendSVG()}</div>
    <div class="legend"><span><i style="background:#E2C98C"></i>${t('cashL')}</span><span><i style="background:#93701F"></i>${t('earnedL')}</span></div></section>
  <section class="card stack-sm"><h2 class="h2">${t('why')}</h2><p class="small muted">${t('whySub')}</p>
    <div class="drivers">
      <div class="driver"><span class="small muted">${t('w_cust')}</span><b>${Math.round(cur.active)}</b>${dPct(cur.active, base.active)}</div>
      <div class="driver"><span class="small muted">${t('w_visits')}</span><b>${cur.visits.toFixed(2)}</b>${dPct(cur.visits, base.visits)}</div>
      <div class="driver"><span class="small muted">${t('w_spend')}</span><b>${rm(cur.spendVisit)}</b>${dPct(cur.spendVisit, base.spendVisit)}</div>
    </div></section>
  <section class="card stack-sm"><h2 class="h2">${t('unusedT')}</h2><p class="small muted">${t('unusedSub')}</p>
    <table class="tbl"><tbody>
      <tr><td>${t('rf_open')}</td><td class="num">${rm(cur.open)}</td></tr>
      <tr><td>${t('rf_sold')}</td><td class="num">${rm(cur.sold)}</td></tr>
      <tr><td>${t('rf_used')}</td><td class="num">−${rm(cur.used)}</td></tr>
      <tr><td>${t('rf_exp')}</td><td class="num">−${rm(cur.expired)}</td></tr>
      <tr><td>${t('rf_adj')}</td><td class="num">${cur.adj < 0 ? '−' : ''}${rm(Math.abs(cur.adj))}</td></tr>
      <tr class="total"><td>${t('rf_close')}</td><td class="num">${rm(cur.close)}</td></tr>
    </tbody></table>
    <h3 class="label" style="padding-top:6px">${t('byExpiry')}</h3>
    <div class="stackbar">${bucketsP.map((p, i) => `<span style="flex:${p};background:${bucketsC[i]}"></span>`).join('')}</div>
    <table class="tbl"><tbody>${['e30', 'e90', 'e180', 'eLater'].map((k, i) => `<tr><td><span class="legend"><span><i style="background:${bucketsC[i]}"></i>${t(k)}</span></span></td><td class="num">${rm(cur.close * bucketsP[i])}</td><td class="num small muted">${t('custN', { n: bucketsN[i] })}</td></tr>`).join('')}</tbody></table></section>
  ${branchSection(cur)}
  <section class="card stack-sm"><h2 class="h2">${t('ranking')}</h2>
    <div class="chips">${['rev', 'sessions', 'profit', 'growth'].map(k => `<button class="chip ${RP.metric === k ? 'on' : ''}" data-act="rp" data-k="metric" data-v="${k}">${t('mt_' + k)}</button>`).join('')}</div>
    <div>${rows.map((r, i) => `<div class="rk"><div class="row"><span class="strong">${svc(r.id).name[lang]}</span><span class="row-start gap8">${i === 0 ? `<span class="pill sage">${t('highest')}</span>` : ''}${i === rows.length - 1 ? `<span class="pill rose">${t('lowest')}</span>` : ''}<b class="nowrap">${fmtV(r)}</b></span></div><div class="bar ${val(r) < 0 ? 'neg' : ''}"><span style="width:${Math.max(3, Math.abs(val(r)) / maxV * 100).toFixed(1)}%"></span></div></div>`).join('')}</div></section>
  <section class="card stack-sm"><h2 class="h2">${t('quad')}</h2><div class="chart">${quadSVG()}</div><p class="small muted">${t('quadNote')}</p></section>
  <section class="card stack-sm"><h2 class="h2">${t('topCust')}</h2>
    <table class="tbl"><thead><tr><th></th><th class="num">${t('c_spend')}</th><th class="num">${t('c_visits')}</th><th class="num">${t('c_avg')}</th></tr></thead><tbody>
    ${top.map(m => `<tr><td><a href="#/a/member/${m.id}" class="strong">${esc(m.name)}</a></td><td class="num">${rm(m.ltv)}</td><td class="num">${m.visits}</td><td class="num">${rm(m.ltv / Math.max(1, m.visits))}</td></tr>`).join('')}</tbody></table>
    <p class="note gold">${icon('users', 16)} ${t('conc', { p: '41%' })}</p></section>`;
  return page({ tabs: 'a', active: '/a/reports', body });
}
/* time & cancellations: 90 days of sample history plus whatever staff record in this demo */
const TM = {
  treat: [['hydra', 67, 142], ['deep', 72, 118], ['calm', 63, 64], ['lash', 104, 71], ['gel', 57, 96], ['body', 92, 58], ['scalp', 44, 39]],
  late: [['farah', 5, 6, 17], ['siti', 4, 7, 12], ['kavitha', 3, 9, 9], ['rachel', 3, 11, 8]],
  cx: { client: [38, 14], staff: [6, 2], owner: [3, 1] },
  lastMin: [['rachel', 3, 1], ['emily', 2, 1], ['kavitha', 2, 0]],
  staff: { joanne: [1, 3, 0], weiling: [4, 6, 2], aida: [6, 9, 3] },
  lostMin: 690,
};
function timingData() {
  const treat = TM.treat.map(([sid, avg, n]) => ({ sid, avg, n }));
  const late = {}, last = {}, staff = {}, events = [];
  TM.late.forEach(([cid, l, v, a]) => { late[cid] = { cid, late: l, visits: v, sum: a * l }; });
  TM.lastMin.forEach(([cid, l, ns]) => { last[cid] = { cid, last: l, noshow: ns }; });
  Object.keys(TM.staff).forEach(k => { const [ls, ov, c] = TM.staff[k]; staff[k] = { late: ls, over: ov, cx: c }; });
  const cx = { client: TM.cx.client.slice(), staff: TM.cx.staff.slice(), owner: TM.cx.owner.slice() };
  let lost = TM.lostMin;
  Object.keys(S.tLog).forEach(id => {
    const L = S.tLog[id]; if (!L.live || !L.sched) return;
    const who = member(L.cid) ? member(L.cid).name : '', s = svc(L.sid);
    if (L.arr) {
      const d = minsDiff(L.arr, L.sched), r = late[L.cid] || (late[L.cid] = { cid: L.cid, late: 0, visits: 0, sum: 0 });
      r.visits++; if (d > 5) { r.late++; r.sum += d; }
      events.push({ at: L.arr, txt: `${esc(who)} · ${t('ev_arr')} · <span class="${d > 5 ? 't-bad' : 't-ok'}">${d > 5 ? t('lateBy', { n: d }) : t('onTime')}</span>` });
    }
    if (L.start) {
      const d = startLateOf(L, L.sched);
      if (d > 5) { if (staff[L.th]) staff[L.th].late++; lost += d; }
      events.push({ at: L.start, txt: `${esc(who)} · ${t('ev_start', { s: staffName(L.th) })}${d > 5 ? ` · <span class="t-bad">${t('startLate', { n: d })}</span>` : ''}` });
    }
    if (L.end && L.start && s) {
      const d = minsDiff(L.end, L.start), tr = treat.find(x => x.sid === L.sid) || (treat[treat.push({ sid: L.sid, avg: d, n: 0 }) - 1]);
      tr.avg = (tr.avg * tr.n + d) / (tr.n + 1); tr.n++;
      events.push({ at: L.end, txt: `${esc(who)} · ${t('ev_end', { m: d, p: s.mins })}` });
    }
    if (L.cx) {
      const c = cx[L.cx.by]; c[0]++; if (L.cx.last) c[1]++;
      if (L.cx.by === 'client' && L.cx.last) { const r = last[L.cid] || (last[L.cid] = { cid: L.cid, last: 0, noshow: 0 }); r.last++; if (L.cx.noshow) r.noshow++; }
      if (L.cx.by === 'staff' && staff[L.th]) staff[L.th].cx++;
      events.push({ at: L.cx.at, txt: `${esc(who)} · ${t('st_cancelled')} · ${t('W_' + L.cx.by)}${L.cx.noshow ? ` · <span class="t-bad">${t('noShowL')}</span>` : L.cx.last ? ` · <span class="t-bad">${t('cxLastShort')}</span>` : ''}` });
    }
  });
  events.sort((a, b) => new Date(b.at) - new Date(a.at));
  return { treat, late, last, staff, cx, lost, events: events.filter(e => sameDay(e.at, new Date())) };
}
function vATiming() {
  const D = timingData();
  const rows = D.treat.map(r => Object.assign({ s: svc(r.sid) }, r)).filter(r => r.s).map(r => Object.assign(r, { diff: Math.round(r.avg) - r.s.mins })).sort((a, b) => b.diff - a.diff);
  const worst = rows[0], sn = s => s.short ? s.short[lang] : s.name[lang];
  const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n);
  const lateRows = Object.values(D.late).filter(r => r.late > 0).sort((a, b) => b.late / b.visits - a.late / a.visits).slice(0, 5);
  const lastRows = Object.values(D.last).sort((a, b) => b.last - a.last).slice(0, 5);
  const body = `<div class="row"><h1 class="h1">${t('tmTitle')}</h1><span class="pill grey">${t('sample')}</span></div>
  <p class="small muted">${t('tmSub')} · ${t('tm90')}</p>
  ${D.events.length ? `<section class="card stack-sm gold"><h2 class="h2">${t('tmToday')}</h2><div>${D.events.map(e => `<div class="ev"><span class="ev-t">${hm(e.at)}</span><span>${e.txt}</span></div>`).join('')}</div></section>` : ''}
  <p class="note gold">${icon('clock', 16)}<span>${t('tmLost', { h: (D.lost / 60).toFixed(1), n: Math.floor(D.lost / 70) })}</span></p>
  <section class="card stack-sm"><h2 class="h2">${t('tmTreat')}</h2>
    <table class="tbl"><thead><tr><th></th><th class="num">${t('th_plan')}</th><th class="num">${t('th_actual')}</th><th class="num">${t('th_diff')}</th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${sn(r.s)}</td><td class="num">${r.s.mins}</td><td class="num">${Math.round(r.avg)}</td><td class="num ${r.diff > 5 ? 't-bad' : r.diff < -2 ? 't-ok' : ''}">${sign(r.diff)}</td></tr>`).join('')}</tbody></table>
    ${worst && worst.diff > 5 ? `<p class="note rose">${icon('sparkle', 16)}<span>${t('tmInsight', { s: sn(worst.s), n: worst.diff, m: Math.ceil(worst.avg / 5) * 5 })}</span></p>` : ''}</section>
  <section class="card stack-sm"><h2 class="h2">${t('tmLateCust')}</h2>
    <table class="tbl"><thead><tr><th></th><th class="num">${t('th_lateVisits')}</th><th class="num">${t('th_avgLate')}</th></tr></thead><tbody>
    ${lateRows.map(r => `<tr><td><a class="strong" href="#/a/member/${r.cid}">${esc(member(r.cid).name)}</a></td><td class="num">${r.late} / ${r.visits}</td><td class="num t-bad">${Math.round(r.sum / r.late)} min</td></tr>`).join('')}</tbody></table>
    <p class="small muted">${t('tmLateTip')}</p></section>
  <section class="card stack-sm"><h2 class="h2">${t('tmCancel')}</h2>
    <table class="tbl"><thead><tr><th></th><th class="num">${t('th_total')}</th><th class="num">${t('th_lastMin')}</th></tr></thead><tbody>
    ${['client', 'staff', 'owner'].map(k => `<tr><td>${t('W_' + k)}</td><td class="num">${D.cx[k][0]}</td><td class="num">${D.cx[k][1]}</td></tr>`).join('')}</tbody></table>
    <h3 class="label" style="padding-top:6px">${t('tmCxCust')}</h3>
    <table class="tbl"><thead><tr><th></th><th class="num">${t('th_lastMin')}</th><th class="num">${t('th_noShow')}</th></tr></thead><tbody>
    ${lastRows.map(r => `<tr><td><a class="strong" href="#/a/member/${r.cid}">${esc(member(r.cid).name)}</a></td><td class="num">${r.last}</td><td class="num">${r.noshow}</td></tr>`).join('')}</tbody></table></section>
  <section class="card stack-sm"><h2 class="h2">${t('tmStaff')}</h2>
    <table class="tbl"><thead><tr><th></th><th class="num">${t('th_lateStart')}</th><th class="num">${t('th_overrun')}</th><th class="num">${t('th_cx')}</th></tr></thead><tbody>
    ${Object.keys(D.staff).map(k => `<tr><td><b>${staffName(k)}</b><br><span class="small muted">${t('kind_' + staffKind(k))} · <span class="nowrap">${STAFF[k].id}</span></span></td><td class="num">${D.staff[k].late}</td><td class="num">+${D.staff[k].over} min</td><td class="num">${D.staff[k].cx}</td></tr>`).join('')}</tbody></table></section>`;
  return page({ back: '/a/reports', title: t('aReports'), body });
}

/* ------------------------------------------------------------------ claims (staff side and owner side) */
const ME = 'joanne';
const isoDay = d => { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fromIsoDay = s => { const [y, m, d] = String(s || '').split('-').map(Number); return y ? new Date(y, m - 1, d, 12) : new Date(); };
const CL_PILL = { pending: 'amber', approved: 'gold', paid: 'sage', rejected: 'rose' };
const byDate = (a, b) => (new Date(b.date) - new Date(a.date)) || (S.claims.indexOf(b) - S.claims.indexOf(a));
function claimCard(c, admin) {
  const head = `<div class="row" style="align-items:flex-start"><span class="row-start">${admin ? `<span class="avatar sm">${initials(staffName(c.who))}</span>` : `<span class="ic-box">${icon(c.type === 'ot' ? 'clock' : 'receipt', 20)}</span>`}
    <span><span class="strong block">${admin ? staffName(c.who) + ' · ' : ''}${c.type === 'ot' ? t('ct_ot') : t('ec_' + c.cat)}</span><span class="small muted">${fDate(c.date)}${c.type === 'ot' ? ` · ${c.from}–${c.to} · ${t('hoursN', { n: c.hours })}` : ''}</span></span></span>
    <span class="r-col"><b>${rm(c.amount, 2)}</b><br><span class="pill ${CL_PILL[c.status]}">${t('cl_' + c.status)}</span></span></div>`;
  const extra = c.type === 'ot'
    ? `<p class="small muted">${t('od_' + c.day)} · ${t('hoursN', { n: c.hours })} × RM${c.rate.toFixed(2)}</p>`
    : `<span class="pill ${c.receipt ? 'sage' : 'rose'}">${icon(c.receipt ? 'check' : 'x', 13)} ${c.receipt ? t('receiptOk') : t('noReceipt')}</span>`;
  const btns = !admin ? '' : c.status === 'pending'
    ? `<div class="row-start gap8"><button class="btn btn-sm btn-primary" data-act="clSet" data-id="${c.id}" data-s="approved">${t('approve')}</button><button class="btn btn-sm btn-ghost" data-act="clSet" data-id="${c.id}" data-s="rejected">${t('reject')}</button></div>`
    : c.status === 'approved' ? `<div class="row-start gap8"><button class="btn btn-sm btn-outline" data-act="clSet" data-id="${c.id}" data-s="paid">${t('markPaid')}</button></div>` : '';
  return `<div class="card stack-xs">${head}${c.desc ? `<p class="small">${esc(c.desc)}</p>` : ''}${extra}${btns}</div>`;
}
function vTClaims() {
  const mine = S.claims.filter(c => c.who === ME).sort(byDate);
  const sum = st => mine.filter(c => c.status === st).reduce((a, c) => a + c.amount, 0);
  const staff = canOT(ME);
  const body = `<h1 class="h1">${t('tClaims')}</h1>
  <div class="kpis">${kpi(t('clPendingSum'), rm(sum('pending'), 2), '')}${kpi(t('cl_approved'), rm(sum('approved'), 2), `<span class="small muted">${t('clToPay')}</span>`)}</div>
  <div class="tiles">
    <a class="card tile" href="#/t/claim/exp">${icon('receipt', 24)}<span>${t('newExp')}</span></a>
    ${staff ? `<a class="card tile" href="#/t/claim/ot">${icon('clock', 24)}<span>${t('newOT')}</span></a>` : `<div class="card tile is-off" aria-disabled="true">${icon('clock', 24)}<span>${t('newOT')}</span></div>`}
  </div>
  ${staff ? '' : `<div class="card stack-sm"><p class="small muted">${t('otOnlyStaff', { n: 'Joanne' })}</p><button class="btn btn-sm btn-outline" data-act="role" data-role="admin" data-to="/a/team/${ME}">${icon('users', 16)} ${t('openTeam')}</button></div>`}
  <h2 class="h2">${t('myClaims')}</h2>
  ${mine.length ? mine.map(c => claimCard(c, false)).join('') : `<p class="muted center">${t('noClaims')}</p>`}`;
  return page({ tabs: 't', active: '/t/claims', body });
}
let cl = null;
const newCl = () => ({ cat: 'supplies', amount: '', date: isoDay(today0()), desc: '', receipt: null });
function vTClaimExp() {
  if (!cl) cl = newCl();
  const body = `<section class="stack-sm"><h2 class="label">${t('expCat')}</h2><div class="chips">${['supplies', 'transport', 'training', 'meals', 'other'].map(k => `<button class="chip ${cl.cat === k ? 'on' : ''}" data-act="clCat" data-k="${k}">${t('ec_' + k)}</button>`).join('')}</div></section>
  <div class="two">
    <label class="stack-xs"><span class="label">${t('amountRM')}</span><input class="field" inputmode="decimal" data-bind="cl.amount" value="${esc(cl.amount)}" placeholder="0.00" autocomplete="off"></label>
    <label class="stack-xs"><span class="label">${t('pickDate')}</span><input class="field" type="date" data-bind="cl.date" value="${esc(cl.date)}" max="${isoDay(today0())}"></label>
  </div>
  <label class="stack-xs"><span class="label">${t('descL')}</span><input class="field" data-bind="cl.desc" value="${esc(cl.desc)}" placeholder="${t('descPh')}" autocomplete="off"></label>
  <section class="stack-sm"><h2 class="label">${t('receiptL')}</h2>
    <label class="filebtn">${icon(cl.receipt ? 'check' : 'camera', 20)}<span class="grow">${cl.receipt ? `${t('receiptOk')} · ${esc(cl.receipt)}` : t('addReceipt')}</span><input type="file" id="clr" accept="image/*,application/pdf" capture="environment"></label></section>
  <div class="sticky-cta"><button class="btn btn-primary btn-block" data-act="clSubmit">${t('submitClaim')}</button></div>`;
  return page({ back: '/t/claims', title: t('newExp'), body });
}
let ot = null;
function newOt() {
  const ends = Object.values(S.tLog).filter(L => L.live && L.th === ME && L.end && sameDay(L.end, new Date())).map(L => hm(L.end)).sort();
  const last = ends.pop(), sug = last && last > SHIFT_END ? last : null;
  return { date: isoDay(today0()), from: SHIFT_END, to: sug || '19:00', day: 'normal', reason: '', sug };
}
function otCalcHtml() {
  const c = otAmount(ME, ot.from, ot.to, ot.day);
  return `<p class="eyebrow">${t('total')}</p><h2 class="h-serif">${rm(c.amount, 2)}</h2><p class="small muted">${t('hoursN', { n: c.hours })} × RM${c.rate.toFixed(2)} × ${c.mult}<br>${t('otRate', { r: c.rate.toFixed(2), s: rm(staffSalary(ME)) })}</p>`;
}
function vTClaimOT() {
  if (!canOT(ME)) return redirect('/t/claims');
  if (!ot) ot = newOt();
  const body = `${ot.sug ? `<p class="note gold">${icon('clock', 16)}<span>${t('otSuggest', { t: ot.sug, s: SHIFT_END })}</span></p>` : ''}
  <label class="stack-xs"><span class="label">${t('pickDate')}</span><input class="field" type="date" data-bind="ot.date" value="${esc(ot.date)}" max="${isoDay(today0())}"></label>
  <div class="two">
    <label class="stack-xs"><span class="label">${t('otFrom')}</span><input class="field" type="time" data-bind="ot.from" value="${esc(ot.from)}"></label>
    <label class="stack-xs"><span class="label">${t('otTo')}</span><input class="field" type="time" data-bind="ot.to" value="${esc(ot.to)}"></label>
  </div>
  <section class="stack-sm"><h2 class="label">${t('otDay')}</h2><div class="stack-xs">${['normal', 'rest', 'ph'].map(k => `<button class="opt ${ot.day === k ? 'on' : ''}" data-act="otDay" data-k="${k}"><span class="radio"></span><span>${t('od_' + k)}</span></button>`).join('')}</div></section>
  <label class="stack-xs"><span class="label">${t('otReason')}</span><input class="field" data-bind="ot.reason" value="${esc(ot.reason)}" placeholder="${t('otReasonPh')}" autocomplete="off"></label>
  <div class="card gold stack-xs" id="otcalc">${otCalcHtml()}</div>
  <div class="sticky-cta"><button class="btn btn-primary btn-block" data-act="otSubmit">${t('submitClaim')}</button></div>`;
  return page({ back: '/t/claims', title: t('newOT'), body });
}
function vAClaims() {
  const sec = (title, list) => `<h2 class="h2">${title}</h2>${list.length ? list.map(c => claimCard(c, true)).join('') : `<p class="muted small">${t('nothingHere')}</p>`}`;
  const all = S.claims.slice().sort(byDate);
  const body = `<h1 class="h1">${t('claimsT')}</h1>
  ${sec(t('toApprove'), all.filter(c => c.status === 'pending'))}
  ${sec(t('toPay'), all.filter(c => c.status === 'approved'))}
  ${sec(t('doneClaims'), all.filter(c => c.status === 'paid' || c.status === 'rejected'))}
  <p class="note gold">${icon('users', 16)}<span>${t('typeNote')}</span></p>`;
  return page({ back: '/a/more', title: t('aMore'), body });
}
function vATeam() {
  const body = `<h1 class="h1">${t('team')}</h1><p class="muted">${t('teamSub')}</p>
  <div class="card flat" style="padding:4px 16px">${Object.keys(STAFF).map(k => {
    const n = S.claims.filter(c => c.who === k && c.status === 'pending').length, kind = staffKind(k);
    return `<a class="mrow" href="#/a/team/${k}"><span class="avatar sm">${initials(staffName(k))}</span><span class="grow"><span class="strong">${staffName(k)}</span><br><span class="small muted">${t('role_' + staffRole(k))} · ${STAFF[k].id}</span>${staffAdmin(k) ? ` <span class="pill ink" style="margin-top:4px">${t('adminAccess')}</span>` : ''}</span><span class="pill ${kind === 'staff' ? 'gold' : 'grey'}">${t('kind_' + kind)}</span>${n ? `<span class="pill amber">${n}</span>` : ''}${icon('chevR', 16)}</a>`;
  }).join('')}</div>
  <p class="note gold">${icon('receipt', 16)}<span>${t('typeNote')}</span></p>`;
  return page({ back: '/a/more', title: t('aMore'), body });
}
function vATeamMember(k) {
  if (!STAFF[k]) return vNotFound();
  const kind = staffKind(k), role = staffRole(k), mine = S.claims.filter(c => c.who === k).sort(byDate);
  const opt = (act, cur, v, label) => `<button class="opt ${cur === v ? 'on' : ''}" data-act="${act}" data-id="${k}" data-k="${v}"><span class="radio"></span><span>${label}</span></button>`;
  const body = `<div class="row-start"><span class="avatar lg">${initials(staffName(k))}</span><div><p class="h-serif">${staffName(k)}</p><p class="small muted">${t('staffId', { id: STAFF[k].id })} · Lumière</p></div></div>
  <div class="card stack-sm">
    <p class="label">${t('empType')}</p><div class="stack-xs">${opt('teamKind', kind, 'staff', t('kind_staff'))}${opt('teamKind', kind, 'free', t('kind_free'))}</div>
    <p class="label" style="padding-top:6px">${t('roleL')}</p><div class="stack-xs">${opt('teamRole', role, 'therapist', t('role_therapist'))}${opt('teamRole', role, 'consult', t('role_consult'))}</div>
    ${kind === 'staff' ? `<label class="stack-xs" style="padding-top:6px"><span class="label">${t('salaryL')}</span><span class="row-start gap8"><input class="field" id="tsal" inputmode="numeric" value="${staffSalary(k)}"><button class="btn btn-sm btn-outline" data-act="teamSalary" data-id="${k}">${t('save')}</button></span></label><p class="small muted">${t('otRate', { r: hourlyRate(k).toFixed(2), s: rm(staffSalary(k)) })}</p>` : ''}
  </div>
  <div class="card stack-xs"><label class="row toggle-row"><span><b>${t('adminAccess')}</b><br><span class="small muted">${t('adminAccessSub')}</span></span><input type="checkbox" class="switch" data-teamadmin="${k}" ${staffAdmin(k) ? 'checked' : ''}></label>
    ${adminByText(k) ? `<p class="small muted">${adminByText(k)}</p>` : ''}<p class="small muted">${t('adminNote')}</p></div>
  <div class="card flat" style="padding:4px 16px">${statrow(t('canClaim'), kind === 'staff' ? t('claimsStaff') : t('claimsFree'))}</div>
  <p class="small muted">${t('typeNote')}</p>
  <h2 class="h2">${t('tClaims')}</h2>
  ${mine.length ? mine.map(c => claimCard(c, true)).join('') : `<p class="muted small">${t('noClaims')}</p>`}`;
  return page({ back: '/a/team', title: t('team'), body });
}

/* ------------------------------------------------------------------ invoices */
const BIZ_INFO = { name: 'Lumière Skin Studio Sdn Bhd', addr: '12, Jalan Telawi 3, Bangsar Baru, 59100 Kuala Lumpur', reg: 'Reg. no. 202301000000 (sample)', phone: '+60 3-2201 0000' };
const invLineName = l => l.ref ? (l.ref.startsWith('p:') ? (product(l.ref.slice(2)) || { name: { [lang]: '' } }).name[lang] : (svc(l.ref.slice(2)) || { name: { [lang]: '' } }).name[lang]) : (l.label || t('otherItem'));
function invTotals(x) {
  const sub = x.items.reduce((a, l) => a + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
  const disc = Math.min(sub, Math.max(0, Number(x.discount) || 0)), taxable = sub - disc;
  const sst = x.sst ? Math.round(taxable * 0.08 * 100) / 100 : 0;
  return { sub, disc, sst, total: taxable + sst };
}
const invStatus = x => x.status === 'issued' && new Date(x.due) < today0() ? 'overdue' : x.status;
const INV_PILL = { draft: 'grey', issued: 'amber', overdue: 'rose', paid: 'sage' };
const invCust = x => x.mid ? (member(x.mid) || { name: '' }).name : (x.name || '');
function vAInvoices(f) {
  f = ['all', 'issued', 'paid', 'draft'].includes(f) ? f : 'all';
  const all = S.invoices.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const list = f === 'all' ? all : all.filter(x => f === 'issued' ? x.status === 'issued' : x.status === f);
  const unpaid = all.filter(x => x.status === 'issued').reduce((a, x) => a + invTotals(x).total, 0);
  const now = new Date(), paidM = all.filter(x => x.status === 'paid' && new Date(x.paidAt).getMonth() === now.getMonth() && new Date(x.paidAt).getFullYear() === now.getFullYear()).reduce((a, x) => a + invTotals(x).total, 0);
  const body = `<div class="row"><h1 class="h1">${t('invoices')}</h1><button class="btn btn-primary btn-sm" data-act="invNew">${icon('plus', 16)} ${t('newInvoice')}</button></div>
  <div class="kpis">${kpi(t('outstanding'), rm(unpaid, 2), '')}${kpi(t('paidMonth'), rm(paidM, 2), '')}</div>
  <div class="seg">${[['all', 'invAll'], ['issued', 'inv_issued'], ['paid', 'inv_paid'], ['draft', 'inv_draft']].map(([k, l]) => `<a class="${f === k ? 'on' : ''}" href="#/a/invoices/${k}">${t(l)}</a>`).join('')}</div>
  <div class="card flat" style="padding:4px 16px">${list.length ? list.map(x => { const st = invStatus(x); return `<a class="li" href="#/a/invoice/${x.id}"><div><p class="strong">${esc(invCust(x))}</p><p class="small muted">${x.no} · ${fDate(x.date)}</p></div><div class="r"><p class="strong">${rm(invTotals(x).total, 2)}</p><span class="pill ${INV_PILL[st]}">${t('inv_' + st)}</span></div></a>`; }).join('') : `<p class="muted center" style="padding:14px 0">${t('noInvoices')}</p>`}</div>`;
  return page({ back: '/a/more', title: t('aMore'), body });
}
let inv = null;
const newInv = () => ({ id: null, mid: 'meiling', name: '', contact: '', items: [], discount: '', sst: false, date: isoDay(today0()), due: isoDay(addDays(today0(), 14)), notes: '' });
function invTotalsHtml() {
  const T = invTotals(inv);
  return `${statrow(t('subtotal'), rm(T.sub, 2))}${T.disc ? statrow(t('discL'), '−' + rm(T.disc, 2)) : ''}${inv.sst ? statrow('SST 8%', rm(T.sst, 2)) : ''}<div class="statrow total"><span>${t('total')}</span><b>${rm(T.total, 2)}</b></div>`;
}
function vAInvoiceEdit(id) {
  if (id) {
    if (!inv || inv.id !== id) { const x = S.invoices.find(v => v.id === id); if (!x) return vNotFound(); inv = JSON.parse(JSON.stringify(x)); inv.date = isoDay(x.date); inv.due = isoDay(x.due); inv.discount = x.discount ? String(x.discount) : ''; }
  } else if (!inv || inv.id) inv = newInv();
  const lumP = PRODUCTS.filter(x => x.biz === 'lumiere'), lumS = SERVICES.filter(s => s.biz === 'lumiere');
  const body = `<h1 class="h1">${id ? inv.no : t('newInvoice')}</h1>
  <section class="stack-sm"><h2 class="label">${t('billTo')}</h2>
    <select class="field" id="invCust">${MEMBERS.map(m => `<option value="${m.id}" ${inv.mid === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}<option value="" ${!inv.mid ? 'selected' : ''}>${t('otherCust')}</option></select>
    ${!inv.mid ? `<input class="field" data-bind="inv.name" value="${esc(inv.name)}" placeholder="${t('custName')}" autocomplete="off"><input class="field" data-bind="inv.contact" value="${esc(inv.contact)}" placeholder="${t('custContact')}" autocomplete="off">` : ''}
  </section>
  <section class="stack-sm"><h2 class="label">${t('items')}</h2>
    ${inv.items.map((l, i) => `<div class="card flat inv-line stack-xs"><div class="row"><b>${esc(invLineName(l))}</b><button class="icon-btn" data-act="invRemove" data-i="${i}" aria-label="${t('cancel')}">${icon('x', 18)}</button></div>
      ${l.ref ? '' : `<input class="field" data-line="${i}" data-f="label" value="${esc(l.label || '')}" placeholder="${t('itemDescPh')}">`}
      <div class="row" style="align-items:flex-end"><label>${t('qty')}<input class="field sm" type="number" min="1" inputmode="numeric" data-line="${i}" data-f="qty" value="${l.qty}"></label><label>${t('unitPrice')} (RM)<input class="field sm" inputmode="decimal" data-line="${i}" data-f="price" value="${l.price}"></label><b class="nowrap" id="lt${i}">${rm((Number(l.qty) || 0) * (Number(l.price) || 0), 2)}</b></div></div>`).join('')}
    <select class="field" id="invAdd"><option value="">${t('addItem')}</option><optgroup label="${t('tabPackages')}">${lumP.map(x => `<option value="p:${x.id}">${x.name[lang]} · ${rm(x.price)}</option>`).join('')}</optgroup><optgroup label="${t('services')}">${lumS.map(s => `<option value="s:${s.id}">${s.name[lang]} · ${rm(s.price)}</option>`).join('')}</optgroup><option value="custom">${t('otherItem')}</option></select>
  </section>
  <div class="two">
    <label class="stack-xs"><span class="label">${t('discount')}</span><input class="field" inputmode="decimal" data-bind="inv.discount" value="${esc(inv.discount)}" placeholder="0.00"></label>
    <label class="stack-xs"><span class="label">${t('dueL')}</span><input class="field" type="date" data-bind="inv.due" value="${esc(inv.due)}"></label>
  </div>
  <label class="row toggle-row"><span>${t('sst')}</span><input type="checkbox" class="switch" id="invSst" ${inv.sst ? 'checked' : ''}></label>
  <div class="card gold" style="padding:4px 16px" id="invtot">${invTotalsHtml()}</div>
  <label class="stack-xs"><span class="label">${t('invNotes')}</span><textarea class="field" data-bind="inv.notes" placeholder="${t('invNotesPh')}">${esc(inv.notes)}</textarea></label>
  <div class="row-start gap8"><button class="btn btn-outline grow" data-act="invSave" data-s="draft">${t('saveDraft')}</button><button class="btn btn-primary grow" data-act="invSave" data-s="issued">${t('issueInv')}</button></div>`;
  return page({ back: id ? '/a/invoice/' + id : '/a/invoices', title: t('invoices'), body });
}
function vAInvoice(id) {
  const x = S.invoices.find(v => v.id === id); if (!x) return vNotFound();
  const T = invTotals(x), st = invStatus(x), m = x.mid ? member(x.mid) : null;
  const doc = `<div class="card invdoc stack">
    <div class="row" style="align-items:flex-start"><div><p class="inv-biz">${BIZ_INFO.name}</p><p class="small muted">${BIZ_INFO.addr}<br>${BIZ_INFO.reg} · ${BIZ_INFO.phone}</p></div></div>
    <div class="row" style="align-items:flex-end"><p class="inv-title">${t('invoiceWord')}</p><span class="pill ${INV_PILL[st]}">${t('inv_' + st)}</span></div>
    <div class="inv-meta"><span>${t('invNo')}<b>${x.no}</b></span><span>${t('invDate')}<b>${fFull(x.date)}</b></span><span>${t('billTo')}<b>${esc(invCust(x))}</b>${!m && x.contact ? `<span class="muted">${esc(x.contact)}</span>` : ''}</span><span>${t('dueL')}<b>${fFull(x.due)}</b></span></div>
    <table class="tbl"><thead><tr><th>${t('items')}</th><th class="num">${t('qty')}</th><th class="num">${t('unitPrice')}</th><th class="num">RM</th></tr></thead><tbody>
      ${x.items.map(l => `<tr><td>${esc(invLineName(l))}</td><td class="num">${l.qty}</td><td class="num">${(Number(l.price) || 0).toFixed(2)}</td><td class="num">${((Number(l.qty) || 0) * (Number(l.price) || 0)).toFixed(2)}</td></tr>`).join('')}</tbody></table>
    <div>${statrow(t('subtotal'), rm(T.sub, 2))}${T.disc ? statrow(t('discL'), '−' + rm(T.disc, 2)) : ''}${x.sst ? statrow('SST 8%', rm(T.sst, 2)) : ''}<div class="statrow total"><span>${t('total')}</span><b>${rm(T.total, 2)}</b></div>${statrow(t('amountDue'), rm(x.status === 'paid' ? 0 : T.total, 2))}</div>
    ${x.status === 'paid' ? `<p class="note sage">${icon('checkCircle', 16)}<span>${t('paidOn', { d: fFull(x.paidAt), m: t('m_' + x.method) })}</span></p>` : ''}
    ${x.notes ? `<p class="small muted">${esc(x.notes)}</p>` : ''}</div>`;
  const acts = x.status === 'draft'
    ? `<div class="row-start gap8"><a class="btn btn-outline grow" href="#/a/invoice/${x.id}/edit">${t('editInv')}</a><button class="btn btn-primary grow" data-act="invIssue" data-id="${x.id}">${t('issueInv')}</button></div>`
    : `${x.status !== 'paid' ? `<button class="btn btn-primary btn-block" data-act="invPaySheet" data-id="${x.id}">${icon('cash', 18)} ${t('markPaidInv')}</button>` : ''}
      <div class="row-start gap8"><button class="btn btn-outline grow" data-act="toast" data-msg="waDemo">${icon('share', 16)} ${t('sendWA')}</button><button class="btn btn-outline grow" data-act="invPrint">${icon('download', 16)} ${t('printPdf')}</button></div>`;
  return page({ back: '/a/invoices', title: t('invoices'), body: `${doc}<div class="stack inv-actions">${acts}</div>` });
}
function vAMore() {
  const body = `<h1 class="h1">${t('aMore')}</h1>
  <a class="card row" href="admin/"><span class="row-start"><span class="ic-box">${icon('grid', 20)}</span><span><span class="strong block">${t('ad_fullLink')}</span><span class="small muted">www.appt4u.com/admin</span></span></span>${icon('chevR', 18)}</a>
  <div class="card menu">${menuLink('/a/birthdays', 'gift', t('bdays'), (() => { const n = bdayPending(7).length; return n ? '🎂 ' + n : ''; })())}${menuLink('/a/invoices', 'doc', t('invoices'))}${menuLink('/a/claims', 'receipt', t('claimsT'), (() => { const n = S.claims.filter(c => c.status === 'pending').length; return n ? String(n) : ''; })())}${menuLink('/a/team', 'users', t('team'))}${menuLink('/a/timing', 'clock', t('tmTitle'))}${menuLink('/a/commission', 'coins', t('commission'))}${menuLink('/a/promos', 'gift', t('promotions'))}${menuLink('/a/settings', 'settings', t('settings'))}${menuLink('/a/counter', 'cash', t('recordSale'))}</div>
  <div class="card menu">${menuBtn('lang', 'globe', t('language'), langName())}${menuBtn('roles', 'users', t('switchRole'))}${menuBtn('reset', 'refresh', t('resetDemo'))}${menuBtn('signout', 'logout', t('signOut'))}</div>`;
  return page({ tabs: 'a', active: '/a/more', body });
}
const STATEMENTS = [
  { id: 'joanne', name: 'Joanne', sub: () => t('sessionsN', { n: 26 }), amt: 2340 },
  { id: 'weiling', name: 'Wei Ling', sub: () => t('sessionsN', { n: 22 }), amt: 1980 },
  { id: 'aida', name: 'Aida', sub: () => t('sessionsN', { n: 31 }), amt: 1420 },
  { id: 'sara', name: 'Sara', sub: () => t('salesComm'), amt: 610 },
  { id: 'kelvin', name: 'Kelvin', sub: () => t('introComm'), amt: 270 },
];
function vACommission() {
  const lm = new Date(); lm.setDate(1); lm.setMonth(lm.getMonth() - 1);
  const body = `<h1 class="h1">${t('commission')}</h1><p class="muted">${t('stmtFor', { m: fMonth(lm) })}</p>
  ${STATEMENTS.map(s => {
    const st = S.approvals[s.id];
    const action = !st ? `<button class="btn btn-sm btn-primary" data-act="approve" data-id="${s.id}">${t('approve')}</button>` : st === 'approved' ? `<button class="btn btn-sm btn-outline" data-act="approve" data-id="${s.id}">${t('markPaid')}</button>` : `<span class="pill sage">${t('paidSt')}</span>`;
    return `<div class="card row"><div class="row-start"><span class="avatar sm">${initials(s.name)}</span><div><p class="strong">${s.name} · ${rm(s.amt)}</p><p class="small muted">${s.sub()}${st === 'approved' ? ' · ' + t('approved') : ''}</p></div></div>${action}</div>`;
  }).join('')}`;
  return page({ back: '/a/more', title: t('commission'), body });
}
function vAPromos() {
  const body = `<h1 class="h1">${t('promotions')}</h1>
  <div class="card stack-xs"><p class="strong">${t('pr3')}</p><p class="small muted">${t('promoStats', { a: 1260, b: 88, c: 61 })}</p></div>
  <div class="card stack-xs"><p class="strong">${t('pr1')}</p><p class="small muted">${t('promoStats', { a: 412, b: 63, c: 38 })}</p></div>
  <div class="card stack-xs"><p class="strong">${t('pr2')}</p><p class="small muted">${t('promoStats', { a: 54, b: 21, c: 14 })}</p></div>
  <div class="card stack-xs"><p class="strong">${t('pr4')}</p><p class="small muted">${t('promoConv', { a: 46, b: 16 })}</p></div>
  <p class="small muted">${t('sample')}</p>`;
  return page({ back: '/a/more', title: t('promotions'), body });
}
function vASettings() {
  const body = `<h1 class="h1">${t('settings')}</h1>
  <div class="card stack-sm"><p class="strong">${t('branches')}</p><p class="small muted">${biz('lumiere').branches.map((n, i) => i === 0 ? `${n} (${t('mainTag')})` : n).join(' · ')}</p>
    <p class="label" style="padding-top:4px">${t('br_rule')}</p>
    <div class="stack-xs">${['all', 'origin'].map(k => `<button class="opt ${S.branchRule === k ? 'on' : ''}" data-act="branchRule" data-k="${k}"><span class="radio"></span><span>${t('br_' + k)}</span></button>`).join('')}</div>
    ${S.branchRule === 'all' ? `<p class="small muted">${t('br_allNote')}</p>` : ''}</div>
  <div class="card flat" style="padding:4px 16px">${statrow(t('set_window'), t('v_7d'))}${statrow(t('set_cut'), t('v_12h'))}${statrow(t('set_grace'), t('v_15m'))}${statrow(t('set_buffer'), t('v_buf'))}${statrow(t('set_expiry'), t('v_6m'))}${statrow(t('set_rem'), t('v_rem'))}</div>
  <div class="card stack-sm"><p class="strong">${t('set_brand')}</p><div class="row-start gap8">${['#FFFFFF', '#111827', '#93701F', '#B42318', '#027A48'].map(c => `<span style="width:36px;height:36px;border-radius:18px;background:${c};border:1px solid var(--line-2)"></span>`).join('')}</div></div>
  <p class="small muted">${t('editFull')}</p>`;
  return page({ back: '/a/more', title: t('settings'), body });
}

/* ------------------------------------------------------------------ therapist */
/* Joanne's appointments: today's diary, a sample pattern for the next days, plus member bookings made in the app */
const T_TEMPLATE = [['10:00', 'deep', 'r1'], ['11:30', 'hydra', 'r1'], ['14:00', 'calm', 'r1'], ['16:00', 'body', 'r1'], ['17:30', 'deep', 'r2']];
const T_CLIENTS = ['grace', 'jessica', 'priya', 'lina', 'rachel', 'farah', 'nur', 'kavitha', 'joyce'];
function tAppointments(days) {
  const now = new Date(), out = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(today0(), i);
    if (i === 0) {
      DAYPLAN.filter(a => a.th === 'joanne').forEach(a => { const s = svc(a.s); out.push({ id: a.id, start: at(day, a.t), mins: s.mins, name: s.name[lang], price: s.price, client: masked(member(a.c).name), cid: a.c, sid: a.s, th: 'joanne', room: a.room, note: a.c === 'priya' ? t('firmPressure') : '' }); });
    } else {
      T_TEMPLATE.forEach(([tm, sid, room], j) => {
        const h = hash(day.toDateString() + tm);
        if (h % 10 < 4) return;
        const s = svc(sid), c = member(T_CLIENTS[h % T_CLIENTS.length]);
        out.push({ id: `d${i}s${j}`, start: at(day, tm), mins: s.mins, name: s.name[lang], price: s.price, client: masked(c.name), cid: c.id, sid, th: 'joanne', room, note: c.id === 'rachel' ? t('pregnantNote') : c.id === 'priya' ? t('firmPressure') : '' });
      });
    }
    S.bookings.filter(b => (isBooked(b) || (S.tLog[b.id] && S.tLog[b.id].cx)) && isLumiere(b) && b.therapistId === 'joanne' && sameDay(b.start, day)).forEach(b => out.push({ id: b.id, start: new Date(b.start), mins: bMins(b), name: bName(b), price: bPrice(b), client: 'Mei L.', cid: 'meiling', sid: b.serviceId, th: 'joanne', room: b.room, note: t('note1'), member: true, isNew: !!b.staffNew && !S.tAck[b.id] }));
  }
  const mine = out.filter(a => a.member);
  return out.filter(a => a.member || !mine.some(m => Math.abs(m.start - a.start) < 60 * 60000)).sort((a, b) => a.start - b.start).map(a => {
    a.log = logOf(a.id, a.start, a.mins); a.state = stOf(a.log);
    a.past = a.start.getTime() + a.mins * 60000 < now.getTime();
    return a;
  });
}
const tCalBtn = (a, label, cls) => `<button class="btn btn-sm ${cls || 'btn-soft'}" ${S.tCal ? `data-act="calDo" data-c="${S.tCal}"` : 'data-act="calSheet"'} data-ev="t:${a.id}">${icon('calendar', 16)} ${label}</button>`;
function timingLine(a) {
  const L = a.log, parts = [];
  if (L.cx) parts.push(`${t('cxBy')} ${t('W_' + L.cx.by)}${L.cx.noshow ? ` · <span class="t-bad">${t('noShowL')}</span>` : L.cx.last ? ` · <span class="t-bad">${t('cxLastShort')}</span>` : ''}`);
  else {
    if (L.arr) { const d = minsDiff(L.arr, a.start); parts.push(`${t('lg_arr', { t: hm(L.arr) })} · <span class="${d > 5 ? 't-bad' : 't-ok'}">${d > 5 ? t('lateBy', { n: d }) : t('onTime')}</span>`); }
    if (L.start) { const d = startLateOf(L, a.start); parts.push(`${t('lg_start', { t: hm(L.start) })}${d > 5 ? ` · <span class="t-bad">${t('startLate', { n: d })}</span>` : ''}`); }
    if (L.end) { const d = minsDiff(L.end, L.start || a.start); parts.push(`${t('lg_end', { t: hm(L.end), m: d, p: a.mins })}${d - a.mins > 5 ? ` · <span class="t-bad">${sign5(d - a.mins)}</span>` : ''}`); }
    if (!parts.length && a.past && a.state === 'todo') parts.push(`<span class="t-bad">${t('notRecorded')}</span>`);
  }
  return parts.length ? `<div class="tlog">${parts.map(p => `<span>${p}</span>`).join('')}</div>` : '';
}
const sign5 = n => '+' + n + ' min';
function apptCard(a, isToday) {
  const end = new Date(a.start.getTime() + a.mins * 60000), st = a.state;
  const status = st === 'cx' ? `<span class="pill grey">${t('st_cancelled')}</span>` : st === 'done' ? `<span class="pill sage">${t('doneSt')}</span>` : st === 'in' ? `<span class="pill gold">${t('inProg')}</span>` : st === 'arr' ? `<span class="pill gold">${t('arrivedSt')}</span>` : a.isNew ? `<span class="pill amber">${t('newBooking')}</span>` : S.tAdded[a.id] ? `<span class="pill grey">${t('inCal')}</span>` : '';
  const cxBtn = `<button class="btn btn-sm btn-ghost" data-act="tCxSheet" data-id="${a.id}">${t('cancel')}</button>`;
  const editBtn = label => `<button class="btn btn-sm btn-outline" data-act="tEdit" data-id="${a.id}">${icon('clock', 16)} ${label}</button>`;
  let actions = '';
  if (st === 'cx') actions = '';
  else if (!isToday) actions = tCalBtn(a, t('calendarSet')) + cxBtn;
  else if (st === 'todo') actions = a.past ? editBtn(t('recordTimes')) + cxBtn : `<button class="btn btn-sm btn-outline" data-act="tArr" data-id="${a.id}">${t('arrivedBtn')}</button><button class="btn btn-sm btn-primary" data-act="tStart" data-id="${a.id}">${t('startBtn')}</button>${cxBtn}`;
  else if (st === 'arr') actions = `<button class="btn btn-sm btn-primary" data-act="tStart" data-id="${a.id}">${t('startBtn')}</button>${cxBtn}`;
  else if (st === 'in') actions = `<button class="btn btn-sm btn-primary" data-act="tEnd" data-id="${a.id}" data-p="${a.price}">${t('endBtn')}</button>${editBtn(t('editTimes'))}`;
  else actions = editBtn(t('editTimes'));
  if (st !== 'cx' && a.cid) actions += `<a class="btn btn-sm btn-soft" href="#/t/client/${a.cid}">${icon('doc', 16)} ${t('tr_open')}</a>`;
  return `<div class="card stack-xs ${st === 'in' || st === 'arr' || (a.isNew && st === 'todo') ? 'gold' : ''} ${st === 'cx' ? 'is-cx' : ''}"><div class="row"><span class="small muted">${hm(a.start)} – ${hm(end)}${a.room ? ' · ' + roomName(a.room) : ''}</span>${status}</div>
  <p class="strong">${a.name}</p><p class="small muted">${esc(a.client)}</p>${a.note && st !== 'cx' ? `<p class="note rose">${icon('heart', 16)} ${esc(a.note)}</p>` : ''}
  ${timingLine(a)}
  ${actions ? `<div class="row-start gap8 wrap">${actions}</div>` : ''}</div>`;
}
function vTToday(di) {
  di = Math.max(0, Math.min(6, Number(di) || 0));
  const all = tAppointments(7), day = addDays(today0(), di);
  const items = all.filter(a => sameDay(a.start, day)), fresh = all.filter(a => a.isNew);
  const days = [...Array(7)].map((_, i) => addDays(today0(), i));
  const count = d => all.filter(a => sameDay(a.start, d) && a.state !== 'cx').length;
  const body = `<div class="row"><div><p class="muted">${t('hi', { n: 'Joanne' })}</p><h1 class="h1">${t('tSchedule')}</h1></div>${mark('J')}</div>
  ${fresh.map(a => `<div class="card gold stack-sm"><div class="row"><span class="pill amber">${t('newBooking')}</span><span class="small muted">${fDay(a.start)} · ${hm(a.start)}</span></div>
    <p class="strong">${a.name} · ${esc(a.client)}</p>
    <div class="row-start gap8">${tCalBtn(a, t('addToCalendar'), 'btn-primary')}<button class="btn btn-sm btn-ghost" data-act="ackNew" data-id="${a.id}">${t('gotIt')}</button></div></div>`).join('')}
  <div class="card stack-sm"><div class="row-start" style="align-items:flex-start"><span style="color:var(--primary)">${icon('calendar')}</span><div><p class="strong">${t('syncT')}</p><p class="small muted">${t('syncSub')}</p></div></div>
    <div class="row-start gap8"><button class="btn btn-sm btn-primary" data-act="addWeek">${icon('download', 16)} ${t('addWeek')}</button><button class="btn btn-sm btn-outline" data-act="subFeed">${icon('refresh', 16)} ${t('subscribe')}</button></div></div>
  <div class="hscroll">${days.map((d, i) => `<a class="date ${i === di ? 'on' : ''}" href="#/t/today/${i}"><span>${i === 0 ? t('today') : dayShort(d)}</span><b>${d.getDate()}</b><small>${count(d) || '–'}</small></a>`).join('')}</div>
  <div class="row"><h2 class="h2">${fDay(day)}</h2><span class="small muted">${t('apptsN', { n: items.length })}</span></div>
  ${items.length ? items.map(a => apptCard(a, di === 0)).join('') : `<p class="muted center" style="padding:12px 0">${t('noAppts')}</p>`}
  <a class="card tint-gold row" href="#/t/earnings"><span><span class="small muted">${t('earnedMonth')}</span><br><span class="h-serif">${rm(tEarn().total)}</span></span><span class="small muted">${t('sessionsN', { n: 26 + S.tCount })}</span></a>`;
  return page({ tabs: 't', active: '/t/today', body });
}
const T_SALES = [[-3, 'p-hydra6', 'Grace L.'], [-9, 'serum', 'Lina O.']];
function tSalesLines() {
  return T_SALES.map(([d, pid, c]) => ({ at: addDays(today0(), d), p: product(pid), c }))
    .concat(S.sales.filter(x => x.by === 'joanne').map(x => ({ at: new Date(x.at), p: product(x.item), c: masked(member(x.member).name) })))
    .sort((a, b) => b.at - a.at);
}
function tEarn() {
  const treat = 2340 + S.tExtra, sales = tSalesLines().reduce((a, l) => a + l.p.price * 0.05, 0);
  return { treat, sales, total: treat + sales };
}
function vTEarnings() {
  const lines = [[-1, 'hydra', 'Lina O.'], [-1, 'deep', 'Nur A.'], [-2, 'calm', 'Priya N.'], [-3, 'hydra', 'Grace L.'], [-4, 'body', 'Jessica W.']];
  const lm = new Date(); lm.setDate(1); lm.setMonth(lm.getMonth() - 1);
  const body = `<h1 class="h1">${t('tEarnings')}</h1>
  <div class="card gold stack-sm"><p class="eyebrow">${t('earnedMonth')}</p><h2 class="h-serif">${rm(tEarn().total, 2)}</h2><p class="small muted">${t('earnSplit', { a: rm(tEarn().treat, 2), b: rm(tEarn().sales, 2) })}<br>${t('sessionsN', { n: 26 + S.tCount })} · 30%</p></div>
  <h2 class="h2">${t('mySales')}</h2>
  <div class="card flat" style="padding:4px 16px">${tSalesLines().map(l => `<div class="li"><div><p class="strong">${l.p.name[lang]}</p><p class="small muted">${fDate(l.at)} · ${esc(l.c)} · ${rm(l.p.price)}</p></div><div class="r"><p class="plus">+${rm(l.p.price * 0.05, 2)}</p><p class="small muted">5%</p></div></div>`).join('')}</div>
  <h2 class="h2">${t('lines')}</h2>
  <div class="card flat" style="padding:4px 16px">${lines.map(([d, s, c]) => `<div class="li"><div><p class="strong">${svc(s).name[lang]}</p><p class="small muted">${fDate(addDays(today0(), d))} · ${c}</p></div><div class="r"><p class="plus">+${rm(svc(s).price * 0.3, 2)}</p></div></div>`).join('')}</div>
  <h2 class="h2">${t('payoutHist')}</h2>
  <div class="card flat" style="padding:4px 16px"><div class="li"><div><p class="strong">${fMonth(lm)}</p><p class="small muted">${t('paidRef', { d: fDate(addDays(new Date(lm.getFullYear(), lm.getMonth() + 1, 1), 2)), r: 'MBB-' + (lm.getMonth() + 1) + '0042' })}</p></div><b>RM2,110</b></div></div>`;
  return page({ tabs: 't', active: '/t/earnings', body });
}
function vTMe() {
  const link = 'webcal://www.appt4u.com/feed/joanne-demo.ics';
  const body = `<h1 class="h1">${t('tabProfile')}</h1>
  <div class="card stack-sm"><div class="row-start">${mark('J')}<div><p class="strong">Joanne</p><p class="small muted">${THER.joanne.title[lang]} · Lumière</p><p class="small"><span class="pill gold">${t('kind_' + staffKind('joanne'))}</span> <span class="muted">${t('staffId', { id: STAFF.joanne.id })}</span></p></div></div>
    <p class="small muted">${t('staffAccess')}</p><p class="note gold">${icon('users', 16)}<span>${staffAdmin(ME) ? t('adminYou') : t('noContactStaff')}</span></p></div>
  <div class="card stack-xs"><p class="strong">${t('remSet')}</p>
    <label class="row toggle-row"><span>${t('rem2h')}</span><input type="checkbox" class="switch" data-tnotif="rem" ${S.tNotif.rem ? 'checked' : ''}></label>
    <label class="row toggle-row"><span>${t('runSheet')}</span><input type="checkbox" class="switch" data-tnotif="run" ${S.tNotif.run ? 'checked' : ''}></label>
    <label class="row toggle-row"><span>${t('newPush')}</span><input type="checkbox" class="switch" data-tnotif="change" ${S.tNotif.change ? 'checked' : ''}></label></div>
  <div class="card stack-sm"><p class="strong">${t('calFeed')}</p><p class="small muted">${t('calFeedSub')}</p><div class="copybox">${icon('link', 18)}<span class="grow">${link}</span><button class="btn btn-sm btn-soft" data-act="copy" data-v="${link}">${t('copy')}</button></div><p class="small muted">${t('calPrivacy')}</p></div>
  <div class="card menu"><button class="menu-item" data-act="calSettings" data-who="t">${icon('calendar', 20)}<span class="grow">${t('calendarSet')}</span><span class="val">${S.tCal ? calName(S.tCal) : t('calAsk')}</span>${icon('chevR', 16)}</button>${menuBtn('lang', 'globe', t('language'), langName())}${menuBtn('roles', 'users', t('switchRole'))}${menuBtn('signout', 'logout', t('signOut'))}</div>`;
  return page({ tabs: 't', active: '/t/me', body });
}

/* ------------------------------------------------------------------ agent */
const REFS = [{ n: 'Mei L.', d: -38, a: 180, st: 'purchased' }, { n: 'Nur A.', d: -34, a: 90, st: 'purchased' }, { n: 'Jason W.', d: -32, a: 0, st: 'trial' }];
function vGHome() {
  const lm = new Date(); lm.setDate(1); lm.setMonth(lm.getMonth() - 1);
  const body = `<div class="row"><div><p class="muted">Kelvin · ${t('r_agent')}</p><h1 class="h1">${t('myRef')}</h1></div>${mark('K')}</div>
  <div class="card tint-gold stack-sm"><p class="eyebrow">${t('thisMonth')}</p><div class="row-start"><span class="h-serif">RM270</span><span class="pill amber">${t('pendingApp')}</span></div><p class="small muted">${t('lastPaid', { m: fMon(lm), a: 'RM360' })}</p></div>
  <a class="card row" href="#/g/share"><span class="row-start">${icon('share')}<span class="strong">${t('shareWA')}</span></span>${icon('chevR', 18)}</a>
  <div class="card flat" style="padding:4px 16px">${REFS.map(r => `<div class="li"><div><p class="strong">${r.n}</p><p class="small muted">${t('joined', { d: fDate(addDays(today0(), r.d)) })}</p></div><div class="r"><p class="${r.a ? 'plus' : 'muted'}">${r.a ? '+' + rm(r.a) : 'RM0'}</p><p class="small muted">${t(r.st)}</p></div></div>`).join('')}</div>
  <p class="small muted">${t('agentRule')}</p>`;
  return page({ tabs: 'g', active: '/g/home', body });
}
function shareBlock(code) {
  const link = `https://www.appt4u.com/r/${code}`, msg = t('waMsg', { b: BIZS[0].name[lang], l: link });
  return `<div class="center stack"><div class="qr">${fakeQR(code, 168)}</div><p class="small muted">${t('qrDemo')}</p></div>
  <section class="stack-sm"><h2 class="label">${t('yourLink')}</h2><div class="copybox">${icon('link', 18)}<span class="grow">${link}</span><button class="btn btn-sm btn-soft" data-act="copy" data-v="${link}">${t('copy')}</button></div></section>
  <section class="stack-sm"><h2 class="label">${t('msgPreview')}</h2><div class="msg">${esc(msg)}</div></section>
  <a class="btn btn-primary btn-block" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${icon('share', 18)} ${t('shareWA')}</a>`;
}
function vGShare() { return page({ tabs: 'g', active: '/g/share', body: `<h1 class="h1">${t('gShare')}</h1>${shareBlock('kelvin')}<p class="small muted">${t('agentRule')}</p>` }); }
function vGPayouts() {
  const m0 = new Date(); m0.setDate(1);
  const m1 = new Date(m0); m1.setMonth(m1.getMonth() - 1);
  const m2 = new Date(m0); m2.setMonth(m2.getMonth() - 2);
  const body = `<h1 class="h1">${t('gPayouts')}</h1>
  <div class="card flat" style="padding:4px 16px">
    <div class="li"><div><p class="strong">${fMonth(m0)}</p><p class="small muted">${t('pendingApp')}</p></div><b>RM270</b></div>
    <div class="li"><div><p class="strong">${fMonth(m1)}</p><p class="small muted">${t('paidRef', { d: fDate(addDays(m0, 2)), r: 'CIMB-77310' })}</p></div><b>RM360</b></div>
    <div class="li"><div><p class="strong">${fMonth(m2)}</p><p class="small muted">${t('paidRef', { d: fDate(addDays(m1, 2)), r: 'CIMB-74102' })}</p></div><b>RM180</b></div>
  </div>`;
  return page({ tabs: 'g', active: '/g/payouts', body });
}

function vNotFound() { return page({ cls: 'center-main', body: `<div class="stack center"><h1 class="h1">${t('notFound')}</h1><a class="btn btn-primary" href="#/">${t('goHome')}</a></div>` }); }

/* ------------------------------------------------------------------ router */
const ROUTES = [
  [/^\/welcome$/, vWelcome], [/^\/login$/, vLogin], [/^\/otp$/, vOtp],
  [/^\/m\/home$/, vHome], [/^\/m\/biz\/(\w+)(?:\/(\w+))?$/, vBiz], [/^\/m\/time$/, vTime], [/^\/m\/done\/(\w+)$/, vDone],
  [/^\/m\/book(?:\/\w+)?$/, () => redirect('/m/home')],
  [/^\/m\/service\/(\w+)$/, id => { const s = svc(id); if (!s) return vNotFound(); draft = { biz: s.biz, ids: [id], therapist: 'any', day: today0().toISOString(), time: null, pay: null }; return redirect('/m/time'); }],
  [/^\/m\/bookings(?:\/(\w+))?$/, vBookings], [/^\/m\/wallet(?:\/(\w+))?(?:\/(\w+))?$/, vWallet], [/^\/m\/me$/, vMe], [/^\/m\/skin$/, vSkin], [/^\/m\/aftercare$/, vAftercare],
  [/^\/a\/today$/, vAToday], [/^\/a\/diary(?:\/([\d-]+))?$/, vADiary], [/^\/a\/members(?:\/(\w+))?$/, vAMembers], [/^\/a\/member\/(\w+)$/, vAMember], [/^\/a\/member\/(\w+)\/edit$/, vAMemberEdit], [/^\/a\/birthdays$/, vABirthdays], [/^\/a\/member\/(\w+)\/records$/, vAMemberRecords], [/^\/t\/client\/(\w+)$/, vTClient], [/^\/t\/client\/(\w+)\/edit$/, id => staffAdmin(ME) ? vAMemberEdit(id, '/t/client/' + id) : redirect('/t/client/' + id)],
  [/^\/a\/counter(?:\/(\w+))?$/, vACounter], [/^\/a\/sale$/, vASaleDone], [/^\/a\/reports$/, vAReports], [/^\/a\/more$/, vAMore],
  [/^\/a\/commission$/, vACommission], [/^\/a\/timing$/, vATiming], [/^\/a\/claims$/, vAClaims], [/^\/a\/team$/, vATeam], [/^\/a\/team\/(\w+)$/, vATeamMember], [/^\/a\/invoices(?:\/(\w+))?$/, vAInvoices], [/^\/a\/invoice\/new$/, () => vAInvoiceEdit(null)], [/^\/a\/invoice\/(\w+)\/edit$/, vAInvoiceEdit], [/^\/a\/invoice\/(\w+)$/, vAInvoice], [/^\/a\/promos$/, vAPromos], [/^\/a\/settings$/, vASettings],
  [/^\/t\/today(?:\/(\d+))?$/, vTToday], [/^\/t\/earnings$/, vTEarnings], [/^\/t\/me$/, vTMe], [/^\/t\/claims$/, vTClaims], [/^\/t\/claim\/exp$/, vTClaimExp], [/^\/t\/claim\/ot$/, vTClaimOT],
  [/^\/g\/home$/, vGHome], [/^\/g\/share$/, vGShare], [/^\/g\/payouts$/, vGPayouts],
];
const APP = $('#app');
const route = () => (location.hash.replace(/^#/, '') || '/').split('?')[0];
function go(p) { if (location.hash === '#' + p) render(); else location.hash = p; }
let lastPath = null;
const shownCal = new Set();
function render() {
  const path = route();
  if (path === '/') { go(S.signedIn && S.role ? HOME[S.role] : '/welcome'); return; }
  const roleOf = { m: 'member', a: 'admin', t: 'therapist', g: 'agent' }[path.split('/')[1]];
  if (roleOf && (S.role !== roleOf || !S.signedIn)) { S.role = roleOf; S.signedIn = true; save(); }
  const old = $('#main'), keep = lastPath === path && old ? old.scrollTop : 0;
  let html = null;
  for (const [re, fn] of ROUTES) { const m = path.match(re); if (m) { html = fn(...m.slice(1)); break; } }
  APP.innerHTML = html == null ? vNotFound() : html;
  const main = $('#main'); if (main) main.scrollTop = keep;
  if (lastPath !== path) closeSheet(true);
  lastPath = path;
  renderSide();
  if (/^\/a\//.test(path) || (/^\/t\//.test(path) && staffAdmin(ME))) bdayAutoNotify(location.pathname + '#/a/birthdays');
  const dm = path.match(/^\/m\/done\/(\w+)$/);
  if (dm && !S.calAlways && !shownCal.has(dm[1])) { shownCal.add(dm[1]); setTimeout(() => { if (route() === path) calSheet('b:' + dm[1]); }, 450); }
}
if (MODE === 'app') window.addEventListener('hashchange', render);

/* ------------------------------------------------------------------ side panel (desktop) */
function renderSide() {
  const el = $('#side'); if (!el) return;
  el.innerHTML = `<div class="side-inner">
    <div class="side-brand">${logo('logo-side')}</div>
    <h1 class="side-title">${t('sideTitle')}</h1>
    <p class="muted">${t('sideText')}</p>
    <div class="stack-sm"><p class="eyebrow">${t('sideRoles')}</p><div class="side-roles">${ROLES.map(r => `<button class="chip ${S.signedIn && S.role === r ? 'on' : ''}" data-act="role" data-role="${r}">${t('r_' + r)}</button>`).join('')}<a class="chip" href="platform/">${t('r_platform')}</a></div></div>
    <a class="btn btn-primary" href="admin/">${icon('grid', 18)} ${t('ad_fullLink')}</a>
    <div class="row-start gap8 wrap">${langBtn()}<button class="chip" data-act="reset">${t('resetDemo')}</button></div>
    <p class="small muted">${t('sideData')}</p></div>`;
}

/* ------------------------------------------------------------------ sheet & toast */
const LAYER = $('#layer');
function openSheet(html) {
  LAYER.innerHTML = `<div class="scrim" data-act="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="handle"></div>${html}</div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => LAYER.classList.add('open')));
}
function closeSheet(now) {
  if (!LAYER.innerHTML) return;
  LAYER.classList.remove('open');
  if (now) LAYER.innerHTML = ''; else setTimeout(() => { if (!LAYER.classList.contains('open')) LAYER.innerHTML = ''; }, 260);
}
let toastTimer = null;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ------------------------------------------------------------------ calendar export */
const icsStamp = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsEsc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
/* A calendar event is built from a member booking ("b:<id>") or a therapist appointment ("t:<id>").
   Therapist events carry the client's first name and service only; health notes stay in the app. */
function evFromBooking(b) {
  const B = bBiz(b), st = new Date(b.start);
  return { uid: b.id, start: st, end: new Date(st.getTime() + bMins(b) * 60000), title: bName(b) + ' · ' + B.name[lang], location: B.area[lang], desc: THER[b.therapistId].name + (b.room ? ' · ' + roomName(b.room) : '') + ' · appt4u', alarm: 120 };
}
function evFromAppt(a) {
  return { uid: 't-' + a.id + '-' + a.start.toISOString().slice(0, 10), start: a.start, end: new Date(a.start.getTime() + a.mins * 60000), title: a.name + ' · ' + a.client, location: BIZS[0].name[lang] + (a.room ? ' · ' + roomName(a.room) : ''), desc: 'appt4u · ' + BIZS[0].area[lang], alarm: 30 };
}
function evByKey(key) {
  const i = key.indexOf(':'), type = key.slice(0, i), id = key.slice(i + 1);
  if (type === 'b') { const b = S.bookings.find(x => x.id === id); return b ? evFromBooking(b) : null; }
  const a = tAppointments(14).find(x => x.id === id); return a ? evFromAppt(a) : null;
}
const vevent = e => ['BEGIN:VEVENT', `UID:${e.uid}@appt4u.com`, `DTSTAMP:${icsStamp(new Date())}`, `DTSTART:${icsStamp(e.start)}`, `DTEND:${icsStamp(e.end)}`,
  `SUMMARY:${icsEsc(e.title)}`, `LOCATION:${icsEsc(e.location)}`, `DESCRIPTION:${icsEsc(e.desc)}`,
  'BEGIN:VALARM', `TRIGGER:-PT${e.alarm}M`, 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM', 'END:VEVENT'];
const icsDoc = evs => ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//appt4u//Booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'].concat(...evs.map(vevent), ['END:VCALENDAR']).join('\r\n');
/* returns the message key to show afterwards */
function openIcs(ics, name) {
  if (isIOS) {
    /* iPhone/iPad: iOS shows the event with an "Add to Calendar" button on top of the page, which stays as it was */
    location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
    return 'calDoneIos';
  }
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
  return 'calDoneFile';
}
function addToCalendar(e, kind) {
  if (kind === 'google') {
    window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(e.title) + '&dates=' + icsStamp(e.start) + '/' + icsStamp(e.end) +
      '&details=' + encodeURIComponent(e.desc) + '&location=' + encodeURIComponent(e.location), '_blank', 'noopener');
    return 'calDoneGoogle';
  }
  return openIcs(icsDoc([e]), 'appt4u-booking.ics');
}

/* ------------------------------------------------------------------ actions */
async function copyText(s) {
  try { await navigator.clipboard.writeText(s); toast(t('copied')); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = s; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(t('copied')); } catch (e2) { toast(s); }
    ta.remove();
  }
}
/* staff time log: one record per appointment, with what is needed for the owner's report */
function findAppt(id) { return tAppointments(7).find(x => x.id === id) || todayList().find(x => x.id === id) || null; }
function recLog(id, patch, meta) {
  const a = meta ? null : findAppt(id);
  const prev = S.tLog[id];
  if (prev && prev.sched && a && !sameDay(prev.sched, a.start)) { S.tLog[id + '@' + isoDay(prev.sched)] = prev; delete S.tLog[id]; }
  const base = S.tLog[id] || (a ? Object.assign({}, logOf(id, a.start, a.mins)) : {});
  delete base.sample;
  Object.assign(base, meta || (a ? { cid: a.cid, th: a.th, sid: a.sid, sched: a.start.toISOString(), mins: a.mins } : {}));
  Object.keys(patch).forEach(k => { if (patch[k] !== undefined) base[k] = patch[k]; });
  base.live = true; S.tLog[id] = base;
}
function logCancel(id, by, noshow, meta) {
  const a = meta ? null : findAppt(id), sched = meta ? meta.sched : a ? a.start.toISOString() : new Date().toISOString();
  const hrs = (new Date(sched) - Date.now()) / 36e5;
  recLog(id, { cx: { by, noshow: !!noshow, at: new Date().toISOString(), last: !!noshow || hrs < 12 } }, meta);
}
function cancelAppt(id, byKey) {
  const a = findAppt(id); if (!a) return false;
  const noshow = byKey === 'noshow', by = noshow ? 'client' : ['client', 'staff', 'owner'].includes(byKey) ? byKey : 'owner';
  logCancel(id, by, noshow);
  const b = S.bookings.find(x => x.id === id);
  if (b && isBooked(b)) {
    b.cancelBy = by;
    const late = (new Date(b.start) - new Date()) / 36e5 < 12;
    if (by === 'client' && late) {
      b.status = 'late';
      if (b.pay === 'package') { const pk = S.packages.find(p => p.id === b.pkg); if (pk) { pk.used++; ledgerAdd(pk.id, 'late', -1, { serviceId: b.serviceId }); } }
      else if (b.pay === 'stored') { const p = bPrice(b), sid = bBiz(b).id; S.stored[sid] = storedOf(sid) - p; ledgerAdd('stored:' + sid, 'late', -p); }
    } else b.status = 'cancelled';
  }
  S.tAck[id] = true; save(); return true;
}
function setLang(l) { if (!LANGS.some(x => x[0] === l)) return; lang = l; LS.set('appt4u-lang', l); document.documentElement.lang = htmlLang(l); closeSheet(true); render(); }
const ACT = {
  lang: () => openSheet(`<h2 class="h2">${t('language')}</h2><div class="stack-xs">${LANGS.map(([k, n]) => `<button class="opt ${k === lang ? 'on' : ''}" data-act="setLang" data-l="${k}" lang="${htmlLang(k)}"><span class="radio"></span><span>${n}</span></button>`).join('')}</div>`),
  setLang: el => setLang(el.dataset.l),
  roles: () => rolesSheet(),
  role: el => { S.signedIn = true; S.role = el.dataset.role; save(); closeSheet(true); go(el.dataset.to || HOME[S.role]); },
  sendCode: () => { const v = ($('#phone').value || '').replace(/[^\d ]/g, '').trim(); if (v.replace(/\D/g, '').length < 8) { toast(t('phoneInvalid')); return; } S.phone = v; save(); go('/otp'); },
  verify: () => { const v = ($('#otp').value || '').trim(); if (!/^\d{6}$/.test(v)) { toast(t('otpInvalid')); return; } S.signedIn = true; S.role = 'member'; save(); go('/m/home'); },
  toast: el => toast(t(el.dataset.msg)),
  qr: () => openSheet(`<div class="center stack"><h2 class="h2">${t('myQR')}</h2><div class="qr">${fakeQR('meiling-tan')}</div><p class="strong">Mei Ling Tan · ${t('goldMember')}</p><p class="small muted">${t('qrHint')}<br>${t('qrDemo')}</p><p class="note gold">${icon('wallet', 16)}<span>${t('qrAll')}</span></p></div>`),
  storePick: el => openSheet(`<h2 class="h2">${t('switchStore')}</h2><div class="stack-xs">${walletStores().map(b => `<a class="opt ${b.id === el.dataset.id ? 'on' : ''}" href="#/m/wallet/${b.id}">${pic(b.thumb, 80, 'biz-img xs')}<span class="grow"><b>${b.name[lang]}</b><br><span class="small muted">${t('remaining', { n: activePk(b.id).reduce((a, p) => a + pkgLeft(p), 0) })} · ${rm(storedAvail(b.id))}</span></span>${icon('chevR', 16)}</a>`).join('')}
    <a class="opt" href="#/m/wallet">${icon('wallet', 20)}<span class="grow"><b>${t('walletAll')}</b></span>${icon('chevR', 16)}</a></div>`),
  branchRule: el => { S.branchRule = el.dataset.k === 'origin' ? 'origin' : 'all'; save(); render(); },
  claim: el => { const id = el.dataset.id; S.claimed[id] = true; S.vouchers.push({ id, biz: 'lumiere', key: id === 'o1' ? 'offer1' : 'offer2' }); save(); render(); toast(t('claimedToast')); },
  dismissInstall: () => { S.installDismissed = true; save(); render(); },
  install: async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); try { await deferredPrompt.userChoice; } catch (e) { /* ignore */ } deferredPrompt = null; render(); },
  hcat: el => { hCat = el.dataset.c; render(); },
  fav: el => { const id = el.dataset.id, i = S.favs.indexOf(id); if (i >= 0) { S.favs.splice(i, 1); toast(t('favRemoved')); } else { S.favs.push(id); toast(t('favAdded')); } save(); render(); },
  pick: el => { const id = el.dataset.id, i = sel.ids.indexOf(id); if (i >= 0) sel.ids.splice(i, 1); else sel.ids.push(id); render(); },
  continue: () => { if (!sel || !sel.ids.length) return; draft = { biz: sel.biz, ids: sel.ids.slice(), therapist: 'any', day: today0().toISOString(), time: null, pay: null }; go('/m/time'); },
  ther: el => { draft.therapist = el.dataset.id; render(); },
  day: el => { draft.day = el.dataset.d; draft.time = null; render(); },
  slot: el => { draft.time = el.dataset.t; render(); },
  pay: el => { draft.pay = el.dataset.k; render(); },
  confirmBooking: () => {
    if (!draft || !draft.time) return;
    const B = biz(draft.biz), ss = draft.ids.map(svc), by = staffFor(ss, B), key = draft.ids.join('+');
    const th = draft.therapist === 'any' ? by.find(x => slotState(by, key, draft.day, draft.time, x) === 'open') || by[0] : draft.therapist;
    const pk = draft.pay === 'package' && ss.length === 1 ? pkgFor(ss[0].id) : null;
    const room = B.id === 'lumiere' ? (ss.some(s => s.cat === 'facial') ? 'r2' : 'r1') : null;
    const b = { id: 'b' + Date.now().toString(36), biz: B.id, serviceId: ss[0].id, extra: draft.ids.slice(1), therapistId: th, room, start: at(new Date(draft.day), draft.time).toISOString(), status: 'booked', pay: pk ? 'package' : draft.pay === 'package' ? 'store' : draft.pay, pkg: pk ? pk.id : null, staffNew: true };
    S.bookings.push(b); save(); draft = null; sel = null; go('/m/done/' + b.id);
  },
  quickBook: el => { const d = new Date(el.dataset.d); d.setHours(0, 0, 0, 0); draft = { biz: 'lumiere', ids: ['hydra'], therapist: 'joanne', day: d.toISOString(), time: '14:30', pay: null }; go('/m/time'); },
  calSheet: el => calSheet(el.dataset.ev),
  calPick: el => {
    const key = el.dataset.ev, e = evByKey(key); if (!e) return;
    const staff = key.startsWith('t:');
    const sw = $('#calAlways'); if (sw && sw.checked) { if (staff) S.tCal = el.dataset.c; else S.calAlways = el.dataset.c; }
    if (staff) S.tAdded[key.slice(2)] = true;
    save(); const done = addToCalendar(e, effCal(el.dataset.c) || 'google'); closeSheet(); toast(t(done));
    setTimeout(render, 300);
  },
  calDo: el => {
    const key = el.dataset.ev, e = evByKey(key); if (!e) return;
    if (key.startsWith('t:')) { S.tAdded[key.slice(2)] = true; save(); setTimeout(render, 300); }
    toast(t(addToCalendar(e, effCal(el.dataset.c) || 'google')));
  },
  ackNew: el => { S.tAck[el.dataset.id] = true; save(); render(); },
  addWeek: () => {
    const now = new Date(), list = tAppointments(7).filter(a => a.start > now);
    if (!list.length) { toast(t('noAppts')); return; }
    list.forEach(a => { S.tAdded[a.id] = true; }); save();
    const done = openIcs(icsDoc(list.map(evFromAppt)), 'appt4u-next-7-days.ics');
    toast(done === 'calDoneFile' ? t('calDoneFile') : t('weekAdded', { n: list.length })); setTimeout(render, 300);
  },
  subFeed: () => { const link = 'webcal://www.appt4u.com/feed/joanne-demo.ics'; openSheet(`<h2 class="h2">${t('subscribe')}</h2><p class="muted">${t('subInfo')}</p><div class="copybox">${icon('link', 18)}<span class="grow">${link}</span><button class="btn btn-sm btn-soft" data-act="copy" data-v="${link}">${t('copy')}</button></div><p class="note gold">${icon('sparkle', 16)} ${t('subDemo')}</p><p class="small muted">${t('calPrivacy')}</p>`); },
  closeSheet: () => closeSheet(),
  cancelBk: el => {
    const b = S.bookings.find(x => x.id === el.dataset.id); if (!b) return;
    const late = (new Date(b.start) - new Date()) / 36e5 < 12;
    openSheet(`<h2 class="h2">${t('cancelQ')}</h2><p class="muted">${t(late ? 'cancelLateInfo' : 'cancelFreeInfo', { h: 12 })}</p>
      <button class="btn btn-primary btn-block" data-act="doCancel" data-id="${b.id}">${t('yesCancel')}</button><button class="btn btn-ghost btn-block" data-act="closeSheet">${t('keep')}</button>`);
  },
  doCancel: el => {
    const b = S.bookings.find(x => x.id === el.dataset.id); if (!b) return;
    const late = (new Date(b.start) - new Date()) / 36e5 < 12;
    logCancel(b.id, 'client', false, { cid: 'meiling', th: b.therapistId, sid: b.serviceId, sched: b.start, mins: bMins(b) });
    b.cancelBy = 'client';
    if (late) {
      b.status = 'late';
      if (b.pay === 'package') { const pk = S.packages.find(p => p.id === b.pkg); if (pk) { pk.used++; ledgerAdd(pk.id, 'late', -1, { serviceId: b.serviceId }); } }
      else if (b.pay === 'stored') { const p = bPrice(b), id = bBiz(b).id; S.stored[id] = storedOf(id) - p; ledgerAdd('stored:' + id, 'late', -p); }
    } else b.status = 'cancelled';
    save(); closeSheet(); render(); toast(t(late ? 'lateToast' : 'cancelledToast'));
  },
  skinChip: el => { const g = el.dataset.g, v = el.dataset.v, a = S.skin[g]; const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); save(); render(); },
  photo: el => { S.skin.photo = el.dataset.k; save(); render(); },
  saveSkin: () => { save(); toast(t('saved')); },
  calSettings: el => {
    const who = el.dataset.who === 't' ? 't' : 'm', cur = who === 't' ? S.tCal : S.calAlways;
    openSheet(`<h2 class="h2">${t('calendarSet')}</h2><div class="stack-xs">${[[null, t('calAsk')]].concat(calOpts().map(o => [o[0], o[1]])).map(([k, l]) => `<button class="opt ${cur === k ? 'on' : ''}" data-act="setCal" data-who="${who}" data-k="${k || ''}"><span class="radio"></span><span>${l}</span></button>`).join('')}</div>`);
  },
  setCal: el => { const v = el.dataset.k || null; if (el.dataset.who === 't') S.tCal = v; else S.calAlways = v; save(); closeSheet(); render(); },
  notifSettings: () => openSheet(`<h2 class="h2">${t('notifications')}</h2>${['rem', 'exp', 'offers', 'after'].map(k => `<label class="row toggle-row"><span>${t('n_' + k)}</span><input type="checkbox" class="switch" data-notif="${k}" ${S.notif[k] !== false ? 'checked' : ''}></label>`).join('')}<p class="small muted">${t('n_note')}</p>`),
  refer: () => openSheet(`<h2 class="h2">${t('refer')}</h2>${shareBlock('meiling')}`),
  copy: el => copyText(el.dataset.v),
  reset: () => openSheet(`<h2 class="h2">${t('resetQ')}</h2><p class="muted">${t('resetInfo')}</p><button class="btn btn-primary btn-block" data-act="doReset">${t('resetDemo')}</button><button class="btn btn-ghost btn-block" data-act="closeSheet">${t('notNow')}</button>`),
  doReset: () => { LS.del(KEY); S = seed(); S.bday = {}; S.bdayRem = { day: true, before: true }; S.bdayNotified = {}; S.mEdit = {}; S.visits = seedVisits(); applyMemberEdits(); S.tLog = {}; S.team = {}; S.claims = seedClaims(); S.invoices = seedInvoices(); S.invSeq = 41; cl = null; ot = null; inv = null; draft = null; sel = null; hCat = 'all'; hQuery = ''; cdraft = { member: 'meiling', item: 'p-hydra6', method: 'card', receipt: '', by: 'sara' }; shownCal.clear(); closeSheet(true); go('/welcome'); },
  signout: () => { S.signedIn = false; S.role = null; save(); go('/welcome'); },
  checkin: el => { recLog(el.dataset.id, { arr: new Date().toISOString() }); save(); render(); toast(t('arrivedSt')); },
  cby: el => { cdraft.by = el.dataset.k; render(); },
  citem: el => { cdraft.item = el.dataset.id; render(); },
  cmethod: el => { cdraft.method = el.dataset.k; render(); },
  recordSale: () => {
    const r = ($('#receipt') || {}).value || ''; cdraft.receipt = r;
    if (!r.trim()) { toast(t('needReceipt')); const f = $('#receipt'); if (f) f.focus(); return; }
    const p = product(cdraft.item), now = new Date();
    if (cdraft.member === 'meiling') {
      if (p.type === 'package') {
        const exp = new Date(now); exp.setMonth(exp.getMonth() + p.months);
        const id = 'pk' + Date.now().toString(36);
        S.packages.push({ id, biz: 'lumiere', branch: biz('lumiere').branches[0], productId: p.id, serviceId: p.serviceId, total: p.sessions, used: 0, price: p.price, purchased: now.toISOString(), expires: exp.toISOString() });
        ledgerAdd(id, 'purchase', p.sessions);
      } else if (p.type === 'topup') { S.stored.lumiere = storedOf('lumiere') + p.price + p.bonus; ledgerAdd('stored:lumiere', 'topup', p.price); ledgerAdd('stored:lumiere', 'bonus', p.bonus); }
    }
    S.sales.push({ at: now.toISOString(), member: cdraft.member, item: p.id, price: p.price, method: cdraft.method, receipt: r.trim(), by: cdraft.by });
    S.lastSale = { member: cdraft.member, item: p.id, method: cdraft.method, receipt: r.trim(), by: cdraft.by };
    cdraft.receipt = ''; save(); go('/a/sale');
  },
  rp: el => { RP[el.dataset.k] = el.dataset.v; render(); },
  approve: el => { const id = el.dataset.id; S.approvals[id] = S.approvals[id] ? 'paid' : 'approved'; save(); render(); },
  bdAllow: async () => { const r = await askNotify(); render(); if (r === 'granted') bdayAutoNotify(location.pathname + '#/a/birthdays'); },
  bdTest: () => { const x = bdayList(30)[0]; notifyLocal(t('pushTitle'), (x ? bdayLine(x) + '.' : '') + t('bdayPushTail'), location.pathname + '#/a/birthdays', 'bday-test'); },
  bdWish: el => { const wa = bdWishDo(el.dataset.id, actorNow()); render(); toast(t('wishDone', { n: staffNameOrMember(el.dataset.id) })); if (wa) window.open(wa, '_blank', 'noopener'); },
  bdOffer: el => openSheet(bdOfferHtml(el.dataset.id, 'act')),
  bdOpt: el => { bdSetOpt(el.dataset.k); openSheet(bdOfferHtml(el.dataset.id, 'act')); },
  bdSend: el => { const r = bdSendDo(el.dataset.id, el.dataset.via, actorNow()); if (r.err) { toast(t(r.err)); return; } closeSheet(); render(); toast(t('offerDone', { n: staffNameOrMember(el.dataset.id) })); if (r.wa) window.open(r.wa, '_blank', 'noopener'); },
  saveMember: el => {
    const id = el.dataset.id, v = k => (($('#me-' + k) || {}).value || '');
    const c = { name: v('name') }; CONTACT_KEYS.forEach(k => { c[k] = v(k); });
    if (!c.name.trim()) { toast(t('needName')); return; }
    if (setMemberContact(id, c)) { go(el.dataset.back || '/a/member/' + id); toast(t('memberSaved')); }
  },
  clCat: el => { cl.cat = el.dataset.k; render(); },
  clSubmit: () => {
    const amt = Math.round(parseFloat(String(cl.amount).replace(/[^\d.]/g, '')) * 100) / 100;
    if (!(amt > 0)) { toast(t('needAmount')); return; }
    if (!cl.desc.trim()) { toast(t('needDesc')); return; }
    S.claims.push({ id: 'c' + Date.now().toString(36), who: ME, type: 'exp', cat: cl.cat, amount: amt, date: fromIsoDay(cl.date).toISOString(), desc: cl.desc.trim(), receipt: cl.receipt, status: 'pending' });
    cl = null; save(); go('/t/claims'); toast(t('claimSent'));
  },
  otDay: el => { ot.day = el.dataset.k; render(); },
  otSubmit: () => {
    if (!canOT(ME)) return;
    const c = otAmount(ME, ot.from || '00:00', ot.to || '00:00', ot.day);
    if (!(c.hours > 0)) { toast(t('endBeforeStart')); return; }
    S.claims.push(Object.assign({ id: 'c' + Date.now().toString(36), who: ME, type: 'ot', date: fromIsoDay(ot.date).toISOString(), from: ot.from, to: ot.to, day: ot.day, desc: ot.reason.trim(), status: 'pending' }, c));
    ot = null; save(); go('/t/claims'); toast(t('claimSent'));
  },
  clSet: el => { const c = S.claims.find(x => x.id === el.dataset.id); if (!c) return; c.status = el.dataset.s; save(); render(); toast(t('cl_' + c.status)); },
  teamKind: el => { const k = el.dataset.id; S.team[k] = Object.assign(S.team[k] || {}, { kind: el.dataset.k === 'staff' ? 'staff' : 'free' }); save(); render(); toast(t('typeChanged', { n: staffName(k), k: t('kind_' + staffKind(k)) })); },
  teamRole: el => { const k = el.dataset.id; S.team[k] = Object.assign(S.team[k] || {}, { role: el.dataset.k === 'consult' ? 'consult' : 'therapist' }); save(); render(); },
  teamSalary: el => { const k = el.dataset.id, v = Math.round(Number(($('#tsal') || {}).value)); if (!(v > 0)) return; S.team[k] = Object.assign(S.team[k] || {}, { salary: v }); save(); render(); toast(t('saved')); },
  invNew: () => { inv = newInv(); go('/a/invoice/new'); },
  invRemove: el => { inv.items.splice(Number(el.dataset.i), 1); render(); },
  invSave: el => {
    const status = el.dataset.s === 'issued' ? 'issued' : 'draft';
    if (!inv.mid && !inv.name.trim()) { toast(t('needCust')); return; }
    if (!inv.items.length) { toast(t('needItems')); return; }
    const old = inv.id ? S.invoices.find(v => v.id === inv.id) : null;
    const rec = { id: inv.id || 'i' + Date.now().toString(36), no: old ? old.no : 'INV-' + String(S.invSeq++).padStart(4, '0'), date: old ? old.date : new Date().toISOString(), due: fromIsoDay(inv.due).toISOString(),
      mid: inv.mid || null, name: inv.mid ? '' : inv.name.trim(), contact: inv.mid ? '' : inv.contact.trim(),
      items: inv.items.map(l => ({ ref: l.ref || null, label: l.ref ? undefined : (l.label || '').trim(), qty: Math.max(1, Math.round(Number(l.qty) || 1)), price: Math.max(0, Number(l.price) || 0) })),
      discount: Math.max(0, Number(String(inv.discount).replace(/[^\d.]/g, '')) || 0), sst: !!inv.sst, notes: (inv.notes || '').trim(), status };
    if (old) Object.assign(old, rec); else S.invoices.push(rec);
    inv = null; save(); go('/a/invoice/' + rec.id); toast(status === 'issued' ? t('invIssued', { n: rec.no }) : t('invDraftSaved'));
  },
  invIssue: el => { const x = S.invoices.find(v => v.id === el.dataset.id); if (!x) return; x.status = 'issued'; save(); render(); toast(t('invIssued', { n: x.no })); },
  invPaySheet: el => openSheet(`<h2 class="h2">${t('payHow')}</h2><div class="stack-xs">${['cash', 'card', 'duitnow', 'ewallet'].map(k => `<button class="opt" data-act="invPay" data-id="${el.dataset.id}" data-m="${k}">${icon('cash', 20)}<span>${t('m_' + k)}</span></button>`).join('')}</div><button class="btn btn-ghost btn-block" data-act="closeSheet">${t('notNow')}</button>`),
  invPay: el => { const x = S.invoices.find(v => v.id === el.dataset.id); if (!x) return; x.status = 'paid'; x.paidAt = new Date().toISOString(); x.method = el.dataset.m; save(); closeSheet(); render(); toast(t('inv_paid')); },
  invPrint: () => window.print(),
  invFromSale: () => {
    const s = S.lastSale; if (!s) return; const p = product(s.item); if (!p) return;
    const now = new Date().toISOString(), id = 'i' + Date.now().toString(36);
    S.invoices.push({ id, no: 'INV-' + String(S.invSeq++).padStart(4, '0'), date: now, due: now, mid: s.member, name: '', contact: '', items: [{ ref: 'p:' + p.id, qty: 1, price: p.price }], discount: 0, sst: false, notes: s.receipt ? 'Till receipt ' + s.receipt : '', status: 'paid', paidAt: now, method: s.method });
    s.inv = id; save(); go('/a/invoice/' + id);
  },
  tArr: el => { recLog(el.dataset.id, { arr: new Date().toISOString() }); S.tAck[el.dataset.id] = true; save(); render(); },
  tStart: el => { const id = el.dataset.id, L = S.tLog[id] || {}, now = new Date().toISOString(); recLog(id, { arr: L.arr || now, start: now }); S.tAck[id] = true; save(); render(); },
  tEnd: el => {
    recLog(el.dataset.id, { end: new Date().toISOString() });
    const c = Number(el.dataset.p) * 0.3; S.tExtra += c; S.tCount += 1; save(); render(); toast(t('commAdded', { a: rm(c, 2) }));
    const a = findAppt(el.dataset.id);
    if (a && a.cid) setTimeout(() => openSheet(recordFormHtml(null, 'act', { mid: a.cid, sid: a.sid, th: a.th })), 350);
  },
  vAdd: el => { const mid = el.dataset.mid; openSheet(recordFormHtml(null, 'act', { mid, th: S.role === 'therapist' ? 'joanne' : '' })); },
  vEdit: el => { const v = S.visits.find(x => x.id === el.dataset.id); if (v) openSheet(recordFormHtml(v, 'act')); },
  vComment: el => { const v = S.visits.find(x => x.id === el.dataset.id); if (v) openSheet(commentFormHtml(v, 'act')); },
  vSave: el => { const k = saveRecordFromForm(el.dataset.id, el.dataset.mid, el.dataset.th, actorNow()); if (k === 'tr_need') { toast(t(k)); return; } closeSheet(); render(); toast(t(k)); },
  vCommentSave: el => { const k = saveCommentFromForm(el.dataset.id, actorNow()); if (!k) return; closeSheet(); render(); toast(t(k)); },
  tEdit: el => {
    const a = findAppt(el.dataset.id); if (!a) return;
    const L = logOf(a.id, a.start, a.mins), v = (iso, d) => iso ? hm(iso) : hm(d);
    openSheet(`<h2 class="h2">${t('editTimes')}</h2><p class="small muted">${a.name} · ${esc(a.client)} · ${hm(a.start)}</p>
      <label class="stack-xs"><span class="label">${t('arrivedBtn')}</span><input class="field" type="time" id="te-arr" value="${v(L.arr, a.start)}"></label>
      <label class="stack-xs"><span class="label">${t('f_start')}</span><input class="field" type="time" id="te-start" value="${v(L.start, a.start)}"></label>
      <label class="stack-xs"><span class="label">${t('f_end')}</span><input class="field" type="time" id="te-end" value="${v(L.end, new Date(a.start.getTime() + a.mins * 60000))}"></label>
      <button class="btn btn-primary btn-block" data-act="tSaveTimes" data-id="${a.id}">${t('save')}</button><button class="btn btn-ghost btn-block" data-act="closeSheet">${t('notNow')}</button>`);
  },
  tSaveTimes: el => {
    const a = findAppt(el.dataset.id); if (!a) return;
    const val = k => { const x = ($('#te-' + k) || {}).value; return /^\d\d:\d\d$/.test(x || '') ? at(a.start, x).toISOString() : null; };
    const arr = val('arr'), start = val('start'), end = val('end');
    if (start && end && new Date(end) <= new Date(start)) { toast(t('endBeforeStart')); return; }
    recLog(a.id, { arr, start, end }); S.tAck[a.id] = true; save(); closeSheet(); render(); toast(t('saved'));
  },
  tCxSheet: el => {
    const a = findAppt(el.dataset.id); if (!a) return;
    const hrs = (a.start - Date.now()) / 36e5, admin = el.dataset.who === 'a';
    const opts = (hrs < 0 ? [['noshow', 'cx_noshow']] : []).concat([['client', 'cx_client'], ['staff', admin ? 'cx_staffA' : 'cx_staff'], ['owner', 'cx_owner']]);
    const ic = { noshow: 'x', client: 'user', staff: 'sparkle', owner: 'chart' };
    openSheet(`<h2 class="h2">${t('cxTitle')}</h2><p class="small muted">${a.name} · ${esc(a.client)} · ${fDay(a.start)} ${hm(a.start)}</p>
      ${hrs >= 0 && hrs < 12 ? `<p class="note rose">${icon('clock', 16)}<span>${t('cxLast')}</span></p>` : ''}
      <div class="stack-xs">${opts.map(([k, l]) => `<button class="opt" data-act="tCancel" data-id="${a.id}" data-by="${k}">${icon(ic[k], 20)}<span class="grow">${t(l)}</span>${icon('chevR', 16)}</button>`).join('')}</div>
      <button class="btn btn-ghost btn-block" data-act="closeSheet">${t('keep')}</button>`);
  },
  tCancel: el => { if (cancelAppt(el.dataset.id, el.dataset.by)) { closeSheet(); render(); toast(t('cxToast')); } },
};
if (MODE === 'app') document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  e.preventDefault(); fn(el, e);
});
if (MODE === 'app') document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'q') { hQuery = el.value; const l = $('#bizlist'); if (l) l.innerHTML = bizRows(); }
  else if (el.id === 'mq') { mQuery = el.value; const l = $('#mlist'); if (l) l.innerHTML = memberRows(); }
  else if (el.id === 'receipt') cdraft.receipt = el.value;
  else if (el.id === 'allergy') { S.skin.allergy = el.value; save(); }
  else if (el.id === 'otp' && /^\d{6}$/.test(el.value)) ACT.verify();
  else if (el.id === 'bd-custom') bdCustom(el.value);
  else if (el.dataset && el.dataset.bind) {
    const [o, k] = el.dataset.bind.split('.'), D = o === 'cl' ? cl : o === 'ot' ? ot : o === 'inv' ? inv : null;
    if (!D) return;
    D[k] = el.value;
    if (o === 'ot') { const c = $('#otcalc'); if (c) c.innerHTML = otCalcHtml(); }
    if (o === 'inv' && k === 'discount') { const c = $('#invtot'); if (c) c.innerHTML = invTotalsHtml(); }
  } else if (el.dataset && el.dataset.line != null && inv) {
    const l = inv.items[Number(el.dataset.line)]; if (!l) return;
    l[el.dataset.f] = el.value;
    const lt = $('#lt' + el.dataset.line); if (lt) lt.textContent = rm((Number(l.qty) || 0) * (Number(l.price) || 0), 2);
    const c = $('#invtot'); if (c) c.innerHTML = invTotalsHtml();
  }
});
if (MODE === 'app') document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'csel') { cdraft.member = el.value; render(); }
  else if (el.id === 'clr' && cl) { const f = el.files && el.files[0]; cl.receipt = f ? f.name : null; render(); }
  else if (el.id === 'invCust' && inv) { inv.mid = el.value || null; render(); }
  else if (el.id === 'invSst' && inv) { inv.sst = el.checked; const c = $('#invtot'); if (c) c.innerHTML = invTotalsHtml(); }
  else if (el.id === 'invAdd' && inv && el.value) {
    const v = el.value, ref = v === 'custom' ? null : v, it = ref ? (ref.startsWith('p:') ? product(ref.slice(2)) : svc(ref.slice(2))) : null;
    inv.items.push({ ref, label: '', qty: 1, price: it ? it.price : 0 }); render();
  }
  else if (el.dataset && el.dataset.notif) { S.notif[el.dataset.notif] = el.checked; save(); }
  else if (el.dataset && el.dataset.tnotif) { S.tNotif[el.dataset.tnotif] = el.checked; save(); }
  else if (el.dataset && el.dataset.bdrem) { setBdRem(el.dataset.bdrem, el.checked); toast(t('remOnDone')); }
  else if (el.dataset && el.dataset.teamadmin) { const k = el.dataset.teamadmin; if (setStaffAdmin(k, el.checked, { name: 'Michelle' })) { render(); toast(t(el.checked ? 'adminOn' : 'adminOff', { n: staffName(k) })); } }
});
if (MODE === 'app') document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSheet();
  if (e.key === 'Enter' && e.target.id === 'phone') ACT.sendCode();
});

/* ------------------------------------------------------------------ install & offline */
let deferredPrompt = null;
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (MODE === 'app') window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; if (route() === '/m/home') render(); });
if (MODE === 'app') window.addEventListener('appinstalled', () => { deferredPrompt = null; S.installDismissed = true; save(); });
if (MODE === 'app' && 'serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => { /* offline support unavailable */ }); });
}

/* another tab (for example the desktop admin) changed the demo data */
if (MODE === 'app') window.addEventListener('storage', e => { if (e.key === KEY) { loadState(); render(); } else if (e.key === 'appt4u-lang') { const l = LS.get('appt4u-lang', 'en'); if (l !== lang && LANGS.some(x => x[0] === l)) { lang = l; document.documentElement.lang = htmlLang(l); render(); } } });
if (MODE === 'app') render();

document.documentElement.lang = htmlLang(lang);
window.A4U = {
  get S() { return S; }, save, reload: loadState,
  reset() { LS.del(KEY); S = seed(); S.bday = {}; S.bdayRem = { day: true, before: true }; S.bdayNotified = {}; S.mEdit = {}; S.visits = seedVisits(); applyMemberEdits(); S.tLog = {}; S.team = {}; S.claims = seedClaims(); S.invoices = seedInvoices(); S.invSeq = 41; save(); },
  t, get lang() { return lang; }, LANGS, htmlLang,
  setLang(l) { if (!LANGS.some(x => x[0] === l)) return; lang = l; LS.set('appt4u-lang', l); document.documentElement.lang = htmlLang(l); },
  esc, icon, logo, rm, hm, pad, fDate, fFull, fDay, fMonth, fMon, today0, addDays, sameDay, isoDay, fromIsoDay, initials, masked, hash, DAY,
  BIZS, biz, SERVICES, svc, PRODUCTS, product, MEMBERS, member, THER, STAFF, staffName, staffKind, staffRole, staffSalary, hourlyRate, canOT,
  todayList, findAppt, recLog, cancelAppt, stOf, logOf, minsDiff, startLateOf, timingData, TM, roomName,
  staffAdmin, setStaffAdmin, adminByText,
  bdayList, bdayPending, bdayAttItems, bdayRemCard, setBdRem, bdOfferHtml, bdSetOpt, bdCustom, bdSendDo, bdWishDo, bdayWhen, askNotify, notifyLocal, bdayAutoNotify, bdayLine, nextBday, daysToBday, ageTurning, bdayOf,
  visitsOf, visitCard, recordFormHtml, commentFormHtml, saveRecordFromForm, saveCommentFromForm, recordsSection,
  meilingBalance, activePk, pkgLeft, pkgName, storedOf, mContact, setMemberContact, contactLinks, CONTACT_KEYS,
  invTotals, invStatus, invCust, invLineName, BIZ_INFO, INV_PILL, CL_PILL,
  SERIES, RANK, range, agg, periodLabel, dPct, dPts, trendSVG, quadSVG, get RP() { return RP; }, STATEMENTS,
};
})();
