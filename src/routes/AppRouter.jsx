import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import DashboardPage from "@/features/dashboard/DashboardPage";

import CategoryPage from "@/features/category/CategoryPage";
import ProductsPage from "@/features/product/ProductsPage";
import NewSalePage from "@/features/sale/NewSalePage";
import HistorySalePage from "@/features/sale/HistorySalePage";

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
          <Route path="/new-sale" element={<NewSalePage />} />
          <Route path="/sale-history" element={<HistorySalePage />} />

          {/* Aquí irán los demás módulos */}
        </Route>

        {/* CUALQUIER RUTA DESCONOCIDA */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
