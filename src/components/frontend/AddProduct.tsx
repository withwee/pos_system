import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchCategories, createProduct, updateProductStock } from "../../services/productServices";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { Package, Plus, RotateCcw, ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import { usePOS } from '../../contexts/POSContext';

export default function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Restock mode check
  const restockProduct = location.state?.restockProduct || null;
  const isRestockMode = !!restockProduct;

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    sku: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    description: "",
  });

  // Fetch categories from backend
  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Gagal memuat kategori"))
      .finally(() => setLoadingCategories(false));
  }, []);

  // Prefill form if restock
  useEffect(() => {
    if (restockProduct) {
      setFormData({
        name: restockProduct.name,
        categoryId: restockProduct.categoryId,
        sku: restockProduct.sku,
        price: restockProduct.price,
        cost: restockProduct.cost,
        stock: "",
        minStock: restockProduct.minStock,
        description: restockProduct.description || "",
      });
    }
  }, [restockProduct]);

  // Submit handler
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isRestockMode) {
      if (!formData.stock) {
        toast.error("Masukkan jumlah stok tambahan");
        return;
      }

      try {
        const newStock = parseInt(restockProduct.stock) + parseInt(formData.stock);
        await updateProductStock(restockProduct.id, { stock: newStock });

        toast.success("Stok produk berhasil diperbarui!");
        navigate("/laporan/stok");
      } catch (err) {
        toast.error("Gagal memperbarui stok");
      }
      return;
    }

    // Normal Create Product
    if (
      !formData.name ||
      !formData.categoryId ||
      !formData.sku ||
      !formData.price ||
      !formData.cost ||
      !formData.stock
    ) {
      toast.error("Semua field wajib diisi");
      return;
    }

    if (Number(formData.price) <= Number(formData.cost)) {
      toast.error("Harga jual harus lebih besar dari harga beli");
      return;
    }

    try {
      await createProduct({
        name: formData.name,
        categoryId: formData.categoryId,
        sku: formData.sku,
        price: formData.price,
        cost: formData.cost,
        stock: formData.stock,
        minStock: formData.minStock || 5,
        description: formData.description,
      });

      toast.success("Produk berhasil ditambahkan!");
      handleReset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menambahkan produk");
    }
  };

  const handleReset = () => {
    if (isRestockMode) {
      navigate("/laporan/stok");
    } else {
      setFormData({
        name: "",
        categoryId: "",
        sku: "",
        price: "",
        cost: "",
        stock: "",
        minStock: "",
        description: "",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {isRestockMode ? "Restok Produk" : "Tambah Produk Baru"}
            </CardTitle>
            <CardDescription>
              {isRestockMode
                ? "Tambahkan stok produk yang sudah ada"
                : "Masukkan detail produk baru"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <Label>Nama Produk</Label>
                  <Input
                    value={formData.name}
                    disabled={isRestockMode}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* SKU */}
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    disabled={isRestockMode}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                </div>

                {/* Category */}
                <div>
                  <Label>Kategori</Label>
                  <Select
                    value={formData.categoryId.toString()}
                    disabled={isRestockMode}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Harga beli */}
                <div>
                  <Label>Harga Beli</Label>
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                  />
                </div>

                {/* Harga jual */}
                <div>
                  <Label>Harga Jual</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>

                {/* Stok */}
                <div>
                  <Label>{isRestockMode ? "Tambah Stok" : "Stok Awal"}</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                  />
                </div>

                {/* Min Stock */}
                {!isRestockMode && (
                  <div>
                    <Label>Stok Minimum</Label>
                    <Input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) =>
                        setFormData({ ...formData, minStock: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" className="rounded-xl bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  {isRestockMode ? "Update Stok" : "Tambah Produk"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="rounded-xl"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Section (Optional Info) */}
      <div>
        <Card className="rounded-2xl shadow-lg p-4">
          <CardTitle className="mb-3 flex gap-2">
            <Clock className="w-5 h-5" /> Status
          </CardTitle>
          <CardContent>
            {isRestockMode && restockProduct ? (
              <div>
                <p>Nama: {restockProduct.name}</p>
                <p>Stok Saat Ini: {restockProduct.stock}</p>
                <p>Minimal Stok: {restockProduct.minStock}</p>
              </div>
            ) : (
              <p>Isi form untuk menambahkan produk baru</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
