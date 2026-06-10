import { defaultActivityCatalog } from './activitiesCatalog'

export type Role = 'normal' | 'member'

export interface Task {
  id: string
  title: string
  desc: string
  done: boolean
  points: number
  nav: string
}

export interface HomeRoleData {
  userName: string
  badge: string
  serviceDay: number
  heroSubtitle: string
  heroChips: string[]
  archiveRate: string
  todayPoints: number
  totalPoints: number
  aiIntro: string
  aiPrompts: string[]
  membershipHint: string
  membershipAction: string
  advisorName: string
  advisorDesc: string
  tasks: Task[]
  serviceReminders: { id: string; type: string; title: string; desc: string; urgent?: boolean }[]
  records: string[]
  familyDynamics: { id?: string; name: string; info: string; status: string }[]
  activities: { id: string; name: string; time: string; joined: boolean; seats: string }[]
  pointTasks?: { id: string; title: string; reward: number; claimed: boolean }[]
  rights?: { consult: number; recheck: number; report: number }
}

export const recordTypes = [
  { id: 'diet', name: '饮食', icon: '🍽', category: 'life' as const },
  { id: 'mood', name: '心情', icon: '😊', category: 'life' as const },
  { id: 'medication', name: '用药', icon: '💊', category: 'life' as const },
  { id: 'sport', name: '运动', icon: '🏃', category: 'life' as const },
  { id: 'weight', name: '体重', icon: '⚖️', category: 'life' as const },
  { id: 'waist', name: '腰围', icon: '📏', category: 'life' as const },
  { id: 'bp', name: '血压', icon: '💓', category: 'medical' as const },
  { id: 'glucose', name: '血糖', icon: '🍬', category: 'medical' as const },
  { id: 'hr', name: '心率', icon: '❤️', category: 'medical' as const },
  { id: 'lipid', name: '血脂', icon: '🧪', category: 'medical' as const, readOnly: true },
]

export const homePageExtras = {
  doctors: [
    { id: 'd1', name: '张医生', role: '全科 · 主治医师', initial: '张', online: true },
    { id: 'd2', name: '李助理', role: '健康管理师', initial: '李', online: true },
  ],
  vitals: [
    { label: '心率', value: '72', unit: 'bpm' },
    { label: '血压', value: '130/82', unit: 'mmHg' },
    { label: 'LDL-C', value: '3.8', unit: 'mmol/L' },
  ],
  news: [
    { tag: '心血管', title: '高血压患者日常血压管理：五个关键注意点', meta: '家庭医生团队 · 2天前' },
    { tag: '代谢', title: 'LDL-C 偏高的饮食调整建议', meta: '张医生专栏 · 5天前' },
  ],
}

