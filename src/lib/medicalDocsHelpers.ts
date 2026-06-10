import type { ArchiveDocItem } from './archiveHelpers'
import {
  baseMedicalDocs,
  folderToCategory,
  type MedicalDocCategory,
  type MedicalDocItem,
} from '../data/medicalDocsData'
import type { Role } from '../data/mockData'

export type MedicalDocSlice = {
  extras: MedicalDocItem[]
  overrides: Record<string, MedicalDocItem>
  deletedIds: string[]
}

export function mapUploadedDoc(doc: ArchiveDocItem): MedicalDocItem {
  const now = new Date()
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return {
    id: doc.id,
    category: folderToCategory(doc.folder),
    title: doc.name,
    reportDate: iso,
    uploadDate: iso,
    institution: '和谐医疗',
    interpreted: false,
    fileType: 'PDF',
  }
}

export function getMergedMedicalDocs(role: Role, slice: MedicalDocSlice): MedicalDocItem[] {
  const deleted = new Set(slice.deletedIds)
  const seen = new Set<string>()
  const merged: MedicalDocItem[] = []

  const push = (doc: MedicalDocItem) => {
    if (deleted.has(doc.id) || seen.has(doc.id)) return
    seen.add(doc.id)
    merged.push(slice.overrides[doc.id] ?? doc)
  }

  for (const doc of slice.extras) push(doc)
  for (const doc of baseMedicalDocs[role]) push(doc)

  return merged.sort(
    (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime(),
  )
}

/** @deprecated use MedicalDocSlice */
export function getMergedMedicalDocsLegacy(role: Role, extraDocs: ArchiveDocItem[]) {
  return getMergedMedicalDocs(role, {
    extras: extraDocs.map(mapUploadedDoc),
    overrides: {},
    deletedIds: [],
  })
}

export function filterMedicalDocs(docs: MedicalDocItem[], category: MedicalDocCategory) {
  return docs.filter((d) => d.category === category)
}

export function groupMedicalDocsByMonth(docs: MedicalDocItem[]) {
  const groups = new Map<string, MedicalDocItem[]>()

  for (const doc of docs) {
    const date = new Date(doc.reportDate)
    const key = Number.isNaN(date.getTime())
      ? '未知日期'
      : `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`
    const list = groups.get(key) ?? []
    list.push(doc)
    groups.set(key, list)
  }

  return [...groups.entries()]
    .sort((a, b) => {
      if (a[0] === '未知日期') return 1
      if (b[0] === '未知日期') return -1
      const parse = (label: string) => {
        const match = label.match(/(\d{4})年(\d{2})月/)
        if (!match) return 0
        return Number(match[1]) * 100 + Number(match[2])
      }
      return parse(b[0]) - parse(a[0])
    })
    .map(([label, items]) => ({ label, items }))
}

export function countMedicalDocsByCategory(docs: MedicalDocItem[]) {
  return docs.reduce<Record<MedicalDocCategory, number>>(
    (acc, doc) => {
      acc[doc.category] = (acc[doc.category] ?? 0) + 1
      return acc
    },
    {
      检查报告: 0,
      检查单: 0,
      病历资料: 0,
      文件夹: 0,
      其他: 0,
    },
  )
}
