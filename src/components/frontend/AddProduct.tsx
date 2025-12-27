// src/components/pembelian/AddProduct.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, RotateCcw, Ruler, Info, Package } from "lucide-react";
import api from "../../services/api";
import { usePOS } from "../../contexts/POSContext";

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Unit {
  id: number;
  name: string;
  symbol: string;
  type: string;
}

interface FormData {
  name: string;
  categoryId: string;
  unitId: string;
  sku: string;
  price: string;
  cost: string;
  stock: string;
  minStock: string;
  expiryDate: string;
  description: string;
}

const formatCurrency = (value: number) =>
  `Rp ${Math.round(value).toLocaleString("id-ID")}`;

export default function AddProduct() {
  const navigate = useNavigate();
  const { addProduct, refreshProducts, updateProduct, products, addPurchaseEntry } = usePOS();
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedExistingId, setSelectedExistingId] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    categoryId: "",
    unitId: "",
    sku: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    expiryDate: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [categoriesRes, unitsRes] = await Promise.all([
          api.get("/categories"),
          api.get("/units"),
        ]);

        const categoriesData = categoriesRes.data.success
          ? categoriesRes.data.data
          : categoriesRes.data;
        setCategories(categoriesData || []);

        const unitsData = unitsRes.data.success ? unitsRes.data.data : unitsRes.data;
        setUnits(unitsData || []);

        const defaultUnit = unitsData.find((u: Unit) => u.symbol === "pcs");
        if (defaultUnit) {
          setFormData((prev) => ({ ...prev, unitId: defaultUnit.id.toString() }));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Gagal memuat data kategori dan satuan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedExistingId) {
      return;
    }

    const existing = products.find((p) => p.id === selectedExistingId);
    if (!existing) {
      return;
    }

    const categoryId =
      existing.categoryId ??
      categories.find((cat) => cat.name === existing.category)?.id;
    const unitId =
      existing.unitId ??
      units.find((unit) => unit.symbol === existing.unitSymbol)?.id ??
      units.find((unit) => unit.name === existing.unitName)?.id;

    setFormData({
      name: existing.name || "",
      categoryId: categoryId ? String(categoryId) : "",
      unitId: unitId ? String(unitId) : "",
      sku: existing.sku || "",
      price:
        existing.salePrice !== undefined ? String(existing.salePrice) : "",
      cost:
        existing.purchasePrice !== undefined
          ? String(existing.purchasePrice)
          : "",
      stock: "",
      minStock: existing.minStock ? String(existing.minStock) : "",
      expiryDate: existing.expiryDate || "",
      description: existing.description || "",
    });
  }, [selectedExistingId, products, categories, units]);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      alert("Nama produk wajib diisi");
      return false;
    }
    if (!formData.categoryId) {
      alert("Kategori wajib dipilih");
      return false;
    }
    if (!formData.unitId) {
      alert("Satuan wajib dipilih");
      return false;
    }
    if (!formData.sku.trim()) {
      alert("SKU wajib diisi");
      return false;
    }
    if (!formData.price) {
      alert("Harga jual wajib diisi");
      return false;
    }
    if (!formData.cost) {
      alert("Harga beli wajib diisi");
      return false;
    }
    if (!formData.stock) {
      alert("Stok awal wajib diisi");
      return false;
    }
    if (Number(formData.stock) <= 0) {
      alert("Stok harus lebih dari 0");
      return false;
    }

    if (Number(formData.price) <= Number(formData.cost)) {
      alert("Harga jual harus lebih besar dari harga beli");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Cek token
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesi Anda telah berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      if (selectedExistingId) {
        const existing = products.find((p) => p.id === selectedExistingId);
        if (!existing) {
          alert("Produk tidak ditemukan");
          return;
        }

        const additionalStock = parseFloat(formData.stock);
        const updatedStock = existing.stock + additionalStock;

        await updateProduct(existing.id, {
          stock: updatedStock,
          purchasePrice: parseFloat(formData.cost),
          salePrice: parseFloat(formData.price),
          minStock: formData.minStock
            ? parseFloat(formData.minStock)
            : existing.minStock,
          expiryDate: formData.expiryDate || existing.expiryDate,
          description: formData.description.trim() || existing.description,
        });

        addPurchaseEntry({
          productId: existing.id,
          date: new Date().toISOString().slice(0, 10),
          product: existing.name,
          quantity: additionalStock,
          totalCost: parseFloat(formData.cost) * additionalStock,
          supplier: existing.supplier || "Unknown",
          addedBy: "Admin",
        });

        await refreshProducts();
        alert("ƒo. Stok produk berhasil diperbarui!");
        setFormData((prev) => ({ ...prev, stock: "" }));
        return;
      }

      const payload = {
        name: formData.name.trim(),
        categoryId: parseInt(formData.categoryId),
        unitId: parseInt(formData.unitId),
        sku: formData.sku.trim().toUpperCase(),
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseFloat(formData.stock),
        minStock: formData.minStock ? parseFloat(formData.minStock) : 5,
        expiryDate: formData.expiryDate || null,
        description: formData.description.trim() || null,
      };

      console.log("Sending payload:", payload);

      await addProduct(payload);

      alert("ƒo. Produk berhasil ditambahkan!");
      handleReset();

      // Optional: redirect ke halaman daftar produk
      // navigate("/products");

    } catch (error: any) {
      console.error("Submit error:", error);
      
      const status = error?.response?.status;
      const apiMsg = error?.response?.data?.message;

      if (status === 401) {
        alert("❌ Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else if (status === 403) {
        alert("❌ Akses ditolak. Hanya admin yang boleh menambah produk.");
      } else if (status === 400 && apiMsg?.includes("SKU")) {
        alert("❌ SKU sudah digunakan. Gunakan SKU yang berbeda.");
      } else {
        alert(`❌ ${apiMsg || "Gagal menambahkan produk"}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      categoryId: "",
      unitId: units.find((u) => u.symbol === "pcs")?.id.toString() || "",
      sku: "",
      price: "",
      cost: "",
      stock: "",
      minStock: "",
      expiryDate: "",
      description: "",
    });
  };

  const selectedUnit = units.find((u) => u.id.toString() === formData.unitId);
  const priceValue = Number(formData.price || 0);
  const costValue = Number(formData.cost || 0);
  const stockValue = Number(formData.stock || 0);
  const marginValue = Math.max(priceValue - costValue, 0);
  const totalCost = costValue * stockValue;
  const totalRevenue = priceValue * stockValue;
  const totalProfit = Math.max(totalRevenue - totalCost, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Input Barang
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Tambahkan produk baru ke sistem (bukan untuk restok)
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Nama & Kategori */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nama Produk <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      readOnly={!!selectedExistingId}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Masukkan nama produk"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      disabled={!!selectedExistingId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none cursor-pointer"
                    >
                      <option value="">Pilih kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SKU & Satuan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => {
                        const value = e.target.value;
                        const matched = products.find(
                          (p) => p.sku?.toLowerCase() === value.toLowerCase()
                        );

                        if (matched) {
                          setSelectedExistingId(matched.id);
                          setFormData((prev) => ({ ...prev, sku: value }));
                          return;
                        }

                        if (selectedExistingId) {
                          setSelectedExistingId("");
                          setFormData({
                            name: "",
                            categoryId: "",
                            unitId:
                              units.find((u) => u.symbol === "pcs")?.id.toString() ||
                              "",
                            sku: value,
                            price: "",
                            cost: "",
                            stock: "",
                            minStock: "",
                            expiryDate: "",
                            description: "",
                          });
                        } else {
                          setFormData((prev) => ({ ...prev, sku: value }));
                        }
                      }}
                      list="sku-options"
                      placeholder="Contoh: BRS-001"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                    <datalist id="sku-options">
                      {products
                        .filter((product) => product.sku)
                        .map((product) => (
                          <option key={product.id} value={product.sku || ""}>
                            {product.sku} - {product.name}
                          </option>
                        ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Ruler className="w-4 h-4 text-blue-600" />
                      Satuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.unitId}
                      disabled={!!selectedExistingId}
                      onChange={(e) =>
                        setFormData({ ...formData, unitId: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none cursor-pointer"
                    >
                      <option value="">Pilih satuan</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Harga Beli & Harga Jual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Harga Beli <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-stretch rounded-xl border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500">
                      <div className="flex items-center px-4 text-slate-600 font-medium border-r border-slate-300">
                        Rp
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.cost}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cost: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        placeholder="0"
                        className="w-full px-4 py-3 bg-transparent outline-none text-right rounded-r-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Harga Jual <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-stretch rounded-xl border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500">
                      <div className="flex items-center px-4 text-slate-600 font-medium border-r border-slate-300">
                        Rp
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        placeholder="0"
                        className="w-full px-4 py-3 bg-transparent outline-none text-right rounded-r-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Stok Awal & Stok Minimum */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {selectedExistingId ? "Tambah Stok" : "Stok Awal"} <span className="text-red-500">*</span>
                      {selectedUnit && (
                        <span className="text-slate-500 font-normal ml-1">
                          ({selectedUnit.symbol})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Stok Minimum
                      {selectedUnit && (
                        <span className="text-slate-500 font-normal ml-1">
                          ({selectedUnit.symbol})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minStock}
                      onChange={(e) =>
                        setFormData({ ...formData, minStock: e.target.value })
                      }
                      placeholder="5"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Tanggal Kadaluarsa */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tanggal Kadaluarsa
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Deskripsi produk (opsional)"
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    {submitting ? "Menyimpan..." : "Tambah Produk"}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-60"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Panduan Input</h3>
              </div>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>Pastikan SKU unik agar tidak bentrok dengan produk lain.</li>
                <li>Harga jual harus lebih besar dari harga beli.</li>
                <li>Stok minimum dipakai untuk peringatan stok menipis.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Ringkasan Data</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Total kategori</span>
                  <span className="font-semibold text-slate-900">{categories.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total satuan</span>
                  <span className="font-semibold text-slate-900">{units.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Satuan default</span>
                  <span className="font-semibold text-slate-900">
                    {selectedUnit ? `${selectedUnit.name} (${selectedUnit.symbol})` : "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Akumulasi Harga</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Harga beli / unit</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(costValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Harga jual / unit</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(priceValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Margin / unit</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(marginValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total modal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Potensi omzet</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Potensi profit</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(totalProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
