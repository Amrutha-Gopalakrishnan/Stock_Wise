import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Alerts from "./pages/Alerts";
import StaffAlerts from "./pages/StaffAlerts";
import StaffActivity from "./pages/StaffActivity";
import { DashboardLayout } from "./layouts/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <DashboardLayout role="admin">
                  <AdminDashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/products"
              element={
                <DashboardLayout role="admin">
                  <Products />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/suppliers"
              element={
                <DashboardLayout role="admin">
                  <Suppliers />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/alerts"
              element={
                <DashboardLayout role="admin">
                  <Alerts />
                </DashboardLayout>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <DashboardLayout role="staff">
                  <StaffDashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/staff/alerts"
              element={
                <DashboardLayout role="staff">
                  <StaffAlerts />
                </DashboardLayout>
              }
            />
            <Route
              path="/staff/activity"
              element={
                <DashboardLayout role="staff">
                  <StaffActivity />
                </DashboardLayout>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
