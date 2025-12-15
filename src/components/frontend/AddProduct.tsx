import { useState, useEffect } from "react";
import { ArrowLeft, Package, Plus, RotateCcw, Ruler, Info } from "lucide-react";

// Mock data untuk demo
const mockCategories = [
  { id: 1, name: "Makanan" },
  { id: 2, name: "Minuman" },
  { id: 3, name: "Snack" }
];

const mockUnits = [
  { id: 1, name: "Piece", symbol: "pcs", type: "piece" },
  { id: 2, name: "Kilogram", symbol: "kg", type: "weight" },
  { id: 3, name: "Gram", symbol: "gr", type: "weight" },
  { id: 4, name: "Liter", symbol: "L", type: "volume" },
  { id: 5, name: "Mililiter", symbol: "ml", type: "volume" },
  { id: 6, name: "Pack", symbol: "pack", type: "package" },
  { id: 7, name: "Box", symbol: "box", type: "package" },
  { id: 8, name: "Lusin", symbol: "lusin", type: "package" },
  { id: 9, name: "Karton", symbol: "karton", type: "package" },
  { id: 10, name: "Renteng", symbol: "renteng", type: "package" },
  { id: 11, name: "Ikat", symbol: "ikat", type: "package" }
];

export default function AddProduct() {
  const [categories, setCategories] = useState(mockCategories);
  const [units, setUnits] = useState(mockUnits);

  const [formData, setFormData] = useState({
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

  const handleSubmit = () => {
    // Validasi
    if (!formData.name || !formData.categoryId || !formData.unitId || 
        !formData.sku || !formData.price || !formData.cost || !formData.stock) {
      alert("Semua field wajib diisi!");
      return;
    }

    if (Number(formData.price) <= Number(formData.cost)) {
      alert("Harga jual harus lebih besar dari harga beli!");
      return;
    }

    console.log("Form submitted:", formData);
    alert("Produk berhasil ditambahkan! (Demo Mode)");
    handleReset();
  };

  const handleReset = () => {
    setFormData({
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
  };

  const selectedUnit = units.find(u => u.id.toString() === formData.unitId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tambah Produk Baru</h1>
              <p className="text-slate-600 mt-1">Masukkan detail produk dengan lengkap dan benar</p>
            </div>
          </div>
        </div>

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
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Harga Beli <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                      <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Harga Jual <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
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
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Produk
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Ruler className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">Informasi Satuan</h3>
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
                <h3 className="font-semibold text-slate-900 mb-3">💰 Perhitungan Keuntungan</h3>
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