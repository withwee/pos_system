import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";      
import { Button } from "../ui/button";                     
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { ShoppingCart, TrendingUp, Package, DollarSign } from "lucide-react";
import { toast } from "sonner";          
import { usePOS } from '../../contexts/POSContext';
                 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Mohon isi semua field');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success('Login berhasil!');
        navigate('/dashboard'); // redirect
      } else {
        toast.error('Email atau password salah');
      }

    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#007BFF] to-[#00BCD4] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-white mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <span className="text-2xl">POS System</span>
          </div>

          <div className="text-white space-y-6 max-w-md">
            <h1 className="text-4xl">Kelola Toko Anda dengan Mudah</h1>
            <p className="text-lg text-white/90">
              Sistem Point of Sale modern untuk membantu bisnis Anda berkembang.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 max-w-md">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <TrendingUp className="w-8 h-8 text-white mb-3" />
            <div className="text-white/90">Laporan Real-time</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <Package className="w-8 h-8 text-white mb-3" />
            <div className="text-white/90">Manajemen Stok</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <ShoppingCart className="w-8 h-8 text-white mb-3" />
            <div className="text-white/90">Transaksi Cepat</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <DollarSign className="w-8 h-8 text-white mb-3" />
            <div className="text-white/90">Analisis Penjualan</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F8F9FA]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl mb-2">Selamat Datang</h2>
              <p className="text-[#6c757d]">Silakan login untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember">Ingat saya</Label>
                </div>
                <Link to="#" className="text-[#007BFF] hover:underline">
                  Lupa Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#007BFF] hover:bg-[#0056b3] rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-[#6c757d]">Belum punya akun? </span>
              <Link to="/register" className="text-[#007BFF] hover:underline">
                Daftar sekarang
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-[#6c757d]">
            <p>© 2025 POS System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
