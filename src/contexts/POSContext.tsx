import React, { createContext, useContext, useState } from "react";

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

  addProduct: (product: Omit<Product, "id" | "addedDate">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

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
  const [products, setProducts] = useState<Product[]>(mockProducts);
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

  /* -------------------------------------------------------------
     PRODUCT METHODS
  ------------------------------------------------------------- */
  const addProduct = (product: Omit<Product, "id" | "addedDate">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      addedDate: new Date().toISOString().split("T")[0],
    };

    setProducts([...products, newProduct]);

    setPurchases([
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        product: product.name,
        quantity: product.stock,
        totalCost: product.purchasePrice * product.stock,
        supplier: product.supplier,
        addedBy: product.addedBy,
      },
      ...purchases,
    ]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
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
