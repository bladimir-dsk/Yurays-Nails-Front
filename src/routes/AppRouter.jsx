import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import DashboardPage from "@/features/dashboard/DashboardPage";
import LoungePage from "@/features/lounge/LoungePage";
import StudentsPage from "@/features/student/StudentsPage";
import AccessPage from "@/features/access/AccessPage";
import AddAccessPage from "@/features/access/AddAccessPage";
import CategoryPage from "@/features/category/CategoryPage";
import ProductsPage from "@/features/product/ProductsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PÚBLICAS */}
        <Route path="/login" element={<LoginPage />} />

        {/* PRIVADAS */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/category" element={<CategoryPage />} />
          <Route path="/product" element={<ProductsPage />} />
          <Route path="/acces" element={<AccessPage />} />
          <Route path="/add-access" element={<AddAccessPage />} />

          {/* Aquí irán los demás módulos */}
        </Route>

        {/* CUALQUIER RUTA DESCONOCIDA */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
