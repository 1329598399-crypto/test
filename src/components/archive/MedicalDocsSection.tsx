import { clsx } from 'clsx'
import { Check, Menu, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AddFamilyMemberFlow } from '../family/AddFamilyMemberFlow'
import {
  buildMedicalDocFromUpload,
  DeleteMedicalDocDialog,
  DocMoreMenu,
  EditMedicalDocSheet,
  MoveMedicalDocSheet,
  UploadDocCategorySheet,
  UploadDocOptionsSheet,
  type UploadMethod,
} from './MedicalDocActionSheets'
import {
  medicalDocTabs,
  type MedicalDocItem,
  type MedicalDocTabId,
} from '../../data/medicalDocsData'
import {
  filterMedicalDocs,
  getMergedMedicalDocs,
  groupMedicalDocsByMonth,
  mapUploadedDoc,
} from '../../lib/medicalDocsHelpers'
import type { Role } from '../../data/mockData'
import { useAppStore } from '../../store/useAppStore'

export function MedicalDocsSection({ role }: { role: Role }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as MedicalDocTabId) || 'exam'
  const activeTab = medicalDocTabs.find((t) => t.id === tab) ?? medicalDocTabs[0]

  const archiveDocs = useAppStore((s) => s.archiveDocs)
  const medicalDocExtras = useAppStore((s) => s.medicalDocExtras)
  const medicalDocOverrides = useAppStore((s) => s.medicalDocOverrides)
  const deletedMedicalDocIds = useAppStore((s) => s.deletedMedicalDocIds)
  const medDocMoveMembers = useAppStore((s) => s.medDocMoveMembers)
  const addArchiveDoc = useAppStore((s) => s.addArchiveDoc)
  const addMedicalDoc = useAppStore((s) => s.addMedicalDoc)
  const updateMedicalDoc = useAppStore((s) => s.updateMedicalDoc)
  const deleteMedicalDoc = useAppStore((s) => s.deleteMedicalDoc)
  const touchArchiveSync = useAppStore((s) => s.touchArchiveSync)
  const showToast = useAppStore((s) => s.showToast)
  const isMember = role === 'member'

  const [uploadOptionsOpen, setUploadOptionsOpen] = useState(false)
  const [uploadCategoryOpen, setUploadCategoryOpen] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('file')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDoc, setActiveDoc] = useState<MedicalDocItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const docSlice = useMemo(() => {
    const legacyExtras = archiveDocs
      .map(mapUploadedDoc)
      .filter((d) => !medicalDocExtras.some((e) => e.id === d.id))
    return {
      extras: [...medicalDocExtras, ...legacyExtras],
      overrides: medicalDocOverrides,
      deletedIds: deletedMedicalDocIds,
    }
  }, [archiveDocs, medicalDocExtras, medicalDocOverrides, deletedMedicalDocIds])

  const allDocs = useMemo(() => getMergedMedicalDocs(role, docSlice), [role, docSlice])
  const filtered = useMemo(
    () => filterMedicalDocs(allDocs, activeTab.category),
    [allDocs, activeTab.category],
  )
  const grouped = useMemo(() => groupMedicalDocsByMonth(filtered), [filtered])

  const closeMenu = () => {
    setMenuOpen(false)
    setActiveDoc(null)
  }

  const openMenu = (doc: MedicalDocItem) => {
    setActiveDoc(doc)
    setMenuOpen(true)
  }

  const handleUpload = (folder: string, method: UploadMethod) => {
    const doc = buildMedicalDocFromUpload(folder, method)
    addMedicalDoc(doc)
    addArchiveDoc(folder, doc.title)
    touchArchiveSync(role)
    showToast(`已通过${method === 'camera' ? '拍照' : method === 'image' ? '图片' : '文件'}上传至「${folder}」`)
    setUploadCategoryOpen(false)
    setUploadOptionsOpen(false)
  }

  const openUploadFlow = () => setUploadOptionsOpen(true)

  const handleSelectUploadMethod = (method: UploadMethod) => {
    setUploadMethod(method)
    setUploadOptionsOpen(false)
    setUploadCategoryOpen(true)
  }

  const handleEditSave = (doc: MedicalDocItem) => {
    updateMedicalDoc(doc)
    touchArchiveSync(role)
    showToast('资料已更新')
    setEditOpen(false)
    setActiveDoc(null)
  }

  const handleMoveConfirm = (member: { name: string }) => {
    if (!activeDoc) return
    deleteMedicalDoc(activeDoc.id)
    touchArchiveSync(role)
    showToast(`已移出至 ${member.name} 的档案`)
    setMoveOpen(false)
    setActiveDoc(null)
  }

  const handleDeleteConfirm = () => {
    if (!activeDoc) return
    deleteMedicalDoc(activeDoc.id)
    touchArchiveSync(role)
    showToast('资料已删除')
    setDeleteOpen(false)
    setActiveDoc(null)
  }

  return (
    <div className={clsx('med-docs-page', isMember && 'has-fab')}>
      <div className="med-docs-tabs">
        {medicalDocTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setParams({ tab: t.id }, { replace: true, state: location.state })}
            className={clsx('med-docs-tab', tab === t.id && 'is-active')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="med-docs-body">
        {!isMember && (
          <div className="med-docs-member-tip">
            <p>完整资料管理与报告解读为会员能力</p>
            <button type="button" onClick={() => navigate('/membership')}>
              开通会员
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="med-docs-empty">
            <p>暂无{activeTab.label}资料</p>
            {isMember && (
              <button type="button" onClick={openUploadFlow}>
                上传第一份资料
              </button>
            )}
          </div>
        ) : (
          grouped.map((group) => (
            <section key={group.label} className="med-docs-group">
              <h3 className="med-docs-group-title">{group.label}</h3>
              <div className="med-docs-card-list">
                {group.items.map((doc) => (
                  <article key={doc.id} className="med-docs-card">
                    <div className="med-docs-card-head">
                      <p className="med-docs-card-title">{doc.title}</p>
                      {isMember && (
                        <button
                          type="button"
                          className="med-docs-card-menu"
                          aria-label="更多操作"
                          onClick={() => openMenu(doc)}
                        >
                          <Menu size={18} />
                        </button>
                      )}
                    </div>
                    <div className="med-docs-card-main">
                      <div className="med-docs-thumb">
                        <span className="med-docs-file-badge">{doc.fileType}</span>
                        <div className="med-docs-thumb-inner">
                          <span className="med-docs-thumb-icon">📄</span>
                          <span className="med-docs-thumb-name">{doc.title}</span>
                        </div>
                      </div>
                      <div className="med-docs-meta">
                        <p className="med-docs-meta-row">
                          <span className="med-docs-meta-label">报告时间</span>
                          <span>{doc.reportDate}</span>
                        </p>
                        <p className="med-docs-meta-row">
                          <span className="med-docs-meta-label">检查机构</span>
                          <span>{doc.institution}</span>
                        </p>
                      </div>
                    </div>
                    <div className="med-docs-card-foot">
                      <span className="med-docs-upload-time">上传时间：{doc.uploadDate}</span>
                      <div className="med-docs-foot-actions">
                        {doc.interpreted ? (
                          <span className="med-docs-status is-done">
                            <Check size={14} />
                            已解读
                          </span>
                        ) : (
                          <span className="med-docs-status is-pending">待解读</span>
                        )}
                        <button
                          type="button"
                          className="med-docs-view-btn"
                          onClick={() => showToast(`查看报告：${doc.title}（Demo）`)}
                        >
                          看报告 ›
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {isMember && (
        <>
          {typeof document !== 'undefined' &&
            createPortal(
              <button
                type="button"
                className="med-docs-fab"
                aria-label="上传资料"
                onClick={openUploadFlow}
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>,
              document.querySelector('.device-content') ?? document.body,
            )}
          <UploadDocOptionsSheet
            open={uploadOptionsOpen}
            onClose={() => setUploadOptionsOpen(false)}
            onSelect={handleSelectUploadMethod}
          />
          <UploadDocCategorySheet
            open={uploadCategoryOpen}
            category={activeTab.category}
            method={uploadMethod}
            onClose={() => setUploadCategoryOpen(false)}
            onUpload={handleUpload}
          />
          <DocMoreMenu
            open={menuOpen}
            onClose={closeMenu}
            onEdit={() => {
              setMenuOpen(false)
              setEditOpen(true)
            }}
            onMove={() => {
              setMenuOpen(false)
              setMoveOpen(true)
            }}
            onDelete={() => {
              setMenuOpen(false)
              setDeleteOpen(true)
            }}
          />
          <EditMedicalDocSheet
            open={editOpen}
            doc={activeDoc}
            onClose={() => {
              setEditOpen(false)
              setActiveDoc(null)
            }}
            onSave={handleEditSave}
          />
          <MoveMedicalDocSheet
            open={moveOpen}
            doc={activeDoc}
            members={medDocMoveMembers}
            onClose={() => {
              setMoveOpen(false)
              setActiveDoc(null)
            }}
            onConfirm={handleMoveConfirm}
            onAddMember={() => setAddMemberOpen(true)}
          />
          <AddFamilyMemberFlow
            open={addMemberOpen}
            onClose={() => setAddMemberOpen(false)}
          />
          <DeleteMedicalDocDialog
            open={deleteOpen}
            doc={activeDoc}
            onClose={() => {
              setDeleteOpen(false)
              setActiveDoc(null)
            }}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  )
}

/** @deprecated use MedicalDocsSection */
export const DocsSection = MedicalDocsSection
