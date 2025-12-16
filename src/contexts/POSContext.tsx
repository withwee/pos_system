import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  expiryDate?: string;
  description: string;
  image?: string;
  addedBy: string;
  addedDate: string;
  sku?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  invoiceNo: string;
  date: string;
  customer: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  cashier: string;
}

export interface Purchase {
  id: string;
  date: string;
  product: string;
  quantity: number;
  totalCost: number;
  supplier: string;
  addedBy: string;
}

export interface Notification {
  id: string;
  type: "restock" | "expiry" | "info";
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  purchases: Purchase[];
  notifications: Notification[];

  addProduct: (product: NewProductInput) => Promise<Product | null>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;

  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  createTransaction: (
    transaction: Omit<Transaction, "id" | "invoiceNo" | "date">
  ) => string;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  storeName: string; // ✅ Added here
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export interface NewProductInput {
  name: string;
  description?: string | null;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock?: number;
  categoryId: number;
  unitId: number;
}

const mapApiProduct = (p: any): Product => ({
  id: String(p.id),
  name: p.name,
  category: p.category?.name || p.category || "Tanpa Kategori",
  supplier: p.supplier || "Unknown",
  purchasePrice: Number(p.cost ?? p.purchasePrice ?? 0),
  salePrice: Number(p.price ?? p.salePrice ?? 0),
  stock: Number(p.stock ?? 0),
  minStock: Number(p.minStock ?? 0),
  expiryDate: p.expiryDate || undefined,
  description: p.description || "",
  image: p.image,
  addedBy: p.addedBy || "Admin",
  addedDate: p.createdAt
    ? p.createdAt.split("T")[0]
    : new Date().toISOString().split("T")[0],
  sku: p.sku,
});

/* -------------------------------------------------------------
   MOCK DATA
------------------------------------------------------------- */
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Indomie Goreng",
    category: "Makanan",
    supplier: "PT Indofood",
    purchasePrice: 2500,
    salePrice: 3500,
    stock: 150,
    minStock: 50,
    expiryDate: "2025-12-31",
    description: "Mi instan rasa goreng",
    addedBy: "Admin",
    addedDate: "2025-01-15",
  },
  {
    id: "2",
    name: "Aqua 600ml",
    category: "Minuman",
    supplier: "PT Aqua Golden",
    purchasePrice: 2000,
    salePrice: 3000,
    stock: 200,
    minStock: 100,
    expiryDate: "2026-06-30",
    description: "Air mineral kemasan",
    addedBy: "Admin",
    addedDate: "2025-01-10",
  },
];

const mockTransactions: Transaction[] = [
  {
    id: "1",
    invoiceNo: "INV-2025-001",
    date: "2025-11-09T10:30:00",
    customer: "Walk-in Customer",
    items: [{ product: mockProducts[0], quantity: 5 }],
    subtotal: 15000,
    discount: 0,
    tax: 1500,
    total: 16500,
    paymentMethod: "Cash",
    status: "Completed",
    cashier: "Admin",
  },
];

const mockPurchases: Purchase[] = [
  {
    id: "1",
    date: "2025-11-08",
    product: "Indomie Goreng",
    quantity: 100,
    totalCost: 250000,
    supplier: "PT Indofood",
    addedBy: "Admin",
  },
];

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "restock",
      message: "Indomie Goreng mendekati stok minimum",
      timestamp: new Date().toISOString(),
      read: false,
    },
  ]);

  const refreshProducts = async () => {
    try {
      const res = await api.get("/products");
      const payload = res.data?.data ?? res.data ?? [];
      const mapped: Product[] = (payload as any[]).map(mapApiProduct);
      setProducts(mapped);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  /* -------------------------------------------------------------
     PRODUCT METHODS
  ------------------------------------------------------------- */
  const addProduct = async (product: NewProductInput): Promise<Product | null> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Silakan login ulang (token tidak ditemukan)");
      }

      const res = await api.post("/products", product, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data?.data ?? res.data;
      const newProduct = mapApiProduct(payload);

      setProducts((prev) => [...prev, newProduct]);
      setPurchases((prev) => [
        {
          id: Date.now().toString(),
          date: newProduct.addedDate,
          product: newProduct.name,
          quantity: newProduct.stock,
          totalCost: newProduct.purchasePrice * newProduct.stock,
          supplier: newProduct.supplier,
          addedBy: newProduct.addedBy,
        },
        ...prev,
      ]);

      return newProduct;
    } catch (err) {
      console.error("Failed to add product:", err);
      return null;
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    const payload: Record<string, any> = { ...updated };

    if (updated.salePrice !== undefined) {
      payload.price = updated.salePrice;
      delete payload.salePrice;
    }

    if (updated.purchasePrice !== undefined) {
      payload.cost = updated.purchasePrice;
      delete payload.purchasePrice;
    }

    try {
      await api.put(`/products/${id}`, payload);
    } catch (err) {
      console.error("Failed to update product:", err);
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
    } catch (err) {
      console.error("Failed to delete product:", err);
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  /* -------------------------------------------------------------
     CART METHODS
  ------------------------------------------------------------- */
  const addToCart = (product: Product, quantity: number) => {
    const existing = cart.find((c) => c.product.id === product.id);

    if (existing) {
      setCart(
        cart.map((c) =>
          c.product.id === product.id
            ? { ...c, quantity: c.quantity + quantity }
            : c
        )
      );
    } else {
      setCart([...cart, { product, quantity }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((c) => c.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    setCart(
      cart.map((c) =>
        c.product.id === productId ? { ...c, quantity: qty } : c
      )
    );
  };

  const clearCart = () => setCart([]);

  /* -------------------------------------------------------------
     TRANSACTIONS
  ------------------------------------------------------------- */
  const createTransaction = (
    data: Omit<Transaction, "id" | "invoiceNo" | "date">
  ): string => {
    const newTx: Transaction = {
      ...data,
      id: Date.now().toString(),
      invoiceNo: `INV-${Date.now()}`,
      date: new Date().toISOString(),
    };

    setTransactions([newTx, ...transactions]);

    data.items.forEach((item) => {
      updateProduct(item.product.id, {
        stock: item.product.stock - item.quantity,
      });
    });

    return newTx.invoiceNo;
  };

  /* -------------------------------------------------------------
     NOTIFICATIONS
  ------------------------------------------------------------- */
  const markNotificationAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllNotificationsAsRead = () =>
    setNotifications(notifications.map((n) => ({ ...n, read: true })));

  /* -------------------------------------------------------------
     PROVIDER RETURN
  ------------------------------------------------------------- */
  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        transactions,
        purchases,
        notifications,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createTransaction,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshProducts,

        storeName: "POS Mart", // ✅ FIXED
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error("usePOS must be inside POSProvider");
  return ctx;
}
