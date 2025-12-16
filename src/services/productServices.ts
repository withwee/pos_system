import api from "./api";

// GET all categories
export async function fetchCategories() {
  return api.get("/categories");
}

// CREATE product
export async function createProduct(data: any) {
  return api.post("/products", data);
}

// UPDATE product stock (restock)
export async function updateProductStock(id: number, data: any) {
  return api.put(`/products/${id}`, data);
}

// GET all products
export async function fetchProducts() {
  return api.get("/products");
}

export async function fetchProduct(id: number) {
  return api.get(`/products/${id}`);
}

export async function fetchUnits() {
  return api.get("/units");
}