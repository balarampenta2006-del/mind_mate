import { AuthProvider } from '@/stores/authStore.jsx';
import { ToastProvider } from '@/stores/toastStore.jsx';
import ToastContainer from '@/components/ui/Toast.jsx';
import AppRouter from '@/app/router/index.jsx';

import './index.css';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRouter />
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  );
}