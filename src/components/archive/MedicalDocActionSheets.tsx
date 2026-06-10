import { clsx } from 'clsx'
import { ArrowRightFromLine, Camera, Check, FolderOpen, Image, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  categoryLabel,
  categoryToFolder,
  familyRelationOptions,
  folderToCategory,
  medicalDocInstitutions,
  medicalDocTabs,
  type MedicalDocCategory,
  type MedicalDocItem,
  type MedDocMoveMember,
} from '../../data/medicalDocsData'

function useSheetHost() {
  if (typeof document === 'undefined') return null
  return document.querySelector('.device-content') ?? document.body
}

function useEscape(onClose: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
}

export type UploadMethod = 'image' | 'camera' | 'file'

const uploadMethodOptions: {
  id: UploadMethod
  label: string
  icon: typeof Image
  tone: string
}[] = [
  { id: 'image', label: '上传图片', icon: Image, tone: 'is-purple' },
  { id: 'camera', label: '拍照', icon: Camera, tone: 'is-blue' },
  { id: 'file', label: '上传文件', icon: FolderOpen, tone: 'is-amber' },
]

export function UploadDocOptionsSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (method: UploadMethod) => void
}) {
  useEscape(onClose, open)
  if (!open) return null
  const host = useSheetHost()
  if (!host) return null

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet med-docs-upload-options-sheet" role="dialog" aria-modal="true">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-header">
          <div>
            <p className="allergy-sheet-title">上传资料</p>
          </div>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="allergy-sheet-body">
          <div className="med-docs-upload-tips">
            <p>
              <span className="med-docs-upload-tips-label">支持上传：</span>
              病历、检查单、检查报告
            </p>
            <p>
              <span className="med-docs-upload-tips-label">支持文件：</span>
              图片、pdf
            </p>
            <p className="med-docs-upload-tips-warn">
              <span className="med-docs-upload-tips-label">温馨提示：</span>
              请上传对应档案用户信息的图片或文件
            </p>
          </div>
          <div className="med-docs-upload-methods">
            {uploadMethodOptions.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className="med-docs-upload-method"
                  onClick={() => onSelect(item.id)}
                >
                  <span className={clsx('med-docs-upload-method-icon', item.tone)}>
                    <Icon size={26} strokeWidth={1.75} />
                  </span>
                  <span className="med-docs-upload-method-label">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>,
    host,
  )
}

