import type { Role } from './mockData'

export type MedicalDocCategory = '检查报告' | '检查单' | '病历资料' | '文件夹' | '其他'

export type MedicalDocItem = {
  id: string
  category: MedicalDocCategory
  title: string
  reportDate: string
  uploadDate: string
  institution: string
  interpreted: boolean
  fileType: 'PDF' | 'IMG'
}

export const medicalDocTabs = [
  { id: 'exam', label: '检查报告', category: '检查报告' as MedicalDocCategory },
  { id: 'sheet', label: '检查单', category: '检查单' as MedicalDocCategory },
  { id: 'record', label: '病历', category: '病历资料' as MedicalDocCategory },
  { id: 'folder', label: '文件夹', category: '文件夹' as MedicalDocCategory },
  { id: 'other', label: '其他', category: '其他' as MedicalDocCategory },
] as const

export type MedicalDocTabId = (typeof medicalDocTabs)[number]['id']

export const medicalDocInstitutions = ['和谐医疗', '市第一人民医院', '社区健康中心'] as const

export type MedDocMoveMember = {
  id: string
  name: string
  relation: string
  age: number
}

export const defaultMedDocMoveMembers: MedDocMoveMember[] = [
  { id: 'mv1', name: '测试 1', relation: '爸爸', age: 55 },
  { id: 'mv2', name: '王晓苑', relation: '其他', age: 27 },
]

export const familyRelationOptions = ['爸爸', '妈妈', '老公', '老婆', '儿子', '女儿', '其他'] as const

export function categoryLabel(category: MedicalDocCategory) {
  if (category === '病历资料') return '病历'
  return category
}

export const baseMedicalDocs: Record<Role, MedicalDocItem[]> = {
  normal: [
    {
      id: 'doc-n1',
      category: '检查报告',
      title: '检查报告-20251120',
      reportDate: '2025-11-20',
      uploadDate: '2025-11-21',
      institution: '和谐医疗',
      interpreted: true,
      fileType: 'PDF',
    },
    {
      id: 'doc-n2',
      category: '检查单',
      title: '血常规检查单',
      reportDate: '2026-05-02',
      uploadDate: '2026-05-02',
      institution: '社区健康中心',
      interpreted: false,
      fileType: 'PDF',
    },
  ],
  member: [
    {
      id: 'doc-m1',
      category: '检查报告',
      title: '检查报告-20260608',
      reportDate: '2026-06-09',
      uploadDate: '2026-06-09',
      institution: '和谐医疗',
      interpreted: true,
      fileType: 'PDF',
    },
    {
      id: 'doc-m2',
      category: '检查报告',
      title: '检查报告-20260405',
      reportDate: '2026-04-06',
      uploadDate: '2026-04-06',
      institution: '和谐医疗',
      interpreted: true,
      fileType: 'PDF',
    },
    {
      id: 'doc-m3',
      category: '检查报告',
      title: '检查报告-20260211',
      reportDate: '2026-02-12',
      uploadDate: '2026-02-12',
      institution: '和谐医疗',
      interpreted: false,
      fileType: 'PDF',
    },
    {
      id: 'doc-m4',
      category: '检查单',
      title: '心电图检查单-20260518',
      reportDate: '2026-05-18',
      uploadDate: '2026-05-19',
      institution: '市第一人民医院',
      interpreted: true,
      fileType: 'PDF',
    },
    {
      id: 'doc-m5',
      category: '检查单',
      title: '血脂四项检查单',
      reportDate: '2026-06-01',
      uploadDate: '2026-06-01',
      institution: '和谐医疗',
      interpreted: false,
      fileType: 'PDF',
    },
    {
      id: 'doc-m6',
      category: '病历资料',
      title: '心内科门诊病历',
      reportDate: '2026-05-18',
      uploadDate: '2026-05-18',
      institution: '市第一人民医院',
      interpreted: true,
      fileType: 'PDF',
    },
    {
      id: 'doc-m7',
      category: '病历资料',
      title: '高血压随访记录',
      reportDate: '2026-04-22',
      uploadDate: '2026-04-22',
      institution: '和谐医疗',
      interpreted: true,
      fileType: 'PDF',
    },
  ],
}

export function folderToCategory(folder: string): MedicalDocCategory {
  if (folder === '病历资料') return '病历资料'
  if (folder === '体检报告') return '检查报告'
  if (folder === '检查报告' || folder === '检查单' || folder === '文件夹' || folder === '其他') {
    return folder
  }
  return '其他'
}

export function categoryToFolder(category: MedicalDocCategory): string {
  return category
}
