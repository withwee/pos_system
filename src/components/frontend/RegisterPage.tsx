import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePOS } from '../../contexts/POSContext';

// CONTEXT
import { useAuth } from "../../contexts/AuthContext";

// UI COMPONENTS
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// ICONS
import { ShoppingCart } from "lucide-react";

// TOAST
import { toast } from "sonner";


export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Mohon isi semua field');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    try {
      const success = await register(name, email, password, role);
      if (success) {
        toast.success('Registrasi berhasil! Silakan login');
        navigate('/login');
      } else {
        toast.error('Registrasi gagal');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#007BFF] to-[#00BCD4] p-12 flex-col justify-center items-center">
        <div className="text-center text-white space-y-6 max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto">
            <ShoppingCart className="w-12 h-12" />
          </div>
          <h1 className="text-4xl">
            Bergabung dengan POS System
          </h1>
          <p className="text-lg text-white/90">
            Daftarkan akun Anda dan mulai kelola bisnis dengan lebih efisien dan modern.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F8F9FA]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl mb-2">Buat Akun Baru</h2>
              <p className="text-[#6c757d]">Lengkapi formulir untuk mendaftar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

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
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Masukkan password lagi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as 'admin' | 'cashier')}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#007BFF] hover:bg-[#0056b3] rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Buat Akun'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-[#6c757d]">Sudah punya akun? </span>
              <Link to="/login" className="text-[#007BFF] hover:underline">
                Login di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
