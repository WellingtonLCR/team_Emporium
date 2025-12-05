import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProductsAdminPage from "./pages/admin/Products";
import OrdersAdminPage from '@/pages/admin/Orders';
import AdminSetup from '@/pages/AdminSetup';
import UsersAdminPage from "./pages/admin/Users";
import DashboardAdminPage from "./pages/admin/Dashboard";
import CategoriesAdminPage from "./pages/admin/Categories";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import AdminRoute from "./components/auth/AdminRoute";
import { AuthProvider } from "./contexts/AuthContext";
import MyOrders from "./pages/MyOrders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
            <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
            <Route path="/admin-setup" element={<PublicOnlyRoute><AdminSetup /></PublicOnlyRoute>} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <DashboardAdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <CategoriesAdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <ProductsAdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <OrdersAdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UsersAdminPage />
                </AdminRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppFloatingButton />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
