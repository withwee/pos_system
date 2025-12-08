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
  Settings
} from "lucide-react";

import { cn } from "../../lib/utils";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Input Barang", icon: ShoppingBag, path: "/pembelian/input-barang" },
    { label: "Riwayat Pembelian", icon: Clock, path: "/pembelian/riwayat" },
    { label: "Transaksi Penjualan", icon: ShoppingCart, path: "/penjualan/transaksi" },
    { label: "Riwayat Penjualan", icon: TrendingUp, path: "/penjualan/riwayat" },
    { label: "Laporan Stok", icon: Package, path: "/laporan/stok" },
    { label: "Laporan Laba Rugi", icon: FileText, path: "/laporan/laba-rugi" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg border-r">
        <div className="p-6 flex flex-col items-center border-b">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold">
            POS
          </div>
          <p className="mt-2 font-semibold">{user?.name}</p>
          <span className="text-sm text-gray-500 capitalize">{user?.role}</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm",
                  active
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="destructive"
            className="w-full rounded-xl flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="flex items-center justify-between bg-white p-4 shadow">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="md:hidden">
                <div className="p-2 border rounded-lg">
                  <LayoutDashboard />
                </div>
              </SheetTrigger>

              <SheetContent side="left" className="p-0 w-72">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                <nav className="p-4 space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm",
                          active
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
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
