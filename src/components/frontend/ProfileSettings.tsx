import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { usePOS } from '../../contexts/POSContext';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Switch } from "../ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";

import { Separator } from "../ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";

import {
  User,
  Mail,
  Shield,
  Clock,
  Camera,
  Lock,
  Save,
  Moon,
  Sun,
  Bell,
  Globe
} from "lucide-react";

import { toast } from "sonner";

export default function ProfileSettings() {
  const { user, logout } = useAuth();

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "cashier"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    language: "id"
  });

  // -----------------------------
  // 🔵 UPDATE PROFILE
  // -----------------------------
  const handleUpdateProfile = async () => {
    try {
      const res = await api.put("/auth/update-profile", {
        name: profileData.name,
        email: profileData.email
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Profil berhasil diperbarui!");
      setShowEditDialog(false);
      window.location.reload();
    } catch (err) {
      toast.error("Gagal memperbarui profil");
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return toast.error("Mohon isi semua field");
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Password baru tidak cocok");
    }

    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success("Password berhasil diubah!");
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error("Gagal mengubah password");
    }
  };

  // -----------------------------
  // 🔵 SAVE SETTINGS (LOCAL ONLY)
  // -----------------------------
  const handleSaveSettings = () => {
    toast.success("Pengaturan berhasil disimpan!");

    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const lastLogin = new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="space-y-6">

      {/* PROFILE CARD */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Profil Pengguna</CardTitle>
          <CardDescription>Informasi akun dan detail pengguna</CardDescription>
        </CardHeader>
        <CardContent>

          <div className="flex flex-col md:flex-row gap-6">

            {/* AVATAR */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarFallback className="bg-gradient-to-br from-[#007BFF] to-[#00BCD4] text-white text-4xl">
                    {user?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#007BFF] hover:bg-[#0056b3]"
                  onClick={() => toast.info("Fitur upload foto segera tersedia")}
                >
                  <Camera className="w-5 h-5" />
                </Button>
              </div>

              <div className="text-center">
                <h3 className="text-xl">{user?.name}</h3>
                <p className="text-sm text-gray-600">{user?.role}</p>
              </div>
            </div>

            {/* PROFILE INFO */}
            <div className="flex-1 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <p className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <User className="w-4 h-4" /> Nama Lengkap
                  </p>
                  <p>{user?.name}</p>
                </div>

                <div>
                  <p className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Mail className="w-4 h-4" /> Email
                  </p>
                  <p>{user?.email}</p>
                </div>

                <div>
                  <p className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Shield className="w-4 h-4" /> Role
                  </p>
                  <p>{user?.role}</p>
                </div>

                <div>
                  <p className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Clock className="w-4 h-4" /> Login Terakhir
                  </p>
                  <p>{lastLogin}</p>
                </div>

              </div>

              <Separator />

              <div className="flex gap-3">
                <Button className="bg-blue-600 rounded-xl" onClick={() => setShowEditDialog(true)}>
                  <User className="w-4 h-4 mr-2" /> Edit Profil
                </Button>

                <Button variant="outline" className="rounded-xl" onClick={() => setShowPasswordDialog(true)}>
                  <Lock className="w-4 h-4 mr-2" /> Ubah Password
                </Button>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* SETTINGS */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Pengaturan</CardTitle>
          <CardDescription>Sesuaikan preferensi aplikasi Anda</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* DARK MODE */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                {settings.darkMode ? <Moon className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6 text-white" />}
              </div>
              <div>
                <p className="mb-1">Mode Gelap</p>
                <p className="text-sm text-gray-600">Aktifkan tema gelap</p>
              </div>
            </div>

            <Switch
              checked={settings.darkMode}
              onCheckedChange={(v) => setSettings({ ...settings, darkMode: v })}
            />
          </div>

          {/* EMAIL NOTIFICATION */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="mb-1">Notifikasi Email</p>
                <p className="text-sm text-gray-600">Terima pemberitahuan penting</p>
              </div>
            </div>

            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(v) => setSettings({ ...settings, emailNotifications: v })}
            />
          </div>

          {/* LANGUAGE */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="mb-1">Bahasa</p>
                <p className="text-sm text-gray-600">Pilih bahasa aplikasi</p>
              </div>
            </div>

            <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <Button className="bg-blue-600 rounded-xl" onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" /> Simpan Pengaturan
          </Button>

        </CardContent>
      </Card>

      {/* DIALOG: EDIT PROFILE */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
            <DialogDescription>Perbarui informasi akun Anda</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nama</Label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Batal</Button>
            <Button className="bg-blue-600" onClick={handleUpdateProfile}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: CHANGE PASSWORD */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
            <DialogDescription>Masukkan password lama & baru Anda</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Password Saat Ini</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>

            <div>
              <Label>Password Baru</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>

            <div>
              <Label>Konfirmasi Password Baru</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Batal</Button>
            <Button className="bg-blue-600" onClick={handleChangePassword}>Ubah Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
