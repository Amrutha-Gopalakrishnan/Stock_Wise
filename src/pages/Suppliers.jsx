

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase, getCurrentUserId } from "@/supabaseClient"; // adjust path if needed
import { localDb } from "@/lib/localDb";

export default function Suppliers() {
  const [open, setOpen] = useState(false);

  // Form state fields for new supplier
  const [supplierName, setSupplierName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");

  // Suppliers list state, replace with real fetching as needed
  const [suppliers, setSuppliers] = useState([]); // or import dummyData initially
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  const fetchSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    const { data, error } = await supabase
      .from("suppliers")
      .select("id, name, contact_phone, contact_email, address")
      .order("name");

    if (error) {
      console.error("Error loading suppliers:", error);
      toast.warning("Using locally saved suppliers (Supabase unavailable)");
    } else {
      localDb.saveSuppliers(data || []);
    }
    setSuppliers(localDb.getSuppliers());
    setLoadingSuppliers(false);
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    const trimmedName = supplierName.trim();
    if (!trimmedName) {
      toast.error("Supplier name is required");
      return;
    }

    const payload = {
      name: trimmedName,
      contact_email: contactEmail?.trim() || null,
      contact_phone: contactPhone?.trim() || null,
      address: address?.trim() || null,
    };

    const issues = [];
    let supplierId = null;

    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert([payload])
        .select("id")
        .single();
      if (error) {
        issues.push(error);
      } else if (data?.id) {
        supplierId = data.id;
      }
    } catch (err) {
      issues.push(err);
    }

    const storedSupplier = localDb.upsertSupplier({
      id: supplierId ?? undefined,
      ...payload,
    });

    setSuppliers((prev) => {
      const exists = prev.some((item) => item.id === storedSupplier.id);
      if (exists) {
        return prev.map((item) => (item.id === storedSupplier.id ? storedSupplier : item));
      }
      return [...prev, storedSupplier];
    });

    const userId = await getCurrentUserId();
    if (userId && supplierId) {
      try {
        await supabase.from("audit_logs").insert([{
          user_id: userId,
          action: "create_supplier",
          entity_type: "suppliers",
          entity_id: supplierId,
          changes: { name: payload.name },
        }]);
      } catch (err) {
        issues.push(err);
      }
    }

    await fetchSuppliers();

    toast.success(
      issues.length === 0
        ? "Supplier saved successfully!"
        : "Supplier saved locally (Supabase unavailable)",
    );

    setOpen(false);
    setSupplierName("");
    setContactPhone("");
    setContactEmail("");
    setAddress("");
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
                    {loadingSuppliers ? "Loading suppliers..." : "No suppliers available"}
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
            <DialogDescription>
              Provide key supplier contact information. Fields marked required must be filled in.
            </DialogDescription>
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
              className="mb-2"
            />
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="mb-2"
            />
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="mb-4"
            />
            <Button type="submit">Add</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
