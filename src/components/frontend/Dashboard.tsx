import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { usePOS } from '../../contexts/POSContext';


export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("monthly");

  useEffect(() => {
  api
    .get("/sales-report/summary")
    .then((res) => {
      setSummary(res.data);
    })
    .catch((err) => {
      console.error(err);
      toast.error("Gagal memuat data dashboard");
    })
    .finally(() => setLoading(false));
}, []);

  const handleExport = (format: string) => {
    toast.success(`Laporan berhasil diekspor (${format.toUpperCase()})`);
  };

  if (loading || !summary) {
    return <p className="p-6">Memuat dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-[#007BFF] to-[#0056b3]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Produk</p>
                <h3 className="text-2xl text-white mb-2">
                  {summary.totalProducts}
                </h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-[#FFC107] to-[#FFA000]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Stok Habis</p>
                <h3 className="text-2xl text-white mb-2">{summary.lowStock}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-[#28a745] to-[#1e7e34]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total User</p>
                <h3 className="text-2xl text-white mb-2">{summary.totalUsers}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-lg bg-gradient-to-br from-[#00BCD4] to-[#0097A7]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Transaksi</p>
                <h3 className="text-2xl text-white mb-2">
                  {summary.totalTransactions}
                </h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Export */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filter & Export</CardTitle>
              <CardDescription>Sesuaikan tampilan data dan ekspor laporan</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => handleExport("pdf")} className="bg-red-600 hover:bg-red-700 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => handleExport("excel")} className="bg-green-600 hover:bg-green-700 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Kamu bisa menambahkan grafik backend di sini nanti */}
    </div>
  );
}
