import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePOS } from '../../contexts/POSContext';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

import { Badge } from "../ui/badge";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Bell,
  LogOut,
  User,
  ChevronDown,
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertTriangle,
  Search,
  Box,
  Settings
} from "lucide-react";

import { cn } from "../../lib/utils";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Input Barang", path: "/pembelian/input-barang", icon: Package },
  { label: "Riwayat Pembelian", path: "/pembelian/riwayat", icon: Clock },
  { label: "Transaksi Penjualan", path: "/penjualan/transaksi", icon: ShoppingCart },
  { label: "Riwayat Penjualan", path: "/penjualan/riwayat", icon: TrendingUp },
  { label: "Laporan Stok", path: "/laporan/stok", icon: Box },
  { label: "Laporan Laba Rugi", path: "/laporan/laba-rugi", icon: FileText },
];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="flex items-center justify-between bg-white p-4 shadow">
          <div className="flex items-center gap-3">
        
          {/* SIDEBAR TOGGLE */}
          <Sheet>
            <SheetTrigger>
              <Button variant="outline" size="icon">
                <LayoutDashboard className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0 w-72">
              <div className="p-6 border-b text-center">
                <p className="font-semibold">{user?.name}</p>
                <span className="text-sm text-gray-500 capitalize">{user?.role}</span>
              </div>

              <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-transparent text-gray-800 hover:bg-gray-200"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-gray-700")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
              <div className="p-4 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64 rounded-xl"
              />
            </div>
          </div>

          {/* USER MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-xl cursor-pointer">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarFallback>{user?.name[0]}</AvatarFallback>
                </Avatar>
                <span>{user?.name}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 mr-4">
              <DropdownMenuLabel>Menu Akun</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/pengaturan")}>
                <User className="w-4 h-4 mr-2" /> Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* CONTENT */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
