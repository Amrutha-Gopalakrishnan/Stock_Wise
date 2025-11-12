import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase, getCurrentUserId } from "@/supabaseClient";
import { localDb } from "@/lib/localDb";

export default function Products() {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [reorderThreshold, setReorderThreshold] = useState("20");
  const [reorderQuantity, setReorderQuantity] = useState("50");
  const [initialStock, setInitialStock] = useState("0");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select(
        `
          id,
          name,
          sku,
          unit_price,
          categories (
            name
          ),
          suppliers (
            name
          ),
          stock_levels (
            current_quantity
          )
        `
      )
      .order("name");

    if (error) {
      console.error("Error loading products:", error);
      toast.warning("Using locally saved products (Supabase unavailable)");
    } else {
      const formatted = (data || []).map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        unit_price: product.unit_price,
        category_name: product?.categories?.name ?? "—",
        supplier_name: product?.suppliers?.name ?? "—",
        current_quantity: product?.stock_levels?.current_quantity ?? 0,
      }));
      localDb.saveProducts(formatted);
    }
    setProducts(localDb.getProducts());
    setLoadingProducts(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("id, name").order("name");
    if (error) {
      console.error("Error loading categories:", error);
      toast.warning("Using local categories (Supabase unavailable)");
    } else {
      localDb.saveCategories(data || []);
    }
    setCategories(localDb.getCategories());
  }, []);

  const fetchSuppliers = useCallback(async () => {
    const { data, error } = await supabase.from("suppliers").select("id, name").order("name");
    if (error) {
      console.error("Error loading suppliers:", error);
      toast.warning("Using local suppliers (Supabase unavailable)");
    } else {
      localDb.saveSuppliers(data || []);
    }
    setSuppliers(localDb.getSuppliers());
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, [fetchProducts, fetchCategories, fetchSuppliers]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    const trimmedCategoryName = categoryName.trim();
    if (!trimmedCategoryName) {
      toast.error("Please enter a category name");
      return;
    }

    const trimmedSupplierName = supplierName.trim();
    if (!trimmedSupplierName) {
      toast.error("Please enter a supplier name");
      return;
    }

    const issues = [];

    const ensureLocalCategory = (record) => {
      const saved = localDb.upsertCategory(record);
      setCategories((prev) => {
        const exists = prev.some((item) => item.id === saved.id);
        return exists ? prev : [...prev, saved];
      });
      return saved;
    };

    const ensureLocalSupplier = (record) => {
      const saved = localDb.upsertSupplier(record);
      setSuppliers((prev) => {
        const exists = prev.some((item) => item.id === saved.id);
        return exists ? prev : [...prev, saved];
      });
      return saved;
    };

    let categoryRecord =
      categories.find((c) => c.name.toLowerCase() === trimmedCategoryName.toLowerCase()) ?? null;
    if (categoryRecord) {
      ensureLocalCategory(categoryRecord);
    } else {
      let categoryInsertError = null;
      try {
        const { data: newCategory, error } = await supabase
          .from("categories")
          .insert([{ name: trimmedCategoryName }])
          .select("id, name")
          .single();
        if (error) {
          categoryInsertError = error;
          issues.push(error);
        } else if (newCategory) {
          categoryRecord = newCategory;
          ensureLocalCategory(newCategory);
        }
        if (!categoryRecord && categoryInsertError?.code === "23505") {
          const { data: conflictingCategory } = await supabase
            .from("categories")
            .select("id, name")
            .eq("name", trimmedCategoryName)
            .maybeSingle();
          if (conflictingCategory) {
            categoryRecord = conflictingCategory;
            ensureLocalCategory(conflictingCategory);
          }
        }
      } catch (err) {
        issues.push(err);
      }
      if (!categoryRecord) {
        categoryRecord = ensureLocalCategory({ name: trimmedCategoryName });
      }
    }

    if (!categoryRecord) {
      toast.error("Unable to resolve category");
      return;
    }

    let supplierRecord =
      suppliers.find((s) => s.name.toLowerCase() === trimmedSupplierName.toLowerCase()) ?? null;
    if (supplierRecord) {
      ensureLocalSupplier(supplierRecord);
    } else {
      let supplierInsertError = null;
      try {
        const { data: newSupplier, error } = await supabase
          .from("suppliers")
          .insert([{ name: trimmedSupplierName }])
          .select("id, name")
          .single();
        if (error) {
          supplierInsertError = error;
          issues.push(error);
        } else if (newSupplier) {
          supplierRecord = newSupplier;
          ensureLocalSupplier(newSupplier);
        }
        if (!supplierRecord && supplierInsertError?.code === "23505") {
          const { data: conflictingSupplier } = await supabase
            .from("suppliers")
            .select("id, name")
            .eq("name", trimmedSupplierName)
            .maybeSingle();
          if (conflictingSupplier) {
            supplierRecord = conflictingSupplier;
            ensureLocalSupplier(conflictingSupplier);
          }
        }
      } catch (err) {
        issues.push(err);
      }
      if (!supplierRecord) {
        supplierRecord = ensureLocalSupplier({ name: trimmedSupplierName });
      }
    }

    if (!supplierRecord) {
      toast.error("Unable to resolve supplier");
      return;
    }

    const parsedPrice = parseFloat(unitPrice || "0");
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Please enter a valid unit price");
      return;
    }

    const localQuantity = parseInt(initialStock || "0", 10);
    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      category_id: categoryRecord.id,
      supplier_id: supplierRecord.id,
      reorder_threshold: parseInt(reorderThreshold || "20", 10),
      reorder_quantity: parseInt(reorderQuantity || "50", 10),
      unit_price: parsedPrice,
    };

    let productId = null;
    try {
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .insert([payload])
        .select("id")
        .single();
      if (prodError) {
        issues.push(prodError);
      } else if (prodData?.id) {
        productId = prodData.id;
      }
    } catch (err) {
      issues.push(err);
    }

    if (productId) {
      try {
        const { error: stockErr } = await supabase
          .from("stock_levels")
          .insert([{ product_id: productId, current_quantity: localQuantity }]);
        if (stockErr) {
          issues.push(stockErr);
        }
      } catch (err) {
        issues.push(err);
      }
    }

    const storedProduct = localDb.upsertProduct({
      id: productId ?? undefined,
      name: payload.name,
      sku: payload.sku,
      unit_price: payload.unit_price,
      category_name: categoryRecord.name ?? "—",
      supplier_name: supplierRecord.name ?? "—",
      current_quantity: localQuantity,
      category_id: categoryRecord.id,
      supplier_id: supplierRecord.id,
      reorder_threshold: payload.reorder_threshold,
      reorder_quantity: payload.reorder_quantity,
    });
    localDb.setStockLevel(storedProduct.id, localQuantity);

    await fetchProducts();

    const userId = await getCurrentUserId();
    if (userId && productId) {
      try {
        await supabase.from("audit_logs").insert([{
          user_id: userId,
          action: "create_product",
          entity_type: "products",
          entity_id: productId,
          changes: { name: payload.name, sku: payload.sku, unit_price: payload.unit_price },
        }]);
      } catch (err) {
        issues.push(err);
      }
    }

    toast.success(
      issues.length === 0
        ? "Product saved successfully!"
        : "Product saved locally (Supabase unavailable)",
    );
    setOpen(false);

    setName("");
    setSku("");
    setCategoryName("");
    setSupplierName("");
    setUnitPrice("");
    setReorderThreshold("20");
    setReorderQuantity("50");
    setInitialStock("0");
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Products</h1>
      <p className="text-muted-foreground mb-6">
        View and manage your product inventory
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {loadingProducts ? "Loading products..." : "No products available"}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>₹{Number(product.unit_price ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{product.current_quantity}</TableCell>
                    <TableCell>
                      <Badge variant={product.current_quantity > 0 ? "primary" : "destructive"}>
                        {product.current_quantity > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-6" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>
              Fill in the product details below. All fields are required unless indicated otherwise.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProduct}>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required className="mb-2" />

            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={e => setSku(e.target.value)} required className="mb-2" />

            <Label htmlFor="categoryName">Category</Label>
            <Input
              id="categoryName"
              list="category-options"
              placeholder="e.g. Electronics"
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              className="mb-2"
            />
            <datalist id="category-options">
              {categories.map((category) => (
                <option key={category.id} value={category.name} />
              ))}
            </datalist>

            <Label htmlFor="supplierName">Supplier</Label>
            <Input
              id="supplierName"
              list="supplier-options"
              placeholder="e.g. Tech Supplies Inc"
              value={supplierName}
              onChange={e => setSupplierName(e.target.value)}
              className="mb-2"
            />
            <datalist id="supplier-options">
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.name} />
              ))}
            </datalist>

            <Label htmlFor="unitPrice">Price</Label>
            <Input id="unitPrice" type="number" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} required className="mb-2" />

            <Label htmlFor="reorderThreshold">Reorder Threshold</Label>
            <Input id="reorderThreshold" type="number" value={reorderThreshold} onChange={e => setReorderThreshold(e.target.value)} className="mb-2" />

            <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
            <Input id="reorderQuantity" type="number" value={reorderQuantity} onChange={e => setReorderQuantity(e.target.value)} className="mb-2" />

            <Label htmlFor="initialStock">Initial Stock</Label>
            <Input id="initialStock" type="number" value={initialStock} onChange={e => setInitialStock(e.target.value)} className="mb-4" />

            <Button type="submit">Add</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
