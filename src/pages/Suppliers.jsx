// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Plus } from "lucide-react";
// import { suppliers } from "@/data/dummyData";
// import { toast } from "sonner";

// export default function Suppliers() {
//   const [open, setOpen] = useState(false);

//   const handleAddSupplier = (e) => {
//     e.preventDefault();
//     toast.success("Supplier added successfully!");
//     setOpen(false);
//   };

//   return (
//     <div>
//       <h1 className="text-4xl font-bold mb-2">Suppliers</h1>
//       <p className="text-muted-foreground mb-6">
//         View and manage your supplier contacts
//       </p>
//       <Card>
//         <CardHeader>
//           <CardTitle>Supplier List</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>ID</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Contact</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead>Address</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {suppliers.map(supplier => (
//                 <TableRow key={supplier.id}>
//                   <TableCell>{supplier.id}</TableCell>
//                   <TableCell>{supplier.name}</TableCell>
//                   <TableCell>{supplier.contact}</TableCell>
//                   <TableCell>{supplier.email}</TableCell>
//                   <TableCell>{supplier.address}</TableCell>
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
//             Add Supplier
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add Supplier</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleAddSupplier}>
//             <Label htmlFor="name">Name</Label>
//             <Input id="name" required className="mb-2" />
//             <Label htmlFor="contact">Contact</Label>
//             <Input id="contact" required className="mb-2" />
//             <Label htmlFor="email">Email</Label>
//             <Input id="email" type="email" required className="mb-2" />
//             <Label htmlFor="address">Address</Label>
//             <Input id="address" required className="mb-4" />
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase, getCurrentUserId } from "@/supabaseClient"; // adjust path if needed

export default function Suppliers() {
  const [open, setOpen] = useState(false);

  // Form state fields for new supplier
  const [supplierName, setSupplierName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");

  // Suppliers list state, replace with real fetching as needed
  const [suppliers, setSuppliers] = useState([]); // or import dummyData initially

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert([{
          name: supplierName.trim(),
          contact_email: contactEmail?.trim() || null,
          contact_phone: contactPhone?.trim() || null,
          address: address?.trim() || null
        }])
        .select("id")
        .single();

      if (error) throw error;

      const userId = await getCurrentUserId();
      await supabase.from("audit_logs").insert([{
        user_id: userId,
        action: "create_supplier",
        entity_type: "suppliers",
        entity_id: data.id,
        changes: { name: supplierName }
      }]);

      // Optionally refresh supplier list here (fetchSuppliers)

      toast.success("Supplier added successfully!");
      setOpen(false);

      // Reset form inputs
      setSupplierName("");
      setContactPhone("");
      setContactEmail("");
      setAddress("");
    } catch (err) {
      console.error("Create supplier error:", err);
      toast.error("Failed to add supplier.");
    }
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
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No suppliers available
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map(supplier => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.id}</TableCell>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contact_phone}</TableCell>
                    <TableCell>{supplier.contact_email}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
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
            Add Supplier
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSupplier}>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={supplierName}
              onChange={e => setSupplierName(e.target.value)}
              required
              className="mb-2"
            />
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              required
              className="mb-2"
            />
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              required
              className="mb-2"
            />
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              className="mb-4"
            />
            <Button type="submit">Add</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
