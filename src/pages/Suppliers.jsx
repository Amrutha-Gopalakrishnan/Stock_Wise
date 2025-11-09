import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { suppliers } from "@/data/dummyData";
import { toast } from "sonner";

export default function Suppliers() {
  const [open, setOpen] = useState(false);

  const handleAddSupplier = (e) => {
    e.preventDefault();
    toast.success("Supplier added successfully!");
    setOpen(false);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Suppliers</h1>
      <p className="text-muted-foreground mb-6">
        View and manage your supplier contacts
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Supplier List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map(supplier => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.id}</TableCell>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.address}</TableCell>
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
            Add Supplier
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSupplier}>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required className="mb-2" />
            <Label htmlFor="contact">Contact</Label>
            <Input id="contact" required className="mb-2" />
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required className="mb-2" />
            <Label htmlFor="address">Address</Label>
            <Input id="address" required className="mb-4" />
            <Button type="submit">Add</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