export function UploadDocCategorySheet({
  open,
  category,
  method,
  onClose,
  onUpload,
}: {
  open: boolean
  category: MedicalDocCategory
  method: UploadMethod
  onClose: () => void
  onUpload: (folder: string, method: UploadMethod) => void
}) {
  const [folder, setFolder] = useState(categoryToFolder(category))
  const methodLabel = uploadMethodOptions.find((m) => m.id === method)?.label ?? '上传'

  useEffect(() => {
    if (open) setFolder(categoryToFolder(category))
  }, [open, category])

  useEscape(onClose, open)
  if (!open) return null
  const host = useSheetHost()
  if (!host) return null

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet" role="dialog" aria-modal="true">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-header">
          <div>
            <p className="allergy-sheet-title">{methodLabel}</p>
            <p className="allergy-sheet-subtitle">选择资料分类后完成模拟上传</p>
          </div>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="allergy-sheet-body">
          <div className="allergy-sheet-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
            <p className="family-sheet-label">资料分类</p>
            <select
              className="allergy-sheet-input mb-3"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            >
              {medicalDocTabs.map((tab) => (
                <option key={tab.id} value={categoryToFolder(tab.category)}>
                  {tab.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onUpload(folder, method)}
              className="allergy-sheet-submit"
            >
              确认上传
            </button>
          </div>
        </div>
      </div>
    </div>,
    host,
  )
}

export function DocMoreMenu({
  open,
  onClose,
  onEdit,
  onMove,
  onDelete,
}: {
  open: boolean
  onClose: () => void
  onEdit: () => void
  onMove: () => void
  onDelete: () => void
}) {
  useEscape(onClose, open)
  if (!open) return null
  const host = useSheetHost()
  if (!host) return null

  return createPortal(
    <>
      <button type="button" className="med-docs-menu-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="med-docs-action-menu" role="menu">
        <button type="button" className="med-docs-action-item" onClick={onEdit}>
          <Pencil size={18} />
          编辑
        </button>
        <button type="button" className="med-docs-action-item" onClick={onMove}>
          <ArrowRightFromLine size={18} />
          移出
        </button>
        <button type="button" className="med-docs-action-item is-danger" onClick={onDelete}>
          <Trash2 size={18} />
          删除
        </button>
      </div>
    </>,
    host,
  )
}

export function EditMedicalDocSheet({
  open,
  doc,
  onClose,
  onSave,
}: {
  open: boolean
  doc: MedicalDocItem | null
  onClose: () => void
  onSave: (doc: MedicalDocItem) => void
}) {
  const [category, setCategory] = useState<MedicalDocCategory>('检查报告')
  const [title, setTitle] = useState('')
  const [reportDate, setReportDate] = useState('')
  const [institution, setInstitution] = useState<string>(medicalDocInstitutions[0])
  const [interpreted, setInterpreted] = useState(false)

  useEffect(() => {
    if (!open || !doc) return
    setCategory(doc.category)
    setTitle(doc.title)
    setReportDate(doc.reportDate)
    setInstitution(doc.institution)
    setInterpreted(doc.interpreted)
  }, [open, doc])

  useEscape(onClose, open)
  if (!open || !doc) return null
  const host = useSheetHost()
  if (!host) return null

  const tabLabel = medicalDocTabs.find((t) => t.category === category)?.label ?? category

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet med-docs-edit-sheet" role="dialog" aria-modal="true">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-header">
          <div>
            <p className="allergy-sheet-title">编辑资料</p>
            <p className="allergy-sheet-subtitle">修改报告信息（Demo 不上传真实文件）</p>
          </div>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="allergy-sheet-body">
          <div className="med-docs-edit-preview">
            <div className="med-docs-edit-type">
              <span className="med-docs-edit-type-label">资料类型</span>
              <select
                className="med-docs-edit-type-value"
                value={category}
                onChange={(e) => setCategory(e.target.value as MedicalDocCategory)}
              >
                {medicalDocTabs.map((tab) => (
                  <option key={tab.id} value={tab.category}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="med-docs-edit-thumb-row">
              <div className="med-docs-thumb med-docs-thumb-sm">
                <span className="med-docs-file-badge">{doc.fileType}</span>
                <div className="med-docs-thumb-inner">
                  <span className="med-docs-thumb-icon">📄</span>
                </div>
              </div>
              {interpreted && (
                <span className="med-docs-status is-done">
                  <Check size={14} />
                  已解读
                </span>
              )}
            </div>
            <div className="med-docs-edit-large-preview">
              <span className="med-docs-preview-tag">{tabLabel}</span>
              <span className="med-docs-file-badge">{doc.fileType}</span>
              <span className="med-docs-preview-pdf">PDF</span>
            </div>
          </div>
          <div className="med-docs-form-list">
            <label className="med-docs-form-row">
              <span>报告名称</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="med-docs-form-row">
              <span>报告时间</span>
              <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
            </label>
            <label className="med-docs-form-row">
              <span>检查机构</span>
              <select value={institution} onChange={(e) => setInstitution(e.target.value)}>
                {medicalDocInstitutions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="med-docs-form-check">
              <input
                type="checkbox"
                checked={interpreted}
                onChange={(e) => setInterpreted(e.target.checked)}
              />
              标记为已解读
            </label>
          </div>
          <button
            type="button"
            className="allergy-sheet-submit"
            disabled={!title.trim() || !reportDate}
            onClick={() =>
              onSave({
                ...doc,
                category,
                title: title.trim(),
                reportDate,
                institution,
                interpreted,
              })
            }
          >
            确定
          </button>
        </div>
      </div>
    </div>,
    host,
  )
}

export function MoveMedicalDocSheet({
  open,
  doc,
  members,
  onClose,
  onConfirm,
  onAddMember,
}: {
  open: boolean
  doc: MedicalDocItem | null
  members: MedDocMoveMember[]
  onClose: () => void
  onConfirm: (member: MedDocMoveMember) => void
  onAddMember: () => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (open) setSelectedId(members[0]?.id ?? null)
  }, [open, members])

  useEscape(onClose, open)
  if (!open || !doc) return null
  const host = useSheetHost()
  if (!host) return null

  const selected = members.find((m) => m.id === selectedId)

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet" role="dialog" aria-modal="true">
        <div className="allergy-sheet-handle" />
        <div className="med-docs-move-header">
          <button type="button" className="med-docs-move-add" onClick={onAddMember}>
            添加
          </button>
          <p className="med-docs-move-title">选择移入成员</p>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <p className="med-docs-move-hint">
          {categoryLabel(doc.category)}移出后相关联的健康数据将清除
        </p>
        <div className="allergy-sheet-body">
          <div className="med-docs-member-list">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                className={clsx('med-docs-member-row', selectedId === m.id && 'is-selected')}
                onClick={() => setSelectedId(m.id)}
              >
                <span className="med-docs-member-avatar">{m.name.charAt(0)}</span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="med-docs-member-name">
                    {m.name} <span className="med-docs-member-rel">{m.relation}</span>
                  </p>
                  <p className="med-docs-member-age">{m.age}岁</p>
                </div>
              </button>
            ))}
          </div>
          <div className="med-docs-move-actions">
            <button type="button" className="med-docs-move-cancel" onClick={onClose}>
              取消
            </button>
            <button
              type="button"
              className="med-docs-move-confirm"
              disabled={!selected}
              onClick={() => selected && onConfirm(selected)}
            >
              移出
            </button>
          </div>
        </div>
      </div>
    </div>,
    host,
  )
}

