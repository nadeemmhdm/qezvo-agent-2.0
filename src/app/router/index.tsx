import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/misc'
import AuthLayout from '@/app/layouts/AuthLayout'
import AppLayout from '@/app/layouts/AppLayout'
import PublicLayout from '@/app/layouts/PublicLayout'
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from './guards'

function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (error) {
      console.warn('Dynamic chunk import failed, attempting reload for updated build:', error)
      const key = 'chunk_reload_' + window.location.pathname
      const count = parseInt(sessionStorage.getItem(key) || '0', 10)
      if (count < 2) {
        sessionStorage.setItem(key, String(count + 1))
        window.location.reload()
        return new Promise(() => {})
      }
      sessionStorage.removeItem(key)
      throw error
    }
  })
}

// ---- Lazy-loaded pages ----
// Admin
const AdminPage = safeLazy(() => import('@/pages/app/AdminPage'))
// Public
const LandingPage = safeLazy(() => import('@/pages/public/LandingPage'))
const FeaturesPage = safeLazy(() => import('@/pages/public/FeaturesPage'))
const PricingPage = safeLazy(() => import('@/pages/public/PricingPage'))
const HowItWorksPage = safeLazy(() => import('@/pages/public/HowItWorksPage'))
const SecurityPage = safeLazy(() => import('@/pages/public/SecurityPage'))
const AboutPage = safeLazy(() => import('@/pages/public/AboutPage'))
const ContactPage = safeLazy(() => import('@/pages/public/ContactPage'))
const FaqPage = safeLazy(() => import('@/pages/public/FaqPage'))
const PrivacyPage = safeLazy(() => import('@/pages/public/PrivacyPage'))
const TermsPage = safeLazy(() => import('@/pages/public/TermsPage'))
const DocsPage = safeLazy(() => import('@/pages/public/DocsPage'))
const UseCasesPage = safeLazy(() => import('@/pages/public/UseCasesPage'))
const StatusPage = safeLazy(() => import('@/pages/public/StatusPage'))
const ApiReferencePage = safeLazy(() => import('@/pages/public/ApiReferencePage'))
const ChangelogPage = safeLazy(() => import('@/pages/public/ChangelogPage'))
const CookiePolicyPage = safeLazy(() => import('@/pages/public/CookiePolicyPage'))
const AcceptableUsePage = safeLazy(() => import('@/pages/public/AcceptableUsePage'))
const DataProcessingPage = safeLazy(() => import('@/pages/public/DataProcessingPage'))
const BlogPage = safeLazy(() => import('@/pages/public/BlogPage'))
const PublicAgentPage = safeLazy(() => import('@/pages/public/PublicAgentPage'))

// Auth
const LoginPage = safeLazy(() => import('@/pages/auth/LoginPage'))
const SignupPage = safeLazy(() => import('@/pages/auth/SignupPage'))
const VerifyEmailPage = safeLazy(() => import('@/pages/auth/VerifyEmailPage'))
const ForgotPasswordPage = safeLazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = safeLazy(() => import('@/pages/auth/ResetPasswordPage'))

// App - Dashboard
const DashboardPage = safeLazy(() => import('@/pages/app/DashboardPage'))

// App - Agents
const AgentsPage = safeLazy(() => import('@/pages/app/agents/AgentsPage'))
const CreateAgentPage = safeLazy(() => import('@/pages/app/agents/CreateAgentPage'))
const AgentLayout = safeLazy(() => import('@/app/layouts/AgentLayout'))
const AgentOverviewPage = safeLazy(() => import('@/pages/app/agents/AgentOverviewPage'))
const AgentKnowledgePage = safeLazy(() => import('@/pages/app/agents/knowledge/AgentKnowledgePage'))
const AgentFilesPage = safeLazy(() => import('@/pages/app/agents/knowledge/AgentFilesPage'))
const AgentWebsitesPage = safeLazy(() => import('@/pages/app/agents/knowledge/AgentWebsitesPage'))
const AgentSitemapPage = safeLazy(() => import('@/pages/app/agents/knowledge/AgentSitemapPage'))
const AgentClipboardPage = safeLazy(() => import('@/pages/app/agents/knowledge/AgentClipboardPage'))
const AgentTestPage = safeLazy(() => import('@/pages/app/agents/AgentTestPage'))
const AgentModelPage = safeLazy(() => import('@/pages/app/agents/AgentModelPage'))
const AgentCustomizePage = safeLazy(() => import('@/pages/app/agents/AgentCustomizePage'))
const AgentWidgetPage = safeLazy(() => import('@/pages/app/agents/AgentWidgetPage'))
const AgentSecurityPage = safeLazy(() => import('@/pages/app/agents/AgentSecurityPage'))
const AgentSharingPage = safeLazy(() => import('@/pages/app/agents/AgentSharingPage'))
const AgentVersionsPage = safeLazy(() => import('@/pages/app/agents/AgentVersionsPage'))
const AgentPublishPage = safeLazy(() => import('@/pages/app/agents/AgentPublishPage'))

