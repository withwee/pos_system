import { useState, useEffect } from "react";
import { ArrowLeft, Package, Plus, RotateCcw, Ruler, Info, Loader2 } from "lucide-react";
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
  description: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function AddProduct() {
  const { addProduct } = usePOS();
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    categoryId: "",
    unitId: "",
    sku: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    description: "",
  });

useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [categoriesRes, unitsRes] = await Promise.all([
          api.get("/categories"),
          api.get("/units")
        ]);

        const categoriesData = categoriesRes.data.success 
          ? categoriesRes.data.data 
          : categoriesRes.data;
        setCategories(categoriesData || []);

        const unitsData = unitsRes.data.success 
          ? unitsRes.data.data 
          : unitsRes.data;
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Nama produk wajib diisi";
    if (!formData.categoryId) newErrors.categoryId = "Kategori wajib dipilih";
    if (!formData.unitId) newErrors.unitId = "Satuan wajib dipilih";
    if (!formData.sku.trim()) newErrors.sku = "SKU wajib diisi";
    if (!formData.price) newErrors.price = "Harga jual wajib diisi";
    if (!formData.cost) newErrors.cost = "Harga beli wajib diisi";
    if (!formData.stock) newErrors.stock = "Stok awal wajib diisi";

    if (formData.price && formData.cost) {
      if (Number(formData.price) <= Number(formData.cost)) {
        newErrors.price = "Harga jual harus lebih besar dari harga beli";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Mohon perbaiki kesalahan pada form");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        categoryId: parseInt(formData.categoryId),
        unitId: parseInt(formData.unitId),
        sku: formData.sku.trim().toUpperCase(),
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseFloat(formData.stock),
        minStock: formData.minStock ? parseFloat(formData.minStock) : 5,
        description: formData.description.trim() || null,
      };

      const saved = await addProduct(payload);

      if (!saved) {
        throw new Error("Gagal menyimpan produk");
      }

      alert("Produk berhasil ditambahkan!");
      handleReset();
    } catch (error: any) {
      console.error("Submit error:", error);
      const status = error?.response?.status;
      const apiMsg = error?.response?.data?.message;
      let errorMessage =
        apiMsg ||
        error?.message ||
        "Gagal menambahkan produk";

      if (status === 401) {
        errorMessage = apiMsg || "Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.";
      } else if (status === 403) {
        errorMessage = apiMsg || "Akses ditolak. Hanya admin yang boleh menambah produk.";
      }

      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      categoryId: "",
      unitId: units.find(u => u.symbol === "pcs")?.id.toString() || "",
      sku: "",
      price: "",
      cost: "",
      stock: "",
      minStock: "",
      description: "",
    });
    setErrors({});
  };

  const selectedUnit = units.find((u) => u.id.toString() === formData.unitId);

  const calculateProfit = () => {
    if (!formData.price || !formData.cost) return null;
    const profit = Number(formData.price) - Number(formData.cost);
    const margin = ((profit / Number(formData.price)) * 100).toFixed(1);
    return { profit, margin };
  };
  const [errors, setErrors] = useState<FormErrors>({});
  const profitData = calculateProfit();

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
                <h2 className="text-xl font-semibold text-slate-900">Informasi Produk</h2>
                <p className="text-sm text-slate-600 mt-1">Data produk untuk sistem inventory</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Nama & SKU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nama Produk <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Beras Premium"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Contoh: BRS-001"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Kategori & Satuan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Ruler className="w-4 h-4 text-blue-600" />
                      Satuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.unitId}
                      onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
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
                {/* Harga Beli */}
                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Harga Beli <span className="text-red-500">*</span>
                </label>

                <div className="flex items-stretch rounded-xl border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500">
                  
                  {/* PREFIX */}
                  <div className="flex items-center px-4 text-slate-600 font-medium border-r border-slate-300">
                    Rp
                  </div>

                  {/* INPUT */}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cost: e.target.value.replace(/\D/g, "")
                      })
                    }
                    placeholder="0"
                    className="w-full px-4 py-3 bg-transparent outline-none text-right rounded-r-xl"
                  />
                </div>
              </div>

                {/* Harga Jual */}
                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Harga Jual <span className="text-red-500">*</span>
                </label>
                  <div className="flex items-stretch rounded-xl border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500">
                  {/* PREFIX */}
                  <div className="flex items-center px-4 text-slate-600 font-medium border-r border-slate-300">
                    Rp
                  </div>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: e.target.value.replace(/\D/g, "")
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
                      Stok Awal <span className="text-red-500">*</span>
                      {selectedUnit && (
                        <span className="text-slate-500 font-normal ml-1">({selectedUnit.symbol})</span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Stok Minimum
                      {selectedUnit && (
                        <span className="text-slate-500 font-normal ml-1">({selectedUnit.symbol})</span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      placeholder="5"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-black font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
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
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Status</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Isi form untuk menambahkan produk baru ke inventory. Semua field yang bertanda (*) wajib diisi.
              </p>
            </div>

            {/* Unit Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Info</h3>
              </div>
              
              {selectedUnit ? (
                <div className="space-y-3">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Satuan Terpilih</p>
                    <p className="text-lg font-bold text-blue-600">{selectedUnit.name}</p>
                    <p className="text-sm text-slate-600 mt-1">Simbol: <span className="font-semibold">{selectedUnit.symbol}</span></p>
                  </div>
                  
                  <div className="text-sm text-slate-700 space-y-2">
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Stok akan dicatat dalam satuan <strong>{selectedUnit.symbol}</strong></span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Pastikan konsisten menggunakan satuan ini untuk produk sejenis</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-700 mb-3">💡 Tips Memilih Satuan:</p>
                  <div className="space-y-2">
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>kg/gr</strong> - untuk barang dengan berat (beras, gula, dll)</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>L/ml</strong> - untuk cairan (minyak, air, dll)</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>pcs</strong> - untuk barang satuan</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>pack/box</strong> - untuk kemasan</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Profit Calculation Card */}
            {formData.price && formData.cost && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Perhitungan Keuntungan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Harga Beli:</span>
                    <span className="font-semibold text-slate-900">Rp {Number(formData.cost).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Harga Jual:</span>
                    <span className="font-semibold text-slate-900">Rp {Number(formData.price).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="pt-2 border-t border-green-300 flex justify-between">
                    <span className="font-semibold text-slate-700">Keuntungan:</span>
                    <span className="font-bold text-green-600">
                      Rp {(Number(formData.price) - Number(formData.cost)).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Margin:</span>
                    <span className="font-semibold text-green-600">
                      {(((Number(formData.price) - Number(formData.cost)) / Number(formData.price)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