export function AddFamilyMemberSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (member: MedDocMoveMember) => void
}) {
  const navigate = useNavigate()
  const [relation, setRelation] = useState<string>('爸爸')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('未设置')
  const [birth, setBirth] = useState('')

  useEffect(() => {
    if (!open) {
      setRelation('爸爸')
      setName('')
      setGender('未设置')
      setBirth('')
    }
  }, [open])

  useEscape(onClose, open)
  if (!open) return null
  const host = useSheetHost()
  if (!host) return null

  const handleSave = () => {
    if (!name.trim()) return
    const age = birth
      ? Math.max(1, new Date().getFullYear() - new Date(birth).getFullYear())
      : 30
    onSave({
      id: `mv-${Date.now()}`,
      name: name.trim(),
      relation,
      age,
    })
  }

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="allergy-sheet med-docs-add-member-sheet" role="dialog" aria-modal="true">
        <div className="allergy-sheet-handle" />
        <div className="allergy-sheet-header">
          <div>
            <p className="allergy-sheet-title">添加家庭成员</p>
          </div>
          <button type="button" onClick={onClose} className="allergy-sheet-close" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="allergy-sheet-body">
          <div className="med-docs-invite-banner">
            <div>
              <p className="med-docs-invite-title">邀请家人共享档案</p>
              <p className="med-docs-invite-desc">健康档案共同管理，预警接收</p>
            </div>
            <button
              type="button"
              className="med-docs-invite-btn"
              onClick={() => {
                onClose()
                navigate('/family/add')
              }}
            >
              去邀请
            </button>
          </div>
          <p className="family-sheet-label">成员关系 *</p>
          <div className="med-docs-relation-grid">
            {familyRelationOptions.map((rel) => (
              <button
                key={rel}
                type="button"
                className={clsx('med-docs-relation-btn', relation === rel && 'is-active')}
                onClick={() => setRelation(rel)}
              >
                {rel}
              </button>
            ))}
          </div>
          <div className="med-docs-form-list mt-3">
            <label className="med-docs-form-row">
              <span>姓名 *</span>
              <input
                placeholder="请输入家庭成员姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="med-docs-form-row">
              <span>性别 *</span>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="未设置">未设置</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </label>
            <label className="med-docs-form-row">
              <span>出生日期 *</span>
              <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
            </label>
          </div>
          <button
            type="button"
            className="allergy-sheet-submit"
            disabled={!name.trim()}
            onClick={handleSave}
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    host,
  )
}

export function DeleteMedicalDocDialog({
  open,
  doc,
  onClose,
  onConfirm,
}: {
  open: boolean
  doc: MedicalDocItem | null
  onClose: () => void
  onConfirm: () => void
}) {
  useEscape(onClose, open)
  if (!open || !doc) return null
  const host = useSheetHost()
  if (!host) return null

  const label = categoryLabel(doc.category)

  return createPortal(
    <div className="allergy-sheet-root">
      <button type="button" className="allergy-sheet-backdrop" aria-label="关闭" onClick={onClose} />
      <div className="med-docs-delete-dialog" role="alertdialog" aria-modal="true">
        <p className="med-docs-delete-title">删除{label}</p>
        <p className="med-docs-delete-desc">
          确定删除{doc.title}，删除后{label}关联的健康数据将一并删除
        </p>
        <div className="med-docs-delete-actions">
          <button type="button" className="med-docs-delete-cancel" onClick={onClose}>
            取消
          </button>
          <button type="button" className="med-docs-delete-confirm" onClick={onConfirm}>
            删除
          </button>
        </div>
      </div>
    </div>,
    host,
  )
}

export function buildMedicalDocFromUpload(
  folder: string,
  method: UploadMethod = 'file',
): MedicalDocItem {
  const stamp = new Date()
  const suffix = `${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, '0')}${String(stamp.getDate()).padStart(2, '0')}`
  const iso = `${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(2, '0')}-${String(stamp.getDate()).padStart(2, '0')}`
  const category = folderToCategory(folder)
  const title =
    folder === '检查报告'
      ? `检查报告-${suffix}`
      : method === 'camera'
        ? `拍照资料-${suffix}`
        : method === 'image'
          ? `图片资料-${suffix}`
          : `上传资料-${stamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`

  return {
    id: `doc-${Date.now()}`,
    category,
    title,
    reportDate: iso,
    uploadDate: iso,
    institution: medicalDocInstitutions[0],
    interpreted: false,
    fileType: method === 'file' ? 'PDF' : 'IMG',
  }
}
