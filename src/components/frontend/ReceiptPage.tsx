import { useLocation, useNavigate } from "react-router-dom";

import { usePOS } from '../../contexts/POSContext';

// UI COMPONENTS
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

// ICONS
import { ArrowLeft, Printer } from "lucide-react";

// TOAST
import { toast } from "sonner";

export default function ReceiptPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { storeName } = usePOS();
  const transactionData = location.state?.transaction;

  if (!transactionData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-[#6c757d]">Data transaksi tidak ditemukan</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
    toast.success('Struk berhasil dicetak');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header - Hide on print */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl mb-2">Detail Struk</h1>
          <p className="text-[#6c757d]">Struk pembayaran #{transactionData.invoiceNo}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/transaksi/penjualan')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-[#007BFF] hover:bg-[#0056b3] rounded-xl"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak Struk
          </Button>
        </div>
      </div>

      {/* Receipt Card */}
      <Card className="rounded-2xl shadow-lg max-w-md mx-auto">
        <CardContent className="p-8">
          {/* Store Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#007BFF] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-white">POS</span>
            </div>
            <h2 className="text-2xl mb-1">{storeName}</h2>
            <p className="text-sm text-[#6c757d]">Jl. Raya No. 123, Jakarta</p>
            <p className="text-sm text-[#6c757d]">Telp: (021) 1234-5678</p>
          </div>

          <Separator className="my-4" />

          {/* Transaction Info */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#6c757d]">No. Invoice</span>
              <span className="">{transactionData.invoiceNo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6c757d]">Tanggal</span>
              <span className="">{formatDate(transactionData.date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6c757d]">Kasir</span>
              <span className="">{transactionData.cashier}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6c757d]">Pelanggan</span>
              <span className="">{transactionData.customer}</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Items */}
          <div className="space-y-3 mb-4">
            <p className="text-sm">Item Pembelian:</p>
            {transactionData.items.map((item: any, index: number) => {
              const price = item.variant ? item.variant.salePrice : (item.product.salePrice || 0);
              const total = price * item.quantity;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="">
                      {item.product.name}
                      {item.variant && ` (${item.variant.size})`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-[#6c757d]">
                    <span>{item.quantity} x Rp {price.toLocaleString('id-ID')}</span>
                    <span className="">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6c757d]">Subtotal</span>
              <span className="">Rp {transactionData.subtotal.toLocaleString('id-ID')}</span>
            </div>
            {transactionData.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6c757d]">Diskon</span>
                <span className="text-red-600">- Rp {transactionData.discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            {transactionData.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6c757d]">Pajak</span>
                <span className="">Rp {transactionData.tax.toLocaleString('id-ID')}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="">Total</span>
              <span className="text-xl">Rp {transactionData.total.toLocaleString('id-ID')}</span>
            </div>

            {/* Cash Payment Details */}
            {transactionData.paymentMethod === 'Tunai' && transactionData.amountReceived && (
              <>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#6c757d]">Jumlah Dibayar</span>
                  <span className="">Rp {transactionData.amountReceived.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Kembalian</span>
                  <span className="text-green-600">
                    Rp {(transactionData.amountReceived - transactionData.total).toLocaleString('id-ID')}
                  </span>
                </div>
              </>
            )}
          </div>

          <Separator className="my-4" />

          {/* Payment Method */}
          <div className="text-center mb-4">
            <p className="text-sm text-[#6c757d]">Metode Pembayaran</p>
            <p className="">{transactionData.paymentMethod}</p>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-dashed">
            <p className="text-sm mb-1">Terima kasih telah berbelanja di {storeName}</p>
            <p className="text-xs text-[#6c757d]">Barang yang sudah dibeli tidak dapat ditukar</p>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}