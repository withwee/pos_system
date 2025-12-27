import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../ui/table";

import {
  Search, Download, AlertTriangle,
  CheckCircle, AlertCircle, Package
} from "lucide-react";

import { toast } from "sonner";

type StockStatus = "all" | "low" | "sufficient" | "out";

export default function StockReport() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StockStatus>("all");

  // Fetch products from backend
  useEffect(() => {
    api.get("/products")
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Gagal memuat data produk"));
  }, []);

  // Extract unique categories
  const categories = Array.from(
    new Set(products.map((p) => p.category?.name || "Tanpa Kategori"))
  );

  const getStockStatus = (stock: number, minStock: number) => {
    const currentStock = Number(stock);
    const minimumStock = Number(minStock);

    if (currentStock === 0) return "out";
    if (currentStock > minimumStock) return "sufficient";
    return "low";
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      out: {
        label: "Habis",
        color: "bg-red-500",
        icon: AlertTriangle,
        textColor: "text-red-600",
      },
      low: {
        label: "Stok Rendah",
        color: "bg-orange-500",
        icon: AlertCircle,
        textColor: "text-orange-600",
      },
      sufficient: {
        label: "Cukup",
        color: "bg-green-500",
        icon: CheckCircle,
        textColor: "text-green-600",
      },
    };
    return configs[status as keyof typeof configs];
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const categoryName = product.category?.name || "Tanpa Kategori";

    const matchesCategory =
      categoryFilter === "all" || categoryFilter === categoryName;

    const productStatus = getStockStatus(product.stock, product.minStock);

    const matchesStatus =
      statusFilter === "all" || productStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stockStats = {
    total: products.length,
    low: products.filter(
      (p) => getStockStatus(p.stock, p.minStock) === "low"
    ).length,
    out: products.filter(
      (p) => getStockStatus(p.stock, p.minStock) === "out"
    ).length,
    sufficient: products.filter(
      (p) => getStockStatus(p.stock, p.minStock) === "sufficient"
    ).length,
  };

  const handleExport = (format: string) => {
    toast.success(`Laporan stok diekspor (${format.toUpperCase()})`);
  };

  const handleRestock = (product: any) => {
    navigate("/pembelian/input-barang", {
      state: { restockProduct: product },
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Produk</p>
                <h3 className="text-3xl text-white">{stockStats.total}</h3>
              </div>
              <Package className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-green-500 to-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Stok Cukup</p>
                <h3 className="text-3xl text-white">{stockStats.sufficient}</h3>
              </div>
              <CheckCircle className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-yellow-500 to-yellow-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Stok Rendah</p>
                <h3 className="text-3xl text-white">{stockStats.low}</h3>
              </div>
              <AlertCircle className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-red-500 to-red-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Stok Habis</p>
                <h3 className="text-3xl text-white">{stockStats.out}</h3>
              </div>
              <AlertTriangle className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Laporan Stok Produk</CardTitle>
              <CardDescription>
                Pantau ketersediaan stok produk secara real-time
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleExport("pdf")}
                className="bg-red-600 hover:bg-red-700 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={() => handleExport("excel")}
                className="bg-green-600 hover:bg-green-700 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
              <Input
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 rounded-xl">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StockStatus)}
            >
              <SelectTrigger className="w-full md:w-48 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="sufficient">Stok Cukup</SelectItem>
                <SelectItem value="low">Stok Rendah</SelectItem>
                <SelectItem value="out">Stok Habis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Stok Saat Ini</TableHead>
                  <TableHead>Stok Minimum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => {
                    const status = getStockStatus(p.stock, p.minStock);
                    const config = getStatusConfig(status);
                    const StatusIcon = config.icon;

                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div>
                            <p>{p.name}</p>
                            {p.expiryDate && (
                              <p className="text-xs text-gray-500">
                                Exp:{" "}
                                {new Date(p.expiryDate).toLocaleDateString(
                                  "id-ID"
                                )}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>{p.category?.name || "-"}</TableCell>
                        <TableCell>
                          <span className={config.textColor}>
                            {p.stock} unit
                          </span>
                        </TableCell>

                        <TableCell>{p.minStock} unit</TableCell>

                        <TableCell>
                          <Badge
                            className={`${config.color} text-white border-none flex items-center gap-1`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {status !== "sufficient" ? (
                            <Button
                              size="sm"
                              className="!bg-blue-600 !text-white hover:!bg-blue-700 rounded-lg shadow-sm"
                              onClick={() => handleRestock(p)}
                            >
                              Restock
                            </Button>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-600 border border-slate-200">
                              Cukup
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
