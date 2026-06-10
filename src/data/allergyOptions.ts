export const drugAllergenOptions = [
  '头孢菌素类',
  '青霉素',
  '阿司匹林',
  '磺胺类',
  '破伤风抗毒素',
  '中成药注射液',
  '链霉素类',
  '红霉素',
  '对乙酰氨基酚',
  '布洛芬',
  '乙肝疫苗',
  '其他',
] as const

export const nonDrugAllergenOptions = [
  '尘螨',
  '花粉',
  '化妆品',
  '豆制品',
  '牛奶',
  '海鲜',
  '坚果',
  '洗洁剂',
  '酒精',
  '其他',
] as const

export const ALLERGY_OTHER = '其他'

/** 预设项默认反应说明（可编辑） */
export const allergenDefaultReactions: Record<string, string> = {
  青霉素: '皮疹、呼吸不适，就诊前请告知医生',
  头孢菌素类: '可能出现皮疹或胃肠道反应',
  阿司匹林: '可能引起哮喘或皮疹',
  磺胺类: '皮疹、发热等过敏反应',
  海鲜: '皮肤瘙痒，建议避免过量摄入',
  虾蟹类: '皮肤瘙痒，建议避免过量摄入',
  牛奶: '腹胀、皮疹等不适',
  坚果: '可能出现口周肿胀或呼吸困难',
  花粉: '打喷嚏、流涕等季节性症状',
  尘螨: '鼻塞、咳嗽等环境过敏表现',
}

export function guessSeverity(name: string): string {
  if (name === '青霉素' || name === '头孢菌素类') return '严重'
  if (['海鲜', '虾蟹类', '坚果', '破伤风抗毒素'].includes(name)) return '中度'
  return '轻度'
}