// App - Other
const DomainsPage = safeLazy(() => import('@/pages/app/DomainsPage'))
const AnalyticsPage = safeLazy(() => import('@/pages/app/AnalyticsPage'))
const ApiKeysPage = safeLazy(() => import('@/pages/app/ApiKeysPage'))
const TeamPage = safeLazy(() => import('@/pages/app/TeamPage'))
const BillingPage = safeLazy(() => import('@/pages/app/BillingPage'))
const SettingsLayout = safeLazy(() => import('@/app/layouts/SettingsLayout'))
const ProfileSettings = safeLazy(() => import('@/pages/app/settings/ProfileSettings'))
const SecuritySettings = safeLazy(() => import('@/pages/app/settings/SecuritySettings'))
const NotificationSettings = safeLazy(() => import('@/pages/app/settings/NotificationSettings'))

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

const router = createBrowserRouter([
  // ── Public Standalone Agent Embed ──
  { path: '/a/:agentSlug', element: <S><PublicAgentPage /></S> },

  // ── Public Pages with Shared Navbar & Footer ──
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <S><LandingPage /></S> },
      { path: '/features', element: <S><FeaturesPage /></S> },
      { path: '/pricing', element: <S><PricingPage /></S> },
      { path: '/how-it-works', element: <S><HowItWorksPage /></S> },
      { path: '/security', element: <S><SecurityPage /></S> },
      { path: '/about', element: <S><AboutPage /></S> },
      { path: '/contact', element: <S><ContactPage /></S> },
      { path: '/faq', element: <S><FaqPage /></S> },
      { path: '/privacy', element: <S><PrivacyPage /></S> },
      { path: '/terms', element: <S><TermsPage /></S> },
      { path: '/documentation', element: <S><DocsPage /></S> },
      { path: '/use-cases', element: <S><UseCasesPage /></S> },
      { path: '/status', element: <S><StatusPage /></S> },
      { path: '/api', element: <S><ApiReferencePage /></S> },
      { path: '/changelog', element: <S><ChangelogPage /></S> },
      { path: '/cookie-policy', element: <S><CookiePolicyPage /></S> },
      { path: '/acceptable-use', element: <S><AcceptableUsePage /></S> },
      { path: '/data-processing', element: <S><DataProcessingPage /></S> },
      { path: '/blog', element: <S><BlogPage /></S> },
    ],
  },

  // ── Auth Routes ──
  {
    element: (
      <PublicOnlyRoute>
        <AuthLayout />
      </PublicOnlyRoute>
    ),
    children: [
      { path: '/login', element: <S><LoginPage /></S> },
      { path: '/signup', element: <S><SignupPage /></S> },
      { path: '/forgot-password', element: <S><ForgotPasswordPage /></S> },
    ],
  },
  // These auth pages don't redirect logged-in users (needed for verification actions)
  { path: '/verify-email', element: <AuthLayout />, children: [
    { index: true, element: <S><VerifyEmailPage /></S> },
  ]},
  { path: '/reset-password', element: <AuthLayout />, children: [
    { index: true, element: <S><ResetPasswordPage /></S> },
  ]},

  // ── Protected App Routes ──
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <S><DashboardPage /></S> },
      { path: 'agents', element: <S><AgentsPage /></S> },
      { path: 'agents/new', element: <S><CreateAgentPage /></S> },

      // Agent sub-routes
      {
        path: 'agents/:agentId',
        element: <S><AgentLayout /></S>,
        children: [
          { index: true, element: <Navigate to="overview" replace /> },
          { path: 'overview', element: <S><AgentOverviewPage /></S> },
          { path: 'knowledge', element: <S><AgentKnowledgePage /></S> },
          { path: 'files', element: <S><AgentFilesPage /></S> },
          { path: 'websites', element: <S><AgentWebsitesPage /></S> },
          { path: 'sitemap', element: <S><AgentSitemapPage /></S> },
          { path: 'clipboard', element: <S><AgentClipboardPage /></S> },
          { path: 'test', element: <S><AgentTestPage /></S> },
          { path: 'model', element: <S><AgentModelPage /></S> },
          { path: 'customize', element: <S><AgentCustomizePage /></S> },
          { path: 'widget', element: <S><AgentWidgetPage /></S> },
          { path: 'security', element: <S><AgentSecurityPage /></S> },
          { path: 'sharing', element: <S><AgentSharingPage /></S> },
          { path: 'versions', element: <S><AgentVersionsPage /></S> },
          { path: 'publish', element: <S><AgentPublishPage /></S> },
        ],
      },

      { path: 'domains', element: <S><DomainsPage /></S> },
      { path: 'analytics', element: <S><AnalyticsPage /></S> },
      { path: 'api', element: <S><ApiKeysPage /></S> },
      { path: 'team', element: <S><TeamPage /></S> },
      { path: 'billing', element: <S><BillingPage /></S> },
      {
        path: 'settings',
        element: <S><SettingsLayout /></S>,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: 'profile', element: <S><ProfileSettings /></S> },
          { path: 'security', element: <S><SecuritySettings /></S> },
          { path: 'notifications', element: <S><NotificationSettings /></S> },
        ],
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <S><AdminPage /></S>
          </AdminRoute>
        ),
      },
    ],
  },

  // Direct /admin redirect
  { path: '/admin', element: <Navigate to="/app/admin" replace /> },

  // 404
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function Router() {
  return <RouterProvider router={router} />
}
