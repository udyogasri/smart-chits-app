import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'
import SuperAdminLayout from './layouts/SuperAdminLayout'
import HomePage from './pages/HomePage'
import DashboardHomePage from './pages/dashboard/DashboardHomePage'
import DashboardListChitsPage from './pages/dashboard/ListChitsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ChitsDetailsPage from './pages/dashboard/ChitsDetailsPage'
import MyChitsPage from './pages/dashboard/MyChitsPage'
import PaymentsPage from './pages/dashboard/PaymentsPage'
import PaymentHistoryPage from './pages/dashboard/PaymentHistoryPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminMembersPage from './pages/admin/MembersPage'
import AdminChitGroupsPage from './pages/admin/ChitGroupsPage'
import AdminPaymentsPage from './pages/admin/PaymentsPage'
import AdminAuctionsPage from './pages/admin/AuctionsPage'
import AdminSettingsPage from './pages/admin/SettingsPage'

// SuperAdmin Pages
import SuperAdminDashboardPage from './pages/superadmin/DashboardPage'
import BranchesPage from './pages/superadmin/BranchesPage'
import AdminManagementPage from './pages/superadmin/AdminManagementPage'
import MembersPage from './pages/superadmin/MembersPage'
import ChitGroupsPage from './pages/superadmin/ChitGroupsPage'
import SuperAdminPaymentsPage from './pages/superadmin/PaymentsPage'
import AuctionsPage from './pages/superadmin/AuctionsPage'
import FinancialSummaryPage from './pages/superadmin/FinancialSummaryPage'
import AuditLogsPage from './pages/superadmin/AuditLogsPage'
import SuperAdminSettingsPage from './pages/superadmin/SettingsPage'
import AuctionDetailPage from './pages/AuctionDetailPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* User Routes - Protected */}
        <Route
          element={
            <ProtectedRoute requiredRole="user">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardHomePage />} />
          <Route path="dashboard/browse" element={<DashboardListChitsPage />} />
          <Route path="dashboard/my-chits" element={<MyChitsPage />} />
          <Route path="dashboard/chits/:id" element={<ChitsDetailsPage />} />
          <Route path="dashboard/payments" element={<PaymentsPage />} />
          <Route path="dashboard/payment-history" element={<PaymentHistoryPage />} />
          <Route path="dashboard/payment-history/:id" element={<PaymentHistoryPage />} />
          <Route path="dashboard/settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Routes - Protected */}
        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="admin/members" element={<AdminMembersPage />} />
          <Route path="admin/chit-groups" element={<AdminChitGroupsPage />} />
          <Route path="admin/payments" element={<AdminPaymentsPage />} />
          <Route path="admin/auctions" element={<AdminAuctionsPage />} />
          <Route path="admin/auctions/:auctionId" element={<AuctionDetailPage />} />
          <Route path="admin/settings" element={<AdminSettingsPage />} />
        </Route>

        {/* SuperAdmin Routes - Protected */}
        <Route
          element={
            <ProtectedRoute requiredRole="superadmin">
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="superadmin/dashboard" element={<SuperAdminDashboardPage />} />
          <Route path="superadmin/branches" element={<BranchesPage />} />
          <Route path="superadmin/admins" element={<AdminManagementPage />} />
          <Route path="superadmin/members" element={<MembersPage />} />
          <Route path="superadmin/chit-groups" element={<ChitGroupsPage />} />
          <Route path="superadmin/payments" element={<SuperAdminPaymentsPage />} />
          <Route path="superadmin/auctions" element={<AuctionsPage />} />
          <Route path="superadmin/auctions/:auctionId" element={<AuctionDetailPage />} />
          <Route path="superadmin/financial-summary" element={<FinancialSummaryPage />} />
          <Route path="superadmin/audit-logs" element={<AuditLogsPage />} />
          <Route path="superadmin/settings" element={<SuperAdminSettingsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
