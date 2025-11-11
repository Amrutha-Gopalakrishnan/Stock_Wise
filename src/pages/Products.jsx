// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Plus } from "lucide-react";
// import { products } from "@/data/dummyData";
// import { toast } from "sonner";

// export default function Products() {
//   const [open, setOpen] = useState(false);

//   // Remove explicit typing on FormEvent, just use the event object
//   const handleAddProduct = (e) => {
//     e.preventDefault();
//     toast.success("Product added successfully!");
//     setOpen(false);
//   };

//   return (
//     <div>
//       <h1 className="text-4xl font-bold mb-2">Products</h1>
//       <p className="text-muted-foreground mb-6">
//         View and manage your product inventory
//       </p>
//       <Card>
//         <CardHeader>
//           <CardTitle>Product List</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>ID</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead>Price</TableHead>
//                 <TableHead>Stock</TableHead>
//                 <TableHead>Status</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {products.map((product) => (
//                 <TableRow key={product.id}>
//                   <TableCell>{product.id}</TableCell>
//                   <TableCell>{product.name}</TableCell>
//                   <TableCell>{product.category}</TableCell>
//                   <TableCell>₹{product.price}</TableCell>
//                   <TableCell>{product.stock}</TableCell>
//                   <TableCell>
//                     <Badge variant={product.stock > 0 ? "primary" : "destructive"}>
//                       {product.stock > 0 ? "In Stock" : "Out of Stock"}
//                     </Badge>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogTrigger asChild>
//           <Button className="mt-6" onClick={() => setOpen(true)}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Product
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add Product</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleAddProduct}>
//             <Label htmlFor="name">Name</Label>
//             <Input id="name" required className="mb-2" />
//             <Label htmlFor="category">Category</Label>
//             <Input id="category" required className="mb-2" />
//             <Label htmlFor="price">Price</Label>
//             <Input id="price" type="number" required className="mb-2" />
//             <Label htmlFor="stock">Stock</Label>
//             <Input id="stock" type="number" required className="mb-4" />
//             <Button type="submit">Add</Button>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase, getCurrentUserId } from "@/supabaseClient"; // adjust path if needed

export default function Products() {
  const [open, setOpen] = useState(false);

  // Form state fields for new product
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");  // Should be UUID from categories table
  const [supplierId, setSupplierId] = useState("");  // Should be UUID from suppliers table
  const [unitPrice, setUnitPrice] = useState("");
  const [reorderThreshold, setReorderThreshold] = useState("20");
  const [reorderQuantity, setReorderQuantity] = useState("50");
  const [initialStock, setInitialStock] = useState("0");

  // Sample static products data, ideally fetched from backend with useEffect
  const [products, setProducts] = useState([]); // Initially empty, you can replace with dummyData if desired

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    try {
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .insert([{
          name: name.trim(),
          sku: sku.trim(),
          category_id: categoryId,
          supplier_id: supplierId,
          reorder_threshold: parseInt(reorderThreshold || "20", 10),
          reorder_quantity: parseInt(reorderQuantity || "50", 10),
          unit_price: parseFloat(unitPrice || "0")
        }])
        .select("id")
        .single();

      if (prodError) throw prodError;

      const productId = prodData.id;

      const { error: stockErr } = await supabase
        .from("stock_levels")
        .insert([{ product_id: productId, current_quantity: parseInt(initialStock || "0", 10) }]);

      if (stockErr) {
        console.warn("Could not create stock_levels row:", stockErr);
      }

      const userId = await getCurrentUserId();
      await supabase.from("audit_logs").insert([{
        user_id: userId,
        action: "create_product",
        entity_type: "products",
        entity_id: productId,
        changes: { name, sku, unit_price }
      }]);

      // Optionally, refresh product list (if fetching from supabase)
      // fetchProducts();

      toast.success("Product added successfully!");
      setOpen(false);

      // Clear form inputs
      setName("");
      setSku("");
      setCategoryId("");
      setSupplierId("");
      setUnitPrice("");
      setReorderThreshold("20");
      setReorderQuantity("50");
      setInitialStock("0");
    } catch (err) {
      console.error("Create product error:", err);
      toast.error("Failed to add product.");
    }
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
                    No products available
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? "primary" : "destructive"}>
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
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
          </DialogHeader>
          <form onSubmit={handleCreateProduct}>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required className="mb-2" />

            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={e => setSku(e.target.value)} required className="mb-2" />

            <Label htmlFor="categoryId">Category ID (UUID)</Label>
            <Input id="categoryId" value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="mb-2" />

            <Label htmlFor="supplierId">Supplier ID (UUID)</Label>
            <Input id="supplierId" value={supplierId} onChange={e => setSupplierId(e.target.value)} required className="mb-2" />

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
