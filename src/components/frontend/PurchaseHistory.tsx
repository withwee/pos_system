import { useMemo, useState } from "react";

import { usePOS } from '../../contexts/POSContext';
import "./purchase-history.css";

// UI COMPONENTS
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

// ICONS
import { Search, Download, FileText, Calendar } from "lucide-react";

// TOAST
import { toast } from "sonner";


export default function PurchaseHistory() {
  const { purchases } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<typeof purchases[0] | null>(null);

  const summary = useMemo(() => {
    const totalItems = purchases.reduce((acc, item) => acc + item.quantity, 0);
    const totalCost = purchases.reduce((acc, item) => acc + item.totalCost, 0);
    return { totalItems, totalCost };
  }, [purchases]);

  const filteredPurchases = purchases.filter(purchase => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      purchase.product.toLowerCase().includes(term) ||
      purchase.addedBy.toLowerCase().includes(term)
    );
  });

  const handleExport = (format: string) => {
    toast.success(`Riwayat pembelian berhasil diekspor ke format ${format.toUpperCase()}`);
  };

  return (
    <div className="purchase-history">
      {/* Controls */}
      <Card className="purchase-history__card">
        <CardHeader>
          <div className="purchase-history__header">
            <div>
              <CardTitle>Riwayat Pembelian</CardTitle>
              <CardDescription>Daftar semua pembelian produk yang telah dilakukan</CardDescription>
            </div>
            <div className="purchase-history__actions">
              <Button onClick={() => handleExport('pdf')} className="purchase-history__button purchase-history__button--pdf">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => handleExport('excel')} className="purchase-history__button purchase-history__button--excel">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="purchase-history__summary">
            <div className="purchase-history__summary-item">
              <span>Total transaksi</span>
              <strong>{purchases.length}</strong>
            </div>
            <div className="purchase-history__summary-item">
              <span>Total item</span>
              <strong>{summary.totalItems}</strong>
            </div>
            <div className="purchase-history__summary-item">
              <span>Total biaya</span>
              <strong>Rp {summary.totalCost.toLocaleString('id-ID')}</strong>
            </div>
          </div>
          <div className="purchase-history__search">
            <Search className="purchase-history__search-icon" />
            <Input
              placeholder="Cari produk atau petugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="purchase-history__search-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="purchase-history__card">
        <CardContent className="p-0">
          <div className="purchase-history__table">
            <Table className="purchase-history__table-inner">
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Total Biaya</TableHead>
                  <TableHead>Ditambahkan Oleh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="purchase-history__empty">
                      Tidak ada data pembelian
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <TableRow 
                      key={purchase.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedPurchase(purchase)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#6c757d]" />
                          {new Date(purchase.date).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>{purchase.product}</TableCell>
                      <TableCell>{purchase.quantity} unit</TableCell>
                      <TableCell>Rp {purchase.totalCost.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{purchase.addedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detail Pembelian
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang pembelian produk
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#6c757d] mb-1">Tanggal</p>
                  <p className="">{new Date(selectedPurchase.date).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6c757d] mb-1">Produk</p>
                  <p className="">{selectedPurchase.product}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6c757d] mb-1">Jumlah</p>
                  <p className="">{selectedPurchase.quantity} unit</p>
                </div>
                <div>
                  <p className="text-sm text-[#6c757d] mb-1">Total Biaya</p>
                  <p className="">Rp {selectedPurchase.totalCost.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6c757d] mb-1">Ditambahkan Oleh</p>
                  <p className="">{selectedPurchase.addedBy}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-[#6c757d] mb-2">Harga per Unit</p>
                <p className="">
                  Rp {(selectedPurchase.totalCost / selectedPurchase.quantity).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
