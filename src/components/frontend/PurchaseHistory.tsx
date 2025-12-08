import { useState } from "react";

import { usePOS } from '../../contexts/POSContext';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState<typeof purchases[0] | null>(null);

  const suppliers = Array.from(new Set(purchases.map(p => p.supplier)));

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = supplierFilter === 'all' || purchase.supplier === supplierFilter;
    return matchesSearch && matchesSupplier;
  });

  const handleExport = (format: string) => {
    toast.success(`Riwayat pembelian berhasil diekspor ke format ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Riwayat Pembelian</CardTitle>
              <CardDescription>Daftar semua pembelian produk yang telah dilakukan</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => handleExport('pdf')} className="bg-red-600 hover:bg-red-700 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => handleExport('excel')} className="bg-green-600 hover:bg-green-700 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
              <Input
                placeholder="Cari produk atau supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-full md:w-48 rounded-xl">
                <SelectValue placeholder="Semua Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Supplier</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Total Biaya</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Ditambahkan Oleh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[#6c757d]">
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
                      <TableCell>{purchase.supplier}</TableCell>
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
                  <p className="text-sm text-[#6c757d] mb-1">Supplier</p>
                  <p className="">{selectedPurchase.supplier}</p>
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