export const homeData: Record<Role, HomeRoleData> = {
  normal: {
    userName: '李静',
    badge: '普通用户',
    serviceDay: 18,
    heroSubtitle: '连续健康管理第 18 天',
    heroChips: ['档案完善优先', '体验小懂代录', '完成任务得积分'],
    archiveRate: '62%',
    todayPoints: 28,
    totalPoints: 420,
    aiIntro: '健康科普、记录代录与功能引导，诊疗建议由医生确认',
    aiPrompts: ['帮我记录今天血压 135/86', '我总是睡不好怎么办', '如何开启家人档案授权'],
    membershipHint: '开通会员享线上咨询、健康评估、检查计划与检查额度',
    membershipAction: '了解会员权益',
    advisorName: '顾问助手 · 小康',
    advisorDesc: '添加企微了解顾问服务',
    tasks: [
      { id: 't1', title: '完善基础档案', desc: '补充过敏史与家族史', done: false, points: 20, nav: '/profile/medical' },
      { id: 't2', title: '完成今日血压记录', desc: '保持规律记录', done: false, points: 12, nav: '/records/form/bp' },
      { id: 't3', title: '查看会员权益介绍', desc: '了解专属医生服务', done: true, points: 8, nav: '/membership' },
    ],
    serviceReminders: [],
    records: ['饮食', '运动', '心情', '血压', '血糖', '心率'],
    familyDynamics: [
      { id: 'f1', name: '王建国（父亲）', info: '昨晚有新血压记录', status: '有更新' },
      { id: 'f2', name: '王小乐（儿童）', info: '开启授权后可查看生长曲线', status: '待授权' },
    ],
    activities: [
      { id: 'a1', name: '慢病管理营（线上）', time: '06/08 19:30', joined: false, seats: '剩余 23 席' },
      { id: 'a2', name: '女性健康沙龙（线下）', time: '06/12 14:00', joined: false, seats: '剩余 12 席' },
    ],
  },
  member: {
    userName: '王建国',
    badge: '单人银卡会员',
    serviceDay: 124,
    heroSubtitle: '家庭医生团队正在跟进您的复查计划',
    heroChips: ['专属医生服务中', '本周待处理 2 项', '月度报告待查看'],
    archiveRate: '91%',
    todayPoints: 66,
    totalPoints: 1280,
    aiIntro: '快速代录数据，医生团队审核与干预跟进',
    aiPrompts: ['总结我本周血糖波动', '提醒我复查前注意事项', '把新报告发给张医生团队'],
    membershipHint: '检查额度剩余 ¥4,150 · 专家门诊剩余 5 次 · 6月10日复查',
    membershipAction: '查看电子会员卡',
    advisorName: '家庭医生 · 张医生团队',
    advisorDesc: '添加企微 · 专属顾问咨询',
    tasks: [
      { id: 't1', title: '上传体检报告', desc: 'AI 解读初稿待医生审核', done: false, points: 15, nav: '/profile/portrait' },
      { id: 't2', title: '完成晚间血糖记录', desc: '记录后医生团队可查看', done: false, points: 12, nav: '/records/form/glucose' },
      { id: 't3', title: '复查预约确认', desc: '6 月 10 日心内科复查', done: true, points: 10, nav: '/reports' },
    ],
    serviceReminders: [
      { id: 'sr1', type: '复查', title: '6月10日 心内科复查', desc: '请提前 1 天确认', urgent: true },
      { id: 'sr2', type: '用药', title: '晚间降压药提醒', desc: '每日 20:00', urgent: false },
    ],
    records: ['血压', '血糖', '心率', '饮食', '运动', '体重'],
    familyDynamics: [
      { id: 'f3', name: '李静（配偶）', info: '近 7 天睡眠记录已更新', status: '有动态' },
      { id: 'f2', name: '王小乐（儿童）', info: '本周六儿童视力筛查活动', status: '正常' },
    ],
    activities: [
      { id: 'a3', name: '会员茶话会（线下）', time: '06/09 10:00', joined: true, seats: '已报名' },
      { id: 'a4', name: '心血管健康讲座（线上）', time: '06/13 19:00', joined: false, seats: '剩余 8 席' },
    ],
    rights: { consult: 4, recheck: 1, report: 1 },
  },
}

export const archivePersons = {
  normal: [
    { archiveId: 'A001', name: '李静', relationship: '本人', avatar: '李', gender: '女', age: 36 },
    { archiveId: 'A002', name: '王建国', relationship: '父亲', avatar: '王', gender: '男', age: 62 },
    { archiveId: 'A003', name: '王小乐', relationship: '儿子', avatar: '乐', gender: '男', age: 8 },
  ],
  member: [
    { archiveId: 'B001', name: '王建国', relationship: '本人', avatar: '王', gender: '男', age: 58 },
    { archiveId: 'B002', name: '李静', relationship: '配偶', avatar: '李', gender: '女', age: 36 },
    { archiveId: 'B003', name: '王小乐', relationship: '儿子', avatar: '乐', gender: '男', age: 8 },
  ],
}

export const archiveModules = [
  { id: 'portrait', title: '健康画像', desc: '六维概况与标签', icon: '📊', path: '/profile/portrait', color: 'from-blue-500/90 to-indigo-600/90' },
  { id: 'basic', title: '基本信息', desc: '身高体重与体征', icon: '👤', path: '/profile/basic', color: 'from-teal-500/90 to-cyan-600/90' },
  { id: 'docs', title: '健康资料', desc: '检查与病历报告', icon: '📁', path: '/profile/docs', color: 'from-amber-500/90 to-orange-600/90' },
  { id: 'history', title: '健康史', desc: '既往史与家族史', icon: '📋', path: '/profile/history', color: 'from-rose-500/90 to-pink-600/90' },
  { id: 'indicators', title: '健康指标', desc: '医疗与生活数据', icon: '💓', path: '/profile/indicators', color: 'from-emerald-500/90 to-green-600/90' },
  { id: 'plans', title: '健康计划', desc: '检查与干预安排', icon: '🗓', path: '/profile/plans', color: 'from-violet-500/90 to-purple-600/90' },
]

export const archiveHub = {
  normal: { folderTotal: 6, completeness: 62, tip: '血压记录 · 建议保持规律测量' },
  member: { folderTotal: 11, completeness: 91, tip: '6月10日心内科复查 · 已创建提醒' },
}

