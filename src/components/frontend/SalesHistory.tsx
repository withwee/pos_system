import { useEffect, useMemo, useState } from 'react';
import { usePOS } from '../../contexts/POSContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

import { Separator } from '../ui/separator';

import { Search, Download, FileText, Calendar, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function SalesHistory() {
  const { transactions, refreshTransactions } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] =
    useState<typeof transactions[0] | null>(null);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  const filteredTransactions = useMemo(
    () =>
      transactions
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .filter((transaction) =>
          transaction.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.customer.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [transactions, searchTerm]
  );

  const handleExport = (format: string) => {
    toast.success(`Riwayat penjualan berhasil diekspor ke format ${format.toUpperCase()}`);
  };

  const handlePrint = () => {
    toast.success('Invoice berhasil dicetak');
  };

  const getPaymentBadge = (method: string) => {
    const colors: Record<string, string> = {
      Cash: 'bg-green-500',
      Tunai: 'bg-green-500',
      'Transfer Bank': 'bg-blue-500',
      'E-Wallet': 'bg-purple-500',
      'Kartu Kredit': 'bg-orange-500',
    };
    return colors[method] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Riwayat Penjualan</CardTitle>
              <CardDescription>
                Daftar semua transaksi penjualan yang telah dilakukan
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleExport('pdf')}
                className="bg-red-600 hover:bg-red-700 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={() => handleExport('excel')}
                className="bg-green-600 hover:bg-green-700 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
            <Input
              placeholder="Cari no. invoice atau pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
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
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kasir</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-[#6c757d]">
                      Tidak ada data transaksi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#6c757d]" />
                          {transaction.invoiceNo}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#6c757d]" />
                          {new Date(transaction.date).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </TableCell>

                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>Rp {transaction.total.toLocaleString('id-ID')}</TableCell>

                      <TableCell>
                        <Badge
                          className={`${getPaymentBadge(transaction.paymentMethod)} text-white border-none`}
                        >
                          {transaction.paymentMethod}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className="bg-green-500 text-white border-none">
                          {transaction.status}
                        </Badge>
                      </TableCell>

                      <TableCell>{transaction.cashier}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detail Invoice
            </DialogTitle>
            <DialogDescription>Informasi lengkap tentang transaksi</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-br from-[#007BFF] to-[#00BCD4] p-6 rounded-xl text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">No. Invoice</p>
                  <p className="text-sm opacity-90">
                    {new Date(selectedTransaction.date).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <h3 className="text-2xl">{selectedTransaction.invoiceNo}</h3>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#6c757d] mb-1">Pelanggan</p>
                  <p>{selectedTransaction.customer}</p>
                </div>

                <div>
                  <p className="text-sm text-[#6c757d] mb-1">Kasir</p>
                  <p>{selectedTransaction.cashier}</p>
                </div>

                <div>
                  <p className="text-sm text-[#6c757d] mb-1">Metode Pembayaran</p>
                  <Badge
                    className={`${getPaymentBadge(selectedTransaction.paymentMethod)} text-white border-none`}
                  >
                    {selectedTransaction.paymentMethod}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-[#6c757d] mb-1">Status</p>
                  <Badge className="bg-green-500 text-white border-none">
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <p className="mb-3">Item Pembelian</p>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm mb-1">{item.product.name}</p>
                        <p className="text-xs text-[#6c757d]">
                          {item.quantity} x Rp {item.product.salePrice.toLocaleString('id-ID')}
                        </p>
                      </div>

                      <p>
                        Rp {(item.quantity * item.product.salePrice).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-[#6c757d]">Subtotal</p>
                  <p>Rp {selectedTransaction.subtotal.toLocaleString('id-ID')}</p>
                </div>

                {selectedTransaction.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <p>Diskon</p>
                    <p>- Rp {selectedTransaction.discount.toLocaleString('id-ID')}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <p className="text-[#6c757d]">Pajak (10%)</p>
                  <p>Rp {selectedTransaction.tax.toLocaleString('id-ID')}</p>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <p>Total</p>
                  <p className="text-2xl text-[#007BFF]">
                    Rp {selectedTransaction.total.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1 rounded-xl" variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>

                <Button className="flex-1 rounded-xl" variant="outline" onClick={() => handleExport('pdf')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
