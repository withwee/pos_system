import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "../ui/dialog";

import {
  AlertTriangle, Trash2, Calendar, Package
} from "lucide-react";
import { toast } from "sonner";
import { usePOS } from '../../contexts/POSContext';

// Product interface (sesuaikan backend)
interface Product {
  id: number;
  name: string;
  stock: number;
  expiryDate?: string;
  brand?: string;
  minStock: number;
}

interface ExpiredItem {
  product: Product;
  expiryDate: string;
  stock: number;
  status: "expired" | "near-expired";
}

export default function ExpiredItems() {
  const [products, setProducts] = useState<Product[]>([]);
  const [expiredItems, setExpiredItems] = useState<ExpiredItem[]>([]);
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [selectedItem, setSelectedItem] = useState<ExpiredItem | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Fetch products
  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Gagal memuat data produk"));
  }, []);

  // Deteksi kadaluarsa
  useEffect(() => {
    const items: ExpiredItem[] = [];
    const today = new Date();
    const next30 = new Date();
    next30.setDate(today.getDate() + 30);

    products.forEach((p) => {
      if (!p.expiryDate) return;

      const exp = new Date(p.expiryDate);
      if (p.stock <= 0) return;

      if (exp < today) {
        items.push({
          product: p,
          expiryDate: p.expiryDate!,
          stock: p.stock,
          status: "expired",
        });
      } else if (exp <= next30) {
        items.push({
          product: p,
          expiryDate: p.expiryDate!,
          stock: p.stock,
          status: "near-expired",
        });
      }
    });

    // Sort berdasarkan tanggal terdekat
    setExpiredItems(
      items.sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      )
    );
  }, [products]);

  const expiredCount = expiredItems.filter((i) => i.status === "expired").length;
  const nearExpiredCount = expiredItems.filter((i) => i.status === "near-expired").length;

  // Open remove dialog
  const openRemoveDialog = (item: ExpiredItem) => {
    setSelectedItem(item);
    setRemoveQuantity("");
    setShowDialog(true);
  };

  // Confirm remove stock
  const confirmRemove = async () => {
    if (!selectedItem) return;

    const qty = Number(removeQuantity);
    if (!qty || qty <= 0) {
      toast.error("Masukkan jumlah valid");
      return;
    }

    if (qty > selectedItem.stock) {
      toast.error("Jumlah melebihi stok tersedia");
      return;
    }

    try {
      const newStock = selectedItem.stock - qty;
      await api.put(`/products/${selectedItem.product.id}`, {
        stock: newStock,
      });

      toast.success(`${qty} unit berhasil dihapus dari stok`);

      // Update local list
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedItem.product.id ? { ...p, stock: newStock } : p
        )
      );

      setShowDialog(false);
      setSelectedItem(null);
    } catch (err) {
      toast.error("Gagal menghapus stok");
    }
  };

  const statusBadge = (status: "expired" | "near-expired") => {
    if (status === "expired") {
      return (
        <Badge className="bg-red-500 text-white border-none">
          <AlertTriangle className="w-3 h-3 mr-1" /> Kadaluarsa
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500 text-white border-none">
        <Calendar className="w-3 h-3 mr-1" /> Hampir Kadaluarsa
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-red-500 to-red-600">
          <CardContent className="p-6">
            <p className="text-white/80 text-sm">Kadaluarsa</p>
            <h3 className="text-3xl text-white">{expiredCount}</h3>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-yellow-500 to-yellow-600">
          <CardContent className="p-6">
            <p className="text-white/80 text-sm">Hampir Kadaluarsa</p>
            <h3 className="text-3xl text-white">{nearExpiredCount}</h3>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="p-6">
            <p className="text-white/80 text-sm">Total Item</p>
            <h3 className="text-3xl text-white">{expiredItems.length}</h3>
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Produk Kadaluarsa & Hampir Kadaluarsa</CardTitle>
          <CardDescription>
            Kelola stok produk yang melewati batas tanggal simpan
          </CardDescription>
        </CardHeader>

        <CardContent>
          {expiredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-400" />
              <p className="text-gray-600">Tidak ada produk kadaluarsa</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Tanggal Exp</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {expiredItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <p>{item.product.name}</p>
                        <p className="text-sm text-gray-500">{item.product.brand || "-"}</p>
                      </TableCell>

                      <TableCell>
                        {new Date(item.expiryDate).toLocaleDateString("id-ID")}
                      </TableCell>

                      <TableCell>
                        <span className={item.status === "expired" ? "text-red-600" : "text-yellow-600"}>
                          {item.stock} unit
                        </span>
                      </TableCell>

                      <TableCell>{statusBadge(item.status)}</TableCell>

                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => openRemoveDialog(item)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus Stok
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Hapus Stok Kadaluarsa</DialogTitle>
            <DialogDescription>Masukkan jumlah stok yang ingin dihapus</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium">{selectedItem.product.name}</p>
                <p className="text-sm text-gray-500">
                  Stok tersedia: {selectedItem.stock} unit
                </p>
              </div>

              <div>
                <Label>Jumlah yang dihapus</Label>
                <Input
                  type="number"
                  value={removeQuantity}
                  onChange={(e) => setRemoveQuantity(e.target.value)}
                  placeholder="Masukkan jumlah"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmRemove}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
