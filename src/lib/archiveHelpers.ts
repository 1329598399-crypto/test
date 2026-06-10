import {
  archiveFolders,
  archiveProfileData,
  type ArchiveProfileData,
  type Role,
} from '../data/mockData'
import { sortPastHistory, type PastHistoryItem } from '../data/pastHistoryOptions'
import type { FamilyHistoryItem } from '../data/familyHistoryOptions'

export type DeptId =
  | 'full'
  | 'cardiology'
  | 'endocrinology'
  | 'neurology'
  | 'orthopedics'
  | 'gastroenterology'

export type ReportHistoryEntry = {
  id: string
  dept: DeptId
  deptName: string
  generatedAt: string
  code: string
}

export type ArchiveBasicOverride = {
  emergencyContact?: string
  emergencyPhone?: string
  ethnicity?: string
  height?: string
  weight?: string
}

export type ArchiveDocItem = {
  id: string
  folder: string
  name: string
  date: string
}

export function formatSyncNow() {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 档案 Hub 折叠区内各模块默认最多预览条数，超出显示「查看全部」 */
export const ARCHIVE_HUB_PREVIEW_LIMIT = 3

export function previewHubItems<T>(items: T[], limit = ARCHIVE_HUB_PREVIEW_LIMIT) {
  const total = items.length
  return {
    visible: items.slice(0, limit),
    total,
    hasMore: total > limit,
  }
}

export type ArchiveMergeInput = {
  archiveSyncAt: Partial<Record<Role, string>>
  archiveBasics: Partial<Record<Role, ArchiveBasicOverride>>
  archiveExtraAllergies: Partial<
    Record<Role, { name: string; severity: string; reaction: string }[]>
  >
  archiveExtraPastHistory: Partial<Record<Role, PastHistoryItem[]>>
  archiveExtraFamilyHistory: Partial<Record<Role, FamilyHistoryItem[]>>
}

export function getMergedArchiveProfile(
  role: Role,
  slice: ArchiveMergeInput,
): ArchiveProfileData {
  const base = archiveProfileData[role]
  const basicOverride = slice.archiveBasics[role] ?? {}
  const syncAt = slice.archiveSyncAt[role] ?? base.syncAt
  const height = basicOverride.height ?? base.medId.height
  const weight = basicOverride.weight ?? base.medId.weight

  return {
    ...base,
    syncAt,
    basic: { ...base.basic, ...basicOverride },
    medId: { ...base.medId, height, weight },
    allergies: [...base.allergies, ...(slice.archiveExtraAllergies[role] ?? [])],
    pastHistory: sortPastHistory([
      ...base.pastHistory.map((p, i) => ({
        id: `base-past-${i}`,
        ...p,
      })),
      ...(slice.archiveExtraPastHistory[role] ?? []),
    ]),
    familyHistory: [
      ...base.familyHistory,
      ...(slice.archiveExtraFamilyHistory[role] ?? []).map(({ title, detail }) => ({
        title,
        detail,
      })),
    ],
  }
}

export function getFolderRows(role: Role, extraDocs: ArchiveDocItem[]) {
  const base = archiveFolders[role]
  const counts = extraDocs.reduce<Record<string, number>>((acc, d) => {
    acc[d.folder] = (acc[d.folder] ?? 0) + 1
    return acc
  }, {})

  return base.map((row) => ({
    ...row,
    count: row.count + (counts[row.name] ?? 0),
    hint:
      extraDocs.find((d) => d.folder === row.name)?.date
        ? `最近更新：${extraDocs.find((d) => d.folder === row.name)?.date}`
        : row.hint,
  }))
}
