import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/common/ProtectedRoute.jsx';
import { Role } from '@/constants/enums.js';

// Layouts
import PublicLayout from '@/layouts/PublicLayout/index.jsx';
import UserLayout from '@/layouts/UserLayout/index.jsx';
import TherapistLayout from '@/layouts/TherapistLayout/index.jsx';
import AdminLayout from '@/layouts/AdminLayout/index.jsx';

// Public/Auth Pages
import LandingPage from '@/pages/auth/LandingPage.jsx';
import UserLoginPage from '@/pages/auth/UserLoginPage.jsx';
import RegisterPage from '@/pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage.jsx';
import TherapistLoginPage from '@/pages/auth/TherapistLoginPage.jsx';
import AdminLoginPage from '@/pages/auth/AdminLoginPage.jsx';

// User Pages
import UserDashboard from '@/pages/user/dashboard/UserDashboard.jsx';
import MoodLogger from '@/pages/user/mood/MoodLogger.jsx';
import MoodHistory from '@/pages/user/mood/MoodHistory.jsx';
import ChatPage from '@/pages/user/chat/ChatPage.jsx';
import RecommendationsPage from '@/pages/user/recommendations/RecommendationsPage.jsx';
import MeditationPage from '@/pages/user/meditation/MeditationPage.jsx';
import TherapistsPage from '@/pages/user/therapists/TherapistsPage.jsx';
import BookingsPage from '@/pages/user/bookings/BookingsPage.jsx';
import SOSPage from '@/pages/user/sos/SOSPage.jsx';
import ReportsPage from '@/pages/user/reports/ReportsPage.jsx';
import EmergencyContactsPage from '@/pages/user/contacts/EmergencyContactsPage.jsx';
import NotificationsPage from '@/pages/user/notifications/NotificationsPage.jsx';
import ProfilePage from '@/pages/user/profile/ProfilePage.jsx';

// Therapist Pages
import TherapistDashboard from '@/pages/therapist/dashboard/TherapistDashboard.jsx';
import PatientsPage from '@/pages/therapist/patients/PatientsPage.jsx';
import PatientDetailsPage from '@/pages/therapist/patients/PatientDetailsPage.jsx';
import MessagesPage from '@/pages/therapist/messages/MessagesPage.jsx';
import AvailabilityPage from '@/pages/therapist/availability/AvailabilityPage.jsx';
import TherapistNotificationsPage from '@/pages/therapist/notifications/TherapistNotificationsPage.jsx';
import TherapistProfilePage from '@/pages/therapist/profile/TherapistProfilePage.jsx';

// Admin Pages
import AdminDashboard from '@/pages/admin/dashboard/AdminDashboard.jsx';
import AdminUsersPage from '@/pages/admin/users/AdminUsersPage.jsx';
import AdminUserDetailPage from '@/pages/admin/users/AdminUserDetailPage.jsx';
import AdminTherapistsPage from '@/pages/admin/therapists/AdminTherapistsPage.jsx';
import AdminTherapistDetailPage from '@/pages/admin/therapists/AdminTherapistDetailPage.jsx';
import AdminAnalyticsPage from '@/pages/admin/analytics/AdminAnalyticsPage.jsx';
import AdminReportsPage from '@/pages/admin/reports/AdminReportsPage.jsx';
import AdminSOSPage from '@/pages/admin/sos/AdminSOSPage.jsx';
import AdminNotificationsPage from '@/pages/admin/notifications/AdminNotificationsPage.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/therapist/login" element={<TherapistLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      {/* User Routes */}
      <Route
        path="/user/*"
        element={
          <ProtectedRoute allowedRole={Role.USER}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="mood" element={<MoodLogger />} />
        <Route path="mood/history" element={<MoodHistory />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="meditation" element={<MeditationPage />} />
        <Route path="therapists" element={<TherapistsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="sos" element={<SOSPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="emergency-contacts" element={<EmergencyContactsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Therapist Routes */}
      <Route
        path="/therapist/*"
        element={
          <ProtectedRoute allowedRole={Role.THERAPIST}>
            <TherapistLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TherapistDashboard />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:patientId" element={<PatientDetailsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="notifications" element={<TherapistNotificationsPage />} />
        <Route path="profile" element={<TherapistProfilePage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRole={Role.ADMIN}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUserDetailPage />} />
        <Route path="therapists" element={<AdminTherapistsPage />} />
        <Route path="therapists/:id" element={<AdminTherapistDetailPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="sos" element={<AdminSOSPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
