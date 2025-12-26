import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../layouts/AppShell';

const LandingPageRoute = lazy(() => import('../pages/LandingPageRoute'));
const LegalDocsRoute = lazy(() => import('../pages/LegalDocsRoute'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const TakeExamPage = lazy(() => import('../pages/TakeExamPage'));
const ResultsPage = lazy(() => import('../pages/ResultsPage'));
const FlashcardsPage = lazy(() => import('../pages/FlashcardsPage'));
const OSCEPracticePage = lazy(() => import('../pages/OSCEPracticePage'));
const ClinicalReasoningPage = lazy(() => import('../pages/ClinicalReasoningPage'));
const SpotDxPage = lazy(() => import('../pages/SpotDxPage'));
const MicrolearningPage = lazy(() => import('../pages/MicrolearningPage'));
const BenchmarkPage = lazy(() => import('../pages/BenchmarkPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const RemedialPage = lazy(() => import('../pages/RemedialPage'));
const LogbookPage = lazy(() => import('../pages/LogbookPage'));
const MentorDashboardPage = lazy(() => import('../pages/MentorDashboardPage'));
const MentorMarketplacePage = lazy(() => import('../pages/MentorMarketplacePage'));
const CaseDiscussionPage = lazy(() => import('../pages/CaseDiscussionPage'));
const AdminPostsPage = lazy(() => import('../pages/AdminPostsPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const ExamCreatorPage = lazy(() => import('../pages/ExamCreatorPage'));
const UserManagementPage = lazy(() => import('../pages/UserManagementPage'));
const CohortManagementPage = lazy(() => import('../pages/CohortManagementPage'));
const BlueprintManagerPage = lazy(() => import('../pages/BlueprintManagerPage'));
const KnowledgeBaseManagerPage = lazy(() => import('../pages/KnowledgeBaseManagerPage'));
const HighYieldMapPage = lazy(() => import('../pages/HighYieldMapPage'));
const QuestionQualityPage = lazy(() => import('../pages/QuestionQualityPage'));
const VignetteBuilderPage = lazy(() => import('../pages/VignetteBuilderPage'));
const QuestionReviewPage = lazy(() => import('../pages/QuestionReviewPage'));
const OSCEManagerPage = lazy(() => import('../pages/OSCEManagerPage'));
const SettingsPageRoute = lazy(() => import('../pages/SettingsPageRoute'));

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<div className="p-6 text-gray-600">Loading...</div>}>
      <Routes>
        <Route path="/" element={<LandingPageRoute />} />
        <Route path="/privacy" element={<LegalDocsRoute type="PRIVACY" />} />
        <Route path="/terms" element={<LegalDocsRoute type="TERMS" />} />
        <Route path="/support" element={<LegalDocsRoute type="SUPPORT" />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/exam/:examId" element={<TakeExamPage />} />
          <Route path="/results/:examId" element={<ResultsPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/osce" element={<OSCEPracticePage />} />
          <Route path="/clinical-reasoning" element={<ClinicalReasoningPage />} />
          <Route path="/spot-dx" element={<SpotDxPage />} />
          <Route path="/microlearning" element={<MicrolearningPage />} />
          <Route path="/benchmark" element={<BenchmarkPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/remedial" element={<RemedialPage />} />
          <Route path="/logbook" element={<LogbookPage />} />
          <Route path="/mentor" element={<MentorDashboardPage />} />
          <Route path="/mentors" element={<MentorMarketplacePage />} />
          <Route path="/case-discussion" element={<CaseDiscussionPage />} />
          <Route path="/settings" element={<SettingsPageRoute />} />

          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/posts" element={<AdminPostsPage />} />
          <Route path="/admin/create-exam" element={<ExamCreatorPage />} />
          <Route path="/admin/vignette" element={<VignetteBuilderPage />} />
          <Route path="/admin/review" element={<QuestionReviewPage />} />
          <Route path="/admin/osce" element={<OSCEManagerPage />} />
          <Route path="/admin/blueprint" element={<BlueprintManagerPage />} />
          <Route path="/admin/knowledge" element={<KnowledgeBaseManagerPage />} />
          <Route path="/admin/high-yield" element={<HighYieldMapPage />} />
          <Route path="/admin/quality" element={<QuestionQualityPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/cohorts" element={<CohortManagementPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
