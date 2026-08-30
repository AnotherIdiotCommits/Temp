import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import PCDetail from './pages/PCDetail';
import About from './pages/About';
import Support from './pages/Support';
import LiveChat from './pages/LiveChat';
import CustomBuild from './pages/CustomBuild.jsx';
import WeeklyDrop from './pages/WeeklyDrop';
import Cart from './pages/Cart';
import Account from './pages/Account.jsx';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminSupport from './pages/admin/SupportDashboard';
import AdminSettings from './pages/admin/Settings';
import PCsManagement from './pages/admin/PCsManagement';
import PCSettings from './pages/admin/PCSettings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner only while actively checking auth (not just for guests without a token)
  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only block for user_not_registered; allow all others (including unauthenticated guests) through
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:slug" element={<PCDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />
        <Route path="/support/chat" element={<LiveChat />} />
        <Route path="/custom-build" element={<CustomBuild />} />
        <Route path="/weekly-drop" element={<WeeklyDrop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/support" element={<AdminSupport />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/pcs" element={<PCsManagement />} />
        <Route path="/admin/pc-settings" element={<PCSettings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App