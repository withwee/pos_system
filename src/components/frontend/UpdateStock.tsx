import { useState, useEffect, useRef } from "react";
import { usePOS } from "../../contexts/POSContext";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { Search, Package, ArrowLeft, Save, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

export default function UpdateStock() {
  const { updateProduct, products } = usePOS();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const restockProduct = location.state?.restockProduct ?? null;

  const [selectedProduct, setSelectedProduct] = useState(restockProduct);
  const [openList, setOpenList] = useState(false);

  const [formData, setFormData] = useState({
    additionalStock: "",
    supplier: "",
    purchasePrice: "",
  });

  const [errors, setErrors] = useState({
    additionalStock: "",
    supplier: "",
    purchasePrice: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [newStock, setNewStock] = useState(0);
  const [oldStock, setOldStock] = useState(0);

  const additionalStockRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        additionalStock: "",
        supplier: selectedProduct.supplier,
        purchasePrice: selectedProduct.purchasePrice.toString(),
      });

      setOldStock(selectedProduct.stock);

      setTimeout(() => additionalStockRef.current?.focus(), 100);
    }
  }, [selectedProduct]);

  const validateForm = () => {
    const newErrors = {
      additionalStock: "",
      supplier: "",
      purchasePrice: "",
    };

    if (!formData.additionalStock || Number(formData.additionalStock) <= 0)
      newErrors.additionalStock = "Jumlah stok harus lebih dari 0";

    if (!formData.supplier.trim())
      newErrors.supplier = "Supplier wajib diisi";

    if (!formData.purchasePrice || Number(formData.purchasePrice) <= 0)
      newErrors.purchasePrice = "Harga beli tidak valid";

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) return toast.error("Pilih produk terlebih dahulu");

    if (!validateForm()) return;

    const additional = Number(formData.additionalStock);
    const updatedStock = selectedProduct.stock + additional;

    updateProduct(selectedProduct.id, {
      stock: updatedStock,
      supplier: formData.supplier,
      purchasePrice: Number(formData.purchasePrice),
    });

    setNewStock(updatedStock);
    setShowSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Update Stok Barang</h1>
        <Button variant="outline" onClick={() => navigate("/laporan/stok")} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Update Stok Produk
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Product Select */}
          <div className="space-y-2 mb-6">
            <Label>Pilih Produk</Label>
            <div
              className="border rounded-xl p-3 cursor-pointer bg-white flex justify-between items-center"
              onClick={() => setOpenList(!openList)}
            >
              <span>{selectedProduct ? selectedProduct.name : "Klik untuk memilih produk"}</span>
              <Search className="w-5 h-5 opacity-50" />
            </div>

            {openList && (
              <div className="border rounded-xl mt-2 max-h-60 overflow-y-auto bg-white shadow-md">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setOpenList(false);
                    }}
                    className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between"
                  >
                    <span>{p.name}</span>
                    <Badge>Stok: {p.stock}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedProduct && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Info Produk */}
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-600">Stok saat ini: {oldStock} unit</p>
              </div>

              {/* Tambah Stok */}
              <div className="space-y-2">
                <Label>Jumlah Penambahan *</Label>
                <Input
                  ref={additionalStockRef}
                  type="number"
                  min="1"
                  value={formData.additionalStock}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalStock: e.target.value })
                  }
                  className={cn("rounded-xl", errors.additionalStock && "border-red-500")}
                />
                {errors.additionalStock && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.additionalStock}
                  </p>
                )}
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                  className={cn("rounded-xl", errors.supplier && "border-red-500")}
                />
                {errors.supplier && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.supplier}
                  </p>
                )}
              </div>

              {/* Harga Beli */}
              <div className="space-y-2">
                <Label>Harga Beli *</Label>
                <Input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: e.target.value })
                  }
                  className={cn("rounded-xl", errors.purchasePrice && "border-red-500")}
                />
                {errors.purchasePrice && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.purchasePrice}
                  </p>
                )}
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl" type="submit">
                <Save className="w-4 h-4 mr-2" />
                Update Stok
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="rounded-2xl text-center">
          <DialogHeader>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <DialogTitle className="text-xl">Stok Berhasil Diperbarui!</DialogTitle>
          </DialogHeader>

          <p className="mt-4">
            Stok baru: <strong>{newStock} unit</strong>
          </p>

          <Button
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 rounded-xl"
            onClick={() => navigate("/laporan/stok")}
          >
            Kembali ke Laporan Stok
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
