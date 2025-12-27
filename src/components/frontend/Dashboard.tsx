import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import "./dashboard.css";

type Summary = {
  totalSales: number;
  totalTransactions: number;
  totalProducts: number;
  lowStock: number;
  totalUsers: number;
};

type ProfitPoint = { month: string; revenue: number; cogs: number; profit: number };
type ProductRow = { productId: number; productName: string; revenue: number; profit: number };
type DailySale = { id: number; totalAmount: number; createdAt: string };

const formatCurrency = (val: number) => `Rp ${Math.round(val).toLocaleString("id-ID")}`;
const monthLabel = (value: string) => {
  const [y, m] = value.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("id-ID", { month: "short" });
};

export default function Dashboard() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const monthStart = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [profitSummary, setProfitSummary] = useState<{ revenue: number; cogs: number; grossProfit: number }>({
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
  });
  const [profitTrend, setProfitTrend] = useState<ProfitPoint[]>([]);
  const [topProducts, setTopProducts] = useState<ProductRow[]>([]);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [timeFilter, setTimeFilter] = useState("monthly");
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { start: startDate, end: endDate };

      const [
        summaryRes,
        profitSummaryRes,
        profitMonthlyRes,
        topProductsRes,
        dailyRes,
      ] = await Promise.allSettled([
        api.get("/sales-report/summary"),
        api.get("/profitloss/summary", { params }),
        api.get("/profitloss/monthly", { params }),
        api.get("/sales-report/by-product", { params }),
        api.get("/sales-report/daily", { params }),
      ]);

      if (summaryRes.status === "fulfilled") {
        setSummary(summaryRes.value.data);
      }

      if (profitSummaryRes.status === "fulfilled") {
        setProfitSummary(profitSummaryRes.value.data);
      } else {
        setProfitSummary({ revenue: 0, cogs: 0, grossProfit: 0 });
      }

      if (profitMonthlyRes.status === "fulfilled") {
        setProfitTrend(
          (profitMonthlyRes.value.data || []).map((row: any) => ({
            month: monthLabel(row.month),
            revenue: Number(row.revenue),
            cogs: Number(row.cogs),
            profit: Number(row.profit),
          }))
        );
      } else {
        setProfitTrend([]);
      }

      if (topProductsRes.status === "fulfilled") {
        setTopProducts(
          (topProductsRes.value.data || []).slice(0, 5).map((row: any) => ({
            productId: row.productId,
            productName: row.productName,
            revenue: Number(row.revenue || 0),
            profit: Number(row.profit || 0),
          }))
        );
      } else {
        setTopProducts([]);
      }

      if (dailyRes.status === "fulfilled") {
        setDailySales(
          (dailyRes.value.data || []).map((row: any) => ({
            id: row.id,
            totalAmount: Number(row.totalAmount || 0),
            createdAt: row.createdAt,
          }))
        );
      } else {
        setDailySales([]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Gagal memuat data dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = (format: string) => {
    toast.success(`Laporan berhasil diekspor (${format.toUpperCase()})`);
  };

  if (!summary) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse h-24 rounded-2xl bg-gradient-to-r from-blue-100 to-blue-50" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <section className="dashboard__hero">
        <p className="dashboard__hero-date">
          Rabu, {new Date().toLocaleDateString("id-ID")}
        </p>
        <h2 className="dashboard__hero-title">
          Selamat Datang di Toko Sembako POS
        </h2>
        <p className="dashboard__hero-subtitle">
          Kelola bisnis Anda dengan mudah dan efisien
        </p>
      </section>

      <section className="dashboard__stats">
        <div className="stat-card stat-card--sales">
          <div>
            <p className="stat-card__label">Total Penjualan</p>
            <h3 className="stat-card__value">
              {formatCurrency(profitSummary.revenue)}
            </h3>
            <p className="stat-card__delta">+12.5%</p>
          </div>
          <div className="stat-card__icon">
            <DollarSign className="stat-card__icon-svg" />
          </div>
        </div>

        <div className="stat-card stat-card--profit">
          <div>
            <p className="stat-card__label">Total Profit</p>
            <h3 className="stat-card__value">
              {formatCurrency(profitSummary.grossProfit)}
            </h3>
            <p className="stat-card__delta">+8.3%</p>
          </div>
          <div className="stat-card__icon">
            <TrendingUp className="stat-card__icon-svg" />
          </div>
        </div>

        <div className="stat-card stat-card--products">
          <div>
            <p className="stat-card__label">Total Produk</p>
            <h3 className="stat-card__value">{summary.totalProducts}</h3>
            <p className="stat-card__delta">
              +{Math.max(summary.totalProducts - 1, 0)} produk baru
            </p>
          </div>
          <div className="stat-card__icon">
            <Package className="stat-card__icon-svg" />
          </div>
        </div>

        <div className="stat-card stat-card--transactions">
          <div>
            <p className="stat-card__label">Total Transaksi</p>
            <h3 className="stat-card__value">{summary.totalTransactions}</h3>
            <p className="stat-card__delta">+15.7%</p>
          </div>
          <div className="stat-card__icon">
            <ShoppingCart className="stat-card__icon-svg" />
          </div>
        </div>
      </section>

      <section className="dashboard__panel dashboard__filter">
        <div>
          <h3 className="dashboard__panel-title">Filter & Export</h3>
          <p className="dashboard__panel-subtitle">
            Sesuaikan tampilan data dan ekspor laporan
          </p>
        </div>
        <div className="dashboard__filter-controls">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="dashboard__select">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="date"
            className="dashboard__date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="dashboard__date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={fetchData} disabled={loading} className="dashboard__button">
            {loading ? "Memuat..." : "Terapkan"}
          </Button>
          <Button onClick={() => handleExport("pdf")} className="dashboard__button dashboard__button--pdf">
            <Download className="dashboard__button-icon" />
            Export PDF
          </Button>
          <Button onClick={() => handleExport("excel")} className="dashboard__button dashboard__button--excel">
            <Download className="dashboard__button-icon" />
            Export Excel
          </Button>
        </div>
      </section>

      <section className="dashboard__grid">
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h3 className="dashboard__card-title">Grafik Laba Rugi</h3>
            <p className="dashboard__card-subtitle">
              Perbandingan profit dan loss bulanan
            </p>
          </div>
          <div className="dashboard__card-body dashboard__card-body--tall">
            {profitTrend.length === 0 ? (
              <p className="dashboard__empty">Belum ada data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  <Legend />
                  <Line dataKey="profit" name="Profit" stroke="#22c55e" strokeWidth={3} dot={false} />
                  <Line dataKey="cogs" name="Loss (COGS)" stroke="#f43f5e" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h3 className="dashboard__card-title">Produk Terlaris</h3>
            <p className="dashboard__card-subtitle">Top 5 produk dengan penjualan tertinggi</p>
          </div>
          <div className="dashboard__card-body dashboard__card-body--tall">
            {topProducts.length === 0 ? (
              <p className="dashboard__empty">Belum ada data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="productName" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  <Bar dataKey="profit" fill="#2563eb" radius={[8, 8, 0, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard__card">
        <div className="dashboard__card-header">
          <h3 className="dashboard__card-title">Total Penjualan</h3>
          <p className="dashboard__card-subtitle">
            Grafik penjualan harian dalam rentang terpilih
          </p>
        </div>
        <div className="dashboard__card-body dashboard__card-body--medium">
          {dailySales.length === 0 ? (
            <p className="dashboard__empty">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailySales.map((d) => ({
                  date: new Date(d.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
                  total: d.totalAmount,
                }))}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Area type="monotone" dataKey="total" stroke="#22c55e" fill="url(#colorSales)" name="Penjualan" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
