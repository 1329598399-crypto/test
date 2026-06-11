import { ChevronRight, ClipboardList, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function HomeRecordDual() {
  const navigate = useNavigate()

  return (
    <section className="home-bw-block home-record-dual">
      <div className="home-bw-block-head">
        <h2 className="home-bw-block-title">健康记录</h2>
        <p className="home-bw-block-sub">生活打卡与医疗档案</p>
      </div>
      <div className="home-record-dual-grid">
        <button type="button" className="home-record-dual-btn" onClick={() => navigate('/records')}>
          <span className="home-record-dual-icon" aria-hidden>
            <ClipboardList size={22} strokeWidth={1.8} />
          </span>
          <span className="home-record-dual-label">生活记录</span>
          <span className="home-record-dual-hint">饮食 · 运动 · 指标打卡</span>
          <ChevronRight size={16} className="home-record-dual-arrow" />
        </button>
        <button
          type="button"
          className="home-record-dual-btn"
          onClick={() => navigate('/profile/medical')}
        >
          <span className="home-record-dual-icon" aria-hidden>
            <Stethoscope size={22} strokeWidth={1.8} />
          </span>
          <span className="home-record-dual-label">医疗记录</span>
          <span className="home-record-dual-hint">用药 · 过敏史 · 既往史</span>
          <ChevronRight size={16} className="home-record-dual-arrow" />
        </button>
      </div>
    </section>
  )
}
