import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { products } from "@/data/dummyData";
import { toast } from "sonner";

export default function Products() {
  const [open, setOpen] = useState(false);

  // Remove explicit typing on FormEvent, just use the event object
  const handleAddProduct = (e) => {
    e.preventDefault();
    toast.success("Product added successfully!");
    setOpen(false);
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
              {products.map((product) => (
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
              ))}
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
          <form onSubmit={handleAddProduct}>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required className="mb-2" />
            <Label htmlFor="category">Category</Label>
            <Input id="category" required className="mb-2" />
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" required className="mb-2" />
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" required className="mb-4" />
            <Button type="submit">Add</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
