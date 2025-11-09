import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { products, transactions } from "@/data/dummyData";
import { toast } from "sonner";

export default function StaffDashboard() {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantity || !reason) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Transaction logged successfully!");
    setSelectedProduct("");
    setQuantity("");
    setReason("");
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Staff Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Record sales, purchases, or damages
      </p>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Log Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Label htmlFor="product">Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct} id="product" required>
              <SelectTrigger>
                <SelectValue>{selectedProduct || "Select product"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.name}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="quantity" className="mt-4">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
              className="mb-2"
            />
            <Label htmlFor="reason" className="mt-4">Reason</Label>
            <Input
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              className="mb-4"
            />
            <Button type="submit">Log Transaction</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.product}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.reason === "sale" ? "primary" : "destructive"}>
                      {transaction.reason}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
