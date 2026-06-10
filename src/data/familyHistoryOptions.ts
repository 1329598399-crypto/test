export const FAMILY_HISTORY_OTHER = '其他'

export type FamilyHistoryItem = {
  id?: string
  relation: string
  condition: string
  title: string
  detail: string
}

export const familyRelationOptions = [
  '父亲',
  '母亲',
  '祖父',
  '祖母',
  '外祖父',
  '外祖母',
  '兄长',
  '姐妹',
  '其他',
] as const

export const familyHistoryCategories = [
  {
    id: 'chronic',
    label: '慢性疾病',
    options: ['高血压', '糖尿病', '高血脂', '慢阻肺', '痛风', '其他'],
  },
  {
    id: 'cardio',
    label: '心脑血管',
    options: ['冠心病', '脑卒中', '脑血管病', '心律失常', '其他'],
  },
  {
    id: 'tumor',
    label: '肿瘤相关',
    options: ['肺癌', '胃癌', '乳腺癌', '结肠癌', '甲状腺癌', '其他'],
  },
  {
    id: 'common',
    label: '其他常见',
    options: ['甲状腺疾病', '精神疾病', '哮喘', '肝病', '其他'],
  },
] as const

export const familyHistoryDefaults: Record<string, string> = {
  高血压: '长期服药控制，建议关注血压监测。',
  糖尿病: '需关注血糖变化，建议定期筛查。',
  高血脂: '建议关注血脂水平，必要时复查。',
  慢阻肺: '长期吸烟或环境暴露相关，注意呼吸症状。',
  痛风: '建议低嘌呤饮食，关注尿酸水平。',
  冠心病: '曾有心绞痛或支架治疗史，需关注心血管风险。',
  脑卒中: '曾发生脑血管事件，需关注血压与血脂。',
  脑血管病: '曾发生短暂性脑缺血或相关事件。',
  心律失常: '需关注心悸等症状，必要时专科随访。',
  肺癌: '已治疗或观察中，建议定期复查。',
  胃癌: '已治疗或术后随访中。',
  乳腺癌: '已治疗或术后随访中。',
  结肠癌: '已治疗或术后随访中。',
  甲状腺癌: '术后或观察随访中。',
  甲状腺疾病: '结节或功能异常，建议定期复查。',
  精神疾病: '曾有情绪或精神方面问题，需关注心理健康。',
  哮喘: '可能有过敏性或环境诱发因素。',
  肝病: '曾有肝炎或肝功能异常，建议定期复查。',
}

export function buildFamilyTitle(relation: string, condition: string) {
  return `${relation} · ${condition}`
}

export function familyHistoryKey(item: Pick<FamilyHistoryItem, 'relation' | 'condition'>) {
  return `${item.relation}-${item.condition}`
}

/** 从已有档案 title 推断 relation/condition（兼容 mock 两种写法） */
export function parseFamilyTitle(title: string): { relation: string; condition: string } {
  if (title.includes(' · ')) {
    const [relation, condition] = title.split(' · ')
    return { relation: relation.trim(), condition: condition.trim() }
  }
  for (const rel of familyRelationOptions) {
    if (title.startsWith(rel)) {
      return { relation: rel, condition: title.slice(rel.length).trim() || title }
    }
  }
  return { relation: '其他', condition: title }
}
