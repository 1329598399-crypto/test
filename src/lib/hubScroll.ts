/** 档案 Hub 区块 id 前缀，与 ArchivePage 中 section 元素 id 对应 */
export const hubSectionElementId = (key: string) => `archive-section-${key}`

const HUB_RETURN_KEY = 'fd_hub_return_section'
const HUB_SCROLL_TOP_KEY = 'fd_hub_scroll_top'

export type HubScrollTarget =
  | 'basic'
  | 'allergy'
  | 'past'
  | 'family'
  | 'exams'
  | 'followup'
  | 'visit'
  | 'tools'
  | 'modules'
  | 'auth'

const HUB_SCROLL_TARGETS = new Set<string>([
  'basic',
  'allergy',
  'past',
  'family',
  'exams',
  'followup',
  'visit',
  'tools',
  'modules',
  'auth',
])

export interface HubNavState {
  hubSection?: HubScrollTarget
}

export interface HubReturnState {
  scrollTarget?: HubScrollTarget
}

/** 档案「更多模块」chip 与 Hub 区块的对应关系 */
export const archiveModuleHubSection: Record<string, HubScrollTarget> = {
  portrait: 'modules',
  basic: 'basic',
  docs: 'exams',
  history: 'allergy',
  indicators: 'modules',
  plans: 'modules',
}

/** 子页路径与 Hub 区块的兜底映射（state 丢失时仍可按路径推断） */
const profilePathHubSection: Record<string, HubScrollTarget> = {
  basic: 'basic',
  docs: 'exams',
  portrait: 'tools',
  visit: 'visit',
  history: 'allergy',
  medical: 'modules',
  life: 'modules',
  indicators: 'modules',
  plans: 'modules',
  analysis: 'modules',
  auth: 'auth',
}

function isHubScrollTarget(value: string): value is HubScrollTarget {
  return HUB_SCROLL_TARGETS.has(value)
}

export function getHubScrollMain(): HTMLElement | null {
  return document.getElementById('app-scroll-main') as HTMLElement | null
}

/** 离开 Hub 前保存当前滚动位置，返回时原样恢复 */
export function persistHubScrollPosition() {
  const main = getHubScrollMain()
  if (main) {
    sessionStorage.setItem(HUB_SCROLL_TOP_KEY, String(main.scrollTop))
  }
}

export function readHubScrollPosition(): number | null {
  const raw = sessionStorage.getItem(HUB_SCROLL_TOP_KEY)
  if (raw == null) return null
  const top = Number(raw)
  return Number.isFinite(top) ? top : null
}

export function restoreHubScrollPosition(behavior: ScrollBehavior = 'auto'): boolean {
  const top = readHubScrollPosition()
  const main = getHubScrollMain()
  if (top == null || !main) return false
  main.scrollTo({ top, behavior })
  return true
}

export function persistHubReturnSection(section: HubScrollTarget) {
  sessionStorage.setItem(HUB_RETURN_KEY, section)
}

export function readHubReturnSection(): HubScrollTarget | null {
  const value = sessionStorage.getItem(HUB_RETURN_KEY)
  return value && isHubScrollTarget(value) ? value : null
}

export function clearHubReturnState() {
  sessionStorage.removeItem(HUB_RETURN_KEY)
  sessionStorage.removeItem(HUB_SCROLL_TOP_KEY)
}

export function inferHubSectionFromPath(pathname: string, search = ''): HubScrollTarget | null {
  if (pathname === '/reports') return 'followup'

  if (!pathname.startsWith('/profile/')) return null

  const segment = pathname.split('/')[2]
  if (!segment) return null

  if (segment === 'history') {
    const tab = new URLSearchParams(search).get('tab')
    if (tab === 'past' || tab === 'family' || tab === 'allergy') return tab
    return 'allergy'
  }

  return profilePathHubSection[segment] ?? archiveModuleHubSection[segment] ?? null
}

/** 合并 route state、sessionStorage 与路径推断，得到返回 Hub 时应滚动的区块 */
export function resolveHubReturnTarget(
  stateSection: HubScrollTarget | undefined,
  pathname: string,
  search = '',
): HubScrollTarget | null {
  return stateSection ?? readHubReturnSection() ?? inferHubSectionFromPath(pathname, search)
}

function getScrollContainer(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement
  while (node) {
    const { overflowY } = getComputedStyle(node)
    if (overflowY === 'auto' || overflowY === 'scroll') return node
    node = node.parentElement
  }
  return null
}

/** 无保存位置时的兜底：尽量最小幅度滚到区块，避免把区块硬顶到屏幕最上方 */
export function scrollToHubSection(key: string, behavior: ScrollBehavior = 'smooth'): boolean {
  const el = document.getElementById(hubSectionElementId(key))
  if (!el) return false

  const scrollRoot = getHubScrollMain() ?? getScrollContainer(el)
  if (!scrollRoot) {
    el.scrollIntoView({ behavior, block: 'nearest' })
    return true
  }

  const rootRect = scrollRoot.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const headerInView = elRect.top >= rootRect.top + 8 && elRect.bottom <= rootRect.bottom

  if (headerInView) return true

  const nextTop = scrollRoot.scrollTop + elRect.top - rootRect.top - 12
  scrollRoot.scrollTo({ top: Math.max(0, nextTop), behavior })
  return true
}

/** 返回 Hub 时优先恢复离开前的 scrollTop，否则按区块定位 */
export function restoreHubView(
  scrollTarget: HubScrollTarget,
  behavior: ScrollBehavior = 'auto',
): boolean {
  if (restoreHubScrollPosition(behavior)) return true
  return scrollToHubSection(scrollTarget, behavior)
}
