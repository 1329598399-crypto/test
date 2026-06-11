import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './components/auth/ProtectedRoute'
import { ArchiveToast } from './components/ui/ArchiveToast'
import { DevicePreview } from './components/layout/DevicePreview'
import { OpsPublishListener } from './components/ops/OpsPublishListener'
import { ArchivePage } from './pages/ArchivePage'
import { AiPage } from './pages/AiPage'
import { AiPartnerCustomizePage } from './pages/ai-partner/AiPartnerCustomizePage'
import { AiPartnerGeneratingPage } from './pages/ai-partner/AiPartnerGeneratingPage'
import { AiPartnerIntroPage } from './pages/ai-partner/AiPartnerIntroPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MembershipPage } from './pages/MembershipPage'
import { MinePage } from './pages/MinePage'
import { RegisterPage } from './pages/RegisterPage'
import { RecordsPage } from './pages/RecordsPage'
import { MoodDiaryPage } from './pages/records/MoodDiaryPage'
import { RecordPathPage } from './pages/records/RecordPathPage'
import { RecordScanPage } from './pages/records/RecordScanPage'
import { VitalsDetailPage } from './pages/records/VitalsDetailPage'
import { ActivitiesPage } from './pages/ActivitiesPage'
import {
  ActivityDetailPage,
  AdvisorPage,
  FamilyPage,
  PointsPage,
  ReportsPage,
} from './pages/SubPages'
import { AddFamilyMemberPage } from './pages/AddFamilyMemberPage'
import {
  AuthEnterPage,
  DoctorSharedViewPage,
  FamilyAuthorizedViewPage,
} from './pages/AuthorizedViewPages'

function Protected({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

/** 与 vite.config base 对齐（生产 /test/，开发 /） */
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <DevicePreview>
      <OpsPublishListener />
      <ArchiveToast />
      <BrowserRouter basename={routerBasename || undefined}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/"
            element={
              <Protected>
                <HomePage />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <ArchivePage />
              </Protected>
            }
          />
          <Route
            path="/profile/:section"
            element={
              <Protected>
                <ArchivePage />
              </Protected>
            }
          />
          <Route
            path="/records"
            element={
              <Protected>
                <RecordsPage />
              </Protected>
            }
          />
          <Route
            path="/records/path"
            element={
              <Protected>
                <RecordPathPage />
              </Protected>
            }
          />
          <Route
            path="/records/scan/:scanType"
            element={
              <Protected>
                <RecordScanPage />
              </Protected>
            }
          />
          <Route
            path="/records/mood"
            element={
              <Protected>
                <MoodDiaryPage />
              </Protected>
            }
          />
          <Route
            path="/records/vitals/:vitalType"
            element={
              <Protected>
                <VitalsDetailPage />
              </Protected>
            }
          />
          <Route
            path="/records/form/:form"
            element={
              <Protected>
                <RecordsPage />
              </Protected>
            }
          />
          <Route
            path="/ai"
            element={
              <Protected>
                <AiPage />
              </Protected>
            }
          />
          <Route
            path="/ai/partner/intro"
            element={
              <Protected>
                <AiPartnerIntroPage />
              </Protected>
            }
          />
          <Route
            path="/ai/partner/customize"
            element={
              <Protected>
                <AiPartnerCustomizePage />
              </Protected>
            }
          />
          <Route
            path="/ai/partner/generating"
            element={
              <Protected>
                <AiPartnerGeneratingPage />
              </Protected>
            }
          />
          <Route
            path="/mine"
            element={
              <Protected>
                <MinePage />
              </Protected>
            }
          />
          <Route
            path="/points"
            element={
              <Protected>
                <PointsPage />
              </Protected>
            }
          />
          <Route
            path="/membership"
            element={
              <Protected>
                <MembershipPage />
              </Protected>
            }
          />
          <Route
            path="/activities"
            element={
              <Protected>
                <ActivitiesPage />
              </Protected>
            }
          />
          <Route
            path="/activities/:id"
            element={
              <Protected>
                <ActivityDetailPage />
              </Protected>
            }
          />
          <Route
            path="/family"
            element={
              <Protected>
                <FamilyPage />
              </Protected>
            }
          />
          <Route
            path="/family/add"
            element={
              <Protected>
                <AddFamilyMemberPage />
              </Protected>
            }
          />
          <Route
            path="/family/view/:memberId"
            element={
              <Protected>
                <FamilyAuthorizedViewPage />
              </Protected>
            }
          />
          <Route
            path="/auth/enter"
            element={
              <Protected>
                <AuthEnterPage />
              </Protected>
            }
          />
          <Route
            path="/auth/view"
            element={
              <Protected>
                <DoctorSharedViewPage />
              </Protected>
            }
          />
          <Route
            path="/advisor"
            element={
              <Protected>
                <AdvisorPage />
              </Protected>
            }
          />
          <Route
            path="/reports"
            element={
              <Protected>
                <ReportsPage />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DevicePreview>
  )
}
