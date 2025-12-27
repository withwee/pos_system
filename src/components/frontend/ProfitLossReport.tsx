import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

// UI Components (correct folder)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";

// Charts (recharts)
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Icons
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar
} from "lucide-react";

// Notifications
import { toast } from "sonner";

type Summary = {
  revenue: number;
  cogs: number;
  grossProfit: number;
};

type MonthlyRow = {
  month: string;
  revenue: number;
  cogs: number;
  profit: number;
};

type ProductProfit = {
  productId: string | number;
  productName: string;
  revenue: number;
  cogs: number;
  profit: number;
};

export default function ProfitLossReport() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const monthStart = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [timeFilter, setTimeFilter] = useState("monthly");
  const [dateFrom, setDateFrom] = useState(monthStart);
  const [dateTo, setDateTo] = useState(today);
  const [summary, setSummary] = useState<Summary>({
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyRow[]>([]);
  const [products, setProducts] = useState<ProductProfit[]>([]);
  const [loading, setLoading] = useState(false);

  const profitMargin =
    summary.revenue === 0
      ? "0.0"
      : ((summary.grossProfit / summary.revenue) * 100).toFixed(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { start: dateFrom, end: dateTo };

      const [summaryRes, monthlyRes, productRes] = await Promise.all([
        api.get("/profitloss/summary", { params }),
        api.get("/profitloss/monthly", { params }),
        api.get("/profitloss/products", { params, paramsSerializer: (p) => new URLSearchParams({ ...p, limit: "6" }).toString() }),
      ]);

      setSummary(summaryRes.data || { revenue: 0, cogs: 0, grossProfit: 0 });
      setMonthlyData(monthlyRes.data || []);
      setProducts(productRes.data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Gagal memuat data laba rugi";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = (format: string) => {
    toast.success(`Laporan laba rugi berhasil diekspor ke format ${format.toUpperCase()}`);
  };

  const handleViewDetail = () => {
    toast.info('Menampilkan rincian detail transaksi');
  };

  const formatMonthLabel = (value: string) => {
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString("id-ID", { month: "short", year: "numeric" });
  };

  const formatCurrency = (value: number) =>
    `Rp ${Math.round(value).toLocaleString("id-ID")}`;

  const chartData = monthlyData.map((item) => ({
    month: formatMonthLabel(item.month),
    income: item.revenue,
    expense: item.cogs,
    profit: item.profit,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-green-500 to-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-white text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Total Pendapatan</p>
            <h3 className="text-2xl text-white">
              {formatCurrency(summary.revenue)}
            </h3>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-red-500 to-red-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-white text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+8.3%</span>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Total Pengeluaran</p>
            <h3 className="text-2xl text-white">
              {formatCurrency(summary.cogs)}
            </h3>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-white text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+15.2%</span>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Laba Bersih</p>
            <h3 className="text-2xl text-white">
              {formatCurrency(summary.grossProfit)}
            </h3>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-purple-500 to-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-white text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+3.1%</span>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Margin Laba</p>
            <h3 className="text-2xl text-white">
              {profitMargin}%
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Export */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Filter & Export</CardTitle>
          <CardDescription>Sesuaikan periode dan ekspor laporan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Periode</Label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dari Tanggal</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Sampai Tanggal</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="opacity-0">Actions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchData}
                  disabled={loading}
                  className="flex-1 rounded-xl"
                >
                  {loading ? "Memuat..." : "Terapkan"}
                </Button>
                <Button
                  onClick={() => handleExport('pdf')}
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button
                  onClick={() => handleExport('excel')}
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income vs Expense Chart */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Grafik Pendapatan vs Pengeluaran</CardTitle>
          <CardDescription>Perbandingan pendapatan dan pengeluaran per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Belum ada data transaksi pada rentang tanggal ini</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#6c757d" />
                <YAxis stroke="#6c757d" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                />
                <Legend />
                <Bar dataKey="income" fill="#28a745" radius={[8, 8, 0, 0]} name="Pendapatan" />
                <Bar dataKey="expense" fill="#dc3545" radius={[8, 8, 0, 0]} name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Profit Trend Chart */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tren Laba Bersih</CardTitle>
              <CardDescription>Perkembangan laba bersih selama periode {timeFilter}</CardDescription>
            </div>
            <Button onClick={handleViewDetail} variant="outline" className="rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              Lihat Detail
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Belum ada data transaksi pada rentang tanggal ini</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007BFF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#007BFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#6c757d" />
                <YAxis stroke="#6c757d" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#007BFF"
                  strokeWidth={3}
                  fill="url(#colorProfit)"
                  name="Laba Bersih"
                  dot={{ fill: '#007BFF', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Profit by Product (Top) */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Produk Terbaik berdasarkan Laba</CardTitle>
          <CardDescription>Kontribusi laba dari produk teratas</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-gray-500">Belum ada data produk</p>
          ) : (
            <div className="space-y-4">
              {products.map((item) => {
                const total = chartData.reduce((sum, d) => sum + d.profit, 0) || item.profit;
                const percentage = total === 0 ? 0 : Math.min(100, Math.round((item.profit / total) * 100));

                return (
                  <div key={item.productId}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="">{item.productName}</p>
                      <div className="flex items-center gap-3">
                        <p className="text-[#6c757d]">{percentage}%</p>
                        <p className="">Rp {(item.profit / 1000000).toFixed(2)}jt</p>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#007BFF] to-[#00BCD4] rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