export type ArchiveChipTone = 'red' | 'amber' | 'blue' | 'green' | 'gray'

export interface ArchiveProfileData {
  syncAt: string
  medId: { height: string; weight: string; birth: string; bloodType: string }
  basic: {
    bloodType: string
    ethnicity: string
    emergencyContact: string
    emergencyPhone: string
  }
  chips: { label: string; tone: ArchiveChipTone }[]
  guestChips: { label: string; tone: ArchiveChipTone }[]
  allergies: { name: string; severity: string; reaction: string }[]
  pastHistory: { year: string; month: string; title: string; detail: string; tag?: string }[]
  familyHistory: { title: string; detail: string }[]
  annualExams: { year: string; month: string; title: string; detail: string; tags?: string[] }[]
  followups: { day: string; month: string; title: string; detail: string; tag?: string }[]
  authCode: string
}

export const archiveProfileData: Record<Role, ArchiveProfileData> = {
  normal: {
    syncAt: '2026-06-08 08:15',
    medId: { height: '165cm', weight: '58kg', birth: '1990年3月', bloodType: 'A型' },
    basic: {
      bloodType: 'A型',
      ethnicity: '汉族',
      emergencyContact: '王建国（父亲）',
      emergencyPhone: '138****2865',
    },
    chips: [
      { label: '🚫 青霉素过敏', tone: 'red' },
      { label: '暂无长期用药', tone: 'gray' },
    ],
    guestChips: [],
    allergies: [
      { name: '青霉素', severity: '过敏', reaction: '皮肤瘙痒，就诊前请告知医生' },
    ],
    pastHistory: [
      { year: '2024', month: '08月', title: '体检发现血压偏高', detail: '建议规律监测，暂无长期用药' },
    ],
    familyHistory: [{ title: '父亲高血压史', detail: '长期服药控制中' }],
    annualExams: [
      { year: '2025', month: '11月', title: '年度检查报告', detail: '总体良好，建议关注血压', tags: ['PDF'] },
    ],
    followups: [
      {
        day: '26',
        month: '05月',
        title: '健康顾问随访',
        detail: '已同步最近血压记录，建议保持规律打卡。',
        tag: '顾问记录',
      },
    ],
    authCode: 'HX-2026-LJ01',
  },
  member: {
    syncAt: '2026-06-09 08:20',
    medId: { height: '172cm', weight: '74kg', birth: '1968年5月', bloodType: 'B型' },
    basic: {
      bloodType: 'B型',
      ethnicity: '汉族',
      emergencyContact: '李静（配偶）',
      emergencyPhone: '138****2865',
    },
    chips: [
      { label: '血压持续记录中', tone: 'blue' },
      { label: '血脂管理', tone: 'amber' },
      { label: '🚫 青霉素过敏', tone: 'red' },
      { label: '长期服用降压药', tone: 'blue' },
      { label: '血糖记录达标', tone: 'green' },
    ],
    guestChips: [],
    allergies: [
      { name: '青霉素', severity: '严重', reaction: '皮疹、呼吸不适，已明确禁用' },
      { name: '虾蟹类', severity: '中度', reaction: '皮肤瘙痒，建议避免过量摄入' },
    ],
    pastHistory: [
      {
        year: '2019',
        month: '10月',
        title: '高血压确诊',
        detail: '病程 5 年，长期服用缬沙坦，近半年持续监测。',
        tag: '长期用药',
      },
      {
        year: '2021',
        month: '03月',
        title: '糖代谢管理',
        detail: '空腹血糖曾偏高，目前通过饮食与运动干预管理。',
        tag: '饮食控制',
      },
      {
        year: '2018',
        month: '06月',
        title: '腰椎劳损',
        detail: '久坐后腰酸，已开展拉伸训练，症状已缓解。',
        tag: '已缓解',
      },
    ],
    familyHistory: [
      { title: '父亲 · 高血压史', detail: '长期服药控制' },
      { title: '母亲 · 脑血管病史', detail: '曾发生短暂性脑缺血' },
      { title: '兄长 · 糖代谢异常', detail: '口服降糖药控制中' },
    ],
    annualExams: [
      {
        year: '2025',
        month: '12月',
        title: '年度检查报告',
        detail: '血脂略偏高，其余指标总体正常',
        tags: ['PDF', '建议复查血脂'],
      },
      {
        year: '2024',
        month: '11月',
        title: '年度检查报告',
        detail: '总体情况良好，建议持续监测血压',
        tags: ['PDF'],
      },
      {
        year: '2024',
        month: '03月',
        title: '心电图检查',
        detail: '窦性心律，建议定期复查',
        tags: ['检查单'],
      },
    ],
    followups: [
      {
        day: '26',
        month: '05月',
        title: '家庭医生随访',
        detail: '张医生：血压 130/82 较稳定，血脂 LDL 3.8 偏高，建议 2 周内复查血脂四项。',
        tag: '医生记录',
      },
      {
        day: '12',
        month: '05月',
        title: '线上咨询记录',
        detail: '咨询降压药服用时间，医生建议早晨固定时间服用并持续记录血压。',
      },
    ],
    authCode: 'HX-2026-WJG8',
  },
}

