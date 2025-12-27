import { useState } from 'react';
import { usePOS } from '../../contexts/POSContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';

import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  Package,
} from 'lucide-react';

import { toast } from 'sonner';

export default function SalesTransaction() {
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, refreshProducts, refreshTransactions } = usePOS();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [applyTax, setApplyTax] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) && product.stock > 0
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );

  const tax = applyTax ? subtotal * 0.11 : 0;
  const total = subtotal - discount + tax;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast.error('Pilih metode pembayaran');
      return;
    }

    try {
      const methodMap: Record<string, string> = {
        Tunai: 'cash',
        'Transfer Bank': 'debit',
        'E-Wallet': 'qris',
        'Kartu Kredit': 'credit',
        cash: 'cash',
        debit: 'debit',
        credit: 'credit',
        qris: 'qris',
      };

      const normalizedMethod = methodMap[selectedPayment] || 'cash';

      const payload = {
        paymentMethod: normalizedMethod,
        customerName: customerName || 'Walk-in Customer',
        items: cart.map((item) => ({
          productId: Number(item.product.id),
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/transactions', payload);
      const inv = res.data?.transactionNumber || res.data?.transactionId || 'Berhasil';

      setInvoiceNo(inv);
      clearCart();
      setDiscount(0);
      setCustomerName('Walk-in Customer');
      setShowPayment(false);
      setShowSuccess(true);
      await refreshProducts();
      await refreshTransactions();
      toast.success('Transaksi berhasil dicatat');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Gagal memproses transaksi';
      toast.error(msg);
    }
  };

  const paymentMethods = [
    { id: 'cash', name: 'Tunai', icon: Banknote },
    { id: 'transfer', name: 'Transfer Bank', icon: CreditCard },
    { id: 'ewallet', name: 'E-Wallet', icon: Smartphone },
    { id: 'card', name: 'Kartu Kredit', icon: CreditCard },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product List */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />

              <Input
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-[#6c757d] mb-2" />
                  <p className="text-[#6c757d]">Tidak ada produk ditemukan</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow rounded-xl overflow-hidden"
                    onClick={() => addToCart(product, 1)}
                  >
                    <CardContent className="p-3">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-20 flex items-center justify-center mb-2">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>

                      <h4 className="text-sm mb-1 line-clamp-1">{product.name}</h4>

                      <p className="text-xs text-[#007BFF]">
                        Rp {product.salePrice.toLocaleString('id-ID')}
                      </p>

                      <p className="text-xs text-[#6c757d]">Stok: {product.stock}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Summary */}
      <div className="space-y-4">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Keranjang
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Pelanggan</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="rounded-xl"
                placeholder="Nama pelanggan"
              />
            </div>

            <Separator />

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-[#6c757d] py-8">Keranjang kosong</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm mb-1 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-[#6c757d]">
                          Rp {item.product.salePrice.toLocaleString('id-ID')}
                        </p>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-lg"
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>

                        <span className="w-12 text-center">{item.quantity}</span>

                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-lg"
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <p>
                        Rp {(item.product.salePrice * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-[#6c757d]">Subtotal</p>
                <p>Rp {subtotal.toLocaleString('id-ID')}</p>
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Diskon"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>

              <div className="flex justify-between">
                <label className="flex items-center gap-2 text-sm text-[#6c757d]">
                  <input
                    type="checkbox"
                    checked={applyTax}
                    onChange={(e) => setApplyTax(e.target.checked)}
                  />
                  Pajak 11%
                </label>
                <p>Rp {tax.toLocaleString('id-ID')}</p>
              </div>

              <Separator />

              <div className="flex justify-between">
                <p>Total</p>
                <p className="text-xl text-[#007BFF]">
                  Rp {total.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-[#007BFF] hover:bg-[#0056b3] rounded-xl h-12"
            >
              Checkout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Metode Pembayaran</DialogTitle>
            <DialogDescription>Pilih metode pembayaran</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                className={`cursor-pointer rounded-xl transition-all ${
                  selectedPayment === method.name
                    ? 'border-[#007BFF] border-2 bg-blue-50'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment(method.name)}
              >
                <CardContent className="p-6 text-center">
                  <method.icon className="w-8 h-8 mx-auto mb-2 text-[#007BFF]" />
                  <p className="text-sm">{method.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPayment(false)}
              className="rounded-xl"
            >
              Batal
            </Button>

            <Button
              onClick={handlePayment}
              className="bg-[#007BFF] hover:bg-[#0056b3] rounded-xl"
            >
              Konfirmasi Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="rounded-2xl text-center">
          <DialogHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <DialogTitle>Pembayaran Berhasil!</DialogTitle>
            <DialogDescription>
              Transaksi telah diproses
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-[#6c757d] mb-1">No. Invoice</p>
              <p className="text-xl">{invoiceNo}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => {
                  toast.success('Invoice berhasil dicetak');
                  setShowSuccess(false);
                }}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>

              <Button
                className="flex-1 bg-[#007BFF] hover:bg-[#0056b3] rounded-xl"
                onClick={() => setShowSuccess(false)}
              >
                Selesai
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
