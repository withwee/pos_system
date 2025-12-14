import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "sonner";

import LoginPage from "./components/frontend/LoginPage";
import RegisterPage from "./components/frontend/RegisterPage";
import MainLayout from "./components/frontend/MainLayout";
import Dashboard from "./components/frontend/Dashboard";
import AddProduct from "./components/frontend/AddProduct";
import PurchaseHistory from "./components/frontend/PurchaseHistory";
import SalesTransaction from "./components/frontend/SalesTransaction";
import SalesHistory from "./components/frontend/SalesHistory";
import StockReport from "./components/frontend/StockReport";
import ProfitLossReport from "./components/frontend/ProfitLossReport";
import ProfileSettings from "./components/frontend/ProfileSettings";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pembelian/input-barang" element={<AddProduct />} />
          <Route path="pembelian/riwayat" element={<PurchaseHistory />} />
          <Route path="penjualan/transaksi" element={<SalesTransaction />} />
          <Route path="penjualan/riwayat" element={<SalesHistory />} />
          <Route path="laporan/stok" element={<StockReport />} />
          <Route path="laporan/laba-rugi" element={<ProfitLossReport />} />
          <Route path="pengaturan" element={<ProfileSettings />} />
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Router>
  );
}