export const archiveFolders = {
  normal: [
    { name: '检查报告', count: 1, hint: '最近更新：2025-11-20' },
    { name: '病历资料', count: 1, hint: '最近更新：2026-03-08' },
    { name: '检查单', count: 2, hint: '最近更新：2026-05-02' },
  ],
  member: [
    { name: '检查报告', count: 3, hint: '最近更新：2026-05-15' },
    { name: '病历资料', count: 2, hint: '最近更新：2026-05-18' },
    { name: '检查单', count: 5, hint: '最近更新：2026-06-01' },
  ],
} as const

export const archiveAuthList = [
  { name: '王小乐（儿子）', desc: '可查看全部档案 · 长期授权', status: '已授权', avatar: '乐', tone: 'from-blue-500 to-indigo-500' },
  { name: '张医生（家庭医生）', desc: '可查看+补充档案 · 长期授权', status: '已授权', avatar: '张', tone: 'from-emerald-500 to-teal-500' },
  { name: '李大夫（骨科）', desc: '临时授权 · 就诊只读', status: '剩余18h', avatar: '李', tone: 'from-slate-500 to-slate-600' },
]

export const portraitData = {
  normal: { tags: ['血压记录', '睡眠习惯', '体重管理'], focus: '建议本周完成血压复测，记录后由医生团队查看。' },
  member: { tags: ['高血压管理', '血糖记录', '复查待办'], focus: '6 月 10 日心内科复查，张医生团队已创建提醒。' },
}

/** @deprecated 使用 membershipPlansDetail（membershipBenefits.ts） */
export const membershipPlans = [
  { id: 'basic', name: '单人基础会员', price: '¥2,399/年', rights: [] as string[] },
  { id: 'standard', name: '单人银卡会员', price: '¥3,599/年', rights: [] as string[], hot: true },
  { id: 'family', name: '家庭银卡会员', price: '¥6,699/年', rights: [] as string[] },
]

export const activityCatalog = defaultActivityCatalog.map((item) => ({
  id: item.id,
  name: item.name,
  time: item.time,
  location: item.location,
  joined: item.id === 'a3',
  seats: item.seats,
  points: item.points,
  desc: item.desc,
}))

export const healthReports = [
  { id: 'rep1', title: '5 月月度健康报告', date: '2026-05-28', summary: '血压整体可控，建议加强晚间监测。', doctor: '张医生团队' },
  { id: 'rep2', title: 'Q1 季度健康总结', date: '2026-04-01', summary: '完成首诊建档，个性化干预计划已下发。', doctor: '张医生团队' },
]

export const familyMembers = [
  { id: 'f1', name: '王建国', relation: '父亲', age: 62, authorized: true, status: '有更新', tip: '昨晚有新记录' },
  { id: 'f2', name: '王小乐', relation: '儿子', age: 8, authorized: false, status: '待授权', tip: '开启授权后可查看' },
  { id: 'f3', name: '李静', relation: '配偶', age: 36, authorized: true, status: '有动态', tip: '睡眠记录已更新' },
]

export const pointsHistory = [
  { id: 'ph1', title: '完成血压记录', delta: 12, time: '今天 08:21' },
  { id: 'ph2', title: '报名健康讲座', delta: 15, time: '昨天 16:40' },
  { id: 'ph3', title: '积分兑换礼品', delta: -80, time: '06/01 11:20' },
]

export const mallItems = [
  { id: 'm1', name: '家用电子血压计', points: 800 },
  { id: 'm2', name: '健康礼品包', points: 300 },
  { id: 'm3', name: '复查优惠券 ¥50', points: 200 },
]

export const aiWelcome: Record<Role, string> = {
  normal: '你好，我是小懂。我可以帮你做健康科普、记录数据和功能引导。',
  member: '王叔叔您好，我是小懂。已同步您的会员服务计划，可协助代录指标。',
}

export const STORAGE_KEY = 'fd_miniapp_v2'
