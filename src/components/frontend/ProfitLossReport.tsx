import { useState } from "react";
import { usePOS } from "../../contexts/POSContext";

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


const monthlyData = [
  { month: 'Jan', income: 45000000, expense: 32000000, profit: 13000000 },
  { month: 'Feb', income: 52000000, expense: 35000000, profit: 17000000 },
  { month: 'Mar', income: 48000000, expense: 33000000, profit: 15000000 },
  { month: 'Apr', income: 61000000, expense: 38000000, profit: 23000000 },
  { month: 'May', income: 55000000, expense: 36000000, profit: 19000000 },
  { month: 'Jun', income: 72000000, expense: 42000000, profit: 30000000 },
  { month: 'Jul', income: 68000000, expense: 40000000, profit: 28000000 },
  { month: 'Aug', income: 75000000, expense: 43000000, profit: 32000000 },
  { month: 'Sep', income: 82000000, expense: 47000000, profit: 35000000 },
  { month: 'Oct', income: 79000000, expense: 45000000, profit: 34000000 },
  { month: 'Nov', income: 85000000, expense: 48000000, profit: 37000000 }
];

const categoryData = [
  { category: 'Makanan', profit: 125000000, percentage: 42 },
  { category: 'Minuman', profit: 85000000, percentage: 28 },
  { category: 'Sembako', profit: 65000000, percentage: 22 },
  { category: 'Lainnya', profit: 25000000, percentage: 8 }
];

export default function ProfitLossReport() {
  const { transactions } = usePOS();
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-11-09');

  const totalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = monthlyData.reduce((sum, d) => sum + d.expense, 0);
  const totalProfit = totalIncome - totalExpense;
  const profitMargin = ((totalProfit / totalIncome) * 100).toFixed(1);

  const handleExport = (format: string) => {
    toast.success(`Laporan laba rugi berhasil diekspor ke format ${format.toUpperCase()}`);
  };

  const handleViewDetail = () => {
    toast.info('Menampilkan rincian detail transaksi');
  };

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
              Rp {(totalIncome / 1000000).toFixed(1)}jt
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
              Rp {(totalExpense / 1000000).toFixed(1)}jt
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
              Rp {(totalProfit / 1000000).toFixed(1)}jt
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
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
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
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
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
        </CardContent>
      </Card>

      {/* Profit by Category */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Laba Berdasarkan Kategori</CardTitle>
          <CardDescription>Kontribusi laba dari setiap kategori produk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <p className="">{item.category}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-[#6c757d]">{item.percentage}%</p>
                    <p className="">Rp {(item.profit / 1000000).toFixed(1)}jt</p>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#007BFF] to-[#00BCD4] rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
